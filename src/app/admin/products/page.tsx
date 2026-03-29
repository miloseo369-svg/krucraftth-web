import { requireAdmin } from "@/lib/supabase/admin";
import Link from "next/link";
import AdminNav from "@/components/AdminNav";
import AdminProductActions from "./AdminProductActions";

export default async function AdminProductsPage() {
  const { supabase } = await requireAdmin();

  const { data: products } = await supabase
    .from("products")
    .select("*, seller:profiles!seller_id(full_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminNav active="/admin/products" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AdminProductActions products={products ?? []} />
      </div>
    </div>
  );
}
