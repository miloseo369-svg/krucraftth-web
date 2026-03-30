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
  await supabase.from("credit_wallets").upsert({ user_id: userId, balance: 0 }, { onConflict: "user_id" });
  return 0;
}

/** ดึงราคาเครดิตตาม action */
export async function getCreditCost(action: string): Promise<number> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("credit_pricing").select("credits_cost").eq("action", action).eq("is_active", true).maybeSingle();
  return data?.credits_cost ?? 0;
}

/** หักเครดิต — atomic (ใช้ RPC ป้องกัน race condition) */
export async function spendCredits(userId: string, action: string, description: string, refType?: string, refId?: string): Promise<SpendResult> {
  const cost = await getCreditCost(action);
  if (cost === 0) return { success: true, balance: await getBalance(userId) };

  const supabase = createServiceClient();

  const { data, error } = await supabase.rpc("spend_credits", {
    p_user_id: userId,
    p_amount: cost,
    p_description: `${description} (-${cost} เครดิต)`,
    p_ref_type: refType || null,
    p_ref_id: refId || null,
  });

  if (error) return { success: false, error: error.message };

  const result = data?.[0];
  if (!result?.success) {
    return { success: false, error: result?.error_message || "เครดิตไม่เพียงพอ" };
  }

  return { success: true, balance: result.new_balance };
}

/** เติมเครดิต — atomic (ใช้ RPC) */
export async function addCredits(userId: string, amount: number, description: string, type: "topup" | "bonus" | "refund" | "admin_adjust" = "topup", refType?: string, refId?: string): Promise<number> {
  const supabase = createServiceClient();

  const { data, error } = await supabase.rpc("add_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_description: description,
    p_type: type,
    p_ref_type: refType || null,
    p_ref_id: refId || null,
  });

  if (error) {
    // Fallback to old method if RPC fails
    const balance = await getBalance(userId);
    const newBalance = balance + amount;
    await supabase.from("credit_wallets").upsert({ user_id: userId, balance: newBalance, total_earned: amount, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    await supabase.from("credit_transactions").insert({ user_id: userId, type, amount, balance_after: newBalance, description, ref_type: refType, ref_id: refId });
    return newBalance;
  }

  return data as number;
}
