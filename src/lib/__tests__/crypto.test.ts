import {
  decryptNumber,
  decryptUtf8,
  encryptNumber,
  encryptUtf8,
  isEncryptedEnvelope,
  maybeEncryptMetric,
  resetEncryptionKeyCache,
} from "@/lib/crypto";
import { decryptProfileMetrics, encryptProfileMetrics } from "@/lib/encrypted-metrics";

const TEST_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

describe("AES-256-GCM crypto", () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = TEST_KEY;
    resetEncryptionKeyCache();
  });

  it("round-trips UTF-8 plaintext with iv and auth tag", () => {
    const envelope = encryptUtf8("72.5");
    expect(isEncryptedEnvelope(envelope)).toBe(true);
    expect(envelope.startsWith("enc:v1:")).toBe(true);
    expect(envelope.split(":")).toHaveLength(5);
    expect(decryptUtf8(envelope)).toBe("72.5");
  });

  it("round-trips numeric metrics", () => {
    const encrypted = encryptNumber(82.4);
    expect(typeof encrypted).toBe("string");
    expect(decryptNumber(encrypted)).toBe(82.4);
  });

  it("uses a unique IV per encryption", () => {
    const first = encryptUtf8("180");
    const second = encryptUtf8("180");
    expect(first).not.toBe(second);
    expect(decryptUtf8(first)).toBe(decryptUtf8(second));
  });

  it("rejects tampered ciphertext (auth tag)", () => {
    const envelope = encryptUtf8("90");
    const parts = envelope.split(":");
    const last = parts[4];
    const flipped = (parseInt(last.slice(0, 2), 16) ^ 0xff)
      .toString(16)
      .padStart(2, "0");
    parts[4] = flipped + last.slice(2);
    expect(() => decryptUtf8(parts.join(":"))).toThrow();
  });

  it("decrypts legacy plaintext numbers for migration", () => {
    expect(decryptNumber(75)).toBe(75);
    expect(decryptNumber("68.2")).toBe(68.2);
    expect(decryptNumber(undefined)).toBeUndefined();
  });

  it("does not double-encrypt existing envelopes", () => {
    const once = maybeEncryptMetric(80) as string;
    const twice = maybeEncryptMetric(once);
    expect(twice).toBe(once);
  });

  it("encrypts profile metrics in place and decrypts for the dashboard", () => {
    const profile = {
      displayName: "Alex",
      heightCm: 165,
      currentWeightKg: 65,
      targetWeightKg: 60,
      age: 28,
    };
    encryptProfileMetrics(profile);
    expect(isEncryptedEnvelope(profile.heightCm)).toBe(true);
    expect(isEncryptedEnvelope(profile.currentWeightKg)).toBe(true);
    expect(typeof profile.heightCm === "string" && profile.heightCm.includes("165")).toBe(
      false
    );

    const decrypted = decryptProfileMetrics(profile);
    expect(decrypted.heightCm).toBe(165);
    expect(decrypted.currentWeightKg).toBe(65);
    expect(decrypted.targetWeightKg).toBe(60);
    expect(decrypted.age).toBe(28);
    expect(decrypted.displayName).toBe("Alex");
  });
});
