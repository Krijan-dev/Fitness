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

export type Env = z.infer<typeof envSchema>;

const TEST_ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const TEST_JWT_SECRET = "jest-only-jwt-secret-32chars-min!";
const TEST_MONGO_URI = "mongodb://127.0.0.1:27017/mealprep_test";

function isTestRuntime(): boolean {
  return (
    process.env.NODE_ENV === "test" ||
    typeof process.env.JEST_WORKER_ID === "string" ||
    process.env.SKIP_ENV_VALIDATION === "1"
  );
}

export function applyTestEnvDefaults(
  raw: Record<string, string | undefined>
): Record<string, string | undefined> {
  if (!isTestRuntime()) return raw;
  return {
    ...raw,
    ENCRYPTION_KEY: raw.ENCRYPTION_KEY || TEST_ENCRYPTION_KEY,
    JWT_SECRET: raw.JWT_SECRET || TEST_JWT_SECRET,
    MONGODB_URI:
      raw.MONGODB_URI || raw.DATABASE_URL || raw.MONGODB_URL || TEST_MONGO_URI,
  };
}

export function validateEnv(raw: Record<string, unknown> = process.env) {
  return envSchema.safeParse(raw);
}

function parseEnv(): Env {
  const source = applyTestEnvDefaults(process.env);
  if (isTestRuntime() && source !== process.env) {
    if (!process.env.ENCRYPTION_KEY && source.ENCRYPTION_KEY) {
      process.env.ENCRYPTION_KEY = source.ENCRYPTION_KEY;
    }
    if (!process.env.JWT_SECRET && source.JWT_SECRET) {
      process.env.JWT_SECRET = source.JWT_SECRET;
    }
    if (!process.env.MONGODB_URI && source.MONGODB_URI) {
      process.env.MONGODB_URI = source.MONGODB_URI;
    }
  }

  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${details}`);
  }
  return parsed.data;
}

export const env = parseEnv();
