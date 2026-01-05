/**
 * Full Work Style Assessment - 48 Questions
 *
 * Comprehensive MBTI-based work style assessment
 * 12 questions per dimension for higher accuracy
 */

import type { Question, WorkStyleTrait } from './types';

export const fullQuestions: Question[] = [
  // ========================================
  // بُعد 1: پردازش اطلاعات (12 سوال)
  // Information Processing: Analytical vs Big-Picture
  // ========================================
  {
    id: 1,
    dimension: 'information-processing',
    text: 'هنگام بررسی یک گزارش مالی، ابتدا:',
    options: {
      a: { text: 'جزئیات اعداد را بررسی می‌کنم', trait: 'analytical' },
      b: { text: 'نتیجه کلی را درک می‌کنم', trait: 'big-picture' },
    },
  },
  {
    id: 2,
    dimension: 'information-processing',
    text: 'در مواجهه با اطلاعات جدید:',
    options: {
      a: { text: 'ترجیح می‌دهم مرحله‌به‌مرحله تحلیل کنم', trait: 'analytical' },
      b: { text: 'ابتدا چارچوب کلی را بفهمم', trait: 'big-picture' },
    },
  },
  {
    id: 3,
    dimension: 'information-processing',
    text: 'در تحلیل یک پروژه:',
    options: {
      a: { text: 'داده‌های خام برایم اولویت دارد', trait: 'analytical' },
      b: { text: 'اهداف و پیامدها مهم‌تر است', trait: 'big-picture' },
    },
  },
  {
    id: 4,
    dimension: 'information-processing',
    text: 'هنگام یادگیری یک مهارت جدید:',
    options: {
      a: { text: 'از مثال‌های دقیق شروع می‌کنم', trait: 'analytical' },
      b: { text: 'از مفهوم کلی آغاز می‌کنم', trait: 'big-picture' },
    },
  },
  {
    id: 5,
    dimension: 'information-processing',
    text: 'در جلسات تحلیلی:',
    options: {
      a: { text: 'روی جزئیات تمرکز می‌کنم', trait: 'analytical' },
      b: { text: 'روی جمع‌بندی تمرکز می‌کنم', trait: 'big-picture' },
    },
  },
  {
    id: 6,
    dimension: 'information-processing',
    text: 'اگر اطلاعات ناقص باشد:',
    options: {
      a: { text: 'صبر می‌کنم تا داده کامل شود', trait: 'analytical' },
      b: { text: 'با فرضیات جلو می‌روم', trait: 'big-picture' },
    },
  },
  {
    id: 7,
    dimension: 'information-processing',
    text: 'در حل مسئله:',
    options: {
      a: { text: 'تحلیل عمیق را ترجیح می‌دهم', trait: 'analytical' },
      b: { text: 'دید کلی را کافی می‌دانم', trait: 'big-picture' },
    },
  },
  {
    id: 8,
    dimension: 'information-processing',
    text: 'گزارش ایده‌آل برای شما:',
    options: {
      a: { text: 'دقیق و عدد‌محور', trait: 'analytical' },
      b: { text: 'خلاصه و نتیجه‌محور', trait: 'big-picture' },
    },
  },
  {
    id: 9,
    dimension: 'information-processing',
    text: 'در بررسی ریسک:',
    options: {
      a: { text: 'ریزجزئیات را بررسی می‌کنم', trait: 'analytical' },
      b: { text: 'سناریوی کلی را می‌سنجم', trait: 'big-picture' },
    },
  },
  {
    id: 10,
    dimension: 'information-processing',
    text: 'در تصمیم‌سازی:',
    options: {
      a: { text: 'شواهد را خط‌به‌خط می‌خوانم', trait: 'analytical' },
      b: { text: 'به الگوها نگاه می‌کنم', trait: 'big-picture' },
    },
  },
  {
    id: 11,
    dimension: 'information-processing',
    text: 'در ارائه:',
    options: {
      a: { text: 'اسلایدهای دقیق را ترجیح می‌دهم', trait: 'analytical' },
      b: { text: 'روایت کلی را ترجیح می‌دهم', trait: 'big-picture' },
    },
  },
  {
    id: 12,
    dimension: 'information-processing',
    text: 'تمرکز اصلی شما:',
    options: {
      a: { text: 'دقت', trait: 'analytical' },
      b: { text: 'جهت', trait: 'big-picture' },
    },
  },

  // ========================================
  // بُعد 2: تصمیم‌گیری (12 سوال)
  // Decision Making: Logical vs Value-Driven
  // ========================================
  {
    id: 13,
    dimension: 'decision-making',
    text: 'هنگام تصمیم مهم:',
    options: {
      a: { text: 'منطق و داده تعیین‌کننده است', trait: 'logical' },
      b: { text: 'تأثیر انسانی مهم‌تر است', trait: 'value-driven' },
    },
  },
  {
    id: 14,
    dimension: 'decision-making',
    text: 'در اختلاف نظر:',
    options: {
      a: { text: 'استدلال قوی‌تر را می‌پذیرم', trait: 'logical' },
      b: { text: 'احساس تیم را در نظر می‌گیرم', trait: 'value-driven' },
    },
  },
  {
    id: 15,
    dimension: 'decision-making',
    text: 'معیار تصمیم درست:',
    options: {
      a: { text: 'درست بودن منطقی', trait: 'logical' },
      b: { text: 'قابل‌قبول بودن انسانی', trait: 'value-driven' },
    },
  },
  {
    id: 16,
    dimension: 'decision-making',
    text: 'در مدیریت تعارض:',
    options: {
      a: { text: 'تحلیل مسئله', trait: 'logical' },
      b: { text: 'ایجاد همدلی', trait: 'value-driven' },
    },
  },
  {
    id: 17,
    dimension: 'decision-making',
    text: 'وقتی داده و حس در تضادند:',
    options: {
      a: { text: 'داده را ترجیح می‌دهم', trait: 'logical' },
      b: { text: 'حس را در نظر می‌گیرم', trait: 'value-driven' },
    },
  },
  {
    id: 18,
    dimension: 'decision-making',
    text: 'در بازخورد دادن:',
    options: {
      a: { text: 'صریح و مستقیم', trait: 'logical' },
      b: { text: 'ملایم و ملاحظه‌گر', trait: 'value-driven' },
    },
  },
  {
    id: 19,
    dimension: 'decision-making',
    text: 'تصمیم سریع یا درست؟',
    options: {
      a: { text: 'درست از نظر منطقی', trait: 'logical' },
      b: { text: 'درست از نظر انسانی', trait: 'value-driven' },
    },
  },
  {
    id: 20,
    dimension: 'decision-making',
    text: 'اگر تصمیم سخت باشد:',
    options: {
      a: { text: 'منطق کمکم می‌کند', trait: 'logical' },
      b: { text: 'ارزش‌ها راهنما هستند', trait: 'value-driven' },
    },
  },
  {
    id: 21,
    dimension: 'decision-making',
    text: 'در قضاوت عملکرد:',
    options: {
      a: { text: 'خروجی مهم است', trait: 'logical' },
      b: { text: 'تلاش و نیت مهم است', trait: 'value-driven' },
    },
  },
  {
    id: 22,
    dimension: 'decision-making',
    text: 'در مدیریت افراد:',
    options: {
      a: { text: 'عدالت منطقی', trait: 'logical' },
      b: { text: 'انعطاف انسانی', trait: 'value-driven' },
    },
  },
  {
    id: 23,
    dimension: 'decision-making',
    text: 'هنگام خطا:',
    options: {
      a: { text: 'اصلاح فرآیند', trait: 'logical' },
      b: { text: 'توجه به فرد', trait: 'value-driven' },
    },
  },
  {
    id: 24,
    dimension: 'decision-making',
    text: 'ترجیح شما:',
    options: {
      a: { text: 'تصمیم بی‌طرف', trait: 'logical' },
      b: { text: 'تصمیم همدلانه', trait: 'value-driven' },
    },
  },

  // ========================================
  // بُعد 3: سبک کار (12 سوال)
  // Work Structure: Structured vs Flexible
  // ========================================
  {
    id: 25,
    dimension: 'work-structure',
    text: 'محیط کاری ایده‌آل:',
    options: {
      a: { text: 'برنامه‌ریزی‌شده', trait: 'structured' },
      b: { text: 'منعطف', trait: 'flexible' },
    },
  },
  {
    id: 26,
    dimension: 'work-structure',
    text: 'شروع روز کاری:',
    options: {
      a: { text: 'با برنامه مشخص', trait: 'structured' },
      b: { text: 'با اولویت لحظه‌ای', trait: 'flexible' },
    },
  },
  {
    id: 27,
    dimension: 'work-structure',
    text: 'تغییر ناگهانی برنامه:',
    options: {
      a: { text: 'آزاردهنده است', trait: 'structured' },
      b: { text: 'طبیعی است', trait: 'flexible' },
    },
  },
  {
    id: 28,
    dimension: 'work-structure',
    text: 'پروژه موفق:',
    options: {
      a: { text: 'طبق برنامه جلو رفته', trait: 'structured' },
      b: { text: 'با تطبیق جلو رفته', trait: 'flexible' },
    },
  },
  {
    id: 29,
    dimension: 'work-structure',
    text: 'وظایف:',
    options: {
      a: { text: 'تعریف‌شده و مشخص', trait: 'structured' },
      b: { text: 'باز و قابل تغییر', trait: 'flexible' },
    },
  },
  {
    id: 30,
    dimension: 'work-structure',
    text: 'زمان‌بندی کار:',
    options: {
      a: { text: 'دقیق و از پیش تعیین‌شده', trait: 'structured' },
      b: { text: 'شناور و قابل تنظیم', trait: 'flexible' },
    },
  },
  {
    id: 31,
    dimension: 'work-structure',
    text: 'چارچوب‌های کاری:',
    options: {
      a: { text: 'کمک‌کننده هستند', trait: 'structured' },
      b: { text: 'محدودکننده هستند', trait: 'flexible' },
    },
  },
  {
    id: 32,
    dimension: 'work-structure',
    text: 'مستندسازی:',
    options: {
      a: { text: 'ضروری و کامل', trait: 'structured' },
      b: { text: 'حداقلی و در صورت نیاز', trait: 'flexible' },
    },
  },
  {
    id: 33,
    dimension: 'work-structure',
    text: 'در فشار کاری:',
    options: {
      a: { text: 'به برنامه برمی‌گردم', trait: 'structured' },
      b: { text: 'بداهه عمل می‌کنم', trait: 'flexible' },
    },
  },
  {
    id: 34,
    dimension: 'work-structure',
    text: 'مدیریت زمان:',
    options: {
      a: { text: 'با ابزار و سیستم', trait: 'structured' },
      b: { text: 'با تجربه و حس', trait: 'flexible' },
    },
  },
  {
    id: 35,
    dimension: 'work-structure',
    text: 'ترجیح شما:',
    options: {
      a: { text: 'نظم و پیش‌بینی‌پذیری', trait: 'structured' },
      b: { text: 'انعطاف و سازگاری', trait: 'flexible' },
    },
  },
  {
    id: 36,
    dimension: 'work-structure',
    text: 'کار خوب یعنی:',
    options: {
      a: { text: 'قابل پیش‌بینی', trait: 'structured' },
      b: { text: 'قابل تطبیق', trait: 'flexible' },
    },
  },

  // ========================================
  // بُعد 4: تعامل کاری (12 سوال)
  // Collaboration Style: Independent vs Team-Oriented
  // ========================================
  {
    id: 37,
    dimension: 'collaboration-style',
    text: 'کار مهم:',
    options: {
      a: { text: 'فردی بهتر پیش می‌رود', trait: 'independent' },
      b: { text: 'تیمی بهتر پیش می‌رود', trait: 'team-oriented' },
    },
  },
  {
    id: 38,
    dimension: 'collaboration-style',
    text: 'تمرکز بهتر:',
    options: {
      a: { text: 'در تنهایی', trait: 'independent' },
      b: { text: 'در تعامل', trait: 'team-oriented' },
    },
  },
  {
    id: 39,
    dimension: 'collaboration-style',
    text: 'جلسات کاری:',
    options: {
      a: { text: 'ضروری حداقلی', trait: 'independent' },
      b: { text: 'ضروری برای هم‌فکری', trait: 'team-oriented' },
    },
  },
  {
    id: 40,
    dimension: 'collaboration-style',
    text: 'مسئولیت:',
    options: {
      a: { text: 'مستقل و شخصی', trait: 'independent' },
      b: { text: 'مشترک و تیمی', trait: 'team-oriented' },
    },
  },
  {
    id: 41,
    dimension: 'collaboration-style',
    text: 'بازخورد گرفتن:',
    options: {
      a: { text: 'خصوصی', trait: 'independent' },
      b: { text: 'جمعی و باز', trait: 'team-oriented' },
    },
  },
  {
    id: 42,
    dimension: 'collaboration-style',
    text: 'تصمیم تیمی:',
    options: {
      a: { text: 'کندتر ولی جامع‌تر', trait: 'team-oriented' },
      b: { text: 'سریع‌تر ولی فردی', trait: 'independent' },
    },
  },
  {
    id: 43,
    dimension: 'collaboration-style',
    text: 'در تیم:',
    options: {
      a: { text: 'نقش مشخص و مستقل', trait: 'independent' },
      b: { text: 'نقش پویا و تعاملی', trait: 'team-oriented' },
    },
  },
  {
    id: 44,
    dimension: 'collaboration-style',
    text: 'اختلاف تیمی:',
    options: {
      a: { text: 'حل فردی سریع‌تر است', trait: 'independent' },
      b: { text: 'حل جمعی بهتر است', trait: 'team-oriented' },
    },
  },
  {
    id: 45,
    dimension: 'collaboration-style',
    text: 'انگیزه کاری:',
    options: {
      a: { text: 'دستاورد شخصی', trait: 'independent' },
      b: { text: 'موفقیت تیم', trait: 'team-oriented' },
    },
  },
  {
    id: 46,
    dimension: 'collaboration-style',
    text: 'ارتباط کاری:',
    options: {
      a: { text: 'هدفمند و ضروری', trait: 'independent' },
      b: { text: 'تعاملی و مستمر', trait: 'team-oriented' },
    },
  },
  {
    id: 47,
    dimension: 'collaboration-style',
    text: 'ترجیح شما:',
    options: {
      a: { text: 'استقلال کاری', trait: 'independent' },
      b: { text: 'همکاری و تعامل', trait: 'team-oriented' },
    },
  },
  {
    id: 48,
    dimension: 'collaboration-style',
    text: 'بهترین عملکرد شما:',
    options: {
      a: { text: 'وقتی تنها کار می‌کنید', trait: 'independent' },
      b: { text: 'وقتی با تیم هستید', trait: 'team-oriented' },
    },
  },
];
