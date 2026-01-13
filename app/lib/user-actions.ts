'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { Role, UserStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const UserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  // initial password? or generated? or input?
  // For simplicity, input.
  password: z.string().min(6),
  role: z.enum([Role.PROFESSOR, Role.STUDENT]),
})

export type State = {
  errors?: {
    name?: string[]
    email?: string[]
    password?: string[]
    role?: string[]
  }
  message?: string | null
}

export async function createUser(prevState: State, formData: FormData) {
  const session = await auth()
  const user = session?.user

  // Club Admin can create Professors and Students for THEIR club
  if (user?.role !== Role.CLUB_ADMIN || !user.clubId) {
    return { message: 'Unauthorized' }
  }

  const role = formData.get('role') as Role
  // Validate role is allowed
  if (role !== Role.PROFESSOR && role !== Role.STUDENT) {
    return { message: 'Invalid Role' }
  }

  const validatedFields = UserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: role,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation Error',
    }
  }

  const { name, email, password } = validatedFields.data
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role,
        clubId: user.clubId,
        status: UserStatus.ACTIVE,
      },
    })
  } catch (e) {
    // Check for unique email error
    return { message: 'Database Error: Failed to Create User. Email might be taken.' }
  }

  if (role === Role.PROFESSOR) {
    revalidatePath('/dashboard/professors')
  } else {
    revalidatePath('/dashboard/students')
  }

  return { message: 'User Created' }
}
