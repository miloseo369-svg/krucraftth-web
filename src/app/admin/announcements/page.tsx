import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/admin";
import AnnouncementsManager from "./AnnouncementsManager";

export const metadata: Metadata = { title: "ประกาศ" };

export default async function AnnouncementsPage() {
  const { supabase } = await requireAdmin();

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  return <AnnouncementsManager announcements={announcements ?? []} />;
}
