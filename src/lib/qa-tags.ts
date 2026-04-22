export const SUGGESTED_TAGS: ReadonlyArray<string> = [
  // مالیات
  "ارزش افزوده",
  "مالیات تکلیفی",
  "اظهارنامه مالیاتی",
  "مالیات بر درآمد",
  "معافیت مالیاتی",
  "ماده ۱۰۰",
  "ماده ۱۶۹",

  // حسابداری عمومی
  "ترازنامه",
  "صورت سود و زیان",
  "صورت جریان وجوه نقد",
  "سند حسابداری",
  "بستن حساب‌ها",
  "سال مالی",
  "استانداردهای حسابداری",

  // حقوق و دستمزد
  "حقوق و دستمزد",
  "بیمه تأمین اجتماعی",
  "مالیات حقوق",
  "حق اولاد",
  "اضافه‌کاری",
  "عیدی و پاداش",
  "حق سنوات",

  // حسابداری صنعتی و بهای تمام‌شده
  "بهای تمام‌شده",
  "سربار",
  "موجودی انبار",
  "هزینه‌یابی",

  // حسابرسی
  "حسابرسی داخلی",
  "حسابرسی مستقل",
  "کنترل داخلی",
  "گزارش حسابرس",

  // مالی و سرمایه‌گذاری
  "بودجه‌بندی",
  "تحلیل مالی",
  "جریان نقدی",
  "نسبت‌های مالی",
  "ارزیابی سرمایه‌گذاری",
  "NPV",
  "IRR",

  // بورس
  "سهام",
  "صندوق سرمایه‌گذاری",
  "اوراق بدهی",
  "کد بورسی",

  // بیمه
  "بیمه تکمیلی",
  "بیمه عمر",
  "بیمه شخص ثالث",

  // نرم‌افزارها
  "سپیدار",
  "هلو",
  "همکاران سیستم",
  "پارسیان",
  "Excel",
];

export function isSuggestedTag(tag: string): boolean {
  const normalized = tag.trim();
  return SUGGESTED_TAGS.some(
    (t) => t.toLowerCase() === normalized.toLowerCase()
  );
}

export function filterSuggestions(query: string, excluded: string[] = []): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const excludedLower = new Set(excluded.map((t) => t.toLowerCase()));
  return SUGGESTED_TAGS.filter(
    (t) =>
      t.toLowerCase().includes(q) && !excludedLower.has(t.toLowerCase())
  ).slice(0, 8);
}
