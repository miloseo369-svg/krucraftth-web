"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/Toast";
import CountdownTimer from "@/components/CountdownTimer";
import PaymentModal from "@/components/PaymentModal";

interface Props {
  productId: string;
  productTitle: string;
  price: number;
  originalPrice?: number | null;
  saleEndsAt?: string | null;
  purchased: boolean;
  fileUrl?: string | null;
  savings: number;
  discount: number;
  ctaOnly?: boolean;
}

export default function ProductSalesClient({ productId, productTitle, price, originalPrice, saleEndsAt, purchased, fileUrl, savings, discount, ctaOnly }: Props) {
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const router = useRouter();

  const saleActive = saleEndsAt && new Date(saleEndsAt) > new Date();

  const handleBuy = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    if (price > 0) {
      setShowPayment(true);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/shop", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || "เกิดข้อผิดพลาด", "error"); setLoading(false); return; }
    showToast("รับสินค้าสำเร็จ!", "success");
    router.refresh();
    setLoading(false);
  };

  if (ctaOnly) {
    return (
      <>
        {purchased ? (
          <a href={fileUrl || "#"} download className="block w-full h-14 rounded-xl bg-emerald-500 text-black font-semibold text-base flex items-center justify-center hover:bg-emerald-400 active:scale-[0.98] transition-all">
            ดาวน์โหลดเลย
          </a>
        ) : (
          <button onClick={handleBuy} disabled={loading} className="w-full h-14 rounded-xl bg-emerald-500 text-black font-semibold text-base hover:bg-emerald-400 active:scale-[0.98] transition-all disabled:opacity-50">
            {loading ? "กำลังดำเนินการ..." : price > 0 ? `ซื้อและดาวน์โหลดทันที ฿${price.toLocaleString()} →` : "รับฟรี →"}
          </button>
        )}
        {showPayment && <PaymentModal itemType="product" itemId={productId} itemTitle={productTitle} price={price} onClose={() => setShowPayment(false)} />}
      </>
    );
  }

  return (
    <>
      {/* Countdown */}
      {saleActive && (
        <div className="mt-5">
          <p className="text-sm font-medium text-red-400 mb-2">⏰ ราคานี้หมดใน</p>
          <CountdownTimer targetDate={saleEndsAt} />
        </div>
      )}

      {/* Price Block */}
      <div className="mt-5 p-4 rounded-2xl border border-white/[0.07]" style={{ background: "var(--bg-card)" }}>
        {originalPrice && originalPrice > price && (
          <div className="flex items-center gap-2 mb-1">
            <span className="line-through text-sm" style={{ color: "var(--text-muted)" }}>฿{originalPrice.toLocaleString()}</span>
            {savings > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">ประหยัด ฿{savings.toLocaleString()} ({discount}%)</span>}
          </div>
        )}
        <div className="text-4xl font-bold text-emerald-400">
          {price === 0 ? "ฟรี" : `฿${price.toLocaleString()}`}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-4">
        {purchased ? (
          <a href={fileUrl || "#"} download className="flex items-center justify-center w-full h-14 rounded-xl bg-emerald-500 text-black font-semibold text-base hover:bg-emerald-400 active:scale-[0.98] transition-all">
            ดาวน์โหลดเลย
          </a>
        ) : (
          <button onClick={handleBuy} disabled={loading} className="w-full h-14 rounded-xl bg-emerald-500 text-black font-semibold text-base hover:bg-emerald-400 active:scale-[0.98] transition-all disabled:opacity-50">
            {loading ? "กำลังดำเนินการ..." : price > 0 ? `ซื้อและดาวน์โหลดทันที ฿${price.toLocaleString()} →` : "รับฟรี →"}
          </button>
        )}
        {purchased && <p className="text-xs text-emerald-400 text-center mt-2">คุณซื้อสินค้านี้แล้ว</p>}
      </div>

      {/* Sticky Mobile Bar */}
      {!purchased && (
        <div className="fixed bottom-0 left-0 right-0 block md:hidden border-t p-4 z-40 backdrop-blur-md" style={{ background: "var(--glass-bg)", borderColor: "var(--border)" }}>
          <div className="flex justify-between items-center gap-3">
            <div className="min-w-0">
              <p className="text-sm text-white font-medium line-clamp-1">{productTitle}</p>
              <p className="text-sm font-bold text-emerald-400">{price === 0 ? "ฟรี" : `฿${price.toLocaleString()}`}</p>
            </div>
            <button onClick={handleBuy} disabled={loading} className="shrink-0 px-5 h-10 rounded-xl bg-emerald-500 text-black font-medium text-sm hover:bg-emerald-400 active:scale-[0.98] transition-all disabled:opacity-50">
              {loading ? "..." : price > 0 ? "ซื้อเลย →" : "รับฟรี"}
            </button>
          </div>
        </div>
      )}

      {showPayment && <PaymentModal itemType="product" itemId={productId} itemTitle={productTitle} price={price} onClose={() => setShowPayment(false)} />}
    </>
  );
}
