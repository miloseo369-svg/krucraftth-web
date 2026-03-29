import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/log";

// keys ที่ผู้ใช้ทั่วไปอ่านได้ (ข้อมูลบัญชีสำหรับชำระเงิน)
const PUBLIC_KEYS = ["bank_name", "bank_account", "bank_holder", "promptpay", "qr_promptpay_url"];

/** GET /api/admin/settings — ดึงค่าตั้งค่า (เฉพาะ public keys) */
export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", PUBLIC_KEYS);

  const settings: Record<string, string> = {};
  data?.forEach((s) => { settings[s.key] = s.value; });
  return NextResponse.json(settings);
}

/** PATCH /api/admin/settings — อัพเดตค่าตั้งค่า (admin only) */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const allowedKeys = [...PUBLIC_KEYS];
  const entries = Object.entries(body).filter(([k]) => allowedKeys.includes(k)) as [string, string][];

  if (entries.length === 0) return NextResponse.json({ error: "ไม่มีค่าที่อัพเดตได้" }, { status: 400 });

  for (const [key, value] of entries) {
    await supabase
      .from("site_settings")
      .upsert({ key, value, updated_by: user.id, updated_at: new Date().toISOString() }, { onConflict: "key" });
  }

  await logActivity(user.id, "update_settings", `แก้ไขการตั้งค่า: ${entries.map(([k]) => k).join(", ")}`);
  return NextResponse.json({ success: true });
}
