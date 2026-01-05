import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";

export default function AppHeader() {
  // TODO: دریافت اطلاعات کاربر واقعی
  const mockUser = {
    name: "علی محمدی",
  };

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/app">
          <Logo />
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden md:block">
            {mockUser.name}
          </span>
          <Button variant="outline" size="sm">
            {/* TODO: پیاده‌سازی logout */}
            خروج
          </Button>
        </div>
      </div>
    </header>
  );
}
