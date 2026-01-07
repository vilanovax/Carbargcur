"use client";

import { useEffect, useState } from "react";
import { loadFocusedFromStorage, type FocusedProfile, validateFocusedStep } from "@/lib/onboarding";
import { calculateProfileStrength } from "@/lib/profileStrength";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfileDebugPage() {
  const [profile, setProfile] = useState<FocusedProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const data = loadFocusedFromStorage();
    setProfile(data);
  }, []);

  if (!mounted || !profile) {
    return <div className="container mx-auto p-8">در حال بارگذاری...</div>;
  }

  const strength = calculateProfileStrength(profile);
  const step1Valid = validateFocusedStep("step-1", profile);
  const step2Valid = validateFocusedStep("step-2", profile);
  const step3Valid = validateFocusedStep("step-3", profile);
  const step4Valid = validateFocusedStep("step-4", profile);
  const step5Valid = validateFocusedStep("step-5", profile);

  return (
    <div className="container mx-auto p-8 space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">دیباگ قدرت پروفایل</h1>

      {/* Profile Strength Summary */}
      <Card>
        <CardHeader>
          <CardTitle>خلاصه امتیاز</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-4xl font-bold text-center">
            {strength.percentage}٪
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>اطلاعات پایه (Base Signals)</span>
              <span className="font-bold">{strength.breakdown.baseSignals}/20</span>
            </div>
            <div className="flex justify-between">
              <span>مهارت‌ها و تجربه</span>
              <span className="font-bold">{strength.breakdown.skillsExperience}/25</span>
            </div>
            <div className="flex justify-between">
              <span>آزمون‌های تخصصی</span>
              <span className="font-bold">{strength.breakdown.assessments}/25</span>
            </div>
            <div className="flex justify-between">
              <span>رزومه</span>
              <span className="font-bold">{strength.breakdown.resume}/20</span>
            </div>
            <div className="flex justify-between">
              <span>فعالیت اخیر</span>
              <span className="font-bold">{strength.breakdown.activity}/10</span>
            </div>
          </div>
          {strength.missingHighImpact.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="font-bold text-red-800">موارد مهم ناقص:</p>
              <ul className="list-disc list-inside text-red-700 text-sm mt-2">
                {strength.missingHighImpact.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {strength.caps.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
              <p className="font-bold text-amber-800">محدودیت‌ها:</p>
              <ul className="list-disc list-inside text-amber-700 text-sm mt-2">
                {strength.caps.map((cap, i) => (
                  <li key={i}>{cap}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step Validation */}
      <Card>
        <CardHeader>
          <CardTitle>وضعیت مراحل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <span className={step1Valid.ok ? "text-green-600" : "text-red-600"}>
              {step1Valid.ok ? "✓" : "✗"}
            </span>
            <span>مرحله ۱: تجربه کاری اخیر</span>
            {!step1Valid.ok && (
              <span className="text-xs text-red-600">
                ({Object.values(step1Valid.errors).join(", ")})
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={step2Valid.ok ? "text-green-600" : "text-red-600"}>
              {step2Valid.ok ? "✓" : "✗"}
            </span>
            <span>مرحله ۲: مهارت‌های کلیدی</span>
            {!step2Valid.ok && (
              <span className="text-xs text-red-600">
                ({Object.values(step2Valid.errors).join(", ")})
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={step3Valid.ok ? "text-green-600" : "text-red-600"}>
              {step3Valid.ok ? "✓" : "✗"}
            </span>
            <span>مرحله ۳: تمرکز شغلی</span>
            {!step3Valid.ok && (
              <span className="text-xs text-red-600">
                ({Object.values(step3Valid.errors).join(", ")})
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={step4Valid.ok ? "text-green-600" : "text-red-600"}>
              {step4Valid.ok ? "✓" : "✗"}
            </span>
            <span>مرحله ۴: تحصیلات</span>
            {!step4Valid.ok && (
              <span className="text-xs text-red-600">
                ({Object.values(step4Valid.errors).join(", ")})
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={step5Valid.ok ? "text-green-600" : "text-amber-600"}>
              {step5Valid.ok ? "✓" : "⚠"}
            </span>
            <span>مرحله ۵: گواهی‌ها (اختیاری)</span>
          </div>
        </CardContent>
      </Card>

      {/* Raw Profile Data */}
      <Card>
        <CardHeader>
          <CardTitle>داده‌های خام پروفایل</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96" dir="ltr">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>جزئیات محاسبه امتیاز</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-bold mb-2">۱. اطلاعات پایه (۲۰٪)</h3>
            <ul className="space-y-1 mr-4">
              <li>• تجربه کاری: {step1Valid.ok ? "✓ ۶٪" : "✗ ۰٪"}</li>
              <li>• تمرکز شغلی: {step3Valid.ok ? "✓ ۶٪" : "✗ ۰٪"}</li>
              <li>• تحصیلات: {step4Valid.ok ? "✓ ۴٪" : "✗ ۰٪"}</li>
              <li>• موقعیت مکانی: {profile.city || profile.recentExperience?.company ? "✓ ۴٪" : "✗ ۰٪"}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-2">۲. مهارت‌ها و تجربه (۲۵٪)</h3>
            <ul className="space-y-1 mr-4">
              <li>• حداقل ۱ مهارت: {(profile.coreSkills?.length || 0) >= 1 ? "✓ ۸٪" : "✗ ۰٪"}</li>
              <li>• حداقل ۲ مهارت: {(profile.coreSkills?.length || 0) >= 2 ? "✓ ۴٪" : "✗ ۰٪"}</li>
              <li>• تجربه کاری ثبت شده: {profile.recentExperience?.role || profile.experiences?.length ? "✓ ۸٪" : "✗ ۰٪"}</li>
              <li>• به‌روزرسانی اخیر: ⚠ ۵٪ (نیاز به trackProfileUpdate)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-2">۳. آزمون‌های تخصصی (۲۵٪)</h3>
            <ul className="space-y-1 mr-4">
              <li>• MBTI ساده: {profile.personality?.mbti || profile.assessments?.mbti ? "✓ ۵٪" : "✗ ۰٪"}</li>
              <li>• MBTI پیشرفته: {profile.personality?.full ? "✓ ۵٪" : "✗ ۰٪"}</li>
              <li>• DISC: {profile.personality?.disc || profile.assessments?.disc ? "✓ ۷٪" : "✗ ۰٪"}</li>
              <li>• Holland ساده: {profile.assessments?.holland ? "✓ ۴٪" : "✗ ۰٪"}</li>
              <li>• Holland پیشرفته: {profile.personality?.holland ? "✓ ۴٪" : "✗ ۰٪"}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-2">۴. رزومه (۲۰٪)</h3>
            <ul className="space-y-1 mr-4">
              <li>• رزومه یا slug: {profile.resumeUrl || profile.slug ? "✓ ۱۰٪" : "✗ ۰٪"}</li>
              <li>• رزومه قابل دانلود: {profile.resumeUrl ? "✓ ۵٪" : "✗ ۰٪"}</li>
              <li>• داده کامل برای رزومه: {profile.recentExperience?.role && (profile.coreSkills?.length || 0) >= 1 && profile.latestEducation?.degree ? "✓ ۵٪" : "✗ ۰٪"}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-2">۵. فعالیت اخیر (۱۰٪)</h3>
            <ul className="space-y-1 mr-4">
              <li>• ویرایش در ۳۰ روز اخیر: ⚠ ۴٪</li>
              <li>• رویداد اخیر: ⚠ ۳٪</li>
              <li>• ورود منظم: {profile.fullName || profile.recentExperience?.role ? "✓ ۳٪" : "✗ ۰٪"}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
