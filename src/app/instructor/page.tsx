import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function InstructorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).maybeSingle();
  if (!profile || !["instructor", "admin"].includes(profile.role)) redirect("/dashboard");

  const { data: courses } = await supabase.from("courses").select("*, modules(id, lessons(id))").eq("instructor_id", user.id).order("created_at", { ascending: false });

  const courseIds = courses?.map((c) => c.id) ?? [];
  let totalEnrollments = 0;
  if (courseIds.length > 0) {
    const { count } = await supabase.from("enrollments").select("*", { count: "exact", head: true }).in("course_id", courseIds);
    totalEnrollments = count ?? 0;
  }

  const totalLessons = courses?.reduce((acc, c) => acc + (c.modules?.reduce((a: number, m: { lessons: unknown[] | null }) => a + (m.lessons?.length ?? 0), 0) ?? 0), 0) ?? 0;

  const stats = [
    { label: "คอร์สของฉัน", value: courses?.length ?? 0, icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "บทเรียนทั้งหมด", value: totalLessons, icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "นักเรียนลงทะเบียน", value: totalEnrollments, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Instructor Nav — distinct accent bar */}
      <nav className="sticky top-0 z-30 backdrop-blur-xl border-b" style={{ background: "rgba(10,10,10,0.8)", borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-semibold text-emerald-400">KruCraft</Link>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">ผู้สอน</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs hidden sm:block" style={{ color: "var(--text-muted)" }}>{profile.full_name}</span>
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/40 transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              แดชบอร์ด
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">แดชบอร์ดผู้สอน</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>จัดการคอร์สและติดตามผลการเรียนของนักเรียน</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className={`rounded-xl border p-5 ${s.border}`} style={{ background: "var(--bg-card)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                  <p className="text-3xl font-semibold text-white mt-1">{s.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <svg className={`w-6 h-6 ${s.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* My Courses */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white">คอร์สของฉัน</h2>
          {profile.role === "admin" && (
            <Link href="/admin/courses" className="text-sm text-emerald-400 hover:text-emerald-300 transition">จัดการคอร์สทั้งหมด →</Link>
          )}
        </div>

        {courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => {
              const lessonCount = course.modules?.reduce((a: number, m: { lessons: unknown[] | null }) => a + (m.lessons?.length ?? 0), 0) ?? 0;
              return (
                <Link key={course.id} href={`/courses/${course.id}`} className="group rounded-xl overflow-hidden border hover:-translate-y-0.5 hover:shadow-[0_0_30px_var(--accent-glow)] transition-all duration-200" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                  <div className="aspect-video relative overflow-hidden">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-900/40 to-blue-700/20 flex items-center justify-center">
                        <svg className="w-12 h-12 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${course.is_published ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"}`}>
                        {course.is_published ? "เผยแพร่" : "ร่าง"}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-white group-hover:text-emerald-400 transition">{course.title}</h3>
                    <div className="flex items-center justify-between mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      <span>{lessonCount} บทเรียน</span>
                      <span className="font-medium text-white">{course.price === 0 ? "ฟรี" : `฿${course.price.toLocaleString()}`}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border p-16 text-center" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="w-16 h-16 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h3 className="text-white font-medium mb-1">ยังไม่มีคอร์ส</h3>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>ติดต่อ admin เพื่อสร้างคอร์สและมอบหมายให้คุณ</p>
          </div>
        )}
      </div>
    </div>
  );
}
