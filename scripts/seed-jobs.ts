/**
 * Seed Jobs Script
 * Run with: npx tsx scripts/seed-jobs.ts
 */

import { db } from "../src/lib/db";
import { jobs } from "../src/lib/db/schema";

const sampleJobs = [
  {
    title: "حسابدار ارشد",
    company: "شرکت پارسیان",
    description: `ما به دنبال یک حسابدار ارشد با تجربه برای مدیریت امور مالی شرکت هستیم.

وظایف:
• تهیه و تنظیم صورت‌های مالی
• نظارت بر فرآیندهای حسابداری
• همکاری با حسابرسان خارجی
• مدیریت تیم حسابداری`,
    city: "تهران",
    employmentType: "full-time",
    experienceLevel: "senior",
    minExperienceYears: 5,
    maxExperienceYears: 10,
    requiredSkills: JSON.stringify([
      "حسابداری مالی",
      "استانداردهای IFRS",
      "صورت‌های مالی",
      "Excel پیشرفته",
    ]),
    preferredSkills: JSON.stringify([
      "نرم‌افزار همکاران سیستم",
      "SAP",
      "تحلیل مالی",
    ]),
    preferredBehavior: JSON.stringify({
      primary: "precise",
      traits: ["دقت بالا", "پایبندی به قوانین"],
    }),
    preferredCareerFit: JSON.stringify({
      primary: "conventional",
      secondary: "analytical",
    }),
    salaryMin: "۲۵,۰۰۰,۰۰۰",
    salaryMax: "۴۰,۰۰۰,۰۰۰",
    isFeatured: true,
  },
  {
    title: "تحلیلگر مالی",
    company: "هلدینگ آینده‌سازان",
    description: `به تیم تحلیل مالی ما بپیوندید و در پروژه‌های بزرگ سرمایه‌گذاری مشارکت کنید.

وظایف:
• تحلیل صورت‌های مالی شرکت‌ها
• ارزیابی فرصت‌های سرمایه‌گذاری
• تهیه گزارش‌های تحلیلی
• مدل‌سازی مالی`,
    city: "تهران",
    employmentType: "full-time",
    experienceLevel: "mid",
    minExperienceYears: 3,
    maxExperienceYears: 6,
    requiredSkills: JSON.stringify([
      "تحلیل مالی",
      "مدل‌سازی مالی",
      "Excel پیشرفته",
      "ارزش‌گذاری",
    ]),
    preferredSkills: JSON.stringify([
      "Python",
      "Power BI",
      "Bloomberg Terminal",
    ]),
    preferredBehavior: JSON.stringify({
      primary: "result-oriented",
      traits: ["تحلیلگری", "تصمیم‌گیری سریع"],
    }),
    preferredCareerFit: JSON.stringify({
      primary: "analytical",
      secondary: "enterprising",
    }),
    salaryMin: "۲۰,۰۰۰,۰۰۰",
    salaryMax: "۳۵,۰۰۰,۰۰۰",
    isFeatured: true,
  },
  {
    title: "مدیر مالی",
    company: "گروه صنعتی بهران",
    description: `به دنبال یک مدیر مالی با تجربه برای هدایت استراتژی مالی شرکت هستیم.

وظایف:
• تدوین استراتژی مالی شرکت
• مدیریت نقدینگی و سرمایه در گردش
• نظارت بر بودجه‌بندی و کنترل هزینه
• گزارش‌دهی به هیئت مدیره`,
    city: "اصفهان",
    employmentType: "full-time",
    experienceLevel: "senior",
    minExperienceYears: 8,
    maxExperienceYears: 15,
    requiredSkills: JSON.stringify([
      "مدیریت مالی",
      "بودجه‌بندی",
      "تحلیل مالی",
      "رهبری تیم",
    ]),
    preferredSkills: JSON.stringify([
      "MBA",
      "CFA",
      "تجربه صنعتی",
    ]),
    preferredBehavior: JSON.stringify({
      primary: "result-oriented",
      traits: ["رهبری", "تصمیم‌گیری استراتژیک"],
    }),
    preferredCareerFit: JSON.stringify({
      primary: "enterprising",
      secondary: "conventional",
    }),
    salaryMin: "۵۰,۰۰۰,۰۰۰",
    salaryMax: "۸۰,۰۰۰,۰۰۰",
    isFeatured: true,
  },
  {
    title: "کارشناس حسابداری",
    company: "شرکت توسعه نوین",
    description: `جذب کارشناس حسابداری برای واحد مالی شرکت.

وظایف:
• ثبت اسناد حسابداری
• تهیه گزارش‌های مالی ماهانه
• پیگیری حساب‌های دریافتنی و پرداختنی
• همکاری در تهیه اظهارنامه مالیاتی`,
    city: "تهران",
    employmentType: "full-time",
    experienceLevel: "junior",
    minExperienceYears: 1,
    maxExperienceYears: 3,
    requiredSkills: JSON.stringify([
      "حسابداری مالی",
      "Excel",
      "نرم‌افزار حسابداری",
    ]),
    preferredSkills: JSON.stringify([
      "همکاران سیستم",
      "قوانین مالیاتی",
    ]),
    preferredBehavior: JSON.stringify({
      primary: "stable",
      traits: ["دقت", "صبر"],
    }),
    preferredCareerFit: JSON.stringify({
      primary: "conventional",
    }),
    salaryMin: "۱۲,۰۰۰,۰۰۰",
    salaryMax: "۱۸,۰۰۰,۰۰۰",
    isFeatured: false,
  },
  {
    title: "حسابرس داخلی",
    company: "بانک سامان",
    description: `استخدام حسابرس داخلی برای واحد حسابرسی داخلی بانک.

وظایف:
• اجرای حسابرسی‌های داخلی
• ارزیابی سیستم‌های کنترل داخلی
• تهیه گزارش‌های حسابرسی
• پیگیری اقدامات اصلاحی`,
    city: "تهران",
    employmentType: "full-time",
    experienceLevel: "mid",
    minExperienceYears: 3,
    maxExperienceYears: 7,
    requiredSkills: JSON.stringify([
      "حسابرسی داخلی",
      "کنترل‌های داخلی",
      "استانداردهای حسابرسی",
      "مدیریت ریسک",
    ]),
    preferredSkills: JSON.stringify([
      "CIA",
      "CISA",
      "تجربه بانکی",
    ]),
    preferredBehavior: JSON.stringify({
      primary: "precise",
      traits: ["دقت", "استقلال رأی"],
    }),
    preferredCareerFit: JSON.stringify({
      primary: "analytical",
      secondary: "conventional",
    }),
    salaryMin: "۲۵,۰۰۰,۰۰۰",
    salaryMax: "۴۵,۰۰۰,۰۰۰",
    isFeatured: false,
  },
  {
    title: "کارشناس بودجه و کنترل",
    company: "شرکت ملی گاز",
    description: `جذب کارشناس بودجه برای واحد برنامه‌ریزی و کنترل.

وظایف:
• تهیه و تنظیم بودجه سالانه
• کنترل و پایش عملکرد بودجه‌ای
• تحلیل انحرافات بودجه
• تهیه گزارش‌های مدیریتی`,
    city: "تهران",
    employmentType: "full-time",
    experienceLevel: "mid",
    minExperienceYears: 2,
    maxExperienceYears: 5,
    requiredSkills: JSON.stringify([
      "بودجه‌بندی",
      "Excel پیشرفته",
      "تحلیل مالی",
      "گزارش‌نویسی",
    ]),
    preferredSkills: JSON.stringify([
      "Power BI",
      "SAP",
    ]),
    preferredBehavior: JSON.stringify({
      primary: "precise",
      traits: ["دقت", "سازمان‌دهی"],
    }),
    preferredCareerFit: JSON.stringify({
      primary: "conventional",
      secondary: "analytical",
    }),
    salaryMin: "۱۸,۰۰۰,۰۰۰",
    salaryMax: "۲۸,۰۰۰,۰۰۰",
    isFeatured: false,
  },
  {
    title: "مشاور مالیاتی",
    company: "موسسه حسابرسی آریا",
    description: `استخدام مشاور مالیاتی با تجربه برای ارائه خدمات به مشتریان.

وظایف:
• مشاوره مالیاتی به شرکت‌ها
• تهیه اظهارنامه‌های مالیاتی
• برنامه‌ریزی مالیاتی
• دفاع از پرونده‌های مالیاتی`,
    city: "تهران",
    employmentType: "full-time",
    experienceLevel: "senior",
    minExperienceYears: 5,
    maxExperienceYears: 12,
    requiredSkills: JSON.stringify([
      "قوانین مالیاتی",
      "حسابداری مالیاتی",
      "برنامه‌ریزی مالیاتی",
    ]),
    preferredSkills: JSON.stringify([
      "تجربه در سازمان مالیاتی",
      "مذاکره",
    ]),
    preferredBehavior: JSON.stringify({
      primary: "people-oriented",
      traits: ["ارتباطات قوی", "متقاعدسازی"],
    }),
    preferredCareerFit: JSON.stringify({
      primary: "social",
      secondary: "conventional",
    }),
    salaryMin: "۳۰,۰۰۰,۰۰۰",
    salaryMax: "۵۰,۰۰۰,۰۰۰",
    isFeatured: false,
  },
  {
    title: "تحلیلگر ریسک",
    company: "بیمه پارسیان",
    description: `جذب تحلیلگر ریسک برای واحد مدیریت ریسک.

وظایف:
• شناسایی و ارزیابی ریسک‌ها
• توسعه مدل‌های ریسک
• تهیه گزارش‌های ریسک
• پیشنهاد راهکارهای کاهش ریسک`,
    city: "تهران",
    employmentType: "full-time",
    experienceLevel: "mid",
    minExperienceYears: 3,
    maxExperienceYears: 6,
    requiredSkills: JSON.stringify([
      "مدیریت ریسک",
      "تحلیل آماری",
      "مدل‌سازی ریسک",
      "Excel پیشرفته",
    ]),
    preferredSkills: JSON.stringify([
      "FRM",
      "Python",
      "R",
    ]),
    preferredBehavior: JSON.stringify({
      primary: "precise",
      traits: ["تحلیلگری", "محتاط"],
    }),
    preferredCareerFit: JSON.stringify({
      primary: "analytical",
    }),
    salaryMin: "۲۲,۰۰۰,۰۰۰",
    salaryMax: "۳۸,۰۰۰,۰۰۰",
    isFeatured: false,
  },
];

async function seedJobs() {
  console.log("🌱 Seeding jobs...");

  try {
    // Insert jobs
    for (const job of sampleJobs) {
      await db.insert(jobs).values(job);
      console.log(`✅ Added: ${job.title}`);
    }

    console.log(`\n✨ Successfully seeded ${sampleJobs.length} jobs!`);
  } catch (error) {
    console.error("❌ Error seeding jobs:", error);
    process.exit(1);
  }

  process.exit(0);
}

seedJobs();
