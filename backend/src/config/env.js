import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be set to a long random string'),
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required'),
  STRIPE_SECRET_KEY: z.string().min(1).default('sk_test_dummy'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).default('whsec_dummy'),
  STRIPE_PRICE_ID: z.string().min(1).default('price_dummy'),
  SENDGRID_API_KEY: z.string().min(1).default('SG.dummy'),
  SENDGRID_FROM_EMAIL: z.string().email().default('noreply@eaachecker.com'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  ENABLE_CRON_DEV: z.coerce.boolean().default(false),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment configuration:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
export const isProduction = env.NODE_ENV === 'production'
