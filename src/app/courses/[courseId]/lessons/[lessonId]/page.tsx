import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";
import LessonDiscussion from "@/components/LessonDiscussion";
import QuizPlayer from "@/components/QuizPlayer";
import Logo from "@/components/Logo";

export const metadata: Metadata = { title: "บทเรียน" };

export default async function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: lesson } = await supabase.from("lessons").select("*").eq("id", lessonId).eq("course_id", courseId).maybeSingle();
  if (!lesson) notFound();

  if (!lesson.is_free_preview) {
    if (!user) redirect("/login");
    const { data: enrollment } = await supabase.from("enrollments").select("id").eq("user_id", user.id).eq("course_id", courseId).maybeSingle();
    if (!enrollment) redirect(`/courses/${courseId}`);
  }

  const { data: quiz } = await supabase.from("quizzes").select("*, quiz_questions(*)").eq("lesson_id", lessonId).maybeSingle();

  const [{ data: modules }, { data: course }, { data: userProgress }] = await Promise.all([
    supabase.from("modules").select("*, lessons(*)").eq("course_id", courseId).order("sequence"),
    supabase.from("courses").select("title").eq("id", courseId).single(),
    user ? supabase.from("user_progress").select("lesson_id, is_completed").eq("user_id", user.id) : Promise.resolve({ data: [] as { lesson_id: string; is_completed: boolean }[] }),
  ]);

  const completedIds = new Set((userProgress ?? []).filter((p) => p.is_completed).map((p) => p.lesson_id));

  const allLessons = modules?.flatMap((m) => (m.lessons ?? []).sort((a: { sequence: number }, b: { sequence: number }) => a.sequence - b.sequence)) ?? [];
  const currentIdx = allLessons.findIndex((l: { id: string }) => l.id === lessonId);
  const prev = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const next = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  // Overall course progress
  const totalLessons = allLessons.length;
  const completedCount = allLessons.filter((l: { id: string }) => completedIds.has(l.id)).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      {/* Top bar */}
      <div className="h-12 flex items-center justify-between px-4 border-b shrink-0" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <Logo href="/dashboard" />
          <span className="text-[var(--text-muted)]">/</span>
          <Link href={`/courses/${courseId}`} className="text-sm text-[var(--text-secondary)] hover:text-white transition truncate max-w-[200px]">
            {course?.title || "กลับ"}
          </Link>
        </div>
        {/* Progress badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{progressPercent}% เสร็จ</span>
          {user && (
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-black text-xs font-bold">
              {(user.user_metadata?.full_name || user.email || "U")[0].toUpperCase()}
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Sidebar */}
        <div className="w-full lg:w-72 border-r overflow-y-auto shrink-0 order-2 lg:order-1" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
          {modules?.map((mod) => (
            <div key={mod.id}>
              <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs font-semibold text-[var(--text-secondary)]">{mod.title}</p>
              </div>
              {mod.lessons?.sort((a: { sequence: number }, b: { sequence: number }) => a.sequence - b.sequence).map((l: { id: string; title: string; is_free_preview?: boolean }) => {
                const isCurrent = l.id === lessonId;
                const isCompleted = completedIds.has(l.id);
                return (
                  <a key={l.id} href={`/courses/${courseId}/lessons/${l.id}`} className={`flex items-center gap-3 px-4 py-2.5 text-xs transition ${isCurrent ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500" : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-white"}`}>
                    {/* Status icon */}
                    {isCurrent ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    ) : isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0 text-[var(--text-muted)]">
                        <span className="text-[9px] font-medium">{mod.lessons?.sort((a: { sequence: number }, b: { sequence: number }) => a.sequence - b.sequence).indexOf(l) + 1}</span>
                      </div>
                    )}
                    <span className="truncate">{l.title}</span>
                  </a>
                );
              })}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto order-1 lg:order-2">
          {/* Video */}
          <div className="aspect-video bg-black">
            {lesson.bunny_video_path ? (
              <VideoPlayer lessonId={lesson.id} videoPath={lesson.bunny_video_path} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-[var(--text-muted)]">วิดีโอยังไม่พร้อม</div>
            )}
          </div>

          <div className="p-4 sm:p-6 max-w-3xl">
            {/* Module breadcrumb + title */}
            <p className="text-[10px] text-[var(--text-muted)] mb-1">{modules?.find((m) => m.lessons?.some((l: { id: string }) => l.id === lessonId))?.title}</p>
            <h1 className="text-lg sm:text-xl font-semibold text-white">{lesson.title}</h1>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 mt-5">
              {prev && (
                <Link href={`/courses/${courseId}/lessons/${prev.id}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border border-white/[0.1] text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.04] transition-all">
                  ← ก่อนหน้า
                </Link>
              )}
              {next ? (
                <Link href={`/courses/${courseId}/lessons/${next.id}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all">
                  ถัดไป →
                </Link>
              ) : (
                <Link href={`/courses/${courseId}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all">
                  จบคอร์ส ✓
                </Link>
              )}
              <span className="w-px h-5 bg-white/10 mx-1 hidden sm:block" />
              <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-white/[0.1] text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.04] transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                จดโน้ต
              </button>
              <a href="#discussion" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-white/[0.1] text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.04] transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                Q&A
              </a>
            </div>

            {/* Quiz */}
            {quiz && quiz.quiz_questions && quiz.quiz_questions.length > 0 && (
              <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--border)" }}>
                <QuizPlayer quizId={quiz.id} title={quiz.title} passScore={quiz.pass_score} questions={quiz.quiz_questions.sort((a: { order_num: number }, b: { order_num: number }) => a.order_num - b.order_num)} />
              </div>
            )}

            {/* Discussion */}
            {user && (
              <div id="discussion" className="mt-6 pt-5 border-t" style={{ borderColor: "var(--border)" }}>
                <LessonDiscussion lessonId={lessonId} courseId={courseId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
