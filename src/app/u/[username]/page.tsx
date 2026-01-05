import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PublicHeader from "@/components/layout/PublicHeader";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  // Await params before using them
  const { username } = await params;

  // TODO: دریافت اطلاعات پروفایل واقعی از دیتابیس
  const mockProfile = {
    fullName: "علی محمدی",
    professionalTitle: "تحلیلگر مالی ارشد",
    employmentStatus: "جویای فرصت شغلی",
    summary:
      "متخصص در تحلیل بنیادی و ارزیابی سرمایه‌گذاری با بیش از 5 سال تجربه در بازار سرمایه",
    skills: ["IFRS", "تحلیل بنیادی", "Excel پیشرفته", "Power BI"],
    experiences: [
      {
        title: "تحلیلگر مالی ارشد",
        company: "شرکت سرمایه‌گذاری نمونه",
        period: "1400 - 1403",
      },
    ],
  };

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-secondary/30">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-6 flex-col md:flex-row">
                {/* Avatar Placeholder */}
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl font-bold text-primary">
                    {mockProfile.fullName.charAt(0)}
                  </span>
                </div>

                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">
                    {mockProfile.fullName}
                  </h1>
                  <p className="text-xl text-muted-foreground mb-3">
                    {mockProfile.professionalTitle}
                  </p>
                  <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {mockProfile.employmentStatus}
                  </div>
                </div>

                <Button variant="outline">
                  {/* TODO: پیاده‌سازی دانلود PDF */}
                  دانلود رزومه PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>خلاصه</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {mockProfile.summary}
              </p>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>مهارت‌ها</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mockProfile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-secondary rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>سوابق کاری</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProfile.experiences.map((exp, idx) => (
                  <div key={idx} className="border-r-2 border-primary pr-4">
                    <h3 className="font-semibold">{exp.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {exp.company}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {exp.period}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center py-6 text-sm text-muted-foreground">
            <p>این پروفایل توسط کاربرگ ساخته شده است.</p>
            <p className="mt-2">
              <strong>توجه:</strong> این یک صفحه placeholder است با داده‌های
              نمونه.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
