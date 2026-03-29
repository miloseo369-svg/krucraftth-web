"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/Toast";
import PaymentModal from "@/components/PaymentModal";

export default function ShopBuyButton({ productId, productTitle, price }: { productId: string; productTitle?: string; price: number }) {
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const router = useRouter();

  const handleBuy = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) { router.push("/login"); return; }

    // สินค้าเสียเงิน → เปิด modal ส่งสลิป
    if (price > 0) {
      setShowPayment(true);
      setLoading(false);
      return;
    }

    // สินค้าฟรี → รับเลย
    const res = await fetch("/api/shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || "เกิดข้อผิดพลาด", "error");
      setLoading(false);
      return;
    }

    showToast("รับสินค้าสำเร็จ! สามารถดาวน์โหลดได้เลย", "success");
    router.refresh();
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={handleBuy}
        disabled={loading}
        className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-medium shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
      >
        {loading ? "กำลังดำเนินการ..." : price > 0 ? `ซื้อ ฿${price.toLocaleString()} →` : "รับฟรี →"}
      </button>

      {showPayment && (
        <PaymentModal
          itemType="product"
          itemId={productId}
          itemTitle={productTitle || "สินค้า"}
          price={price}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  );
}
