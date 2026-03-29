"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import QRCode from "qrcode";
import CertificatePDF from "./CertificatePDF";

interface DownloadCertificateProps {
  fullName: string;
  courseName: string;
  certId: string;
  issuedAt: string;
}

export default function DownloadCertificate({
  fullName,
  courseName,
  certId,
  issuedAt,
}: DownloadCertificateProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);

    try {
      const verifyUrl = `${window.location.origin}/verify/${certId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 200,
        margin: 1,
      });

      const blob = await pdf(
        <CertificatePDF
          fullName={fullName}
          courseName={courseName}
          certId={certId}
          issuedAt={issuedAt}
          qrCodeDataUrl={qrCodeDataUrl}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${certId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
    >
      {loading ? "กำลังสร้าง PDF..." : "ดาวน์โหลดใบประกาศนียบัตร"}
    </button>
  );
}
