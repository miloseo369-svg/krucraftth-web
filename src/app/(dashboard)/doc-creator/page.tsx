import { createClient } from "@/lib/supabase/server";
import DocCreatorClient from "./DocCreatorClient";

export default async function DocCreatorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user!.id).maybeSingle();
  const { data: docs } = await supabase.from("user_documents").select("id, title, template_type, status, updated_at").eq("user_id", user!.id).order("updated_at", { ascending: false }).limit(20);

  return (
    <DocCreatorClient
      userName={profile?.full_name || ""}
      role={profile?.role || "student"}
      savedDocs={docs ?? []}
    />
  );
}
