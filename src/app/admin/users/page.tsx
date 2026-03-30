import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/admin";
import AdminUserActions from "./AdminUserActions";

export const metadata: Metadata = { title: "จัดการผู้ใช้" };

export default async function AdminUsersPage() {
  const { supabase, user: currentUser } = await requireAdmin();

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-6">จัดการผู้ใช้</h1>
      <AdminUserActions users={users ?? []} currentUserId={currentUser.id} />
    </>
  );
}
