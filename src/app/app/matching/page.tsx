'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Briefcase,
  Building2,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowLeft,
  Brain,
  Users,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Star,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { loadFocusedFromStorage, type FocusedProfile } from '@/lib/onboarding';
import {
  calculateMatch,
  convertAPIJobToRequirements,
  type MatchResult,
  type MatchDimension,
  type JobRequirements,
  type APIJob,
} from '@/lib/matching/MatchingEngine';

// ============================================
// STATUS HELPERS
// ============================================

const STATUS_CONFIG = {
  excellent: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle2, label: 'عالی' },
  good: { color: 'text-blue-600', bg: 'bg-blue-100', icon: CheckCircle2, label: 'خوب' },
  partial: { color: 'text-amber-600', bg: 'bg-amber-100', icon: AlertCircle, label: 'متوسط' },
  weak: { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle, label: 'ضعیف' },
  missing: { color: 'text-slate-500', bg: 'bg-slate-100', icon: AlertTriangle, label: 'ناموجود' },
};

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-600';
}

// ============================================
// JOB CARD COMPONENT
// ============================================

interface JobCardProps {
  job: APIJob;
  jobRequirements: JobRequirements;
  isSelected: boolean;
  onSelect: () => void;
  matchScore?: number;
}

function JobCard({ job, jobRequirements, isSelected, onSelect, matchScore }: JobCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">{job.title}</h3>
              {job.isFeatured && (
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
              )}
            </div>
            {job.company && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3" />
                {job.company}
              </p>
            )}
            {job.city && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {job.city}
              </p>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
              {job.requiredSkills.slice(0, 3).map((s, i) => (
                <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                  {s}
                </Badge>
              ))}
              {job.requiredSkills.length > 3 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  +{job.requiredSkills.length - 3}
                </Badge>
              )}
            </div>
            <Link
              href={`/app/jobs/${job.id}`}
              className="text-xs text-blue-600 hover:underline mt-2 inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              مشاهده جزئیات →
            </Link>
          </div>
          {matchScore !== undefined && (
            <div className={`text-lg font-bold ${getScoreColor(matchScore)}`}>
              {matchScore}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// DIMENSION ROW COMPONENT
// ============================================

interface DimensionRowProps {
  dimension: MatchDimension;
  isExpanded: boolean;
  onToggle: () => void;
}

function DimensionRow({ dimension, isExpanded, onToggle }: DimensionRowProps) {
  const config = STATUS_CONFIG[dimension.status];
  const StatusIcon = config.icon;

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors"
        onClick={onToggle}
      >
        <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
          <StatusIcon className={`w-4 h-4 ${config.color}`} />
        </div>

        <div className="flex-1 text-right">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{dimension.name}</span>
            <span className={`text-sm font-bold ${getScoreColor(dimension.score)}`}>
              {dimension.score}%
            </span>
          </div>
          <div className="mt-1">
            <Progress value={dimension.score} className="h-1.5" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            وزن: {dimension.weight}%
          </Badge>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded && dimension.details.length > 0 && (
        <div className="px-4 pb-3 pt-1 bg-slate-50 border-t">
          <ul className="space-y-1">
            {dimension.details.map((detail, i) => (
              <li key={i} className="text-xs text-slate-600">
                {detail}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================
// MATCH RESULT COMPONENT
// ============================================

interface MatchResultViewProps {
  result: MatchResult;
  job: APIJob;
}

function MatchResultView({ result, job }: MatchResultViewProps) {
  const [expandedDimensions, setExpandedDimensions] = useState<string[]>([]);
  const config = STATUS_CONFIG[result.overallStatus];
  const StatusIcon = config.icon;

  const toggleDimension = (name: string) => {
    setExpandedDimensions(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  return (
    <div className="space-y-4">
      {/* Score Header */}
      <Card className={`${config.bg} border-0`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            {/* Score Circle */}
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="40" fill="none" stroke="white" strokeWidth="8" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke={result.overallScore >= 60 ? '#22c55e' : result.overallScore >= 40 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8"
                  strokeDasharray={`${result.overallScore * 2.51} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${config.color}`}>
                  {result.overallScore}
                </span>
                <span className="text-[10px] text-slate-500">امتیاز</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <Badge className={`${config.bg} ${config.color} mb-2`}>
                <StatusIcon className="w-3 h-3 ml-1" />
                {config.label}
              </Badge>
              <h3 className="font-bold text-lg">{job.title}</h3>
              {job.company && (
                <p className="text-sm text-slate-600">{job.company}</p>
              )}
              <p className="text-sm text-slate-600 mt-1">{result.recommendation}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Description */}
      {job.description && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">توضیحات شغل</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 whitespace-pre-line">{job.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Dimensions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4" />
            جزئیات تطبیق
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {result.dimensions.map(dim => (
            <DimensionRow
              key={dim.nameEn}
              dimension={dim}
              isExpanded={expandedDimensions.includes(dim.nameEn)}
              onToggle={() => toggleDimension(dim.nameEn)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Strengths & Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {result.strengths.length > 0 && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                نقاط قوت شما
              </h4>
              <ul className="space-y-1">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-green-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {result.gaps.length > 0 && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-amber-700 mb-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                فرصت‌های بهبود
              </h4>
              <ul className="space-y-1">
                {result.gaps.map((g, i) => (
                  <li key={i} className="text-sm text-amber-800 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {g}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Salary Info */}
      {(job.salaryMin || job.salaryMax) && (
        <Card className="bg-slate-50">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium text-slate-700 mb-1">حقوق پیشنهادی</h4>
            <p className="text-sm text-slate-600">
              {job.salaryMin && job.salaryMax
                ? `${job.salaryMin} تا ${job.salaryMax} تومان`
                : job.salaryMin || job.salaryMax}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function JobMatchingPage() {
  const [profile, setProfile] = useState<FocusedProfile | null>(null);
  const [apiJobs, setApiJobs] = useState<APIJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load profile
  useEffect(() => {
    const data = loadFocusedFromStorage();
    setProfile(data);
    setLoading(false);
  }, []);

  // Load jobs from API
  useEffect(() => {
    async function loadJobs() {
      try {
        setJobsLoading(true);
        const response = await fetch('/api/jobs?limit=20');
        if (!response.ok) {
          throw new Error('خطا در دریافت شغل‌ها');
        }
        const data = await response.json();
        setApiJobs(data.jobs || []);
      } catch (err) {
        console.error('Error loading jobs:', err);
        setError('خطا در بارگذاری شغل‌ها');
      } finally {
        setJobsLoading(false);
      }
    }
    loadJobs();
  }, []);

  // Calculate all match results
  const matchResults = useMemo(() => {
    if (!profile || apiJobs.length === 0) return [];
    return apiJobs.map(job => {
      const jobRequirements = convertAPIJobToRequirements(job);
      return {
        job,
        jobRequirements,
        result: calculateMatch(profile, jobRequirements),
      };
    }).sort((a, b) => b.result.overallScore - a.result.overallScore);
  }, [profile, apiJobs]);

  // Get selected match
  const selectedMatch = useMemo(() => {
    if (!selectedJobId) return matchResults[0];
    return matchResults.find(m => m.job.id === selectedJobId) || matchResults[0];
  }, [selectedJobId, matchResults]);

  // Profile completeness check
  const profileIssues = useMemo(() => {
    const issues: string[] = [];
    if (!profile) {
      issues.push('پروفایل ساخته نشده');
      return issues;
    }
    if (!profile.coreSkills || profile.coreSkills.length === 0) {
      issues.push('مهارت‌ها وارد نشده');
    }
    if (!profile.assessments?.disc) {
      issues.push('آزمون DISC انجام نشده');
    }
    if (!profile.assessments?.holland) {
      issues.push('آزمون هالند انجام نشده');
    }
    return issues;
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              تطبیق شغلی
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              پروفایل خود را با موقعیت‌های شغلی مقایسه کنید
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/app">
              <ArrowLeft className="ml-2 h-4 w-4" />
              داشبورد
            </Link>
          </Button>
        </div>

        {/* Profile Issues Warning */}
        {profileIssues.length > 0 && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800">پروفایل ناقص</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    برای دقت بیشتر در تطبیق، این موارد را تکمیل کنید:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profileIssues.includes('آزمون DISC انجام نشده') && (
                      <Button size="sm" variant="outline" asChild className="h-7 text-xs">
                        <Link href="/app/assessments/disc">
                          <Brain className="w-3 h-3 ml-1" />
                          آزمون DISC
                        </Link>
                      </Button>
                    )}
                    {profileIssues.includes('آزمون هالند انجام نشده') && (
                      <Button size="sm" variant="outline" asChild className="h-7 text-xs">
                        <Link href="/app/assessments/holland">
                          <Users className="w-3 h-3 ml-1" />
                          آزمون هالند
                        </Link>
                      </Button>
                    )}
                    {profileIssues.includes('مهارت‌ها وارد نشده') && (
                      <Button size="sm" variant="outline" asChild className="h-7 text-xs">
                        <Link href="/app/profile/onboarding/step-3-skills">
                          <Sparkles className="w-3 h-3 ml-1" />
                          افزودن مهارت
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              فرصت‌های شغلی
              {apiJobs.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {apiJobs.length} شغل
                </Badge>
              )}
            </h2>

            {jobsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">در حال بارگذاری شغل‌ها...</span>
                </div>
              </div>
            ) : matchResults.length > 0 ? (
              matchResults.map(({ job, jobRequirements, result }) => (
                <JobCard
                  key={job.id}
                  job={job}
                  jobRequirements={jobRequirements}
                  isSelected={selectedMatch?.job.id === job.id}
                  onSelect={() => setSelectedJobId(job.id)}
                  matchScore={result.overallScore}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">شغلی یافت نشد</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Match Result */}
          <div className="lg:col-span-2">
            {selectedMatch ? (
              <MatchResultView result={selectedMatch.result} job={selectedMatch.job} />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">یک موقعیت شغلی انتخاب کنید</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-medium text-blue-800 mb-2">چطور امتیاز تطبیق محاسبه می‌شود؟</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-white rounded p-2">
                <span className="font-medium text-blue-700">مهارت‌ها</span>
                <span className="text-slate-500 block">40% وزن</span>
              </div>
              <div className="bg-white rounded p-2">
                <span className="font-medium text-blue-700">سابقه کاری</span>
                <span className="text-slate-500 block">25% وزن</span>
              </div>
              <div className="bg-white rounded p-2">
                <span className="font-medium text-blue-700">سبک رفتاری</span>
                <span className="text-slate-500 block">20% وزن</span>
              </div>
              <div className="bg-white rounded p-2">
                <span className="font-medium text-blue-700">تناسب شغلی</span>
                <span className="text-slate-500 block">15% وزن</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
