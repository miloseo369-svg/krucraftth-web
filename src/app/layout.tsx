import type { Metadata } from "next";
import { Prompt, Kanit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/Toast";
import { ConfirmProvider } from "@/components/ConfirmModal";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
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
    <html lang="th" className={cn("h-full antialiased", prompt.variable, kanit.variable)}>
      <body className="font-[family-name:var(--font-prompt)] min-h-full flex flex-col text-white" style={{ background: "var(--bg-primary)", lineHeight: "1.6" }}>
        <ToastProvider>
          <ConfirmProvider>
            {children}
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
