"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserX, Brain, FileText, Download, Users } from "lucide-react";
import Link from "next/link";

export default function QuickActions() {
  const actions = [
    {
      label: "مشاهده کاربران ناقص",
      description: "کاربرانی که پروفایل خود را تکمیل نکرده‌اند",
      icon: UserX,
      href: "/admin/users",
      variant: "outline" as const,
    },
    {
      label: "مدیریت آزمون‌ها",
      description: "مشاهده و مدیریت آزمون‌های فعال",
      icon: Brain,
      href: "/admin/assessments",
      variant: "outline" as const,
    },
    {
      label: "مشاهده پروفایل‌ها",
      description: "بررسی پروفایل‌های عمومی",
      icon: Users,
      href: "/admin/profiles",
      variant: "outline" as const,
    },
    {
      label: "خروجی گزارش",
      description: "دانلود گزارش CSV (به‌زودی)",
      icon: Download,
      href: "#",
      variant: "outline" as const,
      disabled: true,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">اقدامات سریع</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;

            if (action.disabled) {
              return (
                <Button
                  key={index}
                  variant={action.variant}
                  className="w-full h-auto py-4 px-4 flex flex-col items-start text-right gap-2"
                  disabled={true}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-sm">{action.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-normal">
                    {action.description}
                  </p>
                </Button>
              );
            }

            return (
              <Button
                key={index}
                variant={action.variant}
                className="w-full h-auto py-4 px-4 flex flex-col items-start text-right gap-2"
                asChild
              >
                <Link href={action.href}>
                  <div className="flex items-center gap-2 w-full">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-sm">{action.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-normal">
                    {action.description}
                  </p>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
