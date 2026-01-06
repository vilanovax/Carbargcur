"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import OnboardingNav from "@/components/onboarding/OnboardingNav";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info } from "lucide-react";
import {
  type FocusedProfile,
  type WorkDomain,
  type EmploymentType,
  loadFocusedFromStorage,
  saveFocusedToStorage,
  validateFocusedStep,
  WORK_DOMAINS,
  EMPLOYMENT_TYPES,
} from "@/lib/onboarding";
import { trackProfileUpdate } from "@/lib/profileStrength";
import DomainSelector from "@/components/onboarding/DomainSelector";

export default function Step1RecentExperiencePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<FocusedProfile | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadFocusedFromStorage();
    setProfile(loaded);
  }, []);

  // Auto-save with debounce
  useEffect(() => {
    if (!profile) return;

    const timer = setTimeout(() => {
      saveFocusedToStorage(profile);
      trackProfileUpdate(); // Track activity for profile strength
    }, 300);

    return () => clearTimeout(timer);
  }, [profile]);

  if (!profile) {
    return <div className="container max-w-2xl mx-auto px-4 py-8">در حال بارگذاری...</div>;
  }

  const handleNext = () => {
    const validation = validateFocusedStep("step-1", profile);

    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    router.push("/app/profile/onboarding/step-2-status");
  };

  const handleRecentExpChange = (field: string, value: string) => {
    setProfile({
      ...profile,
      recentExperience: {
        ...profile.recentExperience,
        [field]: value,
      } as any,
    });

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const recentExp = profile.recentExperience || {};

  // Generate year options (last 30 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <OnboardingShell
      currentStep={1}
      title="تجربه کاری اخیر"
      description="در ۵ سال اخیر، بیشتر در چه نقشی فعالیت داشته‌اید؟"
    >
      <div className="space-y-6">
        {/* Helper Box */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 leading-relaxed">
            تمرکز روی نقش غالب شماست، نه تمام سوابق.
          </p>
        </div>

        {/* Role/Title */}
        <div className="space-y-2">
          <Label htmlFor="role">
            نقش / عنوان شغلی <span className="text-red-500">*</span>
          </Label>
          <Input
            id="role"
            type="text"
            placeholder="مثال: حسابدار ارشد، تحلیلگر مالی، مدیر مالی"
            value={recentExp.role || ""}
            onChange={(e) => handleRecentExpChange("role", e.target.value)}
          />
          {errors.role && (
            <p className="text-sm text-red-600">{errors.role}</p>
          )}
        </div>

        {/* Domain */}
        <div className="space-y-2">
          <Label htmlFor="domain">
            حوزه فعالیت <span className="text-red-500">*</span>
          </Label>
          <DomainSelector
            value={recentExp.domain}
            onChange={(domain) => handleRecentExpChange("domain", domain)}
            error={errors.domain}
            placeholder="انتخاب کنید"
          />
        </div>

        {/* Employment Type */}
        <div className="space-y-2">
          <Label htmlFor="employmentType">
            نوع همکاری <span className="text-red-500">*</span>
          </Label>
          <Select
            value={recentExp.employmentType}
            onValueChange={(value) => handleRecentExpChange("employmentType", value)}
          >
            <SelectTrigger className={errors.employmentType ? "border-red-500" : ""}>
              <SelectValue placeholder="انتخاب کنید" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.employmentType && (
            <p className="text-sm text-red-600">{errors.employmentType}</p>
          )}
        </div>

        {/* Company (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="company" className="text-muted-foreground">
            شرکت / سازمان (اختیاری)
          </Label>
          <Input
            id="company"
            type="text"
            placeholder="مثال: گروه صنعتی ایران‌خودرو"
            value={recentExp.company || ""}
            onChange={(e) => handleRecentExpChange("company", e.target.value)}
          />
        </div>

        {/* Years (Optional) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fromYear" className="text-muted-foreground">
              از سال (اختیاری)
            </Label>
            <Select
              value={recentExp.fromYear}
              onValueChange={(value) => handleRecentExpChange("fromYear", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="انتخاب سال" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="toYear" className="text-muted-foreground">
              تا سال (اختیاری)
            </Label>
            <Select
              value={recentExp.toYear}
              onValueChange={(value) => handleRecentExpChange("toYear", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="انتخاب سال" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">تاکنون</SelectItem>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-muted-foreground">
            توضیح کوتاه (اختیاری، حداکثر ۱۲۰ کاراکتر)
          </Label>
          <Textarea
            id="description"
            placeholder="مثال: مسئول تهیه صورت‌های مالی ماهانه و تحلیل بودجه"
            value={recentExp.description || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 120) {
                handleRecentExpChange("description", value);
              }
            }}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              این توضیح در رزومه شما نمایش داده می‌شود
            </p>
            <p className="text-xs text-muted-foreground">
              {(recentExp.description || "").length}/۱۲۰
            </p>
          </div>
        </div>

        {/* Profile Strength Impact */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            تکمیل این بخش +۱۵٪ به قدرت پروفایل شما اضافه می‌کند
          </p>
        </div>

        {/* Navigation */}
        <OnboardingNav
          onNext={handleNext}
          nextLabel="ادامه"
          showBack={false}
        />
      </div>
    </OnboardingShell>
  );
}
