"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface EditUserDialogProps {
  user: {
    id: string;
    fullName: string;
    mobile: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUserDialog({
  user,
  isOpen,
  onClose,
  onSuccess,
}: EditUserDialogProps) {
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Reset form when dialog opens with new user
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setMobile(user?.mobile || "");
      setError("");
    }
  };

  // Validate and format mobile number
  const formatMobile = (value: string) => {
    // Remove non-digits
    const digitsOnly = value.replace(/\D/g, "");

    // Ensure it starts with 09
    if (digitsOnly.length > 0 && !digitsOnly.startsWith("09")) {
      return mobile; // Don't update if format is wrong
    }

    // Limit to 11 digits
    return digitsOnly.slice(0, 11);
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMobile(e.target.value);
    setMobile(formatted);
    setError("");
  };

  const validateMobile = () => {
    if (!/^09\d{9}$/.test(mobile)) {
      setError("شماره موبایل باید ۱۱ رقم و با 09 شروع شود");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateMobile()) {
      return;
    }

    if (!user) return;

    // Check if mobile has changed
    if (mobile === user.mobile) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در به‌روزرسانی اطلاعات");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "خطا در به‌روزرسانی اطلاعات. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ویرایش اطلاعات کاربر</DialogTitle>
          <DialogDescription>
            تغییر شماره موبایل کاربر <strong>{user.fullName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* User Info */}
            <div className="space-y-2">
              <Label>نام کاربر</Label>
              <Input
                value={user.fullName}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <Label htmlFor="mobile">
                شماره موبایل <span className="text-red-500">*</span>
              </Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="09123456789"
                value={mobile}
                onChange={handleMobileChange}
                className={error ? "border-red-500" : ""}
                dir="ltr"
                maxLength={11}
              />
              {error && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                فرمت: ۱۱ رقم، شروع با 09
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              انصراف
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
