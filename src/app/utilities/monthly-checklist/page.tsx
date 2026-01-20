"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import PublicHeader from "@/components/layout/PublicHeader";
import {
  CheckCircle2,
  Circle,
  BookOpen,
  ArrowLeft,
  Download,
  Share2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: "accounting" | "payroll" | "tax" | "insurance";
  level: "beginner" | "intermediate" | "advanced";
  learningPath?: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // حسابداری عمومی
  {
    id: "review-transactions",
    title: "بررسی و تطبیق تمام تراکنش‌های ماه",
    description: "مطابقت دادن اسناد بانکی با دفاتر حسابداری",
    category: "accounting",
    level: "beginner",
    learningPath: "/learning/accounting/basics",
  },
  {
    id: "record-documents",
    title: "ثبت اسناد حسابداری",
    description: "ثبت تمام فاکتورها، رسیدها و اسناد مالی",
    category: "accounting",
    level: "beginner",
    learningPath: "/learning/accounting/documents",
  },
  {
    id: "bank-reconciliation",
    title: "تطبیق بانک",
    description: "مقایسه صورت حساب بانک با دفتر کل",
    category: "accounting",
    level: "intermediate",
    learningPath: "/learning/accounting/reconciliation",
  },
  {
    id: "review-receivables",
    title: "بررسی حساب‌های دریافتنی",
    description: "پیگیری مطالبات و بدهکاران",
    category: "accounting",
    level: "intermediate",
  },
  {
    id: "review-payables",
    title: "بررسی حساب‌های پرداختنی",
    description: "بررسی بدهی‌ها و زمان‌بندی پرداخت‌ها",
    category: "accounting",
    level: "intermediate",
  },

  // حقوق و دستمزد
  {
    id: "calculate-salaries",
    title: "محاسبه حقوق و دستمزد کارکنان",
    description: "محاسبه حقوق، اضافه‌کاری، کسورات و مزایا",
    category: "payroll",
    level: "beginner",
    learningPath: "/utilities/salary-calculator",
  },
  {
    id: "prepare-payslips",
    title: "تهیه فیش حقوقی",
    description: "صدور فیش حقوقی برای تمام کارکنان",
    category: "payroll",
    level: "beginner",
  },
  {
    id: "overtime-calculation",
    title: "محاسبه اضافه‌کاری",
    description: "ثبت و محاسبه ساعات اضافه‌کاری",
    category: "payroll",
    level: "beginner",
    learningPath: "/utilities/overtime-calculator",
  },

  // بیمه
  {
    id: "insurance-calculation",
    title: "محاسبه حق بیمه",
    description: "محاسبه سهم کارمند و کارفرما",
    category: "insurance",
    level: "beginner",
    learningPath: "/utilities/insurance-calculator",
  },
  {
    id: "insurance-list",
    title: "تهیه لیست بیمه",
    description: "آماده‌سازی لیست برای ارسال به تأمین اجتماعی",
    category: "insurance",
    level: "intermediate",
  },
  {
    id: "submit-insurance",
    title: "ارسال بیمه به سازمان تأمین اجتماعی",
    description: "ارسال لیست و پرداخت حق بیمه",
    category: "insurance",
    level: "intermediate",
  },

  // مالیات
  {
    id: "tax-calculation",
    title: "محاسبه مالیات حقوق",
    description: "محاسبه مالیات ماهانه کارکنان",
    category: "tax",
    level: "beginner",
    learningPath: "/utilities/tax-calculator",
  },
  {
    id: "vat-calculation",
    title: "محاسبه مالیات بر ارزش افزوده",
    description: "محاسبه و ثبت مالیات فروش و خرید",
    category: "tax",
    level: "intermediate",
  },
  {
    id: "prepare-tax-report",
    title: "تهیه گزارش مالیاتی",
    description: "آماده‌سازی اظهارنامه مالیاتی ماهانه",
    category: "tax",
    level: "advanced",
  },

  // گزارش‌گیری
  {
    id: "income-statement",
    title: "تهیه صورت سود و زیان",
    description: "گزارش درآمدها و هزینه‌های ماه",
    category: "accounting",
    level: "advanced",
  },
  {
    id: "balance-sheet",
    title: "تهیه ترازنامه",
    description: "گزارش دارایی‌ها و بدهی‌ها",
    category: "accounting",
    level: "advanced",
  },
  {
    id: "cash-flow",
    title: "تهیه گزارش جریان وجوه نقد",
    description: "بررسی ورود و خروج نقدینگی",
    category: "accounting",
    level: "advanced",
  },
];

const CATEGORY_LABELS = {
  accounting: "حسابداری",
  payroll: "حقوق و دستمزد",
  tax: "مالیات",
  insurance: "بیمه",
};

