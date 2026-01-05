/**
 * DISC Assessment Types
 *
 * DISC-based professional behavior assessment
 * Focus: Observable work behavior, not personality theory
 */

export type DISCDimension = 'D' | 'I' | 'S' | 'C';

export type DISCStyle =
  | 'result-oriented'   // D - نتیجه‌محور
  | 'people-oriented'   // I - ارتباط‌محور
  | 'stable'            // S - پایدار
  | 'precise';          // C - دقیق

export interface DISCQuestion {
  id: number;
  text: string;
  options: {
    D: string;
    I: string;
    S: string;
    C: string;
  };
}

export interface DISCAnswer {
  questionId: number;
  selectedDimension: DISCDimension;
}

export interface DISCResult {
  primary: DISCStyle;
  secondary?: DISCStyle;
  scores: Record<DISCDimension, number>;
  completedAt: string;
}

export interface DISCStyleInfo {
  label: string;           // Persian label
  description: string;     // One-line work context description
  fullDescription: string; // Full paragraph for result page
}

/**
 * Map DISC dimension to Persian work style label
 */
export const DISC_DIMENSION_MAP: Record<DISCDimension, DISCStyle> = {
  'D': 'result-oriented',
  'I': 'people-oriented',
  'S': 'stable',
  'C': 'precise',
};

/**
 * Static DISC style definitions with Persian labels
 */
export const DISC_STYLES: Record<DISCStyle, DISCStyleInfo> = {
  'result-oriented': {
    label: 'نتیجه‌محور',
    description: 'تمرکز بر سرعت، تصمیم‌گیری قاطع و دستیابی به اهداف',
    fullDescription: 'سبک غالب شما «نتیجه‌محور» است. شما به سرعت تصمیم می‌گیرید، هدف‌گرا هستید و در موقعیت‌های چالش‌برانگیز عملکرد خوبی دارید. در محیط‌های پویا و پروژه‌محور موفق‌ترید.',
  },
  'people-oriented': {
    label: 'ارتباط‌محور',
    description: 'تعامل اجتماعی قوی، متقاعدسازی و ایجاد انگیزه در تیم',
    fullDescription: 'سبک غالب شما «ارتباط‌محور» است. شما در تعامل با دیگران توانمند هستید، قادر به ایجاد انرژی مثبت در تیم و متقاعدسازی دیگران. در نقش‌های ارتباطی و تیمی موفق‌ترید.',
  },
  'stable': {
    label: 'پایدار',
    description: 'ثبات، قابلیت اعتماد و همکاری مداوم',
    fullDescription: 'سبک غالب شما «پایدار» است. شما به ثبات، نظم و همکاری اهمیت می‌دهید، قابل‌اعتماد هستید و در محیط‌های تیمی که به ثبات نیاز دارند، عملکرد عالی دارید.',
  },
  'precise': {
    label: 'دقیق',
    description: 'توجه به جزئیات، تحلیل دقیق و رعایت استانداردها',
    fullDescription: 'سبک غالب شما «دقیق» است. شما به کیفیت، استاندارد و تحلیل اهمیت می‌دهید. در نقش‌هایی که نیاز به دقت بالا، کنترل کیفیت یا تحلیل دارند، موفق‌ترید.',
  },
};

/**
 * Get DISC style info
 */
export function getDISCStyleInfo(style: DISCStyle): DISCStyleInfo {
  return DISC_STYLES[style];
}

/**
 * Check if a DISC style is valid
 */
export function isValidDISCStyle(style: string): style is DISCStyle {
  return style in DISC_STYLES;
}
