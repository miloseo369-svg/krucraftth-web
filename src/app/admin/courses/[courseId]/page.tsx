import { requireAdmin } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import AdminLessonManager from "./AdminLessonManager";

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const { supabase } = await requireAdmin();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (!course) notFound();

  const { data: modules } = await supabase
    .from("modules")
    .select("*, lessons(*)")
    .eq("course_id", courseId)
    .order("sequence");

  const totalLessons =
    modules?.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0) ?? 0;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Nav */}
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 flex items-center h-14">
          <Link href="/admin" className="text-lg font-bold text-white mr-6">
            KruCraft
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/admin/courses" className="text-gray-400 hover:text-white transition">
              คอร์ส
            </Link>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white font-medium truncate max-w-xs">{course.title}</span>
          </div>
        </div>
      </nav>

      {/* Course Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    course.is_published
                      ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                      : "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30"
                  }`}
                >
                  {course.is_published ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
                </span>
                <span className="text-gray-500 text-sm">
                  {course.price === 0 ? "ฟรี" : `฿${course.price.toLocaleString()}`}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white">{course.title}</h1>
              {course.description && (
                <p className="text-gray-400 text-sm mt-2 max-w-2xl">{course.description}</p>
              )}
            </div>
            <div className="flex items-center gap-6 text-center shrink-0 ml-8">
              <div>
                <div className="text-2xl font-bold text-white">{modules?.length ?? 0}</div>
                <div className="text-xs text-gray-500 mt-0.5">โมดูล</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{totalLessons}</div>
                <div className="text-xs text-gray-500 mt-0.5">บทเรียน</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <AdminLessonManager courseId={courseId} initialModules={modules ?? []} />
      </div>
    </div>
  );
}
