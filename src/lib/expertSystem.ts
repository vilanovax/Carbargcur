/**
 * Expert Level & Badge System Configuration
 * سیستم سطح تخصص و نشان‌ها
 */

// ==========================
// EXPERT LEVELS
// ==========================

export interface ExpertLevel {
  code: string;
  titleFa: string;
  titleEn: string;
  minScore: number;
  description: string;
  color: string;
}

export const EXPERT_LEVELS: ExpertLevel[] = [
  {
    code: "newcomer",
    titleFa: "تازه‌وارد",
    titleEn: "Newcomer",
    minScore: 0,
    description: "تازه به جامعه متخصصان پیوسته‌اید",
    color: "slate",
  },
  {
    code: "contributor",
    titleFa: "مشارکت‌کننده",
    titleEn: "Contributor",
    minScore: 5,
    description: "شروع به مشارکت در پاسخ‌دهی کرده‌اید",
    color: "blue",
  },
  {
    code: "specialist",
    titleFa: "متخصص",
    titleEn: "Specialist",
    minScore: 20,
    description: "پاسخ‌های شما مورد توجه قرار گرفته‌اند",
    color: "green",
  },
  {
    code: "senior",
    titleFa: "متخصص ارشد",
    titleEn: "Senior Specialist",
    minScore: 60,
    description: "پاسخ‌های متخصصانه متعددی ارائه داده‌اید",
    color: "purple",
  },
  {
    code: "expert",
    titleFa: "خبره",
    titleEn: "Expert",
    minScore: 150,
    description: "یکی از خبرگان فعال جامعه هستید",
    color: "amber",
  },
  {
    code: "top_expert",
    titleFa: "خبره برتر",
    titleEn: "Top Expert",
    minScore: 300,
    description: "از برترین متخصصان فعال در پلتفرم",
    color: "rose",
  },
];

/**
 * Calculate expert score based on user stats
 * فرمول: TotalAnswers×1 + HelpfulReactions×2 + ExpertReactions×4 + FeaturedAnswers×5
 */
export function calculateExpertScore(stats: {
  totalAnswers: number;
  helpfulReactions: number;
  expertReactions: number;
  featuredAnswers: number;
}): number {
  return (
    stats.totalAnswers * 1 +
    stats.helpfulReactions * 2 +
    stats.expertReactions * 4 +
    stats.featuredAnswers * 5
  );
}

/**
 * Get expert level based on score
 */
export function getExpertLevel(score: number): ExpertLevel {
  // Sort by minScore descending and find the first level where score >= minScore
  const sortedLevels = [...EXPERT_LEVELS].sort((a, b) => b.minScore - a.minScore);
  return sortedLevels.find((level) => score >= level.minScore) || EXPERT_LEVELS[0];
}

/**
 * Get next level info (for progress display)
 */
export function getNextLevel(currentScore: number): { level: ExpertLevel; pointsNeeded: number } | null {
  const currentLevel = getExpertLevel(currentScore);
  const currentIndex = EXPERT_LEVELS.findIndex((l) => l.code === currentLevel.code);

  if (currentIndex >= EXPERT_LEVELS.length - 1) {
    return null; // Already at top level
  }

  const nextLevel = EXPERT_LEVELS[currentIndex + 1];
  return {
    level: nextLevel,
    pointsNeeded: nextLevel.minScore - currentScore,
  };
}

// ==========================
// BADGE DEFINITIONS
// ==========================

export interface BadgeDefinition {
  code: string;
  titleFa: string;
  titleEn: string;
  description: string;
  icon: string;
  category: "participation" | "quality" | "domain";
  threshold?: number;
  isManual: boolean;
}

// Participation Badges - نشان‌های مشارکت
export const PARTICIPATION_BADGES: BadgeDefinition[] = [
  {
    code: "ACTIVE_RESPONDER",
    titleFa: "پاسخ‌دهنده فعال",
    titleEn: "Active Responder",
    description: "۵ پاسخ تخصصی ثبت کرده‌اید",
    icon: "🟢",
    category: "participation",
    threshold: 5,
    isManual: false,
  },
  {
    code: "CONSISTENT_CONTRIBUTOR",
    titleFa: "مشارکت مستمر",
    titleEn: "Consistent Contributor",
    description: "۱۰ پاسخ تخصصی ثبت کرده‌اید",
    icon: "🔵",
    category: "participation",
    threshold: 10,
    isManual: false,
  },
  {
    code: "PROFESSIONAL_CONTRIBUTOR",
    titleFa: "مشارکت حرفه‌ای",
    titleEn: "Professional Contributor",
    description: "۲۵ پاسخ تخصصی ثبت کرده‌اید",
    icon: "🟣",
    category: "participation",
    threshold: 25,
    isManual: false,
  },
];

