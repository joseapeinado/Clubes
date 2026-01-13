'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { Role } from '@prisma/client'

const ClubSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug must be lowercase and dashes only"),
  primaryColor: z.string().optional(),
})

export type State = {
  errors?: {
    name?: string[]
    slug?: string[]
    primaryColor?: string[]
  }
  message?: string | null
}

export async function createClub(prevState: State, formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== Role.SUPER_ADMIN) {
    return { message: 'Unauthorized' }
  }

  const validatedFields = ClubSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    primaryColor: formData.get('primaryColor'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Club.',
    }
  }

  const { name, slug, primaryColor } = validatedFields.data

  try {
    await prisma.club.create({
      data: {
        name,
        slug,
        primaryColor: primaryColor || '#000000',
      },
    })
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Club. Slug might be taken.',
    }
  }

  revalidatePath('/dashboard/clubs')
  return { message: 'Club Created' }
}
