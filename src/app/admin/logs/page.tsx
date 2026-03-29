import { requireAdmin } from "@/lib/supabase/admin";
import Link from "next/link";
import AdminNav from "@/components/AdminNav";

export default async function AdminLogsPage() {
  const { supabase } = await requireAdmin();

  const { data: logs } = await supabase
    .from("activity_logs")
    .select("*, user:profiles!user_id(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminNav active="/admin/logs" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Activity Log</h1>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          {!logs || logs.length === 0 ? (
            <div className="p-16 text-center text-gray-600">ยังไม่มีกิจกรรม</div>
          ) : (
            <div className="divide-y divide-gray-800/60">
              {logs.map((log) => (
                <div key={log.id} className="px-6 py-4 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 text-xs font-bold shrink-0 mt-0.5">
                    {(log.user?.full_name || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{log.user?.full_name || "ระบบ"}</span>
                      <span className="text-xs text-gray-600">
                        {new Date(log.created_at).toLocaleDateString("th-TH")} {new Date(log.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">{log.action}</p>
                    {log.detail && <p className="text-xs text-gray-600 mt-1">{log.detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