// Quality Badges - نشان‌های کیفیت
export const QUALITY_BADGES: BadgeDefinition[] = [
  {
    code: "HELPFUL_ANSWERS",
    titleFa: "پاسخ مفید",
    titleEn: "Helpful Answers",
    description: "۵ واکنش «مفید» از کاربران دریافت کرده‌اید",
    icon: "👍",
    category: "quality",
    threshold: 5,
    isManual: false,
  },
  {
    code: "EXPERT_ANSWERS",
    titleFa: "پاسخ متخصصانه",
    titleEn: "Expert Answers",
    description: "۳ واکنش «متخصصانه» از کاربران دریافت کرده‌اید",
    icon: "🏅",
    category: "quality",
    threshold: 3,
    isManual: false,
  },
  {
    code: "FEATURED_ANSWER",
    titleFa: "پاسخ منتخب",
    titleEn: "Featured Answer",
    description: "پاسخ شما توسط تیم کاربرگ برگزیده شده است",
    icon: "🌟",
    category: "quality",
    threshold: 1,
    isManual: true, // Admin awards this
  },
];

// Domain Badges - نشان‌های حوزه تخصص
export const DOMAIN_BADGES: BadgeDefinition[] = [
  {
    code: "TAX_EXPERT",
    titleFa: "متخصص مالیاتی",
    titleEn: "Tax Expert",
    description: "۵ پاسخ متخصصانه در حوزه مالیات",
    icon: "💼",
    category: "domain",
    threshold: 5,
    isManual: false,
  },
  {
    code: "ACCOUNTING_EXPERT",
    titleFa: "متخصص حسابداری",
    titleEn: "Accounting Expert",
    description: "۵ پاسخ متخصصانه در حوزه حسابداری",
    icon: "📊",
    category: "domain",
    threshold: 5,
    isManual: false,
  },
  {
    code: "INSURANCE_EXPERT",
    titleFa: "متخصص بیمه",
    titleEn: "Insurance Expert",
    description: "۵ پاسخ متخصصانه در حوزه بیمه",
    icon: "🛡️",
    category: "domain",
    threshold: 5,
    isManual: false,
  },
  {
    code: "FINANCE_EXPERT",
    titleFa: "متخصص مالی",
    titleEn: "Finance Expert",
    description: "۵ پاسخ متخصصانه در حوزه مالی",
    icon: "💰",
    category: "domain",
    threshold: 5,
    isManual: false,
  },
  {
    code: "INVESTMENT_EXPERT",
    titleFa: "متخصص سرمایه‌گذاری",
    titleEn: "Investment Expert",
    description: "۵ پاسخ متخصصانه در حوزه سرمایه‌گذاری",
    icon: "📈",
    category: "domain",
    threshold: 5,
    isManual: false,
  },
  {
    code: "VERIFIED_EXPERT",
    titleFa: "متخصص تأیید شده",
    titleEn: "Verified Expert",
    description: "هویت و تخصص شما توسط تیم کاربرگ تأیید شده است",
    icon: "✅",
    category: "domain",
    threshold: undefined,
    isManual: true, // Admin only
  },
];

// All badges combined
export const ALL_BADGES: BadgeDefinition[] = [
  ...PARTICIPATION_BADGES,
  ...QUALITY_BADGES,
  ...DOMAIN_BADGES,
];

/**
 * Get badge definition by code
 */
export function getBadgeByCode(code: string): BadgeDefinition | undefined {
  return ALL_BADGES.find((b) => b.code === code);
}

/**
 * Check which badges user qualifies for (participation & quality)
 */
export function checkEligibleBadges(stats: {
  totalAnswers: number;
  helpfulReactions: number;
  expertReactions: number;
  featuredAnswers: number;
}): string[] {
  const eligible: string[] = [];

  // Check participation badges
  if (stats.totalAnswers >= 5) eligible.push("ACTIVE_RESPONDER");
  if (stats.totalAnswers >= 10) eligible.push("CONSISTENT_CONTRIBUTOR");
  if (stats.totalAnswers >= 25) eligible.push("PROFESSIONAL_CONTRIBUTOR");

  // Check quality badges
  if (stats.helpfulReactions >= 5) eligible.push("HELPFUL_ANSWERS");
  if (stats.expertReactions >= 3) eligible.push("EXPERT_ANSWERS");
  if (stats.featuredAnswers >= 1) eligible.push("FEATURED_ANSWER");

  return eligible;
}

/**
 * Check domain badges based on category expertise
 */
export function checkDomainBadges(domainStats: {
  category: string;
  expertAnswers: number;
}[]): string[] {
  const eligible: string[] = [];

  const categoryToBadge: Record<string, string> = {
    tax: "TAX_EXPERT",
    accounting: "ACCOUNTING_EXPERT",
    insurance: "INSURANCE_EXPERT",
    finance: "FINANCE_EXPERT",
    investment: "INVESTMENT_EXPERT",
  };

  for (const stat of domainStats) {
    if (stat.expertAnswers >= 5) {
      const badgeCode = categoryToBadge[stat.category];
      if (badgeCode) {
        eligible.push(badgeCode);
      }
    }
  }

  return eligible;
}

// ==========================
// LEVEL COLORS FOR UI
// ==========================

export const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  newcomer: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
  contributor: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  specialist: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  senior: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  expert: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  top_expert: { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
};
