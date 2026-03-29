import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import EnrollButton from "@/components/EnrollButton";
import Badge2 from "@/components/ui/Badge2";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ courseId: string }> }): Promise<Metadata> {
  const { courseId } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase.from("courses").select("title, description, thumbnail_url").eq("id", courseId).single();
  if (!course) return { title: "ไม่พบคอร์ส" };
  return { title: `${course.title} — KruCraft`, description: course.description || `เรียน ${course.title}`, openGraph: { title: course.title, description: course.description || undefined, images: course.thumbnail_url ? [course.thumbnail_url] : undefined } };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase.from("courses").select("*, instructor:profiles(full_name)").eq("id", courseId).single();
  if (!course) notFound();

  const { data: modules } = await supabase.from("modules").select("*, lessons(*)").eq("course_id", courseId).order("sequence");
  const { data: { user } } = await supabase.auth.getUser();

  let isEnrolled = false;
  if (user) {
    const { data: enrollment } = await supabase.from("enrollments").select("id").eq("user_id", user.id).eq("course_id", courseId).maybeSingle();
    isEnrolled = !!enrollment;
  }

  const totalLessons = modules?.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0) ?? 0;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Hero thumbnail */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-900/40 to-emerald-700/20" />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, var(--bg-primary) 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 max-w-6xl mx-auto px-4 sm:px-6 pb-6">
          <Link href="/courses" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-emerald-400 hover:text-emerald-300 bg-black/40 backdrop-blur-sm border border-emerald-500/20 hover:border-emerald-500/40 transition-all mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            คอร์สทั้งหมด
          </Link>
          <h1 className="text-3xl font-semibold text-white">{course.title}</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left — Syllabus */}
          <div className="lg:col-span-7">
            {course.description && <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>{course.description}</p>}

            <h2 className="text-lg font-medium text-white mb-4">หลักสูตร</h2>
            {modules && modules.length > 0 ? (
              <div className="space-y-3">
                {modules.map((mod) => (
                  <div key={mod.id} className="rounded-xl overflow-hidden border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                    <div className="px-5 py-3.5 flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{mod.title}</span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{mod.lessons?.length ?? 0} บทเรียน</span>
                    </div>
                    <div className="border-t" style={{ borderColor: "var(--border)" }}>
                      {mod.lessons?.sort((a: { sequence: number }, b: { sequence: number }) => a.sequence - b.sequence).map((lesson: { id: string; title: string; is_free_preview: boolean; type: string }) => (
                        <div key={lesson.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-[var(--bg-hover)] transition">
                          {isEnrolled || lesson.is_free_preview ? (
                            <Link href={`/courses/${courseId}/lessons/${lesson.id}`} className="flex items-center gap-3 flex-1 text-sm text-[var(--text-secondary)] hover:text-emerald-400 transition">
                              <span className="text-xs">{lesson.type === "video" ? "🎬" : lesson.type === "pdf" ? "📄" : lesson.type === "quiz" ? "📝" : "📡"}</span>
                              {lesson.title}
                              {lesson.is_free_preview && <Badge2 variant="free" className="ml-auto">ดูฟรี</Badge2>}
                            </Link>
                          ) : (
                            <div className="flex items-center gap-3 flex-1 text-sm opacity-40">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                              {lesson.title}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>ยังไม่มีเนื้อหา</p>
            )}
          </div>

          {/* Right — Sidebar */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-2xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div className="text-3xl font-semibold mb-5">
                {course.price === 0 ? <span className="text-emerald-400">ฟรี</span> : <span className="text-white">฿{course.price.toLocaleString()}</span>}
              </div>

              {isEnrolled ? (() => {
                const first = modules?.flatMap((m) => m.lessons ?? [])?.sort((a: { sequence: number }, b: { sequence: number }) => a.sequence - b.sequence)?.[0];
                return first ? (
                  <Link href={`/courses/${courseId}/lessons/${first.id}`} className="block w-full text-center py-3 rounded-lg bg-emerald-500 text-black font-medium hover:bg-emerald-400 active:scale-95 transition-all">เข้าเรียนต่อ</Link>
                ) : (
                  <div className="block w-full text-center py-3 rounded-lg text-sm" style={{ background: "var(--bg-hover)", color: "var(--text-muted)" }}>ยังไม่มีบทเรียน</div>
                );
              })() : (
                <EnrollButton courseId={courseId} courseTitle={course.title} price={course.price} />
              )}

              <div className="mt-6 space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                {[
                  { icon: "📚", text: `${totalLessons} บทเรียน` },
                  { icon: "🏆", text: "ใบประกาศนียบัตร" },
                  { icon: "⏰", text: "เรียนได้ตลอดชีพ" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2.5">
                    <span className="text-xs">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>ผู้สอน</p>
                <p className="text-sm text-white mt-0.5">{course.instructor?.full_name || "KruCraft"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
