/**
 * Share Results Engine
 *
 * Generates shareable content for assessment results:
 * - Social media share text
 * - Image generation data (for canvas)
 * - PDF export data
 * - Link sharing
 */

import type { DISCAssessmentResult, HollandAssessmentResult, FocusedProfile } from '../onboarding';
import type { MatchResult } from '../matching/MatchingEngine';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ShareableResult {
  type: 'disc' | 'holland' | 'match' | 'profile';
  title: string;
  subtitle: string;
  badge: string;
  score?: number;
  highlights: string[];
  shareText: string;
  hashtags: string[];
}

export interface ShareImageData {
  title: string;
  subtitle: string;
  score?: number;
  scoreLabel?: string;
  primaryColor: string;
  secondaryColor: string;
  icon: string;
  highlights: string[];
  footer: string;
}

export interface ShareOptions {
  platform: 'twitter' | 'linkedin' | 'telegram' | 'whatsapp' | 'copy';
  includeLink?: boolean;
  customMessage?: string;
}

// ============================================
// CONSTANTS
// ============================================

const DISC_SHARE_DATA: Record<string, { emoji: string; color: string }> = {
  'result-oriented': { emoji: '🎯', color: '#ef4444' },
  'people-oriented': { emoji: '🤝', color: '#eab308' },
  'stable': { emoji: '🏛️', color: '#22c55e' },
  'precise': { emoji: '🔍', color: '#3b82f6' },
};

const HOLLAND_SHARE_DATA: Record<string, { emoji: string; color: string }> = {
  'practical': { emoji: '🔧', color: '#f97316' },
  'analytical': { emoji: '📊', color: '#6366f1' },
  'creative': { emoji: '🎨', color: '#ec4899' },
  'social': { emoji: '💬', color: '#14b8a6' },
  'enterprising': { emoji: '📈', color: '#f59e0b' },
  'conventional': { emoji: '📋', color: '#64748b' },
};

const DISC_LABELS: Record<string, string> = {
  'result-oriented': 'نتیجه‌محور',
  'people-oriented': 'ارتباط‌محور',
  'stable': 'پایدار',
  'precise': 'دقیق',
};

const HOLLAND_LABELS: Record<string, string> = {
  'practical': 'عملی / اجرایی',
  'analytical': 'تحلیلی / پژوهشی',
  'creative': 'خلاق / نوآور',
  'social': 'انسانی / آموزشی',
  'enterprising': 'مدیریتی / تجاری',
  'conventional': 'ساختارمند / دفتری',
};

const BASE_URL = 'https://karbarg.ir';

// ============================================
// SHARE TEXT GENERATORS
// ============================================

/**
 * Generate shareable content for DISC result
 */
export function generateDISCShareable(result: DISCAssessmentResult): ShareableResult {
  const data = DISC_SHARE_DATA[result.primary];
  const label = DISC_LABELS[result.primary];
  const secondaryLabel = result.secondary ? DISC_LABELS[result.secondary] : null;

  const highlights = [
    `سبک اصلی: ${label}`,
  ];
  if (secondaryLabel) {
    highlights.push(`سبک ثانویه: ${secondaryLabel}`);
  }

  const shareText = `${data.emoji} سبک رفتاری حرفه‌ای من: ${label}${secondaryLabel ? ` + ${secondaryLabel}` : ''}

این نتیجه از آزمون DISC در کاربرگ است.
شما هم پروفایل حرفه‌ای خود را بسازید!`;

  return {
    type: 'disc',
    title: label,
    subtitle: 'سبک رفتاری حرفه‌ای (DISC)',
    badge: 'DISC',
    highlights,
    shareText,
    hashtags: ['کاربرگ', 'DISC', 'سبک_کاری', 'توسعه_فردی'],
  };
}

/**
 * Generate shareable content for Holland result
 */
export function generateHollandShareable(result: HollandAssessmentResult): ShareableResult {
  const data = HOLLAND_SHARE_DATA[result.primary];
  const label = HOLLAND_LABELS[result.primary];
  const secondaryLabel = result.secondary ? HOLLAND_LABELS[result.secondary] : null;

  const highlights = [
    `مسیر اصلی: ${label}`,
  ];
  if (secondaryLabel) {
    highlights.push(`مسیر ثانویه: ${secondaryLabel}`);
  }

  const shareText = `${data.emoji} مسیر شغلی مناسب من: ${label}

این نتیجه از آزمون هالند (RIASEC) در کاربرگ است.
شما هم مسیر شغلی خود را کشف کنید!`;

  return {
    type: 'holland',
    title: label,
    subtitle: 'تناسب شغلی (Holland)',
    badge: 'Holland',
    highlights,
    shareText,
    hashtags: ['کاربرگ', 'Holland', 'مسیر_شغلی', 'کریر'],
  };
}

/**
 * Generate shareable content for Match result
 */
