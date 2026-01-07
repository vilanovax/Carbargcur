"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
  ThumbsUp,
  Flag,
  Star,
  Sparkles,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface DebugInfo {
  answer: {
    id: string;
    body: string;
    authorId: string;
    isAccepted: boolean;
    createdAt: string;
  };
  metrics: {
    contentScore: number;
    engagementScore: number;
    expertScore: number;
    trustScore: number;
    expertMultiplier: number;
    aqs: number;
    label: string;
    details: {
      lengthScore: number;
      structureScore: number;
      exampleBonus: number;
      stepsBonus: number;
      domainBonus: number;
      genericPenalty: number;
      askerHelpfulBonus: number;
      acceptedBonus: number;
      followupBonus: number;
      profileMultiplier: number;
      acceptanceRateBonus: number;
      flagPenalty: number;
      responseTimeBonus: number;
      editPenalty: number;
      rawSignals: {
        content: {
          charCount: number;
          wordCount: number;
          hasBullets: boolean;
          hasParagraphs: boolean;
          hasExample: boolean;
          hasSteps: boolean;
          domainKeywordDensity: number;
          hasDomainKeywords: boolean;
          isGeneric: boolean;
        };
        behavior: {
          askerHelpful: boolean;
          askerNotHelpful: boolean;
          totalHelpful: number;
          totalNotHelpful: number;
          isAccepted: boolean;
          totalFlags: number;
          followupCount: number;
        };
        expert: {
          profileStrength: number;
          authorAcceptanceRate: number;
          authorTotalAnswers: number;
          authorExpertLevel: string;
        };
        trust: {
          responseTimeMinutes: number;
          editCount: number;
          hasBeenEdited: boolean;
        };
      };
    };
    computedAt: string;
  } | null;
  reactions: Array<{ type: string; userId: string }>;
  flags: Array<{ reason: string; userId: string }>;
}

const LABEL_COLORS: Record<string, string> = {
  STAR: "bg-amber-100 text-amber-700 border-amber-200",
  PRO: "bg-purple-100 text-purple-700 border-purple-200",
  USEFUL: "bg-blue-100 text-blue-700 border-blue-200",
  NORMAL: "bg-gray-100 text-gray-700 border-gray-200",
};

const LABEL_ICONS: Record<string, typeof Star> = {
  STAR: Star,
  PRO: Sparkles,
  USEFUL: ThumbsUp,
  NORMAL: FileText,
};

