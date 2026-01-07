/**
 * Signal Extractors - استخراج سیگنال‌ها برای محاسبه کیفیت پاسخ
 */

import { calculateKeywordDensity, hasDomainKeywords } from "./domainKeywords";

// ============= Interfaces =============

export interface ContentSignals {
  charCount: number;
  wordCount: number;
  hasBullets: boolean;
  hasParagraphs: boolean;
  hasExample: boolean;
  hasSteps: boolean;
  domainKeywordDensity: number;
  hasDomainKeywords: boolean;
  isGeneric: boolean;
}

export interface BehaviorSignals {
  askerHelpful: boolean;
  askerNotHelpful: boolean;
  totalHelpful: number;
  totalNotHelpful: number;
  isAccepted: boolean;
  totalFlags: number;
  followupCount: number;
}

export interface ExpertSignals {
  profileStrength: number;
  authorAcceptanceRate: number;
  authorTotalAnswers: number;
  authorExpertLevel: string;
}

export interface TrustSignals {
  responseTimeMinutes: number;
  editCount: number;
  hasBeenEdited: boolean;
}

// ============= Generic Phrases Detection =============

const GENERIC_PHRASES = [
  "بستگی دارد",
  "باید بررسی شود",
  "نمی‌توان گفت",
  "مشخص نیست",
  "باید ببینید",
  "سؤال خوبی است",
  "جواب سختی است",
  "به شرایط بستگی دارد",
  "باید مشورت کنید",
  "نظر شخصی من",
];

// ============= Content Signal Extraction =============

/**
 * Extract content-related signals from answer body
 */
export function extractContentSignals(body: string, category?: string): ContentSignals {
  const charCount = body.length;
  const words = body.split(/\s+/).filter(w => w.length > 1);
  const wordCount = words.length;

  // Check for bullet points (Persian and English)
  const bulletRegex = /^[\s]*[-•●○◦▪▫]|^[\s]*[۰-۹\d]+[\.\-\)]|^[\s]*[الف-ی]\)|قدم\s*[۰-۹\d]/gm;
  const hasBullets = bulletRegex.test(body);

  // Check for paragraphs (multiple newlines)
  const hasParagraphs = body.includes("\n\n") || (body.match(/\n/g) || []).length >= 2;

  // Check for examples
  const examplePatterns = [
    "مثال",
    "مثلاً",
    "برای نمونه",
    "به عنوان مثال",
    "فرض کنید",
    "فرض کن",
    "در نظر بگیرید",
    "تصور کنید",
    "مانند:",
    "نمونه:",
  ];
  const hasExample = examplePatterns.some(p => body.includes(p));

  // Check for step-by-step instructions
  const stepPatterns = [
    /قدم\s*[۰-۹\d]/,
    /مرحله\s*[۰-۹\d]/,
    /گام\s*[۰-۹\d]/,
    /اول[اً\s]*،|اولاً/,
    /دوم[اً\s]*،|ثانیاً/,
    /سوم[اً\s]*،|ثالثاً/,
    /[۱-۹\d]\s*[\.\-\)]/gm,
  ];
  const hasSteps = stepPatterns.some(p => p.test(body));

  // Domain keyword analysis
  const density = category ? calculateKeywordDensity(body, category) : 0;
  const hasDomainKw = category ? hasDomainKeywords(body, category, 2) : false;

  // Generic detection: short answer with generic phrases and no structure
  const hasGenericPhrase = GENERIC_PHRASES.some(phrase => body.includes(phrase));
  const isGeneric = hasGenericPhrase && charCount < 300 && !hasSteps && !hasExample;

  return {
    charCount,
    wordCount,
    hasBullets,
    hasParagraphs,
    hasExample,
    hasSteps,
    domainKeywordDensity: density,
    hasDomainKeywords: hasDomainKw,
    isGeneric,
  };
}

// ============= Behavior Signal Extraction =============

export interface ReactionData {
  type: string;
  userId: string;
}

export interface BehaviorInput {
  reactions: ReactionData[];
  questionAuthorId: string;
  isAccepted: boolean;
  flags: Array<{ reason: string }>;
  followupCount?: number;
}

