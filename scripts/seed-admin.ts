import { connectMongo } from "../src/lib/mongodb";
import { hashPassword } from "../src/lib/auth";
import { User } from "../src/models/User";
import { UserSettings } from "../src/models/UserSettings";

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }

  await connectMongo();

  const existing = await User.findOne({ email }).select("+passwordHash");
  if (existing) {
    existing.role = "admin";
    existing.disabled = false;
    existing.passwordHash = await hashPassword(password);
    existing.name = existing.name || name;
    await existing.save();
    console.log(`Updated existing admin user: ${email}`);
  } else {
    const user = await User.create({
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "admin",
      lastActivityAt: new Date(),
    });
    await UserSettings.create({
      userId: user._id,
      profile: { displayName: name },
    });
    console.log(`Created admin user: ${email}`);
  }

  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
