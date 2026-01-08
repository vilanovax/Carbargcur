"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ThumbsUp,
  ThumbsDown,
  Award,
  User,
  Loader2,
  CheckCircle2,
  Star,
  Sparkles,
  Flag,
  AlertTriangle,
  Pencil,
  X,
  Check,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Quality label types and styles
type QualityLabel = "NORMAL" | "USEFUL" | "PRO" | "STAR";

const QUALITY_BADGE_CONFIG: Record<QualityLabel, {
  label: string;
  icon: typeof Star;
  className: string;
  tooltip: string;
}> = {
  STAR: {
    label: "منتخب",
    icon: Star,
    className: "bg-amber-100 text-amber-700 border-amber-200",
    tooltip: "این پاسخ به‌صورت خودکار بر اساس کیفیت و بازخورد سؤال‌کننده به عنوان بهترین شناخته شد",
  },
  PRO: {
    label: "حرفه‌ای",
    icon: Sparkles,
    className: "bg-purple-100 text-purple-700 border-purple-200",
    tooltip: "این پاسخ کیفیت بالایی دارد و توسط سیستم به عنوان پاسخ حرفه‌ای شناخته شد",
  },
  USEFUL: {
    label: "مفید",
    icon: ThumbsUp,
    className: "bg-blue-100 text-blue-700 border-blue-200",
    tooltip: "این پاسخ مفید ارزیابی شده است",
  },
  NORMAL: {
    label: "",
    icon: ThumbsUp,
    className: "",
    tooltip: "",
  },
};

const FLAG_REASONS = [
  { value: "SPAM", label: "هرزنامه" },
  { value: "ABUSE", label: "محتوای نامناسب" },
  { value: "MISLEADING", label: "اطلاعات گمراه‌کننده" },
  { value: "LOW_QUALITY", label: "کیفیت پایین" },
  { value: "OTHER", label: "سایر" },
];

interface AnswerItemProps {
  answer: {
    id: string;
    body: string;
    helpfulCount: number;
    expertBadgeCount: number;
    isAccepted?: boolean;
    acceptedAt?: string;
    createdAt: string;
    aqs?: number;
    qualityLabel?: QualityLabel;
    author?: {
      fullName: string;
    };
  };
  userReaction?: "helpful" | "not_helpful" | "expert" | null;
  isOwnAnswer?: boolean;
  isAsker?: boolean; // True if current user is the question asker
  onReact?: (answerId: string, type: "helpful" | "not_helpful") => Promise<void>;
  onAccept?: (answerId: string) => Promise<void>;
  onFlag?: (answerId: string, reason: string) => Promise<void>;
  onEdit?: (answerId: string, newBody: string) => Promise<void>;
}

