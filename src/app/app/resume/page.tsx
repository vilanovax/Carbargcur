"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, AlertCircle, FileText, CheckCircle2, Edit3 } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50/50 print:bg-white -m-6 md:-m-8 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">رزومه حرفه‌ای</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            این رزومه به‌صورت خودکار از اطلاعات پروفایل شما ساخته می‌شود.
          </p>
        </div>

        {canDownload ? (
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            {/* Main Resume Area */}
            <div className="space-y-4">
              {/* Resume Preview - A4-like Container */}
              <Card className="overflow-hidden print:shadow-none print:border-0">
                <div className="resume-container bg-white">
                  {profile && (
                    selectedTheme === "classic" ? (
                      <ResumeThemeClassic profile={profile} />
                    ) : (
                      <ResumeThemeModern profile={profile} />
                    )
                  )}
                </div>
              </Card>

              {/* Bottom Info Box */}
              <Card className="bg-blue-50 border-blue-200 print:hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-blue-900">
                        رزومه شما آماده است
                      </p>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        این رزومه به‌طور خودکار از پروفایل شما ساخته شده و همیشه به‌روز است. برای دانلود PDF، دکمه "دانلود PDF" را بزنید.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Resume Management Panel */}
            <div className="space-y-4 print:hidden lg:sticky lg:top-6 lg:self-start">
              {/* Resume Status Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    مدیریت رزومه
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">پروفایل کامل</span>
                    </div>
                    <Badge className="bg-green-600 hover:bg-green-700">
                      {completion.percentage}٪
                    </Badge>
                  </div>

                  {/* Template Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      قالب رزومه
                    </label>
                    <ResumeThemeSwitcher
                      isProfileComplete={canDownload}
                      onThemeChange={setSelectedTheme}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      تغییر قالب فقط روی ظاهر رزومه تأثیر می‌گذارد، نه محتوا
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <Button
                      onClick={handlePrint}
                      className="w-full"
                      size="sm"
                    >
                      <Download className="w-4 h-4 ml-2" />
                      دانلود PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleShare}
                      className="w-full"
                      size="sm"
                    >
                      <Share2 className="w-4 h-4 ml-2" />
                      اشتراک‌گذاری
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Edit Profile CTA */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-medium text-blue-900">
                      بهبود رزومه
                    </p>
                  </div>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    با تکمیل بخش‌های پروفایل، رزومه شما حرفه‌ای‌تر و کامل‌تر می‌شود
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full border-blue-300 hover:bg-blue-100">
                    <Link href="/app/profile">
                      ویرایش پروفایل
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Privacy Notice */}
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    رزومه شما تنها زمانی برای کارفرمایان قابل مشاهده است که خودتان آن را ارسال کنید.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Empty State - When Profile Incomplete */
          <div className="max-w-2xl mx-auto">
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
                <div className="flex items-center justify-center gap-2">
                  <div className="w-32 h-2 bg-amber-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-600 rounded-full transition-all"
                      style={{ width: `${completion.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {completion.percentage}٪
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Notice for Incomplete State */}
            <Card className="mt-6 bg-slate-50 border-slate-200">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  رزومه شما تنها زمانی برای کارفرمایان قابل مشاهده است که خودتان آن را ارسال کنید.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
