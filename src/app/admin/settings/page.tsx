import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/admin";
import AdminSettingsForm from "./AdminSettingsForm";

export const metadata: Metadata = { title: "ตั้งค่าระบบ" };

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase.from("site_settings").select("key, value");
  const settings: Record<string, string> = {};
  data?.forEach((s) => { settings[s.key] = s.value; });

  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-8">ตั้งค่าระบบ</h1>
      <AdminSettingsForm initialSettings={settings} />
    </>
  );
}
