import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL env var is not set')
const ssl = connectionString.includes('supabase.co') ? { rejectUnauthorized: false } : false

const adapter = new PrismaPg({ connectionString, ssl: ssl || undefined })
export const prisma = new PrismaClient({ adapter })
