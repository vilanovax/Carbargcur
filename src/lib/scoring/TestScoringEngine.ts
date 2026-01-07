/**
 * Test Scoring Engine
 *
 * A scalable and explainable scoring system for:
 * - MBTI (Work Style Assessment)
 * - DISC (Professional Behavior)
 * - Holland (RIASEC Career Fit)
 *
 * Architecture:
 * - Input: Test type + answers
 * - Output: Standardized result with scores, labels, and explanations
 * - Deterministic, explainable, and unit-test friendly
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export type TestType = 'MBTI' | 'DISC' | 'HOLLAND';

// MBTI Types
export type MBTIDimension = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
export type MBTIPair = 'EI' | 'SN' | 'TF' | 'JP';

// DISC Types
export type DISCDimension = 'D' | 'I' | 'S' | 'C';

// Holland Types
export type HollandDimension = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

// Generic Answer Input
export interface TestAnswer {
  questionId: string;
  scoreMap: Record<string, number>;
}

// Scoring Input
export interface ScoringInput {
  testType: TestType;
  answers: TestAnswer[];
}

// ============================================
// RESULT TYPES
// ============================================

export interface MBTIResultPayload {
  dimensions: Record<MBTIDimension, number>;
  pairs: Record<MBTIPair, MBTIDimension>;
  confidence: number;
  dominant: MBTIDimension[];
}

export interface DISCResultPayload {
  scores: Record<DISCDimension, number>;
  primary: DISCDimension;
  secondary: DISCDimension | null;
  normalized: Record<DISCDimension, number>;
}

export interface HollandResultPayload {
  scores: Record<HollandDimension, number>;
  top: [HollandDimension, HollandDimension, HollandDimension];
  normalized: Record<HollandDimension, number>;
}

export interface ScoringResult {
  testType: TestType;
  resultCode: string;
  resultLabel: string;
  resultPayload: MBTIResultPayload | DISCResultPayload | HollandResultPayload;
  profileStrengthBonus: number;
  completedAt: string;
}

// ============================================
// PERSIAN LABELS
// ============================================

const MBTI_LABELS: Record<string, string> = {
  INTJ: 'استراتژیست',
  INTP: 'متفکر منطقی',
  ENTJ: 'فرمانده',
  ENTP: 'مناظره‌گر',
  INFJ: 'مشاور',
  INFP: 'ایده‌آل‌گرا',
  ENFJ: 'رهبر کاریزماتیک',
  ENFP: 'مشوق',
  ISTJ: 'بازرس',
  ISFJ: 'محافظ',
  ESTJ: 'مدیر اجرایی',
  ESFJ: 'تسهیل‌گر',
  ISTP: 'مکانیک',
  ISFP: 'هنرمند',
  ESTP: 'کارآفرین',
  ESFP: 'مجری',
};

const DISC_LABELS: Record<DISCDimension, string> = {
  D: 'نتیجه‌محور',
  I: 'ارتباط‌محور',
  S: 'پایدار',
  C: 'دقیق',
};

const DISC_COMBINED_LABELS: Record<string, string> = {
  DI: 'رهبر تأثیرگذار',
  DC: 'مدیر دقیق',
  DS: 'رهبر پایدار',
  ID: 'مذاکره‌کننده قدرتمند',
  IS: 'ارتباط‌گر صبور',
  IC: 'تحلیل‌گر اجتماعی',
  SD: 'مجری قابل‌اعتماد',
  SI: 'همکار دوست‌داشتنی',
  SC: 'متخصص دقیق',
  CD: 'استراتژیست دقیق',
  CI: 'تحلیل‌گر متقاعدکننده',
  CS: 'کارشناس پایدار',
};

const HOLLAND_LABELS: Record<HollandDimension, string> = {
  R: 'عملی / اجرایی',
  I: 'تحلیلی / پژوهشی',
  A: 'خلاق / نوآور',
  S: 'انسانی / آموزشی',
  E: 'مدیریتی / تجاری',
  C: 'ساختارمند / دفتری',
};

// ============================================
// SCORING FUNCTIONS
// ============================================

/**
 * Aggregate scores from answers
 */
function aggregateScores<T extends string>(
  answers: TestAnswer[],
  dimensions: T[]
): Record<T, number> {
  const scores = {} as Record<T, number>;

  // Initialize all dimensions to 0
  dimensions.forEach(dim => {
    scores[dim] = 0;
  });

  // Sum scores from answers
  answers.forEach(answer => {
    Object.entries(answer.scoreMap).forEach(([dim, score]) => {
      if (dim in scores) {
        scores[dim as T] += score;
      }
    });
  });

  return scores;
}

