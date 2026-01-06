/**
 * Application Presets & Defaults
 *
 * این فایل شامل تمام پیش‌فرض‌هایی است که در اپلیکیشن استفاده می‌شود
 * و توسط Admin Panel قابل مدیریت است.
 */

export interface PresetCategory {
  id: string;
  label: string;
  nameEn?: string;
}

// حوزه‌های فعالیت مالی
export const ACTIVITY_AREAS: PresetCategory[] = [
  { id: "accounting", label: "حسابداری", nameEn: "Accounting" },
  { id: "financial-analysis", label: "تحلیل مالی", nameEn: "Financial Analysis" },
  { id: "auditing", label: "حسابرسی", nameEn: "Auditing" },
  { id: "tax", label: "مالیات", nameEn: "Tax" },
  { id: "treasury", label: "خزانه‌داری", nameEn: "Treasury" },
  { id: "insurance", label: "بیمه", nameEn: "Insurance" },
  { id: "stock-market", label: "بورس و اوراق بهادار", nameEn: "Stock Market" },
  { id: "banking", label: "بانکداری", nameEn: "Banking" },
  { id: "investment", label: "سرمایه‌گذاری", nameEn: "Investment" },
  { id: "risk-management", label: "مدیریت ریسک", nameEn: "Risk Management" },
  { id: "financial-planning", label: "برنامه‌ریزی مالی", nameEn: "Financial Planning" },
  { id: "cost-accounting", label: "حسابداری صنعتی و بهای تمام شده", nameEn: "Cost Accounting" },
];

// مهارت‌های مالی متداول
export const FINANCE_SKILLS: PresetCategory[] = [
  { id: "ifrs", label: "IFRS", nameEn: "IFRS" },
  { id: "excel-advanced", label: "Excel پیشرفته", nameEn: "Advanced Excel" },
  { id: "financial-reporting", label: "گزارشگری مالی", nameEn: "Financial Reporting" },
  { id: "budget-planning", label: "بودجه‌بندی", nameEn: "Budget Planning" },
  { id: "sap", label: "SAP", nameEn: "SAP" },
  { id: "oracle-financials", label: "Oracle Financials", nameEn: "Oracle Financials" },
  { id: "sepidar", label: "سپیدار", nameEn: "Sepidar" },
  { id: "hesabfa", label: "حسابفا", nameEn: "Hesabfa" },
  { id: "power-bi", label: "Power BI", nameEn: "Power BI" },
  { id: "tableau", label: "Tableau", nameEn: "Tableau" },
  { id: "financial-modeling", label: "مدل‌سازی مالی", nameEn: "Financial Modeling" },
  { id: "valuation", label: "ارزش‌گذاری", nameEn: "Valuation" },
  { id: "taxation", label: "قوانین مالیاتی", nameEn: "Taxation" },
  { id: "internal-controls", label: "کنترل‌های داخلی", nameEn: "Internal Controls" },
  { id: "cia", label: "CIA", nameEn: "CIA" },
  { id: "cpa", label: "CPA", nameEn: "CPA" },
];

// شهرهای اصلی ایران
export const IRAN_CITIES: PresetCategory[] = [
  { id: "tehran", label: "تهران", nameEn: "Tehran" },
  { id: "mashhad", label: "مشهد", nameEn: "Mashhad" },
  { id: "isfahan", label: "اصفهان", nameEn: "Isfahan" },
  { id: "shiraz", label: "شیراز", nameEn: "Shiraz" },
  { id: "tabriz", label: "تبریز", nameEn: "Tabriz" },
  { id: "karaj", label: "کرج", nameEn: "Karaj" },
  { id: "ahvaz", label: "اهواز", nameEn: "Ahvaz" },
  { id: "qom", label: "قم", nameEn: "Qom" },
  { id: "urmia", label: "ارومیه", nameEn: "Urmia" },
  { id: "rasht", label: "رشت", nameEn: "Rasht" },
  { id: "kerman", label: "کرمان", nameEn: "Kerman" },
  { id: "zahedan", label: "زاهدان", nameEn: "Zahedan" },
  { id: "hamedan", label: "همدان", nameEn: "Hamedan" },
  { id: "yazd", label: "یزد", nameEn: "Yazd" },
  { id: "ardabil", label: "اردبیل", nameEn: "Ardabil" },
  { id: "bandar-abbas", label: "بندرعباس", nameEn: "Bandar Abbas" },
  { id: "arak", label: "اراک", nameEn: "Arak" },
  { id: "eslamshahr", label: "اسلامشهر", nameEn: "Eslamshahr" },
  { id: "kermanshah", label: "کرمانشاه", nameEn: "Kermanshah" },
  { id: "gorgan", label: "گرگان", nameEn: "Gorgan" },
];

