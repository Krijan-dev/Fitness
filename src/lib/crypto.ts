import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ENVELOPE_PREFIX = "enc:v1:";

let cachedKey: Buffer | null | undefined;

function hexKeyFromEnv(): string | undefined {
  const raw = process.env.ENCRYPTION_KEY?.trim();
  return raw || undefined;
}

export function isValidEncryptionKey(value: string | undefined): boolean {
  return Boolean(value && /^[0-9a-fA-F]{64}$/.test(value.trim()));
}

function getKey(): Buffer {
  if (cachedKey) return cachedKey;
  if (cachedKey === null) {
    throw new Error("ENCRYPTION_KEY is not a 64-character hex string (256-bit).");
  }

  const hex = hexKeyFromEnv();
  if (!isValidEncryptionKey(hex)) {
    cachedKey = null;
    throw new Error("ENCRYPTION_KEY is not a 64-character hex string (256-bit).");
  }

  cachedKey = Buffer.from(hex!.trim(), "hex");
  if (cachedKey.length !== KEY_LENGTH) {
    cachedKey = null;
    throw new Error("ENCRYPTION_KEY must decode to 32 bytes.");
  }
  return cachedKey;
}

/** Test helper — do not use in application code. */
export function resetEncryptionKeyCache(): void {
  cachedKey = undefined;
}

export function isEncryptedEnvelope(value: unknown): value is string {
  if (typeof value !== "string" || !value.startsWith(ENVELOPE_PREFIX)) return false;
  const parts = value.split(":");
  return parts.length === 5 && parts[0] === "enc" && parts[1] === "v1";
}

export function encryptUtf8(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${ENVELOPE_PREFIX}${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptUtf8(payload: string): string {
  if (!isEncryptedEnvelope(payload)) {
    throw new Error("Invalid encrypted payload.");
  }
  const [, , ivHex, tagHex, dataHex] = payload.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(tagHex, "hex");
  const data = Buffer.from(dataHex, "hex");
  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error("Invalid encrypted payload.");
  }
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

export function encryptNumber(value: number | null | undefined): string | undefined {
  if (value === null || value === undefined || Number.isNaN(value)) return undefined;
  return encryptUtf8(String(value));
}

/**
 * Decrypts AES-GCM envelopes. Legacy plaintext numbers (pre-encryption) are returned as-is
 * so existing Mongo documents keep working until they are rewritten.
 */
export function decryptNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;

  if (isEncryptedEnvelope(value)) {
    const parsed = Number(decryptUtf8(value));
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  const legacy = Number(value);
  return Number.isFinite(legacy) ? legacy : undefined;
}

export function maybeEncryptMetric(value: unknown): unknown {
  if (value === null || value === undefined || value === "") return value;
  if (isEncryptedEnvelope(value)) return value;
  if (typeof value === "number" && Number.isFinite(value)) {
    return encryptNumber(value);
  }
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return encryptNumber(Number(value));
  }
  return value;
}

export function timingSafeStringEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    timingSafeEqual(left, Buffer.alloc(left.length));
    return false;
  }
  return timingSafeEqual(left, right);
}
