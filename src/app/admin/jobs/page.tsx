"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  Building2,
  Star,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string | null;
  city: string | null;
  employmentType: string | null;
  experienceLevel: string | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  requiredSkills: string[];
}

const experienceLevelLabels: Record<string, string> = {
  junior: "کارشناس",
  mid: "میان‌رده",
  senior: "ارشد",
};

const employmentTypeLabels: Record<string, string> = {
  "full-time": "تمام‌وقت",
  "part-time": "پاره‌وقت",
  contract: "قراردادی",
  remote: "دورکاری",
};

export default function AdminJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/jobs");

      if (response.status === 403) {
        router.push("/auth?redirectTo=/admin/jobs");
        return;
      }

      if (!response.ok) {
        throw new Error("خطا در دریافت شغل‌ها");
      }

      const data = await response.json();
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      console.error("Load jobs error:", err);
      setError("خطا در دریافت لیست شغل‌ها");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleJobActive = async (jobId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setJobs(
          jobs.map((job) =>
            job.id === jobId ? { ...job, isActive: !currentStatus } : job
          )
        );
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setJobs(jobs.filter((job) => job.id !== jobId));
        setTotal((prev) => prev - 1);
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.includes(searchQuery) ||
      job.company?.includes(searchQuery) ||
      job.city?.includes(searchQuery)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">مدیریت شغل‌ها</h2>
          <p className="text-sm text-gray-600 mt-1">
            {total.toLocaleString("fa-IR")} شغل در سیستم
          </p>
        </div>
        <Link href="/admin/jobs/new">
          <Button>
            <Plus className="w-4 h-4 ml-2" />
            افزودن شغل جدید
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="جستجو بر اساس عنوان، شرکت یا شهر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">هیچ شغلی یافت نشد</p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card
              key={job.id}
              className={`${!job.isActive ? "opacity-60" : ""}`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Job Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      {job.isFeatured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          <Star className="w-3 h-3" />
                          ویژه
                        </span>
                      )}
                      {!job.isActive && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          غیرفعال
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                      {job.company && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {job.company}
                        </span>
                      )}
                      {job.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.city}
                        </span>
                      )}
                      {job.experienceLevel && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                          {experienceLevelLabels[job.experienceLevel] ||
                            job.experienceLevel}
                        </span>
                      )}
                      {job.employmentType && (
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded">
                          {employmentTypeLabels[job.employmentType] ||
                            job.employmentType}
                        </span>
                      )}
                    </div>

                    {job.requiredSkills && job.requiredSkills.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {job.requiredSkills.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.requiredSkills.length > 4 && (
                          <span className="text-xs text-gray-500">
                            +{job.requiredSkills.length - 4} مهارت دیگر
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-gray-400">
                      ایجاد شده:{" "}
                      {new Date(job.createdAt).toLocaleDateString("fa-IR")}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleJobActive(job.id, job.isActive)}
                      title={job.isActive ? "غیرفعال کردن" : "فعال کردن"}
                    >
                      {job.isActive ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Link href={`/admin/jobs/${job.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </Link>
                    {deleteConfirm === job.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteJob(job.id)}
                        >
                          حذف
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          انصراف
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirm(job.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
