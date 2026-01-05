"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PublicHeader from "@/components/layout/PublicHeader";
import { Loader2 } from "lucide-react";
import { normalizeMobileNumber, validateIranianMobile } from "@/lib/persian-utils";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
    fullName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Auto-convert Persian/Arabic digits to English for mobile field
    const processedValue = name === 'mobile'
      ? normalizeMobileNumber(value)
      : value;

    setFormData({ ...formData, [name]: processedValue });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Normalize mobile number (convert Persian/Arabic digits to English)
      const normalizedMobile = normalizeMobileNumber(formData.mobile);

      // Validate mobile number
      if (!validateIranianMobile(normalizedMobile)) {
        setError("شماره موبایل نامعتبر است. فرمت صحیح: 09xxxxxxxxx");
        setIsLoading(false);
        return;
      }

      if (isLogin) {
        // Login
        const result = await signIn("credentials", {
          mobile: normalizedMobile,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setError("شماره موبایل یا رمز عبور اشتباه است");
        } else {
          router.push("/app");
          router.refresh();
        }
      } else {
        // Register
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mobile: normalizedMobile,
            password: formData.password,
            fullName: formData.fullName,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "خطا در ثبت‌نام");
        } else {
          // Auto login after registration
          const result = await signIn("credentials", {
            mobile: normalizedMobile,
            password: formData.password,
            redirect: false,
          });

          if (result?.error) {
            setError("ثبت‌نام موفق بود اما خطا در ورود");
          } else {
            router.push("/app/profile/onboarding/step-1-basic");
            router.refresh();
          }
        }
      }
    } catch (error) {
      setError("خطا در اتصال به سرور");
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {isLogin ? "ورود به کاربرگ" : "ثبت‌نام در کاربرگ"}
              </CardTitle>
              <CardDescription>
                {isLogin
                  ? "به حساب کاربری خود وارد شوید"
                  : "ساخت حساب کاربری جدید"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error message */}
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                    {error}
                  </div>
                )}

                {/* نام کامل (فقط برای ثبت‌نام) */}
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">نام و نام خانوادگی</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="علی محمدی"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                )}

                {/* شماره موبایل */}
                <div className="space-y-2">
                  <Label htmlFor="mobile">شماره موبایل</Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹ یا 09123456789"
                    dir="ltr"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    می‌توانید از اعداد فارسی یا انگلیسی استفاده کنید
                  </p>
                </div>

                {/* رمز عبور */}
                <div className="space-y-2">
                  <Label htmlFor="password">رمز عبور</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="حداقل 8 کاراکتر"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      لطفاً صبر کنید...
                    </>
                  ) : (
                    isLogin ? "ورود" : "ثبت‌نام"
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError("");
                    }}
                    className="text-sm text-primary hover:underline"
                    disabled={isLoading}
                  >
                    {isLogin
                      ? "حساب کاربری ندارید؟ ثبت‌نام کنید"
                      : "قبلاً ثبت‌نام کرده‌اید؟ وارد شوید"}
                  </button>
                </div>

                <div className="text-center pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    اطلاعات شما به صورت امن ذخیره می‌شود.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* تست سریع - حذف شود در نسخه نهایی */}
          <div className="mt-4 p-4 bg-muted rounded-md text-xs">
            <p className="font-bold mb-2">حساب تست:</p>
            <p>موبایل: 09123456789</p>
            <p>رمز: test1234</p>
          </div>
        </div>
      </main>
    </>
  );
}
