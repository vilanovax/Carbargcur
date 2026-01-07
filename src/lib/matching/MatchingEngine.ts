/**
 * Matching Engine
 *
 * Calculates compatibility between a candidate profile and job requirements.
 * Uses assessment results (DISC, Holland) along with skills and experience.
 *
 * Features:
 * - Multi-dimensional scoring (skills, experience, behavior, career fit)
 * - Explainable results with breakdown
 * - Weighted scoring based on job priorities
 * - Persian labels for all outputs
 */

import type { FocusedProfile, DISCAssessmentResult, HollandAssessmentResult } from '../onboarding';
import type { DISCStyle } from '../assessment/disc-types';
import type { HollandCareerFit } from '../assessment/holland-types';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type MatchPriority = 'required' | 'preferred' | 'nice_to_have';

export interface SkillRequirement {
  skill: string;
  priority: MatchPriority;
}

export interface ExperienceRequirement {
  minYears: number;
  domain?: string;  // e.g., 'accounting', 'finance'
  priority: MatchPriority;
}

export interface BehaviorRequirement {
  preferredStyles: DISCStyle[];
  priority: MatchPriority;
}

export interface CareerFitRequirement {
  preferredFits: HollandCareerFit[];
  priority: MatchPriority;
}

export interface JobRequirements {
  id: string;
  title: string;
  company?: string;
  skills: SkillRequirement[];
  experience?: ExperienceRequirement;
  behavior?: BehaviorRequirement;
  careerFit?: CareerFitRequirement;
  // Weights for scoring (0-100, should sum to 100)
  weights?: {
    skills: number;
    experience: number;
    behavior: number;
    careerFit: number;
  };
}

export interface MatchDimension {
  name: string;
  nameEn: string;
  score: number;        // 0-100
  maxScore: number;     // Always 100
  weight: number;       // Weight applied
  weightedScore: number;
  details: string[];
  status: 'excellent' | 'good' | 'partial' | 'weak' | 'missing';
}

export interface MatchResult {
  jobId: string;
  jobTitle: string;
  overallScore: number;  // 0-100
  overallStatus: 'excellent' | 'good' | 'partial' | 'weak';
  dimensions: MatchDimension[];
  strengths: string[];
  gaps: string[];
  recommendation: string;
  calculatedAt: string;
}

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_WEIGHTS = {
  skills: 40,
  experience: 25,
  behavior: 20,
  careerFit: 15,
};

const PRIORITY_MULTIPLIERS: Record<MatchPriority, number> = {
  required: 1.5,
  preferred: 1.0,
  nice_to_have: 0.5,
};

const DISC_STYLE_LABELS: Record<DISCStyle, string> = {
  'result-oriented': 'نتیجه‌محور',
  'people-oriented': 'ارتباط‌محور',
  'stable': 'پایدار',
  'precise': 'دقیق',
};

const HOLLAND_FIT_LABELS: Record<HollandCareerFit, string> = {
  'practical': 'عملی',
  'analytical': 'تحلیلی',
  'creative': 'خلاق',
  'social': 'انسانی',
  'enterprising': 'مدیریتی',
  'conventional': 'ساختارمند',
};

// ============================================
// SCORING FUNCTIONS
// ============================================

/**
 * Calculate skills match score
 */
