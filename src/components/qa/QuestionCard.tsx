"use client";

import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, User, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface QuestionCardProps {
  question: {
    id: string;
    title: string;
    body: string;
    category: string;
    tags?: string[];
    answersCount: number;
    createdAt: string;
    author?: {
      fullName: string;
    };
    hasVerifiedAnswer?: boolean;
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
  budgeting: "bg-pink-100 text-pink-800 border-pink-200",
  cost: "bg-amber-100 text-amber-800 border-amber-200",
};

const categoryIcons: Record<string, string> = {
  accounting: "📊",
  finance: "💰",
  tax: "🏛️",
  insurance: "🛡️",
  investment: "📈",
  audit: "🔍",
  budgeting: "📋",
  cost: "⚙️",
};

export default function QuestionCard({ question }: QuestionCardProps) {
  const timeAgo = formatDistanceToNow(new Date(question.createdAt), {
    addSuffix: true,
    locale: faIR,
  });

  // Truncate body if too long
  const truncatedBody =
    question.body.length > 150
      ? question.body.substring(0, 150) + "..."
      : question.body;

  // Determine answer status
  const getAnswerBadge = () => {
    if (question.answersCount === 0) {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1">
          <AlertCircle className="w-3 h-3" />
          بدون پاسخ
        </Badge>
      );
    }
    if (question.hasVerifiedAnswer) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 gap-1">
          <CheckCircle2 className="w-3 h-3" />
          پاسخ تأیید شده
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1">
        <MessageCircle className="w-3 h-3" />
        {question.answersCount} پاسخ
      </Badge>
    );
  };

  return (
    <Link href={`/app/qa/${question.id}`}>
      <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
        <CardContent className="p-4 space-y-3">
          {/* Header: Category, Answer Status & Time */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`${categoryColors[question.category] || ""} gap-1`}
              >
                <span>{categoryIcons[question.category] || "📁"}</span>
                {categoryLabels[question.category] || question.category}
              </Badge>
              {getAnswerBadge()}
            </div>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-base leading-relaxed line-clamp-2 group-hover:text-primary transition-colors">
            {question.title}
          </h3>

          {/* Body Preview */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {truncatedBody}
          </p>

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {question.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded"
                >
                  {tag}
                </span>
              ))}
              {question.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{question.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer: Author & CTA */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="w-3.5 h-3.5" />
              <span>{question.author?.fullName || "کاربر"}</span>
            </div>

            {/* CTA for unanswered */}
            {question.answersCount === 0 && (
              <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                <Sparkles className="w-3 h-3" />
                <span>اولین پاسخ‌دهنده باش!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
