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
import { ArrowRight, Loader2, Send, X, Lightbulb, AlertCircle, Save, RotateCcw, ChevronDown } from "lucide-react";
import { saveDraft, loadDraft, clearDraft, getDraftAge, type QuestionDraft } from "@/lib/qa-draft";
import { SUGGESTED_TAGS, isSuggestedTag, filterSuggestions } from "@/lib/qa-tags";
import { toPersianDigits } from "@/lib/persian-utils";
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
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [draftAge, setDraftAge] = useState<string | null>(null);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [quota, setQuota] = useState<{ used: number; limit: number; remaining: number } | null>(null);
  const [tipsOpen, setTipsOpen] = useState(true);

  // Restore tips open/closed from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("qa-ask-tips-open");
      if (stored === "0") setTipsOpen(false);
    } catch {}
  }, []);

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft && (draft.title || draft.body)) {
      setShowDraftBanner(true);
      setDraftAge(getDraftAge(draft.savedAt));
    }
  }, []);

  // Load daily quota on mount
  useEffect(() => {
    fetch("/api/qa/quota")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setQuota(data))
      .catch(() => {});
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

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(",", "");
    if (!tag) return;
    if (tags.includes(tag) || tags.length >= 5) return;
    setTags([...tags, tag]);
    setTagInput("");
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
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

        {/* Draft Banner — slim */}
        {showDraftBanner && (
          <div className="flex items-center justify-between gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
            <div className="flex items-center gap-2 text-amber-800 min-w-0">
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span className="truncate">
                پیش‌نویس {draftAge ? `(${draftAge})` : ""}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="text-xs font-medium text-amber-800 hover:underline"
              >
                بازیابی
              </button>
              <span className="text-amber-300">|</span>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="text-xs text-amber-600 hover:underline"
              >
                رد کردن
              </button>
            </div>
          </div>
        )}

        {/* Tips Card — collapsible */}
        <Card className="bg-blue-50 border-blue-200">
          <button
            type="button"
            onClick={() => {
              const next = !tipsOpen;
              setTipsOpen(next);
              try {
                localStorage.setItem("qa-ask-tips-open", next ? "1" : "0");
              } catch {}
            }}
            className="w-full p-4 flex items-center justify-between gap-3 text-right"
            aria-expanded={tipsOpen}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Lightbulb className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-sm font-medium text-blue-900">چطور سؤال خوب بپرسیم؟</p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-blue-600 transition-transform ${tipsOpen ? "rotate-180" : ""}`}
            />
          </button>
          {tipsOpen && (
            <div className="px-4 pb-4 pr-12 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border border-green-200 bg-green-50/80 p-2">
                  <p className="font-medium text-green-800 mb-1">✅ خوب</p>
                  <p className="text-green-700">«نحوه محاسبه مالیات بر ارزش افزوده برای صادرات کالا از گمرک شهید رجایی»</p>
                </div>
                <div className="rounded-md border border-red-200 bg-red-50/80 p-2">
                  <p className="font-medium text-red-800 mb-1">❌ ضعیف</p>
                  <p className="text-red-700">«کمک می‌خوام» یا «مالیات چیه؟»</p>
                </div>
              </div>
              <p className="text-xs text-blue-700">
                زمینه بنویسید (صنعت، نوع شرکت، مبلغ تقریبی) تا پاسخ دقیق بگیرید.
              </p>
            </div>
          )}
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
                  placeholder="سؤال خود را در یک جمله بنویسید"
                  disabled={isSubmitting}
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    مثال: «نحوه محاسبه مالیات بر ارزش افزوده برای صادرات»
                  </span>
                  <span
                    className={
                      title.length === 0
                        ? "text-muted-foreground"
                        : title.length < 10
                        ? "text-amber-700"
                        : title.length > 200
                        ? "text-red-500 font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {title.length < 10
                      ? `${toPersianDigits(title.length)} از ۱۰ کاراکتر حداقل`
                      : `${toPersianDigits(title.length)} / ۲۰۰`}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  توضیحات سؤال <span className="text-red-500">*</span>
                </label>

                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="جزئیات، زمینه و چیزی که تا الان امتحان کرده‌اید را بنویسید..."
                  rows={7}
                  className="resize-y"
                  disabled={isSubmitting}
                />

                <div className="space-y-1.5">
                  {body.length < 30 ? (
                    <>
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 transition-all"
                          style={{ width: `${Math.min(100, (body.length / 30) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-amber-700">
                        {toPersianDigits(body.length)} از ۳۰ کاراکتر حداقل
                      </p>
                    </>
                  ) : (
                    <p
                      className={`text-xs text-right ${
                        body.length > 5000 ? "text-red-500 font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {toPersianDigits(body.length)} / ۵,۰۰۰
                    </p>
                  )}
                </div>
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

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  برچسب‌ها <span className="text-muted-foreground">(اختیاری)</span>
                </label>
                <div className="space-y-2">
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => {
                        const isCustom = !isSuggestedTag(tag);
                        return (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className={`pl-1.5 gap-1 ${isCustom ? "border border-amber-300 bg-amber-50" : ""}`}
                            title={isCustom ? "برچسب سفارشی (پیشنهاد: از لیست استفاده کنید)" : undefined}
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
                        );
                      })}
                    </div>
                  )}

                  <div className="relative">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="تایپ کنید تا پیشنهادها ظاهر شوند..."
                      disabled={isSubmitting || tags.length >= 5}
                      autoComplete="off"
                    />
                    {tagInput.trim() && (
                      <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-md max-h-56 overflow-y-auto">
                        {filterSuggestions(tagInput, tags).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => addTag(s)}
                            className="w-full text-right px-3 py-2 text-sm hover:bg-muted transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                        {!isSuggestedTag(tagInput) && (
                          <button
                            type="button"
                            onClick={() => addTag(tagInput)}
                            className="w-full text-right px-3 py-2 text-sm border-t hover:bg-muted text-amber-700 transition-colors"
                          >
                            افزودن «{tagInput.trim()}» به عنوان برچسب جدید
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {!tagInput && tags.length < 5 && (
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_TAGS.slice(0, 8)
                        .filter((s) => !tags.includes(s))
                        .map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => addTag(s)}
                            className="text-xs px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:border-primary hover:text-primary transition-colors"
                          >
                            + {s}
                          </button>
                        ))}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    حداکثر ۵ برچسب - {toPersianDigits(tags.length)}/۵
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
                <p className={`text-xs ${quota && quota.remaining === 0 ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                  {quota
                    ? quota.remaining > 0
                      ? `امروز ${toPersianDigits(quota.remaining)} از ${toPersianDigits(quota.limit)} سؤال مجاز مانده`
                      : `به سقف روزانه (${toPersianDigits(quota.limit)} سؤال) رسیده‌اید`
                    : "در حال بارگذاری محدودیت..."}
                </p>
                <Button
                  type="submit"
                  size="lg"
                  disabled={
                    isSubmitting ||
                    title.trim().length < 10 ||
                    title.trim().length > 200 ||
                    body.trim().length < 30 ||
                    body.trim().length > 5000 ||
                    !category ||
                    (quota !== null && quota.remaining === 0)
                  }
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
