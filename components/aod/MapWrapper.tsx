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

const MapWrapper = () => {
  return (
    <GenericMap
      dataType="aod"
      fetchUrl="/api/aod"
      fetchByDateUrl="/api/aod/aod-by-date"
      legendTitle="Indikator AOD"
    />
  );
};

export default MapWrapper;