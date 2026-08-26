import { execFileSync } from 'node:child_process'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to prepare the E2E database')
}

const databaseName = new URL(databaseUrl).pathname.slice(1)
if (!databaseName.endsWith('_test')) {
  throw new Error(
    `Refusing to prepare non-test database: ${databaseName || '<unknown>'}`,
  )
}

const escapedDatabaseName = databaseName.replaceAll("'", "''")
const query = `SELECT 1 FROM pg_database WHERE datname = '${escapedDatabaseName}'`
const result = execFileSync(
  'docker',
  ['exec', 'nest-clean-pg', 'psql', '-U', 'postgres', '-tAc', query],
  { encoding: 'utf8' },
).trim()

if (result === '1') {
  process.stdout.write(`Test database already exists: ${databaseName}\n`)
  process.exit(0)
}

execFileSync(
  'docker',
  [
    'exec',
    'nest-clean-pg',
    'psql',
    '-U',
    'postgres',
    '-c',
    `CREATE DATABASE "${databaseName.replaceAll('"', '""')}"`,
  ],
  { stdio: 'inherit' },
)
