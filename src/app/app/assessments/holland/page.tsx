'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Compass,
  Check,
  ArrowLeft,
  Target,
  Users,
  Brain,
  Briefcase,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { hollandQuestions } from '@/lib/assessment/holland-questions';
import { calculateHollandResult } from '@/lib/assessment/holland-scoring';
import { getHollandCareerFitInfo, type HollandCareerFit } from '@/lib/assessment/holland-types';
import type { HollandAnswer, HollandDimension } from '@/lib/assessment/holland-types';
import { trackProfileEvent } from '@/lib/profileEvents';
import { generateHollandExplanation } from '@/lib/assessment/AIExplanationEngine';
import { generateHollandShareable } from '@/lib/export/ShareResultsEngine';
import { ShareCard } from '@/components/share/ShareButton';

type Step = 'intro' | 'questions' | 'result';

// Style configurations
const HOLLAND_ICONS: Record<HollandCareerFit, typeof Target> = {
  'practical': Target,
  'analytical': Brain,
  'creative': Sparkles,
  'social': Users,
  'enterprising': TrendingUp,
  'conventional': Briefcase,
};

const HOLLAND_COLORS: Record<HollandCareerFit, { bg: string; text: string; gradient: string }> = {
  'practical': { bg: 'bg-orange-100', text: 'text-orange-700', gradient: 'from-orange-50 to-amber-50' },
  'analytical': { bg: 'bg-indigo-100', text: 'text-indigo-700', gradient: 'from-indigo-50 to-purple-50' },
  'creative': { bg: 'bg-pink-100', text: 'text-pink-700', gradient: 'from-pink-50 to-rose-50' },
  'social': { bg: 'bg-teal-100', text: 'text-teal-700', gradient: 'from-teal-50 to-cyan-50' },
  'enterprising': { bg: 'bg-amber-100', text: 'text-amber-700', gradient: 'from-amber-50 to-yellow-50' },
  'conventional': { bg: 'bg-slate-100', text: 'text-slate-700', gradient: 'from-slate-50 to-gray-50' },
};

