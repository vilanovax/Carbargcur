'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, Clock, Zap, Target, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { loadFromStorage } from '@/lib/onboarding';

export default function PersonalityAssessmentPage() {
  const [hasQuickResult, setHasQuickResult] = useState(false);
  const [hasFullResult, setHasFullResult] = useState(false);

  useEffect(() => {
    const profile = loadFromStorage();
    setHasQuickResult(!!profile.personality?.quick);
    setHasFullResult(!!profile.personality?.full);
  }, []);

  // If user hasn't done any test, redirect to compare page
  if (!hasQuickResult && !hasFullResult) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-2xl w-full p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <Brain className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              آزمون سبک کاری حرفه‌ای
            </h1>
            <p className="text-slate-600">
              بر پایه MBTI - شناخت ترجیحات کاری شما
            </p>
          </div>

          <p className="text-slate-700">
            این آزمون در دو سطح ارائه می‌شود. ابتدا نسخه مناسب خود را انتخاب کنید.
          </p>

          <Link href="/app/personality/compare">
            <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
              مشاهده و انتخاب نسخه آزمون
            </Button>
          </Link>

          <Link href="/app">
            <Button variant="ghost" className="w-full">
              بازگشت به داشبورد
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="max-w-5xl w-full space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            آزمون‌های سبک کاری شما
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            می‌توانید نتایج خود را مشاهده یا آزمون‌ها را مجدداً انجام دهید.
          </p>
        </div>

        {/* Assessment Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Test Card */}
          <Card className={`p-6 space-y-4 relative ${hasQuickResult ? 'border-green-200 bg-green-50/30' : 'border-slate-200'}`}>
            {hasQuickResult && (
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                  <span>تکمیل شده</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">آزمون سریع</h2>
              </div>
              <p className="text-sm text-slate-600">
                مناسب برای شروع و دریافت سیگنال اولیه از سبک کاری شما
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-slate-500" />
                <span className="text-slate-700">۳ دقیقه</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-700">۱۲ سوال</span>
              </div>

              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>۲–۳ برچسب کاری غالب</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>نمایش در پروفایل عمومی</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>رایگان</span>
                </li>
              </ul>
            </div>

            <Link href="/app/personality/quick">
              <Button
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {hasQuickResult ? 'انجام مجدد آزمون سریع' : 'شروع آزمون سریع'}
              </Button>
            </Link>

            {hasQuickResult && (
              <Link href="/app/profile">
                <Button variant="outline" size="sm" className="w-full">
                  مشاهده نتیجه در پروفایل
                </Button>
              </Link>
            )}
          </Card>

          {/* Full Test Card */}
          <Card className={`p-6 space-y-4 relative border-2 ${hasFullResult ? 'border-green-300 bg-green-50/30' : 'border-indigo-300 bg-indigo-50/30'}`}>
            {hasFullResult && (
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                  <span>تکمیل شده</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-6 w-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-900">آزمون جامع</h2>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                  پیشرفته
                </span>
              </div>
              <p className="text-sm text-slate-600">
                تحلیل دقیق‌تر و جامع‌تر برای تصمیم‌گیری شغلی
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-slate-500" />
                <span className="text-slate-700">۸–۱۰ دقیقه</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-700">۴۸ سوال</span>
              </div>

              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-0.5">✓</span>
                  <span>۳–۴ برچسب کاری با دقت بالاتر</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-0.5">✓</span>
                  <span>نمودار تحلیل سبک کاری</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-0.5">✓</span>
                  <span>توضیح شخصی‌سازی‌شده</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-0.5">✓</span>
                  <span>مناسب مصاحبه‌های شغلی</span>
                </li>
              </ul>
            </div>

            <Link href="/app/personality/full">
              <Button
                size="lg"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {hasFullResult ? 'انجام مجدد آزمون جامع' : 'شروع آزمون جامع'}
              </Button>
            </Link>

            {hasFullResult && (
              <Link href="/app/profile">
                <Button variant="outline" size="sm" className="w-full">
                  مشاهده نتیجه جامع
                </Button>
              </Link>
            )}
          </Card>
        </div>

        {/* Upsell Message */}
        {hasQuickResult && !hasFullResult && (
          <Card className="bg-indigo-50 border-indigo-200 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-slate-900">
                  می‌خواهید تحلیل دقیق‌تری از سبک کاری خود داشته باشید؟
                </h3>
                <p className="text-sm text-slate-600">
                  نسخه جامع این آزمون، تحلیل عمیق‌تری از سبک کاری شما ارائه می‌دهد و می‌تواند در مصاحبه‌های شغلی به شما کمک کند.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Back to Dashboard */}
        <div className="text-center">
          <Link href="/app">
            <Button variant="ghost">
              بازگشت به داشبورد
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