/**
 * Normalize scores to percentages (0-100)
 */
function normalizeScores<T extends string>(
  scores: Record<T, number>
): Record<T, number> {
  const total = Object.values(scores).reduce((sum, val) => sum + (val as number), 0);
  if (total === 0) return scores;

  const normalized = {} as Record<T, number>;
  Object.entries(scores).forEach(([dim, score]) => {
    normalized[dim as T] = Math.round(((score as number) / total) * 100);
  });

  return normalized;
}

/**
 * Get sorted dimensions by score (descending)
 */
function getSortedDimensions<T extends string>(
  scores: Record<T, number>
): T[] {
  return (Object.keys(scores) as T[]).sort((a, b) => scores[b] - scores[a]);
}

// ============================================
// MBTI SCORER
// ============================================

function scoreMBTI(answers: TestAnswer[]): ScoringResult {
  const dimensions: MBTIDimension[] = ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'];
  const scores = aggregateScores(answers, dimensions);

  // Resolve pairs
  const pairs: Record<MBTIPair, MBTIDimension> = {
    EI: scores.E >= scores.I ? 'E' : 'I',
    SN: scores.S >= scores.N ? 'S' : 'N',
    TF: scores.T >= scores.F ? 'T' : 'F',
    JP: scores.J >= scores.P ? 'J' : 'P',
  };

  // Calculate confidence (average margin of each pair)
  const pairConfidences = [
    Math.abs(scores.E - scores.I) / Math.max(scores.E + scores.I, 1),
    Math.abs(scores.S - scores.N) / Math.max(scores.S + scores.N, 1),
    Math.abs(scores.T - scores.F) / Math.max(scores.T + scores.F, 1),
    Math.abs(scores.J - scores.P) / Math.max(scores.J + scores.P, 1),
  ];
  const confidence = Math.round(
    (pairConfidences.reduce((a, b) => a + b, 0) / 4) * 100
  ) / 100;

  // Build result code
  const resultCode = `${pairs.EI}${pairs.SN}${pairs.TF}${pairs.JP}`;
  const resultLabel = MBTI_LABELS[resultCode] || 'سبک کاری شما';

  // Dominant dimensions (winners of each pair)
  const dominant: MBTIDimension[] = [pairs.EI, pairs.SN, pairs.TF, pairs.JP];

  // Profile strength bonus
  let profileStrengthBonus = 10;
  if (confidence > 0.65) profileStrengthBonus += 2;

  const payload: MBTIResultPayload = {
    dimensions: scores,
    pairs,
    confidence,
    dominant,
  };

  return {
    testType: 'MBTI',
    resultCode,
    resultLabel,
    resultPayload: payload,
    profileStrengthBonus,
    completedAt: new Date().toISOString(),
  };
}

// ============================================
// DISC SCORER
// ============================================

function scoreDISC(answers: TestAnswer[]): ScoringResult {
  const dimensions: DISCDimension[] = ['D', 'I', 'S', 'C'];
  const scores = aggregateScores(answers, dimensions);
  const normalized = normalizeScores(scores);
  const sorted = getSortedDimensions(scores);

  const primary = sorted[0];
  const secondary = scores[sorted[1]] >= 3 ? sorted[1] : null;

  // Build result code and label
  const resultCode = secondary ? `${primary}${secondary}` : primary;
  const resultLabel = secondary
    ? DISC_COMBINED_LABELS[resultCode] || `${DISC_LABELS[primary]} + ${DISC_LABELS[secondary]}`
    : DISC_LABELS[primary];

  // Profile strength bonus
  let profileStrengthBonus = 8;
  if (normalized[primary] > 40) profileStrengthBonus += 2;

  const payload: DISCResultPayload = {
    scores,
    primary,
    secondary,
    normalized,
  };

  return {
    testType: 'DISC',
    resultCode,
    resultLabel,
    resultPayload: payload,
    profileStrengthBonus,
    completedAt: new Date().toISOString(),
  };
}

// ============================================
// HOLLAND SCORER
// ============================================

