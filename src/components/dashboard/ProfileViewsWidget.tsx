"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Eye } from "lucide-react";

interface ProfileViewsWidgetProps {
  isActive?: boolean; // Will be true when job postings go live
}

export default function ProfileViewsWidget({ isActive = false }: ProfileViewsWidgetProps) {
  // Mock data - will be replaced with real data from backend
  const mockViews = 12;
  const mockDays = 7;

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Label */}
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Eye className="h-4 w-4" />
            میزان دیده‌شدن
          </h3>

          {isActive ? (
            <>
              {/* Views Count */}
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">{mockViews}</div>
                <p className="text-sm text-muted-foreground mt-1">بازدید</p>
              </div>

              {/* Period */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  در {mockDays} روز اخیر
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Inactive State */}
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Eye className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  به‌زودی پس از انتشار نیازمندی‌ها فعال می‌شود
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
