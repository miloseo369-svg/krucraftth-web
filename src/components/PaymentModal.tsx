"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/Toast";

interface PaymentModalProps {
  itemType: "course" | "product";
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
  const router = useRouter();

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

  const handleSubmit = async () => {
    if (!file) { showToast("กรุณาเลือกรูปสลิป", "error"); return; }
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("item_type", itemType);
    formData.append("item_id", itemId);
    formData.append("amount", String(price));

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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-white mb-1">ชำระเงิน</h2>
        <p className="text-sm text-gray-500 mb-6">{itemTitle}</p>

        {/* ข้อมูลบัญชี */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">จำนวนเงิน</span>
            <span className="text-lg font-bold text-white">฿{price.toLocaleString()}</span>
          </div>
          <div className="border-t border-gray-700 pt-2 space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">ธนาคาร</span>
              <span className="text-white font-medium">{bank?.bank_name || "กำลังโหลด..."}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">เลขบัญชี</span>
              <span className="text-white font-mono font-medium">{bank?.bank_account || "-"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">ชื่อบัญชี</span>
              <span className="text-white font-medium">{bank?.bank_holder || "-"}</span>
            </div>
            {bank?.promptpay && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">พร้อมเพย์</span>
                <span className="text-white font-mono font-medium">{bank.promptpay}</span>
              </div>
            )}
          </div>
          {bank?.qr_promptpay_url ? (
            <div className="border-t border-gray-700 pt-3">
              <p className="text-xs text-gray-500 text-center mb-2">สแกน QR PromptPay</p>
              <img src={bank.qr_promptpay_url} alt="QR PromptPay" className="w-40 h-40 mx-auto rounded-xl object-contain bg-white p-2" />
            </div>
          ) : bank?.promptpay ? (
            <div className="border-t border-gray-700 pt-3">
              <p className="text-xs text-gray-500 text-center">โอนผ่าน PromptPay: <span className="text-white font-mono">{bank.promptpay}</span></p>
            </div>
          ) : null}
        </div>

        {/* อัพโหลดสลิป */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">แนบสลิปการโอนเงิน *</label>
          {preview && (
            <img src={preview} alt="slip" className="w-full h-48 object-contain bg-gray-800 rounded-xl mb-2" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm text-gray-400 bg-gray-800 rounded-xl hover:bg-gray-700 transition">
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !file}
            className="flex-1 py-2.5 text-sm text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition font-medium disabled:opacity-50"
          >
            {loading ? "กำลังส่ง..." : "ส่งสลิป"}
          </button>
        </div>
      </div>
    </div>
  );
}
