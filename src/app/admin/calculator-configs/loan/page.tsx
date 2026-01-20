"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, Save, Calculator, AlertCircle } from "lucide-react";

interface LoanConfig {
  version: string;
  year: number;
  calculation_method: string;
  default_interest_rate: number;
  interest_rate_range: {
    min: number;
    max: number;
  };
  max_term_months: number;
  description: string;
}

interface ConfigData {
  id?: string;
  calculatorType: string;
  configYear: number;
  config: LoanConfig;
  isActive: boolean;
  effectiveFrom: string | null;
  effectiveUntil: string | null;
  notes: string;
}

const defaultConfig: LoanConfig = {
  version: "1.0",
  year: 1403,
  calculation_method: "amortization",
  default_interest_rate: 18,
  interest_rate_range: {
    min: 0,
    max: 30,
  },
  max_term_months: 360,
  description: "محاسبه بر اساس فرمول Amortization",
};

export default function AdminLoanCalculatorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const configId = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState<ConfigData>({
    calculatorType: "loan",
    configYear: new Date().getFullYear(),
    config: defaultConfig,
    isActive: true,
    effectiveFrom: null,
    effectiveUntil: null,
    notes: "",
  });

  const [previewPrincipal, setPreviewPrincipal] = useState<number>(100000000);
  const [previewRate, setPreviewRate] = useState<number>(18);
  const [previewMonths, setPreviewMonths] = useState<number>(60);
  const [previewResult, setPreviewResult] = useState<any>(null);

  useEffect(() => {
    if (configId) {
      loadConfig(configId);
    } else {
      setIsLoading(false);
    }
  }, [configId]);

  const loadConfig = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/admin/calculator-configs/loan?id=${id}`
      );

      if (response.status === 403) {
        router.push("/auth?redirectTo=/admin/calculator-configs/loan");
        return;
      }

      if (!response.ok) {
        throw new Error("خطا در دریافت تنظیمات");
      }

      const data = await response.json();
      if (data.configs && data.configs.length > 0) {
        const config = data.configs[0];
        setFormData({
          id: config.id,
          calculatorType: config.calculatorType,
          configYear: config.configYear,
          config: config.config,
          isActive: config.isActive,
          effectiveFrom: config.effectiveFrom,
          effectiveUntil: config.effectiveUntil,
          notes: config.notes || "",
        });
      }
    } catch (err: any) {
      console.error("Load config error:", err);
      setError("خطا در دریافت تنظیمات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const url = configId
        ? `/api/admin/calculator-configs/loan`
        : `/api/admin/calculator-configs`;

      const method = configId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در ذخیره تنظیمات");
      }

      setSuccess("تنظیمات با موفقیت ذخیره شد");
      setTimeout(() => {
        router.push("/admin/calculator-configs");
      }, 1500);
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "خطا در ذخیره تنظیمات");
    } finally {
      setIsSaving(false);
    }
  };

  const calculatePreview = () => {
    const principal = previewPrincipal;
    const annualRate = previewRate;
    const months = previewMonths;

    const monthlyRate = annualRate / 100 / 12;

    let monthlyPayment: number;
    if (monthlyRate === 0) {
      monthlyPayment = principal / months;
    } else {
      monthlyPayment =
        (principal *
          (monthlyRate * Math.pow(1 + monthlyRate, months))) /
        (Math.pow(1 + monthlyRate, months) - 1);
    }

    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - principal;

    setPreviewResult({
      monthlyPayment,
      totalPayment,
      totalInterest,
      principal,
    });
  };

  useEffect(() => {
    calculatePreview();
  }, [previewPrincipal, previewRate, previewMonths]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/calculator-configs">
            <Button variant="ghost" size="sm">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {configId ? "ویرایش" : "ایجاد"} تنظیمات ماشین‌حساب وام
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              نرخ بهره، روش محاسبه و محدودیت‌های وام
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-4">
            <p className="text-sm text-green-800 dark:text-green-300">
              {success}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات پایه</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="configYear">سال</Label>
                  <Input
                    id="configYear"
                    type="number"
                    value={formData.configYear}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        configYear: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">نسخه</Label>
                  <Input
                    id="version"
                    value={formData.config.version}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          version: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">وضعیت فعال</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">یادداشت‌ها</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="توضیحات اضافی درباره این تنظیمات..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>تنظیمات وام</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calculationMethod">روش محاسبه</Label>
                <Input
                  id="calculationMethod"
                  value={formData.config.calculation_method}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        calculation_method: e.target.value,
                      },
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  مثال: amortization, simple_interest
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultRate">نرخ بهره پیش‌فرض (%)</Label>
                <Input
                  id="defaultRate"
                  type="number"
                  step="0.1"
                  value={formData.config.default_interest_rate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        default_interest_rate: parseFloat(e.target.value),
                      },
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minRate">حداقل نرخ بهره (%)</Label>
                  <Input
                    id="minRate"
                    type="number"
                    step="0.1"
                    value={formData.config.interest_rate_range.min}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          interest_rate_range: {
                            ...formData.config.interest_rate_range,
                            min: parseFloat(e.target.value),
                          },
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxRate">حداکثر نرخ بهره (%)</Label>
                  <Input
                    id="maxRate"
                    type="number"
                    step="0.1"
                    value={formData.config.interest_rate_range.max}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          interest_rate_range: {
                            ...formData.config.interest_rate_range,
                            max: parseFloat(e.target.value),
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTerm">حداکثر مدت وام (ماه)</Label>
                <Input
                  id="maxTerm"
                  type="number"
                  value={formData.config.max_term_months}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        max_term_months: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">توضیحات</Label>
                <Textarea
                  id="description"
                  value={formData.config.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        description: e.target.value,
                      },
                    })
                  }
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              <Save className="w-4 h-4 ml-2" />
              {isSaving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
            </Button>
            <Link href="/admin/calculator-configs">
              <Button variant="outline">انصراف</Button>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  پیش‌نمایش محاسبه
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="previewPrincipal">مبلغ وام (تومان)</Label>
                  <Input
                    id="previewPrincipal"
                    type="number"
                    value={previewPrincipal}
                    onChange={(e) =>
                      setPreviewPrincipal(parseInt(e.target.value) || 0)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previewRate">نرخ بهره سالانه (%)</Label>
                  <Input
                    id="previewRate"
                    type="number"
                    step="0.1"
                    value={previewRate}
                    onChange={(e) =>
                      setPreviewRate(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previewMonths">مدت وام (ماه)</Label>
                  <Input
                    id="previewMonths"
                    type="number"
                    value={previewMonths}
                    onChange={(e) =>
                      setPreviewMonths(parseInt(e.target.value) || 1)
                    }
                  />
                </div>

                {previewResult && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        مبلغ وام:
                      </span>
                      <span className="font-medium">
                        {previewResult.principal.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        قسط ماهانه:
                      </span>
                      <span className="font-medium text-blue-600">
                        {Math.round(previewResult.monthlyPayment).toLocaleString(
                          "fa-IR"
                        )}{" "}
                        تومان
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        کل بهره:
                      </span>
                      <span className="font-medium text-red-600">
                        {Math.round(previewResult.totalInterest).toLocaleString(
                          "fa-IR"
                        )}{" "}
                        تومان
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-3 border-t">
                      <span>کل پرداختی:</span>
                      <span className="text-primary">
                        {Math.round(previewResult.totalPayment).toLocaleString(
                          "fa-IR"
                        )}{" "}
                        تومان
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
