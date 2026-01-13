'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const DisciplineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

const CategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  disciplineId: z.string().uuid(),
  monthlyFee: z.coerce.number().min(0).optional(),
})

export type State = {
  errors?: {
    name?: string[]
    description?: string[]
    disciplineId?: string[]
    monthlyFee?: string[]
  }
  message?: string | null
}

export async function createDiscipline(prevState: State, formData: FormData) {
  const session = await auth()
  const user = session?.user

  if (user?.role !== Role.CLUB_ADMIN || !user.clubId) {
    return { message: 'Unauthorized' }
  }

  const validatedFields = DisciplineSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation Error',
    }
  }

  try {
    await prisma.discipline.create({
      data: {
        name: validatedFields.data.name,
        description: validatedFields.data.description,
        clubId: user.clubId,
      },
    })
  } catch (e) {
    return { message: 'Database Error: Failed to Create Discipline' }
  }

  revalidatePath('/dashboard/disciplines')
  return { message: 'Discipline Created' }
}

export async function createCategory(prevState: State, formData: FormData) {
  const session = await auth()
  const user = session?.user

  if (user?.role !== Role.CLUB_ADMIN || !user.clubId) {
    return { message: 'Unauthorized' }
  }

  const validatedFields = CategorySchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    disciplineId: formData.get('disciplineId'),
    monthlyFee: formData.get('monthlyFee'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation Error',
    }
  }

  // Verify discipline belongs to club
  const discipline = await prisma.discipline.findUnique({
    where: { id: validatedFields.data.disciplineId }
  })

  if (!discipline || discipline.clubId !== user.clubId) {
    return { message: 'Invalid Discipline' }
  }

  try {
    await prisma.category.create({
      data: {
        name: validatedFields.data.name,
        description: validatedFields.data.description,
        disciplineId: validatedFields.data.disciplineId,
        monthlyFee: validatedFields.data.monthlyFee || 5000,
      },
    })
  } catch (e) {
    return { message: 'Database Error: Failed to Create Category' }
  }

  revalidatePath(`/dashboard/disciplines/${validatedFields.data.disciplineId}`)
  revalidatePath('/dashboard/disciplines')
  return { message: 'Category Created' }
}

export async function updateCategory(prevState: State, formData: FormData) {
  const session = await auth()
  const user = session?.user

  if (user?.role !== Role.CLUB_ADMIN || !user.clubId) {
    return { message: 'Unauthorized' }
  }

  const categoryId = formData.get('categoryId') as string

  const validatedFields = CategorySchema.omit({ disciplineId: true }).safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    monthlyFee: formData.get('monthlyFee'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation Error',
    }
  }

  // Verify category belongs to user's club
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { discipline: true }
  })

  if (!category || category.discipline.clubId !== user.clubId) {
    return { message: 'Invalid Category' }
  }

  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: validatedFields.data.name,
        description: validatedFields.data.description,
        monthlyFee: validatedFields.data.monthlyFee || 5000,
      },
    })
  } catch (e) {
    return { message: 'Database Error: Failed to Update Category' }
  }

  revalidatePath(`/dashboard/disciplines/${category.disciplineId}`)
  revalidatePath('/dashboard/disciplines')
  revalidatePath('/dashboard/categories')
  return { message: 'Category Updated' }
}
