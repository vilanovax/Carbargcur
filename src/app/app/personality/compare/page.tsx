'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Target, Clock, CheckCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { loadFromStorage } from '@/lib/onboarding';

export default function AssessmentComparePage() {
  const [hasQuickResult, setHasQuickResult] = useState(false);

  useEffect(() => {
    const profile = loadFromStorage();
    setHasQuickResult(!!profile.personality?.quick);
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-5xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            آزمون سبک کاری حرفه‌ای
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            نسخه مناسب خود را انتخاب کنید.
          </p>
        </div>

        {/* Contextual Message */}
        {hasQuickResult && (
          <Card className="bg-blue-50 border-blue-200 p-4">
            <div className="flex items-center gap-2 text-blue-900 text-sm">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <p>
                شما نسخه سریع را انجام داده‌اید. در صورت تمایل می‌توانید تحلیل جامع‌تری دریافت کنید.
              </p>
            </div>
          </Card>
        )}

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Assessment Card */}
          <ComparisonCard
            badge="رایگان"
            badgeColor="bg-green-100 text-green-700"
            icon={<Zap className="h-8 w-8 text-blue-600" />}
            iconBg="bg-blue-100"
            title="نسخه سریع"
            duration="۳ دقیقه"
            description="برای شروع و آشنایی با سبک کاری شما"
            features={[
              '۱۲ سؤال',
              'حدود ۳ دقیقه',
              'نمایش نتیجه در پروفایل',
            ]}
            ctaText="شروع آزمون سریع"
            ctaHref="/app/personality/quick"
            ctaColor="bg-blue-600 hover:bg-blue-700"
          />

          {/* Full Assessment Card */}
          <ComparisonCard
            badge="پیشرفته"
            badgeColor="bg-indigo-100 text-indigo-700"
            icon={<Target className="h-8 w-8 text-indigo-600" />}
            iconBg="bg-indigo-100"
            title="نسخه جامع"
            duration="۱۰ دقیقه"
            description="تحلیل دقیق‌تر برای تصمیم‌گیری شغلی"
            features={[
              '۴۸ سؤال',
              'حدود ۱۰ دقیقه',
              'نمودار سبک کاری (خصوصی)',
              'نمایش Badge ارزیابی جامع',
            ]}
            ctaText="شروع آزمون جامع"
            ctaHref="/app/personality/full"
            ctaColor="bg-indigo-600 hover:bg-indigo-700"
            helper="مناسب زمانی که می‌خواهید پروفایل حرفه‌ای‌تری داشته باشید."
            highlighted
          />
        </div>

        {/* Trust Section */}
        <Card className="bg-slate-50 border-slate-200 p-4">
          <p className="text-slate-700 text-sm text-center">
            می‌توانید هر زمان بین نسخه‌ها جابه‌جا شوید.
          </p>
        </Card>

        {/* Back to Assessments */}
        <div className="text-center">
          <Link href="/app/assessments">
            <Button variant="ghost" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              بازگشت به آزمون‌ها
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

interface ComparisonCardProps {
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  duration: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  ctaColor: string;
  helper?: string;
  highlighted?: boolean;
}

function ComparisonCard({
  badge,
  badgeColor,
  icon,
  iconBg,
  title,
  duration,
  description,
  features,
  ctaText,
  ctaHref,
  ctaColor,
  helper,
  highlighted = false,
}: ComparisonCardProps) {
  return (
    <Card
      className={`p-6 space-y-5 transition-all ${
        highlighted
          ? 'border-2 border-indigo-300 bg-indigo-50/30 shadow-lg'
          : 'border-slate-200'
      }`}
    >
      {/* Badge */}
      <div className="flex items-center justify-between">
        <Badge className={`${badgeColor} px-3 py-1 text-sm font-medium`}>
          {badge}
        </Badge>
      </div>

      {/* Icon + Title */}
      <div className="space-y-3">
        <div className={`w-16 h-16 ${iconBg} rounded-full flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <div className="flex items-center gap-2 text-slate-600 text-sm mt-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-600 text-sm">{description}</p>

      {/* Features */}
      <div className="bg-white rounded-lg p-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
              <span className={`mt-0.5 ${highlighted ? 'text-indigo-600' : 'text-blue-600'}`}>
                ✓
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="space-y-2">
        <Link href={ctaHref}>
          <Button size="lg" className={`w-full ${ctaColor}`}>
            {ctaText}
          </Button>
        </Link>
        {helper && (
          <p className="text-xs text-slate-500 text-center px-2">{helper}</p>
        )}
      </div>
    </Card>
  );
}