export default function HollandAssessmentPage() {
  const [step, setStep] = useState<Step>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<HollandAnswer[]>([]);
  const [result, setResult] = useState<ReturnType<typeof calculateHollandResult> | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

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

      if (!profile.assessments) {
        profile.assessments = {};
      }

      profile.assessments.holland = {
        primary: result.primary,
        secondary: result.secondary,
        completedAt: result.completedAt,
      };

      localStorage.setItem(profileKey, JSON.stringify(profile));

      trackProfileEvent('assessment_completed', {
        type: 'holland',
        primary: result.primary,
        secondary: result.secondary,
      });

      setIsSaved(true);
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
    setIsSaved(false);
    setExpandedSections([]);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const progress = ((currentQuestion + 1) / hollandQuestions.length) * 100;

  // INTRO SCREEN
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4" dir="rtl">
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

  // QUESTIONS SCREEN
  if (step === 'questions') {
    const question = hollandQuestions[currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4" dir="rtl">
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

  // RESULT SCREEN - Full AI Explanation
  if (step === 'result' && result) {
    const primaryInfo = getHollandCareerFitInfo(result.primary);
    const explanation = generateHollandExplanation({
      primary: result.primary,
      secondary: result.secondary,
      completedAt: result.completedAt,
    });
    const shareable = generateHollandShareable({
      primary: result.primary,
      secondary: result.secondary,
      completedAt: result.completedAt,
    });

    const colors = HOLLAND_COLORS[result.primary];
    const Icon = HOLLAND_ICONS[result.primary];

    return (
      <div className={`min-h-screen bg-gradient-to-br ${colors.gradient} p-4 md:p-6`} dir="rtl">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Hero Card */}
          <Card className="shadow-lg overflow-hidden">
            <div className={`${colors.bg} p-6 md:p-8`}>
              <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-right">
                <div className={`w-24 h-24 rounded-2xl ${colors.bg} border-4 border-white/50 flex items-center justify-center shadow-lg`}>
                  <Icon className={`w-12 h-12 ${colors.text}`} />
                </div>
                <div className="flex-1">
                  <Badge className="mb-2" variant="secondary">مسیر شغلی هالند (RIASEC)</Badge>
                  <h1 className={`text-3xl md:text-4xl font-bold ${colors.text} mb-2`}>
                    {primaryInfo.label}
                  </h1>
                  {result.secondary && (
                    <p className="text-slate-600">
                      با گرایش ثانویه به <span className="font-medium">{getHollandCareerFitInfo(result.secondary).label}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <CardContent className="p-6 md:p-8">
              <p className="text-lg text-slate-700 leading-relaxed">
                {explanation.summary}
              </p>
            </CardContent>
          </Card>

          {/* Expandable Sections */}
          {explanation.sections.map((section, index) => (
            <Card key={index} className="shadow-sm">
              <button
                className="w-full p-4 flex items-center justify-between text-right hover:bg-slate-50 transition-colors"
                onClick={() => toggleSection(`section-${index}`)}
              >
                <span className="font-semibold text-slate-900">{section.title}</span>
                {expandedSections.includes(`section-${index}`) ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>
              {expandedSections.includes(`section-${index}`) && (
                <CardContent className="pt-0 pb-4 px-4">
                  <p className="text-slate-600 leading-relaxed">{section.content}</p>
                  {section.highlights && section.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {section.highlights.map((h, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {h}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}

          {/* Team Dynamics */}
          <Card className="shadow-sm border-r-4 border-teal-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-500" />
                شما در تیم
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-green-600 font-medium mb-1">نقطه قوت</p>
                  <p className="text-sm text-green-900">{explanation.teamDynamics.strength}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <p className="text-xs text-amber-600 font-medium mb-1">چالش احتمالی</p>
                  <p className="text-sm text-amber-900">{explanation.teamDynamics.challenge}</p>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  نکته عملی
                </p>
                <p className="text-sm text-blue-900">{explanation.teamDynamics.tip}</p>
              </div>
            </CardContent>
          </Card>

          {/* Career Suggestions */}
          <Card className="shadow-sm border-r-4 border-emerald-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-500" />
                نقش‌های پیشنهادی
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {explanation.careerSuggestions.map((career, i) => (
                  <div
                    key={i}
                    className={`rounded-lg p-4 ${
                      career.fit === 'high' ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900">{career.role}</span>
                      {career.fit === 'high' && (
                        <Badge className="text-[10px] bg-emerald-100 text-emerald-700">تناسب بالا</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{career.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Development Areas */}
          <Card className="shadow-sm border-r-4 border-indigo-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                فرصت‌های رشد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {explanation.developmentAreas.map((area, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    {area}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* For Employers */}
          <Card className="shadow-sm bg-slate-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-slate-500" />
                برای کارفرما
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 leading-relaxed">
                {explanation.forEmployers}
              </p>
            </CardContent>
          </Card>

          {/* Share Card */}
          <ShareCard shareable={shareable} />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {!isSaved ? (
              <Button
                size="lg"
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleSaveToProfile}
              >
                <CheckCircle2 className="ml-2 h-5 w-5" />
                ذخیره در پروفایل
              </Button>
            ) : (
              <Button size="lg" className="flex-1 bg-green-600" disabled>
                <Check className="ml-2 h-5 w-5" />
                ذخیره شد!
              </Button>
            )}
            <Button variant="outline" size="lg" asChild>
              <Link href="/app">
                بازگشت به داشبورد
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" onClick={handleRestart}>
              آزمون مجدد
            </Button>
          </div>

          {/* Suggestion */}
          <Card className="shadow-sm bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <p className="text-sm text-purple-900 leading-relaxed text-center flex items-center justify-center gap-2">
                <Brain className="w-4 h-4" />
                برای تصویر کامل‌تر، <Link href="/app/assessments/disc" className="font-medium underline">آزمون رفتار حرفه‌ای (DISC)</Link> را نیز انجام دهید.
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 pb-4">
            این نتیجه بر اساس پاسخ‌های شما در آزمون هالند محاسبه شده است.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
