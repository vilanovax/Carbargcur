/**
 * Career Path Tasks - Detailed task definitions with Microcopy
 */

export type TaskType = "answer" | "vote" | "profile" | "case";
export type TaskStatus = "locked" | "pending" | "in_progress" | "completed";

export interface TaskMicrocopy {
  title: string;
  description: string;
  helper: string;
  cta: string;
  ctaIcon: string;
  pendingMessage: string;
  completedMessage: string;
  completionToast: {
    message: string;
    reward: string;
  };
}

export interface LevelTask {
  id: string;
  type: TaskType;
  microcopy: TaskMicrocopy;
  actionUrl?: string;
  validation?: {
    type: "qa_answer" | "qa_vote" | "profile_skill" | "case_submit";
    minCount?: number;
    category?: string;
  };
}

export interface CareerLevel {
  id: string;
  pathId: string;
  stepId: string; // maps to CareerPathStep.id
  levelNumber: number;
  title: string;
  goal: string;
  tasks: LevelTask[];
  completionReward: {
    reputation: number;
    badge?: string;
    unlocks: string[]; // next level IDs
  };
}

// Microcopy for reducing fear (shown randomly)
export const ENCOURAGEMENT_MESSAGES = [
  "اکثر تازه‌کارها از همین‌جا شروع می‌کنند",
  "پاسخ کوتاه هم کاملاً قابل قبول است",
  "هدف این مرحله یادگیری است، نه قضاوت",
  "هیچ‌کس حرفه‌ای شروع نکرده",
  "بیشتر تازه‌کارها این Level را در کمتر از ۲ روز کامل می‌کنند",
  "اگر مطمئن نیستی، توضیح ساده‌ی خودت را بنویس",
];

