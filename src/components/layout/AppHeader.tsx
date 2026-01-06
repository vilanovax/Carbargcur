"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

export default function AppHeader() {
  const router = useRouter();
  const [profile, setProfile] = useState<FocusedProfile | null>(null);

  useEffect(() => {
    // Load profile from localStorage
    const data = loadFocusedFromStorage();
    setProfile(data);
  }, []);

  // Get initials for avatar fallback
  const getInitials = () => {
    if (profile?.fullName) {
      return profile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    }
    if (profile?.recentExperience?.role) {
      return profile.recentExperience.role.substring(0, 2);
    }
    return "کا";
  };

  // Handle logout
  const handleLogout = () => {
    // Clear localStorage
    localStorage.clear();

    // Redirect to login/home page
    router.push("/");
  };

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/app">
          <Logo />
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
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
                    src={profile?.profilePhotoThumbnailUrl || profile?.profilePhotoUrl}
                    alt="آواتار"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium">
                  {profile?.fullName || profile?.recentExperience?.role || "کاربر"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.fullName || profile?.recentExperience?.role || "کاربر"}
                  </p>
                  {profile?.city && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {profile.city}
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
