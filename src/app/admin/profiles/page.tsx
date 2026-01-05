"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { mockAdminProfiles, type AdminProfile } from "@/lib/adminMockData";
import { Eye, EyeOff, FileEdit } from "lucide-react";
import Link from "next/link";

export default function AdminProfilesPage() {
  const [profiles, setProfiles] = useState<AdminProfile[]>(mockAdminProfiles);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");

  const handleTogglePublicStatus = (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;

    const action = profile.isPublic ? "توقف نمایش عمومی" : "فعال‌سازی نمایش عمومی";
    const confirm = window.confirm(
      `آیا از ${action} پروفایل «${profile.fullName}» مطمئن هستید؟`
    );

    if (confirm) {
      setProfiles(
        profiles.map((p) =>
          p.id === profileId ? { ...p, isPublic: !p.isPublic } : p
        )
      );
      // TODO: Call API to update profile status
    }
  };

  const handleEditNote = (profileId: string, currentNote?: string) => {
    setEditingNoteId(profileId);
    setNoteValue(currentNote || "");
  };

  const handleSaveNote = (profileId: string) => {
    setProfiles(
      profiles.map((p) =>
        p.id === profileId ? { ...p, notes: noteValue || undefined } : p
      )
    );
    setEditingNoteId(null);
    setNoteValue("");
    // TODO: Call API to save note
  };

  const handleCancelNote = () => {
    setEditingNoteId(null);
    setNoteValue("");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">مدیریت پروفایل‌ها</h2>
        <p className="text-sm text-gray-600 mt-1">
          مدیریت پروفایل‌های عمومی و رسیدگی به گزارش‌ها
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {profiles.length.toLocaleString('fa-IR')}
            </div>
            <p className="text-sm text-gray-600">کل پروفایل‌ها</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {profiles.filter((p) => p.isPublic).length.toLocaleString('fa-IR')}
            </div>
            <p className="text-sm text-gray-600">پروفایل‌های فعال</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {profiles.filter((p) => p.notes).length.toLocaleString('fa-IR')}
            </div>
            <p className="text-sm text-gray-600">پروفایل‌های دارای یادداشت</p>
          </CardContent>
        </Card>
      </div>

      {/* Profiles List */}
      <div className="space-y-4">
        {profiles.map((profile) => (
          <Card key={profile.id} className="shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        {profile.fullName}
                      </h3>
                      <Badge
                        variant={profile.isPublic ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {profile.isPublic ? "نمایش عمومی فعال" : "نمایش عمومی متوقف"}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 font-mono">
                      {profile.slug}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/u/${profile.slug}`} target="_blank">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 ml-2" />
                        مشاهده پروفایل
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant={profile.isPublic ? "destructive" : "default"}
                      onClick={() => handleTogglePublicStatus(profile.id)}
                    >
                      {profile.isPublic ? (
                        <>
                          <EyeOff className="w-4 h-4 ml-2" />
                          توقف نمایش عمومی
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 ml-2" />
                          فعال‌سازی نمایش
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Profile Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div>
                    تعداد مهارت‌ها:{" "}
                    <span className="font-medium text-gray-900">
                      {profile.skillsCount.toLocaleString('fa-IR')}
                    </span>
                  </div>
                  <div>
                    آزمون شخصیت:{" "}
                    <Badge
                      variant={profile.hasPersonalityTest ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {profile.hasPersonalityTest ? "انجام‌شده" : "انجام‌نشده"}
                    </Badge>
                  </div>
                </div>

                {/* Admin Notes Section */}
                <div className="pt-4 border-t">
                  {editingNoteId === profile.id ? (
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FileEdit className="w-4 h-4" />
                        یادداشت داخلی (فقط برای ادمین)
                      </label>
                      <Textarea
                        value={noteValue}
                        onChange={(e) => setNoteValue(e.target.value)}
                        placeholder="یادداشت خود را اینجا بنویسید..."
                        rows={3}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveNote(profile.id)}
                        >
                          ذخیره
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelNote}
                        >
                          انصراف
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {profile.notes ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 flex-1">
                              <p className="text-xs font-medium text-yellow-900">
                                یادداشت داخلی ادمین:
                              </p>
                              <p className="text-sm text-yellow-800">
                                {profile.notes}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditNote(profile.id, profile.notes)}
                              className="text-xs"
                            >
                              ویرایش
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditNote(profile.id)}
                          className="text-xs"
                        >
                          <FileEdit className="w-3 h-3 ml-2" />
                          افزودن یادداشت داخلی
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
