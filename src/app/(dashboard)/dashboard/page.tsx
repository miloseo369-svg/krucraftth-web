import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ProgressBar2 from "@/components/ui/ProgressBar2";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: enrollments }, { data: progress }, { count: certCount }] = await Promise.all([
    supabase.from("enrollments").select("*, course:courses(*, modules(id, lessons(id)))").eq("user_id", user!.id),
    supabase.from("user_progress").select("lesson_id, is_completed").eq("user_id", user!.id),
    supabase.from("certificates").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
  ]);

  const completedIds = new Set(progress?.filter((p) => p.is_completed).map((p) => p.lesson_id) ?? []);

  const courseProgress = enrollments?.map((e) => {
    const total = e.course?.modules?.reduce((a: number, m: { lessons: unknown[] | null }) => a + (m.lessons?.length ?? 0), 0) ?? 0;
    const ids = e.course?.modules?.flatMap((m: { lessons: { id: string }[] | null }) => m.lessons?.map((l) => l.id) ?? []) ?? [];
    const done = ids.filter((id: string) => completedIds.has(id)).length;
    return { ...e, total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
  }) ?? [];

  const stats = [
    { label: "กำลังเรียน", value: enrollments?.length ?? 0, icon: "📚" },
    { label: "บทเรียนที่จบ", value: completedIds.size, icon: "✅" },
    { label: "ใบเซอร์", value: certCount ?? 0, icon: "🏆" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">สวัสดี, {user?.user_metadata?.full_name || "ผู้เรียน"} 👋</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{new Date().toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.label}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-2xl font-semibold text-white">{s.value}</span>
              <span className="text-sm">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* My Courses */}
      <h2 className="text-lg font-medium text-white mb-4">คอร์สของฉัน</h2>
      {courseProgress.length === 0 ? (
        <div className="rounded-xl border p-16 text-center" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <p className="text-sm text-white font-medium">ยังไม่ได้ลงทะเบียน</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>เลือกคอร์สที่สนใจ</p>
          <Link href="/courses" className="inline-block mt-4 px-5 py-2 rounded-lg bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 active:scale-95 transition-all">ดูคอร์สทั้งหมด</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courseProgress.map((cp) => (
            <Link key={cp.id} href={`/courses/${cp.course_id}`} className="group rounded-xl overflow-hidden border hover:-translate-y-0.5 transition-all duration-200" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div className="aspect-video relative overflow-hidden">
                {cp.course?.thumbnail_url ? (
                  <img src={cp.course.thumbnail_url} alt={cp.course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-900/40 to-emerald-700/20" />
                )}
                {cp.percent === 100 && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-black text-xs font-medium">เรียนจบ ✓</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-white group-hover:text-emerald-400 transition">{cp.course?.title}</h3>
                <ProgressBar2 percent={cp.percent} className="mt-3" />
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{cp.done}/{cp.total} บทเรียน</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
