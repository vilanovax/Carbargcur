import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <div className="flex">
        <AppSidebar />
        {/* Main content با padding برای mobile bottom nav */}
        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8">{children}</main>
      </div>
    </div>
  );
}
