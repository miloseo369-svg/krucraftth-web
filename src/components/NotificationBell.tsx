"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  href: string | null;
  created_at: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function loadNotifications() {
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(10);
    if (data) {
      setNotifications(data);
      setUnread(data.filter((n) => !n.is_read).length);
    }
  }

  async function markAllRead() {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
  }

  const typeIcon: Record<string, string> = {
    success: "text-emerald-400",
    error: "text-red-400",
    info: "text-blue-400",
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => { setOpen(!open); if (!open) markAllRead(); }} className="relative p-1.5 rounded-lg hover:bg-white/[0.04] transition">
        <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{unread}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50 rounded-2xl border border-white/[0.1] shadow-2xl shadow-black/50 overflow-hidden animate-fade-in" style={{ background: "var(--bg-card)" }}>
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <span className="text-sm font-semibold text-white">แจ้งเตือน</span>
            {unread > 0 && <span className="text-[10px] text-emerald-400">อ่านทั้งหมดแล้ว</span>}
          </div>
          {notifications.length === 0 ? (
            <div className="p-8 text-center"><p className="text-xs text-[var(--text-muted)]">ไม่มีแจ้งเตือน</p></div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
              {notifications.map((n) => {
                const Wrapper = n.href ? Link : "div";
                return (
                  <Wrapper key={n.id} href={n.href || ""} onClick={() => setOpen(false)} className={`block px-4 py-3 hover:bg-white/[0.03] transition ${!n.is_read ? "bg-white/[0.02]" : ""}`}>
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === "success" ? "bg-emerald-400" : n.type === "error" ? "bg-red-400" : "bg-blue-400"}`} />
                      <div>
                        <p className="text-xs font-medium text-white">{n.title}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{n.message}</p>
                        <p className="text-[9px] text-[var(--text-muted)] mt-1">{formatTime(n.created_at)}</p>
                      </div>
                    </div>
                  </Wrapper>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMin < 1) return "เมื่อกี้";
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} ชม.ที่แล้ว`;
  return `${Math.floor(diffH / 24)} วันที่แล้ว`;
}
