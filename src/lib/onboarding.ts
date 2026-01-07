/**
 * Onboarding types, validation, and localStorage helpers
 */

import type { PersonalityResult } from "./personality";
import type { DISCStyle, DISCDimension } from "./assessment/disc-types";
import type { HollandCareerFit } from "./assessment/holland-types";

export type ExperienceLevel = "junior" | "mid" | "senior";
export type JobStatus = "employed" | "seeking" | "freelancer";

// New focused profile types
export type WorkDomain =
  | "accounting"           // حسابداری
  | "finance"              // مالی / سرمایه‌گذاری
  | "insurance"            // بیمه
  | "auditing"             // حسابرسی
  | "financial_management" // مدیریت مالی
  | "tax"                  // مالیات
  | "industrial";          // صنعتی

export type EmploymentType =
  | "full_time"   // استخدام رسمی
  | "project"     // پروژه‌ای / پاره‌وقت
  | "consulting"; // مشاوره

export type CareerFocus =
  | "growth"      // رشد تخصصی در نقش فعلی
  | "pivot"       // تغییر مسیر شغلی
  | "leadership"  // مدیریت و رهبری تیم
  | "freelance"   // کار پروژه‌ای/فریلنس
  | "opportunity"; // جستجوی فرصت بهتر

export type DegreeLevel = "diploma" | "associate" | "bachelor" | "master" | "phd";

export type WorkExperience = {
  id: string;
  title: string;        // required
  company: string;      // required
  fromYear: string;     // required
  toYear: string;       // required or "Present"
  description?: string; // optional, max 120 chars
};

export type Education = {
  degree?: string;      // optional
  field?: string;       // optional
  university?: string;  // optional
};

export type DISCAssessmentResult = {
  primary: DISCStyle;
  secondary?: DISCStyle;
  scores: Record<DISCDimension, number>;  // 0-16 per dimension
  completedAt: string;
};

export type HollandAssessmentResult = {
  primary: HollandCareerFit;
  secondary?: HollandCareerFit;
  completedAt: string;
};

export type HollandFullAssessmentResult = {
  primary: HollandCareerFit;
  secondary: HollandCareerFit;
  tertiary: HollandCareerFit;
  cluster: string;  // Career cluster name
  roles: string[];  // Suggested job roles
  completedAt: string;
};

export type Assessments = {
  disc?: DISCAssessmentResult;  // DISC professional behavior assessment
  holland?: HollandAssessmentResult;  // Holland career fit assessment (quick)
  hollandFull?: HollandFullAssessmentResult;  // Holland comprehensive assessment with job roles
};

// New focused profile structure (v2)
export type RecentExperience = {
  role: string;
  domain: WorkDomain;
  employmentType: EmploymentType;
  company?: string;
  fromYear?: string;
  toYear?: string;
  description?: string;
};

export type LatestEducation = {
  degree: DegreeLevel;
  field: string;
  university?: string;
};

export type Certification = {
  name: string;
  provider?: string;
};

export type FocusedProfile = {
  // New required fields (v2)
  recentExperience?: RecentExperience;
  coreSkills?: string[];  // min 1, max 3
  careerFocus?: CareerFocus;
  latestEducation?: LatestEducation;

  // Optional
  certifications?: Certification[];

  // Profile media
  profilePhotoUrl?: string;        // Full-size avatar (200x200)
  profilePhotoThumbnailUrl?: string; // Thumbnail for UI (40x40)
  resumeUrl?: string;
  resumeFilename?: string;

  // Legacy fields (v1 - for backward compatibility)
  fullName?: string;
  city?: string;
  experienceLevel?: ExperienceLevel | "";
  jobStatus?: JobStatus | "";
  skills?: string[];
  summary?: string;
  experiences?: WorkExperience[];
  education?: Education;
  slug?: string;
  personality?: PersonalityResult;
  assessments?: Assessments;
};

// Legacy type (v1) - kept for backward compatibility
export type OnboardingProfile = {
  fullName: string;
  city: string;
  experienceLevel: ExperienceLevel | "";
  jobStatus: JobStatus | "";
  skills: string[];
  summary: string;
  experiences: WorkExperience[];  // max 3
  education?: Education;
  profilePhotoUrl?: string;  // URL to profile photo in Object Storage
  resumeUrl?: string;  // URL to resume PDF in Object Storage
  resumeFilename?: string;  // Original filename for display
  slug?: string;  // URL-safe slug for public profile (e.g. ali-mohammadi-a3k9)
  personality?: PersonalityResult;  // Work style from MBTI-based assessment
  assessments?: Assessments;  // Additional assessments (DISC, etc.)
};

export const DEFAULT_PROFILE: OnboardingProfile = {
  fullName: "",
  city: "",
  experienceLevel: "",
  jobStatus: "",
  skills: [],
  summary: "",
  experiences: [],
  education: undefined,
};

export const STORAGE_KEY = "karbarg:onboarding:profile:v1";
export const COMPLETION_KEY = "karbarg:onboarding:completed";

export const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: "junior", label: "تازه‌کار" },
  { value: "mid", label: "میان‌رده" },
  { value: "senior", label: "ارشد" },
];