function scoreHolland(answers: TestAnswer[]): ScoringResult {
  const dimensions: HollandDimension[] = ['R', 'I', 'A', 'S', 'E', 'C'];
  const scores = aggregateScores(answers, dimensions);
  const normalized = normalizeScores(scores);
  const sorted = getSortedDimensions(scores);

  // Top 3 dimensions
  const top: [HollandDimension, HollandDimension, HollandDimension] = [
    sorted[0],
    sorted[1],
    sorted[2],
  ];

  // Build result code (e.g., "IAS")
  const resultCode = top.join('');

  // Build label from top 3
  const resultLabel = top.map(d => HOLLAND_LABELS[d]).join(' – ');

  // Profile strength bonus
  let profileStrengthBonus = 6;
  if (normalized[top[0]] > 30) profileStrengthBonus += 2;

  const payload: HollandResultPayload = {
    scores,
    top,
    normalized,
  };

  return {
    testType: 'HOLLAND',
    resultCode,
    resultLabel,
    resultPayload: payload,
    profileStrengthBonus,
    completedAt: new Date().toISOString(),
  };
}

// ============================================
// MAIN ENGINE
// ============================================

/**
 * Main Test Scoring Engine
 *
 * @param input - Test type and answers
 * @returns Standardized scoring result
 */
export function calculateTestScore(input: ScoringInput): ScoringResult {
  switch (input.testType) {
    case 'MBTI':
      return scoreMBTI(input.answers);
    case 'DISC':
      return scoreDISC(input.answers);
    case 'HOLLAND':
      return scoreHolland(input.answers);
    default:
      throw new Error(`Unknown test type: ${input.testType}`);
  }
}

// ============================================
// HELPER FUNCTIONS FOR UI
// ============================================

/**
 * Get Persian label for a DISC dimension
 */
export function getDISCLabel(dimension: DISCDimension): string {
  return DISC_LABELS[dimension];
}

/**
 * Get Persian label for a Holland dimension
 */
export function getHollandLabel(dimension: HollandDimension): string {
  return HOLLAND_LABELS[dimension];
}

/**
 * Get MBTI type label
 */
export function getMBTILabel(code: string): string {
  return MBTI_LABELS[code] || 'سبک کاری';
}

/**
 * Calculate total profile strength bonus from all completed tests
 */
export function calculateTotalProfileBonus(results: ScoringResult[]): number {
  return results.reduce((total, result) => total + result.profileStrengthBonus, 0);
}

// ============================================
// EXPLANATION GENERATORS
// ============================================

/**
 * Generate AI-ready explanation payload
 */
export function generateExplanationPayload(result: ScoringResult): {
  summary: string;
  strengths: string[];
  workEnvironment: string;
  teamRole: string;
} {
  switch (result.testType) {
    case 'MBTI': {
      const payload = result.resultPayload as MBTIResultPayload;
      return {
        summary: `سبک کاری شما ${result.resultLabel} است. این نشان می‌دهد که شما ${payload.pairs.EI === 'E' ? 'برون‌گرا' : 'درون‌گرا'} هستید و ${payload.pairs.TF === 'T' ? 'منطقی' : 'احساسی'} تصمیم می‌گیرید.`,
        strengths: getMBTIStrengths(payload),
        workEnvironment: getMBTIWorkEnvironment(payload),
        teamRole: getMBTITeamRole(payload),
      };
    }

    case 'DISC': {
      const payload = result.resultPayload as DISCResultPayload;
      return {
        summary: `سبک رفتاری شما ${result.resultLabel} است.`,
        strengths: getDISCStrengths(payload.primary),
        workEnvironment: getDISCWorkEnvironment(payload.primary),
        teamRole: getDISCTeamRole(payload.primary),
      };
    }

    case 'HOLLAND': {
      const payload = result.resultPayload as HollandResultPayload;
      return {
        summary: `مسیر شغلی مناسب شما ${result.resultLabel} است.`,
        strengths: getHollandStrengths(payload.top[0]),
        workEnvironment: getHollandWorkEnvironment(payload.top),
        teamRole: getHollandTeamRole(payload.top[0]),
      };
    }

    default:
      return {
        summary: '',
        strengths: [],
        workEnvironment: '',
        teamRole: '',
      };
  }
}

