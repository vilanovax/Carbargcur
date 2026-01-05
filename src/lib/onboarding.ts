/**
 * Onboarding types, validation, and localStorage helpers
 */

import type { PersonalityResult } from "./personality";
import type { DISCStyle, DISCDimension } from "./assessment/disc-types";

export type ExperienceLevel = "junior" | "mid" | "senior";
export type JobStatus = "employed" | "seeking" | "freelancer";

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

export type Assessments = {
  disc?: DISCAssessmentResult;  // DISC professional behavior assessment
};

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

export type StepId = "step-1" | "step-2" | "step-3" | "step-4" | "review";

export type ValidationResult = {
  ok: boolean;
  errors: Record<string, string>;
};

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
 * Get the first incomplete step based on validation
 */
export function getFirstIncompleteStep(data: OnboardingProfile): string {
  if (!validateStep("step-1", data).ok) return "/app/profile/onboarding/step-1-basic";
  if (!validateStep("step-2", data).ok) return "/app/profile/onboarding/step-2-status";
  if (!validateStep("step-3", data).ok) return "/app/profile/onboarding/step-3-skills";
  // Step 4 is optional, so skip validation check
  return "/app/profile/onboarding/step-4-summary";
}
