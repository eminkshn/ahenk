import path from 'path'
import { defineConfig } from 'prisma/config'
import 'dotenv/config'

export default defineConfig({
  schema: path.join(__dirname, 'prisma/schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrate: {
    async adapter() {
      const { PrismaPg } = await import('@prisma/adapter-pg')
      const connectionString = process.env.DATABASE_URL!
      const ssl = connectionString.includes('supabase.co') ? { rejectUnauthorized: false } : undefined
      return new PrismaPg({ connectionString, ssl })
    },
  },
})
