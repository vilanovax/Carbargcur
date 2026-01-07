"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="space-y-6">در حال بارگذاری...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">تنظیمات</h1>
        <p className="text-muted-foreground">مدیریت تنظیمات حساب کاربری و ترجیحات شما</p>
      </div>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle>تم ظاهری</CardTitle>
          <CardDescription>
            انتخاب تم روشن یا تاریک یا استفاده از تنظیمات سیستم
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={theme} onValueChange={setTheme}>
            <div className="flex items-center space-x-3 space-x-reverse p-3 border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer flex-1">
                <Sun className="w-5 h-5" />
                <div className="flex flex-col">
                  <span className="font-medium">روشن</span>
                  <span className="text-sm text-muted-foreground">تم روشن</span>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 space-x-reverse p-3 border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer flex-1">
                <Moon className="w-5 h-5" />
                <div className="flex flex-col">
                  <span className="font-medium">تاریک</span>
                  <span className="text-sm text-muted-foreground">تم تاریک</span>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 space-x-reverse p-3 border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer flex-1">
                <Monitor className="w-5 h-5" />
                <div className="flex-col">
                  <span className="font-medium">سیستم</span>
                  <span className="text-sm text-muted-foreground">
                    استفاده از تنظیمات سیستم
                  </span>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>اعلان‌ها</CardTitle>
          <CardDescription>
            مدیریت اعلان‌های ایمیل و پیام‌ها
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <Label htmlFor="email-notifications" className="font-medium cursor-pointer">
                اعلان‌های ایمیل
              </Label>
              <p className="text-sm text-muted-foreground">
                دریافت اعلان‌های مهم از طریق ایمیل
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
            <div className="flex-1">
              <Label className="font-medium">اعلان‌های موبایل</Label>
              <p className="text-sm text-muted-foreground">
                دریافت نوتیفیکیشن در موبایل (به زودی)
              </p>
            </div>
            <Switch disabled />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>حریم خصوصی</CardTitle>
          <CardDescription>
            کنترل نمایش اطلاعات شما
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <Label htmlFor="public-profile" className="font-medium cursor-pointer">
                پروفایل عمومی
              </Label>
              <p className="text-sm text-muted-foreground">
                نمایش پروفایل برای کارفرمایان
              </p>
            </div>
            <Switch
              id="public-profile"
              defaultChecked
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <Label htmlFor="show-contact" className="font-medium cursor-pointer">
                نمایش اطلاعات تماس
              </Label>
              <p className="text-sm text-muted-foreground">
                نمایش شماره موبایل و ایمیل در پروفایل عمومی
              </p>
            </div>
            <Switch
              id="show-contact"
              defaultChecked
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="bg-secondary/50">
        <CardContent className="p-6">
          <p className="text-sm text-center">
            <strong>توجه:</strong> تنظیمات اعلان‌ها و حریم خصوصی در نسخه بعدی به دیتابیس متصل خواهند شد.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
