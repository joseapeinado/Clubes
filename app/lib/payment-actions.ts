'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { Role, PaymentStatus } from '@prisma/client'

const PaymentSchema = z.object({
  userId: z.string().uuid(),
  amount: z.coerce.number().min(0),
  period: z.string().date(), // YYYY-MM-DD
  dueDate: z.string().date(),
})

export type State = {
  message?: string | null
}

/**
 * Generate monthly fees based on active enrollments
 * Each enrollment creates a payment with the category's monthlyFee
 * Supports regeneration with audit trail for destructive operations
 */
export async function generateMonthlyFees(prevState: State, formData: FormData) {
  const session = await auth()
  const user = session?.user

  if (user?.role !== Role.CLUB_ADMIN || !user.clubId) {
    return { message: 'Unauthorized' }
  }

  const period = formData.get('period') as string
  const dueDate = formData.get('dueDate') as string
  const forceRegenerate = formData.get('forceRegenerate') === 'true'
  const disciplineId = formData.get('disciplineId') as string

  if (!period || !dueDate) {
    return { message: 'Period and Due Date are required' }
  }

  const periodDate = new Date(period)
  const dueDateObj = new Date(dueDate)

  // Build where clause for discipline filter
  const existingPaymentsWhere: any = {
    clubId: user.clubId,
    period: periodDate
  }

  if (disciplineId && disciplineId !== 'ALL') {
    existingPaymentsWhere.category = { disciplineId }
  }

  // Check for existing payments in this period
  const existingPayments = await prisma.payment.findMany({
    where: existingPaymentsWhere,
    include: { user: true, category: true }
  })

  if (existingPayments.length > 0 && !forceRegenerate) {
    return {
      message: `CONFIRM_REGENERATE:${existingPayments.length} cuotas ya existen para este periodo. ¿Desea regenerarlas? Esto sobrescribirá los datos existentes.`
    }
  }

  // Check if any existing payments are already paid - prevent regeneration
  if (forceRegenerate && existingPayments.length > 0) {
    const paidPayments = existingPayments.filter(p => p.status === PaymentStatus.PAID)

    if (paidPayments.length > 0) {
      return {
        message: `No se puede regenerar: ${paidPayments.length} cuota(s) ya están pagadas. Eliminar cuotas pagadas podría causar inconsistencias contables.`
      }
    }
  }

  // If regenerating, create audit trail FIRST
  if (forceRegenerate && existingPayments.length > 0) {
    // Ensure we have user identification for audit
    if (!user.id && !user.email) {
      return { message: 'Cannot regenerate: user identification missing' }
    }

    const auditRecords = existingPayments.map(p => ({
      paymentId: p.id,
      userId: p.userId,
      clubId: p.clubId,
      categoryId: p.categoryId,
      amount: p.amount,
      status: p.status,
      period: p.period,
      dueDate: p.dueDate,
      paidAt: p.paidAt,
      receiptUrl: p.receiptUrl,
      regeneratedBy: user.id || user.email || 'unknown',
      reason: 'Admin regeneration via UI'
    }))

    await prisma.paymentAudit.createMany({
      data: auditRecords
    })

    // Delete existing payments
    await prisma.payment.deleteMany({
      where: existingPaymentsWhere
    })
  }

  // Build where clause for enrollments
  const enrollmentWhere: any = {
    user: {
      clubId: user.clubId,
      status: 'ACTIVE',
      role: Role.STUDENT
    }
  }

  if (disciplineId && disciplineId !== 'ALL') {
    enrollmentWhere.category = { disciplineId }
  }

  // Fetch all active enrollments for this club
  const enrollments = await prisma.enrollment.findMany({
    where: enrollmentWhere,
    include: {
      user: true,
      category: {
        include: {
          discipline: true
        }
      }
    }
  })

  if (enrollments.length === 0) {
    return { message: 'No hay inscripciones activas para generar cuotas' }
  }

  // Create payments based on enrollments
  const paymentsToCreate = enrollments.map(enrollment => ({
    userId: enrollment.userId,
    clubId: user.clubId!,
    categoryId: enrollment.categoryId,
    amount: enrollment.category.monthlyFee || 5000, // Fallback to default
    period: periodDate,
    dueDate: dueDateObj,
    status: PaymentStatus.PENDING,
  }))

  await prisma.payment.createMany({
    data: paymentsToCreate
  })

  revalidatePath('/dashboard/payments')
  return {
    message: `Generated ${paymentsToCreate.length} fees`
  }
}

export async function registerPayment(prevState: State, formData: FormData) {
  const session = await auth()
  const user = session?.user

  // Allow Admin or Professor to register payment (upload receipt)
  if (!user?.clubId || (user.role !== Role.CLUB_ADMIN && user.role !== Role.PROFESSOR)) {
    return { message: 'Unauthorized' }
  }

  const paymentId = formData.get('paymentId') as string
  const receiptUrl = formData.get('receiptUrl') as string

  try {
    const data: any = {
      updatedAt: new Date()
    }

    if (receiptUrl) {
      data.receiptUrl = receiptUrl
      data.status = PaymentStatus.PAID
      data.paidAt = new Date()
    }

    await prisma.payment.update({
      where: { id: paymentId },
      data: data
    })
  } catch (e) {
    return { message: 'Failed to Register Payment' }
  }

  revalidatePath('/dashboard/payments')
  return { message: 'Payment Registered' }
}

export async function fetchStudentPayments(studentId: string) {
  const session = await auth()
  if (!session?.user?.clubId) return []

  return await prisma.payment.findMany({
    where: { userId: studentId, clubId: session.user.clubId },
    include: { category: { include: { discipline: true } } },
    orderBy: { period: 'desc' }
  })
}
