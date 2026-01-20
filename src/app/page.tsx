import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PublicHeader from "@/components/layout/PublicHeader";
import { Calculator, Receipt, Shield, TrendingUp, FileCheck, ArrowLeft, CheckCircle2, Users, Target, User, Compass, BookOpen, MessageCircle, Clock, FileText, Star } from "lucide-react";
import { CAREER_PATHS, PATH_COLORS } from "@/lib/career-paths";
import { db } from "@/lib/db";
import { faqs } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

async function getFAQs() {
  try {
    // Get FAQs directly from database
    const activeFaqs = await db
      .select({
        category: faqs.category,
        question: faqs.question,
        answer: faqs.answer,
        order: faqs.order,
      })
      .from(faqs)
      .where(eq(faqs.isActive, true))
      .orderBy(asc(faqs.category), asc(faqs.order));

    // Group by category
    const grouped: Record<string, any[]> = {
      general: [],
      privacy: [],
      careers: [],
    };

    activeFaqs.forEach((faq) => {
      if (grouped[faq.category]) {
        grouped[faq.category].push({
          question: faq.question,
          answer: faq.answer,
        });
      }
    });

    // If we have data from DB, return it
    if (activeFaqs.length > 0) {
      return grouped;
    }
  } catch (error) {
    console.error("Error fetching FAQs from database:", error);
  }

  // Fallback to static data
  return {
    general: [
      {
        question: "آیا کاربرگ رایگان است؟",
        answer: "بله، تمام امکانات پایه کاربرگ رایگان است و نیازی به پرداخت ندارید."
      },
      {
        question: "چقدر زمان می‌برد تا پروفایلم کامل شود؟",
        answer: "تکمیل اطلاعات پایه فقط 5 دقیقه زمان می‌برد. تکمیل کامل مسیر یادگیری بسته به مسیری که انتخاب می‌کنید، 2 تا 6 ماه طول می‌کشد."
      }
    ],
    privacy: [
      {
        question: "اطلاعات من امن است؟",
        answer: "بله، اطلاعات شما کاملاً محرمانه است و تنها زمانی نمایش داده می‌شود که شما اجازه دهید."
      },
      {
        question: "آیا پروفایلم برای همه قابل مشاهده است؟",
        answer: "خیر، شما کنترل کامل دارید. می‌توانید پروفایل را خصوصی نگه دارید یا عمومی کنید."
      }
    ],
    careers: [
      {
        question: "چه مسیرهایی در کاربرگ وجود دارد؟",
        answer: "5 مسیر تخصصی: حسابداری، مالیات، بیمه، مالی شرکتی و حسابرسی."
      },
      {
        question: "آیا می‌توانم چند مسیر را همزمان دنبال کنم؟",
        answer: "بله، می‌توانید در چندین مسیر ثبت‌نام کنید و به تدریج آنها را تکمیل کنید."
      }
    ]
  };
}

