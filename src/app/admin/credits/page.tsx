import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/admin";
import AdminCreditsClient from "./AdminCreditsClient";

export const metadata: Metadata = { title: "จัดการเครดิต" };

export default async function AdminCreditsPage() {
  const { supabase } = await requireAdmin();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, email:id")
    .order("created_at", { ascending: false });

  const { data: wallets } = await supabase
    .from("credit_wallets")
    .select("user_id, balance, total_earned, total_spent")
    .order("balance", { ascending: false });

  const { data: pricing } = await supabase
    .from("credit_pricing")
    .select("*")
    .order("credits_cost");

  // Merge user + wallet
  const userList = (users ?? []).map((u) => {
    const w = wallets?.find((w) => w.user_id === u.id);
    return { ...u, balance: w?.balance ?? 0, total_earned: w?.total_earned ?? 0, total_spent: w?.total_spent ?? 0 };
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">จัดการเครดิต</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>เติม/หักเครดิตผู้ใช้ + ตั้งราคา</p>
      </div>
      <AdminCreditsClient users={userList} pricing={pricing ?? []} />
    </>
  );
}
