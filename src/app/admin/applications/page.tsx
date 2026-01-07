"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  User,
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Application {
  id: string;
  status: string;
  coverLetter: string | null;
  matchScore: number | null;
  appliedAt: string;
  reviewedAt: string | null;
  adminNotes: string | null;
  job: {
    id: string;
    title: string;
    company: string | null;
  } | null;
  applicant: {
    profileId: string | null;
    name: string;
    email: string | null;
    phone: string | null;
    skills: string[];
    yearsOfExperience: number | null;
    username: string | null;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusLabels: Record<string, string> = {
  pending: "در انتظار بررسی",
  reviewed: "بررسی‌شده",
  shortlisted: "گزینش‌شده",
  rejected: "رد شده",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewed: "bg-blue-100 text-blue-800",
  shortlisted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

function AdminApplicationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");

  // Status update dialog
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadApplications();
  }, [searchParams]);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();

      const status = searchParams.get("status");
      const search = searchParams.get("search");
      const page = searchParams.get("page") || "1";

      if (status && status !== "all") params.set("status", status);
      if (search) params.set("search", search);
      params.set("page", page);

      const response = await fetch(`/api/admin/applications?${params.toString()}`);

      if (response.status === 403) {
        router.push("/auth?redirectTo=/admin/applications");
        return;
      }

      if (!response.ok) {
        throw new Error("خطا در دریافت درخواست‌ها");
      }

      const data = await response.json();
      setApplications(data.applications);
      setPagination(data.pagination);
    } catch (err: unknown) {
      console.error("Load applications error:", err);
      setError("خطا در دریافت درخواست‌ها");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
    router.push(`/admin/applications?${params.toString()}`);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (value && value !== "all") params.set("status", value);
    router.push(`/admin/applications?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/admin/applications?${params.toString()}`);
  };

  const openStatusDialog = (app: Application) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setAdminNotes(app.adminNotes || "");
  };

  const handleUpdateStatus = async () => {
    if (!selectedApp) return;

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/applications/${selectedApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, adminNotes }),
      });

      if (!response.ok) {
        throw new Error("خطا در به‌روزرسانی");
      }

      // Refresh list
      await loadApplications();
      setSelectedApp(null);
    } catch (err: unknown) {
      console.error("Update error:", err);
      setError("خطا در به‌روزرسانی وضعیت");
    } finally {
      setIsUpdating(false);
    }
  };

  const getMatchScoreColor = (score: number | null) => {
    if (!score) return "text-gray-400";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">مدیریت درخواست‌ها</h2>
          <p className="text-sm text-gray-600 mt-1">
            بررسی و مدیریت درخواست‌های شغلی
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="جستجو در نام، ایمیل، شغل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="w-4 h-4" />
              </Button>
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 ml-2" />
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                <SelectItem value="pending">در انتظار بررسی</SelectItem>
                <SelectItem value="reviewed">بررسی‌شده</SelectItem>
                <SelectItem value="shortlisted">گزینش‌شده</SelectItem>
                <SelectItem value="rejected">رد شده</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      ) : applications.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">درخواستی یافت نشد</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Applicant Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {app.applicant.name || "نامشخص"}
                      </span>
                      {app.applicant.username && (
                        <Link
                          href={`/u/${app.applicant.username}`}
                          target="_blank"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          @{app.applicant.username}
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span>{app.job?.title || "شغل نامشخص"}</span>
                      {app.job?.company && (
                        <span className="text-gray-400">- {app.job.company}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(app.appliedAt).toLocaleDateString("fa-IR")}
                      </span>
                      {app.matchScore && (
                        <span className={`font-medium ${getMatchScoreColor(app.matchScore)}`}>
                          تطابق: {app.matchScore}٪
                        </span>
                      )}
                    </div>

                    {app.applicant.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {app.applicant.skills.slice(0, 4).map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {app.applicant.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{app.applicant.skills.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={statusColors[app.status]}>
                      {statusLabels[app.status] || app.status}
                    </Badge>

                    <div className="flex items-center gap-2">
                      {app.applicant.profileId && (
                        <Link href={`/admin/profiles/${app.applicant.profileId}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 ml-1" />
                            پروفایل
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openStatusDialog(app)}
                      >
                        تغییر وضعیت
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                {app.adminNotes && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">یادداشت ادمین: </span>
                      {app.adminNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600">
            صفحه {pagination.page.toLocaleString("fa-IR")} از{" "}
            {pagination.totalPages.toLocaleString("fa-IR")}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Status Update Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تغییر وضعیت درخواست</DialogTitle>
            <DialogDescription>
              {selectedApp?.applicant.name} - {selectedApp?.job?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">وضعیت</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      در انتظار بررسی
                    </span>
                  </SelectItem>
                  <SelectItem value="reviewed">
                    <span className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-500" />
                      بررسی‌شده
                    </span>
                  </SelectItem>
                  <SelectItem value="shortlisted">
                    <span className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-green-500" />
                      گزینش‌شده
                    </span>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <span className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      رد شده
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">یادداشت ادمین</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="یادداشت داخلی (فقط برای ادمین‌ها)"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApp(null)}>
              انصراف
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isUpdating}>
              {isUpdating ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminApplicationsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20">در حال بارگذاری...</div>}>
      <AdminApplicationsContent />
    </Suspense>
  );
}
