"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/Toast";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  bg_color: string;
  href: string | null;
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
}

const COLORS = [
  { value: "emerald", label: "เขียว", class: "bg-emerald-500" },
  { value: "blue", label: "ฟ้า", class: "bg-blue-500" },
  { value: "amber", label: "เหลือง", class: "bg-amber-500" },
  { value: "red", label: "แดง", class: "bg-red-500" },
  { value: "purple", label: "ม่วง", class: "bg-purple-500" },
];

const TYPES = [
  { value: "info", label: "ข้อมูล" },
  { value: "promo", label: "โปรโมชัน" },
  { value: "warning", label: "เตือน" },
  { value: "update", label: "อัปเดต" },
];

export default function AnnouncementsManager({ announcements }: { announcements: Announcement[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [bgColor, setBgColor] = useState("emerald");
  const [href, setHref] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [endsAt, setEndsAt] = useState("");

  function resetForm() {
    setTitle(""); setMessage(""); setType("info"); setBgColor("emerald"); setHref(""); setIsActive(true); setEndsAt(""); setEditingId(null); setShowForm(false);
  }

  function openEdit(a: Announcement) {
    setTitle(a.title); setMessage(a.message); setType(a.type); setBgColor(a.bg_color); setHref(a.href || ""); setIsActive(a.is_active); setEndsAt(a.ends_at ? a.ends_at.slice(0, 16) : ""); setEditingId(a.id); setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const body = { title, message, type, bg_color: bgColor, href: href || null, is_active: isActive, ends_at: endsAt || null };

    const res = editingId
      ? await fetch("/api/admin/announcements", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingId, ...body }) })
      : await fetch("/api/admin/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

    if (res.ok) { showToast(editingId ? "บันทึกสำเร็จ" : "สร้างประกาศสำเร็จ", "success"); resetForm(); }
    else { const d = await res.json(); showToast(d.error || "เกิดข้อผิดพลาด", "error"); }
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("ลบประกาศนี้?")) return;
    const res = await fetch("/api/admin/announcements", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (res.ok) { showToast("ลบสำเร็จ", "success"); router.refresh(); }
  }

  async function handleToggle(a: Announcement) {
    await fetch("/api/admin/announcements", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: a.id, is_active: !a.is_active }) });
    showToast(a.is_active ? "ปิดประกาศแล้ว" : "เปิดประกาศแล้ว", "success");
    router.refresh();
  }

  const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm outline-none transition bg-[var(--bg-primary)] border border-white/[0.07] text-white placeholder:text-[var(--text-muted)] focus:border-emerald-500/40";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">ประกาศ</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">สร้างแบนเนอร์ประกาศแสดงบนหน้าเว็บทุกหน้า</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 active:scale-95 transition-all">
          + สร้างประกาศ
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={resetForm}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="rounded-2xl border border-white/[0.1] w-full max-w-lg p-6 space-y-4 animate-fade-in max-h-[90vh] overflow-y-auto" style={{ background: "var(--bg-card)" }}>
            <h2 className="text-lg font-semibold text-white">{editingId ? "แก้ไขประกาศ" : "สร้างประกาศใหม่"}</h2>

            <div>
              <label className="block text-xs font-medium text-white mb-1.5">หัวข้อ *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="เช่น โปรโมชันพิเศษ!" className={inputClass} />
            </div>

            <div>
              <label className="block text-xs font-medium text-white mb-1.5">ข้อความ *</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={2} placeholder="เช่น สมัครวันนี้ รับส่วนลด 20%!" className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white mb-1.5">ประเภท</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
                  {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1.5">สีแบนเนอร์</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button key={c.value} type="button" onClick={() => setBgColor(c.value)} className={`w-8 h-8 rounded-lg ${c.class} transition ${bgColor === c.value ? "ring-2 ring-white ring-offset-2 ring-offset-[var(--bg-card)]" : "opacity-50 hover:opacity-75"}`} title={c.label} />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white mb-1.5">ลิงก์ CTA (ถ้ามี)</label>
              <input type="text" value={href} onChange={(e) => setHref(e.target.value)} placeholder="เช่น /courses หรือ /credits" className={inputClass} />
            </div>

            <div>
              <label className="block text-xs font-medium text-white mb-1.5">หมดอายุ (ถ้ามี)</label>
              <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={inputClass} />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-emerald-500" />
              <span className="text-sm text-white">เปิดใช้งานทันที</span>
            </label>

            {/* Preview */}
            <div className={`rounded-xl p-3 text-center text-sm font-medium text-black ${COLORS.find((c) => c.value === bgColor)?.class || "bg-emerald-500"}`}>
              {title || "ตัวอย่างประกาศ"} — {message || "ข้อความประกาศ"} {href && <span className="underline ml-1">คลิก →</span>}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl text-sm font-medium border border-white/[0.07] hover:bg-white/5 transition" style={{ color: "var(--text-secondary)" }}>ยกเลิก</button>
              <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 active:scale-95 transition-all disabled:opacity-50">
                {loading ? "กำลังบันทึก..." : editingId ? "บันทึก" : "สร้างประกาศ"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {announcements.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.07] p-12 text-center" style={{ background: "var(--bg-card)" }}>
          <p className="text-sm text-[var(--text-muted)]">ยังไม่มีประกาศ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className={`rounded-xl border border-white/[0.07] p-4 ${a.is_active ? "" : "opacity-50"}`} style={{ background: "var(--bg-card)" }}>
              <div className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${COLORS.find((c) => c.value === a.bg_color)?.class || "bg-emerald-500"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{a.title}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-[var(--text-muted)]">{TYPES.find((t) => t.value === a.type)?.label}</span>
                    {a.is_active ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">เปิด</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-[var(--text-muted)]">ปิด</span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{a.message}</p>
                  {a.href && <p className="text-[10px] text-blue-400 mt-1">→ {a.href}</p>}
                  {a.ends_at && <p className="text-[10px] text-[var(--text-muted)] mt-1">หมดอายุ: {new Date(a.ends_at).toLocaleDateString("th-TH")}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleToggle(a)} className={`px-2 py-1 rounded text-xs font-medium transition ${a.is_active ? "text-yellow-400 hover:bg-yellow-500/10" : "text-emerald-400 hover:bg-emerald-500/10"}`}>
                    {a.is_active ? "ปิด" : "เปิด"}
                  </button>
                  <button onClick={() => openEdit(a)} className="px-2 py-1 rounded text-xs font-medium text-blue-400 hover:bg-blue-500/10 transition">แก้ไข</button>
                  <button onClick={() => handleDelete(a.id)} className="px-2 py-1 rounded text-xs font-medium text-red-400 hover:bg-red-500/10 transition">ลบ</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