export const JOB_STATUSES: { value: JobStatus; label: string; description: string }[] = [
  { value: "employed", label: "شاغل هستم", description: "در حال حاضر مشغول به کار هستم" },
  { value: "seeking", label: "جویای فرصت جدید", description: "به دنبال موقعیت شغلی جدید هستم" },
  { value: "freelancer", label: "فریلنسر / پروژه‌ای", description: "به صورت پروژه‌ای کار می‌کنم" },
];

export const SUGGESTED_SKILLS = [
  "Excel پیشرفته",
  "IFRS",
  "حسابداری صنعتی",
  "تحلیل بنیادی",
  "تحلیل تکنیکال",
  "ارزش‌گذاری",
  "حسابرسی داخلی",
  "حسابرسی مستقل",
  "مدل‌سازی مالی",
  "Power BI",
  "SQL",
  "بودجه‌ریزی",
  "مدیریت ریسک",
  "بیمه عمر",
  "بیمه درمان",
  "تجزیه و تحلیل صورت‌های مالی",
];

export const DEGREE_OPTIONS = [
  { value: "diploma", label: "دیپلم" },
  { value: "associate", label: "کاردانی" },
  { value: "bachelor", label: "کارشناسی" },
  { value: "master", label: "کارشناسی ارشد" },
  { value: "phd", label: "دکتری" },
];

// New focused profile constants
export const WORK_DOMAINS: { value: WorkDomain; label: string }[] = [
  { value: "accounting", label: "حسابداری" },
  { value: "finance", label: "مالی / سرمایه‌گذاری" },
  { value: "insurance", label: "بیمه" },
  { value: "auditing", label: "حسابرسی" },
  { value: "financial_management", label: "مدیریت مالی" },
  { value: "tax", label: "مالیات" },
  { value: "industrial", label: "صنعتی" },
];

export const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: "full_time", label: "استخدام رسمی" },
  { value: "project", label: "پروژه‌ای / پاره‌وقت" },
  { value: "consulting", label: "مشاوره" },
];

export const CAREER_FOCUS_OPTIONS: { value: CareerFocus; label: string; description: string }[] = [
  {
    value: "growth",
    label: "رشد تخصصی در نقش فعلی",
    description: "می‌خواهم در حوزه فعلی خودم عمیق‌تر شوم"
  },
  {
    value: "pivot",
    label: "تغییر مسیر شغلی",
    description: "به دنبال شروع مسیر جدیدی هستم"
  },
  {
    value: "leadership",
    label: "مدیریت و رهبری تیم",
    description: "می‌خواهم به سمت مدیریت حرکت کنم"
  },
  {
    value: "freelance",
    label: "کار پروژه‌ای/فریلنس",
    description: "ترجیح می‌دهم روی پروژه‌های مختلف کار کنم"
  },
  {
    value: "opportunity",
    label: "جستجوی فرصت بهتر",
    description: "آماده تغییر برای موقعیت مناسب‌تر هستم"
  },
];

// Core skills for finance/accounting professionals
export const CORE_SKILLS_OPTIONS = [
  "IFRS",
  "حسابداری صنعتی",
  "تحلیل بنیادی",
  "مدل‌سازی مالی",
  "Excel پیشرفته",
  "Power BI",
  "حسابداری مالیاتی",
  "حسابرسی داخلی",
  "کنترل داخلی",
  "ریسک مالی",
  "بودجه‌ریزی",
  "تحلیل صورت‌های مالی",
  "SQL",
  "Python مالی",
  "حسابرسی مستقل",
];

export type StepId = "step-1" | "step-2" | "step-3" | "step-4" | "step-5" | "review";

export type ValidationResult = {
  ok: boolean;
  errors: Record<string, string>;
};

// Validation for legacy OnboardingProfile
export function validateStep(stepId: StepId, data: OnboardingProfile): ValidationResult {
  const errors: Record<string, string> = {};

  switch (stepId) {
    case "step-1":
      if (!data.fullName.trim()) {
        errors.fullName = "نام را وارد کنید.";
      } else if (data.fullName.trim().length < 3) {
        errors.fullName = "نام باید حداقل ۳ حرف باشد.";
      }

      if (!data.city.trim()) {
        errors.city = "شهر را وارد کنید.";
      }

      if (!data.experienceLevel) {
        errors.experienceLevel = "سطح تجربه را انتخاب کنید.";
      }
      break;

    case "step-2":
      if (!data.jobStatus) {
        errors.jobStatus = "یکی از گزینه‌ها را انتخاب کنید.";
      }
      break;

    case "step-3":
      if (data.skills.length < 3) {
        errors.skills = "حداقل ۳ مهارت لازم است.";
      } else if (data.skills.length > 10) {
        errors.skills = "حداکثر ۱۰ مهارت می‌توانید اضافه کنید.";
      }
      break;

    case "step-4":
      // Summary is optional
      if (data.summary.length > 300) {
        errors.summary = "متن خلاصه نباید بیشتر از ۳۰۰ کاراکتر باشد.";
      }
      break;

    case "review":
      // All steps must be valid
      const step1 = validateStep("step-1", data);
      const step2 = validateStep("step-2", data);
      const step3 = validateStep("step-3", data);
      const step4 = validateStep("step-4", data);

      if (!step1.ok) Object.assign(errors, step1.errors);
      if (!step2.ok) Object.assign(errors, step2.errors);
      if (!step3.ok) Object.assign(errors, step3.errors);
      if (!step4.ok) Object.assign(errors, step4.errors);
      break;
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  };
}

