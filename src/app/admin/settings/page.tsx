"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Key, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [openaiKey, setOpenaiKey] = useState("");
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/settings");

      if (response.status === 403) {
        // Not authenticated - this is expected in dev without auth setup
        // Just continue with empty settings
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("خطا در دریافت تنظیمات");
      }

      const data = await response.json();
      if (data.openai_api_key?.value) {
        setOpenaiKey(data.openai_api_key.value);
      }
    } catch (err: any) {
      console.error("Load settings error:", err);
      // Don't show error for auth issues in development
      if (err.message !== "خطا در دریافت تنظیمات") {
        setError("خطا در دریافت تنظیمات");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!openaiKey.trim()) {
      setError("لطفاً کلید API را وارد کنید");
      return;
    }

    // Basic validation for OpenAI API key format
    if (!openaiKey.startsWith("sk-")) {
      setError("کلید API باید با sk- شروع شود");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: "openai_api_key",
          value: openaiKey,
          description: "کلید API OpenAI برای قابلیت‌های هوش مصنوعی",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در ذخیره تنظیمات");
      }

      setSuccess("تنظیمات با موفقیت ذخیره شد");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "خطا در ذخیره تنظیمات. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">تنظیمات سیستم</h2>
        <p className="text-sm text-gray-600 mt-1">
          مدیریت تنظیمات سیستم و کلیدهای API
        </p>
      </div>

      {/* API Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            تنظیمات API
          </CardTitle>
          <CardDescription>
            مدیریت کلیدهای API برای قابلیت‌های پیشرفته
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="openai-key" className="font-medium">
              کلید API OpenAI <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs md:text-sm text-muted-foreground">
              برای استفاده از قابلیت‌های هوش مصنوعی مانند آنالیز رزومه، پیشنهادات شغلی و دستیار هوشمند
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="openai-key"
                  type={showOpenaiKey ? "text" : "password"}
                  value={openaiKey}
                  onChange={(e) => {
                    setOpenaiKey(e.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  placeholder="sk-..."
                  className={`pr-10 ${error ? "border-red-500" : ""}`}
                  dir="ltr"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-0 top-0 h-full"
                  onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                >
                  {showOpenaiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "در حال ذخیره..." : "ذخیره"}
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <p>{success}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-blue-900">
                نحوه دریافت کلید API OpenAI:
              </p>
              <ol className="text-xs text-blue-800 space-y-1 mr-4 list-decimal">
                <li>به سایت platform.openai.com مراجعه کنید</li>
                <li>وارد حساب کاربری خود شوید یا ثبت‌نام کنید</li>
                <li>به بخش API Keys بروید</li>
                <li>روی "Create new secret key" کلیک کنید</li>
                <li>کلید ایجاد شده را کپی کرده و در اینجا وارد کنید</li>
              </ol>
              <p className="text-xs text-blue-700 pt-2">
                ⚠️ توجه: کلید API به صورت امن در دیتابیس ذخیره می‌شود و تنها برای درخواست‌های سیستم استفاده می‌شود.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-secondary/50">
        <CardContent className="p-6">
          <p className="text-sm text-center text-muted-foreground">
            تنظیمات سیستم برای تمام کاربران اعمال می‌شود. تنها ادمین‌ها می‌توانند این تنظیمات را مشاهده و ویرایش کنند.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
