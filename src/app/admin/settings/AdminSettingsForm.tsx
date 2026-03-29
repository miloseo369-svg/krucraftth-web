"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/Toast";

export default function AdminSettingsForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none";

  const update = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleUploadQR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (res.ok) {
      const d = await res.json();
      update("qr_promptpay_url", d.url);
      showToast("อัพโหลด QR สำเร็จ", "success");
    } else {
      showToast("อัพโหลดไม่สำเร็จ", "error");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      showToast("บันทึกการตั้งค่าสำเร็จ", "success");
      router.refresh();
    } else {
      showToast("บันทึกไม่สำเร็จ", "error");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* ข้อมูลบัญชี */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-5">ข้อมูลบัญชีรับเงิน</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">ชื่อธนาคาร</label>
            <input value={settings.bank_name || ""} onChange={(e) => update("bank_name", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">เลขบัญชี</label>
            <input value={settings.bank_account || ""} onChange={(e) => update("bank_account", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">ชื่อบัญชี</label>
            <input value={settings.bank_holder || ""} onChange={(e) => update("bank_holder", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">เลข PromptPay</label>
            <input value={settings.promptpay || ""} onChange={(e) => update("promptpay", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">QR PromptPay</label>
            {settings.qr_promptpay_url && (
              <img src={settings.qr_promptpay_url} alt="QR" className="w-40 h-40 rounded-xl object-contain bg-white p-2 mb-2" />
            )}
            <input type="file" accept="image/*" onChange={handleUploadQR} disabled={uploading} className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-500/10 file:text-indigo-400" />
            {uploading && <p className="text-xs text-gray-500 mt-1">กำลังอัพโหลด...</p>}
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-500 transition disabled:opacity-50"
      >
        {loading ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </button>
    </div>
  );
}
