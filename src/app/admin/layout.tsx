"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Eye, Brain, Settings, Briefcase, ClipboardList, MessageSquare } from "lucide-react";

const navItems = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard, exact: true },
  { href: "/admin/jobs", label: "شغل‌ها", icon: Briefcase, exact: false },
  { href: "/admin/applications", label: "درخواست‌ها", icon: ClipboardList, exact: false },
  { href: "/admin/users", label: "کاربران", icon: Users, exact: false },
  { href: "/admin/profiles", label: "پروفایل‌ها", icon: Eye, exact: false },
  { href: "/admin/assessments", label: "آزمون‌ها", icon: Brain, exact: false },
  { href: "/admin/qa", label: "پرسش و پاسخ", icon: MessageSquare, exact: false },
  { href: "/admin/settings", label: "تنظیمات", icon: Settings, exact: false },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            پنل مدیریت کاربرگ
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href, item.exact);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
