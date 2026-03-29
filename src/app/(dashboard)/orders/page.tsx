import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30",
  approved: "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30",
  rejected: "bg-red-500/20 text-red-400 ring-1 ring-red-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "รอตรวจสอบ",
  approved: "อนุมัติแล้ว",
  rejected: "ไม่อนุมัติ",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // สลิปที่เคยส่ง
  const { data: slips } = await supabase
    .from("payment_slips")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  // ดึงชื่อ item
  const courseIds = slips?.filter((s) => s.item_type === "course").map((s) => s.item_id) ?? [];
  const productIds = slips?.filter((s) => s.item_type === "product").map((s) => s.item_id) ?? [];

  const { data: courses } = courseIds.length > 0
    ? await supabase.from("courses").select("id, title").in("id", courseIds)
    : { data: [] };

  const { data: products } = productIds.length > 0
    ? await supabase.from("products").select("id, title").in("id", productIds)
    : { data: [] };

  const itemNames: Record<string, string> = {};
  courses?.forEach((c) => { itemNames[c.id] = c.title; });
  products?.forEach((p) => { itemNames[p.id] = p.title; });

  // สินค้าที่ซื้อแล้ว (approved / free)
  const { data: purchases } = await supabase
    .from("purchases")
    .select("*, product:products(id, title, file_url)")
    .eq("user_id", user!.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">คำสั่งซื้อของฉัน</h1>

      {/* สลิปที่ส่ง */}
      {slips && slips.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">สลิปที่ส่ง</h2>
          <div className="space-y-3">
            {slips.map((slip) => (
              <div key={slip.id} className="bg-gray-900 rounded-2xl border border-gray-800 p-5 flex items-center gap-4">
                <img src={slip.slip_url} alt="slip" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{itemNames[slip.item_id] || "ไม่ทราบชื่อ"}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {slip.item_type === "course" ? "คอร์ส" : "สินค้า"} · ฿{slip.amount.toLocaleString()} · {new Date(slip.created_at).toLocaleDateString("th-TH")}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[slip.status]}`}>
                  {STATUS_LABELS[slip.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* สินค้าที่ดาวน์โหลดได้ */}
      {purchases && purchases.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">สินค้าที่ซื้อแล้ว</h2>
          <div className="space-y-3">
            {purchases.map((p) => (
              <div key={p.id} className="bg-gray-900 rounded-2xl border border-gray-800 p-5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">{p.product?.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    ฿{p.amount_paid.toLocaleString()} · {new Date(p.purchased_at).toLocaleDateString("th-TH")}
                  </div>
                </div>
                {p.product?.file_url && (
                  <a href={p.product.file_url} download className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition">
                    ดาวน์โหลด
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(!slips || slips.length === 0) && (!purchases || purchases.length === 0) && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-white font-medium mb-1">ยังไม่มีคำสั่งซื้อ</h3>
          <p className="text-gray-500 text-sm mb-6">เลือกคอร์สหรือสินค้าที่สนใจ</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/courses" className="px-5 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-500 transition">ดูคอร์ส</Link>
            <Link href="/shop" className="px-5 py-2 bg-gray-800 text-white text-sm rounded-xl hover:bg-gray-700 transition">ร้านค้า</Link>
          </div>
        </div>
      )}
    </div>
  );
}
