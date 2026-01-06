import type { EmptyStateConfig, SectionKey } from "@/types/emptyState";
import type { OnboardingProfile, FocusedProfile } from "@/lib/onboarding";
import { calculateProfileStrength } from "@/lib/profileStrength";

/**
 * Empty State Presets for Karbarg Profile Sections
 *
 * Each preset defines:
 * - isEmpty: detection logic
 * - config: empty state UI configuration
 */

export const EMPTY_STATE_PRESETS: Record<
  SectionKey,
  {
    isEmpty: (profile: OnboardingProfile | FocusedProfile | null) => boolean;
    config: EmptyStateConfig | ((profile: OnboardingProfile | FocusedProfile | null) => EmptyStateConfig);
  }
> = {
  // 1️⃣ Basic Info
  basicInfo: {
    isEmpty: (profile) => {
      if (!profile) return true;
      const focused = profile as FocusedProfile;
      return !focused.fullName || !focused.recentExperience?.role;
    },
    config: {
      icon: "👋",
      title: "پروفایل حرفه‌ای شما هنوز شروع نشده",
      description:
        "با تکمیل اطلاعات پایه، پروفایل شما در جستجوی کارفرماها نمایش داده می‌شود.",
      primaryAction: {
        label: "شروع تکمیل پروفایل",
        href: "/app/profile/onboarding/step-1-basic",
      },
      hint: "فقط ۲ دقیقه زمان می‌برد",
    },
  },

  // 2️⃣ Profile Photo
  profilePhoto: {
    isEmpty: (profile) => {
      if (!profile) return true;
      return !profile.photoUrl;
    },
    config: {
      icon: "📸",
      title: "پروفایل با عکس، بیشتر دیده می‌شود",
      description:
        "یک عکس ساده و رسمی کافی است. پروفایل‌های با عکس تا ۳ برابر بیشتر توسط کارفرماها بازدید می‌شوند.",
      primaryAction: {
        label: "آپلود عکس پروفایل",
        href: "/app/profile/photo",
      },
      benefit: "۳ برابر بازدید بیشتر",
    },
  },

  // 3️⃣ Skills
  skills: {
    isEmpty: (profile) => {
      if (!profile) return true;
      const focused = profile as FocusedProfile;
      const totalSkills =
        (focused.coreSkills?.length || 0) + (focused.skills?.length || 0);
      return totalSkills === 0;
    },
    config: {
      icon: "⭐",
      title: "مهارت‌های تخصصی شما چیست؟",
      description:
        "انتخاب حداقل یک مهارت تخصصی، شما را در جستجوی کارفرماها قابل پیدا می‌کند.",
      primaryAction: {
        label: "افزودن مهارت‌ها",
        href: "/app/profile/onboarding/step-2-status",
      },
      hint: "حداقل ۱ مهارت، حداکثر ۲ مهارت اصلی",
    },
  },

  // 4️⃣ Work Experience
  experience: {
    isEmpty: (profile) => {
      if (!profile) return true;
      const focused = profile as FocusedProfile;
      return (
        !focused.recentExperience?.role &&
        (!focused.experiences || focused.experiences.length === 0)
      );
    },
    config: {
      icon: "💼",
      title: "آخرین تجربه کاری شما مهم‌تر از کل رزومه است",
      description:
        "فقط آخرین موقعیت شغلی خود را اضافه کنید. این بخش به کارفرماها کمک می‌کند تا بهتر شما را بشناسند.",
      primaryAction: {
        label: "افزودن سابقه کاری",
        href: "/app/profile/onboarding/step-1-basic",
      },
      secondaryAction: {
        label: "فعلاً سابقه کاری ندارم",
        onClick: () => {
          // Mark as skipped in localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem("karbarg:profile:experience:skipped", "true");
          }
        },
      },
      hint: "کارفرماها این بخش را می‌بینند",
    },
  },

  // 5️⃣ Education
  education: {
    isEmpty: (profile) => {
      if (!profile) return true;
      const focused = profile as FocusedProfile;
      return !focused.latestEducation?.degree;
    },
    config: {
      icon: "🎓",
      title: "تحصیلات مرتبط دارید؟",
      description:
        "اگر تحصیلات مرتبط با حوزه مالی دارید، این بخش به اعتبار پروفایل شما کمک می‌کند.",
      primaryAction: {
        label: "افزودن آخرین مدرک تحصیلی",
        href: "/app/profile/onboarding/step-4-summary",
      },
      hint: "اختیاری، اما پیشنهاد می‌شود",
    },
  },

  // 6️⃣ Resume (PDF)
  resume: {
    isEmpty: (profile) => {
      if (!profile) return true;
      return !profile.resumeUrl && !profile.slug;
    },
    config: (profile) => {
      const strength = calculateProfileStrength(profile as FocusedProfile);
      const isProfileIncomplete = strength.percentage < 60;

      if (isProfileIncomplete) {
        return {
          icon: "📄",
          title: "رزومه حرفه‌ای شما بعد از تکمیل پروفایل ساخته می‌شود",
          description:
            "ابتدا پروفایل را تکمیل کنید تا رزومه حرفه‌ای شما به صورت خودکار ساخته شود.",
          primaryAction: {
            label: `تکمیل پروفایل (${strength.percentage}٪ تکمیل شده)`,
            href: "/app/profile/onboarding",
          },
          hint: `${strength.missingHighImpact?.slice(0, 2).join("، ")} مانده است`,
        };
      }

      return {
        icon: "📄",
        title: "رزومه شما آماده ساخت است",
        description:
          "با یک کلیک، رزومه حرفه‌ای خود را بسازید و دانلود کنید.",
        primaryAction: {
          label: "ساخت رزومه",
          href: "/app/resume",
        },
      };
    },
  },

  // 7️⃣ Public Profile Link
  publicProfile: {
    isEmpty: (profile) => {
      if (!profile) return true;
      return !profile.slug;
    },
    config: (profile) => {
      const strength = calculateProfileStrength(profile as FocusedProfile);
      const isProfileIncomplete = strength.percentage < 60;
      const remaining = strength.missingHighImpact?.length || 0;

      if (isProfileIncomplete) {
        return {
          icon: "🔗",
          title: "لینک پروفایل شما بعد از تکمیل حداقل اطلاعات فعال می‌شود",
          description:
            "این لینک را می‌توانید برای کارفرما یا شبکه‌های اجتماعی ارسال کنید.",
          primaryAction: {
            label: "تکمیل پروفایل",
            href: "/app/profile/onboarding",
          },
          hint: `${remaining} بخش دیگر مانده`,
        };
      }

      return {
        icon: "🔗",
        title: "پروفایل عمومی شما آماده اشتراک‌گذاری است",
        description:
          "لینک پروفایل خود را برای کارفرماها یا در شبکه‌های اجتماعی به اشتراک بگذارید.",
        primaryAction: {
          label: "مشاهده لینک عمومی",
          href: `/u/${profile.slug || ""}`,
        },
      };
    },
  },
};

/**
 * Check if a section is empty
 */
export function isSectionEmpty(
  section: SectionKey,
  profile: OnboardingProfile | FocusedProfile | null
): boolean {
  const preset = EMPTY_STATE_PRESETS[section];
  if (!preset) return false;
  return preset.isEmpty(profile);
}

/**
 * Get empty state config for a section
 */
export function getEmptyStateConfig(
  section: SectionKey,
  profile: OnboardingProfile | FocusedProfile | null
): EmptyStateConfig {
  const preset = EMPTY_STATE_PRESETS[section];
  if (!preset) {
    throw new Error(`No preset found for section: ${section}`);
  }

  if (typeof preset.config === "function") {
    return preset.config(profile);
  }

  return preset.config;
}
