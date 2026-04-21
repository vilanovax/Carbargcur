// Load environment variables FIRST before any other imports
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

// Now import everything else
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../src/lib/db/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function seedAdmin() {
  try {
    // Create connection
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL not found in environment");
    }

    const client = postgres(connectionString, { max: 1 });
    const db = drizzle(client, { schema: { users } });

    console.log("🔍 Checking for existing admin user...");

    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.mobile, "09123456789"))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log("⚠️  Admin user already exists with mobile: 09123456789");
      console.log("Existing user:", {
        id: existingAdmin[0].id,
        mobile: existingAdmin[0].mobile,
        fullName: existingAdmin[0].fullName,
        isAdmin: existingAdmin[0].isAdmin,
      });
      await client.end();
      return;
    }

    const adminMobile = process.env.SEED_ADMIN_MOBILE || "09123456789";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;
    if (!adminPassword || adminPassword.length < 8) {
      throw new Error(
        "SEED_ADMIN_PASSWORD is required and must be at least 8 characters. Set it in .env.local or your shell."
      );
    }

    console.log("🔐 Hashing password...");
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    console.log("👤 Creating admin user...");
    const [admin] = await db
      .insert(users)
      .values({
        mobile: adminMobile,
        passwordHash: passwordHash,
        fullName: "کاربر ادمین",
        isVerified: true,
        isAdmin: true,
      })
      .returning();

    console.log("✅ Admin user created successfully!");
    console.log("  Mobile:", adminMobile);
    console.log("  User ID:", admin.id);

    await client.end();
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  }
}

seedAdmin()
  .then(() => {
    console.log("\n✨ Seed completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seed failed:", error);
    process.exit(1);
  });
