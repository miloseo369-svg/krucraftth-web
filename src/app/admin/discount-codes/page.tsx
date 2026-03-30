import { requireAdmin } from "@/lib/supabase/admin";
import ComingSoonBadge from "@/components/ComingSoonBadge";
import DiscountCodeActions from "./DiscountCodeActions";

export default async function DiscountCodesPage() {
  const { supabase } = await requireAdmin();

  const { data: codes } = await supabase
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-semibold text-white">โค้ดส่วนลด</h1>
            <ComingSoonBadge label="ยังไม่เชื่อมกับ Checkout" size="sm" />
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>สร้างและจัดการโค้ดส่วนลดสำหรับคอร์สและสินค้า</p>
        </div>
      </div>
      <DiscountCodeActions initialCodes={codes ?? []} />
    </>
  );
}
