import {
  EXPERIENCE_LEVELS,
  JOB_STATUSES,
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
      {profile.workExperiences && profile.workExperiences.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
            سوابق کاری
          </h2>
          <div className="space-y-4">
            {profile.workExperiences.map((exp, index) => (
              <div key={index} className="text-sm">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900">
                    {exp.jobTitle}
                  </h3>
                  <span className="text-gray-600 text-xs">
                    {exp.startDate}
                    {exp.isCurrent
                      ? " - اکنون"
                      : exp.endDate
                        ? ` - ${exp.endDate}`
                        : ""}
                  </span>
                </div>
                <p className="text-gray-700 mb-1">{exp.companyName}</p>
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
      {profile.education && profile.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
            تحصیلات
          </h2>
          <div className="space-y-4">
            {profile.education.map((edu, index) => (
              <div key={index} className="text-sm">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900">
                    {edu.fieldOfStudy}
                  </h3>
                  <span className="text-gray-600 text-xs">
                    {edu.startDate}
                    {edu.isCurrent
                      ? " - اکنون"
                      : edu.endDate
                        ? ` - ${edu.endDate}`
                        : ""}
                  </span>
                </div>
                <p className="text-gray-700 mb-1">
                  {edu.degree} • {edu.institutionName}
                </p>
                {edu.grade && (
                  <p className="text-gray-600 text-xs">معدل: {edu.grade}</p>
                )}
              </div>
            ))}
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
