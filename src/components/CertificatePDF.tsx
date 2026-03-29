"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

Font.register({
  family: "Sarabun",
  fonts: [
    { src: "/fonts/Sarabun-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/Sarabun-Bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Sarabun",
    padding: 60,
    backgroundColor: "#FFFFFF",
  },
  border: {
    border: "3pt solid #4F46E5",
    padding: 40,
    height: "100%",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4F46E5",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 30,
  },
  body: {
    textAlign: "center",
    marginBottom: 20,
  },
  certifyText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 15,
  },
  completionText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 10,
  },
  courseName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4F46E5",
    marginBottom: 30,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    paddingTop: 20,
    borderTop: "1pt solid #E5E7EB",
  },
  footerItem: {
    textAlign: "center",
  },
  footerLabel: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  footerValue: {
    fontSize: 11,
    color: "#374151",
    marginTop: 4,
  },
  qrContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  qrImage: {
    width: 80,
    height: 80,
  },
  qrText: {
    fontSize: 8,
    color: "#9CA3AF",
    marginTop: 4,
  },
});

interface CertificatePDFProps {
  fullName: string;
  courseName: string;
  certId: string;
  issuedAt: string;
  qrCodeDataUrl: string;
}

export default function CertificatePDF({
  fullName,
  courseName,
  certId,
  issuedAt,
  qrCodeDataUrl,
}: CertificatePDFProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <View style={styles.header}>
            <Text style={styles.title}>KruCraft</Text>
            <Text style={styles.subtitle}>ใบประกาศนียบัตร</Text>
          </View>

          <View style={styles.body}>
            <Text style={styles.certifyText}>
              ขอมอบใบประกาศนียบัตรฉบับนี้ให้แก่
            </Text>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.completionText}>
              ที่สำเร็จการศึกษาในหลักสูตร
            </Text>
            <Text style={styles.courseName}>{courseName}</Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerItem}>
              <Text style={styles.footerLabel}>รหัสใบประกาศ</Text>
              <Text style={styles.footerValue}>{certId}</Text>
            </View>
            <View style={styles.qrContainer}>
              {qrCodeDataUrl && (
                <Image src={qrCodeDataUrl} style={styles.qrImage} />
              )}
              <Text style={styles.qrText}>สแกนเพื่อตรวจสอบ</Text>
            </View>
            <View style={styles.footerItem}>
              <Text style={styles.footerLabel}>วันที่ออก</Text>
              <Text style={styles.footerValue}>
                {new Date(issuedAt).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
