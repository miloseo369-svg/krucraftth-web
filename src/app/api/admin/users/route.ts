import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** PATCH /api/admin/users — เปลี่ยน role ของ user */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || profile.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, role } = await request.json();

  if (!userId || !["student", "instructor", "admin"].includes(role)) {
    return NextResponse.json(
      { error: "กรุณาระบุ userId และ role ที่ถูกต้อง (student, instructor, admin)" },
      { status: 400 }
    );
  }

  // ป้องกันลดสิทธิ์ตัวเอง
  if (userId === user.id) {
    return NextResponse.json(
      { error: "ไม่สามารถเปลี่ยน role ตัวเองได้" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, role });
}
