"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit2, Save } from "lucide-react";
import { toast } from "sonner";

type FAQ = {
  id?: string;
  category: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
};

export default function AdminHomePage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [newFaq, setNewFaq] = useState<FAQ>({
    category: "general",
    question: "",
    answer: "",
    order: 0,
    isActive: true,
  });

  // Hero Settings
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroBadgeText, setHeroBadgeText] = useState("");

  // Stats
  const [stats, setStats] = useState<any[]>([
    { icon: "📊", value: "+1,200", label: "متخصص فعال" },
    { icon: "💼", value: "+350", label: "رزومه ساخته شده" },
    { icon: "🎯", value: "+2,500", label: "پاسخ تخصصی" },
    { icon: "⭐", value: "95%", label: "رضایت کاربران" },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load FAQs
      const faqsRes = await fetch("/api/admin/faqs");
      if (faqsRes.ok) {
        const data = await faqsRes.json();
        setFaqs(data.faqs || []);
      }

      // Load Home Settings
      const settingsRes = await fetch("/api/admin/home-settings");
      if (settingsRes.ok) {
        const data = await faqsRes.json();
        const settings = data.settings;
        if (settings) {
          setHeroTitle(settings.heroTitle || "");
          setHeroSubtitle(settings.heroSubtitle || "");
          setHeroBadgeText(settings.heroBadgeText || "");
          setStats(settings.stats || stats);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("خطا در بارگذاری داده‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFaq = async () => {
    if (!newFaq.question || !newFaq.answer) {
      toast.error("لطفاً سوال و پاسخ را وارد کنید");
      return;
    }

    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFaq),
      });

      if (res.ok) {
        toast.success("سوال با موفقیت اضافه شد");
        loadData();
        setNewFaq({
          category: "general",
          question: "",
          answer: "",
          order: 0,
          isActive: true,
        });
      } else {
        toast.error("خطا در افزودن سوال");
      }
    } catch (error) {
      console.error("Error creating FAQ:", error);
      toast.error("خطا در افزودن سوال");
    }
  };

  const handleUpdateFaq = async (faq: FAQ) => {
    if (!faq.id) return;

    try {
      const res = await fetch(`/api/admin/faqs/${faq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(faq),
      });

      if (res.ok) {
        toast.success("سوال با موفقیت ویرایش شد");
        loadData();
        setEditingFaq(null);
      } else {
        toast.error("خطا در ویرایش سوال");
      }
    } catch (error) {
      console.error("Error updating FAQ:", error);
      toast.error("خطا در ویرایش سوال");
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm("آیا از حذف این سوال مطمئن هستید؟")) return;

    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("سوال با موفقیت حذف شد");
        loadData();
      } else {
        toast.error("خطا در حذف سوال");
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      toast.error("خطا در حذف سوال");
    }
  };

  const handleSaveHeroSettings = async () => {
    try {
      const res = await fetch("/api/admin/home-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroTitle,
          heroSubtitle,
          heroBadgeText,
        }),
      });

      if (res.ok) {
        toast.success("تنظیمات Hero با موفقیت ذخیره شد");
      } else {
        toast.error("خطا در ذخیره تنظیمات");
      }
    } catch (error) {
      console.error("Error saving hero settings:", error);
      toast.error("خطا در ذخیره تنظیمات");
    }
  };

  const handleSaveStats = async () => {
    try {
      const res = await fetch("/api/admin/home-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats }),
      });

      if (res.ok) {
        toast.success("آمار با موفقیت ذخیره شد");
      } else {
        toast.error("خطا در ذخیره آمار");
      }
    } catch (error) {
      console.error("Error saving stats:", error);
      toast.error("خطا در ذخیره آمار");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      general: "عمومی",
      privacy: "حریم خصوصی",
      careers: "مسیرهای شغلی",
    };
    return labels[cat] || cat;
  };

  const faqsByCategory = {
    general: faqs.filter((f) => f.category === "general"),
    privacy: faqs.filter((f) => f.category === "privacy"),
    careers: faqs.filter((f) => f.category === "careers"),
  };

  return (
    <div className="container mx-auto p-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">مدیریت صفحه اصلی</h1>
        <p className="text-muted-foreground">
          ویرایش محتوای صفحه اصلی (Hero, FAQ, Stats)
        </p>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="stats">آمار</TabsTrigger>
          <TabsTrigger value="faqs">سوالات متداول</TabsTrigger>
        </TabsList>

        {/* Hero Section Tab */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات Hero Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="heroBadge">متن Badge</Label>
                <Input
                  id="heroBadge"
                  value={heroBadgeText}
                  onChange={(e) => setHeroBadgeText(e.target.value)}
                  placeholder="پلتفرم رشد حرفه‌ای در حوزه مالی"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="heroTitle">عنوان اصلی</Label>
                <Textarea
                  id="heroTitle"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="حرفه مالی خودت را بساز"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="heroSubtitle">زیرعنوان</Label>
                <Textarea
                  id="heroSubtitle"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="با پاسخ به سوالات واقعی..."
                  rows={3}
                />
              </div>

              <Button onClick={handleSaveHeroSettings}>
                <Save className="w-4 h-4 ml-2" />
                ذخیره تنظیمات Hero
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>آمار صفحه اصلی</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {stats.map((stat, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label>آیکون (Emoji)</Label>
                    <Input
                      value={stat.icon}
                      onChange={(e) => {
                        const newStats = [...stats];
                        newStats[index].icon = e.target.value;
                        setStats(newStats);
                      }}
                      className="text-2xl"
                      maxLength={2}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>مقدار</Label>
                    <Input
                      value={stat.value}
                      onChange={(e) => {
                        const newStats = [...stats];
                        newStats[index].value = e.target.value;
                        setStats(newStats);
                      }}
                      placeholder="+1,200"
                    />
                  </div>
                  <div className="flex-1">
                    <Label>برچسب</Label>
                    <Input
                      value={stat.label}
                      onChange={(e) => {
                        const newStats = [...stats];
                        newStats[index].label = e.target.value;
                        setStats(newStats);
                      }}
                      placeholder="متخصص فعال"
                    />
                  </div>
                </div>
              ))}
              <Button onClick={handleSaveStats}>
                <Save className="w-4 h-4 ml-2" />
                ذخیره آمار
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faqs">
          <div className="space-y-6">
            {/* Create New FAQ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  افزودن سوال جدید
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>دسته‌بندی</Label>
                    <Select
                      value={newFaq.category}
                      onValueChange={(value) =>
                        setNewFaq({ ...newFaq, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">عمومی</SelectItem>
                        <SelectItem value="privacy">حریم خصوصی</SelectItem>
                        <SelectItem value="careers">مسیرهای شغلی</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ترتیب نمایش</Label>
                    <Input
                      type="number"
                      value={newFaq.order}
                      onChange={(e) =>
                        setNewFaq({ ...newFaq, order: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>سوال</Label>
                  <Input
                    value={newFaq.question}
                    onChange={(e) =>
                      setNewFaq({ ...newFaq, question: e.target.value })
                    }
                    placeholder="آیا کاربرگ رایگان است؟"
                  />
                </div>

                <div className="space-y-2">
                  <Label>پاسخ</Label>
                  <Textarea
                    value={newFaq.answer}
                    onChange={(e) =>
                      setNewFaq({ ...newFaq, answer: e.target.value })
                    }
                    placeholder="بله، تمام امکانات پایه کاربرگ رایگان است..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleCreateFaq}>
                  <Plus className="w-4 h-4 ml-2" />
                  افزودن سوال
                </Button>
              </CardContent>
            </Card>

            {/* Existing FAQs by Category */}
            {Object.entries(faqsByCategory).map(([category, categoryFaqs]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle>
                    {getCategoryLabel(category)} ({categoryFaqs.length} سوال)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categoryFaqs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      هنوز سوالی در این دسته وجود ندارد
                    </p>
                  ) : (
                    categoryFaqs.map((faq) => (
                      <div
                        key={faq.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        {editingFaq && editingFaq.id === faq.id ? (
                          <>
                            <Input
                              value={editingFaq.question}
                              onChange={(e) =>
                                setEditingFaq({
                                  ...editingFaq!,
                                  question: e.target.value,
                                })
                              }
                            />
                            <Textarea
                              value={editingFaq.answer}
                              onChange={(e) =>
                                setEditingFaq({
                                  ...editingFaq!,
                                  answer: e.target.value,
                                })
                              }
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleUpdateFaq(editingFaq!)}
                              >
                                ذخیره
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingFaq(null)}
                              >
                                لغو
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-bold mb-1">{faq.question}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {faq.answer}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingFaq(faq)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => faq.id && handleDeleteFaq(faq.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex gap-2 text-xs">
                              <Badge variant="secondary">ترتیب: {faq.order}</Badge>
                              <Badge variant={faq.isActive ? "default" : "secondary"}>
                                {faq.isActive ? "فعال" : "غیرفعال"}
                              </Badge>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
