'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { Role, UserStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const ProfessorSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional().or(z.literal('')),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.PENDING]),
})

export type ProfessorState = {
  errors?: {
    name?: string[]
    email?: string[]
    password?: string[]
    status?: string[]
  }
  message?: string | null
}

export async function createProfessor(prevState: ProfessorState, formData: FormData) {
  const session = await auth()
  const user = session?.user

  if (user?.role !== Role.CLUB_ADMIN || !user.clubId) {
    return { message: 'No autorizado' }
  }

  const validatedFields = ProfessorSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    status: formData.get('status'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error de validación',
    }
  }

  const { name, email, password, status } = validatedFields.data

  if (!password || password.length < 6) {
    return {
      errors: { password: ['La contraseña es requerida para nuevos profesores'] },
      message: 'Error de validación'
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.PROFESSOR,
        clubId: user.clubId,
        status,
      },
    })
  } catch (e) {
    return { message: 'Error de base de datos: El email ya podría estar en uso.' }
  }

  revalidatePath('/dashboard/professors')
  return { message: 'Professor Created' }
}

export async function updateProfessor(id: string, prevState: ProfessorState, formData: FormData) {
  const session = await auth()
  const user = session?.user

  if (user?.role !== Role.CLUB_ADMIN || !user.clubId) {
    return { message: 'No autorizado' }
  }

  const validatedFields = ProfessorSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    status: formData.get('status'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error de validación',
    }
  }

  const { name, email, password, status } = validatedFields.data

  const updateData: any = {
    name,
    email,
    status,
  }

  if (password && password.length >= 6) {
    updateData.password = await bcrypt.hash(password, 10)
  }

  try {
    await prisma.user.update({
      where: { id, clubId: user.clubId },
      data: updateData,
    })
  } catch (e) {
    return { message: 'Error de base de datos: No se pudo actualizar el profesor.' }
  }

  revalidatePath('/dashboard/professors')
  return { message: 'Professor Updated' }
}
