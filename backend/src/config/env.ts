import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  API_PREFIX: z.string().default('/api/v1'),

  MONGODB_URI: z.string().url().min(1),
  MONGODB_DB: z.string().min(1),
  MONGODB_TLS_CERT_FILE: z.string().optional(),
  MONGODB_TLS_CA_FILE: z.string().optional(),
  MONGODB_URI_DEV: z.string().optional(),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  FRONTEND_URL: z.string().url().default('http://localhost:8081'),

  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.coerce.number().default(5242880),
});

export const env = envSchema.parse(process.env);

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';