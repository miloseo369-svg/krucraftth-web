import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: courses } = await supabase
    .from("courses")
    .select("*, instructor:profiles(full_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-xl font-bold text-indigo-600">
              KruCraft Admin
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/admin/courses" className="text-indigo-600 text-sm font-medium">
                จัดการคอร์ส
              </Link>
              <Link href="/admin/users" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                จัดการผู้ใช้
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">จัดการคอร์ส</h1>
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">ชื่อคอร์ส</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">ผู้สอน</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">ราคา</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {courses?.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{course.title}</td>
                  <td className="px-6 py-4 text-gray-500">{course.instructor?.full_name || "-"}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {course.price === 0 ? "ฟรี" : `฿${course.price.toLocaleString()}`}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        course.is_published
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {course.is_published ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
                    </span>
                  </td>
                </tr>
              ))}
              {(!courses || courses.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    ยังไม่มีคอร์ส
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
