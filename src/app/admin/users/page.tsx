"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Power, PowerOff, Edit2, Trash2, Loader2, RefreshCw, CheckCircle, UserCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface AdminUser {
  id: string;
  mobile: string;
  fullName: string | null;
  isVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
  lastLogin: string | null;
  profileId: string | null;
  profileFullName: string | null;
  profileSlug: string | null;
  profileCity: string | null;
  profileIsPublic: boolean | null;
  profileIsActive: boolean | null;
  completionPercentage: number | null;
  onboardingCompleted: boolean | null;
}

interface Stats {
  totalUsers: number;
  profileStarted: number;
  completeProfiles: number;
  activePublicProfiles: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    profileStarted: 0,
    completeProfiles: 0,
    activePublicProfiles: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/admin/users");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در دریافت کاربران");
      }

      setUsers(data.users || []);
      setStats(data.stats || {
        totalUsers: 0,
        profileStarted: 0,
        completeProfiles: 0,
        activePublicProfiles: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت اطلاعات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Toggle user verification status
  const handleToggleVerification = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const action = user.isVerified ? "لغو تأیید" : "تأیید";
    const confirmMsg = `آیا از ${action} حساب کاربری «${user.profileFullName || user.fullName || user.mobile}» مطمئن هستید؟`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !user.isVerified }),
      });

      if (!response.ok) {
        throw new Error("خطا در به‌روزرسانی وضعیت کاربر");
      }

      // Update local state
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, isVerified: !u.isVerified } : u
        )
      );
    } catch {
      alert("خطا در به‌روزرسانی وضعیت کاربر");
    }
  };

  // Delete user
  const handleDelete = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const confirmMsg = `⚠️ آیا از حذف حساب کاربری «${user.profileFullName || user.fullName || user.mobile}» مطمئن هستید؟\n\nاین عملیات غیرقابل بازگشت است.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("خطا در حذف کاربر");
      }

      // Remove from local state
      setUsers(users.filter((u) => u.id !== userId));
      alert("کاربر با موفقیت حذف شد");
    } catch {
      alert("خطا در حذف کاربر");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateStr));
  };

  const getDisplayName = (user: AdminUser) => {
    return user.profileFullName || user.fullName || "بدون نام";
  };

  const getInitials = (name: string) => {
    if (!name || name === "بدون نام") return "؟";
    return name.charAt(0);
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
        <Button onClick={loadUsers}>تلاش مجدد</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">مدیریت کاربران</h2>
          <p className="text-sm text-gray-600 mt-1">
            مشاهده و مدیریت حساب‌های کاربری
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadUsers}>
          <RefreshCw className="w-4 h-4 ml-2" />
          بروزرسانی
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalUsers.toLocaleString("fa-IR")}
            </div>
            <p className="text-sm text-gray-600">کل کاربران</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {stats.profileStarted.toLocaleString("fa-IR")}
            </div>
            <p className="text-sm text-gray-600">پروفایل ایجاد شده</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {stats.completeProfiles.toLocaleString("fa-IR")}
            </div>
            <p className="text-sm text-gray-600">آنبوردینگ کامل</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {stats.activePublicProfiles.toLocaleString("fa-IR")}
            </div>
            <p className="text-sm text-gray-600">پروفایل عمومی</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>لیست کاربران</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              هیچ کاربری یافت نشد
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-right">
                    <th className="pb-3 px-4 text-sm font-medium text-gray-700">
                      کاربر
                    </th>
                    <th className="pb-3 px-4 text-sm font-medium text-gray-700">
                      وضعیت پروفایل
                    </th>
                    <th className="pb-3 px-4 text-sm font-medium text-gray-700">
                      تاریخ عضویت
                    </th>
                    <th className="pb-3 px-4 text-sm font-medium text-gray-700">
                      آخرین ورود
                    </th>
                    <th className="pb-3 px-4 text-sm font-medium text-gray-700">
                      وضعیت
                    </th>
                    <th className="pb-3 px-4 text-sm font-medium text-gray-700">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(getDisplayName(user))}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {getDisplayName(user)}
                              </span>
                              {user.isAdmin && (
                                <ShieldCheck className="w-4 h-4 text-amber-500" title="ادمین" />
                              )}
                              {user.isVerified && (
                                <CheckCircle className="w-4 h-4 text-green-500" title="تأیید شده" />
                              )}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              {user.mobile}
                            </div>
                            {user.profileCity && (
                              <div className="text-xs text-gray-400">
                                {user.profileCity}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {user.profileId ? (
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  user.completionPercentage === 100
                                    ? "bg-green-500"
                                    : (user.completionPercentage || 0) >= 70
                                    ? "bg-blue-500"
                                    : "bg-yellow-500"
                                }`}
                                style={{
                                  width: `${user.completionPercentage || 0}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {user.completionPercentage || 0}٪
                            </span>
                            {user.onboardingCompleted && (
                              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-400">
                            <UserCircle className="w-4 h-4" />
                            <span className="text-sm">بدون پروفایل</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {user.lastLogin ? formatDate(user.lastLogin) : "-"}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={user.isVerified ? "default" : "secondary"}
                            className="text-xs w-fit"
                          >
                            {user.isVerified ? "تأیید شده" : "تأیید نشده"}
                          </Badge>
                          {user.profileIsPublic && (
                            <Badge variant="outline" className="text-xs w-fit">
                              عمومی
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* View Profile */}
                          {user.profileSlug && (
                            <Link href={`/u/${user.profileSlug}`} target="_blank">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs h-8 px-2"
                                title="مشاهده پروفایل"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          )}

                          {/* Toggle Verification */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`text-xs h-8 px-2 ${
                              user.isVerified
                                ? "text-orange-600 hover:text-orange-700"
                                : "text-green-600 hover:text-green-700"
                            }`}
                            onClick={() => handleToggleVerification(user.id)}
                            title={user.isVerified ? "لغو تأیید" : "تأیید حساب"}
                          >
                            {user.isVerified ? (
                              <PowerOff className="w-3.5 h-3.5" />
                            ) : (
                              <Power className="w-3.5 h-3.5" />
                            )}
                          </Button>

                          {/* Delete - only if not admin */}
                          {!user.isAdmin && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs h-8 px-2 text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(user.id)}
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
