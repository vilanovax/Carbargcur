/**
 * Seed script for Badges
 * Run: npx tsx scripts/seed-badges.ts
 */

import { db } from "../src/lib/db";
import { badges } from "../src/lib/db/schema";
import { ALL_BADGES } from "../src/lib/expertSystem";

async function seedBadges() {
  console.log("🏅 Seeding badges...\n");

  for (const badge of ALL_BADGES) {
    try {
      // Check if badge already exists
      const existing = await db
        .select()
        .from(badges)
        .where(require("drizzle-orm").eq(badges.code, badge.code))
        .limit(1);

      if (existing.length > 0) {
        console.log(`⏭️  Badge "${badge.code}" already exists, skipping`);
        continue;
      }

      // Insert new badge
      await db.insert(badges).values({
        code: badge.code,
        titleFa: badge.titleFa,
        titleEn: badge.titleEn,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        threshold: badge.threshold || null,
        isManual: badge.isManual,
        isActive: true,
      });

      console.log(`✅ Created badge: ${badge.icon} ${badge.titleFa} (${badge.code})`);
    } catch (error) {
      console.error(`❌ Error creating badge ${badge.code}:`, error);
    }
  }

  console.log("\n🎉 Badge seeding complete!");
  process.exit(0);
}

seedBadges().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
