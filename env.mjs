/**
 * Build-time environment validation.
 * Imported from next.config.ts so `next build` fails closed when secrets are
 * missing or weak. Runtime app code uses the typed copy in `src/env.ts`.
 */
import { z } from "zod";

const WEAK_SECRETS = new Set([
  "changeme",
  "secret",
  "password",
  "jwt_secret",
  "your-secret-key",
  "your_jwt_secret_here",
  "dev-secret",
  "test",
  "12345678901234567890123456789012",
]);

const hex256 = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{64}$/, "ENCRYPTION_KEY must be 64 hex characters (256-bit)");

const jwtSecret = z
  .string()
  .trim()
  .min(32, "JWT_SECRET must be at least 32 characters")
  .refine((value) => !WEAK_SECRETS.has(value.toLowerCase()), {
    message: "JWT_SECRET is too weak",
  });

export const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).optional(),
    MONGODB_URI: z.string().trim().min(1).optional(),
    MONGODB_URL: z.string().trim().min(1).optional(),
    DATABASE_URL: z.string().trim().min(1).optional(),
    ENCRYPTION_KEY: hex256,
    JWT_SECRET: jwtSecret,
    ADMIN_EMAIL: z.string().optional(),
    ADMIN_PASSWORD: z.string().optional(),
    MONGODB_TLS: z.string().optional(),
  })
  .refine(
    (env) => Boolean(env.MONGODB_URI || env.DATABASE_URL || env.MONGODB_URL),
    {
      message: "MONGODB_URI, DATABASE_URL, or MONGODB_URL is required",
      path: ["MONGODB_URI"],
    }
  );

function isTestRuntime() {
  return (
    process.env.NODE_ENV === "test" ||
    typeof process.env.JEST_WORKER_ID === "string" ||
    process.env.SKIP_ENV_VALIDATION === "1"
  );
}

const TEST_ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const TEST_JWT_SECRET = "jest-only-jwt-secret-32chars-min!";
const TEST_MONGO_URI = "mongodb://127.0.0.1:27017/mealprep_test";

function sourceEnv() {
  if (!isTestRuntime()) return process.env;
  return {
    ...process.env,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || TEST_ENCRYPTION_KEY,
    JWT_SECRET: process.env.JWT_SECRET || TEST_JWT_SECRET,
    MONGODB_URI:
      process.env.MONGODB_URI ||
      process.env.DATABASE_URL ||
      process.env.MONGODB_URL ||
      TEST_MONGO_URI,
  };
}

const parsed = envSchema.safeParse(sourceEnv());

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment variables:\n${details}`);
}

export const env = parsed.data;
