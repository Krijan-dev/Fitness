/**
 * Must load before next/jest so next.config.ts → env.mjs can validate.
 * Do not assign process.env.NODE_ENV — TypeScript treats it as read-only.
 */
const testEnv = process.env as Record<string, string | undefined>;
testEnv.ENCRYPTION_KEY =
  testEnv.ENCRYPTION_KEY ||
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
testEnv.JWT_SECRET =
  testEnv.JWT_SECRET || "jest-only-jwt-secret-32chars-min!";
testEnv.MONGODB_URI =
  testEnv.MONGODB_URI ||
  testEnv.DATABASE_URL ||
  testEnv.MONGODB_URL ||
  "mongodb://127.0.0.1:27017/mealprep_test";
