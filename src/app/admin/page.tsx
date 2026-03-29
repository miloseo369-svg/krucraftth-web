import { requireAdmin } from "@/lib/supabase/admin";
import Link from "next/link";

export default async function AdminPage() {
  const { supabase } = await requireAdmin();

  const [{ count: usersCount }, { count: coursesCount }, { count: enrollmentsCount }, { count: pendingSlips }, { data: recentSlips }, { count: productsCount }, { count: purchasesCount }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("enrollments").select("*", { count: "exact", head: true }),
    supabase.from("payment_slips").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("payment_slips").select("*, user:profiles!user_id(full_name)").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("purchases").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "ผู้ใช้ทั้งหมด", value: usersCount ?? 0, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "คอร์สทั้งหมด", value: coursesCount ?? 0, icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "ลงทะเบียน", value: enrollmentsCount ?? 0, icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { label: "สินค้า", value: productsCount ?? 0, icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { label: "ยอดซื้อ", value: purchasesCount ?? 0, icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    { label: "สลิปรอตรวจ", value: pendingSlips ?? 0, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: (pendingSlips ?? 0) > 0 ? "text-yellow-400" : "text-emerald-400", bg: (pendingSlips ?? 0) > 0 ? "bg-yellow-500/10" : "bg-emerald-500/10", border: (pendingSlips ?? 0) > 0 ? "border-yellow-500/20" : "border-emerald-500/20" },
  ];

  const quickActions = [
    { href: "/admin/courses", label: "จัดการคอร์ส", desc: "เพิ่ม/แก้ไขคอร์สเรียน", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", color: "text-emerald-400" },
    { href: "/admin/products", label: "จัดการสินค้า", desc: "เพิ่ม/แก้ไขสินค้าดิจิทัล", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", color: "text-orange-400" },
    { href: "/admin/slips", label: "ตรวจสลิป", desc: `${(pendingSlips ?? 0) > 0 ? `${pendingSlips} รายการรอตรวจ` : "ไม่มีรายการรอ"}`, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "text-yellow-400" },
    { href: "/admin/users", label: "จัดการผู้ใช้", desc: "กำหนดสิทธิ์/บทบาท", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "text-blue-400" },
    { href: "/admin/discount-codes", label: "โค้ดส่วนลด", desc: "สร้าง/จัดการโค้ดส่วนลด", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z", color: "text-pink-400" },
    { href: "/admin/settings", label: "ตั้งค่าระบบ", desc: "บัญชีธนาคาร/PromptPay", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", color: "text-gray-400" },
  ];

  return (
    <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">แดชบอร์ด</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>ภาพรวมระบบ KruCraft LMS</p>
          </div>
          {(pendingSlips ?? 0) > 0 && (
            <Link href="/admin/slips" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/15 transition-all text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              {pendingSlips} สลิปรอตรวจ
            </Link>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className={`relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-md p-6 hover:border-white/[0.12] transition-all duration-300`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest font-medium" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                  <p className="text-4xl font-bold text-white mt-2 tracking-tight">{s.value.toLocaleString()}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <svg className={`w-6 h-6 ${s.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
                  </svg>
                </div>
              </div>
              {/* Subtle accent line at bottom */}
              <div className={`absolute bottom-0 left-0 right-0 h-[2px] opacity-40 ${s.bg}`} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Pending Slips */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <h2 className="text-sm font-medium text-white">สลิปรอตรวจล่าสุด</h2>
                <Link href="/admin/slips" className="text-xs text-emerald-400 hover:text-emerald-300 transition">ดูทั้งหมด →</Link>
              </div>
              {recentSlips && recentSlips.length > 0 ? (
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {recentSlips.map((slip) => (
                    <Link key={slip.id} href="/admin/slips" className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--bg-hover)] transition">
                      <img src={slip.slip_url} alt="slip" className="w-10 h-10 rounded-lg object-cover shrink-0 border" style={{ borderColor: "var(--border)" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{slip.user?.full_name || "ไม่ทราบชื่อ"}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{slip.item_type === "course" ? "คอร์ส" : "สินค้า"} · ฿{slip.amount}</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shrink-0">รอตรวจ</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-12 text-center">
                  <svg className="w-12 h-12 mx-auto mb-3 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  <p className="text-sm font-medium text-white">ไม่มีสลิปรอตรวจ</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>ทุกรายการได้รับการตรวจสอบแล้ว</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06]">
                <h2 className="text-sm font-medium text-white">เมนูจัดการ</h2>
              </div>
              <div className="p-2">
                {quickActions.map((a) => (
                  <Link key={a.href} href={a.href} className="flex items-center gap-3.5 px-3 py-3 rounded-lg hover:bg-[var(--bg-hover)] transition group">
                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-white/8 transition">
                      <svg className={`w-4.5 h-4.5 ${a.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={a.icon} />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white group-hover:text-emerald-400 transition">{a.label}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{a.desc}</p>
                    </div>
                    <svg className="w-4 h-4 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
