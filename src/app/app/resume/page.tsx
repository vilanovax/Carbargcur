"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { loadFromStorage, type OnboardingProfile } from "@/lib/onboarding";
import {
  getProfileCompletion,
  canDownloadResume,
} from "@/lib/profileCompletion";
import {
  type ResumeTheme,
  getSelectedResumeTheme,
} from "@/lib/resumeThemes";
import ResumeThemeSwitcher from "@/components/resume/ResumeThemeSwitcher";
import ResumeThemeClassic from "@/components/resume/ResumeThemeClassic";
import ResumeThemeModern from "@/components/resume/ResumeThemeModern";

export default function ResumePage() {
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

  const handleShare = async () => {
    // TODO: Implement share functionality
    alert("قابلیت اشتراک‌گذاری به‌زودی اضافه می‌شود");
  };

  // Check profile completion
  const completion = getProfileCompletion(profile);
  const canDownload = canDownloadResume(profile);

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">رزومه حرفه‌ای</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          این رزومه به‌صورت خودکار از اطلاعات پروفایل شما ساخته می‌شود.
        </p>
      </div>

      {canDownload ? (
        <>
          {/* Action Bar & Theme Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <ResumeThemeSwitcher
              isProfileComplete={canDownload}
              onThemeChange={setSelectedTheme}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex-1 sm:flex-none"
              >
                <Share2 className="w-4 h-4 ml-2" />
                اشتراک‌گذاری
              </Button>
              <Button
                onClick={handlePrint}
                title="چاپ یا ذخیره به PDF"
                className="flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4 ml-2" />
                دانلود PDF
              </Button>
            </div>
          </div>

          {/* Resume Preview - Always Visible */}
          <div className="resume-container mx-auto bg-white shadow-lg border border-gray-200 print:shadow-none print:border-0">
            {profile && (
              selectedTheme === "classic" ? (
                <ResumeThemeClassic profile={profile} />
              ) : (
                <ResumeThemeModern profile={profile} />
              )
            )}
          </div>

          {/* Success Message */}
          <Card className="bg-primary/5 border-primary/20 shadow-sm print:hidden">
            <CardContent className="p-3 md:p-4">
              <div className="text-center space-y-1">
                <p className="text-xs md:text-sm font-medium text-primary">
                  ✓ پروفایل شما کامل است
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
                  برای دانلود به‌صورت PDF، دکمه "دانلود PDF" را بزنید و سپس "Save as PDF" را انتخاب کنید.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Empty State - When Profile Incomplete */
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-8 md:p-12 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-amber-900">
                برای نمایش رزومه حرفه‌ای، ابتدا پروفایل خود را کامل کنید
              </h2>
              <p className="text-sm text-amber-700 leading-relaxed max-w-md mx-auto">
                رزومه شما زمانی قابل نمایش است که اطلاعات زیر را تکمیل کرده باشید:
              </p>
            </div>

            {/* Missing Sections */}
            <div className="max-w-sm mx-auto bg-white rounded-lg p-4 border border-amber-200">
              <ul className="space-y-2 text-sm text-right">
                {completion?.missing?.includes("experiences") && (
                  <li className="flex items-center gap-2 text-amber-800">
                    <span className="text-amber-500">•</span>
                    حداقل یک سابقه کاری
                  </li>
                )}
                {completion?.missing?.includes("education") && (
                  <li className="flex items-center gap-2 text-amber-800">
                    <span className="text-amber-500">•</span>
                    حداقل یک مدرک تحصیلی
                  </li>
                )}
                {completion?.missing?.includes("skills") && (
                  <li className="flex items-center gap-2 text-amber-800">
                    <span className="text-amber-500">•</span>
                    حداقل ۳ مهارت
                  </li>
                )}
              </ul>
            </div>

            <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700">
              <Link href="/app/profile">
                تکمیل پروفایل
              </Link>
            </Button>

            {/* Progress Indicator */}
            <p className="text-xs text-muted-foreground">
              تکمیل پروفایل: {completion.percentage}٪
            </p>
          </CardContent>
        </Card>
      )}

      {/* Trust Message */}
      <Card className="bg-primary/5 border-primary/20 shadow-sm print:hidden">
        <CardContent className="p-3 md:p-4">
          <p className="text-xs md:text-sm text-center font-medium leading-relaxed">
            رزومه شما تنها زمانی برای کارفرمایان قابل مشاهده است که خودتان آن را ارسال کنید.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
