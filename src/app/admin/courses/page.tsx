import { requireAdmin } from "@/lib/supabase/admin";
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
    <AdminCourseActions
      courses={courses ?? []}
      instructors={instructors ?? []}
    />
  );
}
