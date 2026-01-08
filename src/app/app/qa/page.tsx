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
  Clock,
  Sparkles,
  TrendingUp,
  Crown,
  Trophy,
} from "lucide-react";
import Link from "next/link";
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

  // Stats state
  const [stats, setStats] = useState<Stats | null>(null);
  const [unansweredQuestions, setUnansweredQuestions] = useState<UnansweredQuestion[]>([]);
  const [topExperts, setTopExperts] = useState<TopExpert[]>([]);

  useEffect(() => {
    loadStats();
    loadQuestions();
    checkSession();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [selectedCategory, myExpertiseOnly]);

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
              سؤالات حرفه‌ای بپرسید، پاسخ متخصصانه بدهید، پروفایل‌تان را تقویت کنید
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/app/qa/ask">
              <MessageSquarePlus className="w-4 h-4 ml-2" />
              پرسیدن سؤال تخصصی
            </Link>
          </Button>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-blue-700">{stats.activeExperts}</p>
                <p className="text-xs text-blue-600">متخصص فعال</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
              <CardContent className="p-4 text-center">
                <MessageCircle className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-purple-700">{stats.totalQuestions}</p>
                <p className="text-xs text-purple-600">سؤال پرسیده شده</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-700">{stats.verifiedAnswers}</p>
                <p className="text-xs text-green-600">پاسخ تأییدشده</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-amber-700">{stats.totalAnswers}</p>
                <p className="text-xs text-amber-600">پاسخ ثبت‌شده</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200 col-span-2 md:col-span-1">
              <CardContent className="p-4 text-center">
                <Flame className="w-5 h-5 text-red-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-red-700">{stats.hotToday}</p>
                <p className="text-xs text-red-600">سؤال داغ امروز</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-4">
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
                  <h3 className="font-semibold text-lg mb-2">هنوز سؤالی نیست</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {selectedCategory
                      ? "در این دسته‌بندی سؤالی وجود ندارد"
                      : "اولین سؤال تخصصی را بپرسید!"}
                  </p>
                  <Button asChild>
                    <Link href="/app/qa/ask">
                      <MessageSquarePlus className="w-4 h-4 ml-2" />
                      پرسیدن سؤال
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
            {/* Urgent - Unanswered Questions */}
            {unansweredQuestions.length > 0 && (
              <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-amber-800">
                    <Clock className="w-4 h-4" />
                    سؤال‌های بدون پاسخ
                    <Badge variant="secondary" className="bg-amber-200 text-amber-800 text-xs">
                      فوری
                    </Badge>
                  </CardTitle>
                  <p className="text-xs text-amber-600">
                    اولین نفری باش که پاسخ می‌ده!
                  </p>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {unansweredQuestions.map((q) => (
                    <Link
                      key={q.id}
                      href={`/app/qa/${q.id}`}
                      className="block p-3 bg-white rounded-lg border border-amber-100 hover:border-amber-300 transition-colors"
                    >
                      <p className="text-sm font-medium line-clamp-2">{q.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {CATEGORY_LABELS[q.category] || q.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(q.createdAt).toLocaleDateString("fa-IR")}
                        </span>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Leaderboard CTA */}
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-800">لیدربورد متخصصین</h3>
                    <p className="text-xs text-amber-600">رتبه‌بندی بر اساس کیفیت پاسخ‌ها</p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="w-full border-amber-300 hover:bg-amber-100">
                  <Link href="/app/qa/leaderboard">
                    <Trophy className="w-4 h-4 ml-2" />
                    مشاهده لیدربورد
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
                </CardContent>
              </Card>
            )}

            {/* Incentive Card */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
              <CardContent className="p-4 text-center">
                <Sparkles className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <h3 className="font-semibold text-indigo-800 mb-1">
                  پاسخ بده، دیده شو!
                </h3>
                <p className="text-xs text-indigo-600 mb-3">
                  هر پاسخ تأییدشده، پروفایل شما را قوی‌تر می‌کند
                </p>
                <div className="flex items-center justify-center gap-1 text-xs text-indigo-700">
                  <TrendingUp className="w-3 h-3" />
                  <span>+۴٪ قدرت پروفایل با هر پاسخ متخصصانه</span>
                </div>
              </CardContent>
            </Card>

            {/* Bottom CTA */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold mb-2">سؤال تخصصی دارید؟</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  از متخصصان مالی و حسابداری کمک بگیرید
                </p>
                <Button asChild variant="default" size="sm" className="w-full">
                  <Link href="/app/qa/ask">
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
