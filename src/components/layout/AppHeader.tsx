"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from "lucide-react";
import { loadFocusedFromStorage, type FocusedProfile } from "@/lib/onboarding";
import NotificationBell from "./NotificationBell";

export default function AppHeader() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [localProfile, setLocalProfile] = useState<FocusedProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load localStorage profile as fallback
  useEffect(() => {
    setMounted(true);
    const data = loadFocusedFromStorage();
    setLocalProfile(data);
  }, []);

  // Get user data from session or localStorage
  const user = session?.user;
  const fullName = mounted ? (user?.fullName || localProfile?.fullName || "کاربر") : "کاربر";
  const profilePhotoUrl = mounted ? (user?.profilePhotoUrl || localProfile?.profilePhotoUrl || localProfile?.profilePhotoThumbnailUrl || undefined) : undefined;

  // Get initials for avatar fallback
  const getInitials = () => {
    if (fullName && fullName !== "کاربر") {
      return fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    }
    return "کا";
  };

  // Handle logout
  const handleLogout = async () => {
    // Clear localStorage
    localStorage.clear();

    // Sign out with NextAuth
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="border-b bg-background sticky top-0 z-50" suppressHydrationWarning>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between" suppressHydrationWarning>
        <Link href="/app">
          <Logo />
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Notification Bell */}
          <NotificationBell />

          {/* Settings Button */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/settings">
              <Settings className="h-5 w-5" />
              <span className="sr-only">تنظیمات</span>
            </Link>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={profilePhotoUrl}
                    alt="آواتار"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {fullName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {fullName}
                  </p>
                  {(user?.mobile || localProfile?.city) && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.mobile || localProfile?.city}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/app/profile" className="cursor-pointer">
                  <User className="ml-2 h-4 w-4" />
                  پروفایل من
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="ml-2 h-4 w-4" />
                خروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
