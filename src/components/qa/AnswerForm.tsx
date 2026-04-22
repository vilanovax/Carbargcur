"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[180px] p-3 rounded-md border border-input bg-background animate-pulse" />
    ),
  }
);

interface AnswerFormProps {
  questionId: string;
  onSubmit: (body: string) => Promise<void>;
}

const MIN_LENGTH = 20;
const MAX_LENGTH = 10000;

export default function AnswerForm({ questionId, onSubmit }: AnswerFormProps) {
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedLength = body.trim().length;
  const canSubmit =
    !isSubmitting &&
    trimmedLength >= MIN_LENGTH &&
    trimmedLength <= MAX_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

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
            <label className="text-sm font-medium">پاسخ شما</label>

            <RichTextEditor
              content={body}
              onChange={setBody}
              placeholder="پاسخ تخصصی خود را بنویسید — مثال، تجربه شخصی یا منبع را هم بیاورید."
              disabled={isSubmitting}
              minHeight="180px"
            />

            <div className="space-y-1.5">
              {trimmedLength < MIN_LENGTH ? (
                <>
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all"
                      style={{ width: `${Math.min(100, (trimmedLength / MIN_LENGTH) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-amber-700">
                    {trimmedLength.toLocaleString("fa-IR")} از {MIN_LENGTH} کاراکتر حداقل
                  </p>
                </>
              ) : (
                <p
                  className={`text-xs text-right ${
                    body.length > MAX_LENGTH ? "text-red-500 font-medium" : "text-muted-foreground"
                  }`}
                >
                  {body.length.toLocaleString("fa-IR")} / {MAX_LENGTH.toLocaleString("fa-IR")}
                </p>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              پاسخ‌های باکیفیت در پروفایل شما ثبت می‌شوند.
            </p>
            <Button type="submit" size="lg" disabled={!canSubmit}>
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
