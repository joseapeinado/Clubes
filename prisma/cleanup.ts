import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database cleanup...')

  // Delete in order to respect foreign key constraints
  console.log('Deleting PaymentAudit...')
  await prisma.paymentAudit.deleteMany({})

  console.log('Deleting Payments...')
  await prisma.payment.deleteMany({})

  console.log('Deleting Enrollments...')
  await prisma.enrollment.deleteMany({})

  console.log('Deleting TeachingAssignments...')
  await prisma.teachingAssignment.deleteMany({})

  console.log('Deleting Categories...')
  await prisma.category.deleteMany({})

  console.log('Deleting Disciplines...')
  await prisma.discipline.deleteMany({})

  console.log('Deleting Users (except SUPER_ADMIN)...')
  await prisma.user.deleteMany({
    where: {
      role: {
        not: Role.SUPER_ADMIN
      }
    }
  })

  console.log('Deleting Clubs...')
  await prisma.club.deleteMany({})

  console.log('Cleanup completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during cleanup:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
