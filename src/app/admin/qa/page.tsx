"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MessageSquare,
  Settings,
  Plus,
  Pencil,
  Trash2,
  Save,
  Loader2,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  code: string;
  nameFa: string;
  nameEn: string | null;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface Settings {
  [key: string]: {
    value: string;
    description: string | null;
  };
}

export default function AdminQAPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New category form
  const [newCategory, setNewCategory] = useState({
    code: "",
    nameFa: "",
    nameEn: "",
    description: "",
    icon: "",
    sortOrder: 0,
  });
  const [showNewCategory, setShowNewCategory] = useState(false);

  // Edit category
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, settingsRes] = await Promise.all([
        fetch("/api/admin/qa/categories"),
        fetch("/api/admin/qa/settings"),
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData.settings || {});
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  // Save settings
  const saveSettings = async () => {
    setSaving(true);
    try {
      const settingsToSave: Record<string, string> = {};
      for (const [key, data] of Object.entries(settings)) {
        settingsToSave[key] = data.value;
      }

      const res = await fetch("/api/admin/qa/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      if (res.ok) {
        toast.success("تنظیمات با موفقیت ذخیره شد");
      } else {
        toast.error("خطا در ذخیره تنظیمات");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("خطا در ذخیره تنظیمات");
    } finally {
      setSaving(false);
    }
  };

  // Update setting value
  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], value },
    }));
  };

  // Create new category
  const createCategory = async () => {
    try {
      const res = await fetch("/api/admin/qa/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });

      if (res.ok) {
        toast.success("دسته‌بندی با موفقیت ایجاد شد");
        setShowNewCategory(false);
        setNewCategory({
          code: "",
          nameFa: "",
          nameEn: "",
          description: "",
          icon: "",
          sortOrder: 0,
        });
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "خطا در ایجاد دسته‌بندی");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("خطا در ایجاد دسته‌بندی");
    }
  };

  // Update category
  const updateCategory = async () => {
    if (!editCategory) return;

    try {
      const res = await fetch(`/api/admin/qa/categories/${editCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameFa: editCategory.nameFa,
          nameEn: editCategory.nameEn,
          description: editCategory.description,
          icon: editCategory.icon,
          sortOrder: editCategory.sortOrder,
          isActive: editCategory.isActive,
        }),
      });

      if (res.ok) {
        toast.success("دسته‌بندی با موفقیت بروزرسانی شد");
        setEditCategory(null);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "خطا در بروزرسانی دسته‌بندی");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("خطا در بروزرسانی دسته‌بندی");
    }
  };

  // Delete category
  const deleteCategory = async (id: string) => {
    if (!confirm("آیا از حذف این دسته‌بندی اطمینان دارید؟")) return;

    try {
      const res = await fetch(`/api/admin/qa/categories/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("دسته‌بندی با موفقیت حذف شد");
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "خطا در حذف دسته‌بندی");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("خطا در حذف دسته‌بندی");
    }
  };

  // Toggle category active status
  const toggleCategoryActive = async (category: Category) => {
    try {
      const res = await fetch(`/api/admin/qa/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !category.isActive }),
      });

      if (res.ok) {
        toast.success(
          category.isActive ? "دسته‌بندی غیرفعال شد" : "دسته‌بندی فعال شد"
        );
        fetchData();
      }
    } catch (error) {
      console.error("Error toggling category:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            تنظیمات پرسش و پاسخ
          </h1>
          <p className="text-muted-foreground mt-1">
            مدیریت دسته‌بندی‌ها و تنظیمات بخش پرسش و پاسخ
          </p>
        </div>
      </div>

      {/* Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" />
            تنظیمات کلی
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QA Enabled */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-base font-medium">فعال بودن پرسش و پاسخ</Label>
              <p className="text-sm text-muted-foreground">
                {settings.qa_enabled?.description}
              </p>
            </div>
            <Switch
              checked={settings.qa_enabled?.value === "true"}
              onCheckedChange={(checked) =>
                updateSetting("qa_enabled", checked ? "true" : "false")
              }
            />
          </div>

          {/* Daily Question Limit */}
          <div className="grid gap-2">
            <Label>حداکثر سؤال در روز</Label>
            <Input
              type="number"
              value={settings.daily_question_limit?.value || "5"}
              onChange={(e) => updateSetting("daily_question_limit", e.target.value)}
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">
              {settings.daily_question_limit?.description}
            </p>
          </div>

          {/* Daily Answer Limit */}
          <div className="grid gap-2">
            <Label>حداکثر پاسخ در روز</Label>
            <Input
              type="number"
              value={settings.daily_answer_limit?.value || "10"}
              onChange={(e) => updateSetting("daily_answer_limit", e.target.value)}
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">
              {settings.daily_answer_limit?.description}
            </p>
          </div>

          {/* Min Answer Length */}
          <div className="grid gap-2">
            <Label>حداقل طول پاسخ</Label>
            <Input
              type="number"
              value={settings.min_answer_length?.value || "20"}
              onChange={(e) => updateSetting("min_answer_length", e.target.value)}
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">
              {settings.min_answer_length?.description}
            </p>
          </div>

          {/* Show Expert Level */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-base font-medium">نمایش سطح تخصص</Label>
              <p className="text-sm text-muted-foreground">
                {settings.show_expert_level?.description}
              </p>
            </div>
            <Switch
              checked={settings.show_expert_level?.value === "true"}
              onCheckedChange={(checked) =>
                updateSetting("show_expert_level", checked ? "true" : "false")
              }
            />
          </div>

          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
            ) : (
              <Save className="w-4 h-4 ml-2" />
            )}
            ذخیره تنظیمات
          </Button>
        </CardContent>
      </Card>

      {/* Categories Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">دسته‌بندی‌ها</CardTitle>
          <Dialog open={showNewCategory} onOpenChange={setShowNewCategory}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 ml-2" />
                افزودن دسته‌بندی
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>افزودن دسته‌بندی جدید</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label>کد (انگلیسی)</Label>
                  <Input
                    placeholder="accounting"
                    value={newCategory.code}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, code: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>نام فارسی</Label>
                  <Input
                    placeholder="حسابداری"
                    value={newCategory.nameFa}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, nameFa: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>نام انگلیسی</Label>
                  <Input
                    placeholder="Accounting"
                    value={newCategory.nameEn}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, nameEn: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>آیکون (emoji)</Label>
                  <Input
                    placeholder="📊"
                    value={newCategory.icon}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, icon: e.target.value })
                    }
                    className="w-24"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>ترتیب نمایش</Label>
                  <Input
                    type="number"
                    value={newCategory.sortOrder}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-24"
                  />
                </div>
                <Button onClick={createCategory} className="w-full">
                  ایجاد دسته‌بندی
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>آیکون</TableHead>
                <TableHead>کد</TableHead>
                <TableHead>نام فارسی</TableHead>
                <TableHead>ترتیب</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead className="text-left">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  </TableCell>
                  <TableCell className="text-xl">{category.icon || "📁"}</TableCell>
                  <TableCell className="font-mono text-sm">{category.code}</TableCell>
                  <TableCell>{category.nameFa}</TableCell>
                  <TableCell>{category.sortOrder}</TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "فعال" : "غیرفعال"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleCategoryActive(category)}
                      >
                        <Switch checked={category.isActive} />
                      </Button>
                      <Dialog
                        open={editCategory?.id === category.id}
                        onOpenChange={(open) =>
                          setEditCategory(open ? category : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>ویرایش دسته‌بندی</DialogTitle>
                          </DialogHeader>
                          {editCategory && (
                            <div className="space-y-4 pt-4">
                              <div className="grid gap-2">
                                <Label>نام فارسی</Label>
                                <Input
                                  value={editCategory.nameFa}
                                  onChange={(e) =>
                                    setEditCategory({
                                      ...editCategory,
                                      nameFa: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>نام انگلیسی</Label>
                                <Input
                                  value={editCategory.nameEn || ""}
                                  onChange={(e) =>
                                    setEditCategory({
                                      ...editCategory,
                                      nameEn: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>آیکون</Label>
                                <Input
                                  value={editCategory.icon || ""}
                                  onChange={(e) =>
                                    setEditCategory({
                                      ...editCategory,
                                      icon: e.target.value,
                                    })
                                  }
                                  className="w-24"
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>ترتیب نمایش</Label>
                                <Input
                                  type="number"
                                  value={editCategory.sortOrder}
                                  onChange={(e) =>
                                    setEditCategory({
                                      ...editCategory,
                                      sortOrder: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-24"
                                />
                              </div>
                              <Button onClick={updateCategory} className="w-full">
                                ذخیره تغییرات
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => deleteCategory(category.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
