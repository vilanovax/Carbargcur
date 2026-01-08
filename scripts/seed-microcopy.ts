/**
 * Seed script for Microcopy definitions
 * Run: DATABASE_URL="..." npx tsx scripts/seed-microcopy.ts
 */

import { db } from "../src/lib/db";
import { microcopyDefinitions } from "../src/lib/db/schema";

const MICROCOPY_DATA = [
  {
    id: "FIRST_ANSWER_CTA",
    triggerRule: "RULE_001",
    textFa: "🏅 اولین پاسخ = افزایش اعتبار تخصصی",
    targetSegment: "all",
    priority: 90,
    cooldownHours: 24,
  },
  {
    id: "MATCHED_QUESTION",
    triggerRule: "RULE_002",
    textFa: "این سؤال با تخصص شما مطابقت دارد",
    targetSegment: "junior",
    priority: 85,
    cooldownHours: 12,
  },
  {
    id: "UNANSWERED_URGENT",
    triggerRule: "RULE_003",
    textFa: "👀 نمایش ویژه در پروفایل شما",
    targetSegment: "all",
    priority: 80,
    cooldownHours: 24,
  },
  {
    id: "QUICK_RESPONSE",
    triggerRule: "RULE_004",
    textFa: "⏱ پاسخ سریع، اثر بیشتر",
    targetSegment: "senior",
    priority: 75,
    cooldownHours: 6,
  },
  {
    id: "PROFILE_BOOST",
    triggerRule: "RULE_005",
    textFa: "پاسخ‌های تخصصی شما در پروفایل عمومی نمایش داده می‌شود",
    targetSegment: "new",
    priority: 70,
    cooldownHours: 48,
  },
  {
    id: "LEADERBOARD_NEAR",
    triggerRule: "RULE_006",
    textFa: "فقط ۲ پاسخ تا ورود به لیدربورد!",
    targetSegment: "junior",
    priority: 65,
    cooldownHours: 24,
  },
  {
    id: "EXPERT_ENCOURAGE",
    triggerRule: "RULE_007",
    textFa: "هر پاسخ تأییدشده قدرت پروفایل شما را افزایش می‌دهد",
    targetSegment: "all",
    priority: 60,
    cooldownHours: 72,
  },
  {
    id: "COMMUNITY_IMPACT",
    triggerRule: "RULE_008",
    textFa: "فعالیت مستمر = جایگاه بالاتر در جامعه متخصصان",
    targetSegment: "senior",
    priority: 55,
    cooldownHours: 168, // 1 week
  },
];

async function seed() {
  console.log("🌱 Seeding Microcopy definitions...");

  for (const data of MICROCOPY_DATA) {
    await db
      .insert(microcopyDefinitions)
      .values({
        ...data,
        isEnabled: true,
      })
      .onConflictDoUpdate({
        target: microcopyDefinitions.id,
        set: {
          triggerRule: data.triggerRule,
          textFa: data.textFa,
          targetSegment: data.targetSegment,
          priority: data.priority,
          cooldownHours: data.cooldownHours,
          updatedAt: new Date(),
        },
      });

    console.log(`  ✓ ${data.id}`);
  }

  console.log("\n✅ Done! Seeded", MICROCOPY_DATA.length, "definitions");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error seeding:", err);
  process.exit(1);
});
