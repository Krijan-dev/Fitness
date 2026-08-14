import bcrypt from "bcryptjs";
import {
  BCRYPT_ROUNDS,
  hashPassword,
  isBcryptHash,
  verifyPassword,
} from "@/lib/auth";

describe("password hashing", () => {
  it("hashes with bcrypt cost 12 and never returns plaintext", async () => {
    const password = "super-secret-pass";
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(hash).not.toContain(password);
    expect(isBcryptHash(hash)).toBe(true);
    expect(hash.startsWith("$2")).toBe(true);
    expect(hash).toContain("$12$");
    expect(BCRYPT_ROUNDS).toBe(12);
  });

  it("verifies with bcrypt.compare", async () => {
    const password = "correct-horse-battery";
    const hash = await hashPassword(password);
    await expect(verifyPassword(password, hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("does not throw on a non-bcrypt stored value", async () => {
    await expect(verifyPassword("anything", "plaintext-not-allowed")).resolves.toBe(
      false
    );
  });

  it("matches bcryptjs output for a known hash", async () => {
    const hash = await bcrypt.hash("admin-test", 12);
    expect(await bcrypt.compare("admin-test", hash)).toBe(true);
  });
});
