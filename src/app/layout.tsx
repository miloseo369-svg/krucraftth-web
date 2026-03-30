import type { Metadata, Viewport } from "next";
import { Sora, Sarabun, Prompt, Kanit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/Toast";
import { ConfirmProvider } from "@/components/ConfirmModal";
import GlobalAnnouncementBar from "@/components/AnnouncementBar";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "KruCraft — แพลตฟอร์มเรียนออนไลน์สำหรับครูไทย",
    template: "%s | KruCraft",
  },
  description: "แพลตฟอร์มเรียนออนไลน์สำหรับครูไทย สร้างสื่อการสอน คอร์สเรียน และเอกสารอัจฉริยะ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={cn("h-full antialiased", sora.variable, sarabun.variable, prompt.variable, kanit.variable)}>
      <body className="font-[family-name:var(--font-sarabun)] min-h-full flex flex-col text-white" style={{ background: "var(--bg-primary)", lineHeight: "1.6" }}>
        <ToastProvider>
          <ConfirmProvider>
            <GlobalAnnouncementBar />
            {children}
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
