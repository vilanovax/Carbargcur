/**
 * Jalaali (Shamsi/Persian) Date Utilities
 *
 * این فایل شامل توابع کمکی برای کار با تاریخ شمسی است
 */

import moment from "moment-jalaali";

// Configure moment-jalaali to use Persian calendar
moment.loadPersian({ usePersianDigits: false, dialect: "persian-modern" });

// Set locale to fa to ensure jalaali calendar is used
if (typeof window !== 'undefined') {
  moment.locale('fa');
}

/**
 * Convert Gregorian date to Jalaali (Shamsi)
 */
export function toJalaali(date: Date | string): string {
  return moment(date).format("jYYYY/jMM/jDD");
}

/**
 * Convert Jalaali (Shamsi) to Gregorian
 */
export function fromJalaali(jalaaliDate: string): Date {
  return moment(jalaaliDate, "jYYYY/jMM/jDD").toDate();
}

/**
 * Format date in Persian
 */
export function formatPersianDate(
  date: Date | string,
  format: string = "jYYYY/jMM/jDD"
): string {
  return moment(date).format(format);
}

/**
 * Get current Jalaali year
 */
export function getCurrentJalaaliYear(): number {
  return moment().jYear();
}

/**
 * Get Jalaali year from date
 */
export function getJalaaliYear(date: Date | string): number {
  return moment(date).jYear();
}

/**
 * Get Jalaali month from date (1-12)
 */
export function getJalaaliMonth(date: Date | string): number {
  return moment(date).jMonth() + 1; // moment returns 0-11
}

/**
 * Generate list of Jalaali years for dropdown
 */
export function getJalaaliYearOptions(
  startYear?: number,
  endYear?: number
): { value: number; label: string }[] {
  const currentYear = getCurrentJalaaliYear();
  const start = startYear || currentYear - 50; // 50 years ago
  const end = endYear || currentYear;

  const years: { value: number; label: string }[] = [];

  for (let year = end; year >= start; year--) {
    years.push({
      value: year,
      label: year.toString(),
    });
  }

  return years;
}

/**
 * Jalaali month names
 */
export const JALAALI_MONTHS = [
  { value: 1, label: "فروردین", nameEn: "Farvardin" },
  { value: 2, label: "اردیبهشت", nameEn: "Ordibehesht" },
  { value: 3, label: "خرداد", nameEn: "Khordad" },
  { value: 4, label: "تیر", nameEn: "Tir" },
  { value: 5, label: "مرداد", nameEn: "Mordad" },
  { value: 6, label: "شهریور", nameEn: "Shahrivar" },
  { value: 7, label: "مهر", nameEn: "Mehr" },
  { value: 8, label: "آبان", nameEn: "Aban" },
  { value: 9, label: "آذر", nameEn: "Azar" },
  { value: 10, label: "دی", nameEn: "Dey" },
  { value: 11, label: "بهمن", nameEn: "Bahman" },
  { value: 12, label: "اسفند", nameEn: "Esfand" },
];

/**
 * Get month name by number
 */
export function getJalaaliMonthName(month: number): string {
  const monthObj = JALAALI_MONTHS.find((m) => m.value === month);
  return monthObj?.label || "";
}

/**
 * Create Jalaali date from year and month
 */
export function createJalaaliDate(year: number, month: number, day: number = 1): Date {
  return moment(`${year}/${month}/${day}`, "jYYYY/jM/jD").toDate();
}

/**
 * Parse Jalaali date string (handles multiple formats)
 */
export function parseJalaaliDate(dateStr: string): Date | null {
  const formats = ["jYYYY/jMM/jDD", "jYYYY/jM/jD", "jYYYY-jMM-jDD", "jYYYY-jM-jD"];

  for (const format of formats) {
    const parsed = moment(dateStr, format, true);
    if (parsed.isValid()) {
      return parsed.toDate();
    }
  }

  return null;
}

/**
 * Check if a Jalaali year is valid
 */
export function isValidJalaaliYear(year: number): boolean {
  return year >= 1300 && year <= getCurrentJalaaliYear() + 10;
}

/**
 * Convert start/end year-month to full dates
 * Used for work experience forms
 */
export interface JalaaliPeriod {
  startDate: Date;
  endDate: Date | null; // null means "present"
}

export function createJalaaliPeriod(
  startYear: number,
  startMonth: number,
  endYear?: number,
  endMonth?: number
): JalaaliPeriod {
  return {
    startDate: createJalaaliDate(startYear, startMonth, 1),
    endDate:
      endYear && endMonth
        ? createJalaaliDate(endYear, endMonth, 1)
        : null,
  };
}

/**
 * Extract year and month from Date for forms
 */
export function extractJalaaliYearMonth(date: Date | string): {
  year: number;
  month: number;
} {
  const m = moment(date);
  return {
    year: m.jYear(),
    month: m.jMonth() + 1, // moment returns 0-11
  };
}

/**
 * Format duration in Persian
 */
export function formatDuration(startDate: Date, endDate: Date | null): string {
  const start = moment(startDate);
  const end = endDate ? moment(endDate) : moment();

  const years = end.diff(start, "years");
  const months = end.diff(start, "months") % 12;

  const parts: string[] = [];

  if (years > 0) {
    parts.push(`${years} سال`);
  }

  if (months > 0) {
    parts.push(`${months} ماه`);
  }

  if (parts.length === 0) {
    return "کمتر از یک ماه";
  }

  return parts.join(" و ");
}

/**
 * Format work experience date string (year/month format)
 * Converts "1400/6" to "شهریور ۱۴۰۰"
 * Converts "اکنون" to "اکنون"
 */
export function formatWorkExperienceDate(dateStr: string): string {
  if (dateStr === "اکنون" || dateStr === "present") {
    return "اکنون";
  }

  const parts = dateStr.split("/");
  if (parts.length !== 2) {
    return dateStr; // Return as-is if format is unexpected
  }

  const year = parts[0];
  const month = parseInt(parts[1]);
  const monthName = getJalaaliMonthName(month);

  return `${monthName} ${year}`;
}
