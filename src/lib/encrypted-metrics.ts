import { decryptNumber, maybeEncryptMetric } from "@/lib/crypto";

export const ENCRYPTED_METRIC_KEYS = [
  "heightCm",
  "currentWeightKg",
  "targetWeightKg",
  "startingWeightKg",
  "age",
] as const;

export type EncryptedMetricKey = (typeof ENCRYPTED_METRIC_KEYS)[number];

type ProfileLike = Record<string, unknown>;

export function encryptProfileMetrics<T extends ProfileLike | undefined | null>(
  profile: T
): T {
  if (!profile || typeof profile !== "object") return profile;
  for (const key of ENCRYPTED_METRIC_KEYS) {
    if (profile[key] !== undefined && profile[key] !== null && profile[key] !== "") {
      profile[key] = maybeEncryptMetric(profile[key]);
    }
  }
  return profile;
}

export function decryptProfileMetrics<T extends ProfileLike | undefined | null>(
  profile: T
): T {
  if (!profile || typeof profile !== "object") return profile;
  const withToObject = profile as { toObject?: (opts?: object) => ProfileLike };
  const source =
    typeof withToObject.toObject === "function"
      ? withToObject.toObject({ getters: true })
      : { ...profile };
  const next: ProfileLike = { ...source };
  for (const key of ENCRYPTED_METRIC_KEYS) {
    if (key in next) {
      next[key] = decryptNumber(next[key]);
    }
  }
  return next as T;
}

function encryptUpdatePayload(update: Record<string, unknown> | null | undefined) {
  if (!update || typeof update !== "object") return;

  const targets = [update, update.$set, update.$setOnInsert].filter(
    (value): value is Record<string, unknown> =>
      Boolean(value) && typeof value === "object"
  );

  for (const obj of targets) {
    if (obj.profile && typeof obj.profile === "object") {
      encryptProfileMetrics(obj.profile as ProfileLike);
    }
    for (const key of ENCRYPTED_METRIC_KEYS) {
      const path = `profile.${key}`;
      if (obj[path] !== undefined) {
        obj[path] = maybeEncryptMetric(obj[path]);
      }
    }
  }
}

export function metricFieldAccessors() {
  return {
    set: (value: unknown) => maybeEncryptMetric(value),
    get: (value: unknown) => decryptNumber(value),
  };
}

/**
 * Encrypts physical metrics on write (save + update operators) so plaintext
 * never lands in MongoDB. Pair with decryptProfileMetrics / schema getters on read.
 */
export function applyFieldEncryption(schema: object): void {
  const hookable = schema as {
    pre: (hook: string, fn: (...args: never[]) => void) => void;
  };

  hookable.pre("save", function encryptOnSave(this: { profile?: ProfileLike }) {
    if (this.profile) encryptProfileMetrics(this.profile);
  });

  const encryptOnUpdate = function (this: { getUpdate: () => unknown }) {
    encryptUpdatePayload(this.getUpdate() as Record<string, unknown> | null);
  };

  hookable.pre("findOneAndUpdate", encryptOnUpdate);
  hookable.pre("updateOne", encryptOnUpdate);
  hookable.pre("updateMany", encryptOnUpdate);
}
