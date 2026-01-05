/**
 * Combined Interpretation Logic
 *
 * Generate meaningful insights by combining MBTI Work Style and DISC behavior
 */

import type { Dimension } from './types';
import type { DISCDimension } from './disc-types';

export type QualitativeLevel = 'low' | 'medium' | 'high';

interface MBTIProfile {
  scores: Record<Dimension, number>; // 0-100
}

interface DISCProfile {
  scores: Record<DISCDimension, number>; // 0-16
}

interface NormalizedProfile {
  mbti: Record<Dimension, QualitativeLevel>;
  disc: Record<DISCDimension, QualitativeLevel>;
}

/**
 * Normalize MBTI scores (0-100) to qualitative levels
 */
function normalizeMBTIScore(score: number): QualitativeLevel {
  if (score <= 33) return 'low';
  if (score <= 66) return 'medium';
  return 'high';
}

/**
 * Normalize DISC scores (0-16) to qualitative levels
 */
function normalizeDISCScore(score: number): QualitativeLevel {
  if (score <= 5) return 'low';
  if (score <= 10) return 'medium';
  return 'high';
}

/**
 * Normalize both profiles
 */
export function normalizeProfiles(
  mbti: MBTIProfile,
  disc: DISCProfile
): NormalizedProfile {
  return {
    mbti: {
      'information-processing': normalizeMBTIScore(mbti.scores['information-processing']),
      'decision-making': normalizeMBTIScore(mbti.scores['decision-making']),
      'work-structure': normalizeMBTIScore(mbti.scores['work-structure']),
      'collaboration-style': normalizeMBTIScore(mbti.scores['collaboration-style']),
    },
    disc: {
      D: normalizeDISCScore(disc.scores.D),
      I: normalizeDISCScore(disc.scores.I),
      S: normalizeDISCScore(disc.scores.S),
      C: normalizeDISCScore(disc.scores.C),
    },
  };
}

/**
 * Generate combined interpretation based on normalized profiles
 */
