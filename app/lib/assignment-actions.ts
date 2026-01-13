
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { Role } from '@prisma/client'

const AssignmentSchema = z.object({
  userId: z.string().uuid(),
  categoryId: z.string().uuid(),
})

export type State = {
  message?: string | null
}

export async function enrollStudent(prevState: State, formData: FormData) {
  const session = await auth()
  const user = session?.user

  if (user?.role !== Role.CLUB_ADMIN || !user.clubId) {
    return { message: 'Unauthorized' }
  }

  const userId = formData.get('userId') as string
  const categoryId = formData.get('categoryId') as string
  const disciplineId = formData.get('disciplineId') as string // for revalidation path if known

  try {
    await prisma.enrollment.create({
      data: {
        userId,
        categoryId,
      },
    })
  } catch (e) {
    return { message: 'Failed to Enroll. Student might already be enrolled.' }
  }

  // Revalidate both the category page and the student list page
  if (disciplineId) {
    revalidatePath(`/dashboard/disciplines/${disciplineId}/categories/${categoryId}`)
  }
  revalidatePath('/dashboard/students')
  return { message: 'Student Enrolled' }
}

export async function assignProfessor(prevState: State, formData: FormData) {
  const session = await auth()
  const user = session?.user

  if (user?.role !== Role.CLUB_ADMIN || !user.clubId) {
    return { message: 'Unauthorized' }
  }

  const userId = formData.get('userId') as string
  const categoryId = formData.get('categoryId') as string
  const disciplineId = formData.get('disciplineId') as string

  try {
    await prisma.teachingAssignment.create({
      data: {
        userId,
        categoryId,
      },
    })
  } catch (e) {
    return { message: 'Failed to Assign. Professor might already be assigned.' }
  }

  revalidatePath(`/dashboard/disciplines/${disciplineId}/categories/${categoryId}`)
  return { message: 'Professor Assigned' }
}

export async function removeEnrollment(enrollmentId: string, path?: string) {
  const session = await auth()
  if (session?.user?.role !== Role.CLUB_ADMIN) return

  await prisma.enrollment.delete({ where: { id: enrollmentId } })
  if (path) revalidatePath(path)
  revalidatePath('/dashboard/students')
}

export async function removeAssignment(assignmentId: string, path: string) {
  const session = await auth()
  if (session?.user?.role !== Role.CLUB_ADMIN) return

  await prisma.teachingAssignment.delete({ where: { id: assignmentId } })
  revalidatePath(path)
}

// Data Fetching for Contextual Dialog
export async function fetchStudentEnrollments(studentId: string) {
  const session = await auth()
  if (!session?.user?.clubId) return []

  return await prisma.enrollment.findMany({
    where: { userId: studentId },
    include: {
      category: {
        include: { discipline: true }
      }
    }
  })
}

export async function fetchAvailableClasses() {
  const session = await auth()
  if (!session?.user?.clubId) return []

  // Fetch disciplines with categories for the club
  return await prisma.discipline.findMany({
    where: { clubId: session.user.clubId },
    include: { categories: true }
  })
}
