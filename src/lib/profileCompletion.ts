import { type OnboardingProfile } from "./onboarding";

export interface ProfileCompletionStep {
  id: string;
  title: string;
  actionHref: string;
  completed: boolean;
  required: boolean;
}

export interface ProfileCompletionResult {
  percentage: number;
  isComplete: boolean;
  requiredSteps: ProfileCompletionStep[];
  optionalSteps: ProfileCompletionStep[];
  missingRequired: ProfileCompletionStep[];
}

/**
 * Calculate profile completion status
 *
 * Required for 100% completion:
 * - اطلاعات پایه (fullName, city, experienceLevel)
 * - وضعیت شغلی (jobStatus)
 * - مهارت‌ها (minimum 3)
 *
 * Optional (don't affect 100%):
 * - خلاصه حرفه‌ای (summary)
 * - آزمون شخصیت (personalityType)
 */
export function getProfileCompletion(
  profile: OnboardingProfile | null
): ProfileCompletionResult {
  if (!profile) {
    return {
      percentage: 0,
      isComplete: false,
      requiredSteps: [],
      optionalSteps: [],
      missingRequired: [],
    };
  }

  // Define required steps
  const requiredSteps: ProfileCompletionStep[] = [
    {
      id: "basic_info",
      title: "اطلاعات پایه (نام، شهر، سطح تجربه)",
      actionHref: "/app/profile/onboarding/step-1-basic",
      completed:
        !!profile.fullName &&
        !!profile.city &&
        !!profile.experienceLevel,
      required: true,
    },
    {
      id: "job_status",
      title: "وضعیت شغلی",
      actionHref: "/app/profile/onboarding/step-2-status",
      completed: !!profile.jobStatus,
      required: true,
    },
    {
      id: "skills",
      title: "مهارت‌ها (حداقل ۳ مهارت)",
      actionHref: "/app/profile/onboarding/step-3-skills",
      completed: (profile.skills?.length ?? 0) >= 3,
      required: true,
    },
  ];

  // Define optional steps
  const optionalSteps: ProfileCompletionStep[] = [
    {
      id: "summary",
      title: "خلاصه حرفه‌ای",
      actionHref: "/app/profile/onboarding/step-4-summary",
      completed: !!profile.summary,
      required: false,
    },
    {
      id: "work_experience",
      title: "سوابق کاری",
      actionHref: "/app/profile",
      completed: (profile.experiences?.length ?? 0) > 0,
      required: false,
    },
    {
      id: "education",
      title: "تحصیلات",
      actionHref: "/app/profile",
      completed: !!(profile.education?.degree || profile.education?.field || profile.education?.university),
      required: false,
    },
    {
      id: "personality",
      title: "آزمون سبک کاری",
      actionHref: "/app/personality",
      completed: !!(profile.personality?.styles || profile.personality?.type),
      required: false,
    },
  ];

  // Calculate completion
  const totalRequired = requiredSteps.length;
  const completedRequired = requiredSteps.filter((s) => s.completed).length;
  const missingRequired = requiredSteps.filter((s) => !s.completed);

  // Percentage based on required steps only
  const percentage = Math.round((completedRequired / totalRequired) * 100);
  const isComplete = percentage === 100;

  return {
    percentage,
    isComplete,
    requiredSteps,
    optionalSteps,
    missingRequired,
  };
}

/**
 * Check if profile is ready for resume download
 */
export function canDownloadResume(profile: OnboardingProfile | null): boolean {
  const completion = getProfileCompletion(profile);
  return completion.isComplete;
}
