"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { createClient } from "@/lib/supabase/client";

interface Gem {
  id: string;
  title: string;
  description: string | null;
  url: string;
  gradient: string;
  access_level: string;
  sort_order: number;
  is_active: boolean;
}

const GRADIENTS = [
  { value: "from-blue-500 to-cyan-400", label: "ฟ้า" },
  { value: "from-purple-500 to-pink-400", label: "ม่วง" },
  { value: "from-emerald-500 to-teal-400", label: "เขียว" },
  { value: "from-amber-500 to-orange-400", label: "ส้ม" },
  { value: "from-rose-500 to-red-400", label: "แดง" },
  { value: "from-indigo-500 to-blue-400", label: "คราม" },
  { value: "from-pink-500 to-rose-500", label: "ชมพู" },
  { value: "from-violet-500 to-purple-600", label: "ไวโอเลต" },
  { value: "from-teal-500 to-emerald-500", label: "เทา-เขียว" },
];

const ACCESS = [
  { value: "all", label: "ทุกคน", color: "text-emerald-400" },
  { value: "instructor", label: "ผู้สอน+", color: "text-blue-400" },
  { value: "admin", label: "Admin เท่านั้น", color: "text-red-400" },
];

export default function GemManager({ initialGems }: { initialGems: Gem[] }) {
  const [gems, setGems] = useState(initialGems);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Gem | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", url: "/admin/ai-tools", gradient: "from-blue-500 to-cyan-400", access_level: "all", sort_order: 0 });
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  function resetForm() {
    setForm({ title: "", description: "", url: "/admin/ai-tools", gradient: "from-blue-500 to-cyan-400", access_level: "all", sort_order: gems.length + 1 });
    setEditing(null);
    setShowForm(false);
  }

  function openEdit(g: Gem) {
    setForm({ title: g.title, description: g.description || "", url: g.url, gradient: g.gradient, access_level: g.access_level, sort_order: g.sort_order });
    setEditing(g);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast("กรุณาระบุชื่อ", "error"); return; }
    setLoading(true);
    try {
      if (editing) {
        await supabase.from("gem_links").update(form).eq("id", editing.id);
        toast("อัปเดตสำเร็จ", "success");
      } else {
        await supabase.from("gem_links").insert({ ...form, is_active: true });
        toast("เพิ่มสำเร็จ", "success");
      }
      resetForm();
      router.refresh();
    } catch {
      toast("เกิดข้อผิดพลาด", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("ลบ Gem นี้?")) return;
    await supabase.from("gem_links").delete().eq("id", id);
    setGems(gems.filter((g) => g.id !== id));
    toast("ลบสำเร็จ", "success");
  }

  async function toggleActive(g: Gem) {
    await supabase.from("gem_links").update({ is_active: !g.is_active }).eq("id", g.id);
    setGems(gems.map((x) => x.id === g.id ? { ...x, is_active: !x.is_active } : x));
    toast(g.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน", "success");
  }

  const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm outline-none transition bg-[var(--bg-primary)] border border-white/[0.07] text-white focus:border-emerald-500/40";

  return (
    <div>
      <button onClick={() => { resetForm(); setShowForm(true); }} className="mb-6 px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-medium text-sm hover:bg-emerald-400 active:scale-95 transition-all">
        + เพิ่ม Gem Link
      </button>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={resetForm}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-white/[0.1] p-6 animate-fade-in space-y-4" style={{ background: "var(--bg-card)" }}>
            <h3 className="text-lg font-semibold text-white">{editing ? "แก้ไข Gem" : "เพิ่ม Gem ใหม่"}</h3>

            <div>
              <label className="block text-xs font-medium text-white mb-1.5">ชื่อ *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="เช่น สร้างแผนการสอน" required className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">รายละเอียด</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="อธิบายสั้นๆ" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">URL</label>
              <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="/admin/ai-tools" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-white mb-1.5">สี</label>
                <select value={form.gradient} onChange={(e) => setForm({ ...form, gradient: e.target.value })} className={inputClass}>
                  {GRADIENTS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1.5">สิทธิ์เข้าถึง</label>
                <select value={form.access_level} onChange={(e) => setForm({ ...form, access_level: e.target.value })} className={inputClass}>
                  {ACCESS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">ลำดับ</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className={inputClass} />
            </div>
            {/* Preview */}
            <div className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.05]" style={{ background: "var(--bg-primary)" }}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${form.gradient} flex items-center justify-center shadow-lg shrink-0`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{form.title || "ตัวอย่าง"}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{form.description || "รายละเอียด"}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 active:scale-95 transition-all disabled:opacity-50">
                {loading ? "กำลังบันทึก..." : editing ? "อัปเดต" : "เพิ่ม Gem"}
              </button>
              <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl border border-white/[0.07] text-sm hover:bg-white/5 transition" style={{ color: "var(--text-secondary)" }}>ยกเลิก</button>
            </div>
          </form>
        </div>
      )}

      {/* Gem List */}
      <div className="space-y-2">
        {gems.map((g) => (
          <div key={g.id} className={`rounded-xl border border-white/[0.07] p-4 flex items-center gap-4 transition ${g.is_active ? "" : "opacity-50"}`} style={{ background: "var(--bg-card)" }}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${g.gradient} flex items-center justify-center shadow-lg shrink-0`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{g.title}</p>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{g.description || g.url}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${g.access_level === "all" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : g.access_level === "instructor" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
              {ACCESS.find((a) => a.value === g.access_level)?.label}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => toggleActive(g)} className={`px-2 py-1 rounded text-xs font-medium transition ${g.is_active ? "text-yellow-400 hover:bg-yellow-500/10" : "text-emerald-400 hover:bg-emerald-500/10"}`}>
                {g.is_active ? "ปิด" : "เปิด"}
              </button>
              <button onClick={() => openEdit(g)} className="px-2 py-1 rounded text-xs font-medium text-blue-400 hover:bg-blue-500/10 transition">แก้ไข</button>
              <button onClick={() => handleDelete(g.id)} className="px-2 py-1 rounded text-xs font-medium text-red-400 hover:bg-red-500/10 transition">ลบ</button>
            </div>
          </div>
        ))}
        {gems.length === 0 && (
          <div className="text-center py-16 rounded-xl border border-white/[0.07]" style={{ background: "var(--bg-card)" }}>
            <svg className="w-12 h-12 mx-auto mb-3 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
            <p className="text-xs font-medium text-white">ยังไม่มี Gem Links</p>
          </div>
        )}
      </div>
    </div>
  );
}
