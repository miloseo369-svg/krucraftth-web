"use client";

import { useState } from "react";

export default function WishlistButton({ courseId, initialSaved }: { courseId: string; initialSaved?: boolean }) {
  const [saved, setSaved] = useState(initialSaved ?? false);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId }) });
    const data = await res.json();
    if (res.ok) setSaved(data.saved);
    setLoading(false);
  }

  return (
    <button onClick={toggle} disabled={loading} className={`p-2 rounded-xl border transition-all active:scale-95 ${saved ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-white/5 border-white/[0.07] hover:border-white/[0.15]"}`} style={!saved ? { color: "var(--text-muted)" } : {}} title={saved ? "ลบออกจากรายการที่ชอบ" : "บันทึกคอร์ส"}>
      <svg className="w-4 h-4" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
    </button>
  );
}
