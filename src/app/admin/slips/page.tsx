import { requireAdmin } from "@/lib/supabase/admin";
import Link from "next/link";
import AdminNav from "@/components/AdminNav";
import AdminSlipActions from "./AdminSlipActions";

export default async function AdminSlipsPage() {
  const { supabase } = await requireAdmin();

  const { data: slips } = await supabase
    .from("payment_slips")
    .select("*, user:profiles!user_id(full_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminNav active="/admin/slips" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">ตรวจสอบสลิป</h1>
        <AdminSlipActions slips={slips ?? []} />
      </div>
    </div>
  );
}
