"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  CheckCircle2,
  Star,
  Sparkles,
  ThumbsUp,
  Trophy,
  TrendingUp,
  ArrowLeft,
  Loader2,
} from "lucide-react";

interface QAStats {
  totalAnswers: number;
  expertAnswers: number;
  acceptedAnswers: number;
  topCategory: string | null;
  helpfulReactions: number;
  expertReactions: number;
  avgAqs: number;
  totalAqs: number;
  starCount: number;
  proCount: number;
  usefulCount: number;
  featuredAnswers: {
    answerId: string;
    questionId: string;
    questionTitle: string;
    helpfulCount: number;
    expertBadgeCount: number;
  }[];
}

const CATEGORY_LABELS: Record<string, string> = {
  accounting: "حسابداری",
  finance: "مالی",
  tax: "مالیات",
  insurance: "بیمه",
  investment: "سرمایه‌گذاری",
  audit: "حسابرسی",
  budgeting: "بودجه",
  cost: "بهای تمام‌شده",
};

interface QAStatsCardProps {
  userId: string;
  showFeatured?: boolean;
  compact?: boolean;
}

export default function QAStatsCard({ userId, showFeatured = true, compact = false }: QAStatsCardProps) {
  const [stats, setStats] = useState<QAStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${userId}/qa-stats`);
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error("Error loading QA stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalAnswers === 0) {
    return null; // Don't show card if no Q&A activity
  }

  const acceptanceRate = stats.totalAnswers > 0
    ? Math.round((stats.acceptedAnswers / stats.totalAnswers) * 100)
    : 0;

  // Determine expert level based on avgAqs
  const getExpertLevel = () => {
    if (stats.avgAqs >= 85) return { label: "متخصص برتر", color: "text-amber-600", bg: "bg-amber-100" };
    if (stats.avgAqs >= 70) return { label: "متخصص", color: "text-purple-600", bg: "bg-purple-100" };
    if (stats.avgAqs >= 40) return { label: "فعال", color: "text-blue-600", bg: "bg-blue-100" };
    return { label: "تازه‌وارد", color: "text-slate-600", bg: "bg-slate-100" };
  };

  const expertLevel = getExpertLevel();

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <span>{stats.totalAnswers} پاسخ</span>
        </div>
        {stats.acceptedAnswers > 0 && (
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>{stats.acceptedAnswers} تأیید شده</span>
          </div>
        )}
        {stats.avgAqs > 0 && (
          <Badge variant="outline" className={`${expertLevel.bg} ${expertLevel.color} border-0`}>
            AQS: {stats.avgAqs}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border-indigo-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-600" />
            فعالیت در پرسش و پاسخ
          </div>
          {stats.avgAqs > 0 && (
            <Badge className={`${expertLevel.bg} ${expertLevel.color} border-0`}>
              {expertLevel.label}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total Answers */}
          <div className="bg-white rounded-lg p-3 text-center border border-indigo-100">
            <MessageSquare className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
            <div className="text-xl font-bold text-indigo-700">{stats.totalAnswers}</div>
            <div className="text-xs text-muted-foreground">پاسخ</div>
          </div>

          {/* Accepted */}
          <div className="bg-white rounded-lg p-3 text-center border border-green-100">
            <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="text-xl font-bold text-green-700">{stats.acceptedAnswers}</div>
            <div className="text-xs text-muted-foreground">تأیید شده</div>
          </div>

          {/* AQS Score */}
          <div className="bg-white rounded-lg p-3 text-center border border-purple-100">
            <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <div className="text-xl font-bold text-purple-700">{stats.avgAqs}</div>
            <div className="text-xs text-muted-foreground">AQS</div>
          </div>

          {/* Acceptance Rate */}
          <div className="bg-white rounded-lg p-3 text-center border border-amber-100">
            <Star className="w-5 h-5 text-amber-600 mx-auto mb-1" />
            <div className="text-xl font-bold text-amber-700">{acceptanceRate}%</div>
            <div className="text-xs text-muted-foreground">نرخ تأیید</div>
          </div>
        </div>

        {/* Quality Badges */}
        {(stats.starCount > 0 || stats.proCount > 0 || stats.usefulCount > 0) && (
          <div className="flex flex-wrap gap-2">
            {stats.starCount > 0 && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                <Star className="w-3 h-3" />
                {stats.starCount} پاسخ منتخب
              </Badge>
            )}
            {stats.proCount > 0 && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 gap-1">
                <Sparkles className="w-3 h-3" />
                {stats.proCount} حرفه‌ای
              </Badge>
            )}
            {stats.usefulCount > 0 && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
                <ThumbsUp className="w-3 h-3" />
                {stats.usefulCount} مفید
              </Badge>
            )}
          </div>
        )}

        {/* Top Category */}
        {stats.topCategory && (
          <div className="text-sm text-muted-foreground">
            تخصص اصلی:{" "}
            <span className="font-medium text-foreground">
              {CATEGORY_LABELS[stats.topCategory] || stats.topCategory}
            </span>
          </div>
        )}

        {/* Featured Answers */}
        {showFeatured && stats.featuredAnswers.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground">پاسخ‌های برتر:</p>
            {stats.featuredAnswers.map((answer) => (
              <Link
                key={answer.answerId}
                href={`/app/qa/${answer.questionId}`}
                className="block p-2 bg-white rounded border border-slate-200 hover:border-indigo-300 transition-colors group"
              >
                <p className="text-sm line-clamp-1 group-hover:text-indigo-600">
                  {answer.questionTitle}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  {answer.expertBadgeCount > 0 && (
                    <span className="flex items-center gap-0.5 text-amber-600">
                      <Star className="w-3 h-3" />
                      {answer.expertBadgeCount}
                    </span>
                  )}
                  {answer.helpfulCount > 0 && (
                    <span className="flex items-center gap-0.5">
                      <ThumbsUp className="w-3 h-3" />
                      {answer.helpfulCount}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href="/app/qa" className="gap-1">
            مشاهده بخش پرسش و پاسخ
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