export default function AnswerItem({
  answer,
  userReaction,
  isOwnAnswer = false,
  isAsker = false,
  onReact,
  onAccept,
  onFlag,
  onEdit,
}: AnswerItemProps) {
  const [isReacting, setIsReacting] = useState<"helpful" | "not_helpful" | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editBody, setEditBody] = useState(answer.body);
  const [currentBody, setCurrentBody] = useState(answer.body);
  const [currentReaction, setCurrentReaction] = useState(userReaction);
  const [helpfulCount, setHelpfulCount] = useState(answer.helpfulCount);
  const [isAccepted, setIsAccepted] = useState(answer.isAccepted || false);

  const timeAgo = formatDistanceToNow(new Date(answer.createdAt), {
    addSuffix: true,
    locale: faIR,
  });

  const qualityLabel = (answer.qualityLabel || "NORMAL") as QualityLabel;
  const qualityConfig = QUALITY_BADGE_CONFIG[qualityLabel];

  const handleReact = async (type: "helpful" | "not_helpful") => {
    if (isOwnAnswer || !onReact || !isAsker) return;

    setIsReacting(type);
    try {
      await onReact(answer.id, type);

      // Optimistic update
      if (currentReaction === type) {
        // Toggle off
        setCurrentReaction(null);
        if (type === "helpful") setHelpfulCount((c) => Math.max(0, c - 1));
      } else {
        // If had different reaction, decrease old
        if (currentReaction === "helpful") {
          setHelpfulCount((c) => Math.max(0, c - 1));
        }
        // Set new reaction
        setCurrentReaction(type);
        if (type === "helpful") setHelpfulCount((c) => c + 1);
      }
    } catch {
      // Error handled by parent
    } finally {
      setIsReacting(null);
    }
  };

  const handleAccept = async () => {
    if (!onAccept || !isAsker || isOwnAnswer) return;

    setIsAccepting(true);
    try {
      await onAccept(answer.id);
      setIsAccepted(true);
    } catch {
      // Error handled by parent
    } finally {
      setIsAccepting(false);
    }
  };

  const handleFlag = async (reason: string) => {
    if (!onFlag || isOwnAnswer) return;

    setIsFlagging(true);
    try {
      await onFlag(answer.id, reason);
    } catch {
      // Error handled by parent
    } finally {
      setIsFlagging(false);
    }
  };

  const handleStartEdit = () => {
    setEditBody(currentBody);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditBody(currentBody);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!onEdit || editBody.trim() === currentBody) {
      setIsEditing(false);
      return;
    }

    if (editBody.trim().length < 20) {
      return; // Validation handled by form
    }

    setIsSaving(true);
    try {
      await onEdit(answer.id, editBody.trim());
      setCurrentBody(editBody.trim());
      setIsEditing(false);
    } catch {
      // Error handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card
      className={cn(
        "border-r-4 transition-all",
        isAccepted
          ? "border-r-green-500 bg-green-50/50"
          : qualityLabel === "STAR"
            ? "border-r-amber-400"
            : qualityLabel === "PRO"
              ? "border-r-purple-400"
              : "border-r-transparent"
      )}
    >
      <CardContent className="p-4 space-y-4">
        {/* Header: Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Accepted Badge */}
          {isAccepted && (
            <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              پاسخ منتخب
            </Badge>
          )}

          {/* Quality Badge */}
          {qualityLabel !== "NORMAL" && !isAccepted && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className={cn("gap-1 cursor-help", qualityConfig.className)}
                  >
                    <qualityConfig.icon className="w-3.5 h-3.5" />
                    {qualityConfig.label}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-center">
                  <p>{qualityConfig.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Expert Badge Count */}
          {answer.expertBadgeCount > 0 && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
              <Award className="w-3.5 h-3.5" />
              {answer.expertBadgeCount} متخصصانه
            </Badge>
          )}
        </div>

        {/* Answer Body */}
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              className="min-h-[120px] text-sm"
              placeholder="متن پاسخ..."
              disabled={isSaving}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {editBody.length < 20 ? (
                  <span className="text-red-500">حداقل ۲۰ کاراکتر</span>
                ) : (
                  `${editBody.length} کاراکتر`
                )}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 ml-1" />
                  انصراف
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={isSaving || editBody.trim().length < 20}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 ml-1" />
                  )}
                  ذخیره
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed text-sm">
              {currentBody}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          {/* Author & Time */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="w-3.5 h-3.5" />
              <span>{answer.author?.fullName || "کاربر"}</span>
            </div>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Asker Actions: Helpful/Not Helpful + Accept */}
            {isAsker && !isOwnAnswer && (
              <>
                {/* Helpful Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-3 gap-1.5",
                    currentReaction === "helpful" && "bg-green-50 text-green-600"
                  )}
                  onClick={() => handleReact("helpful")}
                  disabled={isReacting !== null}
                >
                  {isReacting === "helpful" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ThumbsUp className="w-4 h-4" />
                  )}
                  <span className="text-xs">
                    {helpfulCount > 0 ? helpfulCount : ""} مفید
                  </span>
                </Button>

                {/* Not Helpful Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-3 gap-1.5",
                    currentReaction === "not_helpful" && "bg-red-50 text-red-600"
                  )}
                  onClick={() => handleReact("not_helpful")}
                  disabled={isReacting !== null}
                >
                  {isReacting === "not_helpful" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ThumbsDown className="w-4 h-4" />
                  )}
                </Button>

                {/* Accept Button */}
                {!isAccepted && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 gap-1.5 text-green-600 border-green-200 hover:bg-green-50"
                    onClick={handleAccept}
                    disabled={isAccepting}
                  >
                    {isAccepting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span className="text-xs">انتخاب</span>
                  </Button>
                )}
              </>
            )}

            {/* Non-Asker Actions: Flag only */}
            {!isAsker && !isOwnAnswer && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 gap-1.5 text-muted-foreground hover:text-red-600"
                    disabled={isFlagging}
                  >
                    {isFlagging ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Flag className="w-4 h-4" />
                    )}
                    <span className="text-xs">گزارش</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {FLAG_REASONS.map((reason) => (
                    <DropdownMenuItem
                      key={reason.value}
                      onClick={() => handleFlag(reason.value)}
                      className="gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      {reason.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Own Answer Actions: Edit */}
            {isOwnAnswer && !isEditing && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 gap-1.5 text-muted-foreground hover:text-primary"
                  onClick={handleStartEdit}
                >
                  <Pencil className="w-4 h-4" />
                  <span className="text-xs">ویرایش</span>
                </Button>
                <span className="text-xs text-muted-foreground bg-slate-100 px-2 py-1 rounded">
                  پاسخ شما
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
