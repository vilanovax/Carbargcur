"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2, Send, X, Lightbulb, AlertCircle, Type, FileText, Save, RotateCcw } from "lucide-react";
import { saveDraft, loadDraft, clearDraft, getDraftAge, type QuestionDraft } from "@/lib/qa-draft";
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
import Link from "next/link";

const categories = [
  { value: "accounting", label: "حسابداری" },
  { value: "finance", label: "مالی" },
  { value: "tax", label: "مالیات" },
  { value: "insurance", label: "بیمه" },
  { value: "investment", label: "سرمایه‌گذاری" },
];

export default function AskQuestionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useRichEditor, setUseRichEditor] = useState(true);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [draftAge, setDraftAge] = useState<string | null>(null);
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft && (draft.title || draft.body)) {
      setShowDraftBanner(true);
      setDraftAge(getDraftAge(draft.savedAt));
    }
  }, []);

  // Auto-save draft with debounce
  useEffect(() => {
    const hasContent = title.trim() || body.trim();
    if (!hasContent) {
      setHasSavedDraft(false);
      return;
    }

    const timer = setTimeout(() => {
      saveDraft({ title, body, category, tags });
      setHasSavedDraft(true);
      // Reset the indicator after a short delay
      setTimeout(() => setHasSavedDraft(false), 2000);
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [title, body, category, tags]);

  // Restore draft
  const handleRestoreDraft = useCallback(() => {
    const draft = loadDraft();
    if (draft) {
      setTitle(draft.title);
      setBody(draft.body);
      setCategory(draft.category);
      setTags(draft.tags);
      setShowDraftBanner(false);
    }
  }, []);

  // Discard draft
  const handleDiscardDraft = useCallback(() => {
    clearDraft();
    setShowDraftBanner(false);
  }, []);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().replace(",", "");
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setTags([...tags, tag]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (title.trim().length < 10) {
      setError("عنوان باید حداقل ۱۰ کاراکتر باشد");
      return;
    }

    if (title.length > 200) {
      setError("عنوان نباید بیشتر از ۲۰۰ کاراکتر باشد");
      return;
    }

    if (body.trim().length < 30) {
      setError("توضیحات باید حداقل ۳۰ کاراکتر باشد");
      return;
    }

    if (body.length > 5000) {
      setError("توضیحات نباید بیشتر از ۵۰۰۰ کاراکتر باشد");
      return;
    }

    if (!category) {
      setError("لطفاً دسته‌بندی را انتخاب کنید");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/qa/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          category,
          tags: tags.length > 0 ? tags : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در ثبت سؤال");
      }

      // Clear draft on successful submission
      clearDraft();

      // Redirect to question page
      router.push(`/app/qa/${data.question.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ثبت سؤال");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 -m-6 md:-m-8 p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/qa">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">پرسیدن سؤال تخصصی</h1>
            <p className="text-sm text-muted-foreground mt-1">
              سؤال خود را واضح و با جزئیات مطرح کنید
            </p>
          </div>
        </div>

        {/* Draft Banner */}
        {showDraftBanner && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      پیش‌نویس ذخیره شده یافت شد
                    </p>
                    <p className="text-xs text-amber-700">
                      {draftAge}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDiscardDraft}
                    className="text-amber-700 border-amber-300 hover:bg-amber-100"
                  >
                    <X className="w-4 h-4 ml-1" />
                    رد کردن
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleRestoreDraft}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <RotateCcw className="w-4 h-4 ml-1" />
                    بازیابی
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">راهنمای سؤال خوب</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• عنوان مشخص و خلاصه بنویسید</li>
                  <li>• جزئیات و زمینه سؤال را توضیح دهید</li>
                  <li>• دسته‌بندی مناسب انتخاب کنید</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">سؤال شما</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  عنوان سؤال <span className="text-red-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: نحوه محاسبه مالیات بر ارزش افزوده برای صادرات"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  {title.length}/200 کاراکتر
                </p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  دسته‌بندی <span className="text-red-500">*</span>
                </label>
                <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب دسته‌بندی" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Body */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    توضیحات سؤال <span className="text-red-500">*</span>
                  </label>
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
                    placeholder="سؤال خود را با جزئیات توضیح دهید... می‌توانید از فرمت‌بندی استفاده کنید."
                    disabled={isSubmitting}
                    minHeight="150px"
                  />
                ) : (
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="سؤال خود را با جزئیات توضیح دهید..."
                    rows={6}
                    className="resize-none"
                    disabled={isSubmitting}
                  />
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>حداقل ۳۰ کاراکتر</span>
                  <span className={body.length > 5000 ? "text-red-500" : ""}>
                    {body.length.toLocaleString("fa-IR")}/۵,۰۰۰
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  برچسب‌ها <span className="text-muted-foreground">(اختیاری)</span>
                </label>
                <div className="space-y-2">
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="pl-1.5 gap-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:bg-slate-300 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="برچسب بنویسید و Enter بزنید"
                    disabled={isSubmitting || tags.length >= 5}
                  />
                  <p className="text-xs text-muted-foreground">
                    حداکثر ۵ برچسب - {tags.length}/5
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Submit */}
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  محدودیت روزانه: ۵ سؤال
                </p>
                <Button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !body.trim() || !category}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      در حال ارسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 ml-2" />
                      ثبت سؤال
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
