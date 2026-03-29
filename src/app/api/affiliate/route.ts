import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

/** GET /api/affiliate — ดึงข้อมูล affiliate ของ user ปัจจุบัน */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!affiliate) return NextResponse.json({ affiliate: null });

  const { data: payouts } = await supabase
    .from("affiliate_payouts")
    .select("*")
    .eq("affiliate_id", affiliate.id)
    .order("created_at", { ascending: false });

  const totalEarned = payouts?.reduce((sum, p) => sum + (p.commission_amount ?? 0), 0) ?? 0;
  const pendingAmount = payouts?.filter((p) => p.status === "pending").reduce((sum, p) => sum + (p.commission_amount ?? 0), 0) ?? 0;
  const paidAmount = payouts?.filter((p) => p.status === "paid").reduce((sum, p) => sum + (p.commission_amount ?? 0), 0) ?? 0;

  return NextResponse.json({
    affiliate,
    payouts: payouts ?? [],
    stats: { totalEarned, pendingAmount, paidAmount, totalReferrals: payouts?.length ?? 0 },
  });
}

/** POST /api/affiliate — สมัครเป็น affiliate */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if already registered
  const { data: existing } = await supabase
    .from("affiliates")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return NextResponse.json({ error: "คุณสมัครเป็น Affiliate แล้ว" }, { status: 409 });

  const body = await request.json().catch(() => ({}));
  const referralCode = (body.referral_code || `KC${nanoid(8)}`).toUpperCase();

  const { data: affiliate, error } = await supabase
    .from("affiliates")
    .insert({
      user_id: user.id,
      referral_code: referralCode,
      commission_rate: 0.3,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "รหัสแนะนำนี้มีคนใช้แล้ว" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ affiliate }, { status: 201 });
}
