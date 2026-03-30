import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { toBuddhistDate } from "@/lib/utils";

export const metadata: Metadata = { title: "คำสั่งซื้อ" };

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: slips } = await supabase
    .from("payment_slips")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const courseIds = slips?.filter((s) => s.item_type === "course").map((s) => s.item_id) ?? [];
  const productIds = slips?.filter((s) => s.item_type === "product").map((s) => s.item_id) ?? [];

  const { data: courses } = courseIds.length > 0
    ? await supabase.from("courses").select("id, title, thumbnail_url").in("id", courseIds)
    : { data: [] };

  const { data: products } = productIds.length > 0
    ? await supabase.from("products").select("id, title, thumbnail_url").in("id", productIds)
    : { data: [] };

  const itemMap: Record<string, { title: string; thumbnail?: string | null }> = {};
  courses?.forEach((c) => { itemMap[c.id] = { title: c.title, thumbnail: c.thumbnail_url }; });
  products?.forEach((p) => { itemMap[p.id] = { title: p.title, thumbnail: p.thumbnail_url }; });

  const { data: purchases } = await supabase
    .from("purchases")
    .select("*, product:products(id, title, thumbnail_url, file_url)")
    .eq("user_id", user!.id)
    .order("purchased_at", { ascending: false });

  const allOrders = [
    ...(slips?.map((s) => ({ type: "slip" as const, ...s, itemTitle: itemMap[s.item_id]?.title || "ไม่ทราบชื่อ", thumbnail: itemMap[s.item_id]?.thumbnail, date: s.created_at })) || []),
    ...(purchases?.filter((p) => !slips?.some((s) => s.item_type === "product" && s.item_id === p.product_id && s.status === "approved"))
      .map((p) => ({ type: "purchase" as const, id: p.id, status: "approved", item_type: "product" as const, item_id: p.product_id, amount: p.amount_paid, itemTitle: p.product?.title || "สินค้า", thumbnail: p.product?.thumbnail_url, fileUrl: p.product?.file_url, date: p.purchased_at })) || []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-2">คำสั่งซื้อของฉัน</h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>ติดตามสถานะและดาวน์โหลดสินค้า</p>

      {allOrders.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md p-20 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          <p className="text-sm font-medium text-white">ยังไม่มีคำสั่งซื้อ</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>เลือกคอร์สหรือสินค้าที่สนใจ</p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <Link href="/courses" className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 active:scale-95 transition-all">ดูคอร์ส</Link>
            <Link href="/shop" className="px-5 py-2.5 rounded-xl border border-white/[0.07] text-sm font-medium hover:bg-white/5 transition" style={{ color: "var(--text-secondary)" }}>ร้านค้า</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {allOrders.map((order) => {
            const isPending = order.status === "pending";
            const isApproved = order.status === "approved";
            const isRejected = order.status === "rejected";
            const isProduct = order.item_type === "product";
            const isCourse = order.item_type === "course";

            return (
              <div key={order.id} className="rounded-2xl border border-white/[0.07] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-white/[0.12] transition-all" style={{ background: "var(--bg-card)" }}>
                {/* Thumbnail */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-white/[0.07]" style={{ background: "var(--bg-secondary)" }}>
                  {order.thumbnail ? (
                    <img src={order.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isProduct ? "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" : "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"} /></svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{order.itemTitle}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    <span>{isCourse ? "คอร์ส" : "สินค้า"}</span>
                    <span>฿{order.amount?.toLocaleString() || "0"}</span>
                    <span>{toBuddhistDate(order.date)}</span>
                  </div>
                </div>

                {/* Status + Action */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
                    isPending ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    isApproved ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    {isPending ? "รอตรวจสลิป" : isApproved ? "อนุมัติแล้ว" : "ปฏิเสธ"}
                  </span>

                  {isApproved && isProduct && (
                    <Link href={`/orders/${order.id}/download`} className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 active:scale-95 transition-all">
                      ดาวน์โหลด →
                    </Link>
                  )}
                  {isApproved && isCourse && (
                    <Link href={`/courses/${order.item_id}`} className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 active:scale-95 transition-all">
                      เรียนต่อ →
                    </Link>
                  )}
                  {isRejected && (
                    <Link href={isProduct ? `/shop/${order.item_id}` : `/courses/${order.item_id}`} className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition">
                      ส่งสลิปใหม่
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
