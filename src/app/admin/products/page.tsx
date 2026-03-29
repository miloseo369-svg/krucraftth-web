import { requireAdmin } from "@/lib/supabase/admin";
import AdminProductActions from "./AdminProductActions";

export default async function AdminProductsPage() {
  const { supabase } = await requireAdmin();

  const { data: products } = await supabase
    .from("products")
    .select("*, seller:profiles!seller_id(full_name)")
    .order("created_at", { ascending: false });

  return (
    <AdminProductActions products={products ?? []} />
  );
}
