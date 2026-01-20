import { db } from "../src/lib/db";
import { calculatorConfigs } from "../src/lib/db/schema";
import { getDefaultConfig } from "../src/lib/calculator-config";

/**
 * Seed calculator configs with default values
 * Run with: npx ts-node scripts/seed-calculator-configs.ts
 */
async function seedCalculatorConfigs() {
  console.log("🌱 Seeding calculator configs...");

  try {
    // Salary calculator config for 1403
    const salaryConfig = getDefaultConfig("salary");
    await db.insert(calculatorConfigs).values({
      calculatorType: "salary",
      configYear: 1403,
      config: salaryConfig,
      isActive: true,
      notes: "تنظیمات پیش‌فرض سال ۱۴۰۳",
      createdBy: null, // System-created
      updatedBy: null,
    });
    console.log("✅ Salary calculator config seeded");

    // Tax calculator config for 1403
    const taxConfig = getDefaultConfig("tax");
    await db.insert(calculatorConfigs).values({
      calculatorType: "tax",
      configYear: 1403,
      config: taxConfig,
      isActive: true,
      notes: "تنظیمات پیش‌فرض سال ۱۴۰۳",
      createdBy: null,
      updatedBy: null,
    });
    console.log("✅ Tax calculator config seeded");

    // Loan calculator config for 1403
    const loanConfig = getDefaultConfig("loan");
    await db.insert(calculatorConfigs).values({
      calculatorType: "loan",
      configYear: 1403,
      config: loanConfig,
      isActive: true,
      notes: "تنظیمات پیش‌فرض سال ۱۴۰۳",
      createdBy: null,
      updatedBy: null,
    });
    console.log("✅ Loan calculator config seeded");

    console.log("🎉 All calculator configs seeded successfully!");
  } catch (error: any) {
    if (error.code === "23505") {
      console.log("⚠️  Configs already exist (unique constraint violation)");
    } else {
      console.error("❌ Error seeding configs:", error);
      throw error;
    }
  }
}

seedCalculatorConfigs()
  .then(() => {
    console.log("✨ Seed script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seed script failed:", error);
    process.exit(1);
  });
