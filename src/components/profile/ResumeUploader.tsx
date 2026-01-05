"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, FileText, Download } from "lucide-react";
import { uploadFile, deleteFile } from "@/lib/storage";

type ResumeUploaderProps = {
  currentResumeUrl?: string;
  currentFilename?: string;
  userName: string;
  onResumeChange: (url?: string, filename?: string) => void;
};

export default function ResumeUploader({
  currentResumeUrl,
  currentFilename,
  userName,
  onResumeChange,
}: ResumeUploaderProps) {
  const [resumeUrl, setResumeUrl] = useState<string | undefined>(currentResumeUrl);
  const [filename, setFilename] = useState<string | undefined>(currentFilename);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setIsUploading(true);

    // Upload file
    const result = await uploadFile(file, "resume", userName);

    if (result.success && result.url) {
      // Delete old resume if exists
      if (resumeUrl) {
        deleteFile(resumeUrl);
      }

      setResumeUrl(result.url);
      setFilename(file.name);
      onResumeChange(result.url, file.name);
    } else {
      setError(result.error || "خطا در آپلود رزومه");
    }

    setIsUploading(false);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = () => {
    if (!resumeUrl) return;

    if (confirm("آیا از حذف فایل رزومه خود مطمئن هستید؟")) {
      deleteFile(resumeUrl);
      setResumeUrl(undefined);
      setFilename(undefined);
      onResumeChange(undefined, undefined);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownload = () => {
    if (!resumeUrl) return;

    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = resumeUrl;
    link.download = filename || "resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 md:p-6">
        <div className="space-y-4">
          {/* Header */}
          <div>
            <p className="text-sm font-medium">رزومه (PDF)</p>
            <p className="text-xs text-muted-foreground mt-1">
              فرمت: PDF • حداکثر: 10 مگابایت
            </p>
          </div>

          {/* Current Resume Display */}
          {resumeUrl && filename && (
            <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
              <FileText className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{filename}</p>
                <p className="text-xs text-muted-foreground">فایل رزومه آپلود شده</p>
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="text-xs"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Upload Controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
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
              {isUploading ? "در حال آپلود..." : resumeUrl ? "تغییر رزومه" : "آپلود رزومه"}
            </Button>

            {resumeUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isUploading}
                className="text-xs md:text-sm text-destructive hover:text-destructive"
              >
                <X className="w-4 h-4 ml-2" />
                حذف رزومه
              </Button>
            )}
          </div>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          {/* Helper Text */}
          {!resumeUrl && (
            <p className="text-xs text-muted-foreground">
              آپلود رزومه اختیاری است. می‌توانید رزومه خود را از بخش «مشاهده رزومه» دانلود کنید.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
