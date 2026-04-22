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
      title: "بیایید پروفایل حرفه‌ای شما را شروع کنیم",
      description:
        "با تکمیل اطلاعات پایه، پروفایل شما در جستجوی کارفرماها نمایش داده می‌شود.",
      primaryAction: {
        label: "شروع تکمیل پروفایل",
        href: "/app/profile/onboarding/step-1-basic",
      },
      hint: "⏱ فقط ۲ دقیقه زمان می‌برد",
    },
  },

  // 2️⃣ Profile Photo
  profilePhoto: {
    isEmpty: (profile) => {
      if (!profile) return true;
      return !profile.profilePhotoUrl;
    },
    config: {
      icon: "📸",
      title: "هنوز عکسی برای پروفایل انتخاب نشده",
      description:
        "پروفایل‌هایی که عکس دارند تا ۳ برابر بیشتر دیده می‌شوند. یک عکس ساده و رسمی کافی است.",
      primaryAction: {
        label: "آپلود عکس پروفایل",
        href: "/app/profile/photo",
      },
      benefit: "۳ برابر بازدید بیشتر",
      hint: "JPG یا PNG – حداکثر ۵ مگابایت",
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
      title: "مهارت‌های کلیدی شما هنوز ثبت نشده‌اند",
      description:
        "فقط ۲ تا ۵ مهارت اصلی کافی است تا کارفرماها سریع‌تر شما را پیدا کنند.",
      primaryAction: {
        label: "افزودن مهارت‌ها",
        href: "/app/profile/onboarding/step-2-status",
      },
      hint: "مثال: IFRS، تحلیل مالی، Excel پیشرفته",
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
      icon: "🏢",
      title: "سابقه کاری هنوز اضافه نشده",
      description:
        "فقط آخرین تجربه کاری شما برای شروع کافی است. نیازی به وارد کردن همه سوابق نیست.",
      primaryAction: {
        label: "افزودن سابقه کاری",
        href: "/app/profile/onboarding/step-1-basic",
      },
      hint: "اختیاری، اما بسیار تأثیرگذار",
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
      title: "تحصیلات ثبت نشده است",
      description:
        "اگر تحصیلات مرتبط دارید، اضافه‌کردن آخرین مدرک به اعتبار پروفایل کمک می‌کند.",
      primaryAction: {
        label: "افزودن تحصیلات",
        href: "/app/profile/onboarding/step-4-summary",
      },
      hint: "فقط آخرین مدرک کافی است",
    },
  },

  // 6️⃣ Resume (PDF)
  resume: {
    isEmpty: (profile) => {
      if (!profile) return true;
      return !profile.resumeUrl && !profile.slug;
    },
    config: (profile) => {
      if (!profile) {
        return {
          icon: "📄",
          title: "رزومه شما هنوز ساخته نشده",
          description:
            "پس از تکمیل پروفایل، رزومه حرفه‌ای شما به‌صورت خودکار ساخته می‌شود.",
          primaryAction: {
            label: "تکمیل پروفایل",
            href: "/app/profile/onboarding",
          },
          hint: "تکمیل فعلی: 0٪",
        };
      }

      const strength = calculateProfileStrength(profile as FocusedProfile);
      const isProfileIncomplete = strength.percentage < 60;

      if (isProfileIncomplete) {
        return {
          icon: "📄",
          title: "رزومه شما هنوز ساخته نشده",
          description:
            "پس از تکمیل پروفایل، رزومه حرفه‌ای شما به‌صورت خودکار ساخته می‌شود.",
          primaryAction: {
            label: "تکمیل پروفایل",
            href: "/app/profile/onboarding",
          },
          hint: `تکمیل فعلی: ${strength.percentage}٪`,
        };
      }

      return {
        icon: "✅",
        title: "رزومه شما آماده است",
        description:
          "می‌توانید رزومه را مشاهده یا به‌صورت PDF دانلود کنید.",
        primaryAction: {
          label: "مشاهده و دانلود رزومه",
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
      if (!profile) {
        return {
          icon: "🔗",
          title: "لینک پروفایل شما هنوز فعال نشده",
          description:
            "پس از تکمیل حداقل اطلاعات، لینک اختصاصی شما فعال می‌شود تا برای کارفرما ارسال کنید.",
          primaryAction: {
            label: "تکمیل اطلاعات باقی‌مانده",
            href: "/app/profile/onboarding",
          },
          hint: "شروع از ابتدا",
        };
      }

      const strength = calculateProfileStrength(profile as FocusedProfile);
      const isProfileIncomplete = strength.percentage < 60;
      const remaining = strength.missingHighImpact?.length || 0;

      if (isProfileIncomplete) {
        return {
          icon: "🔗",
          title: "لینک پروفایل شما هنوز فعال نشده",
          description:
            "پس از تکمیل حداقل اطلاعات، لینک اختصاصی شما فعال می‌شود تا برای کارفرما ارسال کنید.",
          primaryAction: {
            label: "تکمیل اطلاعات باقی‌مانده",
            href: "/app/profile/onboarding",
          },
          hint: `${remaining} مرحله باقی مانده`,
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