function calculateSkillsScore(
  profileSkills: string[],
  requirements: SkillRequirement[]
): { score: number; details: string[]; status: MatchDimension['status'] } {
  if (requirements.length === 0) {
    return { score: 100, details: ['بدون نیازمندی مهارتی'], status: 'excellent' };
  }

  const normalizedProfileSkills = profileSkills.map(s => s.toLowerCase().trim());
  let totalWeight = 0;
  let earnedWeight = 0;
  const details: string[] = [];
  const matchedRequired: string[] = [];
  const missingRequired: string[] = [];

  requirements.forEach(req => {
    const multiplier = PRIORITY_MULTIPLIERS[req.priority];
    totalWeight += multiplier;

    const isMatched = normalizedProfileSkills.some(ps =>
      ps.includes(req.skill.toLowerCase()) || req.skill.toLowerCase().includes(ps)
    );

    if (isMatched) {
      earnedWeight += multiplier;
      if (req.priority === 'required') {
        matchedRequired.push(req.skill);
      }
    } else {
      if (req.priority === 'required') {
        missingRequired.push(req.skill);
      }
    }
  });

  const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

  if (matchedRequired.length > 0) {
    details.push(`✓ مهارت‌های ضروری: ${matchedRequired.join('، ')}`);
  }
  if (missingRequired.length > 0) {
    details.push(`✗ مهارت‌های ضروری ناموجود: ${missingRequired.join('، ')}`);
  }

  let status: MatchDimension['status'];
  if (missingRequired.length > 0) {
    status = 'weak';
  } else if (score >= 80) {
    status = 'excellent';
  } else if (score >= 60) {
    status = 'good';
  } else if (score >= 40) {
    status = 'partial';
  } else {
    status = 'weak';
  }

  return { score, details, status };
}

/**
 * Calculate experience match score
 */
function calculateExperienceScore(
  profile: FocusedProfile,
  requirement?: ExperienceRequirement
): { score: number; details: string[]; status: MatchDimension['status'] } {
  if (!requirement) {
    return { score: 100, details: ['بدون نیازمندی سابقه'], status: 'excellent' };
  }

  const details: string[] = [];
  let score = 0;

  // Estimate years from experience level
  const experienceYears = estimateExperienceYears(profile);

  if (experienceYears >= requirement.minYears) {
    score = 100;
    details.push(`✓ سابقه کافی: ${experienceYears}+ سال`);
  } else if (experienceYears >= requirement.minYears * 0.7) {
    score = 70;
    details.push(`~ سابقه نزدیک به حداقل: ${experienceYears} سال از ${requirement.minYears} سال`);
  } else {
    score = Math.round((experienceYears / requirement.minYears) * 50);
    details.push(`✗ سابقه کمتر از حداقل: ${experienceYears} سال از ${requirement.minYears} سال`);
  }

  // Domain match bonus
  if (requirement.domain && profile.recentExperience?.domain) {
    if (profile.recentExperience.domain === requirement.domain) {
      score = Math.min(100, score + 10);
      details.push(`✓ تطابق حوزه تخصصی: ${getDomainLabel(requirement.domain)}`);
    }
  }

  let status: MatchDimension['status'];
  if (score >= 90) status = 'excellent';
  else if (score >= 70) status = 'good';
  else if (score >= 50) status = 'partial';
  else status = 'weak';

  return { score, details, status };
}

/**
 * Calculate behavior (DISC) match score
 */
function calculateBehaviorScore(
  disc?: DISCAssessmentResult,
  requirement?: BehaviorRequirement
): { score: number; details: string[]; status: MatchDimension['status'] } {
  if (!requirement) {
    return { score: 100, details: ['بدون نیازمندی رفتاری'], status: 'excellent' };
  }

  if (!disc) {
    return {
      score: 0,
      details: ['آزمون DISC انجام نشده'],
      status: 'missing',
    };
  }

  const details: string[] = [];
  let score = 0;

  const primaryMatch = requirement.preferredStyles.includes(disc.primary);
  const secondaryMatch = disc.secondary && requirement.preferredStyles.includes(disc.secondary);

  if (primaryMatch) {
    score = 100;
    details.push(`✓ سبک اصلی (${DISC_STYLE_LABELS[disc.primary]}) مطابق با نیازمندی`);
  } else if (secondaryMatch) {
    score = 70;
    details.push(`~ سبک ثانویه (${DISC_STYLE_LABELS[disc.secondary!]}) مطابق با نیازمندی`);
    details.push(`سبک اصلی شما ${DISC_STYLE_LABELS[disc.primary]} است`);
  } else {
    score = 30;
    details.push(`سبک شما (${DISC_STYLE_LABELS[disc.primary]}) متفاوت از نیازمندی`);
    details.push(`سبک‌های ترجیحی: ${requirement.preferredStyles.map(s => DISC_STYLE_LABELS[s]).join('، ')}`);
  }

  let status: MatchDimension['status'];
  if (score >= 90) status = 'excellent';
  else if (score >= 70) status = 'good';
  else if (score >= 50) status = 'partial';
  else status = 'weak';

  return { score, details, status };
}

