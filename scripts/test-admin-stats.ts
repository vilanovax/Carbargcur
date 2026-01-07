import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, profiles } from "../src/lib/db/schema";
import { eq, sql, and, gte } from "drizzle-orm";

async function testAdminStats() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema: { users, profiles } });

  try {
    console.log("Testing total users count...");
    const [totalUsersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    console.log("✓ Total users:", Number(totalUsersResult?.count || 0));

    console.log("\nTesting profile stats...");
    const [profileStatsResult] = await db
      .select({
        total: sql<number>`count(*)`,
        completed: sql<number>`count(*) filter (where ${profiles.onboardingCompleted} = true)`,
        publicActive: sql<number>`count(*) filter (where ${profiles.isPublic} = true and ${profiles.isActive} = true)`,
        hasResume: sql<number>`count(*) filter (where ${profiles.resumeUrl} is not null)`,
      })
      .from(profiles);

    console.log("✓ Profile stats:", {
      total: Number(profileStatsResult?.total || 0),
      completed: Number(profileStatsResult?.completed || 0),
      publicActive: Number(profileStatsResult?.publicActive || 0),
      hasResume: Number(profileStatsResult?.hasResume || 0),
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    console.log("\nTesting new users this week...");
    const [newUsersThisWeekResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.createdAt, sevenDaysAgo));
    console.log("✓ New users this week:", Number(newUsersThisWeekResult?.count || 0));

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.end();
  }
}

testAdminStats();
