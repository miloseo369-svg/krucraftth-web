"use client";

import { useState } from "react";
import { toBuddhistDate } from "@/lib/utils";
import PaymentModal from "@/components/PaymentModal";

interface Transaction { id: string; type: string; amount: number; balance_after: number; description: string; created_at: string; }
interface Pricing { action: string; credits_cost: number; label: string; }

const TOPUP_PACKAGES = [
  { credits: 50, price: 29, popular: false },
  { credits: 150, price: 79, popular: true },
  { credits: 500, price: 199, popular: false },
  { credits: 1500, price: 499, popular: false },
];

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  topup: { label: "เติมเครดิต", color: "text-emerald-400" },
  spend: { label: "ใช้เครดิต", color: "text-red-400" },
  bonus: { label: "โบนัส", color: "text-blue-400" },
  refund: { label: "คืนเครดิต", color: "text-amber-400" },
  admin_adjust: { label: "Admin ปรับ", color: "text-purple-400" },
};

export default function CreditsClient({ balance, transactions, pricing }: { balance: number; transactions: Transaction[]; pricing: Pricing[] }) {
  const [selectedPkg, setSelectedPkg] = useState<typeof TOPUP_PACKAGES[number] | null>(null);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Balance card */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8 mb-6 border border-emerald-500/20" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1), var(--bg-card), rgba(20,184,166,0.06))" }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>เครดิตคงเหลือ</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-emerald-400">{balance.toLocaleString()}</span>
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>เครดิต</span>
          </div>
          <div className="flex gap-3 mt-4">
            <a href="#topup" className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-medium text-sm hover:bg-emerald-400 active:scale-95 transition-all">เติมเครดิต</a>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-2xl border border-white/[0.07] p-5 mb-6" style={{ background: "var(--bg-card)" }}>
        <h2 className="text-sm font-semibold text-white mb-3">อัตราการใช้เครดิต</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {pricing.map((p) => (
            <div key={p.action} className="rounded-xl border border-white/[0.05] p-3" style={{ background: "var(--bg-primary)" }}>
              <p className="text-xs text-white font-medium">{p.label}</p>
              <p className="text-lg font-bold text-emerald-400 mt-1">{p.credits_cost} <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>เครดิต</span></p>
            </div>
          ))}
        </div>
      </div>

      {/* Top-up packages */}
      <div id="topup" className="rounded-2xl border border-white/[0.07] p-5 mb-6" style={{ background: "var(--bg-card)" }}>
        <h2 className="text-sm font-semibold text-white mb-3">แพ็คเกจเติมเครดิต</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TOPUP_PACKAGES.map((pkg) => (
            <button
              key={pkg.credits}
              onClick={() => setSelectedPkg(pkg)}
              className={`relative rounded-xl p-4 text-center transition-all hover:-translate-y-0.5 cursor-pointer ${pkg.popular ? "border-2 border-emerald-500/40 bg-emerald-500/5" : "border border-white/[0.07]"}`}
              style={!pkg.popular ? { background: "var(--bg-primary)" } : {}}
            >
              {pkg.popular && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] px-2 py-0.5 rounded-full bg-emerald-500 text-black font-bold">ยอดนิยม</span>}
              <p className="text-2xl font-bold text-white">{pkg.credits}</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>เครดิต</p>
              <p className="text-sm font-bold text-emerald-400 mt-2">฿{pkg.price}</p>
              <p className="text-[9px] mt-1" style={{ color: "var(--text-muted)" }}>฿{(pkg.price / pkg.credits).toFixed(2)}/เครดิต</p>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-center mt-3" style={{ color: "var(--text-muted)" }}>ชำระผ่านการโอนเงิน → ระบบเติมเครดิตให้อัตโนมัติหลังอนุมัติ</p>
      </div>

      {/* Transaction history */}
      <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: "var(--bg-card)" }}>
        <div className="px-5 py-3.5 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">ประวัติเครดิต</h2>
        </div>
        {transactions.length === 0 ? (
          <div className="p-10 text-center"><p className="text-xs" style={{ color: "var(--text-muted)" }}>ยังไม่มีรายการ</p></div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {transactions.map((t) => {
              const info = TYPE_LABELS[t.type] || { label: t.type, color: "text-white" };
              return (
                <div key={t.id} className="px-5 py-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${t.amount > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                    {t.amount > 0 ? "+" : "−"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{t.description}</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{toBuddhistDate(t.created_at)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${t.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>{t.amount > 0 ? "+" : ""}{t.amount}</p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>คงเหลือ {t.balance_after}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Modal for credit purchase */}
      {selectedPkg && (
        <PaymentModal
          itemType="credits"
          itemId={String(selectedPkg.credits)}
          itemTitle={`เติมเครดิต ${selectedPkg.credits} เครดิต`}
          price={selectedPkg.price}
          onClose={() => setSelectedPkg(null)}
        />
      )}
    </div>
  );
}
