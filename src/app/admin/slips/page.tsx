import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/admin";
import AdminSlipActions from "./AdminSlipActions";

export const metadata: Metadata = { title: "ตรวจสลิป" };

export default async function AdminSlipsPage() {
  const { supabase } = await requireAdmin();

  const { data: slips } = await supabase
    .from("payment_slips")
    .select("*, user:profiles!user_id(full_name)")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">ตรวจสอบสลิป</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>ตรวจสอบและอนุมัติการชำระเงิน</p>
      </div>
      <AdminSlipActions slips={slips ?? []} />
    </>
  );
}
