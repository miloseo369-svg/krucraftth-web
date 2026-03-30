import { createClient } from "@/lib/supabase/server";
import { getBalance } from "@/lib/credits";
import CreditsClient from "./CreditsClient";

export default async function CreditsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const balance = await getBalance(user!.id);

  const { data: transactions } = await supabase
    .from("credit_transactions")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const { data: pricing } = await supabase
    .from("credit_pricing")
    .select("*")
    .eq("is_active", true)
    .order("credits_cost");

  return <CreditsClient balance={balance} transactions={transactions ?? []} pricing={pricing ?? []} />;
}
