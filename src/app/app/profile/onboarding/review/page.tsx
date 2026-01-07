"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, CheckCircle2, Sparkles } from "lucide-react";
import {
  type FocusedProfile,
  loadFocusedFromStorage,
  validateFocusedStep,
  getFirstIncompleteStep,
  markOnboardingComplete,
  WORK_DOMAINS,
  EMPLOYMENT_TYPES,
  CAREER_FOCUS_OPTIONS,
  DEGREE_OPTIONS,
} from "@/lib/onboarding";
import { formatWorkExperienceDate } from "@/lib/jalaali";
import {
  calculateProfileStrength,
  getStrengthColor,
  getProgressBarColor,
  getStrengthMessage,
} from "@/lib/profileStrength";
import { trackProfileEvent } from "@/lib/profileEvents";

export default function ReviewPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<FocusedProfile | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadFocusedFromStorage();
    setProfile(loaded);

    // Validate required steps (1-4) - redirect if any incomplete
    const step1Valid = validateFocusedStep("step-1", loaded);
    const step2Valid = validateFocusedStep("step-2", loaded);
    const step3Valid = validateFocusedStep("step-3", loaded);
    const step4Valid = validateFocusedStep("step-4", loaded);

    if (!step1Valid.ok || !step2Valid.ok || !step3Valid.ok || !step4Valid.ok) {
      router.push(getFirstIncompleteStep(loaded));
    }
  }, [router]);

  if (!profile) {
    return <div className="container max-w-2xl mx-auto px-4 py-8">در حال بارگذاری...</div>;
  }

  const handleFinish = () => {
    // Mark onboarding as complete
    markOnboardingComplete();

    // Track profile completion event
    trackProfileEvent("profile_completed", {
      strength: calculateProfileStrength(profile).percentage,
    });

    // TODO: In future, send data to backend API here
    console.log("Onboarding complete! Profile data:", profile);

    // Redirect to profile page
    router.push("/app/profile");
  };

  const strength = calculateProfileStrength(profile);

  const domainLabel = profile.recentExperience?.domain
    ? WORK_DOMAINS.find((d) => d.value === profile.recentExperience?.domain)?.label
    : null;

  const employmentTypeLabel = profile.recentExperience?.employmentType
    ? EMPLOYMENT_TYPES.find((e) => e.value === profile.recentExperience?.employmentType)?.label
    : null;

  const careerFocusOption = profile.careerFocus
    ? CAREER_FOCUS_OPTIONS.find((c) => c.value === profile.careerFocus)
    : null;

  const degreeLabel = profile.latestEducation?.degree
    ? DEGREE_OPTIONS.find((d) => d.value === profile.latestEducation?.degree)?.label
    : null;

  return (
    <OnboardingShell
      currentStep={6}
      title="پروفایل حرفه‌ای شما تقویت شد 🎯"
      description="یک‌بار اطلاعات را مرور کنید و سپس نهایی کنید."
    >
      <div className="space-y-6">
        {/* Profile Strength Meter */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-1">قدرت پروفایل</h3>
                  <p className="text-sm text-muted-foreground">
                    {getStrengthMessage(strength.percentage)}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getStrengthColor(strength.percentage).split(' ')[0]}`}>
                    {strength.percentage}٪
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressBarColor(strength.percentage)} transition-all`}
                  style={{ width: `${strength.percentage}%` }}
                />
              </div>

              {/* Missing Steps */}
              {strength.missingHighImpact.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  برای افزایش قدرت: {strength.missingHighImpact.join("، ")}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Experience */}
        {profile.recentExperience && (
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">تجربه کاری اخیر</h3>
                </div>
                <Link href="/app/profile/onboarding/step-1-basic">
                  <Button variant="ghost" size="sm" className="h-8 gap-1">
                    <Pencil className="w-3 h-3" />
                    ویرایش
                  </Button>
                </Link>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">نقش: </span>
                  <span className="font-medium">{profile.recentExperience.role}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">حوزه: </span>
                  <span>{domainLabel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">نوع همکاری: </span>
                  <span>{employmentTypeLabel}</span>
                </div>
                {profile.recentExperience.company && (
                  <div>
                    <span className="text-muted-foreground">شرکت: </span>
                    <span>{profile.recentExperience.company}</span>
                  </div>
                )}
                {profile.recentExperience.fromYear && profile.recentExperience.toYear && (
                  <div>
                    <span className="text-muted-foreground">مدت: </span>
                    <span>
                      {formatWorkExperienceDate(profile.recentExperience.fromYear)} - {formatWorkExperienceDate(profile.recentExperience.toYear)}
                    </span>
                  </div>
                )}
                {profile.recentExperience.description && (
                  <div>
                    <span className="text-muted-foreground">توضیح: </span>
                    <span className="text-xs">{profile.recentExperience.description}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Core Skills */}
        {profile.coreSkills && profile.coreSkills.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">مهارت‌های کلیدی</h3>
                </div>
                <Link href="/app/profile/onboarding/step-2-status">
                  <Button variant="ghost" size="sm" className="h-8 gap-1">
                    <Pencil className="w-3 h-3" />
                    ویرایش
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.coreSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-blue-100 text-blue-700">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Career Focus */}
        {profile.careerFocus && (
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">تمرکز شغلی</h3>
                </div>
                <Link href="/app/profile/onboarding/step-3-skills">
                  <Button variant="ghost" size="sm" className="h-8 gap-1">
                    <Pencil className="w-3 h-3" />
                    ویرایش
                  </Button>
                </Link>
              </div>
              <div className="space-y-1 text-sm">
                <div className="font-medium">{careerFocusOption?.label}</div>
                <div className="text-xs text-muted-foreground">
                  {careerFocusOption?.description}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Education */}
        {profile.latestEducation && (
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">آخرین مدرک تحصیلی</h3>
                </div>
                <Link href="/app/profile/onboarding/step-4-summary">
                  <Button variant="ghost" size="sm" className="h-8 gap-1">
                    <Pencil className="w-3 h-3" />
                    ویرایش
                  </Button>
                </Link>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">مقطع: </span>
                  <span className="font-medium">{degreeLabel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">رشته: </span>
                  <span>{profile.latestEducation.field}</span>
                </div>
                {profile.latestEducation.university && (
                  <div>
                    <span className="text-muted-foreground">دانشگاه: </span>
                    <span>{profile.latestEducation.university}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certifications */}
        {profile.certifications && profile.certifications.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">دوره‌ها و گواهی‌ها</h3>
                </div>
                <Link href="/app/profile/onboarding/step-5-certifications">
                  <Button variant="ghost" size="sm" className="h-8 gap-1">
                    <Pencil className="w-3 h-3" />
                    ویرایش
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                {profile.certifications.map((cert, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium">{cert.name}</div>
                    {cert.provider && (
                      <div className="text-xs text-muted-foreground">{cert.provider}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-purple-900">بعد از تکمیل</p>
                <p className="text-xs text-purple-700 leading-relaxed">
                  می‌توانید رزومه حرفه‌ای خود را دانلود کنید، آزمون‌های شخصیت‌شناسی را تکمیل کنید و برای فرصت‌های شغلی اقدام کنید.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Finish Button */}
        <div className="pt-4">
          <Button onClick={handleFinish} size="lg" className="w-full">
            مشاهده پروفایل
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
