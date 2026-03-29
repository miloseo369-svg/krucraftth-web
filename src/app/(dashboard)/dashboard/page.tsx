import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, course:courses(*)")
    .eq("user_id", user!.id);

  const { data: progress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user!.id)
    .eq("is_completed", true);

  const completedCount = progress?.length ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          สวัสดี, {user?.user_metadata?.full_name || "ผู้เรียน"} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          ติดตามความก้าวหน้าการเรียนของคุณ
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <div className="text-sm text-gray-500">คอร์สที่ลงทะเบียน</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">
            {enrollments?.length ?? 0}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="text-sm text-gray-500">บทเรียนที่เรียนจบ</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">
            {completedCount}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="text-sm text-gray-500">ใบประกาศนียบัตร</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">0</div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        คอร์สของฉัน
      </h2>

      {!enrollments || enrollments.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <div className="text-gray-400 text-4xl mb-4">📚</div>
          <h3 className="text-gray-700 font-medium mb-2">
            คุณยังไม่ได้ลงทะเบียนเรียนคอร์สใด
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            เริ่มต้นเรียนรู้โดยเลือกคอร์สที่สนใจ
          </p>
          <Link
            href="/courses"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            ดูคอร์สทั้งหมด
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map((enrollment) => (
            <Link
              key={enrollment.id}
              href={`/courses/${enrollment.course_id}`}
              className="bg-white rounded-xl border hover:shadow-md transition overflow-hidden group"
            >
              <div className="aspect-video bg-gray-100 relative">
                {enrollment.course?.thumbnail_url ? (
                  <img
                    src={enrollment.course.thumbnail_url}
                    alt={enrollment.course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                  {enrollment.course?.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">กำลังเรียน</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
