"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/Toast";

interface PaymentModalProps {
  itemType: "course" | "product" | "credits";
  itemId: string;
  itemTitle: string;
  price: number;
  onClose: () => void;
}

interface BankSettings {
  bank_name: string;
  bank_account: string;
  bank_holder: string;
  promptpay: string;
  qr_promptpay_url: string;
}

export default function PaymentModal({ itemType, itemId, itemTitle, price, onClose }: PaymentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bank, setBank] = useState<BankSettings | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discountResult, setDiscountResult] = useState<{ valid: boolean; discount: number; message: string } | null>(null);
  const [checkingCode, setCheckingCode] = useState(false);
  const router = useRouter();

  const finalPrice = discountResult?.valid ? Math.max(0, price - discountResult.discount) : price;

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(setBank)
      .catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const checkDiscount = async () => {
    if (!discountCode.trim()) return;
    setCheckingCode(true);
    try {
      const res = await fetch("/api/discount/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode.trim().toUpperCase(), itemType, price }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setDiscountResult({ valid: true, discount: data.discount, message: `ลด ฿${data.discount.toLocaleString()}` });
        showToast(`ใช้โค้ดสำเร็จ! ลด ฿${data.discount.toLocaleString()}`, "success");
      } else {
        setDiscountResult({ valid: false, discount: 0, message: data.error || "โค้ดไม่ถูกต้อง" });
        showToast(data.error || "โค้ดไม่ถูกต้อง", "error");
      }
    } catch {
      setDiscountResult({ valid: false, discount: 0, message: "เกิดข้อผิดพลาด" });
    } finally {
      setCheckingCode(false);
    }
  };

  const handleSubmit = async () => {
    if (!file) { showToast("กรุณาเลือกรูปสลิป", "error"); return; }
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("item_type", itemType);
    formData.append("item_id", itemId);
    formData.append("amount", String(finalPrice));
    if (discountResult?.valid) formData.append("discount_code", discountCode.trim().toUpperCase());

    const res = await fetch("/api/payment", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || "เกิดข้อผิดพลาด", "error");
      setLoading(false);
      return;
    }

    showToast("ส่งสลิปสำเร็จ! รอ admin ตรวจสอบ", "success");
    setLoading(false);
    onClose();
    router.refresh();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[90] p-4" onClick={onClose}>
      <div className="rounded-2xl border border-white/[0.1] w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in" style={{ background: "var(--bg-card)" }} onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-white mb-1">ชำระเงิน</h2>
        <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>{itemTitle}</p>

        {/* ข้อมูลบัญชี */}
        <div className="rounded-xl p-4 mb-5 space-y-2 border border-white/[0.07]" style={{ background: "var(--bg-primary)" }}>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>จำนวนเงิน</span>
            <div className="text-right">
              {discountResult?.valid && (
                <span className="text-xs line-through mr-2" style={{ color: "var(--text-muted)" }}>฿{price.toLocaleString()}</span>
              )}
              <span className="text-lg font-bold text-emerald-400">฿{finalPrice.toLocaleString()}</span>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-2 space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>ธนาคาร</span>
              <span className="text-white font-medium">{bank?.bank_name || "กำลังโหลด..."}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>เลขบัญชี</span>
              <span className="text-white font-mono font-medium">{bank?.bank_account || "-"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>ชื่อบัญชี</span>
              <span className="text-white font-medium">{bank?.bank_holder || "-"}</span>
            </div>
            {bank?.promptpay && (
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "var(--text-secondary)" }}>พร้อมเพย์</span>
                <span className="text-white font-mono font-medium">{bank.promptpay}</span>
              </div>
            )}
          </div>
          {bank?.qr_promptpay_url && (
            <div className="border-t border-white/[0.06] pt-3">
              <p className="text-xs text-center mb-2" style={{ color: "var(--text-muted)" }}>สแกน QR PromptPay</p>
              <img src={bank.qr_promptpay_url} alt="QR PromptPay" className="w-40 h-40 mx-auto rounded-xl object-contain bg-white p-2" />
            </div>
          )}
        </div>

        {/* Discount Code */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-white mb-1.5">โค้ดส่วนลด</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setDiscountResult(null); }}
              placeholder="เช่น SAVE20"
              className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none font-mono uppercase transition"
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
            <button
              onClick={checkDiscount}
              disabled={checkingCode || !discountCode.trim()}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all disabled:opacity-50 shrink-0"
            >
              {checkingCode ? "..." : "ใช้โค้ด"}
            </button>
          </div>
          {discountResult && (
            <p className={`text-xs mt-1.5 ${discountResult.valid ? "text-emerald-400" : "text-red-400"}`}>
              {discountResult.message}
            </p>
          )}
        </div>

        {/* อัพโหลดสลิป */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-white mb-1.5">แนบสลิปการโอนเงิน *</label>
          {preview && (
            <img src={preview} alt="slip" className="w-full h-48 object-contain rounded-xl mb-2 border border-white/[0.07]" style={{ background: "var(--bg-primary)" }} />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20"
            style={{ color: "var(--text-muted)" }}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm rounded-xl border border-white/[0.07] hover:bg-white/5 transition" style={{ color: "var(--text-secondary)" }}>
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !file}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "กำลังส่ง..." : `ส่งสลิป (฿${finalPrice.toLocaleString()})`}
          </button>
        </div>
      </div>
    </div>
  );
}
