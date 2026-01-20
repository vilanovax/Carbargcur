"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, XCircle } from "lucide-react";

export default function SyncTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkDatabase = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setResult(data.profile);
      } else {
        const err = await response.json();
        setError(err.error || "خطا در دریافت داده");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const syncToDatabase = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get from localStorage
      const localV1 = localStorage.getItem("karbarg:onboarding:profile:v1");
      const localV2 = localStorage.getItem("karbarg:onboarding:profile:v2");

      const dataV1 = localV1 ? JSON.parse(localV1) : null;
      const dataV2 = localV2 ? JSON.parse(localV2) : null;

      // Prefer v2 if it has data
      const dataToSync = (dataV2?.coreSkills?.length > 0 || dataV2?.recentExperience)
        ? dataV2
        : dataV1;

      if (!dataToSync) {
        setError("هیچ داده‌ای در localStorage یافت نشد");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/profile/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSync),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.profile);
        alert("✅ همگام‌سازی موفق!");
      } else {
        const err = await response.json();
        setError(err.error || "خطا در همگام‌سازی");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold">تست همگام‌سازی پروفایل</h1>

      <Card>
        <CardHeader>
          <CardTitle>عملیات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={checkDatabase}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              بررسی دیتابیس
            </Button>
            <Button
              onClick={syncToDatabase}
              disabled={loading}
            >
              همگام‌سازی به دیتابیس
            </Button>
          </div>

          {loading && (
            <p className="text-sm text-muted-foreground">در حال پردازش...</p>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>نتیجه</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">نام:</span> {result.fullName || "—"}
              </div>
              <div>
                <span className="font-medium">شهر:</span> {result.city || "—"}
              </div>
              <div>
                <span className="font-medium">مهارت‌ها:</span>{" "}
                {result.skills?.length || 0}
                {result.skills?.length > 0 && (
                  <span className="mr-2 text-green-600">
                    <CheckCircle className="w-4 h-4 inline" />
                  </span>
                )}
              </div>
              <div>
                <span className="font-medium">تجربیات:</span>{" "}
                {result.experiences?.length || 0}
                {result.experiences?.length > 0 && (
                  <span className="mr-2 text-green-600">
                    <CheckCircle className="w-4 h-4 inline" />
                  </span>
                )}
              </div>
              <div className="col-span-2">
                <span className="font-medium">تحصیلات:</span>{" "}
                {result.education ? (
                  <span className="text-green-600">
                    ✓ {result.education.degree} - {result.education.field}
                  </span>
                ) : (
                  <span className="text-gray-400">ندارد</span>
                )}
              </div>
            </div>

            <details>
              <summary className="cursor-pointer text-sm text-blue-600 hover:underline">
                نمایش کامل JSON
              </summary>
              <pre className="text-xs bg-gray-100 p-3 rounded mt-2 overflow-auto max-h-96" dir="ltr">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-bold mb-2">راهنما</h3>
          <ol className="text-sm space-y-2 list-decimal list-inside">
            <li>ابتدا روی "بررسی دیتابیس" کلیک کنید تا ببینید چه داده‌ای در دیتابیس است</li>
            <li>اگر داده خالی است یا ناقص، روی "همگام‌سازی به دیتابیس" کلیک کنید</li>
            <li>بعد از همگام‌سازی، دوباره "بررسی دیتابیس" را کلیک کنید تا تغییرات را ببینید</li>
            <li>حالا بروید به صفحه پروفایل یا رزومه - باید تحصیلات و مهارت‌ها را ببینید</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
