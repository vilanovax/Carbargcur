/**
 * Career Paths Data Structure
 * Defines available career paths for users to follow
 */

export interface CareerPathStep {
  id: string;
  title: string;
  description: string;
  skills: string[];
  estimatedWeeks: number;
  resources?: {
    type: "article" | "video" | "course" | "qa";
    title: string;
    url?: string;
  }[];
}

export interface CareerPath {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string; // lucide icon name
  color: string; // tailwind color
  targetAudience: "beginner" | "intermediate" | "advanced" | "all";
  estimatedMonths: number;
  steps: CareerPathStep[];
  outcomes: string[];
  relatedCategories: string[]; // Q&A categories
  isActive: boolean;
}

// Career paths data
export const CAREER_PATHS: CareerPath[] = [
  {
    id: "accounting-basics",
    slug: "accounting-basics",
    title: "حسابداری پایه تا حرفه‌ای",
    subtitle: "از مفاهیم اولیه تا آمادگی بازار کار",
    description:
      "این مسیر برای افرادی طراحی شده که می‌خواهند از صفر وارد حرفه حسابداری شوند. از اصول اولیه حسابداری شروع کرده و تا سطح آمادگی برای بازار کار پیش می‌روید.",
    icon: "Calculator",
    color: "blue",
    targetAudience: "beginner",
    estimatedMonths: 6,
    steps: [
      {
        id: "acc-1",
        title: "اصول و مبانی حسابداری",
        description: "آشنایی با مفاهیم پایه حسابداری، معادله حسابداری و انواع حساب‌ها",
        skills: ["معادله حسابداری", "ثبت رویدادهای مالی", "دفتر روزنامه"],
        estimatedWeeks: 4,
      },
      {
        id: "acc-2",
        title: "سیستم‌های حسابداری",
        description: "یادگیری سیستم‌های دستی و نرم‌افزاری حسابداری",
        skills: ["نرم‌افزار حسابداری", "ثبت اسناد", "گزارش‌گیری"],
        estimatedWeeks: 4,
      },
      {
        id: "acc-3",
        title: "صورت‌های مالی",
        description: "تهیه و تحلیل صورت‌های مالی اساسی",
        skills: ["ترازنامه", "صورت سود و زیان", "صورت جریان وجوه نقد"],
        estimatedWeeks: 4,
      },
      {
        id: "acc-4",
        title: "حسابداری صنعتی مقدماتی",
        description: "آشنایی با هزینه‌یابی و حسابداری صنعتی",
        skills: ["هزینه‌یابی", "بودجه‌بندی", "کنترل هزینه"],
        estimatedWeeks: 4,
      },
      {
        id: "acc-5",
        title: "آماده‌سازی برای بازار کار",
        description: "رزومه‌سازی، مصاحبه و ورود به بازار کار",
        skills: ["رزومه حرفه‌ای", "مصاحبه شغلی", "شبکه‌سازی"],
        estimatedWeeks: 2,
      },
    ],
    outcomes: [
      "توانایی ثبت و پردازش رویدادهای مالی",
      "کار با نرم‌افزارهای حسابداری",
      "تهیه صورت‌های مالی پایه",
      "آمادگی برای موقعیت‌های شغلی سطح ورودی",
    ],
    relatedCategories: ["accounting"],
    isActive: true,
  },
  {
    id: "tax-consultant",
    slug: "tax-consultant",
    title: "مالیات (از صفر تا مشاور)",
    subtitle: "مسیر تبدیل شدن به مشاور مالیاتی",
    description:
      "این مسیر شما را از آشنایی با قوانین مالیاتی تا تبدیل شدن به یک مشاور مالیاتی حرفه‌ای راهنمایی می‌کند.",
    icon: "Receipt",
    color: "green",
    targetAudience: "intermediate",
    estimatedMonths: 8,
    steps: [
      {
        id: "tax-1",
        title: "مبانی قانون مالیات‌ها",
        description: "آشنایی با قوانین مالیات مستقیم و غیرمستقیم",
        skills: ["مالیات بر درآمد", "مالیات بر ارزش افزوده", "قوانین مالیاتی"],
        estimatedWeeks: 4,
      },
      {
        id: "tax-2",
        title: "مالیات اشخاص حقیقی",
        description: "محاسبه و اظهارنامه مالیاتی اشخاص حقیقی",
        skills: ["مالیات مشاغل", "اظهارنامه مالیاتی", "معافیت‌ها"],
        estimatedWeeks: 4,
      },
      {
        id: "tax-3",
        title: "مالیات اشخاص حقوقی",
        description: "مالیات شرکت‌ها و موسسات",
        skills: ["مالیات شرکت‌ها", "هزینه‌های قابل قبول", "استهلاک"],
        estimatedWeeks: 6,
      },
      {
        id: "tax-4",
        title: "رسیدگی و اعتراض مالیاتی",
        description: "فرآیند رسیدگی و نحوه اعتراض به برگ تشخیص",
        skills: ["رسیدگی مالیاتی", "اعتراض", "هیئت حل اختلاف"],
        estimatedWeeks: 4,
      },
      {
        id: "tax-5",
        title: "مشاوره مالیاتی حرفه‌ای",
        description: "مهارت‌های مشاوره و برنامه‌ریزی مالیاتی",
        skills: ["برنامه‌ریزی مالیاتی", "مشاوره", "بهینه‌سازی مالیاتی"],
        estimatedWeeks: 4,
      },
    ],
    outcomes: [
      "تسلط بر قوانین مالیاتی ایران",
      "توانایی تهیه اظهارنامه مالیاتی",
      "مهارت در اعتراض به برگ تشخیص",
      "آمادگی برای فعالیت به عنوان مشاور مالیاتی",
    ],
    relatedCategories: ["tax"],
    isActive: true,
  },
  {
    id: "insurance-risk",
    slug: "insurance-risk",
    title: "بیمه و مدیریت ریسک",
    subtitle: "متخصص بیمه و ارزیابی ریسک",
    description:
      "از مفاهیم پایه بیمه تا تحلیل و مدیریت ریسک‌های مالی سازمان‌ها.",
    icon: "Shield",
    color: "purple",
    targetAudience: "beginner",
    estimatedMonths: 5,
    steps: [
      {
        id: "ins-1",
        title: "مبانی بیمه",
        description: "آشنایی با انواع بیمه و اصول بیمه‌گری",
        skills: ["انواع بیمه", "قراردادهای بیمه", "اصول بیمه‌گری"],
        estimatedWeeks: 3,
      },
      {
        id: "ins-2",
        title: "بیمه‌های اجتماعی و درمان",
        description: "بیمه تامین اجتماعی و بیمه درمان",
        skills: ["تامین اجتماعی", "بیمه درمان", "بازنشستگی"],
        estimatedWeeks: 3,
      },
      {
        id: "ins-3",
        title: "بیمه‌های بازرگانی",
        description: "بیمه‌های مسئولیت، اموال و حمل‌ونقل",
        skills: ["بیمه مسئولیت", "بیمه اموال", "بیمه باربری"],
        estimatedWeeks: 4,
      },
      {
        id: "ins-4",
        title: "مدیریت ریسک",
        description: "شناسایی، ارزیابی و مدیریت ریسک‌های مالی",
        skills: ["شناسایی ریسک", "ارزیابی ریسک", "کنترل ریسک"],
        estimatedWeeks: 4,
      },
    ],
    outcomes: [
      "درک کامل انواع بیمه‌ها",
      "توانایی مشاوره بیمه‌ای",
      "مهارت در شناسایی و مدیریت ریسک",
      "آمادگی برای فعالیت در صنعت بیمه",
    ],
    relatedCategories: ["insurance"],
    isActive: true,
  },
  {
    id: "corporate-finance",
    slug: "corporate-finance",
    title: "مالی شرکت‌ها",
    subtitle: "تحلیلگر و مدیر مالی",
    description:
      "مسیر تبدیل شدن به یک متخصص مالی شرکتی، از تحلیل مالی تا مدیریت سرمایه.",
    icon: "TrendingUp",
    color: "amber",
    targetAudience: "intermediate",
    estimatedMonths: 7,
    steps: [
      {
        id: "fin-1",
        title: "تحلیل صورت‌های مالی",
        description: "تحلیل عمیق صورت‌های مالی و نسبت‌های مالی",
        skills: ["نسبت‌های مالی", "تحلیل افقی و عمودی", "ارزیابی عملکرد"],
        estimatedWeeks: 4,
      },
      {
        id: "fin-2",
        title: "مدیریت سرمایه در گردش",
        description: "مدیریت نقدینگی، موجودی و مطالبات",
        skills: ["مدیریت نقدینگی", "مدیریت موجودی", "مدیریت مطالبات"],
        estimatedWeeks: 4,
      },
      {
        id: "fin-3",
        title: "تامین مالی و ساختار سرمایه",
        description: "روش‌های تامین مالی و بهینه‌سازی ساختار سرمایه",
        skills: ["تامین مالی", "ساختار سرمایه", "هزینه سرمایه"],
        estimatedWeeks: 4,
      },
      {
        id: "fin-4",
        title: "ارزش‌گذاری و سرمایه‌گذاری",
        description: "ارزش‌گذاری دارایی‌ها و ارزیابی پروژه‌های سرمایه‌ای",
        skills: ["ارزش‌گذاری", "NPV و IRR", "تحلیل حساسیت"],
        estimatedWeeks: 6,
      },
      {
        id: "fin-5",
        title: "برنامه‌ریزی و کنترل مالی",
        description: "بودجه‌بندی، پیش‌بینی و کنترل مالی",
        skills: ["بودجه‌بندی", "پیش‌بینی مالی", "کنترل بودجه"],
        estimatedWeeks: 4,
      },
    ],
    outcomes: [
      "تحلیل حرفه‌ای صورت‌های مالی",
      "مدیریت بهینه منابع مالی",
      "ارزیابی پروژه‌های سرمایه‌گذاری",
      "آمادگی برای نقش تحلیلگر/مدیر مالی",
    ],
    relatedCategories: ["finance"],
    isActive: true,
  },
  {
    id: "auditing",
    slug: "auditing",
    title: "حسابرسی",
    subtitle: "از کمک حسابرس تا حسابرس ارشد",
    description:
      "مسیر حرفه‌ای در حسابرسی، از اصول اولیه تا حسابرسی مستقل.",
    icon: "ClipboardCheck",
    color: "indigo",
    targetAudience: "intermediate",
    estimatedMonths: 9,
    steps: [
      {
        id: "aud-1",
        title: "مبانی حسابرسی",
        description: "آشنایی با اصول و استانداردهای حسابرسی",
        skills: ["استانداردهای حسابرسی", "اصول حسابرسی", "اخلاق حرفه‌ای"],
        estimatedWeeks: 4,
      },
      {
        id: "aud-2",
        title: "فرآیند حسابرسی",
        description: "برنامه‌ریزی، اجرا و گزارش‌دهی حسابرسی",
        skills: ["برنامه‌ریزی حسابرسی", "آزمون‌های محتوا", "نمونه‌گیری"],
        estimatedWeeks: 6,
      },
      {
        id: "aud-3",
        title: "حسابرسی حساب‌های اصلی",
        description: "حسابرسی دارایی‌ها، بدهی‌ها و حقوق صاحبان سهام",
        skills: ["حسابرسی موجودی", "حسابرسی مطالبات", "حسابرسی دارایی ثابت"],
        estimatedWeeks: 6,
      },
      {
        id: "aud-4",
        title: "کنترل‌های داخلی",
        description: "ارزیابی سیستم کنترل داخلی",
        skills: ["ارزیابی کنترل", "شناسایی ضعف", "پیشنهاد بهبود"],
        estimatedWeeks: 4,
      },
      {
        id: "aud-5",
        title: "گزارش حسابرسی",
        description: "تهیه گزارش حسابرسی و اظهارنظر",
        skills: ["انواع اظهارنظر", "نکات گزارش", "نامه مدیریت"],
        estimatedWeeks: 4,
      },
    ],
    outcomes: [
      "درک کامل فرآیند حسابرسی",
      "توانایی اجرای آزمون‌های حسابرسی",
      "ارزیابی کنترل‌های داخلی",
      "آمادگی برای نقش کمک حسابرس و بالاتر",
    ],
    relatedCategories: ["accounting"],
    isActive: true,
  },
];

