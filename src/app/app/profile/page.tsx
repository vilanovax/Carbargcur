"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  loadFromStorage,
  saveToStorage,
  isOnboardingComplete,
  EXPERIENCE_LEVELS,
  JOB_STATUSES,
  DEGREE_OPTIONS,
  type OnboardingProfile,
  type WorkExperience,
  type Education,
} from "@/lib/onboarding";
import { trackProfileUpdate } from "@/lib/profileStrength";
import ExperienceForm from "@/components/profile/ExperienceForm";
import EducationForm from "@/components/profile/EducationForm";
import ProfilePhotoUploader from "@/components/profile/ProfilePhotoUploader";
import ResumeUploader from "@/components/profile/ResumeUploader";
import { Plus, Pencil, Trash2, Briefcase, GraduationCap } from "lucide-react";
import { generateSlug, getPublicProfileUrl } from "@/lib/slug";

export default function ProfilePage() {
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [completed, setCompleted] = useState(false);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState<WorkExperience | undefined>();
  const [showEducationForm, setShowEducationForm] = useState(false);

  useEffect(() => {
    // Load onboarding data from localStorage
    const data = loadFromStorage();
    const isComplete = isOnboardingComplete();
    setProfile(data);
    setCompleted(isComplete);
  }, []);

  const handleSaveExperience = (experience: WorkExperience) => {
    if (!profile) return;

    let updatedExperiences: WorkExperience[];
    if (editingExperience) {
      // Update existing
      updatedExperiences = profile.experiences.map((exp) =>
        exp.id === experience.id ? experience : exp
      );
    } else {
      // Add new
      updatedExperiences = [...profile.experiences, experience];
    }

    const updatedProfile = { ...profile, experiences: updatedExperiences };
    setProfile(updatedProfile);
    saveToStorage(updatedProfile);
    trackProfileUpdate(); // Track activity for profile strength
    setShowExperienceForm(false);
    setEditingExperience(undefined);
  };

  const handleDeleteExperience = (id: string) => {
    if (!profile) return;
    if (!confirm("آیا از حذف این سابقه کاری مطمئن هستید؟")) return;

    const updatedExperiences = profile.experiences.filter((exp) => exp.id !== id);
    const updatedProfile = { ...profile, experiences: updatedExperiences };
    setProfile(updatedProfile);
    saveToStorage(updatedProfile);
    trackProfileUpdate(); // Track activity for profile strength
  };

  const handleSaveEducation = (education: Education) => {
    if (!profile) return;

    const updatedProfile = { ...profile, education };
    setProfile(updatedProfile);
    saveToStorage(updatedProfile);
    trackProfileUpdate(); // Track activity for profile strength
    setShowEducationForm(false);
  };

  const handlePhotoChange = (url?: string) => {
    if (!profile) return;

    const updatedProfile = { ...profile, profilePhotoUrl: url };
    setProfile(updatedProfile);
    saveToStorage(updatedProfile);
    trackProfileUpdate(); // Track activity for profile strength
  };

  const handleResumeChange = (url?: string, filename?: string) => {
    if (!profile) return;

    const updatedProfile = { ...profile, resumeUrl: url, resumeFilename: filename };
    setProfile(updatedProfile);
    saveToStorage(updatedProfile);
    trackProfileUpdate(); // Track activity for profile strength
  };

  if (!profile) {
    return <div className="space-y-6">در حال بارگذاری...</div>;
  }

  const experienceLabel = EXPERIENCE_LEVELS.find((e) => e.value === profile.experienceLevel)?.label;
  const jobStatusLabel = JOB_STATUSES.find((s) => s.value === profile.jobStatus)?.label;

  // Generate slug if it doesn't exist
  if (!profile.slug && profile.fullName) {
    const slug = generateSlug(profile.fullName);
    const updatedProfile = { ...profile, slug };
    setProfile(updatedProfile);
    saveToStorage(updatedProfile);
    trackProfileUpdate(); // Track activity for profile strength
  }

  // Get public profile URL
  const publicProfileUrl = profile.slug
    ? getPublicProfileUrl(profile.slug)
    : "";

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold">پروفایل من</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            مشاهده و مدیریت اطلاعات حرفه‌ای شما
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild variant="outline" className="text-xs md:text-sm">
            <Link href="/app/profile/onboarding">
              {completed ? "ویرایش آنبوردینگ" : "تکمیل آنبوردینگ"}
            </Link>
          </Button>
          <Button asChild className="text-xs md:text-sm">
            <Link href="/app/profile/edit">ویرایش پروفایل</Link>
          </Button>
        </div>
      </div>

      {/* Completion Status */}
      {!completed && profile.fullName && (
        <Card className="border-primary/50 bg-primary/5 shadow-sm">
          <CardContent className="p-3 md:p-4">
            <p className="text-xs md:text-sm leading-relaxed">
              ⚠️ پروفایل شما هنوز کامل نیست. برای افزایش شانس دیده‌شدن توسط کارفرمایان،{" "}
              <Link href="/app/profile/onboarding" className="underline font-medium text-primary hover:text-primary/80">
                تکمیل پروفایل را ادامه دهید
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Profile Preview */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-lg md:text-xl">اطلاعات پایه</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs md:text-sm text-muted-foreground">نام و نام خانوادگی</label>
            <p className="text-sm md:text-base font-medium">{profile.fullName || "—"}</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs md:text-sm text-muted-foreground">شهر</label>
            <p className="text-sm md:text-base font-medium">{profile.city || "—"}</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs md:text-sm text-muted-foreground">سطح تجربه</label>
            <p className="text-sm md:text-base font-medium">{experienceLabel || "—"}</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs md:text-sm text-muted-foreground">وضعیت شغلی</label>
            <p className="text-sm md:text-base font-medium">{jobStatusLabel || "—"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Photo */}
      <ProfilePhotoUploader
        currentPhotoUrl={profile.profilePhotoUrl}
        userName={profile.fullName || "user"}
        onPhotoChange={handlePhotoChange}
      />

      {/* Resume Upload */}
      <ResumeUploader
        currentResumeUrl={profile.resumeUrl}
        currentFilename={profile.resumeFilename}
        userName={profile.fullName || "user"}
        onResumeChange={handleResumeChange}
      />

      {/* Skills */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-lg md:text-xl">مهارت‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs md:text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed rounded-lg">
              <p className="text-xs md:text-sm text-muted-foreground mb-2">
                هنوز مهارتی اضافه نکرده‌اید
              </p>
              <Button asChild variant="outline" size="sm" className="text-xs">
                <Link href="/app/profile/onboarding/step-3-skills">افزودن مهارت</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {profile.summary && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-lg md:text-xl">خلاصه حرفه‌ای</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs md:text-sm leading-relaxed">{profile.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Work Experience */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 md:pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg md:text-xl">سابقه کاری</CardTitle>
            </div>
            {!showExperienceForm && profile.experiences.length < 3 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingExperience(undefined);
                  setShowExperienceForm(true);
                }}
                className="text-xs md:text-sm"
              >
                <Plus className="w-4 h-4 ml-2" />
                افزودن سابقه کاری
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showExperienceForm && (
            <ExperienceForm
              experience={editingExperience}
              onSave={handleSaveExperience}
              onCancel={() => {
                setShowExperienceForm(false);
                setEditingExperience(undefined);
              }}
            />
          )}

          {profile.experiences.length === 0 && !showExperienceForm && (
            <div className="text-center py-6 border border-dashed rounded-lg">
              <p className="text-xs md:text-sm text-muted-foreground">
                هنوز سابقه کاری ثبت نشده است.
              </p>
            </div>
          )}

          {profile.experiences.length > 0 && !showExperienceForm && (
            <div className="space-y-3">
              {profile.experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 border rounded-lg hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm md:text-base">{exp.title}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">
                        {exp.company}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {exp.fromYear} - {exp.toYear}
                      </p>
                      {exp.description && (
                        <p className="text-xs md:text-sm text-muted-foreground mt-2">
                          {exp.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingExperience(exp);
                          setShowExperienceForm(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteExperience(exp.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {profile.experiences.length >= 3 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  حداکثر ۳ سابقه کاری قابل ثبت است.
                </p>
              )}
              {profile.experiences.length < 3 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  حداکثر ۳ سابقه مرتبط وارد کنید.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 md:pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg md:text-xl">
                تحصیلات{" "}
                <span className="text-xs text-muted-foreground font-normal">(اختیاری)</span>
              </CardTitle>
            </div>
            {!showEducationForm && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowEducationForm(true)}
                className="text-xs md:text-sm"
              >
                <Pencil className="w-4 h-4 ml-2" />
                ویرایش تحصیلات
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {showEducationForm && (
            <EducationForm
              education={profile.education}
              onSave={handleSaveEducation}
              onCancel={() => setShowEducationForm(false)}
            />
          )}

          {!showEducationForm && (
            <>
              {profile.education && (profile.education.degree || profile.education.field || profile.education.university) ? (
                <div className="p-4 border rounded-lg">
                  <div className="space-y-2 text-sm">
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
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed rounded-lg">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    این بخش اختیاری است.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Resume */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-lg md:text-xl">رزومه</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-3">
            رزومه شما به صورت خودکار از اطلاعات پروفایل ساخته می‌شود و قابل دانلود است.
          </p>
          <Button asChild variant="outline" size="sm" className="text-xs md:text-sm">
            <Link href="/app/resume">مشاهده و دانلود رزومه</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Public Profile Link */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-lg md:text-xl">اشتراک‌گذاری پروفایل</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-4">
            با استفاده از این لینک، پروفایل حرفه‌ای خود را با کارفرمایان به اشتراک بگذارید
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <code className="flex-1 px-3 py-2 bg-secondary rounded text-xs md:text-sm overflow-x-auto" dir="ltr">
              {publicProfileUrl || 'در حال ساخت...'}
            </code>
            <Button
              variant="outline"
              size="sm"
              className="text-xs md:text-sm whitespace-nowrap"
              onClick={() => {
                if (publicProfileUrl) {
                  navigator.clipboard.writeText(publicProfileUrl);
                }
              }}
              disabled={!publicProfileUrl}
            >
              کپی لینک
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trust Message */}
      <Card className="bg-primary/5 border-primary/20 shadow-sm">
        <CardContent className="p-3 md:p-4">
          <p className="text-xs md:text-sm text-center font-medium leading-relaxed">
            اطلاعات شما محرمانه است و تنها زمانی که شما اجازه دهید برای کارفرمایان نمایش داده می‌شود.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
