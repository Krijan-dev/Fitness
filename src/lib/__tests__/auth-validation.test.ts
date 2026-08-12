import { registerSchema, loginSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

describe("auth validations", () => {
  it("accepts a valid registration payload", () => {
    const result = registerSchema.safeParse({
      name: "Alex",
      email: "alex@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      name: "Alex",
      email: "alex@example.com",
      password: "password123",
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
  });

  it("accepts login credentials", () => {
    const result = loginSchema.safeParse({
      email: "alex@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });
});

describe("rate limiter", () => {
  it("blocks after the configured limit", () => {
    const key = `test-${Date.now()}`;
    expect(rateLimit(key, 2, 60_000).success).toBe(true);
    expect(rateLimit(key, 2, 60_000).success).toBe(true);
    expect(rateLimit(key, 2, 60_000).success).toBe(false);
  });
});
