"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  Edit2,
  Eye,
  EyeOff,
  DollarSign,
  Receipt,
  Banknote,
  Calendar,
} from "lucide-react";

interface CalculatorConfig {
  id: string;
  calculatorType: string;
  configYear: number;
  config: any;
  isActive: boolean;
  effectiveFrom: string | null;
  effectiveUntil: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const calculatorTypeLabels: Record<string, string> = {
  salary: "ماشین‌حساب حقوق و دستمزد",
  tax: "ماشین‌حساب مالیات",
  loan: "ماشین‌حساب وام",
};

const calculatorTypeIcons: Record<string, any> = {
  salary: DollarSign,
  tax: Receipt,
  loan: Banknote,
};

const calculatorTypeColors: Record<string, string> = {
  salary: "from-green-500 to-emerald-600",
  tax: "from-purple-500 to-pink-600",
  loan: "from-blue-500 to-indigo-600",
};

export default function AdminCalculatorConfigsPage() {
  const router = useRouter();
  const [configs, setConfigs] = useState<CalculatorConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/calculator-configs");

      if (response.status === 403) {
        router.push("/auth?redirectTo=/admin/calculator-configs");
        return;
      }

      if (!response.ok) {
        throw new Error("خطا در دریافت تنظیمات");
      }

      const data = await response.json();
      setConfigs(data.configs || []);
    } catch (err: any) {
      console.error("Load configs error:", err);
      setError("خطا در دریافت لیست تنظیمات");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleConfigActive = async (
    configId: string,
    type: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch(`/api/admin/calculator-configs/${type}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: configId, isActive: !currentStatus }),
      });

      if (response.ok) {
        setConfigs(
          configs.map((config) =>
            config.id === configId
              ? { ...config, isActive: !currentStatus }
              : config
          )
        );
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  // Group configs by calculator type
  const groupedConfigs = configs.reduce((acc, config) => {
    if (!acc[config.calculatorType]) {
      acc[config.calculatorType] = [];
    }
    acc[config.calculatorType].push(config);
    return acc;
  }, {} as Record<string, CalculatorConfig[]>);

  // Sort configs within each type by year (descending) and updatedAt
  Object.keys(groupedConfigs).forEach((type) => {
    groupedConfigs[type].sort((a, b) => {
      if (b.configYear !== a.configYear) {
        return b.configYear - a.configYear;
      }
      return (
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const calculatorTypes = ["salary", "tax", "loan"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            مدیریت تنظیمات ماشین‌حساب‌ها
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            ویرایش فرمول‌ها و پارامترهای محاسباتی
          </p>
        </div>
      </div>

      {/* Calculator Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {calculatorTypes.map((type) => {
          const typeConfigs = groupedConfigs[type] || [];
          const activeConfig = typeConfigs.find((c) => c.isActive);
          const Icon = calculatorTypeIcons[type];
          const gradientColor = calculatorTypeColors[type];

          return (
            <Card
              key={type}
              className="border-2 hover:border-primary/50 transition-all"
            >
              <CardContent className="p-6">
                {/* Icon and Title */}
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${gradientColor} rounded-xl flex items-center justify-center mb-4`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {calculatorTypeLabels[type]}
                </h3>

                {/* Active Config Info */}
                {activeConfig ? (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        سال:{" "}
                        <span className="font-semibold">
                          {activeConfig.configYear.toLocaleString("fa-IR")}
                        </span>
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      آخرین به‌روزرسانی:{" "}
                      {new Date(activeConfig.updatedAt).toLocaleDateString(
                        "fa-IR"
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                        <Eye className="w-3 h-3" />
                        فعال
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      هیچ تنظیمات فعالی وجود ندارد
                    </p>
                    {typeConfigs.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {typeConfigs.length.toLocaleString("fa-IR")} تنظیمات
                        غیرفعال موجود است
                      </p>
                    )}
                  </div>
                )}

                {/* All Configs for this Type */}
                {typeConfigs.length > 0 && (
                  <div className="space-y-2 mb-4 pt-4 border-t">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      تمام تنظیمات ({typeConfigs.length.toLocaleString("fa-IR")}
                      ):
                    </p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {typeConfigs.map((config) => (
                        <div
                          key={config.id}
                          className="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              سال {config.configYear.toLocaleString("fa-IR")}
                            </span>
                            {config.isActive ? (
                              <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                                فعال
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                غیرفعال
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                toggleConfigActive(
                                  config.id,
                                  type,
                                  config.isActive
                                )
                              }
                              className="h-6 w-6 p-0"
                              title={
                                config.isActive ? "غیرفعال کردن" : "فعال کردن"
                              }
                            >
                              {config.isActive ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </Button>
                            <Link
                              href={`/admin/calculator-configs/${type}?id=${config.id}`}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Link href={`/admin/calculator-configs/${type}`}>
                  <Button variant="outline" className="w-full" size="sm">
                    {typeConfigs.length > 0 ? (
                      <>
                        <Edit2 className="w-4 h-4 ml-2" />
                        ویرایش و مدیریت
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4 ml-2" />
                        ایجاد تنظیمات
                      </>
                    )}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Box */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">نکات مهم:</p>
              <ul className="space-y-1 text-xs">
                <li>
                  • فقط یک تنظیمات فعال برای هر ماشین‌حساب و هر سال می‌تواند وجود
                  داشته باشد
                </li>
                <li>
                  • تنظیمات فعال در صفحات عمومی ماشین‌حساب‌ها استفاده می‌شود
                </li>
                <li>
                  • در صورت عدم وجود تنظیمات فعال، مقادیر پیش‌فرض استفاده می‌شود
                </li>
                <li>
                  • برای تغییرات قانونی سالانه، تنظیمات جدید با سال جدید ایجاد کنید
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
