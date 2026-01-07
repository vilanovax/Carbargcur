/**
 * AQS (Answer Quality Score) Calculator
 * محاسبه امتیاز کیفیت پاسخ بر اساس محتوا، تعامل، تخصص و اعتماد
 */

import type { AllSignals, ContentSignals, BehaviorSignals, ExpertSignals, TrustSignals } from "./signals";

// ============= Types =============

export type QualityLabel = "NORMAL" | "USEFUL" | "PRO" | "STAR";

export interface AQSResult {
  aqs: number;
  label: QualityLabel;
  scores: {
    content: number;
    engagement: number;
    expert: number;
    trust: number;
  };
  expertMultiplier: number;
  details: AQSDetails;
}

export interface AQSDetails {
  // Content breakdown
  lengthScore: number;
  structureScore: number;
  exampleBonus: number;
  stepsBonus: number;
  domainBonus: number;
  genericPenalty: number;

  // Engagement breakdown
  askerHelpfulBonus: number;
  acceptedBonus: number;
  followupBonus: number;

  // Expert breakdown
  profileMultiplier: number;
  acceptanceRateBonus: number;
  flagPenalty: number;

  // Trust breakdown
  responseTimeBonus: number;
  editPenalty: number;

  // Raw signals
  rawSignals: AllSignals;
}

// ============= Score Constants =============

const WEIGHTS = {
  content: 0.4,
  engagement: 0.25,
  expert: 0.2,
  trust: 0.15,
};

const CONTENT_RULES = {
  length: {
    veryShort: { max: 150, score: 0 },
    short: { max: 400, score: 10 },
    optimal: { max: 1200, score: 20 },
    long: { score: 15 }, // Too long gets slightly less
  },
  structure: {
    bullets: 5,
    paragraphs: 5,
  },
  example: 10,
  steps: 5,
  domain: 10,
  generic: -10,
};

const ENGAGEMENT_RULES = {
  askerHelpful: 10,
  accepted: 25,
  followup: 5,
};

const EXPERT_RULES = {
  profileMultiplier: {
    low: { max: 40, multiplier: 0.8 },
    medium: { max: 70, multiplier: 1.0 },
    high: { multiplier: 1.2 },
  },
  acceptanceRate: {
    high: { min: 0.5, bonus: 10 },
    medium: { min: 0.25, bonus: 5 },
  },
  flagPenalty: -5, // Per flag
  maxFlagPenalty: -20,
};

const TRUST_RULES = {
  responseTime: {
    fast: { max: 120, bonus: 10 }, // Under 2 hours
    medium: { max: 1440, bonus: 5 }, // Under 24 hours
  },
  editPenalty: {
    threshold: 2,
    penalty: -5,
  },
};

const LABEL_THRESHOLDS = {
  STAR: 85,
  PRO: 70,
  USEFUL: 40,
  NORMAL: 0,
};

// ============= Score Calculation Functions =============

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate Content Score (0-100)
 */
function calculateContentScore(signals: ContentSignals): {
  score: number;
  breakdown: Pick<AQSDetails, "lengthScore" | "structureScore" | "exampleBonus" | "stepsBonus" | "domainBonus" | "genericPenalty">;
} {
  let score = 0;
  const breakdown = {
    lengthScore: 0,
    structureScore: 0,
    exampleBonus: 0,
    stepsBonus: 0,
    domainBonus: 0,
    genericPenalty: 0,
  };

  // Length scoring
  if (signals.charCount < CONTENT_RULES.length.veryShort.max) {
    breakdown.lengthScore = CONTENT_RULES.length.veryShort.score;
  } else if (signals.charCount < CONTENT_RULES.length.short.max) {
    breakdown.lengthScore = CONTENT_RULES.length.short.score;
  } else if (signals.charCount < CONTENT_RULES.length.optimal.max) {
    breakdown.lengthScore = CONTENT_RULES.length.optimal.score;
  } else {
    breakdown.lengthScore = CONTENT_RULES.length.long.score;
  }
  score += breakdown.lengthScore;

  // Structure scoring
  if (signals.hasBullets) {
    breakdown.structureScore += CONTENT_RULES.structure.bullets;
  }
  if (signals.hasParagraphs) {
    breakdown.structureScore += CONTENT_RULES.structure.paragraphs;
  }
  score += breakdown.structureScore;

  // Example bonus
  if (signals.hasExample) {
    breakdown.exampleBonus = CONTENT_RULES.example;
    score += breakdown.exampleBonus;
  }

  // Steps bonus
  if (signals.hasSteps) {
    breakdown.stepsBonus = CONTENT_RULES.steps;
    score += breakdown.stepsBonus;
  }

  // Domain keyword bonus
  if (signals.hasDomainKeywords) {
    breakdown.domainBonus = CONTENT_RULES.domain;
    score += breakdown.domainBonus;
  }

  // Generic penalty
  if (signals.isGeneric) {
    breakdown.genericPenalty = CONTENT_RULES.generic;
    score += breakdown.genericPenalty;
  }

  return {
    score: clamp(score, 0, 100),
    breakdown,
  };
}

/**
 * Calculate Engagement Score (0-100)
 * Note: Only asker's reactions count for scoring
 */
