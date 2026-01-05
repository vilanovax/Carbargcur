import type { Question, TraitInfo } from './types';

/**
 * 12 questions for Work Style Assessment
 * 3 questions per dimension
 */
export const questions: Question[] = [
  // Dimension 1: Information Processing (Q1-Q3)
  {
    id: 1,
    dimension: 'information-processing',
    text: 'در شروع یک مسئله کاری، ترجیح می‌دهید:',
    options: {
      a: {
        text: 'بررسی دقیق داده‌ها و جزئیات',
        trait: 'analytical',
      },
      b: {
        text: 'درک تصویر کلی و هدف نهایی',
        trait: 'big-picture',
      },
    },
  },
  {
    id: 2,
    dimension: 'information-processing',
    text: 'در گزارش‌های مالی، بیشتر به چه چیزی توجه می‌کنید؟',
    options: {
      a: {
        text: 'اعداد، روندها و جزئیات',
        trait: 'analytical',
      },
      b: {
        text: 'جمع‌بندی و نتیجه کلی',
        trait: 'big-picture',
      },
    },
  },
  {
    id: 3,
    dimension: 'information-processing',
    text: 'در تحلیل یک موضوع جدید:',
    options: {
      a: {
        text: 'قدم‌به‌قدم جلو می‌روم',
        trait: 'analytical',
      },
      b: {
        text: 'ابتدا چارچوب کلی را مشخص می‌کنم',
        trait: 'big-picture',
      },
    },
  },

  // Dimension 2: Decision Making (Q4-Q6)
  {
    id: 4,
    dimension: 'decision-making',
    text: 'برای تصمیم‌گیری کاری بیشتر به چه چیزی تکیه می‌کنید؟',
    options: {
      a: {
        text: 'منطق و تحلیل',
        trait: 'logical',
      },
      b: {
        text: 'تأثیر تصمیم بر افراد',
        trait: 'value-driven',
      },
    },
  },
  {
    id: 5,
    dimension: 'decision-making',
    text: 'وقتی با یک تصمیم سخت روبه‌رو هستید:',
    options: {
      a: {
        text: 'به داده‌ها و شواهد رجوع می‌کنم',
        trait: 'logical',
      },
      b: {
        text: 'به ارزش‌ها و پیامدهای انسانی فکر می‌کنم',
        trait: 'value-driven',
      },
    },
  },
  {
    id: 6,
    dimension: 'decision-making',
    text: 'در اختلاف نظرهای کاری:',
    options: {
      a: {
        text: 'استدلال منطقی را ترجیح می‌دهم',
        trait: 'logical',
      },
      b: {
        text: 'حفظ رابطه و هماهنگی را مهم‌تر می‌دانم',
        trait: 'value-driven',
      },
    },
  },

  // Dimension 3: Work Structure (Q7-Q9)
  {
    id: 7,
    dimension: 'work-structure',
    text: 'در محیط کاری ترجیح می‌دهید:',
    options: {
      a: {
        text: 'برنامه و چارچوب مشخص داشته باشید',
        trait: 'structured',
      },
      b: {
        text: 'انعطاف و آزادی عمل بیشتر',
        trait: 'flexible',
      },
    },
  },
  {
    id: 8,
    dimension: 'work-structure',
    text: 'در انجام وظایف:',
    options: {
      a: {
        text: 'طبق برنامه و زمان‌بندی جلو می‌روم',
        trait: 'structured',
      },
      b: {
        text: 'بسته به شرایط تصمیم می‌گیرم',
        trait: 'flexible',
      },
    },
  },
  {
    id: 9,
    dimension: 'work-structure',
    text: 'وقتی برنامه تغییر می‌کند:',
    options: {
      a: {
        text: 'ترجیح می‌دهم از قبل اطلاع داشته باشم',
        trait: 'structured',
      },
      b: {
        text: 'به‌راحتی خودم را تطبیق می‌دهم',
        trait: 'flexible',
      },
    },
  },

  // Dimension 4: Collaboration Style (Q10-Q12)
  {
    id: 10,
    dimension: 'collaboration-style',
    text: 'برای انجام کارهای مهم:',
    options: {
      a: {
        text: 'تمرکز فردی را ترجیح می‌دهم',
        trait: 'independent',
      },
      b: {
        text: 'کار تیمی را مؤثرتر می‌دانم',
        trait: 'team-oriented',
      },
    },
  },
  {
    id: 11,
    dimension: 'collaboration-style',
    text: 'در جلسات کاری:',
    options: {
      a: {
        text: 'بیشتر شنونده و تحلیل‌گر هستم',
        trait: 'independent',
      },
      b: {
        text: 'فعالانه مشارکت و تبادل نظر می‌کنم',
        trait: 'team-oriented',
      },
    },
  },
  {
    id: 12,
    dimension: 'collaboration-style',
    text: 'وقتی مسئولیت جدیدی دارید:',
    options: {
      a: {
        text: 'ترجیح می‌دهم مستقل عمل کنم',
        trait: 'independent',
      },
      b: {
        text: 'همکاری با دیگران را ترجیح می‌دهم',
        trait: 'team-oriented',
      },
    },
  },
];

/**
 * Static trait information
 */
export const traitInfo: Record<string, TraitInfo> = {
  analytical: {
    title: 'تحلیلی',
    description: 'متمرکز بر داده، جزئیات و تحلیل منطقی',
    dimension: 'information-processing',
  },
  'big-picture': {
    title: 'کل‌نگر',
    description: 'تمرکز بر اهداف کلی و تصویر بزرگ',
    dimension: 'information-processing',
  },
  logical: {
    title: 'منطقی',
    description: 'تصمیم‌گیری مبتنی بر منطق و شواهد',
    dimension: 'decision-making',
  },
  'value-driven': {
    title: 'ارزشی',
    description: 'توجه به تأثیر تصمیم‌ها بر افراد',
    dimension: 'decision-making',
  },
  structured: {
    title: 'ساختارمند',
    description: 'عملکرد بهتر در چارچوب‌های مشخص',
    dimension: 'work-structure',
  },
  flexible: {
    title: 'منعطف',
    description: 'سازگار با تغییر و شرایط متنوع',
    dimension: 'work-structure',
  },
  independent: {
    title: 'مستقل',
    description: 'تمرکز بالا در انجام فردی کارها',
    dimension: 'collaboration-style',
  },
  'team-oriented': {
    title: 'تیمی',
    description: 'موفق در همکاری و کار گروهی',
    dimension: 'collaboration-style',
  },
};
