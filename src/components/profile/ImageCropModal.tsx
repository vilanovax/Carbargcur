"use client";

// @ts-nocheck
import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedBlob: Blob) => void;
}

export default function ImageCropModal({
  isOpen,
  onClose,
  imageUrl,
  onCropComplete,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 80,
    height: 80,
    x: 10,
    y: 10,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const size = Math.min(width, height);
    const x = (width - size) / 2;
    const y = (height - size) / 2;

    setCrop({
      unit: "px",
      width: size * 0.8,
      height: size * 0.8,
      x: x + size * 0.1,
      y: y + size * 0.1,
    });
  }, []);

  const getCroppedImg = async (
    image: HTMLImageElement,
    pixelCrop: PixelCrop
  ): Promise<Blob> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    // Set canvas size to the crop size
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        0.95
      );
    });
  };

  const handleCrop = async () => {
    if (!completedCrop || !imgRef.current) {
      return;
    }

    setIsProcessing(true);

    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      onCropComplete(croppedBlob);
      onClose();
    } catch (error) {
      console.error("Error cropping image:", error);
      alert("خطا در برش تصویر. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>برش تصویر پروفایل</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center items-center bg-gray-100 rounded-lg p-4 min-h-[400px]">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="تصویر برای برش"
              onLoad={onImageLoad}
              className="max-h-[500px] max-w-full"
            />
          </ReactCrop>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            انصراف
          </Button>
          <Button
            onClick={handleCrop}
            disabled={!completedCrop || isProcessing}
          >
            {isProcessing ? "در حال پردازش..." : "تأیید و ادامه"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
