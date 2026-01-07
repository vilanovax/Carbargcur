"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";

interface AnswerFormProps {
  questionId: string;
  onSubmit: (body: string) => Promise<void>;
}

export default function AnswerForm({ questionId, onSubmit }: AnswerFormProps) {
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (body.trim().length < 20) {
      setError("پاسخ باید حداقل ۲۰ کاراکتر باشد");
      return;
    }

    if (body.length > 5000) {
      setError("پاسخ نباید بیشتر از ۵۰۰۰ کاراکتر باشد");
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
            <label className="text-sm font-medium">پاسخ شما</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="پاسخ تخصصی خود را بنویسید..."
              rows={5}
              className="resize-none"
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>حداقل ۲۰ کاراکتر</span>
              <span>{body.length}/5000</span>
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
