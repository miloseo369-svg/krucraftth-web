import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBalance } from "@/lib/credits";

/** GET /api/credits — ดึงยอดเครดิตของ user ปัจจุบัน */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const balance = await getBalance(user.id);

  const { data: transactions } = await supabase
    .from("credit_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: pricing } = await supabase
    .from("credit_pricing")
    .select("*")
    .eq("is_active", true)
    .order("credits_cost");

  return NextResponse.json({ balance, transactions: transactions ?? [], pricing: pricing ?? [] });
}
