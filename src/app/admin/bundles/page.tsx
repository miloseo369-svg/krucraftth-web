"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { createClient } from "@/lib/supabase/client";

interface Bundle { id: string; title: string; description: string | null; original_price: number; bundle_price: number; is_active: boolean; bundle_courses: { course_id: string; courses: { title: string } | null }[]; }

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string; price: number }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", originalPrice: 0, bundlePrice: 0, courseIds: [] as string[] });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetch("/api/bundles").then((r) => r.json()).then(setBundles);
    supabase.from("courses").select("id, title, price").eq("is_published", true).then(({ data }) => setCourses(data ?? []));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/bundles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { toast("สร้าง Bundle สำเร็จ!", "success"); setShowForm(false); router.refresh(); fetch("/api/bundles").then((r) => r.json()).then(setBundles); }
    else toast("เกิดข้อผิดพลาด", "error");
    setLoading(false);
  }

  function toggleCourse(id: string) {
    setForm((f) => ({ ...f, courseIds: f.courseIds.includes(id) ? f.courseIds.filter((c) => c !== id) : [...f.courseIds, id] }));
  }

  const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm outline-none bg-[var(--bg-primary)] border border-white/[0.07] text-white focus:border-emerald-500/40";

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">แพ็คเกจคอร์ส (Bundle)</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>รวมหลายคอร์สขายราคาพิเศษ</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 active:scale-95 transition-all">+ สร้าง Bundle</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
          <form onSubmit={handleCreate} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-white/[0.1] p-6 space-y-4 animate-fade-in" style={{ background: "var(--bg-card)" }}>
            <h3 className="text-lg font-semibold text-white">สร้าง Bundle ใหม่</h3>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="ชื่อ Bundle" required className={inputClass} />
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="รายละเอียด" className={inputClass} />
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-white mb-1">ราคาเดิมรวม (฿)</label><input type="number" value={form.originalPrice || ""} onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })} className={inputClass} /></div>
              <div><label className="block text-xs text-white mb-1">ราคา Bundle (฿)</label><input type="number" value={form.bundlePrice || ""} onChange={(e) => setForm({ ...form, bundlePrice: Number(e.target.value) })} className={inputClass} /></div>
            </div>
            <div>
              <label className="block text-xs text-white mb-2">เลือกคอร์สใน Bundle</label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {courses.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.03] cursor-pointer">
                    <input type="checkbox" checked={form.courseIds.includes(c.id)} onChange={() => toggleCourse(c.id)} className="accent-emerald-500" />
                    <span className="text-sm text-white flex-1">{c.title}</span>
                    <span className="text-xs text-emerald-400">฿{c.price}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-black text-sm font-medium disabled:opacity-50">{loading ? "..." : "สร้าง Bundle"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-white/[0.07] text-sm" style={{ color: "var(--text-secondary)" }}>ยกเลิก</button>
            </div>
          </form>
        </div>
      )}

      {bundles.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-white/[0.07]" style={{ background: "var(--bg-card)" }}>
          <svg className="w-16 h-16 mx-auto mb-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          <p className="text-sm font-medium text-white">ยังไม่มี Bundle</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bundles.map((b) => (
            <div key={b.id} className="rounded-xl border border-white/[0.07] p-5" style={{ background: "var(--bg-card)" }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">{b.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs line-through" style={{ color: "var(--text-muted)" }}>฿{b.original_price}</span>
                  <span className="text-sm font-bold text-emerald-400">฿{b.bundle_price}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {b.bundle_courses?.map((bc) => (
                  <span key={bc.course_id} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/[0.07]" style={{ color: "var(--text-secondary)" }}>{(bc.courses as unknown as { title: string } | null)?.title}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
