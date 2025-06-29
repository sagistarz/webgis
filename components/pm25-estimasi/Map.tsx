"use client";

import dynamic from "next/dynamic";

const GenericMap = dynamic(() => import("@/components/map/GenericMap"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="spinner"></div>
      <span>Memuat...</span>
    </div>
  ),
});

const Map = () => {
  return (
    <GenericMap
      dataType="pm25-est"
      fetchUrl="/api/pm25-est"
      fetchByDateUrl="/api/pm25-est/pm25-est-by-date"
      legendTitle="Indikator PM2.5 (µg/m³)"
    />
  );
};

export default Map;