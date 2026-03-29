import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";

export default async function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: lesson } = await supabase.from("lessons").select("*").eq("id", lessonId).eq("course_id", courseId).single();
  if (!lesson) notFound();

  if (!lesson.is_free_preview) {
    if (!user) redirect("/login");
    const { data: enrollment } = await supabase.from("enrollments").select("id").eq("user_id", user.id).eq("course_id", courseId).maybeSingle();
    if (!enrollment) redirect(`/courses/${courseId}`);
  }

  const [{ data: modules }, { data: course }] = await Promise.all([
    supabase.from("modules").select("*, lessons(*)").eq("course_id", courseId).order("sequence"),
    supabase.from("courses").select("title").eq("id", courseId).single(),
  ]);

  const allLessons = modules?.flatMap((m) => (m.lessons ?? []).sort((a: { sequence: number }, b: { sequence: number }) => a.sequence - b.sequence)) ?? [];
  const currentIdx = allLessons.findIndex((l: { id: string }) => l.id === lessonId);
  const prev = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const next = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      {/* Top bar */}
      <div className="h-12 flex items-center px-4 border-b shrink-0" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <Link href={`/courses/${courseId}`} className="text-sm text-[var(--text-secondary)] hover:text-white transition flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          <span className="truncate max-w-xs">{course?.title || "กลับ"}</span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Sidebar */}
        <div className="w-full lg:w-72 border-r overflow-y-auto shrink-0 order-2 lg:order-1" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
          <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>เนื้อหาคอร์ส</p>
          </div>
          {modules?.map((mod) => (
            <div key={mod.id}>
              <div className="px-4 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{mod.title}</p>
              </div>
              {mod.lessons?.sort((a: { sequence: number }, b: { sequence: number }) => a.sequence - b.sequence).map((l: { id: string; title: string }) => (
                <a key={l.id} href={`/courses/${courseId}/lessons/${l.id}`} className={`flex items-center gap-2.5 px-4 py-2.5 text-xs transition ${l.id === lessonId ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500" : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-white"}`}>
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                  <span className="truncate">{l.title}</span>
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto order-1 lg:order-2">
          <div className="aspect-video bg-black">
            {lesson.bunny_video_path ? (
              <VideoPlayer lessonId={lesson.id} videoPath={lesson.bunny_video_path} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>วิดีโอยังไม่พร้อม</div>
            )}
          </div>

          <div className="p-6 max-w-3xl">
            <h1 className="text-xl font-medium text-white">{lesson.title}</h1>

            {/* Next / Prev */}
            <div className="flex items-center justify-between mt-6 pt-5 border-t" style={{ borderColor: "var(--border)" }}>
              {prev ? (
                <Link href={`/courses/${courseId}/lessons/${prev.id}`} className="text-sm text-[var(--text-secondary)] hover:text-white transition flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  <span className="truncate max-w-[200px]">{prev.title}</span>
                </Link>
              ) : <span />}
              {next ? (
                <Link href={`/courses/${courseId}/lessons/${next.id}`} className="text-sm text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1.5 font-medium">
                  <span className="truncate max-w-[200px]">{next.title}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              ) : (
                <Link href={`/courses/${courseId}`} className="text-sm text-emerald-400 hover:text-emerald-300 transition font-medium">กลับหน้าคอร์ส ✓</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
