"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquarePlus,
  Loader2,
  AlertCircle,
  Search,
  Users,
  MessageCircle,
  CheckCircle2,
  Flame,
  Sparkles,
  TrendingUp,
  Crown,
  Trophy,
  Bookmark,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import QuestionCard from "@/components/qa/QuestionCard";
import CategoryFilter from "@/components/qa/CategoryFilter";

interface Question {
  id: string;
  title: string;
  body: string;
  category: string;
  tags: string[];
  answersCount: number;
  createdAt: string;
  author: {
    fullName: string;
  };
}

interface Stats {
  totalQuestions: number;
  totalAnswers: number;
  verifiedAnswers: number;
  activeExperts: number;
  hotToday: number;
}

interface UnansweredQuestion {
  id: string;
  title: string;
  category: string;
  createdAt: string;
}

interface TrendingQuestion {
  id: string;
  title: string;
  category: string;
  answersCount: number;
  viewsCount: number;
  trendingScore: number;
  createdAt: string;
}

interface TopExpert {
  id: string;
  fullName: string;
  answersToday: number;
  expertLevel: string;
  topCategory: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  accounting: "حسابداری",
  finance: "مالی",
  tax: "مالیات",
  insurance: "بیمه",
  investment: "بورس",
  audit: "حسابرسی",
  budgeting: "بودجه",
  cost: "بهای تمام‌شده",
};

const EXPERT_LEVEL_LABELS: Record<string, string> = {
  newcomer: "تازه‌وارد",
  contributor: "مشارکت‌کننده",
  specialist: "متخصص",
  senior: "متخصص ارشد",
  expert: "خبره",
  top_expert: "خبره برتر",
};

interface Category {
  value: string;
  label: string;
  icon?: string | null;
}

