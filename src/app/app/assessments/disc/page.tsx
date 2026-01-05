'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { discQuestions } from '@/lib/assessment/disc-questions';
import { calculateDISCResult } from '@/lib/assessment/disc-scoring';
import { getDISCStyleInfo } from '@/lib/assessment/disc-types';
import type { DISCAnswer, DISCDimension } from '@/lib/assessment/disc-types';

type Step = 'intro' | 'questions' | 'result';

export default function DISCAssessmentPage() {
  const [step, setStep] = useState<Step>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<DISCAnswer[]>([]);
  const [result, setResult] = useState<ReturnType<typeof calculateDISCResult> | null>(null);

  const handleAnswer = (dimension: DISCDimension) => {
    const question = discQuestions[currentQuestion];

    const newAnswer: DISCAnswer = {
      questionId: question.id,
      selectedDimension: dimension,
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < discQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const assessmentResult = calculateDISCResult(newAnswers);
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

      // Save DISC result (include scores for combined analysis)
      profile.assessments.disc = {
        primary: result.primary,
        secondary: result.secondary,
        scores: result.scores,
        completedAt: result.completedAt,
      };

      localStorage.setItem(profileKey, JSON.stringify(profile));
      alert('نتیجه آزمون رفتار حرفه‌ای با موفقیت به پروفایل شما اضافه شد!');

      setTimeout(() => {
        window.location.href = '/app';
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

  const progress = ((currentQuestion + 1) / discQuestions.length) * 100;

  if (step === 'intro') {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-2xl w-full p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                <Brain className="h-10 w-10 text-purple-600" />
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                آزمون رفتار حرفه‌ای (DISC)
              </h1>
              <p className="text-slate-600">شناخت رفتار کاری شما</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-900 text-sm">
                این آزمون رفتار کاری شما را در محیط حرفه‌ای نشان می‌دهد.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="font-semibold text-slate-900 mb-1">تعداد سوالات</div>
                <div className="text-2xl font-bold text-purple-600">16</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="font-semibold text-slate-900 mb-1">مدت زمان</div>
                <div className="text-2xl font-bold text-purple-600">~4 دقیقه</div>
              </div>
            </div>

            <div className="space-y-2 text-right text-sm text-slate-600">
              <p>✓ هیچ پاسخی درست یا غلط نیست</p>
              <p>✓ براساس رفتار معمول خود پاسخ دهید</p>
              <p>✓ نتیجه در پروفایل شما ذخیره می‌شود</p>
            </div>

            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => setStep('questions')}
              >
                شروع آزمون
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>

              <Link href="/app">
                <Button variant="ghost" className="w-full">
                  بازگشت به داشبورد
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (step === 'questions') {
    const question = discQuestions[currentQuestion];

    return (
      <div className="h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-2xl w-full p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>سوال {currentQuestion + 1} از {discQuestions.length}</span>
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
              {(Object.keys(question.options) as DISCDimension[]).map((dimension) => (
                <Button
                  key={dimension}
                  variant="outline"
                  className="w-full h-auto py-4 px-6 text-right justify-start hover:bg-purple-50 hover:border-purple-300 transition-colors"
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
    const primaryInfo = getDISCStyleInfo(result.primary);
    const secondaryInfo = result.secondary ? getDISCStyleInfo(result.secondary) : null;

    return (
      <div className="h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-slate-900">
                نتیجه آزمون رفتار حرفه‌ای شما
              </h1>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-900 text-sm text-center">
                این نتیجه به‌صورت خلاصه در پروفایل عمومی شما نمایش داده می‌شود.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">سبک رفتاری غالب شما:</h3>
              <div className="flex flex-wrap gap-2">
                <Badge className="px-4 py-2 bg-purple-100 text-purple-700 text-base">
                  {primaryInfo.label}
                </Badge>
                {secondaryInfo && (
                  <Badge className="px-4 py-2 bg-pink-100 text-pink-700 text-base">
                    {secondaryInfo.label}
                  </Badge>
                )}
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-700 leading-relaxed">{primaryInfo.fullDescription}</p>
            </div>

            {secondaryInfo && (
              <div className="bg-slate-50 rounded-lg p-4 border-r-4 border-pink-500">
                <div className="font-semibold text-slate-900 mb-2">سبک ثانویه: {secondaryInfo.label}</div>
                <p className="text-sm text-slate-600">{secondaryInfo.description}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700"
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
