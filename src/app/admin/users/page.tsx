import { requireAdmin } from "@/lib/supabase/admin";
import Link from "next/link";
import AdminNav from "@/components/AdminNav";
import AdminUserActions from "./AdminUserActions";

export default async function AdminUsersPage() {
  const { supabase, user: currentUser } = await requireAdmin();

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminNav active="/admin/users" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">จัดการผู้ใช้</h1>
        <AdminUserActions users={users ?? []} currentUserId={currentUser.id} />
      </div>
    </div>
  );
}
