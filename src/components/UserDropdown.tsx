"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
  links: { href: string; label: string; svg: string; external?: boolean }[];
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  student: { label: "Student", color: "text-emerald-400" },
  instructor: { label: "Instructor", color: "text-blue-400" },
  admin: { label: "Admin", color: "text-purple-400" },
};

export default function UserDropdown({ name, email, avatarUrl, role, links }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = (name || email || "U")[0].toUpperCase();
  const roleInfo = ROLE_LABELS[role] || ROLE_LABELS.student;

  return (
    <div className="relative" ref={ref}>
      {/* Avatar button */}
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 outline-none">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-emerald-500/30 hover:border-emerald-500/60 transition-colors" />
        ) : (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-black text-sm font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-shadow">
            {initials}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Mobile backdrop */}
          <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 z-50 rounded-2xl border border-white/[0.1] shadow-2xl shadow-black/50 overflow-hidden animate-fade-in" style={{ background: "var(--bg-card)" }}>
            {/* User info */}
            <div className="px-4 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white/10" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-black text-base font-bold shrink-0">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{name || "ผู้ใช้"}</p>
                  <p className="text-[10px] font-mono truncate" style={{ color: "var(--text-muted)" }}>{email}</p>
                  <p className={`text-[10px] font-medium ${roleInfo.color}`}>{roleInfo.label}</p>
                </div>
              </div>
            </div>

            {/* Menu links */}
            <div className="py-1.5">
              {links.map((l) => {
                const Tag = l.external ? "a" : Link;
                const extraProps = l.external ? { target: "_blank" as const, rel: "noopener noreferrer" } : {};
                return (
                  <Tag key={l.href} href={l.href} {...extraProps} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/[0.04] transition-colors group">
                    <svg className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={l.svg} /></svg>
                    <span className="text-white group-hover:text-emerald-400 transition-colors">{l.label}</span>
                    {l.external && <svg className="w-3 h-3 ml-auto" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>}
                  </Tag>
                );
              })}
            </div>

            {/* Logout */}
            <div className="border-t border-white/[0.06] py-1.5">
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left hover:bg-white/[0.04] transition-colors group">
                <svg className="w-4 h-4 shrink-0 text-red-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span className="text-red-400">ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
