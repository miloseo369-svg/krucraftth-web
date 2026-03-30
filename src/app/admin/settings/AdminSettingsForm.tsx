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

      {/* AI Provider */}
      <div className="rounded-2xl border border-white/[0.07] p-6" style={{ background: "var(--bg-card)" }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">AI Provider</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>เลือก AI Model สำหรับ AI Tools</p>
          </div>
        </div>
        <div className="space-y-4">
          {/* Provider selector */}
          <div>
            <label className="block text-xs font-medium text-white mb-2">เลือก AI Provider</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: "claude", name: "Claude", desc: "Anthropic", models: "Sonnet 4, Opus 4", gradient: "from-orange-500 to-amber-500", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" },
                { id: "openai", name: "GPT", desc: "OpenAI", models: "GPT-4o, o3", gradient: "from-emerald-500 to-teal-500", icon: "M12 2a10 10 0 110 20 10 10 0 010-20zm0 4a1 1 0 00-1 1v4.586l-2.707 2.707a1 1 0 101.414 1.414l3-3A1 1 0 0013 12V7a1 1 0 00-1-1z" },
                { id: "gemini", name: "Gemini", desc: "Google", models: "Gemini 2.5 Pro/Flash", gradient: "from-blue-500 to-indigo-500", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
              ].map((p) => {
                const active = (settings.ai_provider || "claude") === p.id;
                return (
                  <button key={p.id} type="button" onClick={() => update("ai_provider", p.id)} className={`rounded-xl p-3 text-left transition-all ${active ? "border-2 border-emerald-500/50 bg-emerald-500/5" : "border border-white/[0.07] hover:border-white/[0.15] hover:bg-white/[0.02]"}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${p.gradient} flex items-center justify-center`}>
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={p.icon} /></svg>
                      </div>
                      <span className="text-sm font-semibold text-white">{p.name}</span>
                      {active && <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />}
                    </div>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{p.desc} · {p.models}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model selector */}
          <div>
            <label className="block text-xs font-medium text-white mb-1.5">เลือก Model</label>
            <select value={settings.ai_model || ""} onChange={(e) => update("ai_model", e.target.value)} className={inputClass}>
              {(settings.ai_provider || "claude") === "claude" && (
                <>
                  <option value="claude-sonnet-4-20250514">Claude Sonnet 4 (แนะนำ)</option>
                  <option value="claude-opus-4-20250514">Claude Opus 4 (ฉลาดสุด)</option>
                  <option value="claude-haiku-4-20250514">Claude Haiku 4 (เร็วสุด)</option>
                </>
              )}
              {(settings.ai_provider || "claude") === "openai" && (
                <>
                  <option value="gpt-4o">GPT-4o (แนะนำ)</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (ประหยัด)</option>
                  <option value="o3">o3 (ฉลาดสุด)</option>
                  <option value="o4-mini">o4-mini (เร็วสุด)</option>
                </>
              )}
              {(settings.ai_provider || "claude") === "gemini" && (
                <>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (แนะนำ)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (เร็วสุด)</option>
                </>
              )}
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-xs font-medium text-white mb-1.5">
              {(settings.ai_provider || "claude") === "claude" ? "Claude API Key" : (settings.ai_provider || "claude") === "openai" ? "OpenAI API Key" : "Gemini API Key"}
            </label>
            <div className="flex gap-2">
              <input
                type={showApiKey ? "text" : "password"}
                value={settings.ai_api_key || settings.claude_api_key || ""}
                onChange={(e) => { update("ai_api_key", e.target.value); update("claude_api_key", e.target.value); }}
                placeholder={(settings.ai_provider || "claude") === "claude" ? "sk-ant-api03-..." : (settings.ai_provider || "claude") === "openai" ? "sk-..." : "AIza..."}
                className={`${inputClass} font-mono text-xs flex-1`}
              />
              <button onClick={() => setShowApiKey(!showApiKey)} className="px-3 py-2 rounded-xl border border-white/[0.07] text-xs hover:bg-white/5 transition shrink-0" style={{ color: "var(--text-secondary)" }}>
                {showApiKey ? "ซ่อน" : "แสดง"}
              </button>
            </div>
            <p className="text-[10px] mt-1.5" style={{ color: "var(--text-muted)" }}>
              {(settings.ai_provider || "claude") === "claude" && <>รับ API Key ที่ <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">console.anthropic.com</a></>}
              {(settings.ai_provider || "claude") === "openai" && <>รับ API Key ที่ <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline">platform.openai.com</a></>}
              {(settings.ai_provider || "claude") === "gemini" && <>รับ API Key ที่ <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">aistudio.google.com</a></>}
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
