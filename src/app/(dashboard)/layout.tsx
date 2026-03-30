import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import UserDropdown from "@/components/UserDropdown";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role, full_name, avatar_url").eq("id", user.id).maybeSingle();
  const role = profile?.role ?? "student";

  const navLinks = [
    { href: "/dashboard", label: "แดชบอร์ด" },
    { href: "/courses", label: "คอร์ส" },
    { href: "/shop", label: "ร้านค้า" },
    { href: "/orders", label: "คำสั่งซื้อ" },
  ];

  const dropdownLinks = [
    { href: "/dashboard", label: "แดชบอร์ด", svg: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { href: "/orders", label: "คำสั่งซื้อ", svg: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { href: "/credits", label: "เครดิตของฉัน", svg: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { href: "/affiliate", label: "แนะนำเพื่อน", svg: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
    { href: "/doc-creator", label: "สร้างเอกสาร", svg: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { href: "/ebook-maker", label: "ทำปก Ebook", svg: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
    { href: "https://gemini.google.com/app", label: "AI Gems", svg: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z", external: true },
    ...(role === "admin" ? [{ href: "/admin", label: "จัดการระบบ", svg: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" }] : []),
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)", backdropFilter: "blur(var(--glass-blur))" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12 sm:h-14">
          <div className="flex items-center gap-4 sm:gap-6">
            <Logo href="/dashboard" />
            <div className="flex items-center gap-0.5 sm:gap-1">
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} className="text-[11px] sm:text-sm px-2 sm:px-3 py-1.5 rounded-lg transition text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.04]">{l.label}</Link>
              ))}
            </div>
          </div>
          <UserDropdown
            name={profile?.full_name || user.user_metadata?.full_name || ""}
            email={user.email || ""}
            avatarUrl={profile?.avatar_url || user.user_metadata?.avatar_url}
            role={role}
            links={dropdownLinks}
          />
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8">{children}</main>
    </div>
  );
}
