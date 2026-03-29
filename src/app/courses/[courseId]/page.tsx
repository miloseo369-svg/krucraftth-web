import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import EnrollButton from "@/components/EnrollButton";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*, instructor:profiles(full_name)")
    .eq("id", courseId)
    .single();

  if (!course) notFound();

  const { data: modules } = await supabase
    .from("modules")
    .select("*, lessons(*)")
    .eq("course_id", courseId)
    .order("sequence");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isEnrolled = false;
  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single();
    isEnrolled = !!enrollment;
  }

  const totalLessons =
    modules?.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0) ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/courses"
            className="text-indigo-200 hover:text-white text-sm mb-4 inline-block"
          >
            ← กลับไปหน้าคอร์สทั้งหมด
          </Link>
          <h1 className="text-3xl font-bold mt-2">{course.title}</h1>
          {course.description && (
            <p className="text-indigo-100 mt-3 max-w-2xl text-lg">
              {course.description}
            </p>
          )}
          <div className="flex items-center gap-6 mt-6 text-sm text-indigo-200">
            <span>โดย {course.instructor?.full_name || "ผู้สอน"}</span>
            <span>{totalLessons} บทเรียน</span>
            <span>
              {course.price === 0
                ? "ฟรี"
                : `฿${course.price.toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  เนื้อหาคอร์ส
                </h2>
              </div>
              {modules && modules.length > 0 ? (
                <div className="divide-y">
                  {modules.map((module) => (
                    <div key={module.id} className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        {module.title}
                      </h3>
                      <ul className="space-y-2">
                        {module.lessons
                          ?.sort(
                            (a: { sequence: number }, b: { sequence: number }) =>
                              a.sequence - b.sequence
                          )
                          .map(
                            (lesson: {
                              id: string;
                              title: string;
                              type: string;
                              is_free_preview: boolean;
                            }) => (
                              <li key={lesson.id}>
                                {isEnrolled || lesson.is_free_preview ? (
                                  <Link
                                    href={`/courses/${courseId}/lessons/${lesson.id}`}
                                    className="flex items-center gap-3 text-gray-600 hover:text-indigo-600 transition py-1"
                                  >
                                    <svg
                                      className="w-4 h-4 shrink-0"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                      />
                                    </svg>
                                    <span className="text-sm">
                                      {lesson.title}
                                    </span>
                                    {lesson.is_free_preview && (
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        ดูฟรี
                                      </span>
                                    )}
                                  </Link>
                                ) : (
                                  <div className="flex items-center gap-3 text-gray-400 py-1">
                                    <svg
                                      className="w-4 h-4 shrink-0"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                      />
                                    </svg>
                                    <span className="text-sm">
                                      {lesson.title}
                                    </span>
                                  </div>
                                )}
                              </li>
                            )
                          )}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-gray-400">
                  ยังไม่มีเนื้อหาในคอร์สนี้
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-xl border p-6 sticky top-24">
              <div className="text-3xl font-bold text-gray-900 mb-4">
                {course.price === 0
                  ? "ฟรี"
                  : `฿${course.price.toLocaleString()}`}
              </div>

              {isEnrolled ? (
                <Link
                  href={`/courses/${courseId}/lessons/${modules?.[0]?.lessons?.[0]?.id ?? ""}`}
                  className="block w-full text-center py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
                >
                  เข้าเรียนต่อ
                </Link>
              ) : (
                <EnrollButton courseId={courseId} />
              )}

              <div className="mt-6 space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {totalLessons} บทเรียน
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  ใบประกาศนียบัตรเมื่อเรียนจบ
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  เรียนได้ตลอดชีพ
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
