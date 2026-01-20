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
  from: number;
  to: number | null;
  rate: number;
  label: string;
}

interface TaxConfig {
  version: string;
  year: number;
  tax_brackets: TaxBracket[];
}

interface ConfigData {
  id?: string;
  calculatorType: string;
  configYear: number;
  config: TaxConfig;
  isActive: boolean;
  effectiveFrom: string | null;
  effectiveUntil: string | null;
  notes: string;
}

const defaultConfig: TaxConfig = {
  version: "1.0",
  year: 1403,
  tax_brackets: [
    { from: 0, to: 10000000, rate: 0, label: "تا ۱۰ میلیون تومان - معاف" },
    { from: 10000000, to: 20000000, rate: 0.1, label: "۱۰ تا ۲۰ میلیون - ۱۰٪" },
    { from: 20000000, to: 40000000, rate: 0.15, label: "۲۰ تا ۴۰ میلیون - ۱۵٪" },
    { from: 40000000, to: null, rate: 0.2, label: "بالای ۴۰ میلیون - ۲۰٪" },
  ],
};

export default function AdminTaxCalculatorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const configId = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState<ConfigData>({
    calculatorType: "tax",
    configYear: new Date().getFullYear(),
    config: defaultConfig,
    isActive: true,
    effectiveFrom: null,
    effectiveUntil: null,
    notes: "",
  });

  const [previewIncome, setPreviewIncome] = useState<number>(25000000);
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
        `/api/admin/calculator-configs/tax?id=${id}`
      );

      if (response.status === 403) {
        router.push("/auth?redirectTo=/admin/calculator-configs/tax");
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
        ? `/api/admin/calculator-configs/tax`
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
          { from: 0, to: null, rate: 0, label: "" },
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

  const updateTaxBracket = (
    index: number,
    field: keyof TaxBracket,
    value: any
  ) => {
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
    let totalTax = 0;
    let remainingIncome = previewIncome;
    const bracketDetails: any[] = [];

    for (const bracket of config.tax_brackets) {
      if (remainingIncome <= 0) break;

      const bracketFrom = bracket.from;
      const bracketTo = bracket.to || Infinity;

      if (previewIncome > bracketFrom) {
        const taxableInThisBracket = Math.min(
          remainingIncome,
          bracketTo - bracketFrom
        );
        const taxForThisBracket = taxableInThisBracket * bracket.rate;
        totalTax += taxForThisBracket;
        remainingIncome -= taxableInThisBracket;

        if (taxableInThisBracket > 0) {
          bracketDetails.push({
            label: bracket.label,
            amount: taxableInThisBracket,
            rate: bracket.rate,
            tax: taxForThisBracket,
          });
        }
      }
    }

    setPreviewResult({
      income: previewIncome,
      totalTax,
      netIncome: previewIncome - totalTax,
      bracketDetails,
    });
  };

  useEffect(() => {
    calculatePreview();
  }, [previewIncome, formData.config]);

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
              {configId ? "ویرایش" : "ایجاد"} تنظیمات ماشین‌حساب مالیات
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              پله‌های مالیاتی و نرخ‌های مالیات بر درآمد
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
              <div className="flex items-center justify-between">
                <CardTitle>پله‌های مالیاتی</CardTitle>
                <Button variant="outline" size="sm" onClick={addTaxBracket}>
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
                        value={bracket.from}
                        onChange={(e) =>
                          updateTaxBracket(
                            index,
                            "from",
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>تا (تومان)</Label>
                      <Input
                        type="number"
                        value={bracket.to || ""}
                        onChange={(e) =>
                          updateTaxBracket(
                            index,
                            "to",
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
                        updateTaxBracket(
                          index,
                          "rate",
                          parseFloat(e.target.value)
                        )
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
                  <Label htmlFor="previewIncome">درآمد تست (تومان)</Label>
                  <Input
                    id="previewIncome"
                    type="number"
                    value={previewIncome}
                    onChange={(e) =>
                      setPreviewIncome(parseInt(e.target.value) || 0)
                    }
                  />
                </div>

                {previewResult && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        درآمد:
                      </span>
                      <span className="font-medium">
                        {previewResult.income.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        مالیات:
                      </span>
                      <span className="font-medium text-red-600">
                        -{previewResult.totalTax.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-3 border-t">
                      <span>خالص:</span>
                      <span className="text-green-600">
                        {previewResult.netIncome.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>

                    {previewResult.bracketDetails.length > 0 && (
                      <div className="pt-3 border-t space-y-2">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          جزئیات پله‌ها:
                        </p>
                        {previewResult.bracketDetails.map(
                          (detail: any, idx: number) => (
                            <div
                              key={idx}
                              className="text-xs space-y-1 p-2 bg-gray-50 dark:bg-gray-800 rounded"
                            >
                              <p className="font-medium">{detail.label}</p>
                              <p className="text-gray-600 dark:text-gray-400">
                                {detail.amount.toLocaleString("fa-IR")} تومان ×{" "}
                                {(detail.rate * 100).toFixed(0)}% ={" "}
                                {detail.tax.toLocaleString("fa-IR")} تومان
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    )}
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
