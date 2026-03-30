import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addCredits, getBalance } from "@/lib/credits";
import { createServiceClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, amount, note } = await request.json();
  if (!userId || !amount) return NextResponse.json({ error: "กรุณาระบุผู้ใช้และจำนวน" }, { status: 400 });

  if (amount > 0) {
    const newBalance = await addCredits(userId, amount, note || `Admin เติม ${amount} เครดิต`, "admin_adjust");
    return NextResponse.json({ success: true, balance: newBalance });
  } else {
    // Deduct
    const balance = await getBalance(userId);
    const deductAmount = Math.abs(amount);
    if (balance < deductAmount) return NextResponse.json({ error: `เครดิตไม่พอ (คงเหลือ ${balance})` }, { status: 400 });

    const serviceClient = createServiceClient();
    const newBalance = balance - deductAmount;
    await serviceClient.from("credit_wallets").update({ balance: newBalance, total_spent: 0, updated_at: new Date().toISOString() }).eq("user_id", userId);
    await serviceClient.from("credit_transactions").insert({ user_id: userId, type: "admin_adjust", amount, balance_after: newBalance, description: note || `Admin หัก ${deductAmount} เครดิต` });

    return NextResponse.json({ success: true, balance: newBalance });
  }
}
