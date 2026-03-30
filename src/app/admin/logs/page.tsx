import { requireAdmin } from "@/lib/supabase/admin";

export default async function AdminLogsPage() {
  const { supabase } = await requireAdmin();

  const { data: logs } = await supabase
    .from("activity_logs")
    .select("*, user:profiles!user_id(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-6">Activity Log</h1>

      <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ backgroundColor: "var(--bg-card)" }}>
        {!logs || logs.length === 0 ? (
          <div className="p-20 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            <p className="text-sm font-medium text-white">ยังไม่มีกิจกรรม</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>กิจกรรมจะถูกบันทึกเมื่อมีการใช้งานระบบ</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {logs.map((log) => (
              <div key={log.id} className="px-6 py-4 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-[var(--text-muted)] text-xs font-bold shrink-0 mt-0.5">
                  {(log.user?.full_name || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{log.user?.full_name || "ระบบ"}</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(log.created_at).toLocaleDateString("th-TH")} {new Date(log.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{log.action}</p>
                  {log.detail && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{log.detail}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