export default function AnswerDebugPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: answerId } = use(params);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecomputing, setIsRecomputing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDebugInfo = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/qa/answers/${answerId}/debug`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در دریافت اطلاعات");
      }

      setDebugInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت اطلاعات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecompute = async () => {
    try {
      setIsRecomputing(true);
      const response = await fetch(`/api/admin/qa/answers/${answerId}/debug`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در محاسبه مجدد");
      }

      // Reload debug info
      await loadDebugInfo();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در محاسبه مجدد");
    } finally {
      setIsRecomputing(false);
    }
  };

  useEffect(() => {
    loadDebugInfo();
  }, [answerId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !debugInfo) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-700">{error || "پاسخ یافت نشد"}</p>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/admin/qa">بازگشت</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { answer, metrics, reactions, flags } = debugInfo;
  const LabelIcon = metrics ? LABEL_ICONS[metrics.label] || FileText : FileText;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/qa">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">دیباگ کیفیت پاسخ</h1>
            <p className="text-sm text-muted-foreground">ID: {answerId}</p>
          </div>
        </div>
        <Button onClick={handleRecompute} disabled={isRecomputing}>
          {isRecomputing ? (
            <Loader2 className="w-4 h-4 animate-spin ml-2" />
          ) : (
            <RefreshCw className="w-4 h-4 ml-2" />
          )}
          محاسبه مجدد
        </Button>
      </div>

      {/* Answer Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            متن پاسخ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm bg-slate-50 p-4 rounded-lg">
            {answer.body.substring(0, 500)}
            {answer.body.length > 500 && "..."}
          </p>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span>{answer.body.length} کاراکتر</span>
            {answer.isAccepted && (
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle2 className="w-3 h-3 ml-1" />
                پاسخ منتخب
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AQS Score */}
      {metrics ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">امتیاز کیفیت (AQS)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary">{metrics.aqs}</div>
                  <p className="text-sm text-muted-foreground">از 100</p>
                </div>
                <Badge className={`${LABEL_COLORS[metrics.label]} text-lg px-4 py-2`}>
                  <LabelIcon className="w-5 h-5 ml-2" />
                  {metrics.label}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 inline ml-1" />
                  آخرین محاسبه: {new Date(metrics.computedAt).toLocaleString("fa-IR")}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Components */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Content Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Content Score (40%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">{metrics.contentScore}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>طول متن</span>
                    <span className="font-mono">{metrics.details.lengthScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ساختار (bullets/paragraphs)</span>
                    <span className="font-mono">{metrics.details.structureScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>مثال</span>
                    <span className="font-mono">{metrics.details.exampleBonus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>گام‌ها</span>
                    <span className="font-mono">{metrics.details.stepsBonus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>کلمات کلیدی تخصصی</span>
                    <span className="font-mono">{metrics.details.domainBonus}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>جریمه عمومی</span>
                    <span className="font-mono">{metrics.details.genericPenalty}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Engagement Score (25%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">{metrics.engagementScore}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>سؤال‌کننده: مفید بود</span>
                    <span className="font-mono">{metrics.details.askerHelpfulBonus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>پاسخ منتخب</span>
                    <span className="font-mono">{metrics.details.acceptedBonus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>پیگیری</span>
                    <span className="font-mono">{metrics.details.followupBonus}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expert Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Expert Score (20%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">{metrics.expertScore}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>ضریب پروفایل</span>
                    <span className="font-mono">×{metrics.details.profileMultiplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>نرخ پذیرش</span>
                    <span className="font-mono">{metrics.details.acceptanceRateBonus}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>جریمه گزارش‌ها</span>
                    <span className="font-mono">{metrics.details.flagPenalty}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Trust Score (15%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">{metrics.trustScore}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>زمان پاسخ</span>
                    <span className="font-mono">{metrics.details.responseTimeBonus}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>جریمه ویرایش</span>
                    <span className="font-mono">{metrics.details.editPenalty}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Raw Signals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">سیگنال‌های خام</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Content Signals */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Content</h4>
                  <div className="bg-slate-50 p-3 rounded text-xs font-mono space-y-1">
                    <div>charCount: {metrics.details.rawSignals.content.charCount}</div>
                    <div>wordCount: {metrics.details.rawSignals.content.wordCount}</div>
                    <div>hasBullets: {String(metrics.details.rawSignals.content.hasBullets)}</div>
                    <div>hasParagraphs: {String(metrics.details.rawSignals.content.hasParagraphs)}</div>
                    <div>hasExample: {String(metrics.details.rawSignals.content.hasExample)}</div>
                    <div>hasSteps: {String(metrics.details.rawSignals.content.hasSteps)}</div>
                    <div>domainDensity: {metrics.details.rawSignals.content.domainKeywordDensity.toFixed(4)}</div>
                    <div>isGeneric: {String(metrics.details.rawSignals.content.isGeneric)}</div>
                  </div>
                </div>

                {/* Behavior Signals */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Behavior</h4>
                  <div className="bg-slate-50 p-3 rounded text-xs font-mono space-y-1">
                    <div>askerHelpful: {String(metrics.details.rawSignals.behavior.askerHelpful)}</div>
                    <div>askerNotHelpful: {String(metrics.details.rawSignals.behavior.askerNotHelpful)}</div>
                    <div>totalHelpful: {metrics.details.rawSignals.behavior.totalHelpful}</div>
                    <div>isAccepted: {String(metrics.details.rawSignals.behavior.isAccepted)}</div>
                    <div>totalFlags: {metrics.details.rawSignals.behavior.totalFlags}</div>
                  </div>
                </div>

                {/* Expert Signals */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Expert</h4>
                  <div className="bg-slate-50 p-3 rounded text-xs font-mono space-y-1">
                    <div>profileStrength: {metrics.details.rawSignals.expert.profileStrength}</div>
                    <div>acceptanceRate: {(metrics.details.rawSignals.expert.authorAcceptanceRate * 100).toFixed(1)}%</div>
                    <div>totalAnswers: {metrics.details.rawSignals.expert.authorTotalAnswers}</div>
                    <div>expertLevel: {metrics.details.rawSignals.expert.authorExpertLevel}</div>
                  </div>
                </div>

                {/* Trust Signals */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Trust</h4>
                  <div className="bg-slate-50 p-3 rounded text-xs font-mono space-y-1">
                    <div>responseTime: {Math.round(metrics.details.rawSignals.trust.responseTimeMinutes)} دقیقه</div>
                    <div>editCount: {metrics.details.rawSignals.trust.editCount}</div>
                    <div>hasBeenEdited: {String(metrics.details.rawSignals.trust.hasBeenEdited)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <p className="text-amber-700">متریک‌های کیفیت هنوز محاسبه نشده</p>
            <Button onClick={handleRecompute} className="mt-4" disabled={isRecomputing}>
              {isRecomputing ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <RefreshCw className="w-4 h-4 ml-2" />
              )}
              محاسبه کن
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reactions & Flags */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ThumbsUp className="w-4 h-4" />
              واکنش‌ها ({reactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">واکنشی ثبت نشده</p>
            ) : (
              <div className="space-y-2">
                {reactions.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-xs">{r.userId.slice(0, 8)}...</span>
                    <Badge variant="outline">{r.type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Flag className="w-4 h-4" />
              گزارش‌ها ({flags.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {flags.length === 0 ? (
              <p className="text-sm text-muted-foreground">گزارشی ثبت نشده</p>
            ) : (
              <div className="space-y-2">
                {flags.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-xs">{f.userId.slice(0, 8)}...</span>
                    <Badge variant="destructive">{f.reason}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