function calculateEngagementScore(signals: BehaviorSignals): {
  score: number;
  breakdown: Pick<AQSDetails, "askerHelpfulBonus" | "acceptedBonus" | "followupBonus">;
} {
  let score = 0;
  const breakdown = {
    askerHelpfulBonus: 0,
    acceptedBonus: 0,
    followupBonus: 0,
  };

  // Asker marked as helpful
  if (signals.askerHelpful) {
    breakdown.askerHelpfulBonus = ENGAGEMENT_RULES.askerHelpful;
    score += breakdown.askerHelpfulBonus;
  }

  // Answer was accepted
  if (signals.isAccepted) {
    breakdown.acceptedBonus = ENGAGEMENT_RULES.accepted;
    score += breakdown.acceptedBonus;
  }

  // Asker had follow-up interaction
  if (signals.followupCount > 0) {
    breakdown.followupBonus = ENGAGEMENT_RULES.followup;
    score += breakdown.followupBonus;
  }

  return {
    score: clamp(score, 0, 100),
    breakdown,
  };
}

/**
 * Calculate Expert Score (0-100)
 * Returns score and multiplier based on profile strength
 */
function calculateExpertScore(signals: ExpertSignals, behaviorSignals: BehaviorSignals): {
  score: number;
  multiplier: number;
  breakdown: Pick<AQSDetails, "profileMultiplier" | "acceptanceRateBonus" | "flagPenalty">;
} {
  let score = 50; // Base score
  const breakdown = {
    profileMultiplier: 1.0,
    acceptanceRateBonus: 0,
    flagPenalty: 0,
  };

  // Determine multiplier based on profile strength
  if (signals.profileStrength < EXPERT_RULES.profileMultiplier.low.max) {
    breakdown.profileMultiplier = EXPERT_RULES.profileMultiplier.low.multiplier;
  } else if (signals.profileStrength < EXPERT_RULES.profileMultiplier.medium.max) {
    breakdown.profileMultiplier = EXPERT_RULES.profileMultiplier.medium.multiplier;
  } else {
    breakdown.profileMultiplier = EXPERT_RULES.profileMultiplier.high.multiplier;
  }

  // Acceptance rate bonus
  if (signals.authorAcceptanceRate >= EXPERT_RULES.acceptanceRate.high.min) {
    breakdown.acceptanceRateBonus = EXPERT_RULES.acceptanceRate.high.bonus;
  } else if (signals.authorAcceptanceRate >= EXPERT_RULES.acceptanceRate.medium.min) {
    breakdown.acceptanceRateBonus = EXPERT_RULES.acceptanceRate.medium.bonus;
  }
  score += breakdown.acceptanceRateBonus;

  // Flag penalty
  if (behaviorSignals.totalFlags > 0) {
    breakdown.flagPenalty = Math.max(
      behaviorSignals.totalFlags * EXPERT_RULES.flagPenalty,
      EXPERT_RULES.maxFlagPenalty
    );
    score += breakdown.flagPenalty;
  }

  return {
    score: clamp(score, 0, 100),
    multiplier: breakdown.profileMultiplier,
    breakdown,
  };
}

/**
 * Calculate Trust Score (0-100)
 */
function calculateTrustScore(signals: TrustSignals): {
  score: number;
  breakdown: Pick<AQSDetails, "responseTimeBonus" | "editPenalty">;
} {
  let score = 50; // Base score
  const breakdown = {
    responseTimeBonus: 0,
    editPenalty: 0,
  };

  // Response time bonus
  if (signals.responseTimeMinutes < TRUST_RULES.responseTime.fast.max) {
    breakdown.responseTimeBonus = TRUST_RULES.responseTime.fast.bonus;
  } else if (signals.responseTimeMinutes < TRUST_RULES.responseTime.medium.max) {
    breakdown.responseTimeBonus = TRUST_RULES.responseTime.medium.bonus;
  }
  score += breakdown.responseTimeBonus;

  // Edit penalty (if edited too many times after feedback)
  if (signals.editCount > TRUST_RULES.editPenalty.threshold) {
    breakdown.editPenalty = TRUST_RULES.editPenalty.penalty;
    score += breakdown.editPenalty;
  }

  return {
    score: clamp(score, 0, 100),
    breakdown,
  };
}

/**
 * Determine quality label based on AQS
 */
function getQualityLabel(aqs: number): QualityLabel {
  if (aqs >= LABEL_THRESHOLDS.STAR) return "STAR";
  if (aqs >= LABEL_THRESHOLDS.PRO) return "PRO";
  if (aqs >= LABEL_THRESHOLDS.USEFUL) return "USEFUL";
  return "NORMAL";
}

// ============= Main AQS Calculator =============

/**
 * Compute Answer Quality Score from all signals
 */
export function computeAQS(signals: AllSignals): AQSResult {
  // Calculate individual scores
  const contentResult = calculateContentScore(signals.content);
  const engagementResult = calculateEngagementScore(signals.behavior);
  const expertResult = calculateExpertScore(signals.expert, signals.behavior);
  const trustResult = calculateTrustScore(signals.trust);

  // Calculate weighted sum
  const rawAQS =
    contentResult.score * WEIGHTS.content +
    engagementResult.score * WEIGHTS.engagement +
    expertResult.score * WEIGHTS.expert +
    trustResult.score * WEIGHTS.trust;

  // Apply expert multiplier
  const finalAQS = clamp(Math.round(rawAQS * expertResult.multiplier), 0, 100);

  // Determine label
  const label = getQualityLabel(finalAQS);

  return {
    aqs: finalAQS,
    label,
    scores: {
      content: contentResult.score,
      engagement: engagementResult.score,
      expert: expertResult.score,
      trust: trustResult.score,
    },
    expertMultiplier: expertResult.multiplier,
    details: {
      ...contentResult.breakdown,
      ...engagementResult.breakdown,
      ...expertResult.breakdown,
      ...trustResult.breakdown,
      rawSignals: signals,
    },
  };
}

// ============= Export Constants =============

export { WEIGHTS, LABEL_THRESHOLDS };
