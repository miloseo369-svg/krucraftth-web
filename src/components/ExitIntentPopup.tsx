"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface PopupData {
  id: string;
  popup_headline: string | null;
  popup_value: string | null;
  message: string;
  popup_cta_text: string;
  popup_dismiss_text: string;
  popup_countdown_minutes: number;
  popup_slots_total: number;
  popup_slots_claimed: number;
  href: string | null;
  bg_color: string;
}

export default function ExitIntentPopup() {
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [show, setShow] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/admin/announcements")
      .then((r) => r.json())
      .then((d) => {
        const p = (d.announcements || []).find((a: { display_mode: string }) => a.display_mode === "popup");
        if (p) setPopup(p);
      })
      .catch(() => {});
  }, []);

  // Exit intent detection
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY <= 0 && popup && !dismissed && !show) {
      const seen = sessionStorage.getItem(`popup_seen_${popup.id}`);
      if (!seen) {
        setShow(true);
        if (popup.popup_countdown_minutes > 0) {
          setCountdown(popup.popup_countdown_minutes * 60);
        }
        sessionStorage.setItem(`popup_seen_${popup.id}`, "1");
      }
    }
  }, [popup, dismissed, show]);

  useEffect(() => {
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [handleMouseLeave]);

  // Mobile: show after 15 seconds of inactivity
  useEffect(() => {
    if (!popup || dismissed) return;
    const seen = sessionStorage.getItem(`popup_seen_${popup.id}`);
    if (seen) return;

    const timer = setTimeout(() => {
      if (!show) {
        setShow(true);
        if (popup.popup_countdown_minutes > 0) {
          setCountdown(popup.popup_countdown_minutes * 60);
        }
        sessionStorage.setItem(`popup_seen_${popup.id}`, "1");
      }
    }, 15_000);
    return () => clearTimeout(timer);
  }, [popup, dismissed, show]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  if (!popup || !show || dismissed) return null;

  const slotsRemaining = popup.popup_slots_total > 0
    ? popup.popup_slots_total - popup.popup_slots_claimed
    : 0;
  const slotsPercent = popup.popup_slots_total > 0
    ? Math.round((popup.popup_slots_claimed / popup.popup_slots_total) * 100)
    : 0;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  const gradients: Record<string, string> = {
    emerald: "from-emerald-600 to-teal-500",
    blue: "from-blue-600 to-cyan-500",
    amber: "from-amber-500 to-orange-500",
    red: "from-red-600 to-rose-500",
    purple: "from-purple-600 to-pink-500",
  };
  const gradient = gradients[popup.bg_color] || gradients.red;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setDismissed(true)}>
      <div className="w-full max-w-sm animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Top gradient section */}
        <div className={`bg-gradient-to-br ${gradient} rounded-t-2xl p-6 text-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.15),transparent_70%)]" />
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
            </div>
            <p className="text-white/80 text-xs font-medium tracking-wider uppercase">
              {popup.popup_headline || "KHOAN — อย่าเพิ่งไป!"}
            </p>
            <p className="text-5xl font-black text-white mt-2 tracking-tight">{popup.popup_value || "พิเศษ!"}</p>
            <p className="text-white/80 text-xs mt-2 font-medium">{popup.message}</p>
          </div>
        </div>

        {/* Bottom white section */}
        <div className="bg-white rounded-b-2xl p-5 space-y-4">
          {/* Slots scarcity */}
          {popup.popup_slots_total > 0 && slotsRemaining > 0 && (
            <div className="border border-gray-200 rounded-xl p-3">
              <div className="flex justify-between text-sm font-bold text-gray-800 mb-2">
                <span>สิทธิ์เหลือ <span className="text-red-500">{slotsRemaining}</span></span>
                <span>ใช้ไปแล้ว <span className="text-emerald-600">{popup.popup_slots_claimed}</span></span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${slotsPercent}%`, background: `linear-gradient(to right, #22c55e, #f59e0b, #ef4444)` }} />
              </div>
              <p className="text-[10px] text-gray-500 text-center mt-1.5">{slotsPercent}% สิทธิ์ถูกใช้ไปแล้ว — กำลังหมดเร็ว</p>
            </div>
          )}

          {/* Countdown */}
          {countdown > 0 && (
            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-gray-200 bg-gray-50">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-xs text-gray-600">ข้อเสนอหมดใน:</span>
              <span className="font-mono font-black text-xl text-red-500">{String(minutes).padStart(2, "0")} : {String(seconds).padStart(2, "0")}</span>
            </div>
          )}

          {/* Urgency text */}
          <p className="text-xs text-center text-gray-500">
            ถ้าออกจากหน้านี้ ข้อเสนอนี้จะ <span className="text-red-500 font-bold underline">หมดทันที</span>
          </p>

          {/* CTA Button */}
          {popup.href ? (
            <Link href={popup.href} onClick={() => setDismissed(true)} className={`block w-full py-3.5 rounded-xl bg-gradient-to-r ${gradient} text-white font-bold text-center text-base shadow-lg hover:brightness-110 active:scale-95 transition-all`}>
              {popup.popup_cta_text || "รับข้อเสนอนี้!"}
            </Link>
          ) : (
            <button onClick={() => setDismissed(true)} className={`w-full py-3.5 rounded-xl bg-gradient-to-r ${gradient} text-white font-bold text-base shadow-lg hover:brightness-110 active:scale-95 transition-all`}>
              {popup.popup_cta_text || "รับข้อเสนอนี้!"}
            </button>
          )}

          {/* Dismiss */}
          <button onClick={() => setDismissed(true)} className="block w-full text-center text-xs text-gray-400 hover:text-gray-600 underline transition">
            {popup.popup_dismiss_text || "ไม่สนใจ"}
          </button>
        </div>
      </div>
    </div>
  );
}