export default async function LandingPage() {
  // Get featured paths (first 3)
  const featuredPaths = CAREER_PATHS.filter(p => p.isActive).slice(0, 3);

  // How It Works Steps
  const howItWorksSteps = [
    {
      Icon: User,
      title: "ساخت پروفایل",
      description: "تکمیل اطلاعات پایه در 5 دقیقه"
    },
    {
      Icon: Compass,
      title: "انتخاب مسیر",
      description: "انتخاب از 5 مسیر تخصصی مالی"
    },
    {
      Icon: BookOpen,
      title: "یادگیری و تمرین",
      description: "تکمیل Task‌ها و پاسخ به Q&A"
    },
    {
      Icon: FileCheck,
      title: "دریافت رزومه",
      description: "رزومه حرفه‌ای با اعتبار واقعی"
    }
  ];

  // Stats Data
  const stats = [
    { icon: "📊", value: "+1,200", label: "متخصص فعال" },
    { icon: "💼", value: "+350", label: "رزومه ساخته شده" },
    { icon: "🎯", value: "+2,500", label: "پاسخ تخصصی" },
    { icon: "⭐", value: "95%", label: "رضایت کاربران" }
  ];

  // Recent Questions
  const recentQuestions = [
    {
      title: "چطور می‌تونم Excel رو برای حسابداری صنعتی بهتر یاد بگیرم؟",
      category: "حسابداری",
      time: "5 دقیقه پیش",
      answersCount: 3
    },
    {
      title: "تفاوت مالیات بر ارزش افزوده و مالیات بر درآمد چیست؟",
      category: "مالیات",
      time: "15 دقیقه پیش",
      answersCount: 5
    },
    {
      title: "بهترین نرم‌افزار حسابداری برای کسب‌وکارهای کوچک؟",
      category: "نرم‌افزار",
      time: "1 ساعت پیش",
      answersCount: 2
    }
  ];

  // Get FAQ data from database (with fallback)
  const faqData = await getFAQs();

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section - Updated */}
          <section className="text-center mb-20 max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              پلتفرم رشد حرفه‌ای در حوزه مالی
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              مسیر حرفه‌ای شما در بازار کار مالی
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4 font-medium">
              نه فقط یک رزومه؛ یک مسیر رشد واقعی
            </p>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
              کاربرگ به شما کمک می‌کند مسیر شغلی‌تان را ببینید، مهارت‌ها را تمرین کنید و قدم‌به‌قدم آماده بازار کار شوید.
            </p>
            <div className="flex gap-4 justify-center flex-wrap items-center">
              <Button asChild size="lg" className="text-base px-12 py-6 h-auto shadow-lg hover:shadow-xl transition-shadow">
                <Link href="/auth">شروع مسیر حرفه‌ای</Link>
              </Button>
              <Link href="#career-paths" className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline">
                مشاهده مسیرها
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-8 flex items-center justify-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                رایگان
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                بدون نمایش عمومی اجباری
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                کنترل کامل روی اطلاعات
              </span>
            </p>
          </section>

          {/* How It Works Section - NEW */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">چطور کار می‌کند؟</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                در 4 گام ساده به مسیر حرفه‌ای خود برسید
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {howItWorksSteps.map((step, index) => (
                <Card key={index} className="relative border-2 hover:border-primary/50 transition-all">
                  <CardContent className="p-6 text-center">
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-base font-bold">
                      {index + 1}
                    </Badge>
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Free Tools Section - NEW */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                ابزارهای رایگان
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">ابزارهای کاربردی مالی</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                محاسبه‌گرهای رایگان برای کمک به تصمیم‌گیری‌های مالی شما
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Salary Calculator */}
              <Card className="border-2 hover:border-primary/50 transition-all group">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Calculator className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">ماشین حساب حقوق</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    محاسبه دقیق حقوق خالص با احتساب بیمه، مالیات و حق اولاد
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/utilities/salary-calculator">
                      شروع محاسبه
                      <ArrowLeft className="w-4 h-4 mr-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Tax Calculator */}
              <Card className="border-2 hover:border-primary/50 transition-all group">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Receipt className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">ماشین حساب مالیات</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    محاسبه دقیق مالیات حقوق به‌صورت پلکانی بر اساس قوانین ۱۴۰۳
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/utilities/tax-calculator">
                      شروع محاسبه
                      <ArrowLeft className="w-4 h-4 mr-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Loan Calculator */}
              <Card className="border-2 hover:border-primary/50 transition-all group">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">ماشین حساب وام</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    محاسبه قسط ماهانه، کل بهره و جدول بازپرداخت وام
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/utilities/loan-calculator">
                      شروع محاسبه
                      <ArrowLeft className="w-4 h-4 mr-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Career Paths Section - NEW */}
          <section id="career-paths" className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">مسیر شغلی خودت را پیدا کن</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                مسیرهای یادگیری ساختارمند برای رشد حرفه‌ای در حوزه‌های مختلف مالی
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {featuredPaths.map((path) => {
                const colors = PATH_COLORS[path.color] || PATH_COLORS.blue;
                const Icon = path.icon === "Calculator" ? Calculator :
                            path.icon === "Receipt" ? Receipt :
                            path.icon === "Shield" ? Shield :
                            path.icon === "TrendingUp" ? TrendingUp : FileCheck;

                return (
                  <Card key={path.id} className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50">
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-7 h-7 ${colors.text}`} />
                      </div>
                      <Badge variant="secondary" className="mb-3">
                        {path.estimatedMonths} ماه
                      </Badge>
                      <h3 className="text-xl font-bold mb-2">{path.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {path.subtitle}
                      </p>
                      <div className="flex items-center text-sm text-primary font-medium">
                        مشاهده جزئیات
                        <ArrowLeft className="w-4 h-4 mr-1 group-hover:mr-2 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/auth">
                  مشاهده همه مسیرها
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Link>
              </Button>
            </div>
          </section>

          {/* Stats Section - NEW */}
          <section className="mb-20 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/5 dark:to-primary/10 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">کاربرگ در یک نگاه</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                    {stat.icon} {stat.value}
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Live Activity Section - NEW */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">آخرین فعالیت‌های Q&A</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                جامعه کاربرگ به سؤالات واقعی پاسخ می‌دهند
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {recentQuestions.map((q, index) => (
                <Card key={index} className="hover:border-primary/50 transition-all">
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="mb-3">{q.category}</Badge>
                    <h3 className="font-semibold mb-3 line-clamp-2">{q.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {q.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {q.answersCount} پاسخ
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/auth">مشاهده همه سؤالات</Link>
              </Button>
            </div>
          </section>

          {/* Social Proof Section - NEW */}
          <section className="mb-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">متخصصان مالی در کاربرگ چه می‌کنند؟</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">پاسخ به مسائل واقعی</h4>
                  <p className="text-sm text-muted-foreground">کمک به حل چالش‌های روزمره حوزه مالی</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">تمرین مهارت‌های شغلی</h4>
                  <p className="text-sm text-muted-foreground">یادگیری عملی با مسیرهای ساختارمند</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">ساخت رزومه قابل ارائه</h4>
                  <p className="text-sm text-muted-foreground">پروفایل حرفه‌ای با اعتبار واقعی</p>
                </div>
              </div>
            </div>
            <div className="text-center mt-8">
              <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 px-6 py-3 rounded-full shadow-sm">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-semibold">بیش از ۱٬۲۰۰ متخصص مالی</span>
                <span className="text-muted-foreground">در مسیرهای شغلی کاربرگ فعال‌اند</span>
              </div>
            </div>
          </section>

          {/* Features - Updated Copy (Outcome محور) */}
          <section id="features" className="grid md:grid-cols-3 gap-6 mb-20">
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">شناخت مسیر مناسب شغلی</h3>
                <p className="text-muted-foreground leading-relaxed">
                  بدانید در کدام مسیر مالی رشد بهتری دارید و چه مهارت‌هایی نیاز دارید
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-green-200 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">نمایش حرفه‌ای توانمندی‌ها</h3>
                <p className="text-muted-foreground leading-relaxed">
                  رزومه‌ای که بر اساس فعالیت واقعی و مهارت‌های عملی شما ساخته می‌شود
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">ساخت هویت حرفه‌ای معتبر</h3>
                <p className="text-muted-foreground leading-relaxed">
                  پروفایلی که با مشارکت و رشد شما قوی‌تر می‌شود و اعتبار واقعی دارد
                </p>
              </CardContent>
            </Card>
          </section>

          {/* FAQ Section - NEW */}
          <section className="mb-20" dir="rtl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">سوالات متداول</h2>
            </div>

            <div className="max-w-4xl mx-auto">
              <Tabs defaultValue="general" className="w-full" dir="rtl">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="general">عمومی</TabsTrigger>
                  <TabsTrigger value="privacy">حریم خصوصی</TabsTrigger>
                  <TabsTrigger value="careers">مسیرهای شغلی</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  {faqData.general.map((faq, index) => (
                    <Card key={index}>
                      <CardContent className="p-6 text-right">
                        <h3 className="font-bold mb-2">{faq.question}</h3>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="privacy" className="space-y-4">
                  {faqData.privacy.map((faq, index) => (
                    <Card key={index}>
                      <CardContent className="p-6 text-right">
                        <h3 className="font-bold mb-2">{faq.question}</h3>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="careers" className="space-y-4">
                  {faqData.careers.map((faq, index) => (
                    <Card key={index}>
                      <CardContent className="p-6 text-right">
                        <h3 className="font-bold mb-2">{faq.question}</h3>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </section>

          {/* CTA Section - Updated */}
          <section className="text-center py-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border-2 border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">آماده‌ای مسیر شغلی‌ات را بسازی؟</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              ساخت پروفایل کمتر از ۵ دقیقه زمان می‌برد و بلافاصله به مسیرهای یادگیری دسترسی پیدا می‌کنی
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild size="lg" className="text-base px-10">
                <Link href="/auth">همین حالا شروع کن</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-10">
                <Link href="#career-paths">نگاهی به مسیرها بنداز</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                رایگان برای همیشه
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                بدون نیاز به کارت اعتباری
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                شروع فوری
              </span>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
