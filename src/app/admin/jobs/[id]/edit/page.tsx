"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import JobForm from "@/components/admin/JobForm";

interface JobData {
  id: string;
  title: string;
  company: string | null;
  description: string | null;
  city: string | null;
  employmentType: string | null;
  experienceLevel: string | null;
  minExperienceYears: number | null;
  maxExperienceYears: number | null;
  requiredSkills: string[];
  preferredSkills: string[];
  preferredBehavior: {
    primary: string;
    traits: string[];
  } | null;
  preferredCareerFit: {
    primary: string;
    secondary: string;
  } | null;
  salaryMin: string | null;
  salaryMax: string | null;
  isFeatured: boolean;
  isActive: boolean;
}

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<JobData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadJob();
  }, [params.id]);

  const loadJob = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/jobs/${params.id}`);

      if (response.status === 403) {
        router.push("/auth?redirectTo=/admin/jobs");
        return;
      }

      if (response.status === 404) {
        setError("شغل یافت نشد");
        return;
      }

      if (!response.ok) {
        throw new Error("خطا در دریافت اطلاعات شغل");
      }

      const data = await response.json();
      setJob(data.job);
    } catch (err: any) {
      console.error("Load job error:", err);
      setError("خطا در دریافت اطلاعات شغل");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-600">{error || "شغل یافت نشد"}</p>
      </div>
    );
  }

  // Transform data for the form
  const formData = {
    id: job.id,
    title: job.title,
    company: job.company || "",
    description: job.description || "",
    city: job.city || "",
    employmentType: job.employmentType || "full-time",
    experienceLevel: job.experienceLevel || "mid",
    minExperienceYears: job.minExperienceYears,
    maxExperienceYears: job.maxExperienceYears,
    requiredSkills: job.requiredSkills || [],
    preferredSkills: job.preferredSkills || [],
    preferredBehavior: job.preferredBehavior || { primary: "", traits: [] },
    preferredCareerFit: job.preferredCareerFit || { primary: "", secondary: "" },
    salaryMin: job.salaryMin || "",
    salaryMax: job.salaryMax || "",
    isFeatured: job.isFeatured,
    isActive: job.isActive,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">ویرایش شغل</h2>
        <p className="text-sm text-gray-600 mt-1">{job.title}</p>
      </div>

      <JobForm initialData={formData} isEdit />
    </div>
  );
}
