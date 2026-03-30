"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Announcement {
  id: string;
  title: string;
  message: string;
  bg_color: string;
  href: string | null;
}

const COLOR_MAP: Record<string, string> = {
  emerald: "bg-emerald-500 text-black",
  blue: "bg-blue-500 text-white",
  amber: "bg-amber-500 text-black",
  red: "bg-red-500 text-white",
  purple: "bg-purple-500 text-white",
};

export default function GlobalAnnouncementBar() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/admin/announcements")
      .then((r) => r.json())
      .then((d) => setAnnouncements(d.announcements || []))
      .catch(() => {});
  }, []);

  const visible = announcements.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  const a = visible[0];
  const colorClass = COLOR_MAP[a.bg_color] || COLOR_MAP.emerald;

  return (
    <div className={`${colorClass} text-sm font-medium sticky top-0 z-[60]`}>
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-center gap-3">
        <span>{a.message}</span>
        {a.href && (
          <Link href={a.href} className="underline font-bold hover:opacity-80 transition">
            ดูเพิ่มเติม →
          </Link>
        )}
        <button onClick={() => setDismissed((prev) => new Set(prev).add(a.id))} className="ml-2 opacity-60 hover:opacity-100 transition" aria-label="ปิดประกาศ">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
}