export default function QAListPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [myExpertiseOnly, setMyExpertiseOnly] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Stats state
  const [stats, setStats] = useState<Stats | null>(null);
  const [unansweredQuestions, setUnansweredQuestions] = useState<UnansweredQuestion[]>([]);
  const [trendingQuestions, setTrendingQuestions] = useState<TrendingQuestion[]>([]);
  const [topExperts, setTopExperts] = useState<TopExpert[]>([]);

  useEffect(() => {
    loadStats();
    checkSession();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, myExpertiseOnly, debouncedSearch]);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setIsLoggedIn(!!data?.user);
    } catch {
      setIsLoggedIn(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch("/api/qa/stats");
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
        setUnansweredQuestions(data.unansweredQuestions || []);
        setTrendingQuestions(data.trendingQuestions || []);
        setTopExperts(data.topExperts || []);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const loadQuestions = async (loadMore = false) => {
    try {
      if (!loadMore) {
        setIsLoading(true);
        setPage(1);
      }

      const currentPage = loadMore ? page + 1 : 1;
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (selectedCategory) {
        params.set("category", selectedCategory);
      }

      if (myExpertiseOnly) {
        params.set("myExpertise", "true");
      }

      if (debouncedSearch && debouncedSearch.length >= 2) {
        params.set("q", debouncedSearch);
      }

      const response = await fetch(`/api/qa/questions?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در دریافت سؤالات");
      }

      if (loadMore) {
        setQuestions((prev) => [...prev, ...data.questions]);
        setPage(currentPage);
      } else {
        setQuestions(data.questions);
      }

      // Update categories from API
      if (data.categories) {
        setCategories(data.categories);
      }

      setHasMore(data.pagination.totalPages > currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت سؤالات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 -m-6 md:-m-8 p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageCircle className="w-7 h-7 text-primary" />
              پرسش و پاسخ تخصصی
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              دانش‌تان را به اعتبار حرفه‌ای تبدیل کنید
            </p>
            <p className="text-xs text-muted-foreground/80 mt-0.5">
              سؤال بپرسید، پاسخ تخصصی بدهید و جایگاه حرفه‌ای خود را تقویت کنید
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <Button asChild size="icon" variant="outline" title="برترین‌ها">
                <Link href="/app/qa/leaderboard" aria-label="برترین‌ها">
                  <Trophy className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="icon" variant="outline" title="ذخیره‌شده‌ها">
                <Link href="/app/bookmarks" aria-label="ذخیره‌شده‌ها">
                  <Bookmark className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" title="پرسیدن سؤال تخصصی">
                <Link href="/app/qa/ask" aria-label="پرسیدن سؤال تخصصی">
                  <Plus className="w-5 h-5" />
                </Link>
              </Button>
            </div>
            <span className="text-[10px] text-muted-foreground">
              سؤال باکیفیت = دیده‌شدن بیشتر
            </span>
          </div>
        </div>

        {/* Compact Stats Bar - Less visual weight, more focused */}
        {stats && (
          <Card className="border-slate-200 bg-white/80">
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Unanswered - Most important, highlighted */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-lg border border-orange-200">
                  <Flame className="w-4 h-4 text-orange-600" />
                  <span className="text-lg font-bold text-orange-700">{stats.totalQuestions - stats.verifiedAnswers}</span>
                  <span className="text-xs text-orange-600 font-medium">سؤال منتظر پاسخ اول</span>
                </div>
                {/* Other stats - compact inline */}
                <div className="flex items-center gap-4 md:gap-6 text-sm">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="font-medium">{stats.verifiedAnswers}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">پاسخ‌داده‌شده</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{stats.totalQuestions}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">سؤال</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">{stats.activeExperts}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">متخصص فعال</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Unanswered questions - compact horizontal strip */}
        {unansweredQuestions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <Flame className="w-4 h-4 text-orange-600" />
              <h2 className="text-sm font-bold text-orange-800">سؤال‌های منتظر پاسخ اول</h2>
              <span className="text-[10px] text-muted-foreground">اولین پاسخ = بیشترین دیده‌شدن</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
              {unansweredQuestions.map((q) => (
                <Link
                  key={q.id}
                  href={`/app/qa/${q.id}`}
                  className="shrink-0 w-64 snap-start block p-3 bg-white rounded-lg border border-orange-200 hover:border-orange-400 hover:shadow-sm transition-all group"
                >
                  <p className="text-sm font-semibold line-clamp-2 group-hover:text-orange-700">{q.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-[10px] bg-orange-50 border-orange-200">
                      {CATEGORY_LABELS[q.category] || q.category}
                    </Badge>
                    <span className="text-[10px] text-orange-600 font-medium">پاسخ بده</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Trending - compact horizontal strip */}
        {trendingQuestions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <TrendingUp className="w-4 h-4 text-rose-600" />
              <h2 className="text-sm font-bold text-rose-800">سؤال‌های داغ این هفته</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
              {trendingQuestions.slice(0, 6).map((q, index) => (
                <Link
                  key={q.id}
                  href={`/app/qa/${q.id}`}
                  className="shrink-0 w-64 snap-start block p-3 bg-white rounded-lg border border-rose-200 hover:border-rose-400 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
                      #{index + 1}
                    </span>
                    <p className="text-sm font-medium line-clamp-2 group-hover:text-rose-700 flex-1">
                      {q.title}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                    <Badge variant="outline" className="text-[10px] bg-rose-50 border-rose-200">
                      {CATEGORY_LABELS[q.category] || q.category}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-0.5">
                        <MessageCircle className="w-3 h-3" />
                        {q.answersCount}
                      </span>
                      {q.viewsCount > 0 && (
                        <span className="flex items-center gap-0.5 text-rose-500">
                          <Flame className="w-3 h-3" />
                          {q.viewsCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search + Category filter — merged */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="جستجو در سؤالات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 text-right"
                dir="rtl"
              />
            </div>
            {debouncedSearch && debouncedSearch.length >= 2 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  نتایج برای: <span className="font-medium text-primary">{debouncedSearch}</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="h-7 text-xs"
                >
                  پاک کردن
                </Button>
              </div>
            )}
            <CategoryFilter
              selected={selectedCategory}
              onSelect={handleCategoryChange}
              categories={categories}
              showMyExpertiseFilter={isLoggedIn}
              myExpertiseOnly={myExpertiseOnly}
              onMyExpertiseChange={setMyExpertiseOnly}
            />
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">در حال بارگذاری سؤالات...</p>
                </div>
              </div>
            ) : error ? (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                  <p className="text-red-700">{error}</p>
                  <Button
                    variant="outline"
                    onClick={() => loadQuestions()}
                    className="mt-4"
                  >
                    تلاش مجدد
                  </Button>
                </CardContent>
              </Card>
            ) : questions.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {selectedCategory
                      ? "هنوز سؤالی در این حوزه ثبت نشده"
                      : "هنوز سؤالی نیست"}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {selectedCategory
                      ? "اولین سؤال را شما بپرسید"
                      : "اولین سؤال تخصصی را بپرسید!"}
                  </p>
                  <Button asChild>
                    <Link href="/app/qa/ask">
                      <MessageSquarePlus className="w-4 h-4 ml-2" />
                      ثبت اولین سؤال تخصصی
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))}

                {/* Load More */}
                {hasMore && (
                  <div className="text-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => loadQuestions(true)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          در حال بارگذاری...
                        </>
                      ) : (
                        "سؤالات بیشتر"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
        </div>

        {/* Top Experts — compact horizontal list */}
        {topExperts.length > 0 && (
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-semibold">متخصصان فعال امروز</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {topExperts.map((expert, index) => (
                  <div
                    key={expert.id}
                    className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200"
                  >
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-xs font-medium leading-tight">{expert.fullName}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        {EXPERT_LEVEL_LABELS[expert.expertLevel] || expert.expertLevel}
                        {" · "}
                        {expert.answersToday} پاسخ امروز
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