/**
 * Extract behavior-related signals from reactions and flags
 */
export function extractBehaviorSignals(input: BehaviorInput): BehaviorSignals {
  const { reactions, questionAuthorId, isAccepted, flags, followupCount = 0 } = input;

  // Find asker's reaction
  const askerReaction = reactions.find(r => r.userId === questionAuthorId);
  const askerHelpful = askerReaction?.type === "helpful";
  const askerNotHelpful = askerReaction?.type === "not_helpful";

  // Count total reactions
  const totalHelpful = reactions.filter(r => r.type === "helpful").length;
  const totalNotHelpful = reactions.filter(r => r.type === "not_helpful").length;

  return {
    askerHelpful,
    askerNotHelpful,
    totalHelpful,
    totalNotHelpful,
    isAccepted,
    totalFlags: flags.length,
    followupCount,
  };
}

// ============= Expert Signal Extraction =============

export interface ExpertInput {
  profileStrength: number;
  authorAcceptedAnswers: number;
  authorTotalAnswers: number;
  authorExpertLevel: string;
}

/**
 * Extract expert-related signals from author profile
 */
export function extractExpertSignals(input: ExpertInput): ExpertSignals {
  const { profileStrength, authorAcceptedAnswers, authorTotalAnswers, authorExpertLevel } = input;

  const acceptanceRate = authorTotalAnswers > 0
    ? (authorAcceptedAnswers / authorTotalAnswers)
    : 0;

  return {
    profileStrength,
    authorAcceptanceRate: acceptanceRate,
    authorTotalAnswers,
    authorExpertLevel,
  };
}

// ============= Trust Signal Extraction =============

export interface TrustInput {
  answerCreatedAt: Date;
  questionCreatedAt: Date;
  answerUpdatedAt: Date;
  editCount?: number;
}

/**
 * Extract trust-related signals from timestamps and edit history
 */
export function extractTrustSignals(input: TrustInput): TrustSignals {
  const { answerCreatedAt, questionCreatedAt, answerUpdatedAt, editCount = 0 } = input;

  const responseTimeMs = answerCreatedAt.getTime() - questionCreatedAt.getTime();
  const responseTimeMinutes = Math.max(0, responseTimeMs / (1000 * 60));

  const hasBeenEdited = answerUpdatedAt.getTime() > answerCreatedAt.getTime();

  return {
    responseTimeMinutes,
    editCount,
    hasBeenEdited,
  };
}

// ============= Combined Signal Extraction =============

export interface AllSignals {
  content: ContentSignals;
  behavior: BehaviorSignals;
  expert: ExpertSignals;
  trust: TrustSignals;
}

export interface CombinedSignalInput {
  answerBody: string;
  category?: string;
  reactions: ReactionData[];
  questionAuthorId: string;
  isAccepted: boolean;
  flags: Array<{ reason: string }>;
  followupCount?: number;
  profileStrength: number;
  authorAcceptedAnswers: number;
  authorTotalAnswers: number;
  authorExpertLevel: string;
  answerCreatedAt: Date;
  questionCreatedAt: Date;
  answerUpdatedAt: Date;
  editCount?: number;
}

/**
 * Extract all signals at once
 */
export function extractAllSignals(input: CombinedSignalInput): AllSignals {
  return {
    content: extractContentSignals(input.answerBody, input.category),
    behavior: extractBehaviorSignals({
      reactions: input.reactions,
      questionAuthorId: input.questionAuthorId,
      isAccepted: input.isAccepted,
      flags: input.flags,
      followupCount: input.followupCount,
    }),
    expert: extractExpertSignals({
      profileStrength: input.profileStrength,
      authorAcceptedAnswers: input.authorAcceptedAnswers,
      authorTotalAnswers: input.authorTotalAnswers,
      authorExpertLevel: input.authorExpertLevel,
    }),
    trust: extractTrustSignals({
      answerCreatedAt: input.answerCreatedAt,
      questionCreatedAt: input.questionCreatedAt,
      answerUpdatedAt: input.answerUpdatedAt,
      editCount: input.editCount,
    }),
  };
}
