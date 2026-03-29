import { requireAdmin } from "@/lib/supabase/admin";
import Link from "next/link";
import AdminNav from "@/components/AdminNav";
import AdminCourseActions from "./AdminCourseActions";

export default async function AdminCoursesPage() {
  const { supabase } = await requireAdmin();

  const [{ data: courses }, { data: instructors }] = await Promise.all([
    supabase
      .from("courses")
      .select("*, instructor:profiles(full_name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("role", ["instructor", "admin"])
      .order("full_name"),
  ]);

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminNav active="/admin/courses" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AdminCourseActions
          courses={courses ?? []}
          instructors={instructors ?? []}
        />
      </div>
    </div>
  );
}
