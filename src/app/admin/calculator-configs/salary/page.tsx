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
import {
  ArrowRight,
  Save,
  Plus,
  Trash2,
  Calculator,
  AlertCircle,
} from "lucide-react";

interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
  label: string;
}

interface SalaryConfig {
  version: string;
  year: number;
  insurance: {
    employee_rate: number;
    description: string;
  };
  child_allowance: {
    amount_per_child: number;
    max_children: number;
    description: string;
  };
  overtime: {
    base_hours: number;
    rate_multiplier: number;
    description: string;
  };
  tax_brackets: TaxBracket[];
}

interface ConfigData {
  id?: string;
  calculatorType: string;
  configYear: number;
  config: SalaryConfig;
  isActive: boolean;
  effectiveFrom: string | null;
  effectiveUntil: string | null;
  notes: string;
}

const defaultConfig: SalaryConfig = {
  version: "1.0",
  year: 1403,
  insurance: {
    employee_rate: 7,
    description: "نرخ بیمه سهم کارمند",
  },
  child_allowance: {
    amount_per_child: 110000,
    max_children: 3,
    description: "حق اولاد به ازای هر فرزند",
  },
  overtime: {
    base_hours: 220,
    rate_multiplier: 1.4,
    description: "محاسبه اضافه‌کاری",
  },
  tax_brackets: [
    { min: 0, max: 10000000, rate: 0, label: "تا ۱۰ میلیون - معاف" },
    { min: 10000000, max: 20000000, rate: 0.1, label: "۱۰ تا ۲۰ میلیون - ۱۰٪" },
    { min: 20000000, max: 40000000, rate: 0.15, label: "۲۰ تا ۴۰ میلیون - ۱۵٪" },
    { min: 40000000, max: null, rate: 0.2, label: "بالای ۴۰ میلیون - ۲۰٪" },
  ],
};

