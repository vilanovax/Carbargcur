'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Users, CheckCircle2, ArrowLeft, Clock, Compass } from 'lucide-react';
import { loadFromStorage, type OnboardingProfile } from '@/lib/onboarding';
import { getDISCStyleInfo } from '@/lib/assessment/disc-types';
import { getHollandCareerFitInfo } from '@/lib/assessment/holland-types';
import { traitInfo } from '@/lib/assessment/questions';

export default function AssessmentsPage() {
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);

  useEffect(() => {
    const data = loadFromStorage();
    setProfile(data);
  }, []);

  const hasQuickMBTI = !!profile?.personality?.quick;
  const hasFullMBTI = !!profile?.personality?.full;
  const hasDISC = !!profile?.assessments?.disc;
  const hasHolland = !!profile?.assessments?.holland;
  const hasHollandFull = !!profile?.assessments?.hollandFull;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">آزمون‌های شخصیت‌شناسی</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          با شناخت بهتر خود، مسیر شغلی مناسب‌تری انتخاب کنید
        </p>
      </div>

      {/* Results Summary */}
      {(hasQuickMBTI || hasFullMBTI || hasDISC || hasHolland) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              نتایج آزمون‌های شما
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {/* MBTI Results */}
              {(hasQuickMBTI || hasFullMBTI) && (
                <Card className="bg-blue-50/50 border-blue-200">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Brain className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-semibold text-sm">سبک کاری (MBTI)</span>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {hasFullMBTI ? 'جامع' : 'سریع'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {(hasFullMBTI ? profile.personality?.full?.styles : profile.personality?.quick?.styles)?.map((style) => (
                          <Badge key={style} variant="outline" className="border-blue-300 text-blue-700 bg-white">
                            {traitInfo[style].label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* DISC Results */}
              {hasDISC && (
                <Card className="bg-purple-50/50 border-purple-200">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Users className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="font-semibold text-sm">رفتار حرفه‌ای (DISC)</span>
                      </div>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        تکمیل شده
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="border-purple-300 text-purple-700 bg-white">
                          {getDISCStyleInfo(profile.assessments!.disc!.primary).label}
                        </Badge>
                        {profile.assessments!.disc!.secondary && (
                          <Badge variant="outline" className="border-purple-300 text-purple-700 bg-white">
                            {getDISCStyleInfo(profile.assessments!.disc!.secondary).label}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Holland Career Fit Results */}
              {hasHolland && (
                <Card className="bg-green-50/50 border-green-200">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Compass className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="font-semibold text-sm">مسیر شغلی (هالند)</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        تکمیل شده
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="border-green-300 text-green-700 bg-white">
                          {getHollandCareerFitInfo(profile.assessments!.holland!.primary).label}
                        </Badge>
                        {profile.assessments!.holland!.secondary && (
                          <Badge variant="outline" className="border-green-300 text-green-700 bg-white">
                            {getHollandCareerFitInfo(profile.assessments!.holland!.secondary).label}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Assessments */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">آزمون‌های موجود</h2>

        {/* MBTI Work Style Assessment */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold">آزمون سبک کاری</h3>
                      <Badge className="bg-blue-100 text-blue-700">MBTI-Based</Badge>
                      {(hasQuickMBTI || hasFullMBTI) && (
                        <Badge variant="outline" className="border-green-500 text-green-700">
                          <CheckCircle2 className="h-3 w-3 ml-1" />
                          تکمیل شده
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      این آزمون به شما کمک می‌کند تا بفهمید در محیط کار چگونه فکر می‌کنید، تصمیم می‌گیرید و با دیگران همکاری می‌کنید. مبتنی بر چارچوب علمی MBTI ولی با تمرکز روی محیط کاری.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>نسخه سریع: ۳ دقیقه</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>نسخه جامع: ۱۰ دقیقه</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:w-40 shrink-0">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/app/personality">
                    {hasQuickMBTI || hasFullMBTI ? 'مشاهده / ویرایش' : 'شروع آزمون'}
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DISC Professional Behavior Assessment */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold">آزمون رفتار حرفه‌ای</h3>
                      <Badge className="bg-purple-100 text-purple-700">DISC</Badge>
                      {hasDISC && (
                        <Badge variant="outline" className="border-green-500 text-green-700">
                          <CheckCircle2 className="h-3 w-3 ml-1" />
                          تکمیل شده
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      این آزمون نشان می‌دهد در محیط کار چگونه رفتار می‌کنید. آیا نتیجه‌گرا هستید؟ ارتباط‌محور؟ پایدار؟ یا دقیق؟ مکمل آزمون سبک کاری برای درک کامل‌تر از خودتان.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>۴ دقیقه</span>
                      </div>
                      <span>16 سوال موقعیتی</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:w-40 shrink-0">
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                  <Link href="/app/assessments/disc">
                    {hasDISC ? 'مشاهده نتیجه' : 'شروع آزمون'}
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Holland Career Fit Assessment - Quick */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <Compass className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold">آزمون مسیر شغلی (سریع)</h3>
                      <Badge className="bg-green-100 text-green-700">Holland</Badge>
                      {hasHolland && (
                        <Badge variant="outline" className="border-green-500 text-green-700">
                          <CheckCircle2 className="h-3 w-3 ml-1" />
                          تکمیل شده
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      این آزمون به شما کمک می‌کند بفهمید در چه نوع مشاغلی موفق‌تر خواهید بود. آیا عملی هستید؟ تحلیلی؟ خلاق؟ مدیریتی؟ با شناخت مسیر شغلی خود، تصمیمات بهتری بگیرید.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>۴ دقیقه</span>
                      </div>
                      <span>18 سوال ترجیحی</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:w-40 shrink-0">
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link href="/app/assessments/holland">
                    {hasHolland ? 'مشاهده نتیجه' : 'شروع آزمون'}
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Holland Career Fit Assessment - Comprehensive */}
        <Card className="hover:shadow-md transition-shadow border-2 border-green-200 bg-gradient-to-br from-green-50/30 to-emerald-50/30">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <Compass className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold">آزمون جامع مسیر شغلی</h3>
                      <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">جامع</Badge>
                      <Badge className="bg-amber-100 text-amber-700 border-amber-300">پیشنهاد ویژه</Badge>
                      {hasHollandFull && (
                        <Badge variant="outline" className="border-green-500 text-green-700">
                          <CheckCircle2 className="h-3 w-3 ml-1" />
                          تکمیل شده
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <strong>نسخه حرفه‌ای:</strong> علاوه بر شناسایی علایق شغلی، این آزمون <strong>نقش‌های شغلی مشخصی</strong> در حوزه مالی و حسابداری را برای شما پیشنهاد می‌دهد. با تحلیل عمیق‌تر، بهترین مسیر شغلی را بیابید.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>۸-۱۰ دقیقه</span>
                      </div>
                      <span>36 سوال تخصصی</span>
                      <span className="text-green-600 font-medium">+ پیشنهاد شغلی</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:w-40 shrink-0">
                <Button asChild className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md">
                  <Link href="/app/assessments/holland-full">
                    {hasHollandFull ? 'مشاهده نتیجه' : 'شروع آزمون جامع'}
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">چرا این آزمون‌ها مهم هستند؟</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>کارفرمایان می‌توانند سبک کاری، رفتار حرفه‌ای و مسیر شغلی شما را ببینند</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>به شما کمک می‌کند شغل‌هایی را انتخاب کنید که با شخصیت و علایق‌تان همخوانی دارند</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>ترکیب MBTI، DISC و هالند تصویر کاملی از نقاط قوت و مسیر شغلی مناسب شما ارائه می‌دهد</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <div className="text-center text-xs text-muted-foreground p-4 bg-muted/30 rounded-lg">
        نتایج آزمون‌ها فقط در صورت تمایل شما در پروفایل عمومی نمایش داده می‌شوند.
        <br />
        شما کنترل کامل روی اطلاعات خود دارید.
      </div>
    </div>
  );
}
