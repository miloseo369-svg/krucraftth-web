"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/Toast";

export default function AdminSettingsForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const router = useRouter();

  const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm outline-none transition bg-[var(--bg-primary)] border border-white/[0.07] text-white placeholder:text-[var(--text-muted)] focus:border-emerald-500/40";

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
    <div className="space-y-6">
      {/* ข้อมูลบัญชี */}
      <div className="rounded-2xl border border-white/[0.07] p-6" style={{ background: "var(--bg-card)" }}>
        <h2 className="text-base font-semibold text-white mb-5">ข้อมูลบัญชีรับเงิน</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white mb-1.5">ชื่อธนาคาร</label>
            <input value={settings.bank_name || ""} onChange={(e) => update("bank_name", e.target.value)} placeholder="เช่น กสิกรไทย" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1.5">เลขบัญชี</label>
            <input value={settings.bank_account || ""} onChange={(e) => update("bank_account", e.target.value)} placeholder="xxx-x-xxxxx-x" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1.5">ชื่อบัญชี</label>
            <input value={settings.bank_holder || ""} onChange={(e) => update("bank_holder", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1.5">เลข PromptPay</label>
            <input value={settings.promptpay || ""} onChange={(e) => update("promptpay", e.target.value)} placeholder="เบอร์โทรหรือเลขบัตรประชาชน" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1.5">QR PromptPay</label>
            {settings.qr_promptpay_url && (
              <img src={settings.qr_promptpay_url} alt="QR" className="w-40 h-40 rounded-xl object-contain bg-white p-2 mb-2" />
            )}
            <input type="file" accept="image/*" onChange={handleUploadQR} disabled={uploading} className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20" style={{ color: "var(--text-muted)" }} />
            {uploading && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>กำลังอัพโหลด...</p>}
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="rounded-2xl border border-white/[0.07] p-6" style={{ background: "var(--bg-card)" }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">API Keys</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>สำหรับเชื่อมต่อบริการภายนอก</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white mb-1.5">Claude API Key (สำหรับ AI Tools)</label>
            <div className="flex gap-2">
              <input
                type={showApiKey ? "text" : "password"}
                value={settings.claude_api_key || ""}
                onChange={(e) => update("claude_api_key", e.target.value)}
                placeholder="sk-ant-api03-..."
                className={`${inputClass} font-mono text-xs flex-1`}
              />
              <button onClick={() => setShowApiKey(!showApiKey)} className="px-3 py-2 rounded-xl border border-white/[0.07] text-xs hover:bg-white/5 transition shrink-0" style={{ color: "var(--text-secondary)" }}>
                {showApiKey ? "ซ่อน" : "แสดง"}
              </button>
            </div>
            <p className="text-[10px] mt-1.5" style={{ color: "var(--text-muted)" }}>
              รับ API Key ที่ <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">console.anthropic.com</a> · ใช้สำหรับ AI Tools ในหน้า Admin
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1.5">Telegram Bot Token</label>
            <input
              type={showApiKey ? "text" : "password"}
              value={settings.telegram_bot_token || ""}
              onChange={(e) => update("telegram_bot_token", e.target.value)}
              placeholder="123456:ABC-DEF..."
              className={`${inputClass} font-mono text-xs`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1.5">Telegram Chat ID</label>
            <input
              value={settings.telegram_chat_id || ""}
              onChange={(e) => update("telegram_chat_id", e.target.value)}
              placeholder="-100123456789"
              className={`${inputClass} font-mono text-xs`}
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 active:scale-95 transition-all disabled:opacity-50"
      >
        {loading ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </button>
    </div>
  );
}
