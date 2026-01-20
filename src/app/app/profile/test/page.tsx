"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadFromStorage, loadFocusedFromStorage } from "@/lib/onboarding";
import { RefreshCw, Database, HardDrive, CheckCircle, XCircle } from "lucide-react";

export default function ProfileTestPage() {
  const [localData, setLocalData] = useState<any>(null);
  const [focusedData, setFocusedData] = useState<any>(null);
  const [apiData, setApiData] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const loadAllData = async () => {
    setLoading(true);

    // Load from localStorage
    const local = loadFromStorage();
    const focused = loadFocusedFromStorage();
    setLocalData(local);
    setFocusedData(focused);

    // Load from API
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setApiData(data.profile);
      } else {
        setApiData({ error: "Failed to load" });
      }
    } catch (error) {
      setApiData({ error: String(error) });
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      loadAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const handleSync = async (dataType: 'v1' | 'v2') => {
    setSyncing(true);
    setSyncResult(null);

    try {
      const dataToSync = dataType === 'v1' ? localData : focusedData;

      const response = await fetch("/api/profile/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSync),
      });

      if (response.ok) {
        const result = await response.json();
        setSyncResult(`✅ ${result.message || 'موفق'}`);
        // Reload API data
        await loadAllData();
      } else {
        const error = await response.json();
        setSyncResult(`❌ خطا: ${error.error}`);
      }
    } catch (error) {
      setSyncResult(`❌ خطا: ${String(error)}`);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  const hasV1Data = localData?.skills?.length > 0 || localData?.experiences?.length > 0;
  const hasV2Data = focusedData?.coreSkills?.length > 0 || focusedData?.recentExperience?.role;
  const hasApiData = apiData && !apiData.error && (apiData.skills?.length > 0 || apiData.experiences?.length > 0 || apiData.education);

  return (
    <div className="container mx-auto p-8 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">تست و بررسی پروفایل</h1>
        <Button onClick={loadAllData} variant="outline">
          <RefreshCw className="w-4 h-4 ml-2" />
          بارگذاری مجدد
        </Button>
      </div>

      {syncResult && (
        <Card className={syncResult.includes('✅') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
          <CardContent className="p-4">
            <p className="font-medium">{syncResult}</p>
          </CardContent>
        </Card>
      )}

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>وضعیت کلی داده‌ها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-blue-600" />
              <span className="font-medium">localStorage (v1 - OnboardingProfile)</span>
            </div>
            {hasV1Data ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600">دارای داده</span>
                <Button size="sm" onClick={() => handleSync('v1')} disabled={syncing}>
                  همگام‌سازی
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-400">خالی</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-purple-600" />
              <span className="font-medium">localStorage (v2 - FocusedProfile)</span>
            </div>
            {hasV2Data ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600">دارای داده</span>
                <Button size="sm" onClick={() => handleSync('v2')} disabled={syncing}>
                  همگام‌سازی
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-400">خالی</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-green-600" />
              <span className="font-medium">Database (profiles table)</span>
            </div>
            {hasApiData ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600">دارای داده</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-600">خالی یا خطا</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* V1 Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">localStorage v1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-medium">نام:</span> {localData?.fullName || '—'}
              </div>
              <div>
                <span className="font-medium">مهارت‌ها:</span> {localData?.skills?.length || 0}
              </div>
              <div>
                <span className="font-medium">تجربیات:</span> {localData?.experiences?.length || 0}
              </div>
              <div>
                <span className="font-medium">تحصیلات:</span> {localData?.education ? '✓' : '—'}
              </div>
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-xs text-blue-600 hover:underline">
                نمایش JSON
              </summary>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-64" dir="ltr">
                {JSON.stringify(localData, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>

        {/* V2 Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">localStorage v2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-medium">نقش:</span> {focusedData?.recentExperience?.role || '—'}
              </div>
              <div>
                <span className="font-medium">مهارت‌ها:</span> {focusedData?.coreSkills?.length || 0}
              </div>
              <div>
                <span className="font-medium">تمرکز:</span> {focusedData?.careerFocus || '—'}
              </div>
              <div>
                <span className="font-medium">تحصیلات:</span> {focusedData?.latestEducation?.degree || '—'}
              </div>
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-xs text-blue-600 hover:underline">
                نمایش JSON
              </summary>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-64" dir="ltr">
                {JSON.stringify(focusedData, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>

        {/* API Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Database</CardTitle>
          </CardHeader>
          <CardContent>
            {apiData?.error ? (
              <p className="text-xs text-red-600">{apiData.error}</p>
            ) : (
              <>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-medium">نام:</span> {apiData?.fullName || '—'}
                  </div>
                  <div>
                    <span className="font-medium">مهارت‌ها:</span> {apiData?.skills?.length || 0}
                  </div>
                  <div>
                    <span className="font-medium">تجربیات:</span> {apiData?.experiences?.length || 0}
                  </div>
                  <div>
                    <span className="font-medium">تحصیلات:</span> {apiData?.education ? '✓' : '—'}
                  </div>
                </div>
                <details className="mt-4">
                  <summary className="cursor-pointer text-xs text-blue-600 hover:underline">
                    نمایش JSON
                  </summary>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-64" dir="ltr">
                    {JSON.stringify(apiData, null, 2)}
                  </pre>
                </details>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-bold mb-2">راهنما</h3>
          <ul className="text-sm space-y-1">
            <li>• اگر داده در localStorage (v1 یا v2) وجود دارد اما در Database نیست، روی دکمه "همگام‌سازی" کلیک کنید</li>
            <li>• v1 = سیستم قدیمی (fullName, skills, experiences, education)</li>
            <li>• v2 = سیستم جدید (recentExperience, coreSkills, latestEducation)</li>
            <li>• هر دو به درستی به Database sync می‌شوند</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
