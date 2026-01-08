import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function PublicHeader() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="flex items-center gap-4">
          <ThemeToggle />
          <Button asChild variant="ghost">
            <Link href="/auth">ورود</Link>
          </Button>
          <Button asChild>
            <Link href="/auth">ساخت پروفایل حرفه‌ای</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
