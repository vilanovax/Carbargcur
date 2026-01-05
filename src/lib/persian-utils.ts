/**
 * Persian/Arabic number conversion utilities
 */

// Persian digits: ۰۱۲۳۴۵۶۷۸۹
// Arabic digits: ٠١٢٣٤٥٦٧٨٩
// English digits: 0123456789

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Convert Persian/Arabic digits to English digits
 * Example: "۰۹۱۲۳۴۵۶۷۸۹" → "09123456789"
 */
export function convertPersianToEnglishDigits(input: string): string {
  if (!input) return input;

  let result = input;

  // Convert Persian digits to English
  persianDigits.forEach((persianDigit, index) => {
    result = result.replace(new RegExp(persianDigit, 'g'), englishDigits[index]);
  });

  // Convert Arabic digits to English
  arabicDigits.forEach((arabicDigit, index) => {
    result = result.replace(new RegExp(arabicDigit, 'g'), englishDigits[index]);
  });

  return result;
}

/**
 * Normalize mobile number:
 * - Convert Persian/Arabic digits to English
 * - Remove spaces, dashes, parentheses
 * - Ensure starts with 09
 */
export function normalizeMobileNumber(mobile: string): string {
  if (!mobile) return '';

  // Convert digits
  let normalized = convertPersianToEnglishDigits(mobile);

  // Remove non-digit characters
  normalized = normalized.replace(/[^\d]/g, '');

  // Remove country code if present (98 or +98)
  if (normalized.startsWith('98') && normalized.length === 12) {
    normalized = '0' + normalized.slice(2);
  }

  // Ensure starts with 0
  if (normalized.length === 10 && normalized[0] !== '0') {
    normalized = '0' + normalized;
  }

  return normalized;
}

/**
 * Validate Iranian mobile number format
 * Must be 11 digits starting with 09
 */
export function validateIranianMobile(mobile: string): boolean {
  const normalized = normalizeMobileNumber(mobile);
  return /^09\d{9}$/.test(normalized);
}

/**
 * Format mobile number for display
 * Example: "09123456789" → "0912 345 6789"
 */
export function formatMobileNumber(mobile: string): string {
  const normalized = normalizeMobileNumber(mobile);
  if (normalized.length !== 11) return normalized;

  return `${normalized.slice(0, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7)}`;
}