// Helper functions
export function getCareerPathBySlug(slug: string): CareerPath | undefined {
  return CAREER_PATHS.find((path) => path.slug === slug);
}

export function getActiveCareerPaths(): CareerPath[] {
  return CAREER_PATHS.filter((path) => path.isActive);
}

export function getCareerPathsByAudience(
  audience: "beginner" | "intermediate" | "advanced"
): CareerPath[] {
  return CAREER_PATHS.filter(
    (path) => path.isActive && (path.targetAudience === audience || path.targetAudience === "all")
  );
}

export function getCareerPathRecommendations(
  experienceLevel: string,
  skills: string[]
): CareerPath[] {
  const paths = getActiveCareerPaths();

  // Simple recommendation logic
  if (experienceLevel === "entry" || experienceLevel === "junior") {
    return paths.filter((p) => p.targetAudience === "beginner");
  }

  // For experienced users, recommend based on skills match
  return paths.sort((a, b) => {
    const aMatch = a.steps.reduce((count, step) => {
      return count + step.skills.filter((s) => skills.includes(s)).length;
    }, 0);
    const bMatch = b.steps.reduce((count, step) => {
      return count + step.skills.filter((s) => skills.includes(s)).length;
    }, 0);
    return bMatch - aMatch;
  });
}

// Target audience labels
export const TARGET_AUDIENCE_LABELS: Record<string, { label: string; icon: string }> = {
  beginner: { label: "مناسب تازه‌کار", icon: "🔰" },
  intermediate: { label: "نیاز به پیش‌زمینه", icon: "🟢" },
  advanced: { label: "سطح پیشرفته", icon: "🔴" },
  all: { label: "همه سطوح", icon: "🌐" },
};

// Color mappings for Tailwind
export const PATH_COLORS: Record<string, { bg: string; text: string; border: string; light: string }> = {
  blue: {
    bg: "bg-blue-500",
    text: "text-blue-600",
    border: "border-blue-200",
    light: "bg-blue-50",
  },
  green: {
    bg: "bg-green-500",
    text: "text-green-600",
    border: "border-green-200",
    light: "bg-green-50",
  },
  purple: {
    bg: "bg-purple-500",
    text: "text-purple-600",
    border: "border-purple-200",
    light: "bg-purple-50",
  },
  amber: {
    bg: "bg-amber-500",
    text: "text-amber-600",
    border: "border-amber-200",
    light: "bg-amber-50",
  },
  indigo: {
    bg: "bg-indigo-500",
    text: "text-indigo-600",
    border: "border-indigo-200",
    light: "bg-indigo-50",
  },
};