const CATEGORY_COLORS = {
  accounting: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  payroll: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  tax: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  insurance: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};

export default function MonthlyChecklistPage() {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const toggleItem = (itemId: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId);
    } else {
      newCompleted.add(itemId);
    }
    setCompletedItems(newCompleted);
  };

  const resetChecklist = () => {
    if (confirm("آیا مطمئنید که می‌خواهید چک‌لیست را بازنشانی کنید؟")) {
      setCompletedItems(new Set());
    }
  };

  const filteredItems = selectedCategory
    ? CHECKLIST_ITEMS.filter((item) => item.category === selectedCategory)
    : CHECKLIST_ITEMS;

  const progress = (completedItems.size / CHECKLIST_ITEMS.length) * 100;

  const categoryCounts = {
    accounting: CHECKLIST_ITEMS.filter((i) => i.category === "accounting").length,
    payroll: CHECKLIST_ITEMS.filter((i) => i.category === "payroll").length,
    tax: CHECKLIST_ITEMS.filter((i) => i.category === "tax").length,
    insurance: CHECKLIST_ITEMS.filter((i) => i.category === "insurance").length,
  };

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-gradient-to-br from-green-50/50 to-teal-50/50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                ابزار یادگیری
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                چک‌لیست پایان ماه حسابداری
              </h1>
              <h2 className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
                راهنمای گام‌به‌گام برای تکمیل وظایف مالی پایان ماه
                <br />
                مناسب برای حسابداران و کمک‌حسابداران
              </h2>
              <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                این چک‌لیست به شما کمک می‌کند تا هیچ کاری را فراموش نکنید و تمام
                وظایف مالی پایان ماه را به‌طور منظم انجام دهید.
              </p>
            </div>

            {/* Progress Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">پیشرفت شما</h3>
                    <p className="text-sm text-muted-foreground">
                      {completedItems.size} از {CHECKLIST_ITEMS.length} مورد تکمیل
                      شده
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetChecklist}
                    >
                      <RefreshCw className="w-4 h-4 ml-2" />
                      بازنشانی
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 ml-2" />
                      دانلود PDF
                    </Button>
                  </div>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {Math.round(progress)}% تکمیل شده
                </p>
              </CardContent>
            </Card>

            {/* Category Filter */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium ml-3">فیلتر دسته‌بندی:</span>
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    همه ({CHECKLIST_ITEMS.length})
                  </Button>
                  {Object.entries(categoryCounts).map(([cat, count]) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]} ({count})
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Checklist Items */}
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const isCompleted = completedItems.has(item.id);

                return (
                  <Card
                    key={item.id}
                    className={`transition-all cursor-pointer hover:shadow-md ${
                      isCompleted ? "bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-800" : ""
                    }`}
                    onClick={() => toggleItem(item.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <div className="flex-shrink-0 mt-1">
                          {isCompleted ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-400" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3
                              className={`font-semibold ${
                                isCompleted
                                  ? "line-through text-gray-500"
                                  : ""
                              }`}
                            >
                              {item.title}
                            </h3>
                            <Badge
                              className={`${
                                CATEGORY_COLORS[item.category]
                              } text-xs flex-shrink-0`}
                            >
                              {CATEGORY_LABELS[item.category]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {item.description}
                          </p>

                          {/* Learning Link */}
                          {item.learningPath && !isCompleted && (
                            <Link
                              href={item.learningPath}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-2 text-xs text-primary hover:underline"
                            >
                              <BookOpen className="w-3 h-3" />
                              یاد بگیرید چگونه این کار را انجام دهید
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* CTA Card */}
            {progress === 100 && (
              <Card className="mt-6 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 border-green-200 dark:border-green-800">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    🎉 تبریک! تمام موارد تکمیل شد
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    شما تمام وظایف پایان ماه را با موفقیت انجام دادید
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button asChild>
                      <Link href="/learning">
                        مشاهده مسیرهای یادگیری
                        <ArrowLeft className="w-4 h-4 mr-2" />
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={resetChecklist}>
                      شروع ماه جدید
                      <RefreshCw className="w-4 h-4 mr-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-6 mt-12">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-3">
                    این چک‌لیست برای چه کسانی است؟
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>حسابداران تازه‌کار</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>کمک‌حسابداران</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>مدیران مالی کسب‌وکارهای کوچک</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>دانشجویان حسابداری</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-3">نکات مهم</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>
                        چک‌لیست را هر ماه یک بار مرور و تکمیل کنید
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>
                        موارد مهم‌تر را در اولویت قرار دهید
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>
                        برای یادگیری هر مورد، روی لینک‌ها کلیک کنید
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>
                        پیشرفت خود را ذخیره کنید (با ثبت‌نام)
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