export default function AdminSalaryCalculatorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const configId = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState<ConfigData>({
    calculatorType: "salary",
    configYear: new Date().getFullYear(),
    config: defaultConfig,
    isActive: true,
    effectiveFrom: null,
    effectiveUntil: null,
    notes: "",
  });

  // Preview calculation state
  const [previewSalary, setPreviewSalary] = useState<number>(25000000);
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
        `/api/admin/calculator-configs/salary?id=${id}`
      );

      if (response.status === 403) {
        router.push("/auth?redirectTo=/admin/calculator-configs/salary");
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
        ? `/api/admin/calculator-configs/salary`
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

  const addTaxBracket = () => {
    setFormData({
      ...formData,
      config: {
        ...formData.config,
        tax_brackets: [
          ...formData.config.tax_brackets,
          { min: 0, max: null, rate: 0, label: "" },
        ],
      },
    });
  };

  const removeTaxBracket = (index: number) => {
    const newBrackets = formData.config.tax_brackets.filter(
      (_, i) => i !== index
    );
    setFormData({
      ...formData,
      config: {
        ...formData.config,
        tax_brackets: newBrackets,
      },
    });
  };

  const updateTaxBracket = (index: number, field: keyof TaxBracket, value: any) => {
    const newBrackets = [...formData.config.tax_brackets];
    newBrackets[index] = {
      ...newBrackets[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      config: {
        ...formData.config,
        tax_brackets: newBrackets,
      },
    });
  };

  const calculatePreview = () => {
    const config = formData.config;
    const baseSalary = previewSalary;

    // Calculate insurance
    const insurance = (baseSalary * config.insurance.employee_rate) / 100;

    // Calculate tax
    let tax = 0;
    let remainingIncome = baseSalary;

    for (const bracket of config.tax_brackets) {
      if (remainingIncome <= 0) break;

      const bracketMin = bracket.min;
      const bracketMax = bracket.max || Infinity;

      if (baseSalary > bracketMin) {
        const taxableInThisBracket = Math.min(
          remainingIncome,
          bracketMax - bracketMin
        );
        tax += taxableInThisBracket * bracket.rate;
        remainingIncome -= taxableInThisBracket;
      }
    }

    const netSalary = baseSalary - insurance - tax;

    setPreviewResult({
      baseSalary,
      insurance,
      tax,
      netSalary,
    });
  };

  useEffect(() => {
    calculatePreview();
  }, [previewSalary, formData.config]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/calculator-configs">
            <Button variant="ghost" size="sm">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {configId ? "ویرایش" : "ایجاد"} تنظیمات ماشین‌حساب حقوق
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              فرمول‌ها و پارامترهای محاسبه حقوق و دستمزد
            </p>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
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
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
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

          {/* Insurance Settings */}
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات بیمه</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="insuranceRate">نرخ بیمه سهم کارمند (%)</Label>
                <Input
                  id="insuranceRate"
                  type="number"
                  step="0.1"
                  value={formData.config.insurance.employee_rate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        insurance: {
                          ...formData.config.insurance,
                          employee_rate: parseFloat(e.target.value),
                        },
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insuranceDesc">توضیحات</Label>
                <Input
                  id="insuranceDesc"
                  value={formData.config.insurance.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        insurance: {
                          ...formData.config.insurance,
                          description: e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Child Allowance Settings */}
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات حق اولاد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="childAmount">مبلغ به ازای هر فرزند</Label>
                  <Input
                    id="childAmount"
                    type="number"
                    value={formData.config.child_allowance.amount_per_child}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          child_allowance: {
                            ...formData.config.child_allowance,
                            amount_per_child: parseInt(e.target.value),
                          },
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxChildren">حداکثر تعداد فرزند</Label>
                  <Input
                    id="maxChildren"
                    type="number"
                    value={formData.config.child_allowance.max_children}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          child_allowance: {
                            ...formData.config.child_allowance,
                            max_children: parseInt(e.target.value),
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="childDesc">توضیحات</Label>
                <Input
                  id="childDesc"
                  value={formData.config.child_allowance.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        child_allowance: {
                          ...formData.config.child_allowance,
                          description: e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Overtime Settings */}
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات اضافه‌کاری</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseHours">ساعات پایه ماهانه</Label>
                  <Input
                    id="baseHours"
                    type="number"
                    value={formData.config.overtime.base_hours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          overtime: {
                            ...formData.config.overtime,
                            base_hours: parseInt(e.target.value),
                          },
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rateMultiplier">ضریب اضافه‌کاری</Label>
                  <Input
                    id="rateMultiplier"
                    type="number"
                    step="0.1"
                    value={formData.config.overtime.rate_multiplier}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          overtime: {
                            ...formData.config.overtime,
                            rate_multiplier: parseFloat(e.target.value),
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="overtimeDesc">توضیحات</Label>
                <Input
                  id="overtimeDesc"
                  value={formData.config.overtime.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        overtime: {
                          ...formData.config.overtime,
                          description: e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Tax Brackets */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>پله‌های مالیاتی</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addTaxBracket}
                >
                  <Plus className="w-4 h-4 ml-2" />
                  افزودن پله
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.config.tax_brackets.map((bracket, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-3 bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">
                      پله {(index + 1).toLocaleString("fa-IR")}
                    </h4>
                    {formData.config.tax_brackets.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTaxBracket(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>از (تومان)</Label>
                      <Input
                        type="number"
                        value={bracket.min}
                        onChange={(e) =>
                          updateTaxBracket(index, "min", parseInt(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>تا (تومان)</Label>
                      <Input
                        type="number"
                        value={bracket.max || ""}
                        onChange={(e) =>
                          updateTaxBracket(
                            index,
                            "max",
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        placeholder="بدون محدودیت"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>نرخ مالیات (0-1)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={bracket.rate}
                      onChange={(e) =>
                        updateTaxBracket(index, "rate", parseFloat(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>برچسب</Label>
                    <Input
                      value={bracket.label}
                      onChange={(e) =>
                        updateTaxBracket(index, "label", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              <Save className="w-4 h-4 ml-2" />
              {isSaving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
            </Button>
            <Link href="/admin/calculator-configs">
              <Button variant="outline">انصراف</Button>
            </Link>
          </div>
        </div>

        {/* Preview Panel */}
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
                  <Label htmlFor="previewSalary">حقوق تست (تومان)</Label>
                  <Input
                    id="previewSalary"
                    type="number"
                    value={previewSalary}
                    onChange={(e) =>
                      setPreviewSalary(parseInt(e.target.value) || 0)
                    }
                  />
                </div>

                {previewResult && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        حقوق پایه:
                      </span>
                      <span className="font-medium">
                        {previewResult.baseSalary.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        بیمه:
                      </span>
                      <span className="font-medium text-red-600">
                        -{previewResult.insurance.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        مالیات:
                      </span>
                      <span className="font-medium text-red-600">
                        -{previewResult.tax.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-3 border-t">
                      <span>خالص دریافتی:</span>
                      <span className="text-green-600">
                        {previewResult.netSalary.toLocaleString("fa-IR")} تومان
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
