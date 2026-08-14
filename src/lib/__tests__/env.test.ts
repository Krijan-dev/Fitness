import { validateEnv } from "@/env";

const valid = {
  MONGODB_URI: "mongodb://127.0.0.1:27017/mealprep",
  ENCRYPTION_KEY:
    "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
  JWT_SECRET: "a-sufficiently-long-jwt-secret-value",
};

describe("environment validation", () => {
  it("accepts DATABASE_URL as a Mongo URI alias", () => {
    const result = validateEnv({
      DATABASE_URL: "mongodb+srv://user:pass@cluster.mongodb.net/app",
      ENCRYPTION_KEY: valid.ENCRYPTION_KEY,
      JWT_SECRET: valid.JWT_SECRET,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing database URL", () => {
    const result = validateEnv({
      ENCRYPTION_KEY: valid.ENCRYPTION_KEY,
      JWT_SECRET: valid.JWT_SECRET,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a short or non-hex ENCRYPTION_KEY", () => {
    expect(
      validateEnv({ ...valid, ENCRYPTION_KEY: "tooshort" }).success
    ).toBe(false);
    expect(
      validateEnv({ ...valid, ENCRYPTION_KEY: "z".repeat(64) }).success
    ).toBe(false);
  });

  it("rejects a missing or weak JWT_SECRET", () => {
    expect(validateEnv({ ...valid, JWT_SECRET: undefined }).success).toBe(false);
    expect(validateEnv({ ...valid, JWT_SECRET: "secret" }).success).toBe(false);
    expect(validateEnv({ ...valid, JWT_SECRET: "short" }).success).toBe(false);
  });
});
