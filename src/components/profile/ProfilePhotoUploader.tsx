"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, User } from "lucide-react";
import { uploadFile, deleteFile } from "@/lib/storage";

type ProfilePhotoUploaderProps = {
  currentPhotoUrl?: string;
  userName: string;
  onPhotoChange: (url?: string) => void;
};

export default function ProfilePhotoUploader({
  currentPhotoUrl,
  userName,
  onPhotoChange,
}: ProfilePhotoUploaderProps) {
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(currentPhotoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.slice(0, 2);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setIsUploading(true);

    // Upload file
    const result = await uploadFile(file, "photo", userName);

    if (result.success && result.url) {
      // Delete old photo if exists
      if (photoUrl) {
        deleteFile(photoUrl);
      }

      setPhotoUrl(result.url);
      onPhotoChange(result.url);
    } else {
      setError(result.error || "خطا در آپلود عکس");
    }

    setIsUploading(false);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = () => {
    if (!photoUrl) return;

    if (confirm("آیا از حذف عکس پروفایل خود مطمئن هستید؟")) {
      deleteFile(photoUrl);
      setPhotoUrl(undefined);
      onPhotoChange(undefined);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          {/* Avatar Preview */}
          <Avatar className="w-24 h-24 md:w-32 md:h-32">
            <AvatarImage src={photoUrl} alt={userName} />
            <AvatarFallback className="text-2xl md:text-3xl">
              {userName ? getInitials(userName) : <User className="w-12 h-12" />}
            </AvatarFallback>
          </Avatar>

          {/* Upload Controls */}
          <div className="flex-1 space-y-3 text-center md:text-right">
            <div>
              <p className="text-sm font-medium">عکس پروفایل</p>
              <p className="text-xs text-muted-foreground mt-1">
                فرمت: JPG یا PNG • حداکثر: 5 مگابایت
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center md:justify-start">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUploadClick}
                disabled={isUploading}
                className="text-xs md:text-sm"
              >
                <Upload className="w-4 h-4 ml-2" />
                {isUploading ? "در حال آپلود..." : photoUrl ? "تغییر عکس" : "آپلود عکس"}
              </Button>

              {photoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isUploading}
                  className="text-xs md:text-sm text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4 ml-2" />
                  حذف عکس
                </Button>
              )}
            </div>

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
