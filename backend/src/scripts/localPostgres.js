// Docker-free local Postgres for machines without Docker/Homebrew installed.
// Usage: npm run db:local
import EmbeddedPostgres from 'embedded-postgres'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', '..', '.pgdata')

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: 'eaachecker',
  password: 'eaachecker',
  port: 5432,
  persistent: true,
})

await pg.initialise()
await pg.start()

try {
  await pg.createDatabase('eaachecker')
} catch {
  // already exists — fine on subsequent runs
}

console.log('Local Postgres running on port 5432 (database "eaachecker"). Press Ctrl+C to stop.')

async function shutdown() {
  console.log('\nStopping local Postgres…')
  await pg.stop()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
