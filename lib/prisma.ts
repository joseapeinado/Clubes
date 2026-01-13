import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    // During build, DATABASE_URL might be missing. 
    // Return a client that won't fail the build but will fail at runtime if no URL is provided.
    return new PrismaClient()
  }

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('supabase') ? { rejectUnauthorized: false } : undefined
  })

  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter } as any)
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
