"use client";
import dynamic from "next/dynamic";

const StasiunPM25 = dynamic(() => import("@/components/pm25-aktual/Stasiun"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="spinner"></div>
      <span>Memuat...</span>
    </div>
  ),
});

export default function PM25AktualPage() {
  return <StasiunPM25 />;
}
