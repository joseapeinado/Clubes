'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { Role, UserStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const UserSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres").optional().or(z.literal('')),
  role: z.nativeEnum(Role),
  clubId: z.string().optional().nullable(),
  status: z.nativeEnum(UserStatus),
})

export type UserAdminState = {
  errors?: {
    name?: string[]
    email?: string[]
    password?: string[]
    role?: string[]
    clubId?: string[]
    status?: string[]
  }
  message?: string | null
}

export async function adminCreateUser(prevState: UserAdminState, formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== Role.SUPER_ADMIN) {
    return { message: 'No autorizado' }
  }

  const validatedFields = UserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
    clubId: formData.get('clubId') || null,
    status: formData.get('status'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error de validación',
    }
  }

  const { name, email, password, role, clubId, status } = validatedFields.data

  if (!password || password.length < 6) {
    return { message: 'La contraseña es obligatoria para nuevos usuarios' }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        clubId,
        status,
      },
    })
  } catch (e) {
    return { message: 'Error: El email ya está en uso.' }
  }

  revalidatePath('/dashboard/users')
  return { message: 'User Created' }
}

export async function adminUpdateUser(id: string, prevState: UserAdminState, formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== Role.SUPER_ADMIN) {
    return { message: 'No autorizado' }
  }

  const validatedFields = UserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
    clubId: formData.get('clubId') || null,
    status: formData.get('status'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error de validación',
    }
  }

  const { name, email, password, role, clubId, status } = validatedFields.data

  const updateData: any = {
    name,
    email,
    role,
    clubId,
    status,
  }

  if (password && password.length >= 6) {
    updateData.password = await bcrypt.hash(password, 10)
  }

  try {
    await prisma.user.update({
      where: { id },
      data: updateData,
    })
  } catch (e) {
    return { message: 'Error al actualizar usuario.' }
  }

  revalidatePath('/dashboard/users')
  return { message: 'User Updated' }
}
