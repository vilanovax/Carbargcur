'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Compass, ArrowLeft, ArrowRight, Briefcase, Target, Shield } from 'lucide-react';
import { hollandFullQuestions } from '@/lib/assessment/holland-full-questions';
import { calculateHollandFullResult } from '@/lib/assessment/holland-full-scoring';
import { getHollandCareerFitInfo } from '@/lib/assessment/holland-types';
import type { HollandAnswer, HollandDimension } from '@/lib/assessment/holland-types';
import { trackProfileEvent } from '@/lib/profileEvents';

type Step = 'intro' | 'questions' | 'result';

export default function HollandFullAssessmentPage() {
  const [step, setStep] = useState<Step>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<HollandAnswer[]>([]);
  const [result, setResult] = useState<ReturnType<typeof calculateHollandFullResult> | null>(null);

  const handleAnswer = (dimension: HollandDimension) => {
    const question = hollandFullQuestions[currentQuestion];
    const newAnswer: HollandAnswer = {
      questionId: question.id,
      selectedDimension: dimension,
    };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < hollandFullQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const assessmentResult = calculateHollandFullResult(newAnswers);
      setResult(assessmentResult);
      setStep('result');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswers(answers.slice(0, -1));
    }
  };

  const handleSaveToProfile = () => {
    if (!result) return;

    const profileKey = 'karbarg:onboarding:profile:v1';
    const existingData = localStorage.getItem(profileKey);
    const profile = existingData ? JSON.parse(existingData) : {};

    if (!profile.assessments) {
      profile.assessments = {};
    }

    profile.assessments.hollandFull = {
      primary: result.primary,
      secondary: result.secondary,
      tertiary: result.tertiary,
      cluster: result.cluster,
      roles: result.roles,
      completedAt: result.completedAt,
    };

    localStorage.setItem(profileKey, JSON.stringify(profile));

    // Track assessment completion event
    trackProfileEvent('assessment_completed', {
      type: 'holland_full',
      primary: result.primary,
      secondary: result.secondary,
      cluster: result.cluster,
    });

    alert('نتیجه آزمون جامع مسیر شغلی با موفقیت به پروفایل شما اضافه شد!');

    setTimeout(() => {
      window.location.href = '/app/assessments';
    }, 500);
  };

  const progress = ((currentQuestion + 1) / hollandFullQuestions.length) * 100;

  // Intro Screen
  if (step === 'intro') {
    return (
      <div className="max-w-3xl mx-auto space-y-6" dir="rtl">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="text-center space-y-4 pb-4">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center">
              <Compass className="h-10 w-10 text-green-600" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl md:text-3xl">آزمون جامع مسیر شغلی</CardTitle>
              <p className="text-sm text-muted-foreground">
                بر اساس مدل هالند (Holland Career Model)
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg p-5 space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                این نسخه جامع چه تفاوتی دارد؟
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                این نسخه جامع تناسب شما با مسیرهای شغلی مختلف را با دقت بالاتری بررسی می‌کند و علاوه بر شناسایی علایق شغلی، <strong>نقش‌های شغلی مشخصی</strong> را برای شما پیشنهاد می‌دهد.
              </p>
            </div>

            {/* What you get */}
            <div className="bg-white rounded-lg p-5 space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-green-600" />
                خروجی آزمون:
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>تحلیل دقیق علایق شغلی شما (۳ بُعد غالب)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>خوشه شغلی مناسب برای شما</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span><strong>پیشنهاد نقش‌های شغلی مشخص</strong> در حوزه مالی و حسابداری</span>
                </li>
              </ul>
            </div>

            {/* Privacy */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <Shield className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-900">حریم خصوصی شما محفوظ است</p>
                <p className="text-xs text-amber-700">
                  این تحلیل فقط برای شما قابل مشاهده است و در پروفایل عمومی به‌صورت خلاصه نمایش داده می‌شود.
                </p>
              </div>
            </div>

            {/* Test info */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <div className="text-2xl font-bold text-green-600">۳۶</div>
                <div className="text-xs text-muted-foreground mt-1">سوال ترجیحی</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <div className="text-2xl font-bold text-green-600">۸-۱۰</div>
                <div className="text-xs text-muted-foreground mt-1">دقیقه زمان</div>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3 pt-2">
              <Button
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => setStep('questions')}
              >
                شروع آزمون جامع
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>

              <Link href="/app/assessments">
                <Button variant="ghost" className="w-full">
                  بازگشت به آزمون‌ها
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Questions Screen
  if (step === 'questions') {
    const question = hollandFullQuestions[currentQuestion];

    return (
      <div className="max-w-3xl mx-auto space-y-4" dir="rtl">
        {/* Progress Header */}
        <Card className="border-green-200">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">سوال {currentQuestion + 1} از {hollandFullQuestions.length}</span>
              <span className="text-muted-foreground">{Math.round(progress)}٪</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl leading-relaxed">{question.text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(Object.entries(question.options) as [HollandDimension, string][]).map(([dimension, text]) => (
              <Button
                key={dimension}
                variant="outline"
                className="w-full h-auto py-4 px-5 text-right justify-start hover:bg-green-50 hover:border-green-300 transition-colors"
                onClick={() => handleAnswer(dimension)}
              >
                <span className="text-sm leading-relaxed">{text}</span>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex-1"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            سوال قبل
          </Button>
          <Link href="/app/assessments" className="flex-1">
            <Button variant="ghost" className="w-full">
              انصراف
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Result Screen
  if (step === 'result' && result) {
    const primaryInfo = getHollandCareerFitInfo(result.primary);
    const secondaryInfo = getHollandCareerFitInfo(result.secondary);
    const tertiaryInfo = getHollandCareerFitInfo(result.tertiary);

    return (
      <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
            <Compass className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">نتیجه آزمون جامع مسیر شغلی شما</h1>
          <p className="text-sm text-muted-foreground">
            این پیشنهادها الزام‌آور نیستند و صرفاً برای راهنمایی شغلی ارائه شده‌اند.
          </p>
        </div>

        {/* Career Fit Badges (Top 3) */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              علایق شغلی غالب شما
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge className="text-base py-2 px-4 bg-green-600 hover:bg-green-700">
                ۱. {primaryInfo.label}
              </Badge>
              <Badge variant="outline" className="text-base py-2 px-4 border-green-600 text-green-700 bg-white">
                ۲. {secondaryInfo.label}
              </Badge>
              <Badge variant="outline" className="text-base py-2 px-4 border-green-400 text-green-600 bg-white">
                ۳. {tertiaryInfo.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Career Cluster */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-600" />
              خوشه شغلی مناسب برای شما
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <h3 className="font-bold text-lg text-green-900 mb-2">{result.cluster}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {result.clusterDescription}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Job Roles */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-600" />
              نقش‌های شغلی پیشنهادی برای شما
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.roles.map((role, index) => (
                <li key={index} className="flex items-start gap-3 bg-white rounded-lg p-4 border border-green-100">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-800">{role}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Note */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-5">
            <p className="text-sm text-blue-900 leading-relaxed">
              <strong>نکته:</strong> این پیشنهادها بر اساس علایق کاری شما ارائه شده‌اند. برای تصویر کامل‌تر، حتماً آزمون‌های <strong>سبک کاری (MBTI)</strong> و <strong>رفتار حرفه‌ای (DISC)</strong> را نیز تکمیل کنید.
            </p>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={handleSaveToProfile}
          >
            ذخیره نتیجه در پروفایل
            <ArrowLeft className="mr-2 h-5 w-5" />
          </Button>

          <Link href="/app/assessments">
            <Button variant="outline" className="w-full">
              بازگشت به آزمون‌ها
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
