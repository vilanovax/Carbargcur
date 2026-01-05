import {
  EXPERIENCE_LEVELS,
  JOB_STATUSES,
  DEGREE_OPTIONS,
  type OnboardingProfile,
} from "@/lib/onboarding";

// Static personality type descriptions
const PERSONALITY_TYPES: Record<string, string> = {
  analytical: "تحلیلی",
  creative: "خلاق",
  practical: "عملی",
  social: "اجتماعی",
};

interface ResumeThemeClassicProps {
  profile: OnboardingProfile;
}

export default function ResumeThemeClassic({
  profile,
}: ResumeThemeClassicProps) {
  const experienceLabel = EXPERIENCE_LEVELS.find(
    (e) => e.value === profile.experienceLevel
  )?.label;
  const jobStatusLabel = JOB_STATUSES.find(
    (s) => s.value === profile.jobStatus
  )?.label;

  return (
    <div className="resume-content p-8 md:p-10 lg:p-12">
      {/* Header Section */}
      <header className="border-b border-gray-300 pb-6 mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {profile.fullName}
        </h1>
        {profile.professionalTitle && (
          <p className="text-lg md:text-xl text-gray-700 mb-3">
            {profile.professionalTitle}
          </p>
        )}

        {/* Contact & Status Info */}
        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-3">
          {profile.city && <span>{profile.city}</span>}
          {experienceLabel && (
            <>
              <span>•</span>
              <span>{experienceLabel}</span>
            </>
          )}
          {jobStatusLabel && (
            <>
              <span>•</span>
              <span>{jobStatusLabel}</span>
            </>
          )}
        </div>
      </header>

      {/* Professional Summary */}
      {profile.summary && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
            خلاصه حرفه‌ای
          </h2>
          <p className="text-sm leading-relaxed text-gray-700">
            {profile.summary}
          </p>
        </section>
      )}

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
            مهارت‌ها و تخصص‌ها
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {profile.skills.slice(0, 10).map((skill, index) => (
              <div key={index} className="text-gray-700">
                • {skill}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Work Experience */}
      {profile.experiences && profile.experiences.length > 0 && (
        <section className="mb-6 break-inside-avoid">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
            سوابق کاری
          </h2>
          <div className="space-y-4">
            {profile.experiences.map((exp) => (
              <div key={exp.id} className="text-sm break-inside-avoid">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900">
                    {exp.title}
                  </h3>
                  <span className="text-gray-600 text-xs whitespace-nowrap mr-3">
                    {exp.fromYear} - {exp.toYear}
                  </span>
                </div>
                <p className="text-gray-700 mb-1">{exp.company}</p>
                {exp.description && (
                  <p className="text-gray-600 text-xs leading-relaxed">
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
        <section className="mb-6 break-inside-avoid">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
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

      {/* Personality Type */}
      {profile.personalityType && PERSONALITY_TYPES[profile.personalityType] && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
            سبک کاری
          </h2>
          <p className="text-sm text-gray-700">
            {PERSONALITY_TYPES[profile.personalityType]}
          </p>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t border-gray-300 text-center">
        <p className="text-xs text-gray-500">
          این رزومه توسط پلتفرم کاربرگ ساخته شده است •{" "}
          <span className="text-gray-400">karbarg.ir</span>
        </p>
      </footer>
    </div>
  );
}
