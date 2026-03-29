import type { Metadata } from "next";
import { Sarabun, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "KruCraft LMS — ระบบเรียนออนไลน์",
  description: "ระบบจัดการเรียนรู้ออนไลน์ด้วยวิดีโอ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={cn("h-full", "antialiased", sarabun.variable, "font-sans", geist.variable)}>
      <body className="font-[family-name:var(--font-sarabun)] min-h-full flex flex-col bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
