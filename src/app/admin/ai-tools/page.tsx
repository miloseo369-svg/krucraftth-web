import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/admin";
import AIToolsClient from "./AIToolsClient";

export const metadata: Metadata = { title: "AI Tools" };

export default async function AIToolsPage() {
  const { supabase, user } = await requireAdmin();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const { data: courses } = await supabase.from("courses").select("id, title").order("created_at", { ascending: false });
  const { data: products } = await supabase.from("products").select("id, title, price").order("created_at", { ascending: false });

  return (
    <AIToolsClient
      role={profile?.role || "admin"}
      courses={courses ?? []}
      products={products ?? []}
    />
  );
}
