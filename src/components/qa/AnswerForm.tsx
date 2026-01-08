"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Send, Type, FileText } from "lucide-react";
import dynamic from "next/dynamic";

// Lazy load the rich text editor to avoid SSR issues
const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[150px] p-3 rounded-md border border-input bg-background animate-pulse" />
    ),
  }
);

interface AnswerFormProps {
  questionId: string;
  onSubmit: (body: string) => Promise<void>;
}

export default function AnswerForm({ questionId, onSubmit }: AnswerFormProps) {
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useRichEditor, setUseRichEditor] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (body.trim().length < 20) {
      setError("پاسخ باید حداقل ۲۰ کاراکتر باشد");
      return;
    }

    if (body.length > 10000) {
      setError("پاسخ نباید بیشتر از ۱۰۰۰۰ کاراکتر باشد");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(body.trim());
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ارسال پاسخ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">پاسخ شما</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setUseRichEditor(!useRichEditor)}
                className="h-7 text-xs gap-1"
              >
                {useRichEditor ? (
                  <>
                    <Type className="w-3 h-3" />
                    ساده
                  </>
                ) : (
                  <>
                    <FileText className="w-3 h-3" />
                    پیشرفته
                  </>
                )}
              </Button>
            </div>

            {useRichEditor ? (
              <RichTextEditor
                content={body}
                onChange={setBody}
                placeholder="پاسخ تخصصی خود را بنویسید... می‌توانید از فرمت‌بندی استفاده کنید."
                disabled={isSubmitting}
                minHeight="180px"
              />
            ) : (
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="پاسخ تخصصی خود را بنویسید..."
                rows={6}
                className="resize-none"
                disabled={isSubmitting}
                dir="rtl"
              />
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>حداقل ۲۰ کاراکتر</span>
              <span className={body.length > 10000 ? "text-red-500" : ""}>
                {body.length.toLocaleString("fa-IR")}/۱۰,۰۰۰
              </span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              پاسخ‌های متخصصانه در پروفایل شما نمایش داده می‌شوند
            </p>
            <Button type="submit" disabled={isSubmitting || body.trim().length < 20}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  در حال ارسال...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 ml-2" />
                  ارسال پاسخ
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
