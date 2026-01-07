"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  User,
  MessageCircle,
  Clock,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";
import AnswerItem from "@/components/qa/AnswerItem";
import AnswerForm from "@/components/qa/AnswerForm";
import { toast } from "sonner";

interface Question {
  id: string;
  title: string;
  body: string;
  category: string;
  tags: string[];
  answersCount: number;
  createdAt: string;
  author: {
    id: string;
    fullName: string;
  };
}

interface Answer {
  id: string;
  body: string;
  helpfulCount: number;
  expertBadgeCount: number;
  isAccepted?: boolean;
  acceptedAt?: string;
  createdAt: string;
  aqs?: number;
  qualityLabel?: "NORMAL" | "USEFUL" | "PRO" | "STAR";
  userReaction?: "helpful" | "not_helpful" | null;
  author: {
    id: string;
    fullName: string;
  };
}

const categoryLabels: Record<string, string> = {
  accounting: "حسابداری",
  finance: "مالی",
  tax: "مالیات",
  insurance: "بیمه",
  investment: "سرمایه‌گذاری",
  audit: "حسابرسی",
  budgeting: "بودجه",
  cost: "بهای تمام‌شده",
};

const categoryColors: Record<string, string> = {
  accounting: "bg-blue-100 text-blue-800 border-blue-200",
  finance: "bg-green-100 text-green-800 border-green-200",
  tax: "bg-orange-100 text-orange-800 border-orange-200",
  insurance: "bg-purple-100 text-purple-800 border-purple-200",
  investment: "bg-emerald-100 text-emerald-800 border-emerald-200",
  audit: "bg-cyan-100 text-cyan-800 border-cyan-200",
  budgeting: "bg-indigo-100 text-indigo-800 border-indigo-200",
  cost: "bg-rose-100 text-rose-800 border-rose-200",
};

export default function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: questionId } = use(params);
  const { data: session } = useSession();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isAsker, setIsAsker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuestion();
  }, [questionId]);

  const loadQuestion = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/qa/questions/${questionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در دریافت سؤال");
      }

      setQuestion(data.question);
      setAnswers(data.answers);
      setIsAsker(data.isAsker || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت سؤال");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async (body: string) => {
    const response = await fetch(`/api/qa/questions/${questionId}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "خطا در ارسال پاسخ");
    }

    // Reload to get updated answers with quality metrics
    await loadQuestion();
    toast.success("پاسخ شما ثبت شد");
  };

  const handleReact = async (answerId: string, type: "helpful" | "not_helpful") => {
    try {
      const response = await fetch(`/api/qa/answers/${answerId}/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در ثبت واکنش");
      }

      // Update local state
      setAnswers((prev) =>
        prev.map((a) => {
          if (a.id === answerId) {
            const wasHelpful = a.userReaction === "helpful";
            const newReaction = data.action === "removed" ? null : type;
            return {
              ...a,
              userReaction: newReaction,
              helpfulCount:
                type === "helpful"
                  ? data.action === "removed"
                    ? a.helpfulCount - 1
                    : wasHelpful
                      ? a.helpfulCount
                      : a.helpfulCount + 1
                  : wasHelpful
                    ? a.helpfulCount - 1
                    : a.helpfulCount,
            };
          }
          return a;
        })
      );

      toast.success(
        data.action === "added"
          ? "واکنش ثبت شد"
          : data.action === "changed"
            ? "واکنش تغییر کرد"
            : "واکنش حذف شد"
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در ثبت واکنش");
      throw err;
    }
  };

  const handleAccept = async (answerId: string) => {
    try {
      const response = await fetch(`/api/qa/questions/${questionId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در انتخاب پاسخ");
      }

      // Update local state - set accepted answer and unaccept others
      setAnswers((prev) =>
        prev.map((a) => ({
          ...a,
          isAccepted: a.id === answerId,
          acceptedAt: a.id === answerId ? new Date().toISOString() : undefined,
        }))
      );

      toast.success("پاسخ به عنوان بهترین پاسخ انتخاب شد");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در انتخاب پاسخ");
      throw err;
    }
  };

  const handleFlag = async (answerId: string, reason: string) => {
    try {
      const response = await fetch(`/api/qa/answers/${answerId}/flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در ثبت گزارش");
      }

      toast.success("گزارش شما ثبت شد");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در ثبت گزارش");
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 -m-6 md:-m-8 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">در حال بارگذاری...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-slate-50/50 -m-6 md:-m-8 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <p className="text-red-700">{error || "سؤال یافت نشد"}</p>
              <Button variant="outline" asChild className="mt-4">
                <Link href="/app/qa">بازگشت به لیست سؤالات</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(question.createdAt), {
    addSuffix: true,
    locale: faIR,
  });

  const isOwnQuestion = session?.user?.id === question.author.id;

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
            <Badge
              variant="outline"
              className={categoryColors[question.category] || ""}
            >
              {categoryLabels[question.category] || question.category}
            </Badge>
          </div>
        </div>

        {/* Question Card */}
        <Card>
          <CardContent className="p-6 space-y-4">
            {/* Title */}
            <h1 className="text-xl font-bold leading-relaxed">
              {question.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>{question.author.fullName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{timeAgo}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" />
                <span>{answers.length} پاسخ</span>
              </div>
            </div>

            {/* Body */}
            <div className="prose prose-sm max-w-none pt-4 border-t">
              <p className="whitespace-pre-wrap leading-relaxed">
                {question.body}
              </p>
            </div>

            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Answers Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            پاسخ‌ها ({answers.length})
          </h2>

          {answers.length === 0 ? (
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-amber-800 mb-1">
                  این سؤال منتظر پاسخ تخصصی شماست!
                </h3>
                <p className="text-sm text-amber-600">
                  اولین متخصصی باشید که پاسخ می‌دهد
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {answers.map((answer) => (
                <AnswerItem
                  key={answer.id}
                  answer={answer}
                  userReaction={answer.userReaction}
                  isOwnAnswer={session?.user?.id === answer.author.id}
                  isAsker={isAsker}
                  onReact={handleReact}
                  onAccept={handleAccept}
                  onFlag={handleFlag}
                />
              ))}
            </div>
          )}
        </div>

        {/* Answer Form */}
        {session?.user ? (
          !isOwnQuestion ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">پاسخ خود را بنویسید</h3>
              </div>

              {/* Incentive Card */}
              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-indigo-800">
                      پاسخ‌های تخصصی شما در پروفایل عمومی نمایش داده می‌شود
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-indigo-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>هر پاسخ تأییدشده قدرت پروفایل شما را افزایش می‌دهد</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <AnswerForm questionId={questionId} onSubmit={handleSubmitAnswer} />
            </div>
          ) : (
            <Card className="bg-slate-50">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  نمی‌توانید به سؤال خودتان پاسخ دهید
                </p>
              </CardContent>
            </Card>
          )
        ) : (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-blue-700 mb-4">
                برای ثبت پاسخ باید وارد حساب کاربری خود شوید
              </p>
              <Button asChild>
                <Link href="/auth">ورود / ثبت‌نام</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
