import { z } from 'zod';

// Schema
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
 

  // CORS
  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:3001'),
  CORS_ALLOW_CREDENTIALS: z.coerce.boolean().default(true),

  // Supabase
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  SUPABASE_JWT_SECRET: z.string().min(1, 'SUPABASE_JWT_SECRET is required'),

  // Database direct connection
  DATABASE_URL: z.string().optional(),
  DB_POOL_MIN: z.coerce.number().default(2),
  DB_POOL_MAX: z.coerce.number().default(10),

  // Auth mode
  AUTH_MODE: z
    .enum(['jwt', 'headers', 'both', 'none'])
    .default('jwt')
    .describe('jwt=require Bearer token | headers=dev x-user-* headers | both=either | none=open'),

  // Allow enabling Swagger UI in production (default: false)
  SWAGGER_ALLOW_IN_PROD: z.coerce.boolean().default(false),
});

export type Config = z.infer<typeof envSchema>;

// Parse & validate at startup
function loadConfig(): Config {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment configuration:');
    parsed.error.errors.forEach((e) => console.error(`   ${e.path.join('.')}: ${e.message}`));
    process.exit(1);
  }

  return parsed.data;
}

/**
 * Validated environment configuration.
 * Accessing this before `dotenv` is loaded will cause startup failure — by design.
 */
export const config: Config = loadConfig();