/**
 * Calculate career fit (Holland) match score
 */
function calculateCareerFitScore(
  holland?: HollandAssessmentResult,
  requirement?: CareerFitRequirement
): { score: number; details: string[]; status: MatchDimension['status'] } {
  if (!requirement) {
    return { score: 100, details: ['بدون نیازمندی تناسب شغلی'], status: 'excellent' };
  }

  if (!holland) {
    return {
      score: 0,
      details: ['آزمون هالند انجام نشده'],
      status: 'missing',
    };
  }

  const details: string[] = [];
  let score = 0;

  const primaryMatch = requirement.preferredFits.includes(holland.primary);
  const secondaryMatch = holland.secondary && requirement.preferredFits.includes(holland.secondary);

  if (primaryMatch) {
    score = 100;
    details.push(`✓ مسیر شغلی (${HOLLAND_FIT_LABELS[holland.primary]}) مطابق با نیازمندی`);
  } else if (secondaryMatch) {
    score = 70;
    details.push(`~ مسیر ثانویه (${HOLLAND_FIT_LABELS[holland.secondary!]}) مطابق با نیازمندی`);
  } else {
    score = 30;
    details.push(`مسیر شغلی شما (${HOLLAND_FIT_LABELS[holland.primary]}) متفاوت از نیازمندی`);
  }

  let status: MatchDimension['status'];
  if (score >= 90) status = 'excellent';
  else if (score >= 70) status = 'good';
  else if (score >= 50) status = 'partial';
  else status = 'weak';

  return { score, details, status };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function estimateExperienceYears(profile: FocusedProfile): number {
  // From experience level
  if (profile.experienceLevel === 'senior') return 7;
  if (profile.experienceLevel === 'mid') return 4;
  if (profile.experienceLevel === 'junior') return 1;

  // From recent experience dates
  if (profile.recentExperience?.fromYear) {
    const fromYear = parseInt(profile.recentExperience.fromYear);
    if (!isNaN(fromYear)) {
      const currentYear = new Date().getFullYear();
      // Convert Jalali to approximate Gregorian if needed
      const gregorianYear = fromYear < 1500 ? fromYear + 621 : fromYear;
      return Math.max(0, currentYear - gregorianYear);
    }
  }

  return 0;
}

function getDomainLabel(domain: string): string {
  const labels: Record<string, string> = {
    accounting: 'حسابداری',
    finance: 'مالی',
    insurance: 'بیمه',
    auditing: 'حسابرسی',
    financial_management: 'مدیریت مالی',
    tax: 'مالیات',
    industrial: 'صنعتی',
  };
  return labels[domain] || domain;
}

function getOverallStatus(score: number): MatchResult['overallStatus'] {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'partial';
  return 'weak';
}

function generateRecommendation(result: MatchResult): string {
  if (result.overallScore >= 80) {
    return 'تطابق عالی! این موقعیت شغلی با پروفایل شما بسیار مناسب است.';
  }
  if (result.overallScore >= 60) {
    return 'تطابق خوب. با تقویت چند مهارت، شانس موفقیت شما بالاتر می‌رود.';
  }
  if (result.overallScore >= 40) {
    return 'تطابق نسبی. نیاز به توسعه مهارت‌ها یا تجربه بیشتر دارید.';
  }
  return 'تطابق پایین. این موقعیت ممکن است مناسب‌ترین انتخاب نباشد.';
}

// ============================================
// MAIN MATCHING FUNCTION
// ============================================

/**
 * Calculate match score between a profile and job requirements
 */
export function calculateMatch(
  profile: FocusedProfile,
  job: JobRequirements
): MatchResult {
  const weights = job.weights || DEFAULT_WEIGHTS;
  const dimensions: MatchDimension[] = [];
  const strengths: string[] = [];
  const gaps: string[] = [];

  // 1. Skills Match
  const skillsResult = calculateSkillsScore(
    [...(profile.coreSkills || []), ...(profile.skills || [])],
    job.skills
  );
  dimensions.push({
    name: 'مهارت‌ها',
    nameEn: 'skills',
    score: skillsResult.score,
    maxScore: 100,
    weight: weights.skills,
    weightedScore: Math.round((skillsResult.score * weights.skills) / 100),
    details: skillsResult.details,
    status: skillsResult.status,
  });
  if (skillsResult.status === 'excellent' || skillsResult.status === 'good') {
    strengths.push('مهارت‌های مورد نیاز');
  } else if (skillsResult.status === 'weak') {
    gaps.push('کمبود مهارت‌های ضروری');
  }

  // 2. Experience Match
  const expResult = calculateExperienceScore(profile, job.experience);
  dimensions.push({
    name: 'سابقه کاری',
    nameEn: 'experience',
    score: expResult.score,
    maxScore: 100,
    weight: weights.experience,
    weightedScore: Math.round((expResult.score * weights.experience) / 100),
    details: expResult.details,
    status: expResult.status,
  });
  if (expResult.status === 'excellent' || expResult.status === 'good') {
    strengths.push('سابقه کاری مناسب');
  } else if (expResult.status === 'weak') {
    gaps.push('سابقه کاری کمتر از حداقل');
  }

  // 3. Behavior (DISC) Match
  const behaviorResult = calculateBehaviorScore(
    profile.assessments?.disc,
    job.behavior
  );
  dimensions.push({
    name: 'سبک رفتاری',
    nameEn: 'behavior',
    score: behaviorResult.score,
    maxScore: 100,
    weight: weights.behavior,
    weightedScore: Math.round((behaviorResult.score * weights.behavior) / 100),
    details: behaviorResult.details,
    status: behaviorResult.status,
  });
  if (behaviorResult.status === 'excellent') {
    strengths.push('سبک رفتاری متناسب');
  } else if (behaviorResult.status === 'missing') {
    gaps.push('آزمون DISC انجام نشده');
  }

  // 4. Career Fit (Holland) Match
  const careerResult = calculateCareerFitScore(
    profile.assessments?.holland,
    job.careerFit
  );
  dimensions.push({
    name: 'تناسب شغلی',
    nameEn: 'careerFit',
    score: careerResult.score,
    maxScore: 100,
    weight: weights.careerFit,
    weightedScore: Math.round((careerResult.score * weights.careerFit) / 100),
    details: careerResult.details,
    status: careerResult.status,
  });
  if (careerResult.status === 'excellent') {
    strengths.push('تناسب مسیر شغلی');
  } else if (careerResult.status === 'missing') {
    gaps.push('آزمون هالند انجام نشده');
  }

  // Calculate overall score
  const overallScore = dimensions.reduce((sum, d) => sum + d.weightedScore, 0);

  const result: MatchResult = {
    jobId: job.id,
    jobTitle: job.title,
    overallScore,
    overallStatus: getOverallStatus(overallScore),
    dimensions,
    strengths,
    gaps,
    recommendation: '',
    calculatedAt: new Date().toISOString(),
  };

  result.recommendation = generateRecommendation(result);

  return result;
}

// ============================================
// BATCH MATCHING
// ============================================

/**
 * Calculate match scores for multiple jobs
 */
export function calculateMatchBatch(
  profile: FocusedProfile,
  jobs: JobRequirements[]
): MatchResult[] {
  return jobs
    .map(job => calculateMatch(profile, job))
    .sort((a, b) => b.overallScore - a.overallScore);
}

// ============================================
// SAMPLE JOB REQUIREMENTS (for testing)
// ============================================

export const SAMPLE_JOBS: JobRequirements[] = [
  {
    id: 'job-1',
    title: 'حسابدار ارشد',
    company: 'شرکت سرمایه‌گذاری نمونه',
    skills: [
      { skill: 'حسابداری', priority: 'required' },
      { skill: 'Excel', priority: 'required' },
      { skill: 'IFRS', priority: 'preferred' },
      { skill: 'تحلیل مالی', priority: 'nice_to_have' },
    ],
    experience: { minYears: 5, domain: 'accounting', priority: 'required' },
    behavior: { preferredStyles: ['precise', 'stable'], priority: 'preferred' },
    careerFit: { preferredFits: ['conventional', 'analytical'], priority: 'nice_to_have' },
  },
  {
    id: 'job-2',
    title: 'تحلیلگر مالی',
    company: 'کارگزاری بورس',
    skills: [
      { skill: 'تحلیل بنیادی', priority: 'required' },
      { skill: 'تحلیل تکنیکال', priority: 'required' },
      { skill: 'مدل‌سازی مالی', priority: 'preferred' },
      { skill: 'Excel', priority: 'required' },
    ],
    experience: { minYears: 3, domain: 'finance', priority: 'required' },
    behavior: { preferredStyles: ['precise', 'result-oriented'], priority: 'preferred' },
    careerFit: { preferredFits: ['analytical', 'enterprising'], priority: 'preferred' },
  },
  {
    id: 'job-3',
    title: 'مدیر مالی',
    company: 'هلدینگ صنعتی',
    skills: [
      { skill: 'مدیریت مالی', priority: 'required' },
      { skill: 'بودجه‌ریزی', priority: 'required' },
      { skill: 'گزارش‌دهی مدیریتی', priority: 'preferred' },
      { skill: 'IFRS', priority: 'nice_to_have' },
    ],
    experience: { minYears: 8, domain: 'financial_management', priority: 'required' },
    behavior: { preferredStyles: ['result-oriented', 'people-oriented'], priority: 'required' },
    careerFit: { preferredFits: ['enterprising', 'conventional'], priority: 'preferred' },
  },
];

// ============================================
// API JOB CONVERTER
// ============================================

export interface APIJob {
  id: string;
  title: string;
  company: string | null;
  description: string | null;
  city: string | null;
  employmentType: string | null;
  experienceLevel: string | null;
  minExperienceYears: number | null;
  maxExperienceYears: number | null;
  requiredSkills: string[];
  preferredSkills: string[];
  preferredBehavior: {
    primary?: string;
    traits?: string[];
  } | null;
  preferredCareerFit: {
    primary?: string;
    secondary?: string;
  } | null;
  salaryMin: string | null;
  salaryMax: string | null;
  isFeatured: boolean;
  createdAt: string;
}

/**
 * Convert API job response to JobRequirements format for matching
 */
export function convertAPIJobToRequirements(apiJob: APIJob): JobRequirements {
  // Convert skills
  const skills: SkillRequirement[] = [
    ...(apiJob.requiredSkills || []).map(skill => ({
      skill,
      priority: 'required' as MatchPriority,
    })),
    ...(apiJob.preferredSkills || []).map(skill => ({
      skill,
      priority: 'preferred' as MatchPriority,
    })),
  ];

  // Convert experience
  let experience: ExperienceRequirement | undefined;
  if (apiJob.minExperienceYears) {
    experience = {
      minYears: apiJob.minExperienceYears,
      priority: 'required',
    };
  } else if (apiJob.experienceLevel) {
    const yearsMap: Record<string, number> = {
      junior: 1,
      mid: 3,
      senior: 5,
    };
    experience = {
      minYears: yearsMap[apiJob.experienceLevel] || 0,
      priority: 'preferred',
    };
  }

  // Convert behavior (DISC)
  let behavior: BehaviorRequirement | undefined;
  if (apiJob.preferredBehavior?.primary) {
    behavior = {
      preferredStyles: [apiJob.preferredBehavior.primary as DISCStyle],
      priority: 'preferred',
    };
  }

  // Convert career fit (Holland)
  let careerFit: CareerFitRequirement | undefined;
  if (apiJob.preferredCareerFit?.primary) {
    const fits: HollandCareerFit[] = [apiJob.preferredCareerFit.primary as HollandCareerFit];
    if (apiJob.preferredCareerFit.secondary) {
      fits.push(apiJob.preferredCareerFit.secondary as HollandCareerFit);
    }
    careerFit = {
      preferredFits: fits,
      priority: 'preferred',
    };
  }

  return {
    id: apiJob.id,
    title: apiJob.title,
    company: apiJob.company || undefined,
    skills,
    experience,
    behavior,
    careerFit,
  };
}
