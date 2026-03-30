import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getBalance } from "@/lib/credits";
import Link from "next/link";

export const metadata: Metadata = { title: "แดชบอร์ด" };

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "สวัสดีตอนเช้า";
  if (h < 17) return "สวัสดีตอนบ่าย";
  return "สวัสดีตอนเย็น";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user!.id).maybeSingle();

  const [{ data: enrollments }, { data: progress }, { count: certCount }, { count: docCount }, credits] = await Promise.all([
    supabase.from("enrollments").select("*, course:courses(id, title, thumbnail_url, modules(id, lessons(id)))").eq("user_id", user!.id),
    supabase.from("user_progress").select("lesson_id, is_completed").eq("user_id", user!.id),
    supabase.from("certificates").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
    supabase.from("generated_documents").select("*", { count: "exact", head: true }).eq("user_id", user!.id).then((r) => ({ count: r.count ?? 0 })),
    getBalance(user!.id),
  ]);

  const completedIds = new Set(progress?.filter((p) => p.is_completed).map((p) => p.lesson_id) ?? []);
  const courseProgress = enrollments?.map((e) => {
    const total = e.course?.modules?.reduce((a: number, m: { lessons: unknown[] | null }) => a + (m.lessons?.length ?? 0), 0) ?? 0;
    const ids = e.course?.modules?.flatMap((m: { lessons: { id: string }[] | null }) => m.lessons?.map((l) => l.id) ?? []) ?? [];
    const done = ids.filter((id: string) => completedIds.has(id)).length;
    return { ...e, total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
  }) ?? [];

  const completedCourses = courseProgress.filter((c) => c.percent === 100).length;
  const inProgress = courseProgress.filter((c) => c.percent > 0 && c.percent < 100).sort((a, b) => b.percent - a.percent);
  const notStarted = courseProgress.filter((c) => c.percent === 0);

  // Streak
  const { data: recentProgress } = await supabase.from("user_progress").select("updated_at").eq("user_id", user!.id).eq("is_completed", true).order("updated_at", { ascending: false }).limit(30);
  let streak = 0;
  if (recentProgress?.length) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const days = new Set(recentProgress.map((p) => new Date(p.updated_at).toDateString()));
    for (let i = 0; i < 30; i++) { const d = new Date(today); d.setDate(d.getDate() - i); if (days.has(d.toDateString())) streak++; else break; }
  }

  const displayName = profile?.full_name || user!.user_metadata?.full_name || "ครู";

  const stats = [
    { label: "คอร์สที่ซื้อ", value: enrollments?.length ?? 0, sub: null, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "เรียนจบแล้ว", value: completedCourses, sub: certCount ? `ใบเซอร์ ${certCount} ใบ` : null, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "เครดิตคงเหลือ", value: credits, sub: null, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "เอกสารที่สร้าง", value: docCount ?? 0, sub: "วิจัย / SAR / ใบงาน", color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="animate-fade-in">
      {/* Greeting + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">{getGreeting()}</p>
          <h1 className="text-xl sm:text-2xl font-bold text-white">คุณ{displayName}</h1>
          {streak > 0 && (
            <p className="text-sm text-amber-400 mt-1 flex items-center gap-1.5">
              เรียนต่อเนื่อง <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium">🔥 {streak} วัน</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/credits" className="px-4 py-2 rounded-xl text-xs font-medium border border-white/[0.1] text-white hover:bg-white/[0.04] transition-all">+ เพิ่มเครดิต</Link>
          <Link href="/doc-creator" className="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all">สร้างเอกสาร</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.07] p-4" style={{ background: "var(--bg-card)" }}>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: s.color.replace("text-", "").includes("emerald") ? "var(--em)" : undefined }}><span className={s.color}>{s.value.toLocaleString()}</span></p>
            <p className="text-xs mt-1 text-[var(--text-secondary)]">{s.label}</p>
            {s.sub && <p className="text-[10px] mt-0.5 text-[var(--text-muted)]">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* กำลังเรียน */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">กำลังเรียน</h2>
        <Link href="/courses" className="text-xs text-emerald-400 hover:text-emerald-300 transition">ดูทั้งหมด →</Link>
      </div>

      {courseProgress.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.07] p-12 text-center" style={{ background: "var(--bg-card)" }}>
          <svg className="w-12 h-12 mx-auto mb-3 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          <p className="text-sm font-medium text-white">ยังไม่ได้ลงทะเบียน</p>
          <Link href="/courses" className="inline-block mt-4 px-5 py-2 rounded-xl bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 active:scale-95 transition-all">เลือกคอร์สเรียน</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...inProgress, ...notStarted].map((cp) => (
            <Link key={cp.id} href={`/courses/${cp.course_id}`} className="group rounded-2xl border border-white/[0.07] overflow-hidden hover:border-emerald-500/20 transition-all" style={{ background: "var(--bg-card)" }}>
              {/* Thumbnail */}
              <div className="aspect-[16/10] relative overflow-hidden">
                {cp.course?.thumbnail_url ? (
                  <img src={cp.course.thumbnail_url} alt={cp.course?.title || "ปกคอร์ส"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-900/40 to-teal-800/20 flex items-center justify-center">
                    <svg className="w-10 h-10 text-emerald-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                  </div>
                )}
                {/* Progress overlay */}
                {cp.percent > 0 && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-sm text-emerald-400 border border-emerald-500/30">
                    {cp.percent}% เสร็จ
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors line-clamp-2">{cp.course?.title}</h3>
                {/* Progress bar */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" style={{ width: `${cp.percent}%` }} />
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] shrink-0">{cp.done}/{cp.total}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
