"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutDashboard, User, FileText, Brain, Settings, Target, MessageSquare, Shield, Bug, Bookmark, Trophy, Compass } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { href: "/app", label: "داشبورد", icon: LayoutDashboard, exact: true },
  { href: "/app/profile", label: "پروفایل من", icon: User, exact: false },
  { href: "/app/resume", label: "رزومه", icon: FileText, exact: false },
  { href: "/app/assessments", label: "آزمون‌ها", icon: Brain, exact: false },
  { href: "/app/career-paths", label: "مسیر شغلی", icon: Compass, exact: false },
  { href: "/app/matching", label: "تطبیق شغلی", icon: Target, exact: false },
  { href: "/app/qa", label: "پرسش و پاسخ", icon: MessageSquare, exact: false },
  { href: "/app/qa/leaderboard", label: "برترین‌ها", icon: Trophy, exact: false },
  { href: "/app/bookmarks", label: "ذخیره‌شده‌ها", icon: Bookmark, exact: false },
];

const bottomNavItems = [
  { href: "/app/settings", label: "تنظیمات", icon: Settings, exact: false },
];

const adminNavItems = [
  { href: "/admin", label: "پنل ادمین", icon: Shield, exact: true },
  { href: "/admin/qa/answers", label: "دیباگ پاسخ‌ها", icon: Bug, exact: false },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin;

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-l flex-col bg-background sticky top-0 h-screen">
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin Section */}
        {isAdmin && (
          <div className="p-6 pt-0 space-y-2">
            <Separator className="mb-4" />
            <p className="text-xs text-muted-foreground px-3 mb-2">ادمین</p>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    active
                      ? "bg-amber-500 text-white"
                      : "hover:bg-amber-50 text-amber-700"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Bottom Section with Separator */}
        <div className="p-6 space-y-4">
          <Separator />
          <div className="space-y-2">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50">
        <div className="flex justify-around p-2">
          {[...mainNavItems, ...bottomNavItems].map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[60px]",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
