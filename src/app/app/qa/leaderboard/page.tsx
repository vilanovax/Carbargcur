"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Sparkles,
  ThumbsUp,
  ArrowRight,
  Loader2,
  TrendingUp,
  CheckCircle2,
  MessageSquare,
  Filter,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Expert {
  rank: number;
  userId: string;
  name: string;
  profilePhotoUrl: string | null;
  currentPosition: string | null;
  experienceLevel: string | null;
  stats: {
    totalAnswers: number;
    acceptedAnswers: number;
    acceptanceRate: number;
    avgAqs: number;
    totalAqs: number;
    starCount: number;
    proCount: number;
    usefulCount: number;
    helpfulCount: number;
  };
  score: number;
}

interface Category {
  code: string;
  name: string;
  icon: string;
}

const RANK_ICONS = [
  { icon: Trophy, color: "text-amber-500", bg: "bg-amber-100" },
  { icon: Medal, color: "text-slate-400", bg: "bg-slate-100" },
  { icon: Award, color: "text-amber-700", bg: "bg-amber-50" },
];

const EXPERIENCE_LABELS: Record<string, string> = {
  junior: "تازه‌کار",
  mid: "میانی",
  senior: "ارشد",
  expert: "متخصص",
};

export default function LeaderboardPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<"all" | "month" | "week">("all");
  const [category, setCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, [period, category]);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      let url = `/api/qa/leaderboard?period=${period}&limit=20`;
      if (category) {
        url += `&category=${category}`;
      }
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setExperts(data.experts || []);
        if (data.categories && categories.length === 0) {
          setCategories(data.categories);
        }
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankDisplay = (rank: number) => {
    if (rank <= 3) {
      const config = RANK_ICONS[rank - 1];
      const Icon = config.icon;
      return (
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", config.bg)}>
          <Icon className={cn("w-5 h-5", config.color)} />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
        <span className="text-sm font-bold text-slate-600">{rank}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 -m-6 md:-m-8 p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/qa">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              لیدربورد متخصصین
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              برترین پاسخ‌دهندگان بر اساس کیفیت پاسخ‌ها
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Period Filter */}
            <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">همه زمان‌ها</TabsTrigger>
                <TabsTrigger value="month">این ماه</TabsTrigger>
                <TabsTrigger value="week">این هفته</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select
                  value={category || "all"}
                  onValueChange={(v) => setCategory(v === "all" ? null : v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="فیلتر بر اساس دسته‌بندی" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه دسته‌بندی‌ها</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.code} value={cat.code}>
                        {cat.icon && <span className="ml-2">{cat.icon}</span>}
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Active Filters Badge */}
            {category && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  {categories.find((c) => c.code === category)?.icon}
                  {categories.find((c) => c.code === category)?.name}
                  <button
                    onClick={() => setCategory(null)}
                    className="mr-1 hover:text-primary"
                  >
                    ×
                  </button>
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : experts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-600 mb-1">
                هنوز متخصصی در این بازه زمانی نیست
              </h3>
              <p className="text-sm text-muted-foreground">
                اولین نفری باشید که پاسخ می‌دهد!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Top 3 Podium */}
            {experts.length >= 3 && (
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-6">
                  <div className="flex justify-center items-end gap-4">
                    {/* 2nd Place */}
                    <div className="flex flex-col items-center">
                      <Avatar className="w-16 h-16 border-4 border-slate-300">
                        <AvatarImage src={experts[1]?.profilePhotoUrl || ""} />
                        <AvatarFallback className="bg-slate-200 text-slate-600">
                          {experts[1]?.name?.charAt(0) || "؟"}
                        </AvatarFallback>
                      </Avatar>
                      <Medal className="w-6 h-6 text-slate-400 -mt-2" />
                      <p className="text-sm font-medium mt-2 text-center">{experts[1]?.name}</p>
                      <p className="text-xs text-muted-foreground">{experts[1]?.stats.avgAqs} AQS</p>
                    </div>

                    {/* 1st Place */}
                    <div className="flex flex-col items-center -mt-4">
                      <Avatar className="w-20 h-20 border-4 border-amber-400 ring-4 ring-amber-200">
                        <AvatarImage src={experts[0]?.profilePhotoUrl || ""} />
                        <AvatarFallback className="bg-amber-100 text-amber-700">
                          {experts[0]?.name?.charAt(0) || "؟"}
                        </AvatarFallback>
                      </Avatar>
                      <Trophy className="w-8 h-8 text-amber-500 -mt-3" />
                      <p className="text-base font-bold mt-2 text-center">{experts[0]?.name}</p>
                      <p className="text-sm text-amber-700 font-medium">{experts[0]?.stats.avgAqs} AQS</p>
                    </div>

                    {/* 3rd Place */}
                    <div className="flex flex-col items-center">
                      <Avatar className="w-16 h-16 border-4 border-amber-600">
                        <AvatarImage src={experts[2]?.profilePhotoUrl || ""} />
                        <AvatarFallback className="bg-amber-50 text-amber-700">
                          {experts[2]?.name?.charAt(0) || "؟"}
                        </AvatarFallback>
                      </Avatar>
                      <Award className="w-6 h-6 text-amber-700 -mt-2" />
                      <p className="text-sm font-medium mt-2 text-center">{experts[2]?.name}</p>
                      <p className="text-xs text-muted-foreground">{experts[2]?.stats.avgAqs} AQS</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Full List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  رتبه‌بندی کامل
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {experts.map((expert) => (
                    <div
                      key={expert.userId}
                      className={cn(
                        "flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors",
                        expert.rank <= 3 && "bg-amber-50/50"
                      )}
                    >
                      {/* Rank */}
                      {getRankDisplay(expert.rank)}

                      {/* Avatar & Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={expert.profilePhotoUrl || ""} />
                          <AvatarFallback>{expert.name?.charAt(0) || "؟"}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{expert.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {expert.currentPosition && (
                              <span className="truncate">{expert.currentPosition}</span>
                            )}
                            {expert.experienceLevel && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0">
                                {EXPERIENCE_LABELS[expert.experienceLevel] || expert.experienceLevel}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm">
                        {/* Quality Badges */}
                        <div className="hidden sm:flex items-center gap-1">
                          {expert.stats.starCount > 0 && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 px-1.5">
                              <Star className="w-3 h-3" />
                              {expert.stats.starCount}
                            </Badge>
                          )}
                          {expert.stats.proCount > 0 && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 gap-1 px-1.5">
                              <Sparkles className="w-3 h-3" />
                              {expert.stats.proCount}
                            </Badge>
                          )}
                          {expert.stats.usefulCount > 0 && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 px-1.5">
                              <ThumbsUp className="w-3 h-3" />
                              {expert.stats.usefulCount}
                            </Badge>
                          )}
                        </div>

                        {/* Answer Stats */}
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <div className="flex items-center gap-1" title="تعداد پاسخ">
                            <MessageSquare className="w-4 h-4" />
                            <span>{expert.stats.totalAnswers}</span>
                          </div>
                          <div className="flex items-center gap-1" title="پاسخ‌های منتخب">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span>{expert.stats.acceptedAnswers}</span>
                          </div>
                          {expert.stats.helpfulCount > 0 && (
                            <div className="flex items-center gap-1" title="مفید بوده">
                              <Heart className="w-4 h-4 text-rose-500" />
                              <span>{expert.stats.helpfulCount}</span>
                            </div>
                          )}
                        </div>

                        {/* AQS Score */}
                        <div className="w-16 text-center">
                          <div className="text-lg font-bold text-primary">{expert.stats.avgAqs}</div>
                          <div className="text-xs text-muted-foreground">AQS</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Score Explanation */}
            <Card className="bg-slate-50">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium mb-2">نحوه امتیازدهی</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• <strong>AQS</strong>: میانگین امتیاز کیفیت پاسخ‌ها (0-100)</li>
                  <li>• <Star className="w-3 h-3 inline text-amber-500" /> منتخب: پاسخ‌هایی با AQS بالای 85</li>
                  <li>• <Sparkles className="w-3 h-3 inline text-purple-500" /> حرفه‌ای: پاسخ‌هایی با AQS بین 70-84</li>
                  <li>• <ThumbsUp className="w-3 h-3 inline text-blue-500" /> مفید: پاسخ‌هایی با AQS بین 40-69</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
