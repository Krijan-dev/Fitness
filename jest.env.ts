/**
 * Must load before next/jest so next.config.ts → env.mjs can validate.
 */
process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY ||
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "jest-only-jwt-secret-32chars-min!";
process.env.MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  process.env.MONGODB_URL ||
  "mongodb://127.0.0.1:27017/mealprep_test";
