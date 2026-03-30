import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import AdminLessonManager from "./AdminLessonManager";

export const metadata: Metadata = { title: "แก้ไขคอร์ส" };

export default async function AdminCourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || !["admin", "instructor"].includes(profile.role)) redirect("/dashboard");

  const { data: course } = await supabase.from("courses").select("*").eq("id", courseId).single();
  if (!course) notFound();

  // Instructor can only edit their own courses
  if (profile.role === "instructor" && course.instructor_id !== user.id) redirect("/instructor");

  const { data: modules } = await supabase.from("modules").select("*, lessons(*)").eq("course_id", courseId).order("sequence");
  const totalLessons = modules?.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0) ?? 0;

  return (
    <>
      {/* Course Header */}
      <div className="rounded-2xl border border-white/[0.07] p-6 mb-6" style={{ background: "var(--bg-card)" }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${course.is_published ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                {course.is_published ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
              </span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                {course.price === 0 ? "ฟรี" : `฿${course.price.toLocaleString()}`}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">{course.title}</h1>
            {course.description && <p className="text-sm mt-2 max-w-2xl" style={{ color: "var(--text-secondary)" }}>{course.description}</p>}
          </div>
          <div className="flex items-center gap-6 text-center shrink-0 ml-8">
            <div>
              <div className="text-2xl font-bold text-white">{modules?.length ?? 0}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>โมดูล</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{totalLessons}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>บทเรียน</div>
            </div>
          </div>
        </div>
      </div>

      <AdminLessonManager courseId={courseId} initialModules={modules ?? []} />
    </>
  );
}
