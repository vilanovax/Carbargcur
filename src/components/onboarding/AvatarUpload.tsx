"use client";

import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";

type Point = { x: number; y: number };
type Area = { x: number; y: number; width: number; height: number };

interface AvatarUploadProps {
  value?: string; // Current avatar URL
  onChange: (url: string, thumbnailUrl?: string) => void;
  fallbackInitials?: string;
}

/**
 * Create cropped image blob from canvas
 */
async function createCroppedImage(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Set canvas size to desired output size (200x200 for avatar)
  const targetSize = 200;
  canvas.width = targetSize;
  canvas.height = targetSize;

  // Draw cropped image onto canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetSize,
    targetSize
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob"));
        }
      },
      "image/jpeg",
      0.9
    );
  });
}

/**
 * Load image from URL
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export default function AvatarUpload({
  value,
  onChange,
  fallbackInitials = "کا",
}: AvatarUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("لطفاً یک فایل تصویری انتخاب کنید.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("حجم تصویر نباید بیشتر از ۵ مگابایت باشد.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setIsDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  // Handle crop complete
  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // Handle save cropped image
  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsUploading(true);

    try {
      // Create cropped image blob
      const croppedBlob = await createCroppedImage(imageSrc, croppedAreaPixels);

      // Create FormData for upload
      const formData = new FormData();
      formData.append("file", croppedBlob, "avatar.jpg");
      formData.append("type", "avatar");

      // Upload to API
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("آپلود تصویر ناموفق بود");
      }

      const data = await response.json();

      // Update parent component with new URLs
      onChange(data.url, data.thumbnailUrl);

      // Close dialog
      setIsDialogOpen(false);
      setImageSrc(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("خطا در آپلود تصویر. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setIsDialogOpen(false);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle remove avatar
  const handleRemove = () => {
    onChange("", "");
  };

  return (
    <div className="space-y-3">
      <Label>تصویر پروفایل</Label>

      <div className="flex items-center gap-4">
        {/* Avatar Preview */}
        <Avatar className="h-20 w-20">
          <AvatarImage src={value} alt="آواتار" />
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
            {fallbackInitials}
          </AvatarFallback>
        </Avatar>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 ml-2" />
            {value ? "تغییر تصویر" : "انتخاب تصویر"}
          </Button>

          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4 ml-2" />
              حذف تصویر
            </Button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        فرمت‌های مجاز: JPG، PNG، GIF (حداکثر ۵ مگابایت)
      </p>

      {/* Crop Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCancel}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تنظیم تصویر پروفایل</DialogTitle>
          </DialogHeader>

          <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          {/* Zoom Control */}
          <div className="space-y-2">
            <Label className="text-sm">بزرگ‌نمایی</Label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isUploading}
            >
              انصراف
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isUploading}
            >
              {isUploading ? "در حال آپلود..." : "ذخیره"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
