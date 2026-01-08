"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, EyeOff, Loader2, RefreshCw, MapPin, Briefcase, CheckCircle } from "lucide-react";
import Link from "next/link";

interface AdminProfile {
  id: string;
  userId: string;
  slug: string;
  fullName: string;
  city: string | null;
  experienceLevel: string | null;
  jobStatus: string | null;
  skillsCount: number;
  isPublic: boolean;
  isActive: boolean;
  completionPercentage: number;
  onboardingCompleted: boolean;
  profilePhotoUrl: string | null;
  hasPersonalityTest: boolean;
  mobile: string | null;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  active: number;
  withNotes: number;
}

const JOB_STATUS_LABELS: Record<string, string> = {
  employed: "شاغل",
  seeking: "جویای کار",
  freelancer: "فریلنسر",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  junior: "تازه‌کار",
  mid: "میانی",
  senior: "ارشد",
  expert: "متخصص",
};

export default function AdminProfilesPage() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, withNotes: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/admin/profiles");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در دریافت پروفایل‌ها");
      }

      setProfiles(data.profiles || []);
      setStats(data.stats || { total: 0, active: 0, withNotes: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت اطلاعات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleTogglePublicStatus = async (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;

    const action = profile.isPublic ? "توقف نمایش عمومی" : "فعال‌سازی نمایش عمومی";
    if (!window.confirm(`آیا از ${action} پروفایل «${profile.fullName}» مطمئن هستید؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/profiles/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !profile.isPublic }),
      });

      if (!response.ok) {
        throw new Error("خطا در به‌روزرسانی");
      }

      setProfiles(
        profiles.map((p) =>
          p.id === profileId ? { ...p, isPublic: !p.isPublic } : p
        )
      );
    } catch {
      alert("خطا در به‌روزرسانی وضعیت پروفایل");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateStr));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={loadProfiles}>تلاش مجدد</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">مدیریت پروفایل‌ها</h2>
          <p className="text-sm text-gray-600 mt-1">
            مدیریت پروفایل‌های عمومی کاربران
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadProfiles}>
          <RefreshCw className="w-4 h-4 ml-2" />
          بروزرسانی
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {stats.total.toLocaleString("fa-IR")}
            </div>
            <p className="text-sm text-gray-600">کل پروفایل‌ها</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {stats.active.toLocaleString("fa-IR")}
            </div>
            <p className="text-sm text-gray-600">پروفایل‌های فعال</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {profiles.filter((p) => p.onboardingCompleted).length.toLocaleString("fa-IR")}
            </div>
            <p className="text-sm text-gray-600">آنبوردینگ کامل</p>
          </CardContent>
        </Card>
      </div>

      {/* Profiles List */}
      <div className="space-y-4">
        {profiles.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-500">
              هیچ پروفایلی یافت نشد
            </CardContent>
          </Card>
        ) : (
          profiles.map((profile) => (
            <Card key={profile.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Avatar & Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={profile.profilePhotoUrl || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {profile.fullName?.charAt(0) || "؟"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900">
                          {profile.fullName}
                        </h3>
                        {profile.onboardingCompleted && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        <Badge
                          variant={profile.isPublic ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {profile.isPublic ? "عمومی" : "خصوصی"}
                        </Badge>
                      </div>

                      <div className="text-sm text-gray-500 font-mono mt-0.5">
                        {profile.mobile || profile.slug}
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        {profile.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {profile.city}
                          </span>
                        )}
                        {profile.jobStatus && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" />
                            {JOB_STATUS_LABELS[profile.jobStatus] || profile.jobStatus}
                          </span>
                        )}
                        {profile.experienceLevel && (
                          <Badge variant="outline" className="text-xs">
                            {EXPERIENCE_LABELS[profile.experienceLevel] || profile.experienceLevel}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-gray-900">
                        {profile.skillsCount.toLocaleString("fa-IR")}
                      </div>
                      <div className="text-xs text-gray-500">مهارت</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-900">
                        {profile.completionPercentage}٪
                      </div>
                      <div className="text-xs text-gray-500">تکمیل</div>
                    </div>
                    <div className="text-center">
                      <Badge
                        variant={profile.hasPersonalityTest ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {profile.hasPersonalityTest ? "آزمون ✓" : "بدون آزمون"}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link href={`/u/${profile.slug}`} target="_blank">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 ml-1" />
                        مشاهده
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant={profile.isPublic ? "destructive" : "default"}
                      onClick={() => handleTogglePublicStatus(profile.id)}
                    >
                      {profile.isPublic ? (
                        <>
                          <EyeOff className="w-4 h-4 ml-1" />
                          مخفی
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 ml-1" />
                          عمومی
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-gray-500">
                  <span>ایجاد: {formatDate(profile.createdAt)}</span>
                  <span>آخرین بروزرسانی: {formatDate(profile.updatedAt)}</span>
                  {profile.lastLogin && (
                    <span>آخرین ورود: {formatDate(profile.lastLogin)}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