export function generateMatchShareable(result: MatchResult): ShareableResult {
  const emoji = result.overallScore >= 80 ? '🌟' : result.overallScore >= 60 ? '✅' : '📊';

  const highlights = [
    `امتیاز تطبیق: ${result.overallScore}%`,
    ...result.strengths.slice(0, 2),
  ];

  const shareText = `${emoji} تطبیق من با موقعیت "${result.jobTitle}": ${result.overallScore}%

${result.recommendation}

کاربرگ - پلتفرم حرفه‌ای متخصصان مالی`;

  return {
    type: 'match',
    title: result.jobTitle,
    subtitle: `امتیاز تطبیق: ${result.overallScore}%`,
    badge: `${result.overallScore}%`,
    score: result.overallScore,
    highlights,
    shareText,
    hashtags: ['کاربرگ', 'کاریابی', 'فرصت_شغلی'],
  };
}

/**
 * Generate shareable content for profile summary
 */
export function generateProfileShareable(profile: FocusedProfile): ShareableResult {
  const highlights: string[] = [];

  if (profile.recentExperience?.role) {
    highlights.push(profile.recentExperience.role);
  }
  if (profile.coreSkills && profile.coreSkills.length > 0) {
    highlights.push(`${profile.coreSkills.length} مهارت تخصصی`);
  }
  if (profile.assessments?.disc) {
    highlights.push(`DISC: ${DISC_LABELS[profile.assessments.disc.primary]}`);
  }
  if (profile.assessments?.holland) {
    highlights.push(`Holland: ${HOLLAND_LABELS[profile.assessments.holland.primary]}`);
  }

  const name = profile.fullName || 'کاربر کاربرگ';
  const shareText = `👤 پروفایل حرفه‌ای ${name}

${highlights.join(' • ')}

پروفایل کامل در کاربرگ:`;

  return {
    type: 'profile',
    title: name,
    subtitle: 'پروفایل حرفه‌ای',
    badge: 'کاربرگ',
    highlights,
    shareText,
    hashtags: ['کاربرگ', 'پروفایل_حرفه‌ای', 'مالی', 'حسابداری'],
  };
}

// ============================================
// SHARE IMAGE DATA
// ============================================

export function generateDISCImageData(result: DISCAssessmentResult): ShareImageData {
  const data = DISC_SHARE_DATA[result.primary];
  const label = DISC_LABELS[result.primary];

  return {
    title: label,
    subtitle: 'سبک رفتاری حرفه‌ای',
    primaryColor: data.color,
    secondaryColor: '#f8fafc',
    icon: data.emoji,
    highlights: [
      'آزمون DISC',
      result.secondary ? `+ ${DISC_LABELS[result.secondary]}` : '',
    ].filter(Boolean),
    footer: 'karbarg.ir',
  };
}

export function generateHollandImageData(result: HollandAssessmentResult): ShareImageData {
  const data = HOLLAND_SHARE_DATA[result.primary];
  const label = HOLLAND_LABELS[result.primary];

  return {
    title: label,
    subtitle: 'تناسب شغلی',
    primaryColor: data.color,
    secondaryColor: '#f8fafc',
    icon: data.emoji,
    highlights: [
      'آزمون هالند',
      result.secondary ? `+ ${HOLLAND_LABELS[result.secondary]}` : '',
    ].filter(Boolean),
    footer: 'karbarg.ir',
  };
}

// ============================================
// SHARE LINK GENERATORS
// ============================================

export function generateShareUrl(
  shareable: ShareableResult,
  options: ShareOptions
): string {
  const text = options.customMessage || shareable.shareText;
  const hashtags = shareable.hashtags.join(',');
  const url = options.includeLink ? `${BASE_URL}/u/profile` : '';

  switch (options.platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&hashtags=${encodeURIComponent(hashtags)}${url ? `&url=${encodeURIComponent(url)}` : ''}`;

    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url || BASE_URL)}&summary=${encodeURIComponent(text)}`;

    case 'telegram':
      return `https://t.me/share/url?url=${encodeURIComponent(url || BASE_URL)}&text=${encodeURIComponent(text)}`;

    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(text + (url ? `\n${url}` : ''))}`;

    case 'copy':
    default:
      return text + (url ? `\n${url}` : '');
  }
}

// ============================================
// COPY TO CLIPBOARD
// ============================================

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

// ============================================
// SHARE HANDLER
// ============================================

export async function shareResult(
  shareable: ShareableResult,
  options: ShareOptions
): Promise<{ success: boolean; message: string }> {
  if (options.platform === 'copy') {
    const text = generateShareUrl(shareable, options);
    const success = await copyToClipboard(text);
    return {
      success,
      message: success ? 'متن کپی شد!' : 'خطا در کپی کردن',
    };
  }

  const url = generateShareUrl(shareable, options);

  // Try native share API first (mobile)
  if (navigator.share && options.platform !== 'linkedin') {
    try {
      await navigator.share({
        title: shareable.title,
        text: shareable.shareText,
        url: options.includeLink ? `${BASE_URL}/u/profile` : undefined,
      });
      return { success: true, message: 'اشتراک‌گذاری شد!' };
    } catch {
      // User cancelled or not supported, fallback to URL
    }
  }

  // Open share URL in new window
  window.open(url, '_blank', 'width=600,height=400');
  return { success: true, message: 'پنجره اشتراک‌گذاری باز شد' };
}