// سطوح تجربه
export const EXPERIENCE_LEVELS: PresetCategory[] = [
  { id: "no-experience", label: "بدون تجربه", nameEn: "No Experience" },
  { id: "1-3", label: "۱ تا ۳ سال", nameEn: "1-3 years" },
  { id: "3-5", label: "۳ تا ۵ سال", nameEn: "3-5 years" },
  { id: "5-10", label: "۵ تا ۱۰ سال", nameEn: "5-10 years" },
  { id: "10+", label: "بیش از ۱۰ سال", nameEn: "10+ years" },
];

// وضعیت شغلی
export const JOB_STATUS_OPTIONS: PresetCategory[] = [
  { id: "employed", label: "شاغل", nameEn: "Employed" },
  { id: "unemployed", label: "در جستجوی کار", nameEn: "Unemployed" },
  { id: "student", label: "دانشجو", nameEn: "Student" },
  { id: "freelance", label: "فریلنسر", nameEn: "Freelance" },
];

// مدارک تحصیلی
export const EDUCATION_DEGREES: PresetCategory[] = [
  { id: "diploma", label: "دیپلم", nameEn: "Diploma" },
  { id: "associate", label: "کاردانی", nameEn: "Associate" },
  { id: "bachelor", label: "کارشناسی", nameEn: "Bachelor" },
  { id: "master", label: "کارشناسی ارشد", nameEn: "Master" },
  { id: "phd", label: "دکترا", nameEn: "PhD" },
];

// رشته‌های تحصیلی مرتبط با مالی
export const FINANCE_FIELDS: PresetCategory[] = [
  { id: "accounting", label: "حسابداری", nameEn: "Accounting" },
  { id: "financial-management", label: "مدیریت مالی", nameEn: "Financial Management" },
  { id: "economics", label: "اقتصاد", nameEn: "Economics" },
  { id: "business-management", label: "مدیریت بازرگانی", nameEn: "Business Management" },
  { id: "banking", label: "بانکداری", nameEn: "Banking" },
  { id: "insurance", label: "بیمه", nameEn: "Insurance" },
  { id: "mathematics", label: "ریاضی کاربردی", nameEn: "Applied Mathematics" },
  { id: "industrial-engineering", label: "مهندسی صنایع", nameEn: "Industrial Engineering" },
];

/**
 * Helper function to get label by id
 */
export function getPresetLabel(
  presets: PresetCategory[],
  id: string
): string | undefined {
  return presets.find((p) => p.id === id)?.label;
}

/**
 * Helper function to get all preset IDs
 */
export function getPresetIds(presets: PresetCategory[]): string[] {
  return presets.map((p) => p.id);
}

/**
 * LocalStorage keys for custom presets
 */
export const PRESET_STORAGE_KEYS = {
  ACTIVITY_AREAS: "karbarg:admin:presets:activity-areas",
  FINANCE_SKILLS: "karbarg:admin:presets:finance-skills",
  IRAN_CITIES: "karbarg:admin:presets:iran-cities",
  EXPERIENCE_LEVELS: "karbarg:admin:presets:experience-levels",
  JOB_STATUS_OPTIONS: "karbarg:admin:presets:job-status",
  EDUCATION_DEGREES: "karbarg:admin:presets:education-degrees",
  FINANCE_FIELDS: "karbarg:admin:presets:finance-fields",
};

/**
 * Load presets from localStorage (with fallback to defaults)
 */
export function loadPresets(key: string, defaults: PresetCategory[]): PresetCategory[] {
  if (typeof window === "undefined") return defaults;

  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : defaults;
    }
  } catch (e) {
    console.error("Failed to load presets from localStorage:", e);
  }

  return defaults;
}

/**
 * Save presets to localStorage
 */
export function savePresets(key: string, presets: PresetCategory[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(presets));
  } catch (e) {
    console.error("Failed to save presets to localStorage:", e);
  }
}
