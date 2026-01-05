"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle2, XCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadFile } from "@/lib/storage";

export default function UploadTestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    url?: string;
    error?: string;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
      
      // Create preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadResult({
        success: false,
        error: "لطفاً یک فایل انتخاب کنید",
      });
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const result = await uploadFile(
        selectedFile,
        "photo",
        "test-user" // userId parameter is not used in uploadFile function
      );

      setUploadResult(result);

      if (result.success && result.url) {
        // Clean up preview URL
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadResult({
        success: false,
        error: "خطا در آپلود فایل. لطفاً دوباره تلاش کنید.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">تست آپلود تصویر به Liara Object Storage</h1>
        <p className="text-muted-foreground">
          این صفحه برای تست عملکرد آپلود تصویر به Liara Object Storage استفاده می‌شود.
        </p>
      </div>

      <Card className="border-blue-500 bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 توجه: برای آپلود موفق، باید وارد سیستم شوید. در صورت عدم ورود، خطای احراز هویت نمایش داده می‌شود.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>آپلود تصویر</CardTitle>
          <CardDescription>
            فرمت‌های مجاز: JPG, PNG, WebP • حداکثر حجم: 5 مگابایت
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              انتخاب فایل
            </label>
            <div className="flex gap-4 items-center">
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileSelect}
                className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                disabled={isUploading}
              />
            </div>
            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                <p>نام فایل: {selectedFile.name}</p>
                <p>حجم: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <p>نوع: {selectedFile.type}</p>
              </div>
            )}
          </div>

          {/* Preview */}
          {previewUrl && !uploadResult?.success && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">پیش‌نمایش</label>
              <div className="border rounded-lg p-4 bg-muted/50">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-64 mx-auto rounded"
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex gap-4">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  در حال آپلود...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 ml-2" />
                  آپلود
                </>
              )}
            </Button>
            {selectedFile && (
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isUploading}
              >
                پاک کردن
              </Button>
            )}
          </div>

          {/* Upload Result */}
          {uploadResult && (
            <Card
              className={
                uploadResult.success
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-red-500 bg-red-50 dark:bg-red-900/20"
              }
            >
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  {uploadResult.success ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <h3 className="font-semibold text-green-800 dark:text-green-200">
                        آپلود موفق
                      </h3>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <h3 className="font-semibold text-red-800 dark:text-red-200">
                        خطا در آپلود
                      </h3>
                    </>
                  )}
                </div>

                {uploadResult.success && uploadResult.url && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        URL تصویر آپلود شده:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={uploadResult.url}
                          readOnly
                          className="flex-1 px-3 py-2 text-sm border rounded-md bg-background font-mono"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(uploadResult.url!);
                          }}
                        >
                          کپی
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        پیش‌نمایش تصویر:
                      </label>
                      <div className="border rounded-lg p-4 bg-background">
                        <img
                          src={uploadResult.url}
                          alt="Uploaded"
                          className="max-w-full max-h-96 mx-auto rounded"
                          onError={(e) => {
                            console.error("Image load error:", e);
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(uploadResult.url, "_blank")}
                      >
                        <ImageIcon className="w-4 h-4 ml-2" />
                        باز کردن در تب جدید
                      </Button>
                    </div>
                  </div>
                )}

                {uploadResult.error && (
                  <div>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {uploadResult.error}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • این صفحه برای تست عملکرد آپلود تصویر به Liara Object Storage استفاده می‌شود.
          </p>
          <p>
            • تصاویر آپلود شده به صورت عمومی قابل دسترسی هستند.
          </p>
          <p>
            • تصاویر به صورت خودکار به فرمت JPEG و با کیفیت 85% بهینه‌سازی می‌شوند.
          </p>
          <p>
            • حداکثر سایز تصویر: 800x800 پیکسل (حفظ نسبت تصویر).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

