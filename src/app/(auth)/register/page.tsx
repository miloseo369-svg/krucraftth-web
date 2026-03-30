import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "สมัครสมาชิก" };

export default function RegisterPage() {
  redirect("/login");
}