// Helper functions for explanations
function getMBTIStrengths(payload: MBTIResultPayload): string[] {
  const strengths: string[] = [];
  if (payload.pairs.EI === 'E') strengths.push('ارتباط مؤثر با دیگران');
  if (payload.pairs.EI === 'I') strengths.push('تمرکز عمیق و تفکر');
  if (payload.pairs.SN === 'S') strengths.push('توجه به جزئیات');
  if (payload.pairs.SN === 'N') strengths.push('دید کلان و آینده‌نگری');
  if (payload.pairs.TF === 'T') strengths.push('تحلیل منطقی');
  if (payload.pairs.TF === 'F') strengths.push('درک احساسات دیگران');
  if (payload.pairs.JP === 'J') strengths.push('برنامه‌ریزی و نظم');
  if (payload.pairs.JP === 'P') strengths.push('انعطاف‌پذیری');
  return strengths;
}

function getMBTIWorkEnvironment(payload: MBTIResultPayload): string {
  if (payload.pairs.JP === 'J' && payload.pairs.TF === 'T') {
    return 'محیط‌های ساختارمند با اهداف روشن';
  }
  if (payload.pairs.JP === 'P' && payload.pairs.SN === 'N') {
    return 'محیط‌های خلاق و پویا';
  }
  return 'محیط‌های متنوع با فرصت رشد';
}

function getMBTITeamRole(payload: MBTIResultPayload): string {
  if (payload.pairs.EI === 'E' && payload.pairs.TF === 'T') {
    return 'رهبر تیم یا مدیر پروژه';
  }
  if (payload.pairs.EI === 'I' && payload.pairs.SN === 'N') {
    return 'استراتژیست یا تحلیلگر';
  }
  return 'عضو مؤثر تیم';
}

function getDISCStrengths(primary: DISCDimension): string[] {
  const map: Record<DISCDimension, string[]> = {
    D: ['تصمیم‌گیری سریع', 'هدف‌گرایی', 'رهبری'],
    I: ['متقاعدسازی', 'ایجاد انگیزه', 'شبکه‌سازی'],
    S: ['ثبات', 'قابلیت اعتماد', 'همکاری'],
    C: ['دقت', 'تحلیل', 'کیفیت‌محوری'],
  };
  return map[primary];
}

function getDISCWorkEnvironment(primary: DISCDimension): string {
  const map: Record<DISCDimension, string> = {
    D: 'محیط‌های چالش‌برانگیز و پویا',
    I: 'محیط‌های تیمی و ارتباطی',
    S: 'محیط‌های پایدار و قابل پیش‌بینی',
    C: 'محیط‌های دقیق و ساختارمند',
  };
  return map[primary];
}

function getDISCTeamRole(primary: DISCDimension): string {
  const map: Record<DISCDimension, string> = {
    D: 'رهبر یا تصمیم‌گیرنده',
    I: 'ارتباط‌دهنده یا مذاکره‌کننده',
    S: 'پشتیبان یا هماهنگ‌کننده',
    C: 'تحلیلگر یا کنترل‌کننده کیفیت',
  };
  return map[primary];
}

function getHollandStrengths(primary: HollandDimension): string[] {
  const map: Record<HollandDimension, string[]> = {
    R: ['کار عملی', 'حل مسئله فنی', 'استفاده از ابزار'],
    I: ['تحلیل', 'پژوهش', 'حل مسائل پیچیده'],
    A: ['خلاقیت', 'نوآوری', 'بیان هنری'],
    S: ['ارتباط با مردم', 'آموزش', 'حمایت'],
    E: ['رهبری', 'مذاکره', 'کارآفرینی'],
    C: ['نظم', 'دقت', 'مدیریت اطلاعات'],
  };
  return map[primary];
}

function getHollandWorkEnvironment(top: HollandDimension[]): string {
  if (top.includes('I') && top.includes('C')) {
    return 'محیط‌های تحلیلی و ساختارمند مانند مالی و حسابداری';
  }
  if (top.includes('E') && top.includes('S')) {
    return 'محیط‌های مدیریتی و ارتباطی';
  }
  if (top.includes('A')) {
    return 'محیط‌های خلاق و نوآورانه';
  }
  return 'محیط‌های حرفه‌ای متناسب با علایق شما';
}

function getHollandTeamRole(primary: HollandDimension): string {
  const map: Record<HollandDimension, string> = {
    R: 'متخصص فنی یا اجرایی',
    I: 'تحلیلگر یا پژوهشگر',
    A: 'طراح یا خالق محتوا',
    S: 'مربی یا مشاور',
    E: 'مدیر یا رهبر پروژه',
    C: 'کارشناس مالی یا اداری',
  };
  return map[primary];
}
