'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { fullQuestions as questions } from '@/lib/assessment/full-questions';
import { traitInfo } from '@/lib/assessment/questions';
import { calculateFullResult as calculateResult, generateFullSummary as generateSummary } from '@/lib/assessment/full-scoring';
import type { Answer } from '@/lib/assessment/types';
import { trackProfileEvent } from '@/lib/profileEvents';

type Step = 'intro' | 'questions' | 'result';

export default function PersonalityAssessment() {
  const [step, setStep] = useState<Step>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [result, setResult] = useState<ReturnType<typeof calculateResult> | null>(null);

  const handleAnswer = (option: 'a' | 'b') => {
    const question = questions[currentQuestion];
    const trait = question.options[option].trait;

    const newAnswer: Answer = {
      questionId: question.id,
      selectedOption: option,
      trait,
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const assessmentResult = calculateResult(newAnswers);
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

      // Save as quick test result in new structure
      profile.personality = {
        ...profile.personality, // Preserve any existing quick test results
        full: {
          styles: result.styles,
          completedAt: result.completedAt,
        },
      };

      localStorage.setItem(profileKey, JSON.stringify(profile));

      // Track assessment completion event
      trackProfileEvent('assessment_completed', {
        type: 'mbti_full',
        code: result.type,
        styles: result.styles,
      });

      alert('نتیجه آزمون جامع با موفقیت به پروفایل شما اضافه شد! این نتیجه جامع در پروفایل عمومی شما با برچسب "ارزیابی جامع" نمایش داده می‌شود.');

      // Redirect to main personality page after short delay
      setTimeout(() => {
        window.location.href = '/app/personality';
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

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (step === 'intro') {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-2xl w-full p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                <Brain className="h-10 w-10 text-indigo-600" />
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                آزمون جامع سبک کاری
              </h1>
              <p className="text-slate-600">بر پایه MBTI</p>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-indigo-900 text-sm">
                این آزمون ترجیحات کاری شما را نشان می‌دهد، نه شخصیت شما را.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="font-semibold text-slate-900 mb-1">تعداد سوالات</div>
                <div className="text-2xl font-bold text-indigo-600">48</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="font-semibold text-slate-900 mb-1">مدت زمان</div>
                <div className="text-2xl font-bold text-indigo-600">~10 دقیقه</div>
              </div>
            </div>

            <div className="space-y-2 text-right text-sm text-slate-600">
              <p>✓ هیچ پاسخی درست یا غلط نیست</p>
              <p>✓ براساس تجربیات کاری خود پاسخ دهید</p>
              <p>✓ نتیجه در پروفایل شما ذخیره می‌شود</p>
            </div>

            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setStep('questions')}
              >
                شروع آزمون
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>

              <Link href="/app/personality">
                <Button
                  variant="ghost"
                  className="w-full"
                >
                  <ArrowRight className="ml-2 h-4 w-4" />
                  بازگشت به انتخاب آزمون
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (step === 'questions') {
    const question = questions[currentQuestion];

    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-2xl w-full p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>سوال {currentQuestion + 1} از {questions.length}</span>
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
              <Button
                variant="outline"
                className="w-full h-auto py-4 px-6 text-right justify-start hover:bg-indigo-50 hover:border-indigo-300"
                onClick={() => handleAnswer('a')}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-3 h-3 rounded-full bg-indigo-600 opacity-0 group-hover:opacity-100"></div>
                  </div>
                  <span className="text-base flex-1">{question.options.a.text}</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full h-auto py-4 px-6 text-right justify-start hover:bg-indigo-50 hover:border-indigo-300"
                onClick={() => handleAnswer('b')}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-3 h-3 rounded-full bg-indigo-600 opacity-0 group-hover:opacity-100"></div>
                  </div>
                  <span className="text-base flex-1">{question.options.b.text}</span>
                </div>
              </Button>
            </div>

            {currentQuestion > 0 && (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setCurrentQuestion(currentQuestion - 1);
                  setAnswers(answers.slice(0, -1));
                }}
              >
                <ArrowRight className="ml-2 h-4 w-4" />
                بازگشت به سوال قبل
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (step === 'result' && result) {
    const summary = generateSummary(result.styles);

    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-slate-900">
                نتیجه آزمون سبک کاری شما
              </h1>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-indigo-900 text-sm text-center">
                این نتیجه به‌صورت خلاصه در پروفایل عمومی شما نمایش داده می‌شود.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">سبک‌های کاری غالب شما:</h3>
              <div className="flex flex-wrap gap-2">
                {result.styles.map((style) => (
                  <Badge
                    key={style}
                    className="px-4 py-2 bg-indigo-100 text-indigo-700 text-base"
                  >
                    {traitInfo[style]?.title || style}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-700 leading-relaxed">{summary}</p>
            </div>

            <div className="space-y-4 pt-4">
              {result.styles.map((style) => {
                const info = traitInfo[style];
                if (!info) return null;
                return (
                  <div key={style} className="border-r-4 border-indigo-500 bg-white p-4 rounded">
                    <div className="font-semibold text-slate-900 mb-1">{info.title}</div>
                    <div className="text-sm text-slate-600">{info.description}</div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                onClick={handleSaveToProfile}
              >
                افزودن نتیجه به پروفایل
              </Button>
              <Button
                variant="outline"
                onClick={handleRestart}
              >
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
