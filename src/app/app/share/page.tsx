"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Copy, CheckCircle2, Share2, Info } from "lucide-react";
import { loadFromStorage, saveToStorage, type OnboardingProfile } from "@/lib/onboarding";
import {
  getProfileCompletion,
  canDownloadResume,
} from "@/lib/profileCompletion";
import ProfileCompletionGuard from "@/components/profile/ProfileCompletionGuard";
import { generateSlug, getPublicProfileUrl } from "@/lib/slug";

export default function SharePage() {
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [copied, setCopied] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");

  useEffect(() => {
    // TODO: در آینده از API دریافت شود
    const data = loadFromStorage();

    // Generate slug once and save it if it doesn't exist
    let slug = data?.slug;
    if (!slug && data?.fullName) {
      slug = generateSlug(data.fullName);
      // Save slug to profile
      const updatedProfile = { ...data, slug };
      saveToStorage(updatedProfile);
      setProfile(updatedProfile);
    } else {
      setProfile(data);
    }

    // Generate public profile URL
    const url = getPublicProfileUrl(
      slug || "user-" + Math.random().toString(36).substring(2, 8)
    );
    setPublicUrl(url);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Check profile completion
  const completion = getProfileCompletion(profile);
  const isComplete = canDownloadResume(profile);

  // Guard: Block if profile incomplete
  if (!isComplete) {
    return (
      <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              اشتراک‌گذاری پروفایل
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              تکمیل {completion.percentage}٪
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/app/profile">
              <ArrowRight className="w-4 h-4 ml-2" />
              بازگشت
            </Link>
          </Button>
        </div>

        <ProfileCompletionGuard completion={completion} variant="resume" />
      </div>
    );
  }

  // Ensure profile is loaded
  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            اشتراک‌گذاری پروفایل
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            این لینک را می‌توانید مستقیماً برای کارفرمایان ارسال کنید.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/app/profile">
            <ArrowRight className="w-4 h-4 ml-2" />
            بازگشت
          </Link>
        </Button>
      </div>

      {/* Share Link Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-base md:text-lg font-semibold mb-1">
                  لینک پروفایل شما
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  این لینک را کپی کرده و با دیگران به اشتراک بگذارید.
                </p>
              </div>

              {/* URL Input + Copy Button */}
              <div className="space-y-2">
                <Label htmlFor="public-url" className="sr-only">
                  آدرس پروفایل عمومی
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="public-url"
                    type="text"
                    value={publicUrl}
                    readOnly
                    dir="ltr"
                    className="flex-1 bg-secondary/50 text-sm"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant={copied ? "default" : "outline"}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                        کپی شد!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 ml-2" />
                        کپی لینک
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Info className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-1">
                    کد QR پروفایل
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    این کد را در رزومه چاپی خود قرار دهید تا کارفرمایان به راحتی
                    به پروفایل آنلاین شما دسترسی داشته باشند.
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-3 mx-auto md:mx-0">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <QRCodeSVG value={publicUrl} size={180} level="M" />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                اسکن برای مشاهده پروفایل
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Note */}
      <Card className="bg-primary/5 border-primary/20 shadow-sm">
        <CardContent className="p-4">
          <div className="text-center space-y-1">
            <p className="text-xs md:text-sm font-medium text-primary">
              ✓ پروفایل شما عمومی است
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
              هر کسی که این لینک را داشته باشد می‌تواند پروفایل شما را مشاهده
              کند. برای تغییر تنظیمات حریم خصوصی، به بخش تنظیمات مراجعه کنید.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
