import type { Metadata } from "next";
import EbookMakerClient from "./EbookMakerClient";

export const metadata: Metadata = { title: "ทำปก Ebook" };

export default function EbookMakerPage() {
  return <EbookMakerClient />;
}