// Validation for new FocusedProfile
export function validateFocusedStep(stepId: StepId, data: FocusedProfile): ValidationResult {
  const errors: Record<string, string> = {};

  switch (stepId) {
    case "step-1":
      // Recent Experience
      if (!data.recentExperience?.role?.trim()) {
        errors.role = "عنوان نقش را وارد کنید.";
      }
      if (!data.recentExperience?.domain) {
        errors.domain = "حوزه فعالیت را انتخاب کنید.";
      }
      if (!data.recentExperience?.employmentType) {
        errors.employmentType = "نوع همکاری را انتخاب کنید.";
      }
      if (data.recentExperience?.description && data.recentExperience.description.length > 120) {
        errors.description = "توضیحات نباید بیشتر از ۱۲۰ کاراکتر باشد.";
      }
      break;

    case "step-2":
      // Core Skills
      if (!data.coreSkills || data.coreSkills.length < 1) {
        errors.coreSkills = "حداقل ۱ مهارت انتخاب کنید.";
      } else if (data.coreSkills.length > 3) {
        errors.coreSkills = "حداکثر ۳ مهارت می‌توانید انتخاب کنید.";
      }
      break;

    case "step-3":
      // Career Focus
      if (!data.careerFocus) {
        errors.careerFocus = "تمرکز شغلی خود را انتخاب کنید.";
      }
      break;

    case "step-4":
      // Latest Education
      if (!data.latestEducation?.degree) {
        errors.degree = "مقطع تحصیلی را انتخاب کنید.";
      }
      if (!data.latestEducation?.field?.trim()) {
        errors.field = "رشته تحصیلی را وارد کنید.";
      }
      break;

    case "step-5":
      // Certifications (optional - no required validation)
      if (data.certifications && data.certifications.length > 3) {
        errors.certifications = "حداکثر ۳ دوره می‌توانید اضافه کنید.";
      }
      break;

    case "review":
      // All steps must be valid
      const step1 = validateFocusedStep("step-1", data);
      const step2 = validateFocusedStep("step-2", data);
      const step3 = validateFocusedStep("step-3", data);
      const step4 = validateFocusedStep("step-4", data);
      const step5 = validateFocusedStep("step-5", data);

      if (!step1.ok) Object.assign(errors, step1.errors);
      if (!step2.ok) Object.assign(errors, step2.errors);
      if (!step3.ok) Object.assign(errors, step3.errors);
      if (!step4.ok) Object.assign(errors, step4.errors);
      if (!step5.ok) Object.assign(errors, step5.errors);
      break;
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  };
}

export function loadFromStorage(): OnboardingProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PROFILE;

    const parsed = JSON.parse(stored);
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch (error) {
    console.error("Failed to load onboarding data:", error);
    return DEFAULT_PROFILE;
  }
}

export function saveToStorage(data: OnboardingProfile): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save onboarding data:", error);
  }
}

export function markOnboardingComplete(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMPLETION_KEY, "true");
}

export function isOnboardingComplete(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COMPLETION_KEY) === "true";
}

export function clearOnboardingData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(COMPLETION_KEY);
}

/**
 * Get the first incomplete step based on validation (legacy)
 */
export function getFirstIncompleteStep(data: OnboardingProfile): string {
  if (!validateStep("step-1", data).ok) return "/app/profile/onboarding/step-1-basic";
  if (!validateStep("step-2", data).ok) return "/app/profile/onboarding/step-2-status";
  if (!validateStep("step-3", data).ok) return "/app/profile/onboarding/step-3-skills";
  // Step 4 is optional, so skip validation check
  return "/app/profile/onboarding/step-4-summary";
}

/**
 * Get the first incomplete step for FocusedProfile
 */
export function getFirstIncompleteFocusedStep(data: FocusedProfile): string {
  if (!validateFocusedStep("step-1", data).ok) return "/app/profile/onboarding/step-1-basic";
  if (!validateFocusedStep("step-2", data).ok) return "/app/profile/onboarding/step-2-status";
  if (!validateFocusedStep("step-3", data).ok) return "/app/profile/onboarding/step-3-skills";
  if (!validateFocusedStep("step-4", data).ok) return "/app/profile/onboarding/step-4-summary";
  // Step 5 (certifications) is optional
  return "/app/profile/onboarding/step-5-certifications";
}

// Storage helpers for FocusedProfile
export function loadFocusedFromStorage(): FocusedProfile {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    const parsed = JSON.parse(stored);
    return parsed;
  } catch (error) {
    console.error("Failed to load focused profile:", error);
    return {};
  }
}

export function saveFocusedToStorage(data: FocusedProfile): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save focused profile:", error);
  }
}
