import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: "کاربرگ | پلتفرم استخدام حرفه‌ای",
  description: "پلتفرم استخدام و پروفایل حرفه‌ای برای متخصصان حوزه‌های مالی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
