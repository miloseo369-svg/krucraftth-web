import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";

/**
 * POST /api/admin/setup
 * ตั้ง admin คนแรก — ใช้ได้เฉพาะเมื่อยังไม่มี admin ในระบบ
 * ปิดอัตโนมัติเมื่อมี admin แล้ว
 */
export async function POST() {
  // ปิด endpoint ใน production ถ้าต้องการ
  if (process.env.DISABLE_SETUP === "true") {
    return NextResponse.json({ error: "Setup disabled" }, { status: 403 });
  }

  const supabase = createServiceClient();

  const { data: existingAdmin } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .maybeSingle();

  if (existingAdmin) {
    return NextResponse.json({ error: "ระบบมี admin แล้ว endpoint นี้ถูกปิด" }, { status: 403 });
  }

  const { data: firstUser } = await supabase
    .from("profiles")
    .select("id, full_name")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!firstUser) {
    return NextResponse.json({ error: "ยังไม่มี user ในระบบ" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", firstUser.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: `ตั้ง ${firstUser.full_name || firstUser.id} เป็น admin สำเร็จ` });
}
