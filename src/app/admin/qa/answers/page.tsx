"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Search, Bug, ExternalLink, Star, Sparkles, ThumbsUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";

interface AnswerWithMetrics {
  id: string;
  body: string;
  aqs: number;
  label: string;
  isAccepted: boolean;
  createdAt: string;
  authorName: string;
  questionTitle: string;
  questionId: string;
}

const QUALITY_BADGE_CONFIG: Record<string, {
  label: string;
  icon: typeof Star;
  className: string;
}> = {
  STAR: {
    label: "منتخب",
    icon: Star,
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  PRO: {
    label: "حرفه‌ای",
    icon: Sparkles,
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  USEFUL: {
    label: "مفید",
    icon: ThumbsUp,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  NORMAL: {
    label: "عادی",
    icon: ThumbsUp,
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

export default function AdminAnswersDebugPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerWithMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchId, setSearchId] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status, router]);

  useEffect(() => {
    loadAnswers();
  }, []);

  const loadAnswers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/qa/answers");
      const data = await response.json();

      if (response.ok) {
        setAnswers(data.answers || []);
      }
    } catch (error) {
      console.error("Error loading answers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchId.trim()) {
      router.push(`/admin/qa/answers/${searchId.trim()}`);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bug className="w-6 h-6" />
            دیباگ کیفیت پاسخ‌ها
          </h1>
          <p className="text-muted-foreground mt-1">
            بررسی جزئیات محاسبه AQS برای هر پاسخ
          </p>
        </div>
      </div>

      {/* Search by ID */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">جستجوی مستقیم با ID</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Answer ID را وارد کنید..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="max-w-md"
              dir="ltr"
            />
            <Button onClick={handleSearch} disabled={!searchId.trim()}>
              <Search className="w-4 h-4 ml-2" />
              جستجو
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Answers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">آخرین پاسخ‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">پاسخ</TableHead>
                <TableHead className="text-right">سؤال</TableHead>
                <TableHead className="text-center">AQS</TableHead>
                <TableHead className="text-center">برچسب</TableHead>
                <TableHead className="text-center">وضعیت</TableHead>
                <TableHead className="text-right">زمان</TableHead>
                <TableHead className="text-center">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {answers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    هیچ پاسخی یافت نشد
                  </TableCell>
                </TableRow>
              ) : (
                answers.map((answer) => {
                  const config = QUALITY_BADGE_CONFIG[answer.label] || QUALITY_BADGE_CONFIG.NORMAL;
                  const Icon = config.icon;

                  return (
                    <TableRow key={answer.id}>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="text-sm truncate">{answer.body.slice(0, 50)}...</p>
                          <p className="text-xs text-muted-foreground">{answer.authorName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/app/qa/${answer.questionId}`}
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {answer.questionTitle.slice(0, 30)}...
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono font-bold text-lg">{answer.aqs}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={config.className}>
                          <Icon className="w-3 h-3 ml-1" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {answer.isAccepted && (
                          <Badge className="bg-green-100 text-green-700">منتخب</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(answer.createdAt), {
                          addSuffix: true,
                          locale: faIR,
                        })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/qa/answers/${answer.id}`}>
                            <Bug className="w-4 h-4 ml-1" />
                            دیباگ
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
