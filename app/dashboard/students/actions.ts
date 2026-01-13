
'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { Role, UserStatus } from "@prisma/client"
import bcrypt from 'bcryptjs'
import { revalidatePath } from "next/cache"
import { z } from "zod"

const StudentSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  dni: z.string().min(1, "El DNI es requerido"),
  sex: z.string().optional(),
  phone: z.string().optional(),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
})

export type StudentState = {
  errors?: {
    name?: string[]
    email?: string[]
    dni?: string[]
    sex?: string[]
    phone?: string[]
  }
  message?: string
}

export async function createStudent(prevState: StudentState, formData: FormData) {
  const session = await auth()
  const user = session?.user

  if (!user?.clubId || (user.role !== Role.CLUB_ADMIN)) {
    return { message: "No autorizado" }
  }

  const validatedFields = StudentSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    dni: formData.get('dni'),
    sex: formData.get('sex'),
    phone: formData.get('phone'),
    status: formData.get('status')
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Faltan campos requeridos."
    }
  }

  const { name, email, dni, sex, phone, status } = validatedFields.data

  try {
    // Check for unique email or DNI within club (or globally if constraints are global)
    // Email and DNI are unique in schema globally
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return { message: "El email ya está registrado.", errors: { email: ["Email ya existe"] } }
    }

    const existingDni = await prisma.user.findUnique({ where: { dni } })
    if (existingDni) {
      return { message: "El DNI ya está registrado.", errors: { dni: ["DNI ya existe"] } }
    }

    const hashedPassword = await bcrypt.hash('123456', 10) // Default password for students?

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.STUDENT,
        clubId: user.clubId,
        dni,
        sex,
        phone,
        status,
      }
    })

    revalidatePath('/dashboard/students')
    return { message: null } // Success

  } catch (error) {
    console.error('Database Error:', error)
    return { message: 'Error al crear alumno.' }
  }
}

export async function updateStudent(id: string, prevState: StudentState, formData: FormData) {
  const session = await auth()
  const user = session?.user

  if (!user?.clubId || (user.role !== Role.CLUB_ADMIN)) {
    return { message: "No autorizado" }
  }

  const validatedFields = StudentSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    dni: formData.get('dni'),
    sex: formData.get('sex'),
    phone: formData.get('phone'),
    status: formData.get('status')
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Faltan campos requeridos."
    }
  }

  const { name, email, dni, sex, phone, status } = validatedFields.data

  try {
    // Check for conflicts excluding current user
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail && existingEmail.id !== id) {
      return { message: "El email ya está registrado por otro usuario.", errors: { email: ["Email ya existe"] } }
    }

    // Check DNI
    if (dni) { // Should be required but check anyway
      const existingDni = await prisma.user.findUnique({ where: { dni } })
      if (existingDni && existingDni.id !== id) {
        return { message: "El DNI ya está registrado por otro usuario.", errors: { dni: ["DNI ya existe"] } }
      }
    }

    await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        dni,
        sex,
        phone,
        status,
      }
    })

    revalidatePath('/dashboard/students')
    return { message: null }

  } catch (error) {
    return { message: 'Error al actualizar alumno.' }
  }
}
