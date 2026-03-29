import { requireAdmin } from "@/lib/supabase/admin";
import Link from "next/link";
import AdminNav from "@/components/AdminNav";
import AdminSettingsForm from "./AdminSettingsForm";

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase.from("site_settings").select("key, value");
  const settings: Record<string, string> = {};
  data?.forEach((s) => { settings[s.key] = s.value; });

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminNav active="/admin/settings" />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">ตั้งค่าระบบ</h1>
        <AdminSettingsForm initialSettings={settings} />
      </div>
    </div>
  );
}
