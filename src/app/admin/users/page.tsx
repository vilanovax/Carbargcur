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
import { Eye, Power, PowerOff, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import EditUserDialog from "@/components/admin/EditUserDialog";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(mockAdminUsers);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Open edit dialog
  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  // Toggle user active status
  const handleToggleUserStatus = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const action = user.isActive ? "غیرفعال‌سازی" : "فعال‌سازی";
    const confirmMsg = `آیا از ${action} حساب کاربری «${user.fullName}» مطمئن هستید؟`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (!response.ok) {
        throw new Error("خطا در به‌روزرسانی وضعیت کاربر");
      }

      // Update local state
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, isActive: !u.isActive } : u
        )
      );
    } catch (error) {
      alert("خطا در به‌روزرسانی وضعیت کاربر");
      console.error(error);
    }
  };

  // Delete user
  const handleDelete = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const confirmMsg = `⚠️ آیا از حذف حساب کاربری «${user.fullName}» مطمئن هستید؟\n\nاین عملیات غیرقابل بازگشت است.`;

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
    } catch (error) {
      alert("خطا در حذف کاربر");
      console.error(error);
    }
  };

  // Refresh user list after edit
  const handleEditSuccess = () => {
    // In real app, refetch from API
    // For now, just close dialog
    alert("اطلاعات کاربر با موفقیت به‌روزرسانی شد");
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

                        {/* Edit */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-8 px-2"
                          onClick={() => handleEdit(user)}
                          title="ویرایش"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>

                        {/* Toggle Active */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`text-xs h-8 px-2 ${
                            user.isActive ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"
                          }`}
                          onClick={() => handleToggleUserStatus(user.id)}
                          title={user.isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}
                        >
                          {user.isActive ? (
                            <PowerOff className="w-3.5 h-3.5" />
                          ) : (
                            <Power className="w-3.5 h-3.5" />
                          )}
                        </Button>

                        {/* Delete */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-8 px-2 text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(user.id)}
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Edit User Dialog */}
      <EditUserDialog
        user={editingUser}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
