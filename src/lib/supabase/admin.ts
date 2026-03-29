import { createClient as createServerClient } from "./server";
import { createServerClient as createSupabaseClient } from "@supabase/ssr";
import { redirect } from "next/navigation";

/** Server client ที่ใช้ service role key — ข้าม RLS ทั้งหมด */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}

/** ตรวจสอบว่า user เป็น admin หรือไม่ — ใช้ใน server components/API routes */
export async function requireAdmin() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") redirect("/dashboard");

  return { user, supabase };
}
