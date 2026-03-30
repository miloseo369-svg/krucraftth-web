import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SellerDashboard from "./SellerDashboard";

export const metadata: Metadata = { title: "ฝากขายสินค้า" };

export default async function SellPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", user!.id)
    .order("created_at", { ascending: false });

  // Earnings
  const { data: earnings } = await supabase
    .from("seller_earnings")
    .select("amount, status")
    .eq("seller_id", user!.id);

  const totalEarned = earnings?.reduce((s, e) => s + (e.amount || 0), 0) ?? 0;
  const pendingAmount = earnings?.filter((e) => e.status === "pending").reduce((s, e) => s + (e.amount || 0), 0) ?? 0;
  const paidAmount = earnings?.filter((e) => e.status === "paid").reduce((s, e) => s + (e.amount || 0), 0) ?? 0;

  return (
    <SellerDashboard
      products={products ?? []}
      stats={{ totalEarned, pendingAmount, paidAmount, totalProducts: products?.length ?? 0 }}
    />
  );
}
