"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Award, ThumbsUp, ExternalLink } from "lucide-react";
import Link from "next/link";

interface FeaturedAnswer {
  answerId: string;
  questionId: string;
  questionTitle: string;
  helpfulCount: number;
  expertBadgeCount: number;
}

interface ProfileQASectionProps {
  userId: string;
  data: {
    totalAnswers: number;
    expertAnswers: number;
    topCategory: string | null;
    helpfulReactions: number;
    expertReactions: number;
    featuredAnswers: FeaturedAnswer[];
  };
}

const categoryLabels: Record<string, string> = {
  accounting: "حسابداری",
  finance: "مالی",
  tax: "مالیات",
  insurance: "بیمه",
  investment: "سرمایه‌گذاری",
};

export default function ProfileQASection({ userId, data }: ProfileQASectionProps) {
  const { totalAnswers, expertAnswers, topCategory, featuredAnswers } = data;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          مشارکت حرفه‌ای
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Empty State */}
        {totalAnswers === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            این کاربر هنوز مشارکت تخصصی نداشته است.
          </p>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium">
                {totalAnswers} پاسخ تخصصی
              </span>
              {topCategory && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    حوزه غالب: {categoryLabels[topCategory] || topCategory}
                  </span>
                </>
              )}
            </div>

            {/* Expert Badge */}
            {expertAnswers > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <Award className="w-3 h-3 ml-1" />
                  {expertAnswers} پاسخ متخصصانه
                </Badge>
              </div>
            )}

            {/* Featured Answers */}
            {featuredAnswers.length > 0 && (
              <div className="space-y-3 pt-2 border-t">
                <p className="text-xs font-medium text-muted-foreground">
                  پاسخ‌های برگزیده
                </p>
                {featuredAnswers.map((answer) => (
                  <Link
                    key={answer.answerId}
                    href={`/app/qa/${answer.questionId}`}
                    className="block group"
                  >
                    <div className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors space-y-2">
                      {/* Question Title */}
                      <p className="text-sm leading-relaxed line-clamp-2 group-hover:text-primary transition-colors">
                        {answer.questionTitle}
                      </p>
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {answer.expertBadgeCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                            <Award className="w-3 h-3" />
                            پاسخ متخصصانه
                          </span>
                        )}
                        {answer.helpfulCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            <ThumbsUp className="w-3 h-3" />
                            {answer.helpfulCount} رأی مفید
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* CTA - View All */}
            {totalAnswers > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                asChild
              >
                <Link href={`/app/qa?user=${userId}`}>
                  مشاهده همه پاسخ‌ها ({totalAnswers})
                  <ExternalLink className="w-3.5 h-3.5 mr-2" />
                </Link>
              </Button>
            )}
          </>
        )}

        {/* Footer Note */}
        <p className="text-[10px] text-muted-foreground text-center pt-2 border-t">
          این پاسخ‌ها نشان‌دهنده مشارکت تخصصی این فرد در انجمن کاربرگ است.
        </p>
      </CardContent>
    </Card>
  );
}
