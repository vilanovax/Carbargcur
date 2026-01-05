// Persian to Latin transliteration map
const persianToLatin: Record<string, string> = {
  'آ': 'a', 'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's', 'ج': 'j',
  'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z',
  'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z',
  'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'gh', 'ک': 'k', 'گ': 'g', 'ل': 'l',
  'م': 'm', 'ن': 'n', 'و': 'v', 'ه': 'h', 'ی': 'i', 'ئ': 'y',
};

/**
 * Convert Persian text to Latin characters
 */
function transliteratePersian(text: string): string {
  return text
    .split('')
    .map((char) => persianToLatin[char] || char)
    .join('');
}

/**
 * Generate a URL-safe slug from Persian name
 * Format: firstname-lastname-XXXX (4 random alphanumeric chars)
 * Example: ali-mohammadi-a3k9
 */
export function generateSlug(fullName: string): string {
  // Transliterate Persian to Latin
  const latinName = transliteratePersian(fullName);

  // Clean and format
  const cleanName = latinName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric except hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  // Generate 4-character random suffix (alphanumeric)
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const suffix = Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');

  return `${cleanName}-${suffix}`;
}

/**
 * Validate slug format
 * Must be: lowercase letters, numbers, and hyphens only
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Get public profile URL from slug
 */
export function getPublicProfileUrl(slug: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/u/${slug}`;
}
