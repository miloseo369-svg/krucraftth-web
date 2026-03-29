import { requireAdmin } from "@/lib/supabase/admin";
import AdminNav from "@/components/AdminNav";
import DiscountCodeActions from "./DiscountCodeActions";

export default async function DiscountCodesPage() {
  const { supabase } = await requireAdmin();

  const { data: codes } = await supabase
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <AdminNav active="/admin/discount-codes" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">โค้ดส่วนลด</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>สร้างและจัดการโค้ดส่วนลดสำหรับคอร์สและสินค้า</p>
          </div>
        </div>
        <DiscountCodeActions initialCodes={codes ?? []} />
      </div>
    </div>
  );
}
