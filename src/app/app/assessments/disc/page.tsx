'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Check,
  ArrowLeft,
  Target,
  Users,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Briefcase,
  TrendingUp,
  Lightbulb,
  MessageSquare,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { discQuestions } from '@/lib/assessment/disc-questions';
import { calculateDISCResult } from '@/lib/assessment/disc-scoring';
import { getDISCStyleInfo, type DISCStyle } from '@/lib/assessment/disc-types';
import type { DISCAnswer, DISCDimension } from '@/lib/assessment/disc-types';
import { trackProfileEvent } from '@/lib/profileEvents';
import { generateDISCExplanation } from '@/lib/assessment/AIExplanationEngine';
import { generateDISCShareable } from '@/lib/export/ShareResultsEngine';
import { ShareCard } from '@/components/share/ShareButton';

type Step = 'intro' | 'questions' | 'result';

// Style configurations
const DISC_ICONS: Record<DISCStyle, typeof Target> = {
  'result-oriented': Target,
  'people-oriented': Users,
  'stable': CheckCircle2,
  'precise': Brain,
};

const DISC_COLORS: Record<DISCStyle, { bg: string; text: string; gradient: string }> = {
  'result-oriented': { bg: 'bg-red-100', text: 'text-red-700', gradient: 'from-red-50 to-orange-50' },
  'people-oriented': { bg: 'bg-yellow-100', text: 'text-yellow-700', gradient: 'from-yellow-50 to-amber-50' },
  'stable': { bg: 'bg-green-100', text: 'text-green-700', gradient: 'from-green-50 to-emerald-50' },
  'precise': { bg: 'bg-blue-100', text: 'text-blue-700', gradient: 'from-blue-50 to-indigo-50' },
};

const DISC_DIM_LABELS: Record<DISCDimension, string> = {
  D: 'نتیجه‌محور',
  I: 'ارتباط‌محور',
  S: 'پایدار',
  C: 'دقیق',
};

export default function DISCAssessmentPage() {
  const [step, setStep] = useState<Step>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<DISCAnswer[]>([]);
  const [result, setResult] = useState<ReturnType<typeof calculateDISCResult> | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

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

  const handleSaveToProfile = async () => {
    if (!result) return;

    try {
      // Save to localStorage (for backward compatibility)
      const profileKey = 'karbarg:onboarding:profile:v1';
      const existingData = localStorage.getItem(profileKey);
      const profile = existingData ? JSON.parse(existingData) : {};

      if (!profile.assessments) {
        profile.assessments = {};
      }

      profile.assessments.disc = {
        primary: result.primary,
        secondary: result.secondary,
        scores: result.scores,
        completedAt: result.completedAt,
      };

      localStorage.setItem(profileKey, JSON.stringify(profile));

      // Save to database
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'disc',
          primaryResult: result.primary,
          secondaryResult: result.secondary,
          scores: result.scores,
        }),
      });

      if (!response.ok) {
        console.warn('Could not save to database, but localStorage is saved');
      }

      trackProfileEvent('assessment_completed', {
        type: 'disc',
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

  const progress = ((currentQuestion + 1) / discQuestions.length) * 100;

  // INTRO SCREEN
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4" dir="rtl">
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
    const question = discQuestions[currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4" dir="rtl">
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

  // RESULT SCREEN - Full AI Explanation
  if (step === 'result' && result) {
    const primaryInfo = getDISCStyleInfo(result.primary);
    const explanation = generateDISCExplanation({
      primary: result.primary,
      secondary: result.secondary,
      scores: result.scores,
      completedAt: result.completedAt,
    });
    const shareable = generateDISCShareable({
      primary: result.primary,
      secondary: result.secondary,
      scores: result.scores,
      completedAt: result.completedAt,
    });

    const colors = DISC_COLORS[result.primary];
    const Icon = DISC_ICONS[result.primary];

    // Calculate score percentages
    const totalScore = Object.values(result.scores).reduce((a, b) => a + b, 0);
    const scorePercentages = Object.entries(result.scores)
      .map(([dim, score]) => ({
        dimension: dim as DISCDimension,
        score,
        percentage: totalScore > 0 ? Math.round((score / totalScore) * 100) : 0,
      }))
      .sort((a, b) => b.score - a.score);

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
                  <Badge className="mb-2" variant="secondary">سبک رفتاری حرفه‌ای DISC</Badge>
                  <h1 className={`text-3xl md:text-4xl font-bold ${colors.text} mb-2`}>
                    {primaryInfo.label}
                  </h1>
                  {result.secondary && (
                    <p className="text-slate-600">
                      با گرایش ثانویه به <span className="font-medium">{getDISCStyleInfo(result.secondary).label}</span>
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

          {/* Score Visualization */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-slate-500" />
                توزیع امتیازات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {scorePercentages.map(({ dimension, percentage }) => (
                <div key={dimension} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{DISC_DIM_LABELS[dimension]}</span>
                    <span className="text-muted-foreground">{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ))}
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
          <Card className="shadow-sm border-r-4 border-purple-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
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
                className="flex-1 bg-purple-600 hover:bg-purple-700"
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
          <Card className="shadow-sm bg-green-50 border-green-200">
            <CardContent className="p-4">
              <p className="text-sm text-green-900 leading-relaxed text-center flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                برای تصویر کامل‌تر، <Link href="/app/assessments/holland" className="font-medium underline">آزمون مسیر شغلی (هالند)</Link> را نیز انجام دهید.
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 pb-4">
            این نتیجه بر اساس پاسخ‌های شما در آزمون DISC محاسبه شده است.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
