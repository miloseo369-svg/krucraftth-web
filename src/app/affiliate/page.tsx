import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AffiliateDashboard from "./AffiliateDashboard";

export default async function AffiliatePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).maybeSingle();

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  let payouts: { id: string; order_id: string; commission_amount: number; status: string; created_at: string }[] = [];
  let stats = { totalEarned: 0, pendingAmount: 0, paidAmount: 0, totalReferrals: 0 };

  if (affiliate) {
    const { data } = await supabase
      .from("affiliate_payouts")
      .select("*")
      .eq("affiliate_id", affiliate.id)
      .order("created_at", { ascending: false });

    payouts = data ?? [];
    stats.totalEarned = payouts.reduce((sum, p) => sum + (p.commission_amount ?? 0), 0);
    stats.pendingAmount = payouts.filter((p) => p.status === "pending").reduce((sum, p) => sum + (p.commission_amount ?? 0), 0);
    stats.paidAmount = payouts.filter((p) => p.status === "paid").reduce((sum, p) => sum + (p.commission_amount ?? 0), 0);
    stats.totalReferrals = payouts.length;
  }

  return (
    <AffiliateDashboard
      affiliate={affiliate}
      payouts={payouts}
      stats={stats}
      userName={profile?.full_name || "ผู้ใช้"}
      role={profile?.role || "student"}
    />
  );
}
