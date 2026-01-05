'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Compass, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { hollandQuestions } from '@/lib/assessment/holland-questions';
import { calculateHollandResult, generateHollandExplanation } from '@/lib/assessment/holland-scoring';
import { getHollandCareerFitInfo } from '@/lib/assessment/holland-types';
import type { HollandAnswer, HollandDimension } from '@/lib/assessment/holland-types';

type Step = 'intro' | 'questions' | 'result';

export default function HollandAssessmentPage() {
  const [step, setStep] = useState<Step>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<HollandAnswer[]>([]);
  const [result, setResult] = useState<ReturnType<typeof calculateHollandResult> | null>(null);

  const handleAnswer = (dimension: HollandDimension) => {
    const question = hollandQuestions[currentQuestion];

    const newAnswer: HollandAnswer = {
      questionId: question.id,
      selectedDimension: dimension,
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < hollandQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const assessmentResult = calculateHollandResult(newAnswers);
      setResult(assessmentResult);
      setStep('result');
    }
  };

  const handleSaveToProfile = () => {
    if (!result) return;

    try {
      const profileKey = 'karbarg:onboarding:profile:v1';
      const existingData = localStorage.getItem(profileKey);
      const profile = existingData ? JSON.parse(existingData) : {};

      // Initialize assessments object if it doesn't exist
      if (!profile.assessments) {
        profile.assessments = {};
      }

      // Save Holland result
      profile.assessments.holland = {
        primary: result.primary,
        secondary: result.secondary,
        completedAt: result.completedAt,
      };

      localStorage.setItem(profileKey, JSON.stringify(profile));
      alert('نتیجه آزمون مسیر شغلی با موفقیت به پروفایل شما اضافه شد!');

      setTimeout(() => {
        window.location.href = '/app/assessments';
      }, 1500);
    } catch (error) {
      console.error('Error saving to profile:', error);
      alert('خطا در ذخیره‌سازی نتیجه');
    }
  };

  const handleRestart = () => {
    setStep('intro');
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
  };

  const progress = ((currentQuestion + 1) / hollandQuestions.length) * 100;

  if (step === 'intro') {
    return (
      <div className="h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-2xl w-full p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <Compass className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                آزمون مسیر شغلی (هالند)
              </h1>
              <p className="text-slate-600">شناخت مسیر شغلی مناسب شما</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-900 text-sm">
                این آزمون به شما کمک می‌کند مسیرهای شغلی متناسب با علایق کاری‌تان را بهتر بشناسید.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="font-semibold text-slate-900 mb-1">تعداد سوالات</div>
                <div className="text-2xl font-bold text-green-600">18</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="font-semibold text-slate-900 mb-1">مدت زمان</div>
                <div className="text-2xl font-bold text-green-600">~4 دقیقه</div>
              </div>
            </div>

            <div className="space-y-2 text-right text-sm text-slate-600">
              <p>✓ هیچ پاسخی درست یا غلط نیست</p>
              <p>✓ براساس علایق واقعی خود پاسخ دهید</p>
              <p>✓ نتیجه در پروفایل شما ذخیره می‌شود</p>
            </div>

            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => setStep('questions')}
              >
                شروع آزمون
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>

              <Link href="/app/assessments">
                <Button variant="ghost" className="w-full">
                  بازگشت به آزمون‌ها
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (step === 'questions') {
    const question = hollandQuestions[currentQuestion];

    return (
      <div className="h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-2xl w-full p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>سوال {currentQuestion + 1} از {hollandQuestions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="text-center space-y-4 py-8">
              <h2 className="text-xl font-semibold text-slate-900 leading-relaxed">
                {question.text}
              </h2>
            </div>

            <div className="space-y-3">
              {(Object.keys(question.options) as HollandDimension[]).map((dimension) => (
                <Button
                  key={dimension}
                  variant="outline"
                  className="w-full h-auto py-4 px-6 text-right justify-start hover:bg-green-50 hover:border-green-300 transition-colors"
                  onClick={() => handleAnswer(dimension)}
                >
                  <span className="text-base flex-1">{question.options[dimension]}</span>
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (step === 'result' && result) {
    const primaryInfo = getHollandCareerFitInfo(result.primary);
    const secondaryInfo = result.secondary ? getHollandCareerFitInfo(result.secondary) : null;
    const explanation = generateHollandExplanation(result.primary, result.secondary);

    return (
      <div className="h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-slate-900">
                نتیجه آزمون مسیر شغلی شما
              </h1>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-900 text-sm text-center">
                این نتیجه به‌صورت خلاصه در پروفایل عمومی شما نمایش داده می‌شود.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">مسیر شغلی مناسب شما:</h3>
              <div className="flex flex-wrap gap-2">
                <Badge className="px-4 py-2 bg-green-100 text-green-700 text-base">
                  {primaryInfo.label}
                </Badge>
                {secondaryInfo && (
                  <Badge className="px-4 py-2 bg-emerald-100 text-emerald-700 text-base">
                    {secondaryInfo.label}
                  </Badge>
                )}
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-700 leading-relaxed">{explanation}</p>
            </div>

            {secondaryInfo && (
              <div className="bg-slate-50 rounded-lg p-4 border-r-4 border-emerald-500">
                <div className="font-semibold text-slate-900 mb-2">مسیر ثانویه: {secondaryInfo.label}</div>
                <p className="text-sm text-slate-600">{secondaryInfo.description}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900 text-sm leading-relaxed">
                💡 نکته: ترکیب این آزمون با نتایج آزمون‌های سبک کاری (MBTI) و رفتار حرفه‌ای (DISC) تصویر کامل‌تری از نقاط قوت شما ارائه می‌دهد.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleSaveToProfile}
              >
                افزودن نتیجه به پروفایل
              </Button>
              <Button variant="outline" onClick={handleRestart}>
                شروع مجدد
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
