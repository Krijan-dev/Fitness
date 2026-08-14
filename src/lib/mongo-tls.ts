export function getMongoUri(): string {
  const uri =
    process.env.MONGODB_URI?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    process.env.MONGODB_URL?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI, DATABASE_URL, or MONGODB_URL is required");
  }
  return uri;
}

export function isLocalMongoUri(uri: string): boolean {
  try {
    const parsed = new URL(
      uri.replace(/^mongodb\+srv/, "https").replace(/^mongodb/, "http")
    );
    return parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  } catch {
    return /localhost|127\.0\.0\.1/.test(uri);
  }
}

export type MongoTlsOptions = {
  bufferCommands: boolean;
  serverSelectionTimeoutMS: number;
  tls?: boolean;
  tlsAllowInvalidCertificates?: boolean;
};

/**
 * Force TLS for Atlas / production. Localhost stays plaintext so `mongodb://127.0.0.1`
 * keeps working in development. Equivalent to sslmode=require / rejectUnauthorized: true.
 */
export function mongoConnectionOptions(uri: string): MongoTlsOptions {
  const local = isLocalMongoUri(uri);
  const srv = uri.startsWith("mongodb+srv://");
  const forceTls =
    process.env.MONGODB_TLS === "true" ||
    process.env.NODE_ENV === "production" ||
    srv;

  const options: MongoTlsOptions = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 10_000,
  };

  if (!local && forceTls) {
    options.tls = true;
    options.tlsAllowInvalidCertificates = false;
  }

  return options;
}
