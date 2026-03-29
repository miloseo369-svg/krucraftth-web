import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
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

  const { count: usersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: coursesCount } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true });

  const { count: enrollmentsCount } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-xl font-bold text-indigo-600">
              KruCraft Admin
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/admin/courses" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                จัดการคอร์ส
              </Link>
              <Link href="/admin/users" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                จัดการผู้ใช้
              </Link>
            </div>
          </div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            กลับหน้าหลัก
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">แดชบอร์ดผู้ดูแลระบบ</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border p-6">
            <div className="text-sm text-gray-500">ผู้ใช้ทั้งหมด</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{usersCount ?? 0}</div>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <div className="text-sm text-gray-500">คอร์สทั้งหมด</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{coursesCount ?? 0}</div>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <div className="text-sm text-gray-500">การลงทะเบียนทั้งหมด</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{enrollmentsCount ?? 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