export function generateCombinedInterpretation(profile: NormalizedProfile): string {
  const { mbti, disc } = profile;

  // Pattern 1: Analytical + Precise (Data-driven perfectionist)
  if (
    mbti['information-processing'] === 'high' &&
    mbti['work-structure'] === 'high' &&
    disc.C === 'high'
  ) {
    return 'ترکیب تحلیل دقیق و رعایت استانداردها نقطه قوت برجسته شماست. در نقش‌هایی که به دقت بالا، کنترل کیفیت یا تحلیل سیستماتیک نیاز دارند، عملکرد استثنایی خواهید داشت.';
  }

  // Pattern 2: Result-oriented leader (Fast decision maker)
  if (
    mbti['decision-making'] === 'high' &&
    disc.D === 'high' &&
    mbti['collaboration-style'] === 'low'
  ) {
    return 'شما یک تصمیم‌گیرنده سریع و نتیجه‌محور هستید که به‌طور مستقل کار می‌کنید. در نقش‌های رهبری، مدیریت پروژه و موقعیت‌های چالش‌برانگیز که نیاز به قاطعیت دارند، موفق‌ترید.';
  }

  // Pattern 3: Team-oriented communicator (People person)
  if (
    mbti['collaboration-style'] === 'high' &&
    disc.I === 'high' &&
    disc.S === 'high'
  ) {
    return 'ترکیب همکاری تیمی و ارتباطات قوی شما را در نقش‌های تیمی، هماهنگی پروژه و ارتباط با ذینفعان موفق می‌کند. قابلیت ایجاد فضای مثبت و پایدار نقطه قوت شماست.';
  }

  // Pattern 4: Balanced structured worker (Reliable professional)
  if (
    mbti['work-structure'] === 'high' &&
    disc.S === 'high' &&
    disc.C === 'medium'
  ) {
    return 'شما یک متخصص قابل‌اعتماد هستید که به ثبات، نظم و کیفیت اهمیت می‌دهید. در محیط‌های سازمان‌یافته و نقش‌هایی که نیاز به تداوم و دقت دارند، عملکرد عالی خواهید داشت.';
  }

  // Pattern 5: Strategic influencer (Big picture + people)
  if (
    mbti['information-processing'] === 'low' && // Big picture thinker
    mbti['decision-making'] === 'high' &&
    disc.I === 'high'
  ) {
    return 'شما یک استراتژیست با دید کلان و توانایی تأثیرگذاری بر دیگران هستید. در نقش‌های مشاوره‌ای، توسعه کسب‌وکار و ارتباط با مشتریان موفق‌ترید.';
  }

  // Pattern 6: Analytical team player
  if (
    mbti['information-processing'] === 'high' &&
    mbti['collaboration-style'] === 'high' &&
    disc.S === 'high'
  ) {
    return 'ترکیب تحلیل دقیق و همکاری تیمی به شما امکان می‌دهد در پروژه‌های پیچیده که نیاز به کار گروهی دارند، نقش کلیدی داشته باشید. قابلیت حل مسئله در تیم نقطه قوت شماست.';
  }

  // Pattern 7: Flexible problem solver
  if (
    mbti['work-structure'] === 'low' && // Flexible
    disc.D === 'high' &&
    mbti['information-processing'] === 'high'
  ) {
    return 'انعطاف‌پذیری همراه با تحلیل و قاطعیت شما را در محیط‌های پویا و استارتاپی که نیاز به حل سریع مسئله دارند، موفق می‌کند.';
  }

  // Pattern 8: Relationship builder (People + Stable)
  if (
    disc.I === 'high' &&
    disc.S === 'high' &&
    mbti['collaboration-style'] === 'high'
  ) {
    return 'توانایی برقراری ارتباط قوی و ایجاد ثبات در تیم نقطه قوت شماست. در نقش‌های مدیریت تیم، منابع انسانی و خدمات مشتری عملکرد فوق‌العاده‌ای خواهید داشت.';
  }

  // Generic fallback based on highest dimensions
  const highMBTI: string[] = [];
  const highDISC: string[] = [];

  if (mbti['information-processing'] === 'high') highMBTI.push('تحلیل دقیق');
  if (mbti['decision-making'] === 'high') highMBTI.push('تصمیم‌گیری قوی');
  if (mbti['work-structure'] === 'high') highMBTI.push('سازمان‌دهی');
  if (mbti['collaboration-style'] === 'high') highMBTI.push('همکاری تیمی');

  if (disc.D === 'high') highDISC.push('نتیجه‌گرایی');
  if (disc.I === 'high') highDISC.push('ارتباطات قوی');
  if (disc.S === 'high') highDISC.push('ثبات و پایداری');
  if (disc.C === 'high') highDISC.push('دقت و کیفیت');

  const strengths = [...highMBTI, ...highDISC];

  if (strengths.length > 0) {
    return `ترکیب ${strengths.slice(0, 3).join('، ')} نقاط قوت برجسته شماست. این ویژگی‌ها به شما امکان می‌دهد در نقش‌های متنوعی موفق باشید.`;
  }

  return 'سبک کاری و رفتار حرفه‌ای شما متعادل است و می‌توانید در محیط‌های مختلف عملکرد مناسبی داشته باشید.';
}

/**
 * Get success contexts based on combined profile
 */
export function getSuccessContexts(profile: NormalizedProfile): string[] {
  const { mbti, disc } = profile;
  const contexts: string[] = [];

  // High precision + structured
  if (mbti['work-structure'] === 'high' && disc.C === 'high') {
    contexts.push('محیط‌های ساختارمند و استانداردمحور');
  }

  // Result-oriented
  if (disc.D === 'high') {
    contexts.push('پروژه‌های چالش‌برانگیز با اهداف مشخص');
  }

  // People-oriented
  if (mbti['collaboration-style'] === 'high' && disc.I === 'high') {
    contexts.push('نقش‌های تیمی و ارتباطی');
  }

  // Analytical
  if (mbti['information-processing'] === 'high') {
    contexts.push('وظایف تحلیلی و داده‌محور');
  }

  // Stable
  if (disc.S === 'high') {
    contexts.push('محیط‌های پایدار با فرآیندهای مشخص');
  }

  return contexts.slice(0, 3); // Max 3 contexts
}
