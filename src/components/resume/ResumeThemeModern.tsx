import {
  EXPERIENCE_LEVELS,
  JOB_STATUSES,
  DEGREE_OPTIONS,
  type OnboardingProfile,
} from "@/lib/onboarding";
import { getLayoutMode, getLayoutClasses } from "@/lib/resumeLayout";

// Static personality type descriptions
const PERSONALITY_TYPES: Record<string, string> = {
  analytical: "تحلیلی",
  creative: "خلاق",
  practical: "عملی",
  social: "اجتماعی",
};

interface ResumeThemeModernProps {
  profile: OnboardingProfile;
}

export default function ResumeThemeModern({
  profile,
}: ResumeThemeModernProps) {
  const experienceLabel = EXPERIENCE_LEVELS.find(
    (e) => e.value === profile.experienceLevel
  )?.label;
  const jobStatusLabel = JOB_STATUSES.find(
    (s) => s.value === profile.jobStatus
  )?.label;

  // Auto-layout logic
  const layoutMode = getLayoutMode(profile);
  const layoutClasses = getLayoutClasses(layoutMode);

  return (
    <div className={`resume-content flex h-full ${layoutClasses.containerMinHeight}`}>
      {/* LEFT COLUMN - Dynamic Width */}
      <aside className={`${layoutClasses.sidebarWidth} bg-gray-50 p-6 flex flex-col border-l border-gray-200`}>
        {/* Name & Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
            {profile.fullName}
          </h1>
          {/* Professional title - TODO: Add to profile type if needed */}
          {/* {profile.professionalTitle && (
            <p className="text-sm text-gray-600 font-medium">
              {profile.professionalTitle}
            </p>
          )} */}
        </div>

        {/* Divider */}
        <div className={layoutClasses.dividerClasses}></div>

        {/* Location */}
        {profile.city && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              محل سکونت
            </h3>
            <p className="text-sm text-gray-900">{profile.city}</p>
          </div>
        )}

        {/* Experience Level */}
        {experienceLabel && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              سطح تجربه
            </h3>
            <p className="text-sm text-gray-900">{experienceLabel}</p>
          </div>
        )}

        {/* Job Status */}
        {jobStatusLabel && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              وضعیت شغلی
            </h3>
            <p className="text-sm text-gray-900">{jobStatusLabel}</p>
          </div>
        )}

        {/* Divider */}
        <div className={layoutClasses.dividerClasses}></div>

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              مهارت‌ها
            </h3>
            <ul className={layoutMode === 'dense' ? 'space-y-1.5' : 'space-y-2'}>
              {profile.skills.slice(0, 10).map((skill, index) => (
                <li key={index} className="text-sm text-gray-800">
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Personality Type - TODO: Implement when assessment tests are ready */}
        {/* {profile.personalityType &&
          PERSONALITY_TYPES[profile.personalityType] && (
            <>
              <div className="border-t border-gray-300 my-4"></div>
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  سبک کاری
                </h3>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {PERSONALITY_TYPES[profile.personalityType]}
                </p>
              </div>
            </>
          )} */}

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-300">
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            ساخته شده با کاربرگ
          </p>
        </div>
      </aside>

      {/* RIGHT COLUMN - Dynamic Width */}
      <main className={`${layoutClasses.mainWidth} p-8`}>
        {/* Professional Summary */}
        {profile.summary && (
          <section className={layoutMode === 'short' ? 'mb-10' : layoutMode === 'dense' ? 'mb-6' : 'mb-8'}>
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-gray-900">
              خلاصه حرفه‌ای
            </h2>
            <p className={`${layoutClasses.summaryClasses} text-gray-700`}>
              {profile.summary}
            </p>
          </section>
        )}

        {/* Work Experience */}
        {profile.experiences && profile.experiences.length > 0 && (
          <section className={`${layoutMode === 'short' ? 'mb-10' : layoutMode === 'dense' ? 'mb-6' : 'mb-8'} break-inside-avoid`}>
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-900">
              سوابق کاری
            </h2>
            <div className={layoutClasses.experienceSpacing}>
              {profile.experiences.map((exp) => (
                <div key={exp.id} className="break-inside-avoid">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 text-base">
                      {exp.title}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap mr-3">
                      {exp.fromYear} - {exp.toYear}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium mb-2">
                    {exp.company}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {profile.education && (profile.education.degree || profile.education.field || profile.education.university) && (
          <section className="mb-8 break-inside-avoid">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-900">
              تحصیلات
            </h2>
            <div className="text-sm space-y-2">
              {profile.education.degree && (
                <p>
                  <span className="text-gray-600">مقطع:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {DEGREE_OPTIONS.find((d) => d.value === profile.education?.degree)?.label}
                  </span>
                </p>
              )}
              {profile.education.field && (
                <p>
                  <span className="text-gray-600">رشته:</span>{" "}
                  <span className="font-medium text-gray-900">{profile.education.field}</span>
                </p>
              )}
              {profile.education.university && (
                <p>
                  <span className="text-gray-600">دانشگاه:</span>{" "}
                  <span className="font-medium text-gray-900">{profile.education.university}</span>
                </p>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
