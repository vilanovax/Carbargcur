"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, TrendingUp } from "lucide-react";
import { getMockViewData, getViewIncreaseReason } from "@/lib/profileEvents";

interface ProfileViewsWidgetProps {
  isActive?: boolean; // Will be true when job postings go live
}

export default function ProfileViewsWidget({ isActive = false }: ProfileViewsWidgetProps) {
  const [viewData, setViewData] = useState<{
    currentViews: number;
    previousViews: number;
    hasIncrease: boolean;
    increasePercentage: number;
  } | null>(null);

  const [reason, setReason] = useState<string>("");

  useEffect(() => {
    // Load mock data on client side
    if (isActive) {
      const data = getMockViewData();
      setViewData(data);

      // Get explanation for view increase
      if (data.hasIncrease) {
        const explanation = getViewIncreaseReason();
        setReason(explanation);
      }
    }
  }, [isActive]);

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Label */}
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Eye className="h-4 w-4" />
            میزان دیده‌شدن
          </h3>

          {isActive && viewData ? (
            <>
              {/* Views Count */}
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {viewData.currentViews}
                </div>
                <p className="text-sm text-muted-foreground mt-1">بازدید</p>
              </div>

              {/* Period */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">در ۷ روز اخیر</p>
              </div>

              {/* View Increase Reason - Only show if there's an increase */}
              {viewData.hasIncrease && reason && (
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-lg py-2 px-3">
                    <TrendingUp className="h-3 w-3" />
                    <span className="font-medium">{reason}</span>
                  </div>
                </div>
              )}
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
