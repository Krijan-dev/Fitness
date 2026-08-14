import { config as loadEnv } from "dotenv";
import { resolve } from "path";

// Load env BEFORE importing app modules (they read process.env at runtime).
const localResult = loadEnv({ path: resolve(process.cwd(), ".env.local") });
const envResult = loadEnv({ path: resolve(process.cwd(), ".env") });

async function seedAdmin() {
  const mongoUri =
    process.env.MONGODB_URI?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    process.env.MONGODB_URL?.trim();
  if (!mongoUri) {
    const tried = [
      localResult.error ? `.env.local (${localResult.error.message})` : ".env.local (loaded)",
      envResult.error ? `.env (${envResult.error.message})` : ".env (loaded)",
    ].join("; ");
    throw new Error(
      `MONGODB_URI (or DATABASE_URL) is required. Put it in .env.local at the project root. Tried: ${tried}`
    );
  }
  process.env.MONGODB_URI = mongoUri;

  const { env } = await import("../src/env");
  const { connectMongo } = await import("../src/lib/mongodb");
  const { hashPassword, isBcryptHash } = await import("../src/lib/auth");
  const { User } = await import("../src/models/User");
  const { UserSettings } = await import("../src/models/UserSettings");

  const email = (process.env.ADMIN_EMAIL || env.ADMIN_EMAIL)?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD are required in .env.local (never hardcode them)"
    );
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }

  const passwordHash = await hashPassword(password);
  if (!isBcryptHash(passwordHash)) {
    throw new Error("Failed to bcrypt-hash ADMIN_PASSWORD");
  }

  await connectMongo();

  const existing = await User.findOne({ email }).select("+passwordHash");
  if (existing) {
    existing.role = "admin";
    existing.disabled = false;
    existing.passwordHash = passwordHash;
    existing.name = existing.name || name;
    await existing.save();
    console.log(`Updated existing admin user: ${email} (password hashed with bcrypt cost 12)`);
  } else {
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "admin",
      lastActivityAt: new Date(),
    });
    await UserSettings.create({
      userId: user._id,
      profile: { displayName: name },
    });
    console.log(`Created admin user: ${email} (password hashed with bcrypt cost 12)`);
  }

  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
