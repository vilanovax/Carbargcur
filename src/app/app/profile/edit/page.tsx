"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EditProfilePage() {
  // TODO: پیاده‌سازی منطق ذخیره
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted - TODO: implement save");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">ویرایش پروفایل</h1>
        <p className="text-muted-foreground">
          اطلاعات خود را تکمیل کنید تا شانس دیده‌شدن شما بیشتر شود
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* اطلاعات پایه */}
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات پایه</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">نام و نام خانوادگی *</Label>
              <Input
                id="fullName"
                placeholder="علی محمدی"
                disabled
                defaultValue="علی محمدی"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professionalTitle">عنوان شغلی</Label>
              <Input
                id="professionalTitle"
                placeholder="مثال: تحلیلگر مالی ارشد"
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">شهر</Label>
              <Input id="city" placeholder="تهران" disabled />
            </div>
          </CardContent>
        </Card>

        {/* وضعیت شغلی */}
        <Card>
          <CardHeader>
            <CardTitle>وضعیت شغلی</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label>وضعیت فعلی شما</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-not-allowed opacity-50">
                <input type="radio" name="status" disabled />
                <div>
                  <div className="font-medium">شاغل</div>
                  <div className="text-sm text-muted-foreground">
                    در حال حاضر مشغول به کار هستم
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-not-allowed opacity-50">
                <input type="radio" name="status" disabled />
                <div>
                  <div className="font-medium">جویای فرصت شغلی</div>
                  <div className="text-sm text-muted-foreground">
                    به دنبال فرصت جدید هستم
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-not-allowed opacity-50">
                <input type="radio" name="status" disabled />
                <div>
                  <div className="font-medium">فریلنسر</div>
                  <div className="text-sm text-muted-foreground">
                    به صورت پروژه‌ای کار می‌کنم
                  </div>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled>
            ذخیره تغییرات
          </Button>
          <Button type="button" variant="outline" disabled>
            انصراف
          </Button>
        </div>

        {/* TODO Notice */}
        <Card className="bg-secondary/50">
          <CardContent className="p-6">
            <p className="text-sm text-center">
              <strong>توجه:</strong> این فرم placeholder است. عملکرد ذخیره در
              مراحل بعدی پیاده‌سازی می‌شود.
            </p>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
