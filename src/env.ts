import { z } from 'zod'

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_PRIVATE_KEY_BASE64: z.string(),
  JWT_PUBLIC_KEY_BASE64: z.string(),
  PORT: z.coerce.number().default(3333),
})

export type Env = z.infer<typeof envSchema>
