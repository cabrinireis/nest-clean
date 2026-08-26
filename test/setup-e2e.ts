import { config } from 'dotenv'
import { randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

config({ path: '.env.test', override: true })

process.env.JWT_PRIVATE_KEY = readFileSync(
  resolve('keys/private.pem'),
).toString('base64')
process.env.JWT_PUBLIC_KEY = readFileSync(resolve('keys/public.pem')).toString(
  'base64',
)

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('E2E tests require DATABASE_URL in .env.test')
}

const url = new URL(databaseUrl)
const databaseName = url.pathname.slice(1)

if (!databaseName.endsWith('_test')) {
  throw new Error(
    'E2E tests require DATABASE_URL to point to a database ending in _test',
  )
}

const schemaId = `test_${randomUUID().replaceAll('-', '')}`
url.searchParams.set('schema', schemaId)
process.env.DATABASE_URL = url.toString()

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

beforeAll(() => {
  execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
    stdio: 'inherit',
  })
})

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
})
