"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  loadFromStorage,
  EXPERIENCE_LEVELS,
  JOB_STATUSES,
  DEGREE_OPTIONS,
  type OnboardingProfile,
} from "@/lib/onboarding";
import { canDownloadResume } from "@/lib/profileCompletion";
import Logo from "@/components/shared/Logo";
import { Download, Link as LinkIcon, MapPin } from "lucide-react";

// Static personality type descriptions
const PERSONALITY_TYPES: Record<string, string> = {
  analytical: "مناسب محیط‌های ساختارمند و تصمیم‌گیری مبتنی بر داده",
  creative: "مناسب محیط‌های نوآورانه و حل مسائل خلاقانه",
  practical: "مناسب محیط‌های عملی و اجرایی با رویکرد مسئله‌محور",
  social: "مناسب محیط‌های تیمی و تعاملات انسانی",
};

export default function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: در آینده از API با username دریافت شود
    // فعلاً از localStorage می‌خوانیم
    const data = loadFromStorage();
    setProfile(data);
    setLoading(false);
  }, [params.username]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    // TODO: نمایش toast موفقیت
  };

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  if (!profile || !profile.fullName) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Public Header */}
        <header className="border-b bg-background">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <Logo />
            </Link>
          </div>
        </header>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-20 h-20 mx-auto bg-secondary rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">این پروفایل در دسترس نیست</h1>
              <p className="text-muted-foreground">
                ممکن است این پروفایل هنوز ساخته نشده یا حذف شده باشد.
              </p>
            </div>
            <Button asChild>
              <Link href="/">ساخت پروفایل در کاربرگ</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const experienceLabel = EXPERIENCE_LEVELS.find(
    (e) => e.value === profile.experienceLevel
  )?.label;
  const jobStatusLabel = JOB_STATUSES.find(
    (s) => s.value === profile.jobStatus
  )?.label;

  // Check if resume is ready for download
  const isResumeReady = canDownloadResume(profile);

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Public Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <Button asChild variant="outline" size="sm" className="text-xs md:text-sm">
            <Link href="/">ساخت پروفایل برای خودم</Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8 max-w-3xl space-y-4 md:space-y-6">
        {/* Profile Hero */}
        <Card className="shadow-sm">
          <CardContent className="p-6 md:p-8">
            <div className="space-y-6">
              {/* Avatar & Name Section */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Profile Photo */}
                <Avatar className="w-24 h-24 md:w-32 md:h-32">
                  <AvatarImage src={profile.profilePhotoUrl} alt={profile.fullName} />
                  <AvatarFallback className="text-2xl md:text-3xl bg-primary text-primary-foreground">
                    {getInitials(profile.fullName)}
                  </AvatarFallback>
                </Avatar>

                {/* Name & Status */}
                <div className="flex-1 space-y-3 text-center md:text-right">
                  <h1 className="text-3xl md:text-4xl font-bold">{profile.fullName}</h1>

                {/* Job Status Badge */}
                {jobStatusLabel && (
                  <Badge
                    variant={
                      profile.jobStatus === "seeking" ? "default" : "secondary"
                    }
                    className="text-xs md:text-sm"
                  >
                    {jobStatusLabel}
                  </Badge>
                )}

                {/* Location & Experience */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm md:text-base text-muted-foreground">
                  {profile.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.city}</span>
                    </div>
                  )}
                  {experienceLabel && (
                    <>
                      <span>•</span>
                      <span>{experienceLabel}</span>
                    </>
                  )}
                </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  disabled={!isResumeReady}
                  className="flex-1 text-xs md:text-sm"
                  title={
                    !isResumeReady
                      ? "دانلود رزومه پس از تکمیل کامل پروفایل فعال می‌شود"
                      : "دانلود رزومه به صورت PDF"
                  }
                >
                  <Download className="w-4 h-4 ml-2" />
                  دانلود رزومه PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="flex-1 text-xs md:text-sm"
                >
                  <LinkIcon className="w-4 h-4 ml-2" />
                  کپی لینک پروفایل
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Section */}
        {profile.summary && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">خلاصه حرفه‌ای</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm md:text-base leading-relaxed text-foreground/90">
                {profile.summary}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Skills Section */}
        {profile.skills && profile.skills.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">
                مهارت‌ها و تخصص‌ها
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills.slice(0, 10).map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="text-xs md:text-sm px-3 py-1"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Work Experience - Only show if exists */}
        {profile.experiences && profile.experiences.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">سابقه کاری</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.experiences.map((exp) => (
                <div key={exp.id} className="border-r-2 border-primary pr-4">
                  <h4 className="font-medium text-sm md:text-base">{exp.title}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    {exp.company}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {exp.fromYear} - {exp.toYear}
                  </p>
                  {exp.description && (
                    <p className="text-xs md:text-sm text-foreground/90 mt-2">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Education - Only show if at least one field exists */}
        {profile.education && (profile.education.degree || profile.education.field || profile.education.university) && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">تحصیلات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm md:text-base">
                {profile.education.degree && (
                  <p>
                    <span className="text-muted-foreground">مقطع:</span>{" "}
                    <span className="font-medium">
                      {DEGREE_OPTIONS.find((d) => d.value === profile.education?.degree)?.label}
                    </span>
                  </p>
                )}
                {profile.education.field && (
                  <p>
                    <span className="text-muted-foreground">رشته:</span>{" "}
                    <span className="font-medium">{profile.education.field}</span>
                  </p>
                )}
                {profile.education.university && (
                  <p>
                    <span className="text-muted-foreground">دانشگاه:</span>{" "}
                    <span className="font-medium">{profile.education.university}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personality Section - TODO: Implement when assessment tests are ready */}
        {/* {profile.personalityType && PERSONALITY_TYPES[profile.personalityType] && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">سبک کاری</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Badge className="text-xs md:text-sm">
                  {profile.personalityType === "analytical" && "تحلیلی"}
                  {profile.personalityType === "creative" && "خلاق"}
                  {profile.personalityType === "practical" && "عملی"}
                  {profile.personalityType === "social" && "اجتماعی"}
                </Badge>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {PERSONALITY_TYPES[profile.personalityType]}
                </p>
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* Footer */}
        <Card className="bg-secondary/50 border-dashed shadow-none">
          <CardContent className="p-4 text-center">
            <p className="text-xs md:text-sm text-muted-foreground">
              این پروفایل به‌صورت عمومی توسط{" "}
              <Link href="/" className="font-medium text-foreground hover:underline">
                کاربرگ
              </Link>{" "}
              ساخته شده است.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
