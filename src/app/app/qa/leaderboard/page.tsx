"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trophy,
  Medal,
  Award,
  Star,
  MessageSquare,
  CheckCircle2,
  ThumbsUp,
  Sparkles,
  ArrowLeft,
  Loader2,
  MapPin,
  Briefcase,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  slug: string;
  profilePhotoUrl: string | null;
  currentPosition: string | null;
  city: string | null;
  expertLevel: string;
  topCategory: string | null;
  stats: {
    totalAnswers: number;
    acceptedAnswers: number;
    helpfulReactions: number;
    expertReactions: number;
    totalQuestions: number;
    score: number;
  };
}

const EXPERT_LEVELS: Record<string, { label: string; color: string; icon: typeof Star }> = {
  newcomer: { label: "تازه‌وارد", color: "text-gray-500", icon: Star },
  contributor: { label: "مشارکت‌کننده", color: "text-blue-500", icon: Star },
  specialist: { label: "متخصص", color: "text-green-500", icon: Award },
  senior: { label: "ارشد", color: "text-purple-500", icon: Medal },
  expert: { label: "خبره", color: "text-amber-500", icon: Trophy },
  top_expert: { label: "استاد", color: "text-red-500", icon: Crown },
};

const CATEGORY_LABELS: Record<string, string> = {
  accounting: "حسابداری",
  finance: "مالی",
  tax: "مالیات",
  insurance: "بیمه",
  investment: "سرمایه‌گذاری",
  other: "سایر",
};

const PERIOD_LABELS: Record<string, string> = {
  all: "همه زمان‌ها",
  month: "این ماه",
  week: "این هفته",
};

function getRankBadge(rank: number) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg">
        <Trophy className="w-5 h-5" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-md">
        <Medal className="w-5 h-5" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-md">
        <Award className="w-5 h-5" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-foreground font-bold">
      {rank}
    </div>
  );
}

function getInitials(name: string) {
  if (!name) return "؟";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return parts[0][0] + parts[1][0];
  }
  return name.substring(0, 2);
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("all");
  const [category, setCategory] = useState("all");

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("period", period);
      params.set("limit", "50");
      if (category !== "all") {
        params.set("category", category);
      }

      const response = await fetch(`/api/qa/leaderboard?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در دریافت لیدربورد");
      }

      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت اطلاعات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [period, category]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-7 h-7 text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold">برترین‌های پرسش و پاسخ</h1>
            <p className="text-sm text-muted-foreground">
              رتبه‌بندی بر اساس تعداد پاسخ، پاسخ‌های پذیرفته‌شده و امتیاز تخصص
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/app/qa">
            <ArrowLeft className="w-4 h-4 ml-2" />
            بازگشت به سؤالات
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">بازه زمانی:</span>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PERIOD_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">دسته‌بندی:</span>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Legend */}
      <Card className="mb-6 bg-muted/50">
        <CardContent className="py-3">
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground justify-center">
            <span>امتیازدهی:</span>
            <span>هر پاسخ = ۱۰</span>
            <span>پاسخ پذیرفته‌شده = ۵۰</span>
            <span>مفید بود = ۵</span>
            <span>پاسخ تخصصی = ۲۰</span>
            <span>هر سؤال = ۲</span>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadLeaderboard}>تلاش مجدد</Button>
        </div>
      ) : leaderboard.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Trophy className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">هنوز کسی در لیدربورد نیست</h3>
            <p className="text-muted-foreground mb-4">
              اولین نفری باشید که به سؤالات پاسخ می‌دهد!
            </p>
            <Button asChild>
              <Link href="/app/qa">مشاهده سؤالات</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Top 3 Highlight */}
          {leaderboard.slice(0, 3).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {leaderboard.slice(0, 3).map((entry) => {
                const level = EXPERT_LEVELS[entry.expertLevel] || EXPERT_LEVELS.newcomer;
                const LevelIcon = level.icon;

                return (
                  <Card
                    key={entry.userId}
                    className={cn(
                      "relative overflow-hidden",
                      entry.rank === 1 && "border-amber-400 bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-950/20",
                      entry.rank === 2 && "border-gray-300 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-800/20",
                      entry.rank === 3 && "border-amber-600/50 bg-gradient-to-b from-amber-100/30 to-transparent dark:from-amber-900/10"
                    )}
                  >
                    <CardContent className="pt-6 text-center">
                      <div className="flex justify-center mb-3">
                        {getRankBadge(entry.rank)}
                      </div>
                      <Link href={`/u/${entry.slug}`}>
                        <Avatar className="w-16 h-16 mx-auto mb-3 border-2 border-primary/20">
                          <AvatarImage src={entry.profilePhotoUrl || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-lg">
                            {getInitials(entry.fullName)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <Link href={`/u/${entry.slug}`}>
                        <h3 className="font-semibold hover:text-primary transition-colors">
                          {entry.fullName}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <LevelIcon className={cn("w-3.5 h-3.5", level.color)} />
                        <span className={cn("text-xs", level.color)}>{level.label}</span>
                      </div>
                      {entry.currentPosition && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {entry.currentPosition}
                        </p>
                      )}
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-2xl font-bold text-primary">
                          {entry.stats.score.toLocaleString("fa-IR")}
                        </div>
                        <p className="text-xs text-muted-foreground">امتیاز</p>
                      </div>
                      <div className="flex justify-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {entry.stats.totalAnswers}
                        </span>
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-3 h-3" />
                          {entry.stats.acceptedAnswers}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Rest of Leaderboard */}
          {leaderboard.slice(3).map((entry) => {
            const level = EXPERT_LEVELS[entry.expertLevel] || EXPERT_LEVELS.newcomer;
            const LevelIcon = level.icon;

            return (
              <Card key={entry.userId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    {getRankBadge(entry.rank)}

                    {/* Avatar */}
                    <Link href={`/u/${entry.slug}`}>
                      <Avatar className="w-12 h-12 border">
                        <AvatarImage src={entry.profilePhotoUrl || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(entry.fullName)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/u/${entry.slug}`}>
                        <h3 className="font-semibold hover:text-primary transition-colors truncate">
                          {entry.fullName}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <LevelIcon className={cn("w-3.5 h-3.5", level.color)} />
                          <span className={cn("text-xs", level.color)}>{level.label}</span>
                        </div>
                        {entry.currentPosition && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {entry.currentPosition}
                          </span>
                        )}
                        {entry.city && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {entry.city}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center hidden sm:block">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MessageSquare className="w-4 h-4" />
                          <span>{entry.stats.totalAnswers}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">پاسخ</span>
                      </div>
                      <div className="text-center hidden sm:block">
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{entry.stats.acceptedAnswers}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">پذیرفته</span>
                      </div>
                      <div className="text-center hidden sm:block">
                        <div className="flex items-center gap-1 text-amber-600">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{entry.stats.helpfulReactions}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">مفید</span>
                      </div>
                      <div className="text-center min-w-[60px]">
                        <div className="text-lg font-bold text-primary">
                          {entry.stats.score.toLocaleString("fa-IR")}
                        </div>
                        <span className="text-xs text-muted-foreground">امتیاز</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
