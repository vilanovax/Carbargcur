import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/shared/EmptyState";

export default function ResumePage() {
  // TODO: چک کردن اینکه پروفایل کامل است یا نه
  const hasCompleteProfile = false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">رزومه حرفه‌ای</h1>
          <p className="text-muted-foreground">
            پیش‌نمایش و دانلود رزومه خود
          </p>
        </div>
        <Button disabled={!hasCompleteProfile}>دانلود فایل PDF</Button>
      </div>

      {hasCompleteProfile ? (
        <Card>
          <CardContent className="p-8">
            {/* TODO: نمایش پیش‌نمایش رزومه */}
            <div className="border-2 border-dashed rounded-lg p-12 text-center">
              <p className="text-muted-foreground">
                پیش‌نمایش رزومه اینجا نمایش داده می‌شود
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              title="برای دریافت رزومه PDF، ابتدا پروفایل خود را کامل کنید"
              description="رزومه شما به صورت خودکار از اطلاعات پروفایل شما ساخته می‌شود"
            />
            <div className="p-6 border-t bg-secondary/30">
              <h3 className="font-semibold mb-3">برای تکمیل پروفایل نیاز است:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  <span>نام و عنوان شغلی</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  <span>حداقل 3 مهارت</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  <span>حداقل یک سابقه کاری</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TODO Notice */}
      <Card className="bg-secondary/50">
        <CardContent className="p-6">
          <p className="text-sm text-center">
            <strong>توجه:</strong> تولید و دانلود رزومه PDF در مراحل بعدی
            پیاده‌سازی می‌شود.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
