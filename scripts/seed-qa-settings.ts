/**
 * Seed script for Q&A categories and settings
 * Run: DATABASE_URL="..." npx tsx scripts/seed-qa-settings.ts
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { qaCategories, qaSettings } from "../src/lib/db/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

// Default categories
const DEFAULT_CATEGORIES = [
  {
    code: "accounting",
    nameFa: "حسابداری",
    nameEn: "Accounting",
    description: "سؤالات مربوط به اصول حسابداری، استانداردها و رویه‌ها",
    icon: "📊",
    sortOrder: 1,
  },
  {
    code: "finance",
    nameFa: "مالی و سرمایه‌گذاری",
    nameEn: "Finance & Investment",
    description: "سؤالات مربوط به مدیریت مالی، تحلیل مالی و سرمایه‌گذاری",
    icon: "💰",
    sortOrder: 2,
  },
  {
    code: "tax",
    nameFa: "مالیات",
    nameEn: "Taxation",
    description: "سؤالات مربوط به قوانین مالیاتی، اظهارنامه و تکالیف مالیاتی",
    icon: "🏛️",
    sortOrder: 3,
  },
  {
    code: "insurance",
    nameFa: "بیمه",
    nameEn: "Insurance",
    description: "سؤالات مربوط به بیمه‌های اجتماعی، تأمین اجتماعی و بیمه‌های تکمیلی",
    icon: "🛡️",
    sortOrder: 4,
  },
  {
    code: "investment",
    nameFa: "بورس و بازار سرمایه",
    nameEn: "Stock Market",
    description: "سؤالات مربوط به بورس، اوراق بهادار و تحلیل تکنیکال",
    icon: "📈",
    sortOrder: 5,
  },
  {
    code: "audit",
    nameFa: "حسابرسی",
    nameEn: "Auditing",
    description: "سؤالات مربوط به حسابرسی داخلی و مستقل",
    icon: "🔍",
    sortOrder: 6,
  },
  {
    code: "budgeting",
    nameFa: "بودجه‌بندی",
    nameEn: "Budgeting",
    description: "سؤالات مربوط به تهیه و کنترل بودجه",
    icon: "📋",
    sortOrder: 7,
  },
  {
    code: "cost",
    nameFa: "حسابداری صنعتی و بهای تمام‌شده",
    nameEn: "Cost Accounting",
    description: "سؤالات مربوط به محاسبه بهای تمام‌شده و حسابداری صنعتی",
    icon: "⚙️",
    sortOrder: 8,
  },
];

// Default settings
const DEFAULT_SETTINGS = [
  {
    key: "qa_enabled",
    value: "true",
    description: "فعال یا غیرفعال بودن کل بخش پرسش و پاسخ",
  },
  {
    key: "daily_question_limit",
    value: "5",
    description: "حداکثر تعداد سؤال در روز برای هر کاربر",
  },
  {
    key: "daily_answer_limit",
    value: "10",
    description: "حداکثر تعداد پاسخ در روز برای هر کاربر",
  },
  {
    key: "min_answer_length",
    value: "20",
    description: "حداقل طول پاسخ (تعداد کاراکتر)",
  },
  {
    key: "require_auth_to_view",
    value: "false",
    description: "آیا برای مشاهده سؤالات نیاز به ورود است؟",
  },
  {
    key: "allow_anonymous_questions",
    value: "false",
    description: "آیا کاربران می‌توانند سؤال ناشناس بپرسند؟",
  },
  {
    key: "auto_hide_reported",
    value: "3",
    description: "تعداد گزارش‌های لازم برای مخفی شدن خودکار محتوا",
  },
  {
    key: "show_expert_level",
    value: "true",
    description: "نمایش سطح تخصص در پاسخ‌ها",
  },
];

async function seed() {
  console.log("🌱 Seeding Q&A categories and settings...\n");

  // Seed categories
  console.log("📂 Seeding categories...");
  for (const category of DEFAULT_CATEGORIES) {
    try {
      await db
        .insert(qaCategories)
        .values(category)
        .onConflictDoUpdate({
          target: qaCategories.code,
          set: {
            nameFa: category.nameFa,
            nameEn: category.nameEn,
            description: category.description,
            icon: category.icon,
            sortOrder: category.sortOrder,
            updatedAt: new Date(),
          },
        });
      console.log(`  ✓ ${category.nameFa} (${category.code})`);
    } catch (error) {
      console.error(`  ✗ Error seeding category ${category.code}:`, error);
    }
  }

  // Seed settings
  console.log("\n⚙️ Seeding settings...");
  for (const setting of DEFAULT_SETTINGS) {
    try {
      await db
        .insert(qaSettings)
        .values(setting)
        .onConflictDoUpdate({
          target: qaSettings.key,
          set: {
            description: setting.description,
            updatedAt: new Date(),
          },
        });
      console.log(`  ✓ ${setting.key} = ${setting.value}`);
    } catch (error) {
      console.error(`  ✗ Error seeding setting ${setting.key}:`, error);
    }
  }

  console.log("\n✅ Q&A settings seeded successfully!");
  await pool.end();
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
