import { createServiceClient } from "@/lib/supabase/admin";

export async function logActivity(userId: string, action: string, detail?: string) {
  const supabase = createServiceClient();
  await supabase.from("activity_logs").insert({
    user_id: userId,
    action,
    detail: detail || null,
  });
}
