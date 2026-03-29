import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function CoursesPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("*, instructor:profiles(full_name)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">คอร์สเรียนทั้งหมด</h1>
          <p className="text-gray-500 mt-2">
            เลือกคอร์สที่คุณสนใจและเริ่มเรียนได้ทันที
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!courses || courses.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-300 text-5xl mb-4">📚</div>
            <h3 className="text-gray-600 font-medium text-lg">
              ยังไม่มีคอร์สเรียนในขณะนี้
            </h3>
            <p className="text-gray-400 mt-1">โปรดกลับมาใหม่ในภายหลัง</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="bg-white rounded-xl border hover:shadow-lg transition overflow-hidden group"
              >
                <div className="aspect-video bg-gray-100 relative">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                  {course.price === 0 && (
                    <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      ฟรี
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition text-lg">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-400">
                      โดย {course.instructor?.full_name || "ผู้สอน"}
                    </span>
                    <span className="font-bold text-indigo-600">
                      {course.price === 0
                        ? "ฟรี"
                        : `฿${course.price.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