// Level definitions for Accounting Basics path
export const ACCOUNTING_LEVELS: CareerLevel[] = [
  {
    id: "acc-level-0",
    pathId: "accounting-basics",
    stepId: "acc-1",
    levelNumber: 0,
    title: "آشنایی و جهت‌یابی",
    goal: "درک کلی از حسابداری و فضای واقعی کار",
    tasks: [
      {
        id: "acc-0-1",
        type: "profile",
        microcopy: {
          title: "تکمیل سطح تجربه در پروفایل",
          description: "سطح تجربه و وضعیت شغلی خود را مشخص کنید تا مسیر متناسب با شما تنظیم شود.",
          helper: "این اطلاعات فقط برای پیشنهاد مسیر و فعالیت‌ها استفاده می‌شود.",
          cta: "تکمیل پروفایل",
          ctaIcon: "UserCog",
          pendingMessage: "با تکمیل این بخش، یک قدم جلوتر می‌روی.",
          completedMessage: "پروفایل شما به‌روزرسانی شد.",
          completionToast: {
            message: "پروفایل به‌روز شد",
            reward: "مسیر شخصی‌سازی شد",
          },
        },
        actionUrl: "/app/profile/edit",
        validation: {
          type: "profile_skill",
        },
      },
      {
        id: "acc-0-2",
        type: "vote",
        microcopy: {
          title: "مطالعه ۳ سؤال پرتکرار حسابداری",
          description: "با مرور سؤالات رایج، با فضای پرسش و پاسخ آشنا شوید.",
          helper: "فقط بخوانید و اگر پاسخی مفید بود، آن را تأیید کنید.",
          cta: "مشاهده سؤالات",
          ctaIcon: "Eye",
          pendingMessage: "با مشاهده سؤالات، فضای کار را می‌شناسی.",
          completedMessage: "آشنایی اولیه کامل شد.",
          completionToast: {
            message: "آشنایی با Q&A",
            reward: "+۲ اعتبار",
          },
        },
        actionUrl: "/app/qa?category=accounting&sort=popular",
        validation: {
          type: "qa_vote",
          minCount: 1,
          category: "accounting",
        },
      },
      {
        id: "acc-0-3",
        type: "vote",
        microcopy: {
          title: "ذخیره یک پاسخ نمونه",
          description: "یک پاسخ خوب را bookmark کنید تا بعداً به آن مراجعه کنید.",
          helper: "به دنبال پاسخ‌هایی باش که واضح و قابل فهم هستند.",
          cta: "ذخیره پاسخ",
          ctaIcon: "Bookmark",
          pendingMessage: "ذخیره پاسخ خوب، اولین قدم یادگیری است.",
          completedMessage: "پاسخ ذخیره شد.",
          completionToast: {
            message: "پاسخ ذخیره شد",
            reward: "می‌توانی بعداً مراجعه کنی",
          },
        },
        actionUrl: "/app/qa?category=accounting",
        validation: {
          type: "qa_vote",
          minCount: 1,
        },
      },
    ],
    completionReward: {
      reputation: 5,
      unlocks: ["acc-level-1"],
    },
  },
  {
    id: "acc-level-1",
    pathId: "accounting-basics",
    stepId: "acc-1",
    levelNumber: 1,
    title: "مبانی حسابداری",
    goal: "یادگیری زبان حسابداری و انجام اولین فعالیت‌های عملی",
    tasks: [
      {
        id: "acc-1-1",
        type: "answer",
        microcopy: {
          title: "پاسخ به یک سؤال ساده حسابداری",
          description: "حتی یک پاسخ کوتاه هم قابل قبول است. هدف این مرحله، شروع مشارکت و تمرین مفاهیم پایه است.",
          helper: "اگر مطمئن نیستی، توضیح ساده‌ی خودت را بنویس. کیفیت در مراحل بعدی مهم‌تر می‌شود.",
          cta: "نوشتن پاسخ",
          ctaIcon: "PenLine",
          pendingMessage: "اولین پاسخ شما، مسیر رشدتان را فعال می‌کند.",
          completedMessage: "پاسخ شما ثبت شد و در پیشرفت این مسیر حساب شد.",
          completionToast: {
            message: "اولین پاسخ شما ثبت شد",
            reward: "+۵ اعتبار تخصصی",
          },
        },
        actionUrl: "/app/qa?category=accounting&unanswered=true",
        validation: {
          type: "qa_answer",
          minCount: 1,
          category: "accounting",
        },
      },
      {
        id: "acc-1-2",
        type: "vote",
        microcopy: {
          title: "بررسی و تأیید یک پاسخ دیگر",
          description: "یک پاسخ خوب را تأیید کن یا اگر نکته‌ای دارد، آن را اصلاح کن. این کار نشان می‌دهد مفاهیم پایه را درک کرده‌ای.",
          helper: "به دنبال پاسخ‌هایی باش که واضح و قابل فهم هستند.",
          cta: "مشاهده پاسخ‌های پیشنهادی",
          ctaIcon: "Eye",
          pendingMessage: "با بررسی یک پاسخ، این مرحله کامل می‌شود.",
          completedMessage: "نظر شما ثبت شد و به پیشرفت مسیر کمک کرد.",
          completionToast: {
            message: "بررسی شما ثبت شد",
            reward: "درک مفاهیم پایه تأیید شد",
          },
        },
        actionUrl: "/app/qa?category=accounting",
        validation: {
          type: "qa_vote",
          minCount: 1,
          category: "accounting",
        },
      },
      {
        id: "acc-1-3",
        type: "profile",
        microcopy: {
          title: "تکمیل مهارت‌های پایه حسابداری",
          description: "مهارت‌های پایه حسابداری را در پروفایل خود مشخص کن تا مسیر رشدتان دقیق‌تر تنظیم شود.",
          helper: "این اطلاعات فقط برای پیشنهاد مسیر و فعالیت‌ها استفاده می‌شود.",
          cta: "تکمیل پروفایل",
          ctaIcon: "UserCog",
          pendingMessage: "با تکمیل این بخش، یک قدم جلوتر می‌روی.",
          completedMessage: "پروفایل شما به‌روزرسانی شد.",
          completionToast: {
            message: "مهارت‌های پایه ثبت شد",
            reward: "پیشنهادهای بهتری دریافت می‌کنی",
          },
        },
        actionUrl: "/app/profile/edit",
        validation: {
          type: "profile_skill",
        },
      },
    ],
    completionReward: {
      reputation: 10,
      badge: "Accounting Basics",
      unlocks: ["acc-level-2"],
    },
  },
  {
    id: "acc-level-2",
    pathId: "accounting-basics",
    stepId: "acc-2",
    levelNumber: 2,
    title: "کاربرد عملی",
    goal: "حل مسائل واقعی حسابداری و تولید پاسخ‌های با کیفیت",
    tasks: [
      {
        id: "acc-2-1",
        type: "answer",
        microcopy: {
          title: "پاسخ تحلیلی به یک سؤال حسابداری",
          description: "یک پاسخ کامل و تحلیلی بنویسید که مفاهیم را توضیح دهد.",
          helper: "تمرکز روی توضیح «چرا» مهم‌تر از «چه» است.",
          cta: "نوشتن پاسخ تحلیلی",
          ctaIcon: "FileText",
          pendingMessage: "پاسخ تحلیلی، نشان‌دهنده درک عمیق شماست.",
          completedMessage: "پاسخ تحلیلی شما ثبت شد.",
          completionToast: {
            message: "پاسخ تحلیلی ثبت شد",
            reward: "+۱۰ اعتبار تخصصی",
          },
        },
        actionUrl: "/app/qa?category=accounting",
        validation: {
          type: "qa_answer",
          minCount: 1,
          category: "accounting",
        },
      },
      {
        id: "acc-2-2",
        type: "answer",
        microcopy: {
          title: "پاسخ به سؤال بدون پاسخ",
          description: "یک سؤال بدون پاسخ پیدا کن و اولین پاسخ را بنویس.",
          helper: "پاسخ اول همیشه ارزشمندتر است.",
          cta: "یافتن سؤال بدون پاسخ",
          ctaIcon: "Search",
          pendingMessage: "پاسخ اول به سؤالات، اعتبار بیشتری می‌آورد.",
          completedMessage: "شما اولین پاسخ‌دهنده بودید!",
          completionToast: {
            message: "اولین پاسخ‌دهنده",
            reward: "+۱۵ اعتبار تخصصی",
          },
        },
        actionUrl: "/app/qa?category=accounting&unanswered=true",
        validation: {
          type: "qa_answer",
          minCount: 1,
          category: "accounting",
        },
      },
      {
        id: "acc-2-3",
        type: "vote",
        microcopy: {
          title: "کمک به بهبود یک پاسخ",
          description: "یک پاسخ را که می‌تواند بهتر شود پیدا کن و نظر یا اصلاح پیشنهاد بده.",
          helper: "نقد سازنده، نشانه تخصص است.",
          cta: "یافتن پاسخ قابل بهبود",
          ctaIcon: "MessageSquarePlus",
          pendingMessage: "کمک به بهبود پاسخ‌ها، تخصص شما را نشان می‌دهد.",
          completedMessage: "نظر سازنده شما ثبت شد.",
          completionToast: {
            message: "نظر سازنده ثبت شد",
            reward: "+۵ اعتبار",
          },
        },
        actionUrl: "/app/qa?category=accounting",
        validation: {
          type: "qa_vote",
          minCount: 1,
        },
      },
    ],
    completionReward: {
      reputation: 15,
      badge: "Accounting Practitioner",
      unlocks: ["acc-level-3"],
    },
  },
  {
    id: "acc-level-3",
    pathId: "accounting-basics",
    stepId: "acc-3",
    levelNumber: 3,
    title: "تسلط حرفه‌ای",
    goal: "حل مسئله و تولید پاسخ مرجع",
    tasks: [
      {
        id: "acc-3-1",
        type: "answer",
        microcopy: {
          title: "نوشتن پاسخ مرجع",
          description: "یک پاسخ جامع بنویسید که بتواند به عنوان مرجع استفاده شود.",
          helper: "پاسخ مرجع شامل توضیح، مثال و منابع است.",
          cta: "نوشتن پاسخ مرجع",
          ctaIcon: "BookOpen",
          pendingMessage: "پاسخ مرجع، اعتبار دائمی می‌آورد.",
          completedMessage: "پاسخ مرجع شما ثبت شد.",
          completionToast: {
            message: "پاسخ مرجع ثبت شد",
            reward: "+۲۵ اعتبار تخصصی",
          },
        },
        actionUrl: "/app/qa?category=accounting",
        validation: {
          type: "qa_answer",
          minCount: 1,
          category: "accounting",
        },
      },
      {
        id: "acc-3-2",
        type: "case",
        microcopy: {
          title: "حل یک سناریوی واقعی حسابداری",
          description: "یک مسئله واقعی را تحلیل کن و راه‌حل پیشنهادی‌ات را بنویس.",
          helper: "تمرکز روی منطق تصمیم‌گیری مهم‌تر از جواب نهایی است.",
          cta: "مشاهده سناریو",
          ctaIcon: "Briefcase",
          pendingMessage: "با حل این Case، وارد سطح حرفه‌ای می‌شوی.",
          completedMessage: "سناریوی شما بررسی و تأیید شد.",
          completionToast: {
            message: "Case تأیید شد",
            reward: "آمادگی حرفه‌ای شما ثبت شد",
          },
        },
        actionUrl: "/app/qa/ask",
        validation: {
          type: "case_submit",
          minCount: 1,
        },
      },
    ],
    completionReward: {
      reputation: 25,
      badge: "Accounting Professional",
      unlocks: ["acc-level-4"],
    },
  },
  {
    id: "acc-level-4",
    pathId: "accounting-basics",
    stepId: "acc-5",
    levelNumber: 4,
    title: "آمادگی بازار کار",
    goal: "نمایش توانمندی حرفه‌ای و آمادگی برای فرصت‌های شغلی",
    tasks: [
      {
        id: "acc-4-1",
        type: "profile",
        microcopy: {
          title: "تکمیل پروفایل حرفه‌ای",
          description: "پروفایل خود را کامل کنید تا برای کارفرمایان قابل مشاهده باشد.",
          helper: "پروفایل کامل، شانس دیده‌شدن را افزایش می‌دهد.",
          cta: "تکمیل پروفایل",
          ctaIcon: "UserCheck",
          pendingMessage: "پروفایل کامل، اولین قدم جذب فرصت شغلی است.",
          completedMessage: "پروفایل شما آماده نمایش است.",
          completionToast: {
            message: "پروفایل کامل شد",
            reward: "آماده جذب فرصت شغلی",
          },
        },
        actionUrl: "/app/profile",
        validation: {
          type: "profile_skill",
        },
      },
      {
        id: "acc-4-2",
        type: "answer",
        microcopy: {
          title: "کسب ۳ پاسخ پذیرفته‌شده",
          description: "پاسخ‌هایی بنویسید که توسط سؤال‌کننده به عنوان بهترین پاسخ انتخاب شوند.",
          helper: "پاسخ‌های پذیرفته‌شده، نشان‌دهنده تخصص واقعی هستند.",
          cta: "مشاهده سؤالات",
          ctaIcon: "Target",
          pendingMessage: "پاسخ پذیرفته‌شده، تأیید تخصص شماست.",
          completedMessage: "شما ۳ پاسخ پذیرفته‌شده کسب کردید!",
          completionToast: {
            message: "۳ پاسخ پذیرفته‌شده",
            reward: "تخصص شما تأیید شد",
          },
        },
        actionUrl: "/app/qa?category=accounting",
        validation: {
          type: "qa_answer",
          minCount: 3,
          category: "accounting",
        },
      },
    ],
    completionReward: {
      reputation: 50,
      badge: "Job Ready Accountant",
      unlocks: [],
    },
  },
];

// Helper to get levels for a path
export function getLevelsForPath(pathId: string): CareerLevel[] {
  if (pathId === "accounting-basics") {
    return ACCOUNTING_LEVELS;
  }
  // TODO: Add other paths
  return [];
}

// Helper to get a specific level
export function getLevelById(levelId: string): CareerLevel | undefined {
  return ACCOUNTING_LEVELS.find((l) => l.id === levelId);
}

// Get random encouragement message
export function getRandomEncouragement(): string {
  return ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
}
