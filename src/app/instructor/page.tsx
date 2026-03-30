import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = { title: "ผู้สอน" };
import PremiumCourseCard from "@/components/PremiumCourseCard";
import OnboardingChecklist from "@/components/OnboardingChecklist";
import Logo from "@/components/Logo";

export default async function InstructorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).maybeSingle();
  if (!profile || !["instructor", "admin"].includes(profile.role)) redirect("/dashboard");

  const { data: courses } = await supabase.from("courses").select("*, modules(id, lessons(id))").eq("instructor_id", user.id).order("created_at", { ascending: false });

  const courseIds = courses?.map((c) => c.id) ?? [];
  let totalEnrollments = 0;
  let totalRevenue = 0;
  if (courseIds.length > 0) {
    const [{ count }, { data: slips }] = await Promise.all([
      supabase.from("enrollments").select("*", { count: "exact", head: true }).in("course_id", courseIds),
      supabase.from("payment_slips").select("amount").eq("item_type", "course").eq("status", "approved").in("item_id", courseIds),
    ]);
    totalEnrollments = count ?? 0;
    totalRevenue = slips?.reduce((sum, s) => sum + (s.amount || 0), 0) ?? 0;
  }

  const totalLessons = courses?.reduce((acc, c) => acc + (c.modules?.reduce((a: number, m: { lessons: unknown[] | null }) => a + (m.lessons?.length ?? 0), 0) ?? 0), 0) ?? 0;

  const stats = [
    { label: "คอร์สของฉัน", value: String(courses?.length ?? 0), icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "นักเรียน", value: String(totalEnrollments), icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { label: "รายได้ทั้งหมด", value: `฿${totalRevenue.toLocaleString()}`, icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Instructor Nav — distinct accent bar */}
      <nav className="sticky top-0 z-30 backdrop-blur-xl border-b" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)", backdropFilter: "blur(var(--glass-blur))" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Logo />
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

        {/* Onboarding */}
        <OnboardingChecklist
          hasCourse={(courses?.length ?? 0) > 0}
          hasVideo={courses?.some((c) => c.modules?.some((m: { lessons: unknown[] | null }) => (m.lessons?.length ?? 0) > 0)) ?? false}
          hasPrice={courses?.some((c) => c.price > 0) ?? false}
          hasPublished={courses?.some((c) => c.is_published) ?? false}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className={`rounded-xl border p-5 ${s.border}`} style={{ background: "var(--bg-card)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                  <p className={`text-3xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
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
          <div className="flex items-center gap-3">
            <Link href="/instructor/analytics" className="text-sm text-blue-400 hover:text-blue-300 transition">📊 Analytics</Link>
            {profile.role === "admin" && (
              <Link href="/admin/courses" className="text-sm text-emerald-400 hover:text-emerald-300 transition">จัดการคอร์ส →</Link>
            )}
          </div>
        </div>

        {courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const lessonCount = course.modules?.reduce((a: number, m: { lessons: unknown[] | null }) => a + (m.lessons?.length ?? 0), 0) ?? 0;
              return (
                <div key={course.id} className="relative">
                  <PremiumCourseCard
                    title={course.title}
                    description={`${lessonCount} บทเรียน`}
                    price={course.price}
                    imageUrl={course.thumbnail_url}
                    href={`/courses/${course.id}`}
                    statusBadge={{ label: course.is_published ? "เผยแพร่" : "ร่าง", variant: course.is_published ? "published" : "draft" }}
                  />
                  <Link href={`/admin/courses/${course.id}`} className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium hover:bg-blue-500/20 transition">
                    แก้ไขบทเรียน →
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md p-20 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            <p className="text-sm font-medium text-white">ยังไม่มีคอร์ส</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>ติดต่อ admin เพื่อสร้างคอร์สและมอบหมายให้คุณ</p>
          </div>
        )}
      </div>
    </div>
  );
}
