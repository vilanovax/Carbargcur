"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bookmark,
  BookmarkX,
  MessageSquare,
  Calendar,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkedQuestion {
  id: string;
  bookmarkedAt: string;
  question: {
    id: string;
    title: string;
    body: string;
    category: string;
    tags: string[];
    answersCount: number;
    createdAt: string;
    authorName: string;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  accounting: "حسابداری",
  finance: "مالی",
  tax: "مالیات",
  insurance: "بیمه",
  investment: "سرمایه‌گذاری",
  other: "سایر",
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "امروز";
  if (diffDays === 1) return "دیروز";
  if (diffDays < 7) return `${diffDays} روز پیش`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} هفته پیش`;
  return date.toLocaleDateString("fa-IR");
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadBookmarks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/bookmarks?limit=50");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در دریافت نشان‌گذاری‌ها");
      }

      setBookmarks(data.bookmarks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت اطلاعات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleRemoveBookmark = async (questionId: string) => {
    setRemovingId(questionId);
    try {
      const response = await fetch(`/api/bookmarks?questionId=${questionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBookmarks((prev) =>
          prev.filter((b) => b.question.id !== questionId)
        );
      }
    } catch (error) {
      console.error("Error removing bookmark:", error);
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={loadBookmarks}>تلاش مجدد</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bookmark className="w-6 h-6 text-yellow-600" />
          <div>
            <h1 className="text-2xl font-bold">سؤالات ذخیره‌شده</h1>
            <p className="text-sm text-muted-foreground">
              {bookmarks.length > 0
                ? `${bookmarks.length} سؤال ذخیره شده`
                : "هنوز سؤالی ذخیره نکرده‌اید"}
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/app/qa">
            <ArrowLeft className="w-4 h-4 ml-2" />
            بازگشت به سؤالات
          </Link>
        </Button>
      </div>

      {/* Bookmarks List */}
      {bookmarks.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Bookmark className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">هیچ سؤالی ذخیره نشده</h3>
            <p className="text-muted-foreground mb-4">
              سؤالات مهم را با کلیک روی آیکون نشان‌گذاری ذخیره کنید
            </p>
            <Button asChild>
              <Link href="/app/qa">مشاهده سؤالات</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bookmark) => (
            <Card
              key={bookmark.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/app/qa/${bookmark.question.id}`}
                      className="block group"
                    >
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {bookmark.question.title}
                      </h3>
                    </Link>

                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {bookmark.question.body}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {CATEGORY_LABELS[bookmark.question.category] ||
                          bookmark.question.category}
                      </Badge>

                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {bookmark.question.answersCount} پاسخ
                      </span>

                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatRelativeTime(bookmark.question.createdAt)}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        توسط {bookmark.question.authorName}
                      </span>
                    </div>

                    {/* Tags */}
                    {bookmark.question.tags.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {bookmark.question.tags.slice(0, 3).map((tag, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-yellow-600 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleRemoveBookmark(bookmark.question.id)}
                      disabled={removingId === bookmark.question.id}
                      title="حذف از ذخیره‌ها"
                    >
                      {removingId === bookmark.question.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <BookmarkX className="w-5 h-5" />
                      )}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      ذخیره: {formatRelativeTime(bookmark.bookmarkedAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
