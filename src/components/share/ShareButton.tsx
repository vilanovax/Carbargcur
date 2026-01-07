/**
 * Share Button Component
 *
 * A dropdown button for sharing assessment results on social media.
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Share2,
  Twitter,
  Linkedin,
  MessageCircle,
  Copy,
  Check,
  Send,
} from "lucide-react";
import {
  shareResult,
  type ShareableResult,
  type ShareOptions,
} from "@/lib/export/ShareResultsEngine";

// ============================================
// SHARE BUTTON
// ============================================

interface ShareButtonProps {
  shareable: ShareableResult;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  includeLink?: boolean;
  className?: string;
}

export function ShareButton({
  shareable,
  variant = "outline",
  size = "default",
  includeLink = true,
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleShare = async (platform: ShareOptions["platform"]) => {
    const result = await shareResult(shareable, { platform, includeLink });

    if (platform === "copy" && result.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Share2 className="w-4 h-4 ml-2" />
          اشتراک‌گذاری
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" dir="rtl">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          اشتراک‌گذاری در
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => handleShare("twitter")}>
          <Twitter className="w-4 h-4 ml-2 text-[#1DA1F2]" />
          توییتر / X
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare("linkedin")}>
          <Linkedin className="w-4 h-4 ml-2 text-[#0A66C2]" />
          لینکدین
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare("telegram")}>
          <Send className="w-4 h-4 ml-2 text-[#0088cc]" />
          تلگرام
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare("whatsapp")}>
          <MessageCircle className="w-4 h-4 ml-2 text-[#25D366]" />
          واتساپ
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => handleShare("copy")}>
          {copied ? (
            <>
              <Check className="w-4 h-4 ml-2 text-green-500" />
              کپی شد!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 ml-2" />
              کپی متن
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================
// INLINE SHARE BUTTONS
// ============================================

interface InlineShareButtonsProps {
  shareable: ShareableResult;
  includeLink?: boolean;
  className?: string;
}

export function InlineShareButtons({
  shareable,
  includeLink = true,
  className,
}: InlineShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (platform: ShareOptions["platform"]) => {
    const result = await shareResult(shareable, { platform, includeLink });

    if (platform === "copy" && result.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="icon"
        className="w-9 h-9"
        onClick={() => handleShare("twitter")}
        title="اشتراک در توییتر"
      >
        <Twitter className="w-4 h-4 text-[#1DA1F2]" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="w-9 h-9"
        onClick={() => handleShare("linkedin")}
        title="اشتراک در لینکدین"
      >
        <Linkedin className="w-4 h-4 text-[#0A66C2]" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="w-9 h-9"
        onClick={() => handleShare("telegram")}
        title="اشتراک در تلگرام"
      >
        <Send className="w-4 h-4 text-[#0088cc]" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="w-9 h-9"
        onClick={() => handleShare("copy")}
        title="کپی متن"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}

// ============================================
// SHARE CARD (Full Share Section)
// ============================================

interface ShareCardProps {
  shareable: ShareableResult;
  includeLink?: boolean;
}

export function ShareCard({ shareable, includeLink = true }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const result = await shareResult(shareable, { platform: "copy", includeLink });
    if (result.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          اشتراک‌گذاری نتیجه
        </h4>
        <InlineShareButtons shareable={shareable} includeLink={includeLink} />
      </div>

      {/* Preview of share text */}
      <div className="bg-white rounded border p-3 text-xs text-slate-600 whitespace-pre-line max-h-24 overflow-y-auto">
        {shareable.shareText}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleCopy}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 ml-2 text-green-500" />
            کپی شد!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 ml-2" />
            کپی متن کامل
          </>
        )}
      </Button>
    </div>
  );
}
