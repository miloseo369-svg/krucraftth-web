import { createServiceClient } from "@/lib/supabase/admin";

interface SpendResult {
  success: boolean;
  error?: string;
  balance?: number;
}

/** ดึงยอดเครดิตของ user — สร้าง wallet ถ้ายังไม่มี */
export async function getBalance(userId: string): Promise<number> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("credit_wallets").select("balance").eq("user_id", userId).maybeSingle();
  if (data) return data.balance;

  // สร้าง wallet ใหม่
  await supabase.from("credit_wallets").insert({ user_id: userId, balance: 0 });
  return 0;
}

/** ดึงราคาเครดิตตาม action */
export async function getCreditCost(action: string): Promise<number> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("credit_pricing").select("credits_cost").eq("action", action).eq("is_active", true).maybeSingle();
  return data?.credits_cost ?? 0;
}

/** หักเครดิต — return error ถ้าไม่พอ */
export async function spendCredits(userId: string, action: string, description: string, refType?: string, refId?: string): Promise<SpendResult> {
  const cost = await getCreditCost(action);
  if (cost === 0) return { success: true, balance: await getBalance(userId) };

  const supabase = createServiceClient();
  const balance = await getBalance(userId);

  if (balance < cost) {
    return { success: false, error: `เครดิตไม่เพียงพอ (ต้องใช้ ${cost} เครดิต, คงเหลือ ${balance})` };
  }

  const newBalance = balance - cost;

  await supabase.from("credit_wallets").update({
    balance: newBalance,
    total_spent: (await supabase.from("credit_wallets").select("total_spent").eq("user_id", userId).single()).data?.total_spent + cost,
    updated_at: new Date().toISOString(),
  }).eq("user_id", userId);

  await supabase.from("credit_transactions").insert({
    user_id: userId,
    type: "spend",
    amount: -cost,
    balance_after: newBalance,
    description: `${description} (-${cost} เครดิต)`,
    ref_type: refType || null,
    ref_id: refId || null,
  });

  return { success: true, balance: newBalance };
}

/** เติมเครดิต */
export async function addCredits(userId: string, amount: number, description: string, type: "topup" | "bonus" | "refund" | "admin_adjust" = "topup", refType?: string, refId?: string): Promise<number> {
  const supabase = createServiceClient();
  const balance = await getBalance(userId);
  const newBalance = balance + amount;

  await supabase.from("credit_wallets").update({
    balance: newBalance,
    total_earned: (await supabase.from("credit_wallets").select("total_earned").eq("user_id", userId).single()).data?.total_earned + amount,
    updated_at: new Date().toISOString(),
  }).eq("user_id", userId);

  await supabase.from("credit_transactions").insert({
    user_id: userId,
    type,
    amount,
    balance_after: newBalance,
    description,
    ref_type: refType || null,
    ref_id: refId || null,
  });

  return newBalance;
}
