"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  mockAdminUsers,
  getJobStatusLabel,
  type AdminUser,
} from "@/lib/adminMockData";
import { Eye, Power, PowerOff } from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(mockAdminUsers);

  const handleToggleUserStatus = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const action = user.isActive ? "غیرفعال‌سازی" : "فعال‌سازی";
    const confirm = window.confirm(
      `آیا از ${action} حساب کاربری «${user.fullName}» مطمئن هستید؟`
    );

    if (confirm) {
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, isActive: !u.isActive } : u
        )
      );
      // TODO: Call API to update user status
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">مدیریت کاربران</h2>
        <p className="text-sm text-gray-600 mt-1">
          مشاهده و مدیریت حساب‌های کاربری
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {users.length.toLocaleString('fa-IR')}
            </div>
            <p className="text-sm text-gray-600">کل کاربران</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.isActive).length.toLocaleString('fa-IR')}
            </div>
            <p className="text-sm text-gray-600">حساب‌های فعال</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {users.filter((u) => !u.isActive).length.toLocaleString('fa-IR')}
            </div>
            <p className="text-sm text-gray-600">حساب‌های غیرفعال</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>لیست کاربران</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-right">
                  <th className="pb-3 px-4 text-sm font-medium text-gray-700">
                    نام
                  </th>
                  <th className="pb-3 px-4 text-sm font-medium text-gray-700">
                    وضعیت پروفایل
                  </th>
                  <th className="pb-3 px-4 text-sm font-medium text-gray-700">
                    وضعیت شغلی
                  </th>
                  <th className="pb-3 px-4 text-sm font-medium text-gray-700">
                    تاریخ عضویت
                  </th>
                  <th className="pb-3 px-4 text-sm font-medium text-gray-700">
                    وضعیت حساب
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
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.fullName}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {user.mobile}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              user.profileCompletion === 100
                                ? 'bg-green-500'
                                : user.profileCompletion >= 70
                                ? 'bg-blue-500'
                                : 'bg-yellow-500'
                            }`}
                            style={{ width: `${user.profileCompletion}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {user.profileCompletion}٪
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="secondary" className="text-xs">
                        {getJobStatusLabel(user.jobStatus)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {formatDate(user.joinedAt)}
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={user.isActive ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {user.isActive ? "فعال" : "غیرفعال"}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {user.profileSlug && (
                          <Link href={`/u/${user.profileSlug}`} target="_blank">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              <Eye className="w-3 h-3 ml-1" />
                              مشاهده پروفایل
                            </Button>
                          </Link>
                        )}
                        <Button
                          size="sm"
                          variant={user.isActive ? "destructive" : "default"}
                          className="text-xs"
                          onClick={() => handleToggleUserStatus(user.id)}
                        >
                          {user.isActive ? (
                            <>
                              <PowerOff className="w-3 h-3 ml-1" />
                              غیرفعال‌سازی
                            </>
                          ) : (
                            <>
                              <Power className="w-3 h-3 ml-1" />
                              فعال‌سازی
                            </>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
