/**
 * Comprehensive Holland Career Fit Assessment Types
 *
 * Extends the basic Holland assessment with:
 * - Tertiary dimension
 * - Career cluster mapping
 * - Job role suggestions
 */

import type { HollandCareerFit, HollandDimension } from './holland-types';

export interface HollandFullResult {
  primary: HollandCareerFit;
  secondary: HollandCareerFit;
  tertiary: HollandCareerFit;
  scores: Record<HollandDimension, number>;
  cluster: string;
  clusterDescription: string;
  roles: string[];
  completedAt: string;
}

export interface CareerCluster {
  name: string;
  description: string;
  roles: string[];
}

/**
 * Career cluster mapping based on Holland dimension combinations
 * Focused on finance, accounting, insurance, and business roles
 */
export const CAREER_CLUSTERS: Record<string, CareerCluster> = {
  // Analytical + Conventional
  'analytical-conventional': {
    name: 'تحلیل و کنترل مالی',
    description: 'شما در نقش‌هایی که نیاز به تحلیل دقیق داده‌های مالی و رعایت استانداردها دارند، موفق خواهید بود.',
    roles: [
      'تحلیلگر مالی',
      'حسابدار ارشد',
      'کارشناس کنترل داخلی',
      'حسابرس مالی',
      'تحلیلگر ریسک مالی',
    ],
  },

  // Analytical + Enterprising
  'analytical-enterprising': {
    name: 'استراتژی و مدیریت مالی',
    description: 'شما در نقش‌های استراتژیک که نیاز به تحلیل و تصمیم‌گیری مدیریتی دارند، عملکرد عالی خواهید داشت.',
    roles: [
      'مدیر مالی (CFO)',
      'تحلیلگر استراتژی مالی',
      'مشاور مالی',
      'مدیر برنامه‌ریزی مالی',
      'سرپرست بودجه‌ریزی',
    ],
  },

  // Social + Enterprising
  'social-enterprising': {
    name: 'مدیریت منابع انسانی و بیمه',
    description: 'شما در نقش‌هایی که ترکیبی از ارتباط با مردم و مدیریت کسب‌وکار است، موفق‌ترید.',
    roles: [
      'کارشناس منابع انسانی',
      'کارشناس بیمه عمر',
      'مشاور بیمه',
      'مدیر استخدام',
      'کارشناس جبران خدمات',
    ],
  },

  // Conventional + Practical
  'conventional-practical': {
    name: 'حسابداری و عملیات مالی',
    description: 'شما در نقش‌های اجرایی که نیاز به دقت، نظم و پیگیری دارند، عملکرد بهتری دارید.',
    roles: [
      'حسابدار',
      'کارشناس حسابداری صنعتی',
      'کارشناس دفترداری',
      'مسئول حسابداری معین',
      'کارشناس حقوق و دستمزد',
    ],
  },

  // Enterprising + Conventional
  'enterprising-conventional': {
    name: 'مدیریت عملیات و پروژه',
    description: 'شما در نقش‌های مدیریتی که نیاز به سازماندهی و نظم دارند، موفق خواهید بود.',
    roles: [
      'مدیر عملیات مالی',
      'مدیر پروژه مالی',
      'سرپرست حسابداری',
      'مدیر خزانه‌داری',
      'کارشناس ارشد بودجه',
    ],
  },

  // Analytical + Creative
  'analytical-creative': {
    name: 'فین‌تک و نوآوری مالی',
    description: 'شما در حوزه‌های نوین مالی که تحلیل و خلاقیت را ترکیب می‌کنند، موفق‌ترید.',
    roles: [
      'تحلیلگر داده مالی',
      'کارشناس مدل‌سازی مالی',
      'متخصص فین‌تک',
      'تحلیلگر کسب‌وکار',
      'طراح محصولات مالی',
    ],
  },

  // Social + Analytical
  'social-analytical': {
    name: 'مشاوره و آموزش مالی',
    description: 'شما در نقش‌هایی که تحلیل را با ارتباط انسانی ترکیب می‌کنند، عملکرد بهتری دارید.',
    roles: [
      'مشاور مالی شخصی',
      'مدرس حسابداری و مالیه',
      'کارشناس آموزش مالی',
      'مشاور سرمایه‌گذاری',
      'تحلیلگر اعتباری',
    ],
  },

  // Creative + Enterprising
  'creative-enterprising': {
    name: 'توسعه کسب‌وکار و بازاریابی',
    description: 'شما در نقش‌های کارآفرینانه که نیاز به خلاقیت در کسب‌وکار دارند، موفق خواهید بود.',
    roles: [
      'مدیر توسعه کسب‌وکار',
      'کارشناس بازاریابی خدمات مالی',
      'مشاور استارتاپ‌های مالی',
      'کارشناس فروش محصولات مالی',
      'مدیر روابط با مشتریان',
    ],
  },

  // Conventional + Social
  'conventional-social': {
    name: 'خدمات مشتریان و پشتیبانی',
    description: 'شما در نقش‌هایی که نظم را با خدمات به مشتری ترکیب می‌کنند، موفق‌ترید.',
    roles: [
      'کارشناس خدمات مشتریان بانکی',
      'کارشناس پشتیبانی بیمه',
      'متصدی امور مشتریان',
      'کارشناس ارتباط با مشتری',
      'کارشناس پردازش تسهیلات',
    ],
  },

  // Practical + Analytical
  'practical-analytical': {
    name: 'حسابرسی و تضمین کیفیت',
    description: 'شما در نقش‌هایی که نیاز به بررسی عملی و تحلیل دقیق دارند، عملکرد بهتری دارید.',
    roles: [
      'حسابرس داخلی',
      'حسابرس مستقل',
      'کارشناس تضمین کیفیت مالی',
      'بازرس مالی',
      'کارشناس انطباق (Compliance)',
    ],
  },

  // Enterprising + Analytical
  'enterprising-analytical': {
    name: 'سرمایه‌گذاری و تحلیل بازار',
    description: 'شما در نقش‌های تحلیلی-مدیریتی بازار سرمایه موفق خواهید بود.',
    roles: [
      'تحلیلگر سرمایه‌گذاری',
      'تحلیلگر بازار سرمایه',
      'مدیر پورتفولیو',
      'کارشناس ارزش‌گذاری',
      'تحلیلگر بنیادی',
    ],
  },

  // Creative + Social
  'creative-social': {
    name: 'محتوا و آموزش خلاق',
    description: 'شما در نقش‌هایی که خلاقیت را با تعامل انسانی ترکیب می‌کنند، موفق‌ترید.',
    roles: [
      'طراح محتوای مالی',
      'مدرس نوآور حسابداری',
      'کارشناس آموزش و توسعه',
      'تولیدکننده محتوای آموزشی مالی',
      'مشاور تغییر سازمانی',
    ],
  },

  // Default fallback
  'default': {
    name: 'نقش‌های مالی عمومی',
    description: 'بر اساس ترکیب علایق شما، می‌توانید در نقش‌های متنوع مالی و حسابداری موفق باشید.',
    roles: [
      'کارشناس مالی',
      'حسابدار',
      'کارشناس بودجه',
      'کارشناس حسابرسی',
      'تحلیلگر مالی',
    ],
  },
};

/**
 * Get career cluster based on primary and secondary Holland dimensions
 */
export function getCareerCluster(
  primary: HollandCareerFit,
  secondary: HollandCareerFit
): CareerCluster {
  const key = `${primary}-${secondary}`;
  const reverseKey = `${secondary}-${primary}`;

  return CAREER_CLUSTERS[key] || CAREER_CLUSTERS[reverseKey] || CAREER_CLUSTERS['default'];
}
