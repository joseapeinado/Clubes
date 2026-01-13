import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10)

  // Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@clubes.com' },
    update: {},
    create: {
      email: 'admin@clubes.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
    },
  })

  console.log({ superAdmin })

  // Create Example Club
  const club = await prisma.club.upsert({
    where: { slug: 'club-demo' },
    update: {},
    create: {
      name: 'Club Demo',
      slug: 'club-demo',
      primaryColor: '#0000FF',
    },
  })

  // Create Club Admin
  const clubAdmin = await prisma.user.upsert({
    where: { email: 'club@demo.com' },
    update: {},
    create: {
      email: 'club@demo.com',
      name: 'Club Admin',
      password: hashedPassword,
      role: Role.CLUB_ADMIN,
      clubId: club.id,
    },
  })

  console.log({ club, clubAdmin })

  // Create Disciplines with Categories
  const futbol = await prisma.discipline.upsert({
    where: { id: '48ac16ba-6f53-4340-8a4c-d1c1c78931ba' },
    update: {},
    create: {
      id: '48ac16ba-6f53-4340-8a4c-d1c1c78931ba',
      name: 'Fútbol',
      description: 'Fútbol 11',
      clubId: club.id,
    },
  })

  const natacion = await prisma.discipline.upsert({
    where: { id: '3be6f99b-9995-4d04-816d-39cc644f05f1' },
    update: {},
    create: {
      id: '3be6f99b-9995-4d04-816d-39cc644f05f1',
      name: 'Natación',
      description: 'Natación competitiva',
      clubId: club.id,
    },
  })

  // Create Categories with different monthly fees
  const futbolSub20 = await prisma.category.upsert({
    where: { id: '6c6487af-0513-429b-9dc3-bdbe3279a507' },
    update: { monthlyFee: 8000 },
    create: {
      id: '6c6487af-0513-429b-9dc3-bdbe3279a507',
      name: 'Sub-20',
      description: 'Categoría juvenil',
      monthlyFee: 8000,
      disciplineId: futbol.id,
    },
  })

  const futbolAdultos = await prisma.category.upsert({
    where: { id: '6dca9ee2-bf91-4a09-86a5-5106f1f81fc5' },
    update: { monthlyFee: 10000 },
    create: {
      id: '6dca9ee2-bf91-4a09-86a5-5106f1f81fc5',
      name: 'Adultos',
      description: 'Primera división',
      monthlyFee: 10000,
      disciplineId: futbol.id,
    },
  })

  const natacionAdultos = await prisma.category.upsert({
    where: { id: '8c9e5b61-a957-4240-867c-0c45f36fd981' },
    update: { monthlyFee: 6000 },
    create: {
      id: '8c9e5b61-a957-4240-867c-0c45f36fd981',
      name: 'Adultos',
      description: 'Natación para adultos',
      monthlyFee: 6000,
      disciplineId: natacion.id,
    },
  })

  const natacionInfantil = await prisma.category.upsert({
    where: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    update: { monthlyFee: 5500 },
    create: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Infantil',
      description: 'Natación para niños',
      monthlyFee: 5500,
      disciplineId: natacion.id,
    },
  })

  console.log('Disciplines and Categories created')

  // Create 15 students per category (60 total)
  const studentNames = [
    'Juan Pérez', 'María González', 'Pedro Rodríguez', 'Ana Martínez', 'Luis López',
    'Carmen Sánchez', 'José Fernández', 'Laura García', 'Miguel Díaz', 'Isabel Ruiz',
    'Carlos Moreno', 'Elena Jiménez', 'Francisco Álvarez', 'Rosa Romero', 'Antonio Navarro',
  ]

  const categories = [futbolSub20, futbolAdultos, natacionAdultos, natacionInfantil]
  let studentCount = 0

  for (const category of categories) {
    for (let i = 0; i < 15; i++) {
      const name = `${studentNames[i]} (${category.name})`
      const email = `student${studentCount}@demo.com`
      const dni = `${30000000 + studentCount}`

      const student = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          name,
          dni,
          sex: i % 2 === 0 ? 'M' : 'F',
          phone: `+54911${1000000 + studentCount}`,
          password: hashedPassword,
          role: Role.STUDENT,
          status: 'ACTIVE',
          clubId: club.id,
        },
      })

      // Enroll student in category
      await prisma.enrollment.upsert({
        where: {
          userId_categoryId: {
            userId: student.id,
            categoryId: category.id,
          },
        },
        update: {},
        create: {
          userId: student.id,
          categoryId: category.id,
        },
      })

      studentCount++
    }
  }

  console.log(`Created ${studentCount} students with enrollments`)

  // Create a professor
  const professor = await prisma.user.upsert({
    where: { email: 'professor@demo.com' },
    update: {},
    create: {
      email: 'professor@demo.com',
      name: 'Profesor Demo',
      password: hashedPassword,
      role: Role.PROFESSOR,
      clubId: club.id,
    },
  })

  // Assign professor to some categories
  await prisma.teachingAssignment.upsert({
    where: {
      userId_categoryId: {
        userId: professor.id,
        categoryId: futbolSub20.id,
      },
    },
    update: {},
    create: {
      userId: professor.id,
      categoryId: futbolSub20.id,
    },
  })

  console.log('Seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })
