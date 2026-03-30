import { requireAdmin } from "@/lib/supabase/admin";
import GemManager from "./GemManager";

export default async function GemsPage() {
  const { supabase } = await requireAdmin();
  const { data: gems } = await supabase.from("gem_links").select("*").order("sort_order");

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">จัดการ Gem Links</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>เพิ่ม/แก้ไข/ลบ ลิงก์ AI Tools สำหรับผู้ใช้</p>
      </div>
      <GemManager initialGems={gems ?? []} />
    </>
  );
}
