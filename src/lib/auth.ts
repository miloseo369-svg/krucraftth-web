import { createClient } from "@/lib/supabase/server";

export interface AuthResult {
  user: { id: string; email?: string | null };
  role: string;
  error?: never;
}

export interface AuthError {
  user?: never;
  role?: never;
  error: string;
  status: number;
}

/** ตรวจ auth + role ในที่เดียว — ใช้ใน API routes */
export async function requireAuth(minRole?: "instructor" | "admin"): Promise<AuthResult | AuthError> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "กรุณาเข้าสู่ระบบ", status: 401 };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role || "student";

  if (minRole === "admin" && role !== "admin") {
    return { error: "เฉพาะ Admin เท่านั้น", status: 403 };
  }

  if (minRole === "instructor" && !["instructor", "admin"].includes(role)) {
    return { error: "เฉพาะผู้สอนและ Admin เท่านั้น", status: 403 };
  }

  return { user: { id: user.id, email: user.email }, role };
}
