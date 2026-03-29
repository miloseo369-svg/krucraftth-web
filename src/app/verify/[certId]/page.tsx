import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function VerifyCertPage({
  params,
}: {
  params: Promise<{ certId: string }>;
}) {
  const { certId } = await params;
  const supabase = await createClient();

  const { data: certificate } = await supabase
    .from("certificates")
    .select("*, user:profiles(full_name), course:courses(title)")
    .eq("cert_id", certId)
    .single();

  if (!certificate) notFound();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border shadow-sm max-w-lg w-full p-8 text-center">
        {certificate.is_valid ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ใบประกาศนียบัตรถูกต้อง
            </h1>
            <p className="text-gray-500 mb-6">
              ยืนยันความถูกต้องของใบประกาศนียบัตรนี้
            </p>

            <div className="bg-gray-50 rounded-xl p-6 text-left space-y-3">
              <div>
                <div className="text-sm text-gray-500">รหัสใบประกาศ</div>
                <div className="font-mono font-medium text-gray-900">
                  {certificate.cert_id}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">ชื่อผู้รับ</div>
                <div className="font-medium text-gray-900">
                  {certificate.user?.full_name || "-"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">คอร์ส</div>
                <div className="font-medium text-gray-900">
                  {certificate.course?.title || "-"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">วันที่ออก</div>
                <div className="font-medium text-gray-900">
                  {new Date(certificate.issued_at).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ใบประกาศนียบัตรถูกเพิกถอน
            </h1>
            <p className="text-gray-500">
              ใบประกาศนียบัตรนี้ไม่สามารถใช้งานได้อีกต่อไป
            </p>
          </>
        )}
      </div>
    </div>
  );
}
