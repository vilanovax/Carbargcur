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
      <div className="max-w-5xl mx-auto space-y-6">
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
            <Button asChild size="lg">
              <Link href="/app/qa/ask">
                <MessageSquarePlus className="w-4 h-4 ml-2" />
                پرسیدن سؤال تخصصی
              </Link>
            </Button>
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
                  <span className="text-xs text-orange-600 font-medium">سؤال فوری – فرصت دیده‌شدن</span>
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

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-4">
            {/* Search Box */}
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="جستجو در سؤالات... (حداقل ۲ کاراکتر)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 text-right"
                    dir="rtl"
                  />
                </div>
                {debouncedSearch && debouncedSearch.length >= 2 && (
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className="text-muted-foreground">
                      نتایج جستجو برای: <span className="font-medium text-primary">{debouncedSearch}</span>
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
              </CardContent>
            </Card>

            {/* Category Filter */}
            <Card>
              <CardContent className="p-4">
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

          {/* Sidebar */}
          <div className="space-y-4">
            {/* TIER 1: Urgent - Unanswered Questions - Most important widget */}
            {unansweredQuestions.length > 0 && (
              <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-orange-800">
                    <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center">
                      <Flame className="w-4 h-4 text-orange-600" />
                    </div>
                    سؤال‌های فوری بدون پاسخ
                  </CardTitle>
                  <p className="text-sm text-orange-700 font-bold">
                    اولین پاسخ = بیشترین دیده‌شدن
                  </p>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {unansweredQuestions.map((q, index) => (
                    <Link
                      key={q.id}
                      href={`/app/qa/${q.id}`}
                      className="block p-3 bg-white rounded-lg border-2 border-orange-100 hover:border-orange-400 hover:shadow-md transition-all group"
                    >
                      <p className="text-sm font-semibold line-clamp-2 group-hover:text-orange-700">{q.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs bg-orange-50 border-orange-200">
                          {CATEGORY_LABELS[q.category] || q.category}
                        </Badge>
                        <Button
                          size="sm"
                          className="h-6 text-[10px] bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          پاسخ بده
                        </Button>
                      </div>
                      {/* Rotating microcopy hints */}
                      <p className="text-[10px] text-orange-600 mt-2 font-medium">
                        {index === 0 && "🏅 اولین پاسخ = افزایش اعتبار تخصصی"}
                        {index === 1 && "👀 نمایش ویژه در پروفایل شما"}
                        {index === 2 && "⏱ پاسخ سریع، اثر بیشتر"}
                        {index > 2 && "🏅 فرصت خوب برای دیده‌شدن"}
                      </p>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* TIER 1.5: Trending Questions */}
            {trendingQuestions.length > 0 && (
              <Card className="border-2 border-rose-200 bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-rose-800">
                    <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-rose-600" />
                    </div>
                    سؤال‌های داغ این هفته
                  </CardTitle>
                  <p className="text-xs text-rose-600">
                    پربازدیدترین سؤالات اخیر
                  </p>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {trendingQuestions.slice(0, 4).map((q, index) => (
                    <Link
                      key={q.id}
                      href={`/app/qa/${q.id}`}
                      className="block p-3 bg-white rounded-lg border border-rose-100 hover:border-rose-300 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-bold text-rose-500 bg-rose-100 px-1.5 py-0.5 rounded">
                          #{index + 1}
                        </span>
                        <p className="text-sm font-medium line-clamp-2 group-hover:text-rose-700 flex-1">
                          {q.title}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
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
                </CardContent>
              </Card>
            )}

            {/* TIER 2: Leaderboard CTA - Motivational */}
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-800">لیدربورد متخصصین</h3>
                    <p className="text-xs text-amber-600">رتبه‌بندی بر اساس کیفیت پاسخ‌ها</p>
                  </div>
                </div>
                {/* Personal progress hint */}
                <div className="p-2 bg-amber-100/50 rounded-lg mb-3 border border-amber-200">
                  <p className="text-xs text-amber-700 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    با ۱ پاسخ دیگر وارد این لیست می‌شوید
                  </p>
                </div>
                <Button asChild size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                  <Link href="/app/qa/leaderboard">
                    <Trophy className="w-4 h-4 ml-2" />
                    ارتقای جایگاه
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Top Experts Today */}
            {topExperts.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    متخصصان فعال امروز
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground">
                    این افراد امروز با پاسخ‌های تخصصی دیده شده‌اند
                  </p>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {topExperts.map((expert, index) => (
                    <div
                      key={expert.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{expert.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {EXPERT_LEVEL_LABELS[expert.expertLevel] || expert.expertLevel}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {expert.answersToday} پاسخ
                      </Badge>
                    </div>
                  ))}
                  <p className="text-[10px] text-center text-muted-foreground pt-2">
                    شما هم می‌توانید در این لیست باشید
                  </p>
                </CardContent>
              </Card>
            )}

            {/* TIER 3: Bottom CTA - For asking questions */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                  <div>
                    <h3 className="font-semibold text-indigo-800">سؤال تخصصی دارید؟</h3>
                    <p className="text-xs text-indigo-600">از متخصصان مالی و حسابداری کمک بگیرید</p>
                  </div>
                </div>
                <Button asChild variant="default" size="sm" className="w-full">
                  <Link href="/app/qa/ask">
                    <MessageSquarePlus className="w-4 h-4 ml-2" />
                    پرسیدن سؤال
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
