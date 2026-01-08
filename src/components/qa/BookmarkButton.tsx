"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  questionId: string;
  variant?: "icon" | "full";
  size?: "sm" | "default";
  className?: string;
}

export default function BookmarkButton({
  questionId,
  variant = "icon",
  size = "default",
  className,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check initial bookmark status
  useEffect(() => {
    setMounted(true);
    const checkBookmark = async () => {
      try {
        const response = await fetch(`/api/bookmarks/check?questionId=${questionId}`);
        const data = await response.json();
        setIsBookmarked(data.isBookmarked);
      } catch (error) {
        console.error("Error checking bookmark:", error);
      }
    };

    checkBookmark();
  }, [questionId]);

  const handleToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isBookmarked) {
        // Remove bookmark
        const response = await fetch(`/api/bookmarks?questionId=${questionId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setIsBookmarked(false);
        }
      } else {
        // Add bookmark
        const response = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId }),
        });
        if (response.ok) {
          setIsBookmarked(true);
        }
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size={size === "sm" ? "sm" : "icon"}
        className={cn("text-muted-foreground", className)}
        disabled
      >
        <Bookmark className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
        {variant === "full" && <span className="mr-1">ذخیره</span>}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size={size === "sm" ? "sm" : "icon"}
      className={cn(
        isBookmarked
          ? "text-yellow-600 hover:text-yellow-700"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      onClick={handleToggle}
      disabled={isLoading}
      title={isBookmarked ? "حذف از ذخیره‌ها" : "ذخیره سؤال"}
    >
      {isLoading ? (
        <Loader2 className={cn("animate-spin", size === "sm" ? "h-4 w-4" : "h-5 w-5")} />
      ) : isBookmarked ? (
        <BookmarkCheck className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
      ) : (
        <Bookmark className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
      )}
      {variant === "full" && (
        <span className="mr-1">{isBookmarked ? "ذخیره شده" : "ذخیره"}</span>
      )}
    </Button>
  );
}
