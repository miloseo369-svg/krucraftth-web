import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminUsersPage() {
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

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
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
              <Link href="/admin/courses" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                จัดการคอร์ส
              </Link>
              <Link href="/admin/users" className="text-indigo-600 text-sm font-medium">
                จัดการผู้ใช้
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">จัดการผู้ใช้</h1>

        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">ชื่อ</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">บทบาท</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">สมัครเมื่อ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users?.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {u.full_name || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        u.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : u.role === "instructor"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {u.role === "admin"
                        ? "ผู้ดูแล"
                        : u.role === "instructor"
                        ? "ผู้สอน"
                        : "ผู้เรียน"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(u.created_at).toLocaleDateString("th-TH")}
                  </td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                    ยังไม่มีผู้ใช้
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
