"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Download } from "lucide-react";
import { loadFromStorage, type OnboardingProfile } from "@/lib/onboarding";
import {
  getProfileCompletion,
  canDownloadResume,
} from "@/lib/profileCompletion";
import {
  type ResumeTheme,
  getSelectedResumeTheme,
} from "@/lib/resumeThemes";
import ProfileCompletionGuard from "@/components/profile/ProfileCompletionGuard";
import ResumeThemeSwitcher from "@/components/resume/ResumeThemeSwitcher";
import ResumeThemeClassic from "@/components/resume/ResumeThemeClassic";
import ResumeThemeModern from "@/components/resume/ResumeThemeModern";

export default function ResumePreviewPage() {
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ResumeTheme>("classic");

  useEffect(() => {
    // TODO: در آینده از API دریافت شود
    const data = loadFromStorage();
    setProfile(data);

    // Load saved theme
    const theme = getSelectedResumeTheme();
    setSelectedTheme(theme);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Check profile completion
  const completion = getProfileCompletion(profile);
  const canDownload = canDownloadResume(profile);

  // Guard: Block if profile incomplete
  if (!canDownload) {
    return (
      <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">پیش‌نمایش رزومه</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              تکمیل {completion.percentage}٪
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/app/resume">
              <ArrowRight className="w-4 h-4 ml-2" />
              بازگشت
            </Link>
          </Button>
        </div>

        <ProfileCompletionGuard completion={completion} variant="resume" />
      </div>
    );
  }

  // Ensure profile is loaded
  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
      {/* Action Bar - Hidden on print */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">پیش‌نمایش رزومه</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            نمایش رزومه به‌صورت قابل چاپ
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/app/resume">
              <ArrowRight className="w-4 h-4 ml-2" />
              بازگشت
            </Link>
          </Button>
          <Button onClick={handlePrint} title="چاپ یا ذخیره به PDF">
            <Download className="w-4 h-4 ml-2" />
            دانلود PDF
          </Button>
        </div>
      </div>

      {/* Theme Switcher - Hidden on print */}
      <ResumeThemeSwitcher
        isProfileComplete={canDownload}
        onThemeChange={setSelectedTheme}
      />

      {/* A4 Resume Container */}
      <div className="resume-container mx-auto bg-white shadow-lg border border-gray-200 print:shadow-none print:border-0">
        {selectedTheme === "classic" ? (
          <ResumeThemeClassic profile={profile} />
        ) : (
          <ResumeThemeModern profile={profile} />
        )}
      </div>

      {/* Success Message - Hidden on print */}
      <Card className="bg-primary/5 border-primary/20 shadow-sm print:hidden">
        <CardContent className="p-3 md:p-4">
          <div className="text-center space-y-1">
            <p className="text-xs md:text-sm font-medium text-primary">
              ✓ پروفایل شما کامل است
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
              برای دانلود به‌صورت PDF، دکمه "دانلود PDF" را بزنید و سپس "Save as
              PDF" را انتخاب کنید.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
