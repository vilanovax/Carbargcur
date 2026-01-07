"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  MapPin,
  Building2,
  Clock,
  Briefcase,
  Star,
  Target,
  Brain,
  Sparkles,
  CheckCircle,
  Send,
} from "lucide-react";
import {
  calculateMatch,
  convertAPIJobToRequirements,
  type APIJob,
} from "@/lib/matching";

interface JobDetail extends APIJob {
  description: string | null;
}

const experienceLevelLabels: Record<string, string> = {
  junior: "کارشناس (۱-۳ سال)",
  mid: "میان‌رده (۳-۵ سال)",
  senior: "ارشد (۵+ سال)",
};

const employmentTypeLabels: Record<string, string> = {
  "full-time": "تمام‌وقت",
  "part-time": "پاره‌وقت",
  contract: "قراردادی",
  remote: "دورکاری",
};

const discLabels: Record<string, string> = {
  "result-oriented": "نتیجه‌گرا (D)",
  "people-oriented": "مردم‌گرا (I)",
  stable: "ثبات‌طلب (S)",
  precise: "دقیق (C)",
};

const hollandLabels: Record<string, string> = {
  realistic: "عملگرا (R)",
  investigative: "پژوهشگر (I)",
  artistic: "هنرمند (A)",
  social: "اجتماعی (S)",
  enterprising: "کارآفرین (E)",
  conventional: "قراردادی (C)",
};

// Mock user profile for matching demo
const mockUserProfile = {
  skills: ["حسابداری مالی", "Excel پیشرفته", "تحلیل مالی", "IFRS"],
  yearsOfExperience: 5,
  behaviorStyle: "precise" as const,
  careerFit: "conventional" as const,
};

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadJob();
  }, [params.id]);

  const loadJob = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/jobs/${params.id}`);

      if (response.status === 404) {
        setError("شغل مورد نظر یافت نشد");
        return;
      }

      if (!response.ok) {
        throw new Error("خطا در دریافت اطلاعات شغل");
      }

      const data = await response.json();
      setJob(data.job);

      // Calculate match score
      const requirements = convertAPIJobToRequirements(data.job);
      const result = calculateMatch(mockUserProfile, requirements);
      setMatchScore(result.overallScore);
    } catch (err: any) {
      console.error("Load job error:", err);
      setError("خطا در دریافت اطلاعات شغل");
    } finally {
      setIsLoading(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-blue-600 bg-blue-50";
    if (score >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
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
      <div className="space-y-4 py-12 text-center">
        <p className="text-red-600">{error || "شغل یافت نشد"}</p>
        <Button variant="outline" onClick={() => router.push("/app/matching")}>
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت به لیست شغل‌ها
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link href="/app/matching">
        <Button variant="ghost" size="sm">
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت به تطبیق شغلی
        </Button>
      </Link>

      {/* Job Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                {job.isFeatured && (
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    <Star className="w-3 h-3 ml-1" />
                    ویژه
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-gray-600 flex-wrap">
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
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {job.employmentType && (
                  <Badge variant="outline">
                    <Briefcase className="w-3 h-3 ml-1" />
                    {employmentTypeLabels[job.employmentType] || job.employmentType}
                  </Badge>
                )}
                {job.experienceLevel && (
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 ml-1" />
                    {experienceLevelLabels[job.experienceLevel] || job.experienceLevel}
                  </Badge>
                )}
              </div>
            </div>

            {/* Match Score */}
            {matchScore !== null && (
              <div className={`p-4 rounded-xl text-center ${getMatchColor(matchScore)}`}>
                <div className="text-3xl font-bold">{matchScore}٪</div>
                <div className="text-sm">تطابق با پروفایل</div>
              </div>
            )}
          </div>

          {/* Salary */}
          {(job.salaryMin || job.salaryMax) && (
            <div className="mt-4 pt-4 border-t">
              <span className="text-gray-600">حقوق: </span>
              <span className="font-semibold text-gray-900">
                {job.salaryMin && job.salaryMax
                  ? `${job.salaryMin} تا ${job.salaryMax} تومان`
                  : job.salaryMin
                  ? `از ${job.salaryMin} تومان`
                  : `تا ${job.salaryMax} تومان`}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      {job.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">شرح شغل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
              {job.description}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Required Skills */}
        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-red-500" />
                مهارت‌های الزامی
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill: string, idx: number) => (
                  <Badge
                    key={idx}
                    className="bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preferred Skills */}
        {job.preferredSkills && job.preferredSkills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                مهارت‌های مطلوب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.preferredSkills.map((skill: string, idx: number) => (
                  <Badge
                    key={idx}
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Personality Preferences */}
      {(job.preferredBehavior?.primary || job.preferredCareerFit?.primary) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ترجیحات شخصیتی</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {job.preferredBehavior?.primary && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="w-4 h-4" />
                    سبک رفتاری ترجیحی (DISC)
                  </div>
                  <Badge variant="outline" className="text-base">
                    {discLabels[job.preferredBehavior.primary] ||
                      job.preferredBehavior.primary}
                  </Badge>
                </div>
              )}

              {job.preferredCareerFit?.primary && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Brain className="w-4 h-4" />
                    تیپ شغلی ترجیحی (Holland)
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-base">
                      {hollandLabels[job.preferredCareerFit.primary] ||
                        job.preferredCareerFit.primary}
                    </Badge>
                    {job.preferredCareerFit.secondary && (
                      <Badge variant="outline" className="text-base">
                        {hollandLabels[job.preferredCareerFit.secondary] ||
                          job.preferredCareerFit.secondary}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Apply Button */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">
                آیا این شغل برای شما مناسب است؟
              </h3>
              <p className="text-sm text-gray-600">
                رزومه خود را ارسال کنید و منتظر تماس کارفرما باشید
              </p>
            </div>
            <Button size="lg" className="gap-2">
              <Send className="w-5 h-5" />
              ارسال رزومه
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posted Date */}
      <p className="text-center text-sm text-gray-400">
        تاریخ انتشار: {new Date(job.createdAt).toLocaleDateString("fa-IR")}
      </p>
    </div>
  );
}
