import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: enrollments }, { data: progress }, { count: certCount }, { data: purchases }] = await Promise.all([
    supabase.from("enrollments").select("*, course:courses(id, title, thumbnail_url, modules(id, lessons(id)))").eq("user_id", user!.id),
    supabase.from("user_progress").select("lesson_id, is_completed").eq("user_id", user!.id),
    supabase.from("certificates").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
    supabase.from("purchases").select("id, product:products(id, title)").eq("user_id", user!.id),
  ]);

  const completedIds = new Set(progress?.filter((p) => p.is_completed).map((p) => p.lesson_id) ?? []);
  const courseProgress = enrollments?.map((e) => {
    const total = e.course?.modules?.reduce((a: number, m: { lessons: unknown[] | null }) => a + (m.lessons?.length ?? 0), 0) ?? 0;
    const ids = e.course?.modules?.flatMap((m: { lessons: { id: string }[] | null }) => m.lessons?.map((l) => l.id) ?? []) ?? [];
    const done = ids.filter((id: string) => completedIds.has(id)).length;
    return { ...e, total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
  }) ?? [];

  return (
    <div className="animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
        {[
          { label: "กำลังเรียน", value: enrollments?.length ?? 0, gradient: "from-emerald-500 to-teal-400", svg: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
          { label: "บทเรียนที่จบ", value: completedIds.size, gradient: "from-blue-500 to-cyan-400", svg: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "ใบเซอร์", value: certCount ?? 0, gradient: "from-amber-500 to-orange-400", svg: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.07] p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3" style={{ background: "var(--bg-card)" }}>
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shrink-0 shadow-lg`}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.svg} /></svg>
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-white">{s.value}</p>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* คอร์สของฉัน */}
        <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: "var(--bg-card)" }}>
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <span className="text-sm font-semibold text-white">คอร์สของฉัน</span>
            </div>
            <Link href="/courses" className="text-[10px] sm:text-xs text-emerald-400 hover:text-emerald-300">ดูทั้งหมด →</Link>
          </div>
          {courseProgress.length === 0 ? (
            <div className="p-10 text-center">
              <svg className="w-10 h-10 mx-auto mb-2 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              <p className="text-xs text-white font-medium">ยังไม่ได้ลงทะเบียน</p>
              <Link href="/courses" className="inline-block mt-3 px-4 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-medium hover:bg-emerald-400 active:scale-95 transition-all">ดูคอร์ส</Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {courseProgress.map((cp) => (
                <Link key={cp.id} href={`/courses/${cp.course_id}`} className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-white/[0.03] transition-colors group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 border border-white/[0.07]">
                    {cp.course?.thumbnail_url ? (
                      <img src={cp.course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-900/30 to-teal-800/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-white group-hover:text-emerald-400 transition-colors truncate">{cp.course?.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${cp.percent}%` }} />
                      </div>
                      <span className="text-[10px] shrink-0" style={{ color: "var(--text-muted)" }}>{cp.percent}%</span>
                    </div>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black transition-all">เรียนต่อ</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* สินค้าของฉัน */}
        <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: "var(--bg-card)" }}>
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <span className="text-sm font-semibold text-white">สินค้าของฉัน</span>
            </div>
            <Link href="/orders" className="text-[10px] sm:text-xs text-emerald-400 hover:text-emerald-300">ดูทั้งหมด →</Link>
          </div>
          {!purchases || purchases.length === 0 ? (
            <div className="p-10 text-center">
              <svg className="w-10 h-10 mx-auto mb-2 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              <p className="text-xs text-white font-medium">ยังไม่มีสินค้า</p>
              <Link href="/shop" className="inline-block mt-3 px-4 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-400 active:scale-95 transition-all">ไปร้านค้า</Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {purchases.slice(0, 5).map((p) => (
                <Link key={p.id} href={`/orders/${p.id}/download`} className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-white/[0.03] transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate flex-1">{(p.product as unknown as { title: string } | null)?.title || "สินค้า"}</p>
                  <span className="text-[10px] sm:text-xs text-emerald-400 font-medium shrink-0">ดาวน์โหลด →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
