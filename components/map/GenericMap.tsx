// // // // // // // // // // // // // // // // // // // // // // // // // components/map/GenericMap.tsx
// // // // // // // // // // // // // // // // // // // // // // // // "use client";

// // // // // // // // // // // // // // // // // // // // // // // // import { useState, useEffect, useCallback } from "react";
// // // // // // // // // // // // // // // // // // // // // // // // import { MapContainer, TileLayer } from "react-leaflet";
// // // // // // // // // // // // // // // // // // // // // // // // import HeatMapLayer from "./GenericHeatMapLayer"; // Komponen generik untuk heatmap
// // // // // // // // // // // // // // // // // // // // // // // // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
// // // // // // // // // // // // // // // // // // // // // // // // import styles from "./GenericMap.module.css";

// // // // // // // // // // // // // // // // // // // // // // // // interface GenericMapProps {
// // // // // // // // // // // // // // // // // // // // // // // //   dataType: "aod" | "pm25-est";
// // // // // // // // // // // // // // // // // // // // // // // //   fetchUrl: string;
// // // // // // // // // // // // // // // // // // // // // // // //   fetchByDateUrl: string;
// // // // // // // // // // // // // // // // // // // // // // // //   legendTitle: string;
// // // // // // // // // // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // // // // // // // // // const GenericMap = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }: GenericMapProps) => {
// // // // // // // // // // // // // // // // // // // // // // // //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// // // // // // // // // // // // // // // // // // // // // // // //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// // // // // // // // // // // // // // // // // // // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // // // // // // // // // // // // // // // // // // //   const [selectedDate, setSelectedDate] = useState<string>("");
// // // // // // // // // // // // // // // // // // // // // // // //   const [isLoading, setIsLoading] = useState<boolean>(true);

// // // // // // // // // // // // // // // // // // // // // // // //   const fetchData = useCallback(
// // // // // // // // // // // // // // // // // // // // // // // //     async (date?: string) => {
// // // // // // // // // // // // // // // // // // // // // // // //       setIsLoading(true);
// // // // // // // // // // // // // // // // // // // // // // // //       try {
// // // // // // // // // // // // // // // // // // // // // // // //         const [dataResponse, boundaryResponse] = await Promise.all([fetch(date ? `${fetchByDateUrl}?date=${date}` : fetchUrl), fetch("/api/jakarta-boundary")]);

// // // // // // // // // // // // // // // // // // // // // // // //         if (!dataResponse.ok || !boundaryResponse.ok) {
// // // // // // // // // // // // // // // // // // // // // // // //           throw new Error("Gagal memuat data");
// // // // // // // // // // // // // // // // // // // // // // // //         }

// // // // // // // // // // // // // // // // // // // // // // // //         const data = await dataResponse.json();
// // // // // // // // // // // // // // // // // // // // // // // //         const boundary = await boundaryResponse.json();

// // // // // // // // // // // // // // // // // // // // // // // //         if (data.error) throw new Error(data.error);
// // // // // // // // // // // // // // // // // // // // // // // //         if (boundary.error) throw new Error(boundary.error);

// // // // // // // // // // // // // // // // // // // // // // // //         setGeoData(data);
// // // // // // // // // // // // // // // // // // // // // // // //         setBoundaryData(boundary);
// // // // // // // // // // // // // // // // // // // // // // // //         setError(null);
// // // // // // // // // // // // // // // // // // // // // // // //       } catch (err) {
// // // // // // // // // // // // // // // // // // // // // // // //         setError((err as Error).message || "Terjadi kesalahan");
// // // // // // // // // // // // // // // // // // // // // // // //       } finally {
// // // // // // // // // // // // // // // // // // // // // // // //         setIsLoading(false);
// // // // // // // // // // // // // // // // // // // // // // // //       }
// // // // // // // // // // // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // // // // // // // // // // //     [fetchUrl, fetchByDateUrl]
// // // // // // // // // // // // // // // // // // // // // // // //   );

// // // // // // // // // // // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // // // // // // // // // // //     fetchData();
// // // // // // // // // // // // // // // // // // // // // // // //   }, [fetchData]);

// // // // // // // // // // // // // // // // // // // // // // // //   return (
// // // // // // // // // // // // // // // // // // // // // // // //     <div className={styles.container}>
// // // // // // // // // // // // // // // // // // // // // // // //       {error && (
// // // // // // // // // // // // // // // // // // // // // // // //         <div className={styles.alert}>
// // // // // // // // // // // // // // // // // // // // // // // //           <span>{error}</span>
// // // // // // // // // // // // // // // // // // // // // // // //           <button onClick={() => fetchData(selectedDate)} className={styles.retryButton}>
// // // // // // // // // // // // // // // // // // // // // // // //             Coba Lagi
// // // // // // // // // // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // // // // // // // // //       )}
// // // // // // // // // // // // // // // // // // // // // // // //       <MapContainer center={[-6.2088, 106.8456]} zoom={11} className={styles.map}>
// // // // // // // // // // // // // // // // // // // // // // // //         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
// // // // // // // // // // // // // // // // // // // // // // // //         <HeatMapLayer dataType={dataType} geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} setSelectedDate={setSelectedDate} isLoading={isLoading} legendTitle={legendTitle} />
// // // // // // // // // // // // // // // // // // // // // // // //       </MapContainer>
// // // // // // // // // // // // // // // // // // // // // // // //     </div>
// // // // // // // // // // // // // // // // // // // // // // // //   );
// // // // // // // // // // // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // // // // // // // // // // export default GenericMap;

// // // // // // // // // // // // // // // // // // // // // // // "use client";

// // // // // // // // // // // // // // // // // // // // // // // import React, { useState, useEffect, useRef } from "react";
// // // // // // // // // // // // // // // // // // // // // // // import { MapContainer, TileLayer } from "react-leaflet";
// // // // // // // // // // // // // // // // // // // // // // // import L, { LatLngBoundsExpression } from "leaflet";
// // // // // // // // // // // // // // // // // // // // // // // import "leaflet/dist/leaflet.css";
// // // // // // // // // // // // // // // // // // // // // // // import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// // // // // // // // // // // // // // // // // // // // // // // import SearchBar from "@/components/aod/SearchBar";
// // // // // // // // // // // // // // // // // // // // // // // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
// // // // // // // // // // // // // // // // // // // // // // // import dynamic from "next/dynamic";

// // // // // // // // // // // // // // // // // // // // // // // const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
// // // // // // // // // // // // // // // // // // // // // // //   ssr: false,
// // // // // // // // // // // // // // // // // // // // // // //   loading: () => <div className="h-full w-full flex items-center justify-center">Memuat kalender...</div>,
// // // // // // // // // // // // // // // // // // // // // // // });

// // // // // // // // // // // // // // // // // // // // // // // interface GenericMapProps {
// // // // // // // // // // // // // // // // // // // // // // //   dataType: "aod" | "pm25-est";
// // // // // // // // // // // // // // // // // // // // // // //   fetchUrl: string;
// // // // // // // // // // // // // // // // // // // // // // //   fetchByDateUrl: string;
// // // // // // // // // // // // // // // // // // // // // // //   legendTitle: string;
// // // // // // // // // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // // // // // // // // const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
// // // // // // // // // // // // // // // // // // // // // // //   const mapRef = useRef<L.Map | null>(null);
// // // // // // // // // // // // // // // // // // // // // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // // // // // // // // // // // // // // // // // // // // //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// // // // // // // // // // // // // // // // // // // // // // //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// // // // // // // // // // // // // // // // // // // // // // //   const [isLoading, setIsLoading] = useState(true);
// // // // // // // // // // // // // // // // // // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // // // // // // // // // // // // // // // // // //   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
// // // // // // // // // // // // // // // // // // // // // // //   const [marker, setMarker] = useState<L.LatLng | null>(null);
// // // // // // // // // // // // // // // // // // // // // // //   const [isSplitView, setIsSplitView] = useState(false);

// // // // // // // // // // // // // // // // // // // // // // //   const updateMarker = (latlng: L.LatLng) => {
// // // // // // // // // // // // // // // // // // // // // // //     setMarker(latlng);
// // // // // // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // // // // // //   const fetchData = async (url: string, date?: string) => {
// // // // // // // // // // // // // // // // // // // // // // //     setIsLoading(true);
// // // // // // // // // // // // // // // // // // // // // // //     setError(null);
// // // // // // // // // // // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // // // // // // // // // // //       const response = await fetch(url, {
// // // // // // // // // // // // // // // // // // // // // // //         method: date ? "POST" : "GET",
// // // // // // // // // // // // // // // // // // // // // // //         headers: date ? { "Content-Type": "application/json" } : undefined,
// // // // // // // // // // // // // // // // // // // // // // //         body: date ? JSON.stringify({ date }) : undefined,
// // // // // // // // // // // // // // // // // // // // // // //         cache: "no-store",
// // // // // // // // // // // // // // // // // // // // // // //       });
// // // // // // // // // // // // // // // // // // // // // // //       if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);
// // // // // // // // // // // // // // // // // // // // // // //       const data = await response.json();
// // // // // // // // // // // // // // // // // // // // // // //       if (data.error) throw new Error(data.error || "Gagal memuat data");
// // // // // // // // // // // // // // // // // // // // // // //       return data;
// // // // // // // // // // // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // // // // // // // // // // //       throw new Error(err instanceof Error ? (err.message.includes("Tidak ada data") ? "Data pada tanggal ini tidak tersedia" : err.message) : "Terjadi kesalahan saat memuat data");
// // // // // // // // // // // // // // // // // // // // // // //     } finally {
// // // // // // // // // // // // // // // // // // // // // // //       setIsLoading(false);
// // // // // // // // // // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // // // // // // // // // //     const loadData = async () => {
// // // // // // // // // // // // // // // // // // // // // // //       try {
// // // // // // // // // // // // // // // // // // // // // // //         const [data, boundary] = await Promise.all([fetchData(fetchUrl), fetchData("/api/jakarta-boundary")]);
// // // // // // // // // // // // // // // // // // // // // // //         setGeoData(data);
// // // // // // // // // // // // // // // // // // // // // // //         setBoundaryData(boundary);
// // // // // // // // // // // // // // // // // // // // // // //       } catch (err) {
// // // // // // // // // // // // // // // // // // // // // // //         setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // // // // // // // // // // // // //       }
// // // // // // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // // // // // //     loadData();
// // // // // // // // // // // // // // // // // // // // // // //   }, [fetchUrl]);

// // // // // // // // // // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // // // // // // // // // //     if (!mapRef.current) return;
// // // // // // // // // // // // // // // // // // // // // // //     mapRef.current.invalidateSize();
// // // // // // // // // // // // // // // // // // // // // // //   }, [isSplitView]);

// // // // // // // // // // // // // // // // // // // // // // //   const handleDateChange = async (date: string) => {
// // // // // // // // // // // // // // // // // // // // // // //     setSelectedDate(date);
// // // // // // // // // // // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // // // // // // // // // // //       const data = await fetchData(fetchByDateUrl, date);
// // // // // // // // // // // // // // // // // // // // // // //       setGeoData(data);
// // // // // // // // // // // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // // // // // // // // // // //       setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // // // // // //   const toggleSplitView = () => {
// // // // // // // // // // // // // // // // // // // // // // //     setIsSplitView(!isSplitView);
// // // // // // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // // // // // //   return (
// // // // // // // // // // // // // // // // // // // // // // //     <div className="relative min-h-screen w-full flex flex-col">
// // // // // // // // // // // // // // // // // // // // // // //       <div className="absolute top-4 left-4 z-[1000]">
// // // // // // // // // // // // // // // // // // // // // // //         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// // // // // // // // // // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // // // // // // // // // //       {error && (
// // // // // // // // // // // // // // // // // // // // // // //         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
// // // // // // // // // // // // // // // // // // // // // // //           <span>{error}</span>
// // // // // // // // // // // // // // // // // // // // // // //           <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
// // // // // // // // // // // // // // // // // // // // // // //             Coba Lagi
// // // // // // // // // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // // // // // // // // //           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
// // // // // // // // // // // // // // // // // // // // // // //             Tutup
// // // // // // // // // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // // // // // // // //       )}
// // // // // // // // // // // // // // // // // // // // // // //       <div className={`flex flex-col md:flex-row h-full ${isSplitView ? "md:flex-row" : ""}`}>
// // // // // // // // // // // // // // // // // // // // // // //         <div className={`${isSplitView ? "w-full md:w-1/2" : "w-full"} h-full relative`}>
// // // // // // // // // // // // // // // // // // // // // // //           <MapContainer
// // // // // // // // // // // // // // // // // // // // // // //             center={[-6.1754, 106.8272]}
// // // // // // // // // // // // // // // // // // // // // // //             zoom={12}
// // // // // // // // // // // // // // // // // // // // // // //             minZoom={12}
// // // // // // // // // // // // // // // // // // // // // // //             maxZoom={16}
// // // // // // // // // // // // // // // // // // // // // // //             maxBounds={[
// // // // // // // // // // // // // // // // // // // // // // //               [-6.45, 106.55],
// // // // // // // // // // // // // // // // // // // // // // //               [-5.9, 107.15],
// // // // // // // // // // // // // // // // // // // // // // //             ]}
// // // // // // // // // // // // // // // // // // // // // // //             maxBoundsViscosity={1}
// // // // // // // // // // // // // // // // // // // // // // //             className="h-full w-full"
// // // // // // // // // // // // // // // // // // // // // // //             zoomControl={false}
// // // // // // // // // // // // // // // // // // // // // // //             ref={mapRef}
// // // // // // // // // // // // // // // // // // // // // // //             whenCreated={(map) => {
// // // // // // // // // // // // // // // // // // // // // // //               mapRef.current = map;
// // // // // // // // // // // // // // // // // // // // // // //               map.invalidateSize();
// // // // // // // // // // // // // // // // // // // // // // //             }}
// // // // // // // // // // // // // // // // // // // // // // //           >
// // // // // // // // // // // // // // // // // // // // // // //             <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
// // // // // // // // // // // // // // // // // // // // // // //             <GenericHeatMapLayer dataType={dataType} geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} setSelectedDate={handleDateChange} isLoading={isLoading} legendTitle={legendTitle} inputRef={inputRef} />
// // // // // // // // // // // // // // // // // // // // // // //             {marker && (
// // // // // // // // // // // // // // // // // // // // // // //               <L.Marker position={marker}>
// // // // // // // // // // // // // // // // // // // // // // //                 <L.Popup>Lokasi Terpilih</L.Popup>
// // // // // // // // // // // // // // // // // // // // // // //               </L.Marker>
// // // // // // // // // // // // // // // // // // // // // // //             )}
// // // // // // // // // // // // // // // // // // // // // // //           </MapContainer>
// // // // // // // // // // // // // // // // // // // // // // //           <button onClick={toggleSplitView} className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700" title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}>
// // // // // // // // // // // // // // // // // // // // // // //             {isSplitView ? "✕" : "📅"}
// // // // // // // // // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // // // // // // // //         {isSplitView && (
// // // // // // // // // // // // // // // // // // // // // // //           <div className="w-full md:w-1/2 h-full overflow-auto">
// // // // // // // // // // // // // // // // // // // // // // //             <Calendar showRightPanel={false} isSplitView={true} />
// // // // // // // // // // // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // // // // // // // // // // //         )}
// // // // // // // // // // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // // // // // // // // // //     </div>
// // // // // // // // // // // // // // // // // // // // // // //   );
// // // // // // // // // // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // // // // // // // // // export default GenericMap;

// // // // // // // // // // // // // // // // // // // // // // "use client";

// // // // // // // // // // // // // // // // // // // // // // import React, { useState, useEffect, useRef } from "react";
// // // // // // // // // // // // // // // // // // // // // // import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"; // Use react-leaflet components
// // // // // // // // // // // // // // // // // // // // // // import L, { LatLngBoundsExpression } from "leaflet";
// // // // // // // // // // // // // // // // // // // // // // import "leaflet/dist/leaflet.css";
// // // // // // // // // // // // // // // // // // // // // // import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// // // // // // // // // // // // // // // // // // // // // // import SearchBar from "@/components/aod/SearchBar";
// // // // // // // // // // // // // // // // // // // // // // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
// // // // // // // // // // // // // // // // // // // // // // import dynamic from "next/dynamic";

// // // // // // // // // // // // // // // // // // // // // // const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
// // // // // // // // // // // // // // // // // // // // // //   ssr: false,
// // // // // // // // // // // // // // // // // // // // // //   loading: () => <div className="h-full w-full flex items-center justify-center">Memuat kalender...</div>,
// // // // // // // // // // // // // // // // // // // // // // });

// // // // // // // // // // // // // // // // // // // // // // interface GenericMapProps {
// // // // // // // // // // // // // // // // // // // // // //   dataType: "aod" | "pm25-est";
// // // // // // // // // // // // // // // // // // // // // //   fetchUrl: string;
// // // // // // // // // // // // // // // // // // // // // //   fetchByDateUrl: string;
// // // // // // // // // // // // // // // // // // // // // //   legendTitle: string;
// // // // // // // // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // // // // // // // const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
// // // // // // // // // // // // // // // // // // // // // //   const mapRef = useRef<L.Map | null>(null);
// // // // // // // // // // // // // // // // // // // // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // // // // // // // // // // // // // // // // // // // //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// // // // // // // // // // // // // // // // // // // // // //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// // // // // // // // // // // // // // // // // // // // // //   const [isLoading, setIsLoading] = useState(true);
// // // // // // // // // // // // // // // // // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // // // // // // // // // // // // // // // // //   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
// // // // // // // // // // // // // // // // // // // // // //   const [marker, setMarker] = useState<L.LatLng | null>(null);
// // // // // // // // // // // // // // // // // // // // // //   const [isSplitView, setIsSplitView] = useState(false);

// // // // // // // // // // // // // // // // // // // // // //   const updateMarker = (latlng: L.LatLng) => {
// // // // // // // // // // // // // // // // // // // // // //     setMarker(latlng);
// // // // // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // // // // //   const fetchData = async (url: string, date?: string) => {
// // // // // // // // // // // // // // // // // // // // // //     setIsLoading(true);
// // // // // // // // // // // // // // // // // // // // // //     setError(null);
// // // // // // // // // // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // // // // // // // // // //       const response = await fetch(url, {
// // // // // // // // // // // // // // // // // // // // // //         method: date ? "POST" : "GET",
// // // // // // // // // // // // // // // // // // // // // //         headers: date ? { "Content-Type": "application/json" } : undefined,
// // // // // // // // // // // // // // // // // // // // // //         body: date ? JSON.stringify({ date }) : undefined,
// // // // // // // // // // // // // // // // // // // // // //         cache: "no-store",
// // // // // // // // // // // // // // // // // // // // // //       });
// // // // // // // // // // // // // // // // // // // // // //       if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);
// // // // // // // // // // // // // // // // // // // // // //       const data = await response.json();
// // // // // // // // // // // // // // // // // // // // // //       if (data.error) throw new Error(data.error || "Gagal memuat data");
// // // // // // // // // // // // // // // // // // // // // //       return data;
// // // // // // // // // // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // // // // // // // // // //       throw new Error(err instanceof Error ? (err.message.includes("Tidak ada data") ? "Data pada tanggal ini tidak tersedia" : err.message) : "Terjadi kesalahan saat memuat data");
// // // // // // // // // // // // // // // // // // // // // //     } finally {
// // // // // // // // // // // // // // // // // // // // // //       setIsLoading(false);
// // // // // // // // // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // // // // // // // // //     const loadData = async () => {
// // // // // // // // // // // // // // // // // // // // // //       try {
// // // // // // // // // // // // // // // // // // // // // //         const [data, boundary] = await Promise.all([fetchData(fetchUrl), fetchData("/api/jakarta-boundary")]);
// // // // // // // // // // // // // // // // // // // // // //         setGeoData(data);
// // // // // // // // // // // // // // // // // // // // // //         setBoundaryData(boundary);
// // // // // // // // // // // // // // // // // // // // // //       } catch (err) {
// // // // // // // // // // // // // // // // // // // // // //         setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // // // // // // // // // // // //       }
// // // // // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // // // // //     loadData();
// // // // // // // // // // // // // // // // // // // // // //   }, [fetchUrl]);

// // // // // // // // // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // // // // // // // // //     if (!mapRef.current) return;
// // // // // // // // // // // // // // // // // // // // // //     mapRef.current.invalidateSize();
// // // // // // // // // // // // // // // // // // // // // //   }, [isSplitView]);

// // // // // // // // // // // // // // // // // // // // // //   const handleDateChange = async (date: string) => {
// // // // // // // // // // // // // // // // // // // // // //     setSelectedDate(date);
// // // // // // // // // // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // // // // // // // // // //       const data = await fetchData(fetchByDateUrl, date);
// // // // // // // // // // // // // // // // // // // // // //       setGeoData(data);
// // // // // // // // // // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // // // // // // // // // //       setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // // // // //   const toggleSplitView = () => {
// // // // // // // // // // // // // // // // // // // // // //     setIsSplitView(!isSplitView);
// // // // // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // // // // //   return (
// // // // // // // // // // // // // // // // // // // // // //     <div className="relative min-h-screen w-full flex flex-col">
// // // // // // // // // // // // // // // // // // // // // //       <div className="absolute top-4 left-4 z-[1000]">
// // // // // // // // // // // // // // // // // // // // // //         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// // // // // // // // // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // // // // // // // // //       {error && (
// // // // // // // // // // // // // // // // // // // // // //         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
// // // // // // // // // // // // // // // // // // // // // //           <span>{error}</span>
// // // // // // // // // // // // // // // // // // // // // //           <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
// // // // // // // // // // // // // // // // // // // // // //             Coba Lagi
// // // // // // // // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // // // // // // // //           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
// // // // // // // // // // // // // // // // // // // // // //             Tutup
// // // // // // // // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // // // // // // //       )}
// // // // // // // // // // // // // // // // // // // // // //       <div className={`flex flex-col md:flex-row h-full ${isSplitView ? "md:flex-row" : ""}`}>
// // // // // // // // // // // // // // // // // // // // // //         <div className={`${isSplitView ? "w-full md:w-1/2" : "w-full"} h-full relative`}>
// // // // // // // // // // // // // // // // // // // // // //           <MapContainer
// // // // // // // // // // // // // // // // // // // // // //             center={[-6.1754, 106.8272]}
// // // // // // // // // // // // // // // // // // // // // //             zoom={12}
// // // // // // // // // // // // // // // // // // // // // //             minZoom={12}
// // // // // // // // // // // // // // // // // // // // // //             maxZoom={16}
// // // // // // // // // // // // // // // // // // // // // //             maxBounds={[
// // // // // // // // // // // // // // // // // // // // // //               [-6.45, 106.55],
// // // // // // // // // // // // // // // // // // // // // //               [-5.9, 107.15],
// // // // // // // // // // // // // // // // // // // // // //             ]}
// // // // // // // // // // // // // // // // // // // // // //             maxBoundsViscosity={1}
// // // // // // // // // // // // // // // // // // // // // //             className="h-full w-full"
// // // // // // // // // // // // // // // // // // // // // //             zoomControl={false}
// // // // // // // // // // // // // // // // // // // // // //             ref={mapRef}
// // // // // // // // // // // // // // // // // // // // // //             whenReady={(map) => {
// // // // // // // // // // // // // // // // // // // // // //               mapRef.current = map.target as L.Map; // Explicitly type map.target as L.Map
// // // // // // // // // // // // // // // // // // // // // //               mapRef.current.invalidateSize();
// // // // // // // // // // // // // // // // // // // // // //             }}
// // // // // // // // // // // // // // // // // // // // // //           >
// // // // // // // // // // // // // // // // // // // // // //             <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
// // // // // // // // // // // // // // // // // // // // // //             <GenericHeatMapLayer dataType={dataType} geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} setSelectedDate={handleDateChange} isLoading={isLoading} legendTitle={legendTitle} inputRef={inputRef} />
// // // // // // // // // // // // // // // // // // // // // //             {marker && (
// // // // // // // // // // // // // // // // // // // // // //               <Marker position={marker}>
// // // // // // // // // // // // // // // // // // // // // //                 <Popup>Lokasi Terpilih</Popup>
// // // // // // // // // // // // // // // // // // // // // //               </Marker>
// // // // // // // // // // // // // // // // // // // // // //             )}
// // // // // // // // // // // // // // // // // // // // // //           </MapContainer>
// // // // // // // // // // // // // // // // // // // // // //           <button onClick={toggleSplitView} className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700" title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}>
// // // // // // // // // // // // // // // // // // // // // //             {isSplitView ? "✕" : "📅"}
// // // // // // // // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // // // // // // //         {isSplitView && (
// // // // // // // // // // // // // // // // // // // // // //           <div className="w-full md:w-1/2 h-full overflow-auto">
// // // // // // // // // // // // // // // // // // // // // //             <Calendar showRightPanel={false} isSplitView={true} />
// // // // // // // // // // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // // // // // // // // // //         )}
// // // // // // // // // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // // // // // // // // //     </div>
// // // // // // // // // // // // // // // // // // // // // //   );
// // // // // // // // // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // // // // // // // // export default GenericMap;

// // // // // // // // // // // // // // // // // // // // // // components/map/GenericMap.tsx
// // // // // // // // // // // // // // // // // // // // // "use client";

// // // // // // // // // // // // // // // // // // // // // import React, { useState, useEffect, useRef } from "react";
// // // // // // // // // // // // // // // // // // // // // import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// // // // // // // // // // // // // // // // // // // // // import L, { LatLngBoundsExpression, LeafletEvent } from "leaflet";
// // // // // // // // // // // // // // // // // // // // // import "leaflet/dist/leaflet.css";
// // // // // // // // // // // // // // // // // // // // // import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// // // // // // // // // // // // // // // // // // // // // import SearchBar from "@/components/aod/SearchBar";
// // // // // // // // // // // // // // // // // // // // // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
// // // // // // // // // // // // // // // // // // // // // import dynamic from "next/dynamic";

// // // // // // // // // // // // // // // // // // // // // const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
// // // // // // // // // // // // // // // // // // // // //   ssr: false,
// // // // // // // // // // // // // // // // // // // // //   loading: () => <div className="h-full w-full flex items-center justify-center">Memuat kalender...</div>,
// // // // // // // // // // // // // // // // // // // // // });

// // // // // // // // // // // // // // // // // // // // // interface GenericMapProps {
// // // // // // // // // // // // // // // // // // // // //   dataType: "aod" | "pm25-est";
// // // // // // // // // // // // // // // // // // // // //   fetchUrl: string;
// // // // // // // // // // // // // // // // // // // // //   fetchByDateUrl: string;
// // // // // // // // // // // // // // // // // // // // //   legendTitle: string;
// // // // // // // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // // // // // // const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
// // // // // // // // // // // // // // // // // // // // //   const mapRef = useRef<L.Map | null>(null);
// // // // // // // // // // // // // // // // // // // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // // // // // // // // // // // // // // // // // // //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// // // // // // // // // // // // // // // // // // // // //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// // // // // // // // // // // // // // // // // // // // //   const [isLoading, setIsLoading] = useState(true);
// // // // // // // // // // // // // // // // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // // // // // // // // // // // // // // // //   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
// // // // // // // // // // // // // // // // // // // // //   const [marker, setMarker] = useState<L.LatLng | null>(null);
// // // // // // // // // // // // // // // // // // // // //   const [isSplitView, setIsSplitView] = useState(false);

// // // // // // // // // // // // // // // // // // // // //   const updateMarker = (latlng: L.LatLng) => {
// // // // // // // // // // // // // // // // // // // // //     setMarker(latlng);
// // // // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // // // //   const fetchData = async (url: string, date?: string) => {
// // // // // // // // // // // // // // // // // // // // //     setIsLoading(true);
// // // // // // // // // // // // // // // // // // // // //     setError(null);
// // // // // // // // // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // // // // // // // // //       const response = await fetch(url, {
// // // // // // // // // // // // // // // // // // // // //         method: date ? "POST" : "GET",
// // // // // // // // // // // // // // // // // // // // //         headers: date ? { "Content-Type": "application/json" } : undefined,
// // // // // // // // // // // // // // // // // // // // //         body: date ? JSON.stringify({ date }) : undefined,
// // // // // // // // // // // // // // // // // // // // //         cache: "no-store",
// // // // // // // // // // // // // // // // // // // // //       });
// // // // // // // // // // // // // // // // // // // // //       if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);
// // // // // // // // // // // // // // // // // // // // //       const data = await response.json();
// // // // // // // // // // // // // // // // // // // // //       if (data.error) throw new Error(data.error || "Gagal memuat data");
// // // // // // // // // // // // // // // // // // // // //       return data;
// // // // // // // // // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // // // // // // // // //       throw new Error(err instanceof Error ? (err.message.includes("Tidak ada data") ? "Data pada tanggal ini tidak tersedia" : err.message) : "Terjadi kesalahan saat memuat data");
// // // // // // // // // // // // // // // // // // // // //     } finally {
// // // // // // // // // // // // // // // // // // // // //       setIsLoading(false);
// // // // // // // // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // // // // // // // //     const loadData = async () => {
// // // // // // // // // // // // // // // // // // // // //       try {
// // // // // // // // // // // // // // // // // // // // //         const [data, boundary] = await Promise.all([fetchData(fetchUrl), fetchData("/api/jakarta-boundary")]);
// // // // // // // // // // // // // // // // // // // // //         setGeoData(data);
// // // // // // // // // // // // // // // // // // // // //         setBoundaryData(boundary);
// // // // // // // // // // // // // // // // // // // // //       } catch (err) {
// // // // // // // // // // // // // // // // // // // // //         setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // // // // // // // // // // //       }
// // // // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // // // //     loadData();
// // // // // // // // // // // // // // // // // // // // //   }, [fetchUrl]);

// // // // // // // // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // // // // // // // //     if (!mapRef.current) return;
// // // // // // // // // // // // // // // // // // // // //     mapRef.current.invalidateSize();
// // // // // // // // // // // // // // // // // // // // //   }, [isSplitView]);

// // // // // // // // // // // // // // // // // // // // //   const handleDateChange = async (date: string) => {
// // // // // // // // // // // // // // // // // // // // //     setSelectedDate(date);
// // // // // // // // // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // // // // // // // // //       const data = await fetchData(fetchByDateUrl, date);
// // // // // // // // // // // // // // // // // // // // //       setGeoData(data);
// // // // // // // // // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // // // // // // // // //       setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // // // //   const toggleSplitView = () => {
// // // // // // // // // // // // // // // // // // // // //     setIsSplitView(!isSplitView);
// // // // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // // // //   const handleMapReady = (event: LeafletEvent) => {
// // // // // // // // // // // // // // // // // // // // //     mapRef.current = event.target as L.Map;
// // // // // // // // // // // // // // // // // // // // //     mapRef.current.invalidateSize();
// // // // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // // // //   return (
// // // // // // // // // // // // // // // // // // // // //     <div className="relative min-h-screen w-full flex flex-col">
// // // // // // // // // // // // // // // // // // // // //       <div className="absolute top-4 left-4 z-[1000]">
// // // // // // // // // // // // // // // // // // // // //         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// // // // // // // // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // // // // // // // //       {error && (
// // // // // // // // // // // // // // // // // // // // //         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
// // // // // // // // // // // // // // // // // // // // //           <span>{error}</span>
// // // // // // // // // // // // // // // // // // // // //           <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
// // // // // // // // // // // // // // // // // // // // //             Coba Lagi
// // // // // // // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // // // // // // //           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
// // // // // // // // // // // // // // // // // // // // //             Tutup
// // // // // // // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // // // // // //       )}
// // // // // // // // // // // // // // // // // // // // //       <div className={`flex flex-col md:flex-row h-full ${isSplitView ? "md:flex-row" : ""}`}>
// // // // // // // // // // // // // // // // // // // // //         <div className={`${isSplitView ? "w-full md:w-1/2" : "w-full"} h-full relative`}>
// // // // // // // // // // // // // // // // // // // // //           <MapContainer
// // // // // // // // // // // // // // // // // // // // //             center={[-6.1754, 106.8272]}
// // // // // // // // // // // // // // // // // // // // //             zoom={12}
// // // // // // // // // // // // // // // // // // // // //             minZoom={12}
// // // // // // // // // // // // // // // // // // // // //             maxZoom={16}
// // // // // // // // // // // // // // // // // // // // //             maxBounds={[
// // // // // // // // // // // // // // // // // // // // //               [-6.45, 106.55],
// // // // // // // // // // // // // // // // // // // // //               [-5.9, 107.15],
// // // // // // // // // // // // // // // // // // // // //             ]}
// // // // // // // // // // // // // // // // // // // // //             maxBoundsViscosity={1}
// // // // // // // // // // // // // // // // // // // // //             className="h-full w-full"
// // // // // // // // // // // // // // // // // // // // //             zoomControl={false}
// // // // // // // // // // // // // // // // // // // // //             ref={mapRef}
// // // // // // // // // // // // // // // // // // // // //             whenReady={handleMapReady}
// // // // // // // // // // // // // // // // // // // // //           >
// // // // // // // // // // // // // // // // // // // // //             <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
// // // // // // // // // // // // // // // // // // // // //             <GenericHeatMapLayer dataType={dataType} geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} setSelectedDate={handleDateChange} isLoading={isLoading} legendTitle={legendTitle} inputRef={inputRef} />
// // // // // // // // // // // // // // // // // // // // //             {marker && (
// // // // // // // // // // // // // // // // // // // // //               <Marker position={marker}>
// // // // // // // // // // // // // // // // // // // // //                 <Popup>Lokasi Terpilih</Popup>
// // // // // // // // // // // // // // // // // // // // //               </Marker>
// // // // // // // // // // // // // // // // // // // // //             )}
// // // // // // // // // // // // // // // // // // // // //           </MapContainer>
// // // // // // // // // // // // // // // // // // // // //           <button onClick={toggleSplitView} className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700" title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}>
// // // // // // // // // // // // // // // // // // // // //             {isSplitView ? "✕" : "📅"}
// // // // // // // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // // // // // //         {isSplitView && (
// // // // // // // // // // // // // // // // // // // // //           <div className="w-full md:w-1/2 h-full overflow-auto">
// // // // // // // // // // // // // // // // // // // // //             <Calendar showRightPanel={false} isSplitView={true} />
// // // // // // // // // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // // // // // // // // //         )}
// // // // // // // // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // // // // // // // //     </div>
// // // // // // // // // // // // // // // // // // // // //   );
// // // // // // // // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // // // // // // // export default GenericMap;

// // // // // // // // // // // // // // // // // // // // "use client";

// // // // // // // // // // // // // // // // // // // // import React, { useState, useEffect, useRef } from "react";
// // // // // // // // // // // // // // // // // // // // import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// // // // // // // // // // // // // // // // // // // // import L, { LatLngBoundsExpression, LeafletEvent } from "leaflet";
// // // // // // // // // // // // // // // // // // // // import "leaflet/dist/leaflet.css";
// // // // // // // // // // // // // // // // // // // // import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// // // // // // // // // // // // // // // // // // // // import SearchBar from "@/components/aod/SearchBar";
// // // // // // // // // // // // // // // // // // // // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
// // // // // // // // // // // // // // // // // // // // import dynamic from "next/dynamic";

// // // // // // // // // // // // // // // // // // // // const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
// // // // // // // // // // // // // // // // // // // //   ssr: false,
// // // // // // // // // // // // // // // // // // // //   loading: () => <div className="h-full w-full flex items-center justify-center">Memuat kalender...</div>,
// // // // // // // // // // // // // // // // // // // // });

// // // // // // // // // // // // // // // // // // // // interface GenericMapProps {
// // // // // // // // // // // // // // // // // // // //   dataType: "aod" | "pm25-est";
// // // // // // // // // // // // // // // // // // // //   fetchUrl: string;
// // // // // // // // // // // // // // // // // // // //   fetchByDateUrl: string;
// // // // // // // // // // // // // // // // // // // //   legendTitle: string;
// // // // // // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // // // // // const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
// // // // // // // // // // // // // // // // // // // //   const mapRef = useRef<L.Map | null>(null);
// // // // // // // // // // // // // // // // // // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // // // // // // // // // // // // // // // // // //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// // // // // // // // // // // // // // // // // // // //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// // // // // // // // // // // // // // // // // // // //   const [isLoading, setIsLoading] = useState(true);
// // // // // // // // // // // // // // // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // // // // // // // // // // // // // // //   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
// // // // // // // // // // // // // // // // // // // //   const [marker, setMarker] = useState<L.LatLng | null>(null);
// // // // // // // // // // // // // // // // // // // //   const [isSplitView, setIsSplitView] = useState(false);

// // // // // // // // // // // // // // // // // // // //   const updateMarker = (latlng: L.LatLng) => {
// // // // // // // // // // // // // // // // // // // //     setMarker(latlng);
// // // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // // //   const fetchData = async (url: string, date?: string) => {
// // // // // // // // // // // // // // // // // // // //     setIsLoading(true);
// // // // // // // // // // // // // // // // // // // //     setError(null);
// // // // // // // // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // // // // // // // //       const response = await fetch(url, {
// // // // // // // // // // // // // // // // // // // //         method: date ? "POST" : "GET",
// // // // // // // // // // // // // // // // // // // //         headers: date ? { "Content-Type": "application/json" } : undefined,
// // // // // // // // // // // // // // // // // // // //         body: date ? JSON.stringify({ date }) : undefined,
// // // // // // // // // // // // // // // // // // // //         cache: "no-store",
// // // // // // // // // // // // // // // // // // // //       });
// // // // // // // // // // // // // // // // // // // //       if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);
// // // // // // // // // // // // // // // // // // // //       const data = await response.json();
// // // // // // // // // // // // // // // // // // // //       if (data.error) throw new Error(data.error || "Gagal memuat data");
// // // // // // // // // // // // // // // // // // // //       return data;
// // // // // // // // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // // // // // // // //       throw new Error(err instanceof Error ? (err.message.includes("Tidak ada data") ? "Data pada tanggal ini tidak tersedia" : err.message) : "Terjadi kesalahan saat memuat data");
// // // // // // // // // // // // // // // // // // // //     } finally {
// // // // // // // // // // // // // // // // // // // //       setIsLoading(false);
// // // // // // // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // // // // // // //     const loadData = async () => {
// // // // // // // // // // // // // // // // // // // //       try {
// // // // // // // // // // // // // // // // // // // //         // Fetch GeoJSON data for AOD or PM2.5
// // // // // // // // // // // // // // // // // // // //         const data = await fetchData(fetchUrl);
// // // // // // // // // // // // // // // // // // // //         // Fetch boundary data directly from public/data/batas_kelurahan_jakarta.geojson
// // // // // // // // // // // // // // // // // // // //         const boundaryResponse = await fetch("/data/batas_kelurahan_jakarta.geojson", {
// // // // // // // // // // // // // // // // // // // //           cache: "no-store",
// // // // // // // // // // // // // // // // // // // //         });
// // // // // // // // // // // // // // // // // // // //         if (!boundaryResponse.ok) throw new Error(`Failed to fetch boundary data: ${boundaryResponse.status}`);
// // // // // // // // // // // // // // // // // // // //         const boundary = await boundaryResponse.json();
// // // // // // // // // // // // // // // // // // // //         setGeoData(data);
// // // // // // // // // // // // // // // // // // // //         setBoundaryData(boundary);
// // // // // // // // // // // // // // // // // // // //       } catch (err) {
// // // // // // // // // // // // // // // // // // // //         setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // // // // // // // // // //       }
// // // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // // //     loadData();
// // // // // // // // // // // // // // // // // // // //   }, [fetchUrl]);

// // // // // // // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // // // // // // //     if (!mapRef.current) return;
// // // // // // // // // // // // // // // // // // // //     mapRef.current.invalidateSize();
// // // // // // // // // // // // // // // // // // // //   }, [isSplitView]);

// // // // // // // // // // // // // // // // // // // //   const handleDateChange = async (date: string) => {
// // // // // // // // // // // // // // // // // // // //     setSelectedDate(date);
// // // // // // // // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // // // // // // // //       const data = await fetchData(fetchByDateUrl, date);
// // // // // // // // // // // // // // // // // // // //       setGeoData(data);
// // // // // // // // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // // // // // // // //       setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // // //   const toggleSplitView = () => {
// // // // // // // // // // // // // // // // // // // //     setIsSplitView(!isSplitView);
// // // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // // //   const handleMapReady = (event: LeafletEvent) => {
// // // // // // // // // // // // // // // // // // // //     mapRef.current = event.target as L.Map;
// // // // // // // // // // // // // // // // // // // //     mapRef.current.invalidateSize();
// // // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // // //   return (
// // // // // // // // // // // // // // // // // // // //     <div className="relative min-h-screen w-full flex flex-col">
// // // // // // // // // // // // // // // // // // // //       <div className="absolute top-4 left-4 z-[1000]">
// // // // // // // // // // // // // // // // // // // //         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// // // // // // // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // // // // // // //       {error && (
// // // // // // // // // // // // // // // // // // // //         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
// // // // // // // // // // // // // // // // // // // //           <span>{error}</span>
// // // // // // // // // // // // // // // // // // // //           <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
// // // // // // // // // // // // // // // // // // // //             Coba Lagi
// // // // // // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // // // // // //           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
// // // // // // // // // // // // // // // // // // // //             Tutup
// // // // // // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // // // // //       )}
// // // // // // // // // // // // // // // // // // // //       <div className={`flex flex-col md:flex-row h-full ${isSplitView ? "md:flex-row" : ""}`}>
// // // // // // // // // // // // // // // // // // // //         <div className={`${isSplitView ? "w-full md:w-1/2" : "w-full"} h-full relative`}>
// // // // // // // // // // // // // // // // // // // //           <MapContainer
// // // // // // // // // // // // // // // // // // // //             center={[-6.1754, 106.8272]}
// // // // // // // // // // // // // // // // // // // //             zoom={12}
// // // // // // // // // // // // // // // // // // // //             minZoom={12}
// // // // // // // // // // // // // // // // // // // //             maxZoom={16}
// // // // // // // // // // // // // // // // // // // //             maxBounds={[
// // // // // // // // // // // // // // // // // // // //               [-6.45, 106.55],
// // // // // // // // // // // // // // // // // // // //               [-5.9, 107.15],
// // // // // // // // // // // // // // // // // // // //             ]}
// // // // // // // // // // // // // // // // // // // //             maxBoundsViscosity={1}
// // // // // // // // // // // // // // // // // // // //             className="h-full w-full"
// // // // // // // // // // // // // // // // // // // //             zoomControl={false}
// // // // // // // // // // // // // // // // // // // //             ref={mapRef}
// // // // // // // // // // // // // // // // // // // //             whenReady={handleMapReady}
// // // // // // // // // // // // // // // // // // // //           >
// // // // // // // // // // // // // // // // // // // //             <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
// // // // // // // // // // // // // // // // // // // //             <GenericHeatMapLayer dataType={dataType} geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} setSelectedDate={handleDateChange} isLoading={isLoading} legendTitle={legendTitle} inputRef={inputRef} />
// // // // // // // // // // // // // // // // // // // //             {marker && (
// // // // // // // // // // // // // // // // // // // //               <Marker position={marker}>
// // // // // // // // // // // // // // // // // // // //                 <Popup>Lokasi Terpilih</Popup>
// // // // // // // // // // // // // // // // // // // //               </Marker>
// // // // // // // // // // // // // // // // // // // //             )}
// // // // // // // // // // // // // // // // // // // //           </MapContainer>
// // // // // // // // // // // // // // // // // // // //           <button onClick={toggleSplitView} className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700" title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}>
// // // // // // // // // // // // // // // // // // // //             {isSplitView ? "✕" : "📅"}
// // // // // // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // // // // //         {isSplitView && (
// // // // // // // // // // // // // // // // // // // //           <div className="w-full md:w-1/2 h-full overflow-auto">
// // // // // // // // // // // // // // // // // // // //             <Calendar showRightPanel={false} isSplitView={true} />
// // // // // // // // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // // // // // // // //         )}
// // // // // // // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // // // // // // //     </div>
// // // // // // // // // // // // // // // // // // // //   );
// // // // // // // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // // // // // // export default GenericMap;

// // // // // // // // // // // // // // // // // // // "use client";

// // // // // // // // // // // // // // // // // // // import React, { useState, useEffect, useRef } from "react";
// // // // // // // // // // // // // // // // // // // import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// // // // // // // // // // // // // // // // // // // import L, { LatLngBoundsExpression, LeafletEvent } from "leaflet";
// // // // // // // // // // // // // // // // // // // import "leaflet/dist/leaflet.css";
// // // // // // // // // // // // // // // // // // // import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// // // // // // // // // // // // // // // // // // // import SearchBar from "@/components/aod/SearchBar";
// // // // // // // // // // // // // // // // // // // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
// // // // // // // // // // // // // // // // // // // import dynamic from "next/dynamic";

// // // // // // // // // // // // // // // // // // // const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
// // // // // // // // // // // // // // // // // // //   ssr: false,
// // // // // // // // // // // // // // // // // // //   loading: () => <div className="h-full w-full flex items-center justify-center">Memuat kalender...</div>,
// // // // // // // // // // // // // // // // // // // });

// // // // // // // // // // // // // // // // // // // interface GenericMapProps {
// // // // // // // // // // // // // // // // // // //   dataType: "aod" | "pm25-est";
// // // // // // // // // // // // // // // // // // //   fetchUrl: string;
// // // // // // // // // // // // // // // // // // //   fetchByDateUrl: string;
// // // // // // // // // // // // // // // // // // //   legendTitle: string;
// // // // // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // // // // const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
// // // // // // // // // // // // // // // // // // //   const mapRef = useRef<L.Map | null>(null);
// // // // // // // // // // // // // // // // // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // // // // // // // // // // // // // // // // //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// // // // // // // // // // // // // // // // // // //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// // // // // // // // // // // // // // // // // // //   const [isLoading, setIsLoading] = useState(true);
// // // // // // // // // // // // // // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // // // // // // // // // // // // // //   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
// // // // // // // // // // // // // // // // // // //   const [marker, setMarker] = useState<L.LatLng | null>(null);
// // // // // // // // // // // // // // // // // // //   const [isSplitView, setIsSplitView] = useState(false);

// // // // // // // // // // // // // // // // // // //   const updateMarker = (latlng: L.LatLng) => {
// // // // // // // // // // // // // // // // // // //     setMarker(latlng);
// // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // //   const fetchData = async (url: string, date?: string) => {
// // // // // // // // // // // // // // // // // // //     setIsLoading(true);
// // // // // // // // // // // // // // // // // // //     setError(null);
// // // // // // // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // // // // // // //       const response = await fetch(url, {
// // // // // // // // // // // // // // // // // // //         method: date ? "POST" : "GET",
// // // // // // // // // // // // // // // // // // //         headers: date ? { "Content-Type": "application/json" } : undefined,
// // // // // // // // // // // // // // // // // // //         body: date ? JSON.stringify({ date }) : undefined,
// // // // // // // // // // // // // // // // // // //         cache: "no-store",
// // // // // // // // // // // // // // // // // // //       });
// // // // // // // // // // // // // // // // // // //       if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);
// // // // // // // // // // // // // // // // // // //       const data = await response.json();
// // // // // // // // // // // // // // // // // // //       if (data.error) throw new Error(data.error || "Gagal memuat data");
// // // // // // // // // // // // // // // // // // //       return data;
// // // // // // // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // // // // // // //       throw new Error(err instanceof Error ? (err.message.includes("Tidak ada data") ? "Data pada tanggal ini tidak tersedia" : err.message) : "Terjadi kesalahan saat memuat data");
// // // // // // // // // // // // // // // // // // //     } finally {
// // // // // // // // // // // // // // // // // // //       setIsLoading(false);
// // // // // // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // // // // // //     const loadData = async () => {
// // // // // // // // // // // // // // // // // // //       try {
// // // // // // // // // // // // // // // // // // //         const [data, boundary] = await Promise.all([
// // // // // // // // // // // // // // // // // // //           // Ubah ke file statis untuk pm25-est, tetap gunakan fetchUrl untuk aod
// // // // // // // // // // // // // // // // // // //           dataType === "pm25-est" ? fetch("/data/pm25-estimasi.json", { cache: "no-store" }) : fetchData(fetchUrl),
// // // // // // // // // // // // // // // // // // //           fetch("/data/batas_kelurahan_jakarta.geojson", { cache: "no-store" }),
// // // // // // // // // // // // // // // // // // //         ]);
// // // // // // // // // // // // // // // // // // //         if (!data.ok) throw new Error(`Failed to fetch PM2.5 data: ${data.status}`);
// // // // // // // // // // // // // // // // // // //         if (!boundary.ok) throw new Error(`Failed to fetch boundary data: ${boundary.status}`);
// // // // // // // // // // // // // // // // // // //         const geoData = await data.json();
// // // // // // // // // // // // // // // // // // //         const boundaryData = await boundary.json();
// // // // // // // // // // // // // // // // // // //         setGeoData(geoData);
// // // // // // // // // // // // // // // // // // //         setBoundaryData(boundaryData);
// // // // // // // // // // // // // // // // // // //       } catch (err) {
// // // // // // // // // // // // // // // // // // //         setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // // // // // // // // //       }
// // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // //     loadData();
// // // // // // // // // // // // // // // // // // //   }, [fetchUrl, dataType]);

// // // // // // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // // // // // //     if (!mapRef.current) return;
// // // // // // // // // // // // // // // // // // //     mapRef.current.invalidateSize();
// // // // // // // // // // // // // // // // // // //   }, [isSplitView]);

// // // // // // // // // // // // // // // // // // //   const handleDateChange = async (date: string) => {
// // // // // // // // // // // // // // // // // // //     setSelectedDate(date);
// // // // // // // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // // // // // // //       const data = await fetchData(fetchByDateUrl, date);
// // // // // // // // // // // // // // // // // // //       setGeoData(data);
// // // // // // // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // // // // // // //       setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // //   const toggleSplitView = () => {
// // // // // // // // // // // // // // // // // // //     setIsSplitView(!isSplitView);
// // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // //   const handleMapReady = (event: LeafletEvent) => {
// // // // // // // // // // // // // // // // // // //     mapRef.current = event.target as L.Map;
// // // // // // // // // // // // // // // // // // //     mapRef.current.invalidateSize();
// // // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // // //   return (
// // // // // // // // // // // // // // // // // // //     <div className="relative min-h-screen w-full flex flex-col">
// // // // // // // // // // // // // // // // // // //       <div className="absolute top-4 left-4 z-[1000]">
// // // // // // // // // // // // // // // // // // //         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// // // // // // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // // // // // //       {error && (
// // // // // // // // // // // // // // // // // // //         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
// // // // // // // // // // // // // // // // // // //           <span>{error}</span>
// // // // // // // // // // // // // // // // // // //           <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
// // // // // // // // // // // // // // // // // // //             Coba Lagi
// // // // // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // // // // //           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
// // // // // // // // // // // // // // // // // // //             Tutup
// // // // // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // // // //       )}
// // // // // // // // // // // // // // // // // // //       <div className={`flex flex-col md:flex-row h-full ${isSplitView ? "md:flex-row" : ""}`}>
// // // // // // // // // // // // // // // // // // //         <div className={`${isSplitView ? "w-full md:w-1/2" : "w-full"} h-full relative`}>
// // // // // // // // // // // // // // // // // // //           <MapContainer
// // // // // // // // // // // // // // // // // // //             center={[-6.1754, 106.8272]}
// // // // // // // // // // // // // // // // // // //             zoom={12}
// // // // // // // // // // // // // // // // // // //             minZoom={12}
// // // // // // // // // // // // // // // // // // //             maxZoom={16}
// // // // // // // // // // // // // // // // // // //             maxBounds={[
// // // // // // // // // // // // // // // // // // //               [-6.45, 106.55],
// // // // // // // // // // // // // // // // // // //               [-5.9, 107.15],
// // // // // // // // // // // // // // // // // // //             ]}
// // // // // // // // // // // // // // // // // // //             maxBoundsViscosity={1}
// // // // // // // // // // // // // // // // // // //             className="h-full w-full"
// // // // // // // // // // // // // // // // // // //             zoomControl={false}
// // // // // // // // // // // // // // // // // // //             ref={mapRef}
// // // // // // // // // // // // // // // // // // //             whenReady={handleMapReady}
// // // // // // // // // // // // // // // // // // //           >
// // // // // // // // // // // // // // // // // // //             <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
// // // // // // // // // // // // // // // // // // //             <GenericHeatMapLayer dataType={dataType} geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} setSelectedDate={handleDateChange} isLoading={isLoading} legendTitle={legendTitle} inputRef={inputRef} />
// // // // // // // // // // // // // // // // // // //             {marker && (
// // // // // // // // // // // // // // // // // // //               <Marker position={marker}>
// // // // // // // // // // // // // // // // // // //                 <Popup>Lokasi Terpilih</Popup>
// // // // // // // // // // // // // // // // // // //               </Marker>
// // // // // // // // // // // // // // // // // // //             )}
// // // // // // // // // // // // // // // // // // //           </MapContainer>
// // // // // // // // // // // // // // // // // // //           <button onClick={toggleSplitView} className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700" title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}>
// // // // // // // // // // // // // // // // // // //             {isSplitView ? "✕" : "📅"}
// // // // // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // // // //         {isSplitView && (
// // // // // // // // // // // // // // // // // // //           <div className="w-full md:w-1/2 h-full overflow-auto">
// // // // // // // // // // // // // // // // // // //             <Calendar showRightPanel={false} isSplitView={true} />
// // // // // // // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // // // // // // //         )}
// // // // // // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // // // // // //     </div>
// // // // // // // // // // // // // // // // // // //   );
// // // // // // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // // // // // export default GenericMap;

// // // // // // // // // // // // // // // // // // "use client";

// // // // // // // // // // // // // // // // // // import React, { useState, useEffect, useRef } from "react";
// // // // // // // // // // // // // // // // // // import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// // // // // // // // // // // // // // // // // // import L, { LatLngBoundsExpression, LeafletEvent } from "leaflet";
// // // // // // // // // // // // // // // // // // import "leaflet/dist/leaflet.css";
// // // // // // // // // // // // // // // // // // import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// // // // // // // // // // // // // // // // // // import SearchBar from "@/components/aod/SearchBar";
// // // // // // // // // // // // // // // // // // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
// // // // // // // // // // // // // // // // // // import dynamic from "next/dynamic";

// // // // // // // // // // // // // // // // // // const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
// // // // // // // // // // // // // // // // // //   ssr: false,
// // // // // // // // // // // // // // // // // //   loading: () => <div className="h-full w-full flex items-center justify-center">Memuat kalender...</div>,
// // // // // // // // // // // // // // // // // // });

// // // // // // // // // // // // // // // // // // interface GenericMapProps {
// // // // // // // // // // // // // // // // // //   dataType: "aod" | "pm25-est";
// // // // // // // // // // // // // // // // // //   fetchUrl: string;
// // // // // // // // // // // // // // // // // //   fetchByDateUrl: string;
// // // // // // // // // // // // // // // // // //   legendTitle: string;
// // // // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // // // const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
// // // // // // // // // // // // // // // // // //   const mapRef = useRef<L.Map | null>(null);
// // // // // // // // // // // // // // // // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // // // // // // // // // // // // // // // //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// // // // // // // // // // // // // // // // // //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// // // // // // // // // // // // // // // // // //   const [isLoading, setIsLoading] = useState(true);
// // // // // // // // // // // // // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // // // // // // // // // // // // //   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
// // // // // // // // // // // // // // // // // //   const [marker, setMarker] = useState<L.LatLng | null>(null);
// // // // // // // // // // // // // // // // // //   const [isSplitView, setIsSplitView] = useState(false);

// // // // // // // // // // // // // // // // // //   const updateMarker = (latlng: L.LatLng) => {
// // // // // // // // // // // // // // // // // //     setMarker(latlng);
// // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // //   const fetchData = async (url: string, date?: string) => {
// // // // // // // // // // // // // // // // // //     setIsLoading(true);
// // // // // // // // // // // // // // // // // //     setError(null);
// // // // // // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // // // // // //       const response = await fetch(url, {
// // // // // // // // // // // // // // // // // //         method: date ? "POST" : "GET",
// // // // // // // // // // // // // // // // // //         headers: date ? { "Content-Type": "application/json" } : undefined,
// // // // // // // // // // // // // // // // // //         body: date ? JSON.stringify({ tanggal: date }) : undefined, // Ubah ke 'tanggal' untuk konsistensi
// // // // // // // // // // // // // // // // // //         cache: "no-store",
// // // // // // // // // // // // // // // // // //       });
// // // // // // // // // // // // // // // // // //       if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);
// // // // // // // // // // // // // // // // // //       const rawText = await response.text();
// // // // // // // // // // // // // // // // // //       const cleanText = rawText.replace(/NaN/g, "null"); // Handle NaN values
// // // // // // // // // // // // // // // // // //       const data = JSON.parse(cleanText);
// // // // // // // // // // // // // // // // // //       if (data.error) throw new Error(data.error || "Gagal memuat data");
// // // // // // // // // // // // // // // // // //       return data;
// // // // // // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // // // // // //       throw new Error(err instanceof Error ? (err.message.includes("Tidak ada data") ? "Data pada tanggal ini tidak tersedia" : err.message) : "Terjadi kesalahan saat memuat data");
// // // // // // // // // // // // // // // // // //     } finally {
// // // // // // // // // // // // // // // // // //       setIsLoading(false);
// // // // // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // // // // //     const loadData = async () => {
// // // // // // // // // // // // // // // // // //       try {
// // // // // // // // // // // // // // // // // //         const [data, boundary] = await Promise.all([fetchData(fetchUrl), fetch("/data/batas_kelurahan_jakarta.geojson", { cache: "no-store" })]);
// // // // // // // // // // // // // // // // // //         if (!boundary.ok) throw new Error(`Failed to fetch boundary data: ${boundary.status}`);
// // // // // // // // // // // // // // // // // //         const boundaryData = await boundary.json();
// // // // // // // // // // // // // // // // // //         setGeoData(data);
// // // // // // // // // // // // // // // // // //         setBoundaryData(boundaryData);
// // // // // // // // // // // // // // // // // //       } catch (err) {
// // // // // // // // // // // // // // // // // //         console.error("Error in loadData:", err);
// // // // // // // // // // // // // // // // // //         setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // // // // // // // //       }
// // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // //     loadData();
// // // // // // // // // // // // // // // // // //   }, [fetchUrl]);

// // // // // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // // // // //     if (!mapRef.current) return;
// // // // // // // // // // // // // // // // // //     mapRef.current.invalidateSize();
// // // // // // // // // // // // // // // // // //   }, [isSplitView]);

// // // // // // // // // // // // // // // // // //   const handleDateChange = async (date: string) => {
// // // // // // // // // // // // // // // // // //     setSelectedDate(date);
// // // // // // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // // // // // //       const data = await fetchData(fetchByDateUrl, date);
// // // // // // // // // // // // // // // // // //       setGeoData(data);
// // // // // // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // // // // // //       setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // //   const handleMapReady = (event: LeafletEvent) => {
// // // // // // // // // // // // // // // // // //     mapRef.current = event.target as L.Map;
// // // // // // // // // // // // // // // // // //     mapRef.current.invalidateSize();
// // // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // // //   return (
// // // // // // // // // // // // // // // // // //     <div className="relative min-h-screen w-full flex flex-col">
// // // // // // // // // // // // // // // // // //       <div className="absolute top-4 left-4 z-[1000]">
// // // // // // // // // // // // // // // // // //         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// // // // // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // // // // //       {error && (
// // // // // // // // // // // // // // // // // //         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
// // // // // // // // // // // // // // // // // //           <span>{error}</span>
// // // // // // // // // // // // // // // // // //           <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
// // // // // // // // // // // // // // // // // //             Coba Lagi
// // // // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // // // //           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
// // // // // // // // // // // // // // // // // //             Tutup
// // // // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // // //       )}
// // // // // // // // // // // // // // // // // //       <div className={`flex flex-col md:flex-row h-full ${isSplitView ? "md:flex-row" : ""}`}>
// // // // // // // // // // // // // // // // // //         <div className={`${isSplitView ? "w-full md:w-1/2" : "w-full"} h-full relative`}>
// // // // // // // // // // // // // // // // // //           <MapContainer
// // // // // // // // // // // // // // // // // //             center={[-6.1754, 106.8272]}
// // // // // // // // // // // // // // // // // //             zoom={12}
// // // // // // // // // // // // // // // // // //             minZoom={12}
// // // // // // // // // // // // // // // // // //             maxZoom={16}
// // // // // // // // // // // // // // // // // //             maxBounds={[
// // // // // // // // // // // // // // // // // //               [-6.45, 106.55],
// // // // // // // // // // // // // // // // // //               [-5.9, 107.15],
// // // // // // // // // // // // // // // // // //             ]}
// // // // // // // // // // // // // // // // // //             maxBoundsViscosity={1}
// // // // // // // // // // // // // // // // // //             className="h-full w-full"
// // // // // // // // // // // // // // // // // //             zoomControl={false}
// // // // // // // // // // // // // // // // // //             ref={mapRef}
// // // // // // // // // // // // // // // // // //             whenReady={handleMapReady}
// // // // // // // // // // // // // // // // // //           >
// // // // // // // // // // // // // // // // // //             <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
// // // // // // // // // // // // // // // // // //             <GenericHeatMapLayer dataType={dataType} geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} setSelectedDate={handleDateChange} isLoading={isLoading} legendTitle={legendTitle} inputRef={inputRef} />
// // // // // // // // // // // // // // // // // //             {marker && (
// // // // // // // // // // // // // // // // // //               <Marker position={marker}>
// // // // // // // // // // // // // // // // // //                 <Popup>Lokasi Terpilih</Popup>
// // // // // // // // // // // // // // // // // //               </Marker>
// // // // // // // // // // // // // // // // // //             )}
// // // // // // // // // // // // // // // // // //           </MapContainer>
// // // // // // // // // // // // // // // // // //           <button onClick={() => setIsSplitView(!isSplitView)} className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700" title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}>
// // // // // // // // // // // // // // // // // //             {isSplitView ? "✕" : "📅"}
// // // // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // // //         {isSplitView && (
// // // // // // // // // // // // // // // // // //           <div className="w-full md:w-1/2 h-full overflow-auto">
// // // // // // // // // // // // // // // // // //             <Calendar showRightPanel={false} isSplitView={true} />
// // // // // // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // // // // // //         )}
// // // // // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // // // // //     </div>
// // // // // // // // // // // // // // // // // //   );
// // // // // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // // // // export default GenericMap;

// // // // // // // // // // // // // // // // // "use client";

// // // // // // // // // // // // // // // // // import React, { useState, useEffect, useRef } from "react";
// // // // // // // // // // // // // // // // // import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// // // // // // // // // // // // // // // // // import L, { LatLngBoundsExpression, LeafletEvent } from "leaflet";
// // // // // // // // // // // // // // // // // import "leaflet/dist/leaflet.css";
// // // // // // // // // // // // // // // // // import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// // // // // // // // // // // // // // // // // import SearchBar from "@/components/aod/SearchBar";
// // // // // // // // // // // // // // // // // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
// // // // // // // // // // // // // // // // // import dynamic from "next/dynamic";

// // // // // // // // // // // // // // // // // const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
// // // // // // // // // // // // // // // // //   ssr: false,
// // // // // // // // // // // // // // // // //   loading: () => <div className="h-full w-full flex items-center justify-center">Memuat kalender...</div>,
// // // // // // // // // // // // // // // // // });

// // // // // // // // // // // // // // // // // interface GenericMapProps {
// // // // // // // // // // // // // // // // //   dataType: "aod" | "pm25-est";
// // // // // // // // // // // // // // // // //   fetchUrl: string;
// // // // // // // // // // // // // // // // //   fetchByDateUrl: string;
// // // // // // // // // // // // // // // // //   legendTitle: string;
// // // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // // const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
// // // // // // // // // // // // // // // // //   const mapRef = useRef<L.Map | null>(null);
// // // // // // // // // // // // // // // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // // // // // // // // // // // // // // //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// // // // // // // // // // // // // // // // //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// // // // // // // // // // // // // // // // //   const [isLoading, setIsLoading] = useState(true);
// // // // // // // // // // // // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // // // // // // // // // // // //   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
// // // // // // // // // // // // // // // // //   const [marker, setMarker] = useState<L.LatLng | null>(null);
// // // // // // // // // // // // // // // // //   const [isSplitView, setIsSplitView] = useState(false);

// // // // // // // // // // // // // // // // //   const updateMarker = (latlng: L.LatLng) => {
// // // // // // // // // // // // // // // // //     setMarker(latlng);
// // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // //   const fetchData = async (url: string, date?: string) => {
// // // // // // // // // // // // // // // // //     setIsLoading(true);
// // // // // // // // // // // // // // // // //     setError(null);
// // // // // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // // // // //       const body = date ? JSON.stringify(dataType === "aod" || dataType === "pm25-est" ? { tanggal: date } : { date }) : undefined;
// // // // // // // // // // // // // // // // //       const response = await fetch(url, {
// // // // // // // // // // // // // // // // //         method: date ? "POST" : "GET",
// // // // // // // // // // // // // // // // //         headers: date ? { "Content-Type": "application/json" } : undefined,
// // // // // // // // // // // // // // // // //         body,
// // // // // // // // // // // // // // // // //         cache: "no-store",
// // // // // // // // // // // // // // // // //       });
// // // // // // // // // // // // // // // // //       if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);
// // // // // // // // // // // // // // // // //       const rawText = await response.text();
// // // // // // // // // // // // // // // // //       const cleanText = rawText.replace(/NaN/g, "null");
// // // // // // // // // // // // // // // // //       const data = JSON.parse(cleanText);
// // // // // // // // // // // // // // // // //       if (data.error) throw new Error(data.error || "Gagal memuat data");
// // // // // // // // // // // // // // // // //       return data;
// // // // // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // // // // //       throw new Error(err instanceof Error ? (err.message.includes("Tidak ada data") ? "Data pada tanggal ini tidak tersedia" : err.message) : "Terjadi kesalahan saat memuat data");
// // // // // // // // // // // // // // // // //     } finally {
// // // // // // // // // // // // // // // // //       setIsLoading(false);
// // // // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // // // //     const loadData = async () => {
// // // // // // // // // // // // // // // // //       try {
// // // // // // // // // // // // // // // // //         const [data, boundary] = await Promise.all([fetchData(fetchUrl), fetch("/data/batas_kelurahan_jakarta.geojson", { cache: "no-store" })]);
// // // // // // // // // // // // // // // // //         if (!boundary.ok) throw new Error(`Failed to fetch boundary data: ${boundary.status}`);
// // // // // // // // // // // // // // // // //         const boundaryData = await boundary.json();
// // // // // // // // // // // // // // // // //         setGeoData(data);
// // // // // // // // // // // // // // // // //         setBoundaryData(boundaryData);
// // // // // // // // // // // // // // // // //       } catch (err) {
// // // // // // // // // // // // // // // // //         console.error("Error in loadData:", err);
// // // // // // // // // // // // // // // // //         setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // // // // // // //       }
// // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // //     loadData();
// // // // // // // // // // // // // // // // //   }, [fetchUrl]);

// // // // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // // // //     if (!mapRef.current) return;
// // // // // // // // // // // // // // // // //     mapRef.current.invalidateSize();
// // // // // // // // // // // // // // // // //   }, [isSplitView]);

// // // // // // // // // // // // // // // // //   const handleDateChange = async (date: string) => {
// // // // // // // // // // // // // // // // //     setSelectedDate(date);
// // // // // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // // // // //       const data = await fetchData(fetchByDateUrl, date);
// // // // // // // // // // // // // // // // //       setGeoData(data);
// // // // // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // // // // //       setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // //   const handleMapReady = (event: LeafletEvent) => {
// // // // // // // // // // // // // // // // //     mapRef.current = event.target as L.Map;
// // // // // // // // // // // // // // // // //     mapRef.current.invalidateSize();
// // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // //   return (
// // // // // // // // // // // // // // // // //     <div className="relative min-h-screen w-full flex flex-col">
// // // // // // // // // // // // // // // // //       <div className="absolute top-4 left-4 z-[1000]">
// // // // // // // // // // // // // // // // //         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// // // // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // // // //       {error && (
// // // // // // // // // // // // // // // // //         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
// // // // // // // // // // // // // // // // //           <span>{error}</span>
// // // // // // // // // // // // // // // // //           <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
// // // // // // // // // // // // // // // // //             Coba Lagi
// // // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // // //           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
// // // // // // // // // // // // // // // // //             Tutup
// // // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // //       )}
// // // // // // // // // // // // // // // // //       <div className={`flex flex-col md:flex-row h-full ${isSplitView ? "md:flex-row" : ""}`}>
// // // // // // // // // // // // // // // // //         <div className={`${isSplitView ? "w-full md:w-1/2" : "w-full"} h-full relative`}>
// // // // // // // // // // // // // // // // //           <MapContainer
// // // // // // // // // // // // // // // // //             center={[-6.1754, 106.8272]}
// // // // // // // // // // // // // // // // //             zoom={12}
// // // // // // // // // // // // // // // // //             minZoom={12}
// // // // // // // // // // // // // // // // //             maxZoom={16}
// // // // // // // // // // // // // // // // //             maxBounds={[
// // // // // // // // // // // // // // // // //               [-6.45, 106.55],
// // // // // // // // // // // // // // // // //               [-5.9, 107.15],
// // // // // // // // // // // // // // // // //             ]}
// // // // // // // // // // // // // // // // //             maxBoundsViscosity={1}
// // // // // // // // // // // // // // // // //             className="h-full w-full"
// // // // // // // // // // // // // // // // //             zoomControl={false}
// // // // // // // // // // // // // // // // //             ref={mapRef}
// // // // // // // // // // // // // // // // //             whenReady={handleMapReady}
// // // // // // // // // // // // // // // // //           >
// // // // // // // // // // // // // // // // //             <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
// // // // // // // // // // // // // // // // //             <GenericHeatMapLayer dataType={dataType} geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} setSelectedDate={handleDateChange} isLoading={isLoading} legendTitle={legendTitle} inputRef={inputRef} />
// // // // // // // // // // // // // // // // //             {marker && (
// // // // // // // // // // // // // // // // //               <Marker position={marker}>
// // // // // // // // // // // // // // // // //                 <Popup>Lokasi Terpilih</Popup>
// // // // // // // // // // // // // // // // //               </Marker>
// // // // // // // // // // // // // // // // //             )}
// // // // // // // // // // // // // // // // //           </MapContainer>
// // // // // // // // // // // // // // // // //           <button onClick={() => setIsSplitView(!isSplitView)} className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700" title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}>
// // // // // // // // // // // // // // // // //             {isSplitView ? "✕" : "📅"}
// // // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // //         {isSplitView && (
// // // // // // // // // // // // // // // // //           <div className="w-full md:w-1/2 h-full overflow-auto">
// // // // // // // // // // // // // // // // //             <Calendar showRightPanel={false} isSplitView={true} />
// // // // // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // // // // //         )}
// // // // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // // // //     </div>
// // // // // // // // // // // // // // // // //   );
// // // // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // // // export default GenericMap;

// // // // // // // // // // // // // // // // "use client";

// // // // // // // // // // // // // // // // import React, { useState, useEffect, useRef } from "react";
// // // // // // // // // // // // // // // // import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// // // // // // // // // // // // // // // // import L, { LatLngBoundsExpression, LeafletEvent } from "leaflet";
// // // // // // // // // // // // // // // // import "leaflet/dist/leaflet.css";
// // // // // // // // // // // // // // // // import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// // // // // // // // // // // // // // // // import SearchBar from "@/components/aod/SearchBar";
// // // // // // // // // // // // // // // // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
// // // // // // // // // // // // // // // // import dynamic from "next/dynamic";

// // // // // // // // // // // // // // // // const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
// // // // // // // // // // // // // // // //   ssr: false,
// // // // // // // // // // // // // // // //   loading: () => <div className="h-full w-full flex items-center justify-center">Memuat kalender...</div>,
// // // // // // // // // // // // // // // // });

// // // // // // // // // // // // // // // // interface GenericMapProps {
// // // // // // // // // // // // // // // //   dataType: "aod" | "pm25-est";
// // // // // // // // // // // // // // // //   fetchUrl: string;
// // // // // // // // // // // // // // // //   fetchByDateUrl: string;
// // // // // // // // // // // // // // // //   legendTitle: string;
// // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
// // // // // // // // // // // // // // // //   const mapRef = useRef<L.Map | null>(null);
// // // // // // // // // // // // // // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // // // // // // // // // // // // // //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// // // // // // // // // // // // // // // //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// // // // // // // // // // // // // // // //   const [isLoading, setIsLoading] = useState(true);
// // // // // // // // // // // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // // // // // // // // // // //   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
// // // // // // // // // // // // // // // //   const [marker, setMarker] = useState<L.LatLng | null>(null);
// // // // // // // // // // // // // // // //   const [isSplitView, setIsSplitView] = useState(false);

// // // // // // // // // // // // // // // //   const updateMarker = (latlng: L.LatLng) => {
// // // // // // // // // // // // // // // //     setMarker(latlng);
// // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // //   const fetchData = async (url: string, date?: string) => {
// // // // // // // // // // // // // // // //     setIsLoading(true);
// // // // // // // // // // // // // // // //     setError(null);
// // // // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // // // //       const body = date ? JSON.stringify({ tanggal: date }) : undefined; // Selalu gunakan { tanggal } untuk aod dan pm25-est
// // // // // // // // // // // // // // // //       console.log(`Fetching ${dataType} data from ${url}${date ? ` with tanggal: ${date}` : ""}`);
// // // // // // // // // // // // // // // //       const response = await fetch(url, {
// // // // // // // // // // // // // // // //         method: date ? "POST" : "GET",
// // // // // // // // // // // // // // // //         headers: date ? { "Content-Type": "application/json" } : undefined,
// // // // // // // // // // // // // // // //         body,
// // // // // // // // // // // // // // // //         cache: "no-store",
// // // // // // // // // // // // // // // //       });
// // // // // // // // // // // // // // // //       if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);
// // // // // // // // // // // // // // // //       const rawText = await response.text();
// // // // // // // // // // // // // // // //       const cleanText = rawText.replace(/NaN/g, "null");
// // // // // // // // // // // // // // // //       const data = JSON.parse(cleanText);
// // // // // // // // // // // // // // // //       if (data.error) throw new Error(data.error || "Gagal memuat data");
// // // // // // // // // // // // // // // //       console.log(`Fetched ${dataType} data sample:`, JSON.stringify(data).slice(0, 300));
// // // // // // // // // // // // // // // //       return data;
// // // // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // // // //       throw new Error(err instanceof Error ? (err.message.includes("Tidak ada data") ? "Data pada tanggal ini tidak tersedia" : err.message) : "Terjadi kesalahan saat memuat data");
// // // // // // // // // // // // // // // //     } finally {
// // // // // // // // // // // // // // // //       setIsLoading(false);
// // // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // // //     const loadData = async () => {
// // // // // // // // // // // // // // // //       try {
// // // // // // // // // // // // // // // //         const [data, boundary] = await Promise.all([fetchData(fetchUrl), fetch("/data/batas_kelurahan_jakarta.geojson", { cache: "no-store" })]);
// // // // // // // // // // // // // // // //         if (!boundary.ok) throw new Error(`Failed to fetch boundary data: ${boundary.status}`);
// // // // // // // // // // // // // // // //         const boundaryData = await boundary.json();
// // // // // // // // // // // // // // // //         setGeoData(data);
// // // // // // // // // // // // // // // //         setBoundaryData(boundaryData);
// // // // // // // // // // // // // // // //       } catch (err) {
// // // // // // // // // // // // // // // //         console.error(`Error in loadData (${dataType}):`, err);
// // // // // // // // // // // // // // // //         setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // // // // // //       }
// // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // //     loadData();
// // // // // // // // // // // // // // // //   }, [fetchUrl, dataType]);

// // // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // // //     if (!mapRef.current) return;
// // // // // // // // // // // // // // // //     mapRef.current.invalidateSize();
// // // // // // // // // // // // // // // //   }, [isSplitView]);

// // // // // // // // // // // // // // // //   const handleDateChange = async (date: string) => {
// // // // // // // // // // // // // // // //     setSelectedDate(date);
// // // // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // // // //       const data = await fetchData(fetchByDateUrl, date);
// // // // // // // // // // // // // // // //       setGeoData(data);
// // // // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // // // //       setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // //   const handleMapReady = (event: LeafletEvent) => {
// // // // // // // // // // // // // // // //     mapRef.current = event.target as L.Map;
// // // // // // // // // // // // // // // //     mapRef.current.invalidateSize();
// // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // //   return (
// // // // // // // // // // // // // // // //     <div className="relative min-h-screen w-full flex flex-col">
// // // // // // // // // // // // // // // //       <div className="absolute top-4 left-4 z-[1000]">
// // // // // // // // // // // // // // // //         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// // // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // // //       {error && (
// // // // // // // // // // // // // // // //         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
// // // // // // // // // // // // // // // //           <span>{error}</span>
// // // // // // // // // // // // // // // //           <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
// // // // // // // // // // // // // // // //             Coba Lagi
// // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // //           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
// // // // // // // // // // // // // // // //             Tutup
// // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // //       )}
// // // // // // // // // // // // // // // //       <div className={`flex flex-col md:flex-row h-full ${isSplitView ? "md:flex-row" : ""}`}>
// // // // // // // // // // // // // // // //         <div className={`${isSplitView ? "w-full md:w-1/2" : "w-full"} h-full relative`}>
// // // // // // // // // // // // // // // //           <MapContainer
// // // // // // // // // // // // // // // //             center={[-6.1754, 106.8272]}
// // // // // // // // // // // // // // // //             zoom={12}
// // // // // // // // // // // // // // // //             minZoom={12}
// // // // // // // // // // // // // // // //             maxZoom={16}
// // // // // // // // // // // // // // // //             maxBounds={[
// // // // // // // // // // // // // // // //               [-6.45, 106.55],
// // // // // // // // // // // // // // // //               [-5.9, 107.15],
// // // // // // // // // // // // // // // //             ]}
// // // // // // // // // // // // // // // //             maxBoundsViscosity={1}
// // // // // // // // // // // // // // // //             className="h-full w-full"
// // // // // // // // // // // // // // // //             zoomControl={false}
// // // // // // // // // // // // // // // //             ref={mapRef}
// // // // // // // // // // // // // // // //             whenReady={handleMapReady}
// // // // // // // // // // // // // // // //           >
// // // // // // // // // // // // // // // //             <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
// // // // // // // // // // // // // // // //             <GenericHeatMapLayer dataType={dataType} geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} setSelectedDate={handleDateChange} isLoading={isLoading} legendTitle={legendTitle} inputRef={inputRef} />
// // // // // // // // // // // // // // // //             {marker && (
// // // // // // // // // // // // // // // //               <Marker position={marker}>
// // // // // // // // // // // // // // // //                 <Popup>Lokasi Terpilih</Popup>
// // // // // // // // // // // // // // // //               </Marker>
// // // // // // // // // // // // // // // //             )}
// // // // // // // // // // // // // // // //           </MapContainer>
// // // // // // // // // // // // // // // //           <button onClick={() => setIsSplitView(!isSplitView)} className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700" title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}>
// // // // // // // // // // // // // // // //             {isSplitView ? "✕" : "📅"}
// // // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // //         {isSplitView && (
// // // // // // // // // // // // // // // //           <div className="w-full md:w-1/2 h-full overflow-auto">
// // // // // // // // // // // // // // // //             <Calendar showRightPanel={false} isSplitView={true} />
// // // // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // // // //         )}
// // // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // // //     </div>
// // // // // // // // // // // // // // // //   );
// // // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // // export default GenericMap;

// // // // // // // // // // // // // // // "use client";

// // // // // // // // // // // // // // // import React, { useState, useEffect, useRef } from "react";
// // // // // // // // // // // // // // // import dynamic from "next/dynamic";
// // // // // // // // // // // // // // // import L, { LatLngBoundsExpression, LeafletEvent } from "leaflet";
// // // // // // // // // // // // // // // import "leaflet/dist/leaflet.css";
// // // // // // // // // // // // // // // import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// // // // // // // // // // // // // // // import SearchBar from "@/components/aod/SearchBar";
// // // // // // // // // // // // // // // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";

// // // // // // // // // // // // // // // const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
// // // // // // // // // // // // // // // const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
// // // // // // // // // // // // // // // const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
// // // // // // // // // // // // // // // const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

// // // // // // // // // // // // // // // const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
// // // // // // // // // // // // // // //   ssr: false,
// // // // // // // // // // // // // // //   loading: () => <div className="h-full w-full flex items-center justify-center">Memuat kalender...</div>,
// // // // // // // // // // // // // // // });

// // // // // // // // // // // // // // // interface GenericMapProps {
// // // // // // // // // // // // // // //   dataType: "aod" | "pm25-est";
// // // // // // // // // // // // // // //   fetchUrl: string;
// // // // // // // // // // // // // // //   fetchByDateUrl: string;
// // // // // // // // // // // // // // //   legendTitle: string;
// // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
// // // // // // // // // // // // // // //   const mapRef = useRef<L.Map | null>(null);
// // // // // // // // // // // // // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // // // // // // // // // // // // //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// // // // // // // // // // // // // // //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// // // // // // // // // // // // // // //   const [isLoading, setIsLoading] = useState(true);
// // // // // // // // // // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // // // // // // // // // //   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
// // // // // // // // // // // // // // //   const [marker, setMarker] = useState<L.LatLng | null>(null);
// // // // // // // // // // // // // // //   const [isSplitView, setIsSplitView] = useState(false);

// // // // // // // // // // // // // // //   const updateMarker = (latlng: L.LatLng) => {
// // // // // // // // // // // // // // //     setMarker(latlng);
// // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // //   const fetchData = async (url: string, date?: string) => {
// // // // // // // // // // // // // // //     setIsLoading(true);
// // // // // // // // // // // // // // //     setError(null);
// // // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // // //       const body = date ? JSON.stringify({ tanggal: date }) : undefined;
// // // // // // // // // // // // // // //       console.log(`Fetching ${dataType} data from ${url}${date ? ` with tanggal: ${date}` : ""}`);
// // // // // // // // // // // // // // //       const response = await fetch(url, {
// // // // // // // // // // // // // // //         method: date ? "POST" : "GET",
// // // // // // // // // // // // // // //         headers: date ? { "Content-Type": "application/json" } : undefined,
// // // // // // // // // // // // // // //         body,
// // // // // // // // // // // // // // //         cache: "no-store",
// // // // // // // // // // // // // // //       });
// // // // // // // // // // // // // // //       if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);
// // // // // // // // // // // // // // //       const rawText = await response.text();
// // // // // // // // // // // // // // //       const cleanText = rawText.replace(/NaN/g, "null");
// // // // // // // // // // // // // // //       const data = JSON.parse(cleanText);
// // // // // // // // // // // // // // //       if (data.error) throw new Error(data.error || "Gagal memuat data");
// // // // // // // // // // // // // // //       console.log(`Fetched ${dataType} data:`, JSON.stringify(data).slice(0, 300));
// // // // // // // // // // // // // // //       return data;
// // // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // // //       console.error(`Error fetching ${dataType} data:`, err);
// // // // // // // // // // // // // // //       throw new Error(err instanceof Error ? (err.message.includes("Tidak ada data") ? "Data pada tanggal ini tidak tersedia" : err.message) : "Terjadi kesalahan saat memuat data");
// // // // // // // // // // // // // // //     } finally {
// // // // // // // // // // // // // // //       setIsLoading(false);
// // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // //     const loadData = async () => {
// // // // // // // // // // // // // // //       try {
// // // // // // // // // // // // // // //         const [data, boundary] = await Promise.all([fetchData(fetchUrl), fetch("/data/batas_kelurahan_jakarta.geojson", { cache: "no-store" })]);
// // // // // // // // // // // // // // //         if (!boundary.ok) throw new Error(`Failed to fetch boundary data: ${boundary.status}`);
// // // // // // // // // // // // // // //         const boundaryData = await boundary.json();
// // // // // // // // // // // // // // //         console.log("Boundary data:", JSON.stringify(boundaryData).slice(0, 300));
// // // // // // // // // // // // // // //         setGeoData(data);
// // // // // // // // // // // // // // //         setBoundaryData(boundaryData);
// // // // // // // // // // // // // // //       } catch (err) {
// // // // // // // // // // // // // // //         console.error(`Error in loadData (${dataType}):`, err);
// // // // // // // // // // // // // // //         setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // // // // //       }
// // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // //     loadData();
// // // // // // // // // // // // // // //   }, [fetchUrl, dataType]);

// // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // //     if (mapRef.current) {
// // // // // // // // // // // // // // //       setTimeout(() => mapRef.current?.invalidateSize(), 100);
// // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // //   }, [isSplitView]);

// // // // // // // // // // // // // // //   const handleDateChange = async (date: string) => {
// // // // // // // // // // // // // // //     setSelectedDate(date);
// // // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // // //       const data = await fetchData(fetchByDateUrl, date);
// // // // // // // // // // // // // // //       setGeoData(data);
// // // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // // //       setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // //   const handleMapReady = (event: LeafletEvent) => {
// // // // // // // // // // // // // // //     mapRef.current = event.target as L.Map;
// // // // // // // // // // // // // // //     mapRef.current.invalidateSize();
// // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // //   return (
// // // // // // // // // // // // // // //     <div className="relative min-h-screen w-full flex flex-col">
// // // // // // // // // // // // // // //       <div className="absolute top-4 left-4 z-[1000]">
// // // // // // // // // // // // // // //         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // //       {error && (
// // // // // // // // // // // // // // //         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
// // // // // // // // // // // // // // //           <span>{error}</span>
// // // // // // // // // // // // // // //           <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
// // // // // // // // // // // // // // //             Coba Lagi
// // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // //           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
// // // // // // // // // // // // // // //             Tutup
// // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // //       )}
// // // // // // // // // // // // // // //       <div className={`flex flex-col md:flex-row h-screen ${isSplitView ? "md:flex-row" : ""}`}>
// // // // // // // // // // // // // // //         <div className={`${isSplitView ? "w-full md:w-1/2" : "w-full"} h-full relative`}>
// // // // // // // // // // // // // // //           <MapContainer
// // // // // // // // // // // // // // //             center={[-6.1754, 106.8272]}
// // // // // // // // // // // // // // //             zoom={12}
// // // // // // // // // // // // // // //             minZoom={12}
// // // // // // // // // // // // // // //             maxZoom={16}
// // // // // // // // // // // // // // //             maxBounds={[
// // // // // // // // // // // // // // //               [-6.45, 106.55],
// // // // // // // // // // // // // // //               [-5.9, 107.15],
// // // // // // // // // // // // // // //             ]}
// // // // // // // // // // // // // // //             maxBoundsViscosity={1}
// // // // // // // // // // // // // // //             className="h-full w-full"
// // // // // // // // // // // // // // //             style={{ height: "100%", width: "100%" }}
// // // // // // // // // // // // // // //             zoomControl={false}
// // // // // // // // // // // // // // //             ref={mapRef}
// // // // // // // // // // // // // // //             whenReady={handleMapReady}
// // // // // // // // // // // // // // //           >
// // // // // // // // // // // // // // //             <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
// // // // // // // // // // // // // // //             <GenericHeatMapLayer dataType={dataType} geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} setSelectedDate={handleDateChange} isLoading={isLoading} legendTitle={legendTitle} inputRef={inputRef} />
// // // // // // // // // // // // // // //             {marker && (
// // // // // // // // // // // // // // //               <Marker position={marker}>
// // // // // // // // // // // // // // //                 <Popup>Lokasi Terpilih</Popup>
// // // // // // // // // // // // // // //               </Marker>
// // // // // // // // // // // // // // //             )}
// // // // // // // // // // // // // // //           </MapContainer>
// // // // // // // // // // // // // // //           <button onClick={() => setIsSplitView(!isSplitView)} className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700" title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}>
// // // // // // // // // // // // // // //             {isSplitView ? "✕" : "📅"}
// // // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // //         {isSplitView && (
// // // // // // // // // // // // // // //           <div className="w-full md:w-1/2 h-full overflow-auto">
// // // // // // // // // // // // // // //             <Calendar showRightPanel={false} isSplitView={true} />
// // // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // // //         )}
// // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // //     </div>
// // // // // // // // // // // // // // //   );
// // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // export default GenericMap;

// // // // // // // // // // // // // // "use client";

// // // // // // // // // // // // // // import React, { useState, useEffect, useRef } from "react";
// // // // // // // // // // // // // // import dynamic from "next/dynamic";
// // // // // // // // // // // // // // import L, { LatLngBoundsExpression, LeafletEvent } from "leaflet";
// // // // // // // // // // // // // // import "leaflet/dist/leaflet.css";
// // // // // // // // // // // // // // import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// // // // // // // // // // // // // // import SearchBar from "@/components/aod/SearchBar";
// // // // // // // // // // // // // // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";

// // // // // // // // // // // // // // const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
// // // // // // // // // // // // // // const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
// // // // // // // // // // // // // // const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
// // // // // // // // // // // // // // const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
// // // // // // // // // // // // // // const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });

// // // // // // // // // // // // // // const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
// // // // // // // // // // // // // //   ssr: false,
// // // // // // // // // // // // // //   loading: () => <div className="h-full w-full flex items-center justify-center">Memuat kalender...</div>,
// // // // // // // // // // // // // // });

// // // // // // // // // // // // // // interface GenericMapProps {
// // // // // // // // // // // // // //   dataType: "aod" | "pm25-est";
// // // // // // // // // // // // // //   fetchUrl: string;
// // // // // // // // // // // // // //   fetchByDateUrl: string;
// // // // // // // // // // // // // //   legendTitle: string;
// // // // // // // // // // // // // // }

// // // // // // // // // // // // // // const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
// // // // // // // // // // // // // //   const mapRef = useRef<L.Map | null>(null);
// // // // // // // // // // // // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // // // // // // // // // // // //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// // // // // // // // // // // // // //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// // // // // // // // // // // // // //   const [isLoading, setIsLoading] = useState(true);
// // // // // // // // // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // // // // // // // // //   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
// // // // // // // // // // // // // //   const [marker, setMarker] = useState<L.LatLng | null>(null);
// // // // // // // // // // // // // //   const [isSplitView, setIsSplitView] = useState(false);

// // // // // // // // // // // // // //   const updateMarker = (latlng: L.LatLng) => {
// // // // // // // // // // // // // //     setMarker(latlng);
// // // // // // // // // // // // // //   };

// // // // // // // // // // // // // //   const fetchData = async (url: string, date?: string) => {
// // // // // // // // // // // // // //     setIsLoading(true);
// // // // // // // // // // // // // //     setError(null);
// // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // //       const body = date ? JSON.stringify({ tanggal: date }) : undefined;
// // // // // // // // // // // // // //       console.log(`Fetching ${dataType} data from ${url}${date ? ` with tanggal: ${date}` : ""}`);
// // // // // // // // // // // // // //       const response = await fetch(url, {
// // // // // // // // // // // // // //         method: date ? "POST" : "GET",
// // // // // // // // // // // // // //         headers: date ? { "Content-Type": "application/json" } : undefined,
// // // // // // // // // // // // // //         body,
// // // // // // // // // // // // // //         cache: "no-store",
// // // // // // // // // // // // // //       });
// // // // // // // // // // // // // //       if (!response.ok) throw new Error(`Failed to fetch ${dataType} data: ${response.status}`);
// // // // // // // // // // // // // //       const rawText = await response.text();
// // // // // // // // // // // // // //       const cleanText = rawText.replace(/NaN/g, "null");
// // // // // // // // // // // // // //       const data = JSON.parse(cleanText);
// // // // // // // // // // // // // //       if (data.error) throw new Error(data.error || `Gagal memuat data ${dataType}`);
// // // // // // // // // // // // // //       console.log(`Fetched ${dataType} data:`, JSON.stringify(data).slice(0, 300));
// // // // // // // // // // // // // //       return data;
// // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // //       console.error(`Error fetching ${dataType} data:`, err);
// // // // // // // // // // // // // //       throw new Error(err instanceof Error ? (err.message.includes("Tidak ada data") ? `Data ${dataType} pada tanggal ini tidak tersedia` : err.message) : "Terjadi kesalahan saat memuat data");
// // // // // // // // // // // // // //     } finally {
// // // // // // // // // // // // // //       setIsLoading(false);
// // // // // // // // // // // // // //     }
// // // // // // // // // // // // // //   };

// // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // //     const loadData = async () => {
// // // // // // // // // // // // // //       try {
// // // // // // // // // // // // // //         const [data, boundary] = await Promise.all([
// // // // // // // // // // // // // //           fetchData(fetchUrl),
// // // // // // // // // // // // // //           fetch("/data/batas_kelurahan_jakarta.geojson", { cache: "no-store" }),
// // // // // // // // // // // // // //         ]);
// // // // // // // // // // // // // //         if (!boundary.ok) throw new Error(`Failed to fetch boundary data: ${boundary.status}`);
// // // // // // // // // // // // // //         const boundaryData = await boundary.json();
// // // // // // // // // // // // // //         console.log("Boundary data:", JSON.stringify(boundaryData).slice(0, 300));
// // // // // // // // // // // // // //         console.log("Boundary features count:", boundaryData?.features?.length || 0);
// // // // // // // // // // // // // //         setGeoData(data);
// // // // // // // // // // // // // //         setBoundaryData(boundaryData);
// // // // // // // // // // // // // //       } catch (err) {
// // // // // // // // // // // // // //         console.error(`Error in loadData (${dataType}):`, err);
// // // // // // // // // // // // // //         setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // // // //       }
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     loadData();
// // // // // // // // // // // // // //   }, [fetchUrl, dataType]);

// // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // //     if (mapRef.current) {
// // // // // // // // // // // // // //       setTimeout(() => mapRef.current?.invalidateSize(), 100);
// // // // // // // // // // // // // //     }
// // // // // // // // // // // // // //   }, [isSplitView]);

// // // // // // // // // // // // // //   const handleDateChange = async (date: string) => {
// // // // // // // // // // // // // //     setSelectedDate(date);
// // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // //       const data = await fetchData(fetchByDateUrl, date);
// // // // // // // // // // // // // //       setGeoData(data);
// // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // //       setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // // // //     }
// // // // // // // // // // // // // //   };

// // // // // // // // // // // // // //   const handleMapReady = (event: LeafletEvent) => {
// // // // // // // // // // // // // //     mapRef.current = event.target as L.Map;
// // // // // // // // // // // // // //     mapRef.current.invalidateSize();
// // // // // // // // // // // // // //   };

// // // // // // // // // // // // // //   const styleBoundary = () => ({
// // // // // // // // // // // // // //     weight: 2, // Lebih tebal untuk visibilitas
// // // // // // // // // // // // // //     opacity: 1,
// // // // // // // // // // // // // //     color: "#1a4971", // Warna lebih kontras
// // // // // // // // // // // // // //     fillOpacity: 0.05, // Sedikit fill untuk visibilitas
// // // // // // // // // // // // // //   });

// // // // // // // // // // // // // //   return (
// // // // // // // // // // // // // //     <div className="relative min-h-screen w-full flex flex-col">
// // // // // // // // // // // // // //       <div className="absolute top-4 left-4 z-[1000]">
// // // // // // // // // // // // // //         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // //       {error && (
// // // // // // // // // // // // // //         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
// // // // // // // // // // // // // //           <span>{error}</span>
// // // // // // // // // // // // // //           <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
// // // // // // // // // // // // // //             Coba Lagi
// // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // //           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
// // // // // // // // // // // // // //             Tutup
// // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // //       )}
// // // // // // // // // // // // // //       <div className={`flex flex-col md:flex-row h-screen ${isSplitView ? "md:flex-row" : ""}`}>
// // // // // // // // // // // // // //         <div className={`${isSplitView ? "w-full md:w-1/2" : "w-full"} h-full relative`}>
// // // // // // // // // // // // // //           <MapContainer
// // // // // // // // // // // // // //             center={[-6.1754, 106.8272]}
// // // // // // // // // // // // // //             zoom={12}
// // // // // // // // // // // // // //             minZoom={12}
// // // // // // // // // // // // // //             maxZoom={16}
// // // // // // // // // // // // // //             maxBounds={[
// // // // // // // // // // // // // //               [-6.45, 106.55],
// // // // // // // // // // // // // //               [-5.9, 107.15],
// // // // // // // // // // // // // //             ]}
// // // // // // // // // // // // // //             maxBoundsViscosity={1}
// // // // // // // // // // // // // //             className="h-full w-full"
// // // // // // // // // // // // // //             style={{ height: "100%", width: "100%" }}
// // // // // // // // // // // // // //             zoomControl={false}
// // // // // // // // // // // // // //             ref={mapRef}
// // // // // // // // // // // // // //             whenReady={handleMapReady}
// // // // // // // // // // // // // //           >
// // // // // // // // // // // // // //             <TileLayer
// // // // // // // // // // // // // //               url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
// // // // // // // // // // // // // //               attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
// // // // // // // // // // // // // //             />
// // // // // // // // // // // // // //             {boundaryData && (
// // // // // // // // // // // // // //               <GeoJSON
// // // // // // // // // // // // // //                 data={boundaryData}
// // // // // // // // // // // // // //                 style={styleBoundary}
// // // // // // // // // // // // // //                 onEachFeature={(feature, layer) => {
// // // // // // // // // // // // // //                   layer.on({
// // // // // // // // // // // // // //                     mouseover: (e) => {
// // // // // // // // // // // // // //                       const layer = e.target;
// // // // // // // // // // // // // //                       layer.setStyle({
// // // // // // // // // // // // // //                         weight: 3,
// // // // // // // // // // // // // //                         color: "#1a4971",
// // // // // // // // // // // // // //                         fillOpacity: 0.1,
// // // // // // // // // // // // // //                       });
// // // // // // // // // // // // // //                       layer.bringToFront();
// // // // // // // // // // // // // //                     },
// // // // // // // // // // // // // //                     mouseout: (e) => {
// // // // // // // // // // // // // //                       const layer = e.target;
// // // // // // // // // // // // // //                       layer.setStyle(styleBoundary());
// // // // // // // // // // // // // //                     },
// // // // // // // // // // // // // //                   });
// // // // // // // // // // // // // //                 }}
// // // // // // // // // // // // // //               />
// // // // // // // // // // // // // //             )}
// // // // // // // // // // // // // //             <GenericHeatMapLayer
// // // // // // // // // // // // // //               dataType={dataType}
// // // // // // // // // // // // // //               geoData={geoData}
// // // // // // // // // // // // // //               boundaryData={boundaryData}
// // // // // // // // // // // // // //               selectedDate={selectedDate}
// // // // // // // // // // // // // //               setSelectedDate={handleDateChange}
// // // // // // // // // // // // // //               isLoading={isLoading}
// // // // // // // // // // // // // //               legendTitle={legendTitle}
// // // // // // // // // // // // // //               inputRef={inputRef}
// // // // // // // // // // // // // //             />
// // // // // // // // // // // // // //             {marker && (
// // // // // // // // // // // // // //               <Marker position={marker}>
// // // // // // // // // // // // // //                 <Popup>Lokasi Terpilih</Popup>
// // // // // // // // // // // // // //               </Marker>
// // // // // // // // // // // // // //             )}
// // // // // // // // // // // // // //           </MapContainer>
// // // // // // // // // // // // // //           <button
// // // // // // // // // // // // // //             onClick={() => setIsSplitView(!isSplitView)}
// // // // // // // // // // // // // //             className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
// // // // // // // // // // // // // //             title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}
// // // // // // // // // // // // // //           >
// // // // // // // // // // // // // //             {isSplitView ? "✕" : "📅"}
// // // // // // // // // // // // // //           </button>
// // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // //         {isSplitView && (
// // // // // // // // // // // // // //           <div className="w-full md:w-1/2 h-full overflow-auto">
// // // // // // // // // // // // // //             <Calendar showRightPanel={false} isSplitView={true} />
// // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // //         )}
// // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // //     </div>
// // // // // // // // // // // // // //   );
// // // // // // // // // // // // // // };

// // // // // // // // // // // // // // export default GenericMap;

// // // // // // // // // // // // // "use client";

// // // // // // // // // // // // // import React, { useState, useEffect, useRef } from "react";
// // // // // // // // // // // // // import dynamic from "next/dynamic";
// // // // // // // // // // // // // import L, { LatLngBoundsExpression, LeafletEvent } from "leaflet";
// // // // // // // // // // // // // import "leaflet/dist/leaflet.css";
// // // // // // // // // // // // // import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// // // // // // // // // // // // // import SearchBar from "@/components/aod/SearchBar";
// // // // // // // // // // // // // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
// // // // // // // // // // // // // import styles from "@/styles/searchbar.module.css"; // Tambahkan file CSS baru

// // // // // // // // // // // // // const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
// // // // // // // // // // // // // const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
// // // // // // // // // // // // // const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
// // // // // // // // // // // // // const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
// // // // // // // // // // // // // const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });

// // // // // // // // // // // // // const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
// // // // // // // // // // // // //   ssr: false,
// // // // // // // // // // // // //   loading: () => <div className="h-full w-full flex items-center justify-center">Memuat kalender...</div>,
// // // // // // // // // // // // // });

// // // // // // // // // // // // // interface GenericMapProps {
// // // // // // // // // // // // //   dataType: "aod" | "pm25-est";
// // // // // // // // // // // // //   fetchUrl: string;
// // // // // // // // // // // // //   fetchByDateUrl: string;
// // // // // // // // // // // // //   legendTitle: string;
// // // // // // // // // // // // // }

// // // // // // // // // // // // // const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
// // // // // // // // // // // // //   const mapRef = useRef<L.Map | null>(null);
// // // // // // // // // // // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // // // // // // // // // // //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// // // // // // // // // // // // //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// // // // // // // // // // // // //   const [isLoading, setIsLoading] = useState(true);
// // // // // // // // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // // // // // // // //   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
// // // // // // // // // // // // //   const [marker, setMarker] = useState<L.LatLng | null>(null);
// // // // // // // // // // // // //   const [isSplitView, setIsSplitView] = useState(false);

// // // // // // // // // // // // //   const updateMarker = (latlng: L.LatLng) => {
// // // // // // // // // // // // //     setMarker(latlng);
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   const fetchData = async (url: string, date?: string) => {
// // // // // // // // // // // // //     setIsLoading(true);
// // // // // // // // // // // // //     setError(null);
// // // // // // // // // // // // //     try {
// // // // // // // // // // // // //       const body = date ? JSON.stringify({ tanggal: date }) : undefined;
// // // // // // // // // // // // //       console.log(`Fetching ${dataType} data from ${url}${date ? ` with tanggal: ${date}` : ""}`);
// // // // // // // // // // // // //       const response = await fetch(url, {
// // // // // // // // // // // // //         method: date ? "POST" : "GET",
// // // // // // // // // // // // //         headers: date ? { "Content-Type": "application/json" } : undefined,
// // // // // // // // // // // // //         body,
// // // // // // // // // // // // //         cache: "no-store",
// // // // // // // // // // // // //       });
// // // // // // // // // // // // //       if (!response.ok) throw new Error(`Failed to fetch ${dataType} data: ${response.status}`);
// // // // // // // // // // // // //       const rawText = await response.text();
// // // // // // // // // // // // //       const cleanText = rawText.replace(/NaN/g, "null");
// // // // // // // // // // // // //       const data = JSON.parse(cleanText);
// // // // // // // // // // // // //       if (data.error) throw new Error(data.error || `Gagal memuat data ${dataType}`);
// // // // // // // // // // // // //       console.log(`Fetched ${dataType} data:`, JSON.stringify(data).slice(0, 300));
// // // // // // // // // // // // //       return data;
// // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // //       console.error(`Error fetching ${dataType} data:`, err);
// // // // // // // // // // // // //       throw new Error(err instanceof Error ? (err.message.includes("Tidak ada data") ? `Data ${dataType} pada tanggal ini tidak tersedia` : err.message) : "Terjadi kesalahan saat memuat data");
// // // // // // // // // // // // //     } finally {
// // // // // // // // // // // // //       setIsLoading(false);
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // //     const loadData = async () => {
// // // // // // // // // // // // //       try {
// // // // // // // // // // // // //         const [data, boundary] = await Promise.all([fetchData(fetchUrl), fetch("/data/batas_kelurahan_jakarta.geojson", { cache: "no-store" })]);
// // // // // // // // // // // // //         if (!boundary.ok) throw new Error(`Failed to fetch boundary data: ${boundary.status}`);
// // // // // // // // // // // // //         const boundaryData = await boundary.json();
// // // // // // // // // // // // //         console.log("Boundary data:", JSON.stringify(boundaryData).slice(0, 300));
// // // // // // // // // // // // //         console.log("Boundary features count:", boundaryData?.features?.length || 0);
// // // // // // // // // // // // //         setGeoData(data);
// // // // // // // // // // // // //         setBoundaryData(boundaryData);
// // // // // // // // // // // // //       } catch (err) {
// // // // // // // // // // // // //         console.error(`Error in loadData (${dataType}):`, err);
// // // // // // // // // // // // //         setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // // //       }
// // // // // // // // // // // // //     };

// // // // // // // // // // // // //     loadData();
// // // // // // // // // // // // //   }, [fetchUrl, dataType]);

// // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // //     if (mapRef.current) {
// // // // // // // // // // // // //       setTimeout(() => mapRef.current?.invalidateSize(), 100);
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //   }, [isSplitView]);

// // // // // // // // // // // // //   const handleDateChange = async (date: string) => {
// // // // // // // // // // // // //     setSelectedDate(date);
// // // // // // // // // // // // //     try {
// // // // // // // // // // // // //       const data = await fetchData(fetchByDateUrl, date);
// // // // // // // // // // // // //       setGeoData(data);
// // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // //       setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   const handleMapReady = (event: LeafletEvent) => {
// // // // // // // // // // // // //     mapRef.current = event.target as L.Map;
// // // // // // // // // // // // //     mapRef.current.invalidateSize();
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   const styleBoundary = () => ({
// // // // // // // // // // // // //     weight: 2,
// // // // // // // // // // // // //     opacity: 1,
// // // // // // // // // // // // //     color: "#1a4971",
// // // // // // // // // // // // //     fillOpacity: 0.05,
// // // // // // // // // // // // //   });

// // // // // // // // // // // // //   return (
// // // // // // // // // // // // //     <div className="relative min-h-screen w-full flex flex-col">
// // // // // // // // // // // // //       <div className={styles.searchBarContainer}>
// // // // // // // // // // // // //         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// // // // // // // // // // // // //       </div>
// // // // // // // // // // // // //       {error && (
// // // // // // // // // // // // //         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
// // // // // // // // // // // // //           <span>{error}</span>
// // // // // // // // // // // // //           <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
// // // // // // // // // // // // //             Coba Lagi
// // // // // // // // // // // // //           </button>
// // // // // // // // // // // // //           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
// // // // // // // // // // // // //             Tutup
// // // // // // // // // // // // //           </button>
// // // // // // // // // // // // //         </div>
// // // // // // // // // // // // //       )}
// // // // // // // // // // // // //       <div className={`flex flex-col md:flex-row h-screen ${isSplitView ? "md:flex-row" : ""}`}>
// // // // // // // // // // // // //         <div className={`${isSplitView ? "w-full md:w-1/2" : "w-full"} h-full relative`}>
// // // // // // // // // // // // //           <MapContainer
// // // // // // // // // // // // //             center={[-6.1754, 106.8272]}
// // // // // // // // // // // // //             zoom={12}
// // // // // // // // // // // // //             minZoom={12}
// // // // // // // // // // // // //             maxZoom={16}
// // // // // // // // // // // // //             maxBounds={[
// // // // // // // // // // // // //               [-6.45, 106.55],
// // // // // // // // // // // // //               [-5.9, 107.15],
// // // // // // // // // // // // //             ]}
// // // // // // // // // // // // //             maxBoundsViscosity={1}
// // // // // // // // // // // // //             className="h-full w-full"
// // // // // // // // // // // // //             style={{ height: "100%", width: "100%" }}
// // // // // // // // // // // // //             zoomControl={false}
// // // // // // // // // // // // //             ref={mapRef}
// // // // // // // // // // // // //             whenReady={handleMapReady}
// // // // // // // // // // // // //           >
// // // // // // // // // // // // //             <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
// // // // // // // // // // // // //             {boundaryData && (
// // // // // // // // // // // // //               <GeoJSON
// // // // // // // // // // // // //                 data={boundaryData}
// // // // // // // // // // // // //                 style={styleBoundary}
// // // // // // // // // // // // //                 onEachFeature={(feature, layer) => {
// // // // // // // // // // // // //                   layer.on({
// // // // // // // // // // // // //                     mouseover: (e) => {
// // // // // // // // // // // // //                       const layer = e.target;
// // // // // // // // // // // // //                       layer.setStyle({
// // // // // // // // // // // // //                         weight: 3,
// // // // // // // // // // // // //                         color: "#1a4971",
// // // // // // // // // // // // //                         fillOpacity: 0.1,
// // // // // // // // // // // // //                       });
// // // // // // // // // // // // //                       layer.bringToFront();
// // // // // // // // // // // // //                     },
// // // // // // // // // // // // //                     mouseout: (e) => {
// // // // // // // // // // // // //                       const layer = e.target;
// // // // // // // // // // // // //                       layer.setStyle(styleBoundary());
// // // // // // // // // // // // //                     },
// // // // // // // // // // // // //                   });
// // // // // // // // // // // // //                 }}
// // // // // // // // // // // // //               />
// // // // // // // // // // // // //             )}
// // // // // // // // // // // // //             <GenericHeatMapLayer dataType={dataType} geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} setSelectedDate={handleDateChange} isLoading={isLoading} legendTitle={legendTitle} inputRef={inputRef} />
// // // // // // // // // // // // //             {marker && (
// // // // // // // // // // // // //               <Marker position={marker}>
// // // // // // // // // // // // //                 <Popup>Lokasi Terpilih</Popup>
// // // // // // // // // // // // //               </Marker>
// // // // // // // // // // // // //             )}
// // // // // // // // // // // // //           </MapContainer>
// // // // // // // // // // // // //           <button onClick={() => setIsSplitView(!isSplitView)} className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700" title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}>
// // // // // // // // // // // // //             {isSplitView ? "✕" : "📅"}
// // // // // // // // // // // // //           </button>
// // // // // // // // // // // // //         </div>
// // // // // // // // // // // // //         {isSplitView && (
// // // // // // // // // // // // //           <div className="w-full md:w-1/2 h-full overflow-auto">
// // // // // // // // // // // // //             <Calendar showRightPanel={false} isSplitView={true} />
// // // // // // // // // // // // //           </div>
// // // // // // // // // // // // //         )}
// // // // // // // // // // // // //       </div>
// // // // // // // // // // // // //     </div>
// // // // // // // // // // // // //   );
// // // // // // // // // // // // // };

// // // // // // // // // // // // // export default GenericMap;

// // // // // // // // // // // // "use client";

// // // // // // // // // // // // import React, { useState, useEffect, useRef } from "react";
// // // // // // // // // // // // import dynamic from "next/dynamic";
// // // // // // // // // // // // import L, { LatLngBoundsExpression } from "leaflet";
// // // // // // // // // // // // import "leaflet/dist/leaflet.css";
// // // // // // // // // // // // import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// // // // // // // // // // // // import SearchBar from "@/components/aod/SearchBar";
// // // // // // // // // // // // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
// // // // // // // // // // // // import styles from "@/styles/searchbar.module.css";

// // // // // // // // // // // // const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
// // // // // // // // // // // // const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
// // // // // // // // // // // // const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
// // // // // // // // // // // // const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
// // // // // // // // // // // // const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });

// // // // // // // // // // // // const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
// // // // // // // // // // // //   ssr: false,
// // // // // // // // // // // //   loading: () => <div className="h-full w-full flex items-center justify-center">Memuat kalender...</div>,
// // // // // // // // // // // // });

// // // // // // // // // // // // interface GenericMapProps {
// // // // // // // // // // // //   dataType: "aod" | "pm25-est";
// // // // // // // // // // // //   fetchUrl: string;
// // // // // // // // // // // //   fetchByDateUrl: string;
// // // // // // // // // // // //   legendTitle: string;
// // // // // // // // // // // // }

// // // // // // // // // // // // const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
// // // // // // // // // // // //   const mapRef = useRef<L.Map | null>(null);
// // // // // // // // // // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // // // // // // // // // //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// // // // // // // // // // // //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// // // // // // // // // // // //   const [isLoading, setIsLoading] = useState(true);
// // // // // // // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // // // // // // //   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
// // // // // // // // // // // //   const [marker, setMarker] = useState<L.LatLng | null>(null);
// // // // // // // // // // // //   const [isSplitView, setIsSplitView] = useState(false);

// // // // // // // // // // // //   const updateMarker = (latlng: L.LatLng) => {
// // // // // // // // // // // //     setMarker(latlng);
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const fetchData = async (url: string, date?: string) => {
// // // // // // // // // // // //     setIsLoading(true);
// // // // // // // // // // // //     setError(null);
// // // // // // // // // // // //     try {
// // // // // // // // // // // //       const body = date ? JSON.stringify({ tanggal: date }) : undefined;
// // // // // // // // // // // //       console.log(`Fetching ${dataType} data from ${url}${date ? ` with tanggal: ${date}` : ""}`);
// // // // // // // // // // // //       console.log("Request body:", body);
// // // // // // // // // // // //       const response = await fetch(url, {
// // // // // // // // // // // //         method: date ? "POST" : "GET",
// // // // // // // // // // // //         headers: date ? { "Content-Type": "application/json" } : undefined,
// // // // // // // // // // // //         body,
// // // // // // // // // // // //         cache: "no-store",
// // // // // // // // // // // //       });
// // // // // // // // // // // //       console.log("Response status:", response.status);
// // // // // // // // // // // //       if (!response.ok) throw new Error(`Failed to fetch ${dataType} data: ${response.status}`);
// // // // // // // // // // // //       const rawText = await response.text();
// // // // // // // // // // // //       console.log("Response raw text:", rawText.slice(0, 300));
// // // // // // // // // // // //       const cleanText = rawText.replace(/NaN/g, "null");
// // // // // // // // // // // //       const data = JSON.parse(cleanText);
// // // // // // // // // // // //       if (data.error) throw new Error(data.error || `Gagal memuat data ${dataType}`);
// // // // // // // // // // // //       console.log(`Fetched ${dataType} data:`, JSON.stringify(data).slice(0, 300));
// // // // // // // // // // // //       return data;
// // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // //       console.error(`Error fetching ${dataType} data:`, err);
// // // // // // // // // // // //       throw new Error(err instanceof Error ? (err.message.includes("Tidak ada data") ? `Data ${dataType} pada tanggal ini tidak tersedia` : err.message) : "Terjadi kesalahan saat memuat data");
// // // // // // // // // // // //     } finally {
// // // // // // // // // // // //       setIsLoading(false);
// // // // // // // // // // // //     }
// // // // // // // // // // // //   };

// // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // //     const loadData = async () => {
// // // // // // // // // // // //       try {
// // // // // // // // // // // //         const [data, boundary] = await Promise.all([fetchData(fetchUrl), fetch("/data/batas_kelurahan_jakarta.geojson", { cache: "no-store" })]);
// // // // // // // // // // // //         if (!boundary.ok) throw new Error(`Failed to fetch boundary data: ${boundary.status}`);
// // // // // // // // // // // //         const boundaryData = await boundary.json();
// // // // // // // // // // // //         console.log("Boundary data:", JSON.stringify(boundaryData).slice(0, 300));
// // // // // // // // // // // //         console.log("Boundary features count:", boundaryData?.features?.length || 0);
// // // // // // // // // // // //         setGeoData(data);
// // // // // // // // // // // //         setBoundaryData(boundaryData);
// // // // // // // // // // // //       } catch (err) {
// // // // // // // // // // // //         console.error(`Error in loadData (${dataType}):`, err);
// // // // // // // // // // // //         setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // //       }
// // // // // // // // // // // //     };

// // // // // // // // // // // //     loadData();
// // // // // // // // // // // //   }, [fetchUrl, dataType]);

// // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // //     if (mapRef.current) {
// // // // // // // // // // // //       setTimeout(() => mapRef.current?.invalidateSize(), 100);
// // // // // // // // // // // //     }
// // // // // // // // // // // //   }, [isSplitView]);

// // // // // // // // // // // //   const handleDateChange = async (date: string) => {
// // // // // // // // // // // //     setSelectedDate(date);
// // // // // // // // // // // //     try {
// // // // // // // // // // // //       const data = await fetchData(fetchByDateUrl, date);
// // // // // // // // // // // //       setGeoData(data);
// // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // //       setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // // //     }
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const handleMapReady = () => {
// // // // // // // // // // // //     if (mapRef.current) {
// // // // // // // // // // // //       mapRef.current.invalidateSize();
// // // // // // // // // // // //     }
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const styleBoundary = () => ({
// // // // // // // // // // // //     weight: 2,
// // // // // // // // // // // //     opacity: 1,
// // // // // // // // // // // //     color: "#1a4971",
// // // // // // // // // // // //     fillOpacity: 0.05,
// // // // // // // // // // // //   });

// // // // // // // // // // // //   return (
// // // // // // // // // // // //     <div className="relative min-h-screen w-full flex flex-col">
// // // // // // // // // // // //       <div className={styles.searchBarContainer}>
// // // // // // // // // // // //         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// // // // // // // // // // // //       </div>
// // // // // // // // // // // //       {error && (
// // // // // // // // // // // //         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
// // // // // // // // // // // //           <span>{error}</span>
// // // // // // // // // // // //           <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
// // // // // // // // // // // //             Coba Lagi
// // // // // // // // // // // //           </button>
// // // // // // // // // // // //           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
// // // // // // // // // // // //             Tutup
// // // // // // // // // // // //           </button>
// // // // // // // // // // // //         </div>
// // // // // // // // // // // //       )}
// // // // // // // // // // // //       <div className={`flex flex-col md:flex-row h-screen ${isSplitView ? "md:flex-row" : ""}`}>
// // // // // // // // // // // //         <div className={`${isSplitView ? "w-full md:w-1/2" : "w-full"} h-full relative`}>
// // // // // // // // // // // //           <MapContainer
// // // // // // // // // // // //             center={[-6.1754, 106.8272]}
// // // // // // // // // // // //             zoom={12}
// // // // // // // // // // // //             minZoom={12}
// // // // // // // // // // // //             maxZoom={16}
// // // // // // // // // // // //             maxBounds={[
// // // // // // // // // // // //               [-6.45, 106.55],
// // // // // // // // // // // //               [-5.9, 107.15],
// // // // // // // // // // // //             ]}
// // // // // // // // // // // //             maxBoundsViscosity={1}
// // // // // // // // // // // //             className="h-full w-full"
// // // // // // // // // // // //             style={{ height: "100%", width: "100%" }}
// // // // // // // // // // // //             zoomControl={false}
// // // // // // // // // // // //             ref={mapRef}
// // // // // // // // // // // //             whenReady={handleMapReady}
// // // // // // // // // // // //           >
// // // // // // // // // // // //             <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
// // // // // // // // // // // //             {boundaryData && (
// // // // // // // // // // // //               <GeoJSON
// // // // // // // // // // // //                 data={boundaryData}
// // // // // // // // // // // //                 style={styleBoundary}
// // // // // // // // // // // //                 onEachFeature={(feature, layer) => {
// // // // // // // // // // // //                   layer.on({
// // // // // // // // // // // //                     mouseover: (e) => {
// // // // // // // // // // // //                       const layer = e.target;
// // // // // // // // // // // //                       layer.setStyle({
// // // // // // // // // // // //                         weight: 3,
// // // // // // // // // // // //                         color: "#1a4971",
// // // // // // // // // // // //                         fillOpacity: 0.1,
// // // // // // // // // // // //                       });
// // // // // // // // // // // //                       layer.bringToFront();
// // // // // // // // // // // //                     },
// // // // // // // // // // // //                     mouseout: (e) => {
// // // // // // // // // // // //                       const layer = e.target;
// // // // // // // // // // // //                       layer.setStyle(styleBoundary());
// // // // // // // // // // // //                     },
// // // // // // // // // // // //                   });
// // // // // // // // // // // //                 }}
// // // // // // // // // // // //               />
// // // // // // // // // // // //             )}
// // // // // // // // // // // //             <GenericHeatMapLayer dataType={dataType} geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} setSelectedDate={handleDateChange} isLoading={isLoading} legendTitle={legendTitle} inputRef={inputRef} />
// // // // // // // // // // // //             {marker && (
// // // // // // // // // // // //               <Marker position={marker}>
// // // // // // // // // // // //                 <Popup>Lokasi Terpilih</Popup>
// // // // // // // // // // // //               </Marker>
// // // // // // // // // // // //             )}
// // // // // // // // // // // //           </MapContainer>
// // // // // // // // // // // //           <button onClick={() => setIsSplitView(!isSplitView)} className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700" title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}>
// // // // // // // // // // // //             {isSplitView ? "✕" : "📅"}
// // // // // // // // // // // //           </button>
// // // // // // // // // // // //         </div>
// // // // // // // // // // // //         {isSplitView && (
// // // // // // // // // // // //           <div className="w-full md:w-1/2 h-full overflow-auto">
// // // // // // // // // // // //             <Calendar showRightPanel={false} isSplitView={true} />
// // // // // // // // // // // //           </div>
// // // // // // // // // // // //         )}
// // // // // // // // // // // //       </div>
// // // // // // // // // // // //     </div>
// // // // // // // // // // // //   );
// // // // // // // // // // // // };

// // // // // // // // // // // // export default GenericMap;

// // // // // // // // // // // "use client";

// // // // // // // // // // // import React, { useState, useEffect, useRef } from "react";
// // // // // // // // // // // import dynamic from "next/dynamic";
// // // // // // // // // // // import L, { LatLngBoundsExpression } from "leaflet";
// // // // // // // // // // // import "leaflet/dist/leaflet.css";
// // // // // // // // // // // import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// // // // // // // // // // // import SearchBar from "@/components/aod/SearchBar";
// // // // // // // // // // // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
// // // // // // // // // // // import styles from "@/styles/searchbar.module.css";

// // // // // // // // // // // const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
// // // // // // // // // // // const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
// // // // // // // // // // // const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
// // // // // // // // // // // const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
// // // // // // // // // // // const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });

// // // // // // // // // // // const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
// // // // // // // // // // //   ssr: false,
// // // // // // // // // // //   loading: () => <div className="h-full w-full flex items-center justify-center">Memuat kalender...</div>,
// // // // // // // // // // // });

// // // // // // // // // // // interface GenericMapProps {
// // // // // // // // // // //   dataType: "aod" | "pm25-est" | "pm25-aktual"; // Tambah pm25-aktual
// // // // // // // // // // //   fetchUrl: string;
// // // // // // // // // // //   fetchByDateUrl: string;
// // // // // // // // // // //   legendTitle: string;
// // // // // // // // // // // }

// // // // // // // // // // // const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
// // // // // // // // // // //   const mapRef = useRef<L.Map | null>(null);
// // // // // // // // // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // // // // // // // // //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// // // // // // // // // // //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// // // // // // // // // // //   const [isLoading, setIsLoading] = useState(true);
// // // // // // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // // // // // //   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
// // // // // // // // // // //   const [marker, setMarker] = useState<L.LatLng | null>(null);
// // // // // // // // // // //   const [isSplitView, setIsSplitView] = useState(false);

// // // // // // // // // // //   const updateMarker = (latlng: L.LatLng) => {
// // // // // // // // // // //     setMarker(latlng);
// // // // // // // // // // //   };

// // // // // // // // // // //   const fetchData = async (url: string, date?: string) => {
// // // // // // // // // // //     setIsLoading(true);
// // // // // // // // // // //     setError(null);
// // // // // // // // // // //     try {
// // // // // // // // // // //       const body = date ? JSON.stringify({ tanggal: date }) : undefined;
// // // // // // // // // // //       console.log(`Fetching ${dataType} data from ${url}${date ? ` with tanggal: ${date}` : ""}`);
// // // // // // // // // // //       const response = await fetch(url, {
// // // // // // // // // // //         method: date ? "POST" : "GET",
// // // // // // // // // // //         headers: date ? { "Content-Type": "application/json" } : undefined,
// // // // // // // // // // //         body,
// // // // // // // // // // //         cache: "no-store",
// // // // // // // // // // //       });
// // // // // // // // // // //       if (!response.ok) throw new Error(`Failed to fetch ${dataType} data: ${response.status}`);
// // // // // // // // // // //       const rawText = await response.text();
// // // // // // // // // // //       const cleanText = rawText.replace(/NaN/g, "null");
// // // // // // // // // // //       const data = JSON.parse(cleanText);
// // // // // // // // // // //       if (data.error) throw new Error(data.error || `Gagal memuat data ${dataType}`);
// // // // // // // // // // //       // Validasi GeoJSON
// // // // // // // // // // //       if (!data.type || data.type !== "FeatureCollection" || !Array.isArray(data.features)) {
// // // // // // // // // // //         throw new Error(`Invalid GeoJSON format for ${dataType}`);
// // // // // // // // // // //       }
// // // // // // // // // // //       return data;
// // // // // // // // // // //     } catch (err) {
// // // // // // // // // // //       console.error(`Error fetching ${dataType} data:`, err);
// // // // // // // // // // //       throw new Error(err instanceof Error ? (err.message.includes("Tidak ada data") ? `Data ${dataType} pada tanggal ini tidak tersedia` : err.message) : "Terjadi kesalahan saat memuat data");
// // // // // // // // // // //     } finally {
// // // // // // // // // // //       setIsLoading(false);
// // // // // // // // // // //     }
// // // // // // // // // // //   };

// // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // //     const loadData = async () => {
// // // // // // // // // // //       try {
// // // // // // // // // // //         const [data, boundary] = await Promise.all([fetchData(fetchUrl), fetch("/data/batas_kelurahan_jakarta.geojson", { cache: "no-store" })]);
// // // // // // // // // // //         if (!boundary.ok) throw new Error(`Failed to fetch boundary data: ${boundary.status}`);
// // // // // // // // // // //         const boundaryData = await boundary.json();
// // // // // // // // // // //         console.log("Boundary data:", JSON.stringify(boundaryData).slice(0, 300));
// // // // // // // // // // //         console.log("Boundary features count:", boundaryData?.features?.length || 0);
// // // // // // // // // // //         setGeoData(data);
// // // // // // // // // // //         setBoundaryData(boundaryData);
// // // // // // // // // // //       } catch (err) {
// // // // // // // // // // //         console.error(`Error in loadData (${dataType}):`, err);
// // // // // // // // // // //         setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // // //       }
// // // // // // // // // // //     };

// // // // // // // // // // //     loadData();
// // // // // // // // // // //   }, [fetchUrl, dataType]);

// // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // //     if (mapRef.current) {
// // // // // // // // // // //       setTimeout(() => mapRef.current?.invalidateSize(), 100);
// // // // // // // // // // //     }
// // // // // // // // // // //   }, [isSplitView]);

// // // // // // // // // // //   const handleMapReady = () => {
// // // // // // // // // // //     if (mapRef.current) {
// // // // // // // // // // //       mapRef.current.invalidateSize();
// // // // // // // // // // //     }
// // // // // // // // // // //   };

// // // // // // // // // // //   const styleBoundary = () => ({
// // // // // // // // // // //     weight: 2,
// // // // // // // // // // //     opacity: 1,
// // // // // // // // // // //     color: "#1a4971",
// // // // // // // // // // //     fillOpacity: 0.05,
// // // // // // // // // // //   });

// // // // // // // // // // //   return (
// // // // // // // // // // //     <div className="relative min-h-screen w-full flex flex-col">
// // // // // // // // // // //       <div className={styles.searchBarContainer}>
// // // // // // // // // // //         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// // // // // // // // // // //       </div>
// // // // // // // // // // //       {error && (
// // // // // // // // // // //         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
// // // // // // // // // // //           <span>{error}</span>
// // // // // // // // // // //           <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
// // // // // // // // // // //             Coba Lagi
// // // // // // // // // // //           </button>
// // // // // // // // // // //           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
// // // // // // // // // // //             Tutup
// // // // // // // // // // //           </button>
// // // // // // // // // // //         </div>
// // // // // // // // // // //       )}
// // // // // // // // // // //       <div className={`flex flex-col md:flex-row h-screen ${isSplitView ? "md:flex-row" : ""}`}>
// // // // // // // // // // //         <div className={`${isSplitView ? "w-full md:w-1/2" : "w-full"} h-full relative`}>
// // // // // // // // // // //           <MapContainer
// // // // // // // // // // //             center={[-6.1754, 106.8272]}
// // // // // // // // // // //             zoom={12}
// // // // // // // // // // //             minZoom={12}
// // // // // // // // // // //             maxZoom={16}
// // // // // // // // // // //             maxBounds={[
// // // // // // // // // // //               [-6.45, 106.55],
// // // // // // // // // // //               [-5.9, 107.15],
// // // // // // // // // // //             ]}
// // // // // // // // // // //             maxBoundsViscosity={1}
// // // // // // // // // // //             className="h-full w-full"
// // // // // // // // // // //             style={{ height: "100%", width: "100%" }}
// // // // // // // // // // //             zoomControl={false}
// // // // // // // // // // //             ref={mapRef}
// // // // // // // // // // //             whenReady={handleMapReady}
// // // // // // // // // // //           >
// // // // // // // // // // //             <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
// // // // // // // // // // //             {boundaryData && (
// // // // // // // // // // //               <GeoJSON
// // // // // // // // // // //                 data={boundaryData}
// // // // // // // // // // //                 style={styleBoundary}
// // // // // // // // // // //                 onEachFeature={(feature, layer) => {
// // // // // // // // // // //                   layer.on({
// // // // // // // // // // //                     mouseover: (e) => {
// // // // // // // // // // //                       const layer = e.target;
// // // // // // // // // // //                       layer.setStyle({
// // // // // // // // // // //                         weight: 3,
// // // // // // // // // // //                         color: "#1a4971",
// // // // // // // // // // //                         fillOpacity: 0.1,
// // // // // // // // // // //                       });
// // // // // // // // // // //                       layer.bringToFront();
// // // // // // // // // // //                     },
// // // // // // // // // // //                     mouseout: (e) => {
// // // // // // // // // // //                       const layer = e.target;
// // // // // // // // // // //                       layer.setStyle(styleBoundary());
// // // // // // // // // // //                     },
// // // // // // // // // // //                   });
// // // // // // // // // // //                 }}
// // // // // // // // // // //               />
// // // // // // // // // // //             )}
// // // // // // // // // // //             <GenericHeatMapLayer dataType={dataType} geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} setSelectedDate={handleDateChange} isLoading={isLoading} legendTitle={legendTitle} inputRef={inputRef} />
// // // // // // // // // // //             {marker && (
// // // // // // // // // // //               <Marker position={marker}>
// // // // // // // // // // //                 <Popup>Lokasi Terpilih</Popup>
// // // // // // // // // // //               </Marker>
// // // // // // // // // // //             )}
// // // // // // // // // // //           </MapContainer>
// // // // // // // // // // //           <button onClick={() => setIsSplitView(!isSplitView)} className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700" title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}>
// // // // // // // // // // //             {isSplitView ? "✕" : "📅"}
// // // // // // // // // // //           </button>
// // // // // // // // // // //         </div>
// // // // // // // // // // //         {isSplitView && (
// // // // // // // // // // //           <div className="w-full md:w-1/2 h-full overflow-auto">
// // // // // // // // // // //             <Calendar showRightPanel={false} isSplitView={true} />
// // // // // // // // // // //           </div>
// // // // // // // // // // //         )}
// // // // // // // // // // //       </div>
// // // // // // // // // // //     </div>
// // // // // // // // // // //   );
// // // // // // // // // // // };

// // // // // // // // // // // export default GenericMap;

// // // // // // // // // // "use client";

// // // // // // // // // // import React, { useState, useEffect, useRef } from "react";
// // // // // // // // // // import dynamic from "next/dynamic";
// // // // // // // // // // import L, { LatLngBoundsExpression } from "leaflet";
// // // // // // // // // // import "leaflet/dist/leaflet.css";
// // // // // // // // // // import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// // // // // // // // // // import SearchBar from "@/components/aod/SearchBar";
// // // // // // // // // // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
// // // // // // // // // // import styles from "@/styles/searchbar.module.css";

// // // // // // // // // // const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
// // // // // // // // // // const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
// // // // // // // // // // const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
// // // // // // // // // // const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
// // // // // // // // // // const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });

// // // // // // // // // // const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
// // // // // // // // // //   ssr: false,
// // // // // // // // // //   loading: () => <div className="h-full w-full flex items-center justify-center">Memuat kalender...</div>,
// // // // // // // // // // });

// // // // // // // // // // interface GenericMapProps {
// // // // // // // // // //   dataType: "aod" | "pm25-est" | "pm25-aktual";
// // // // // // // // // //   fetchUrl: string;
// // // // // // // // // //   fetchByDateUrl: string;
// // // // // // // // // //   legendTitle: string;
// // // // // // // // // // }

// // // // // // // // // // const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
// // // // // // // // // //   const mapRef = useRef<L.Map | null>(null);
// // // // // // // // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // // // // // // // //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// // // // // // // // // //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// // // // // // // // // //   const [isLoading, setIsLoading] = useState(true);
// // // // // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // // // // //   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
// // // // // // // // // //   const [marker, setMarker] = useState<L.LatLng | null>(null);
// // // // // // // // // //   const [isSplitView, setIsSplitView] = useState(false);

// // // // // // // // // //   const updateMarker = (latlng: L.LatLng) => {
// // // // // // // // // //     setMarker(latlng);
// // // // // // // // // //   };

// // // // // // // // // //   const fetchData = async (url: string, date?: string) => {
// // // // // // // // // //     setIsLoading(true);
// // // // // // // // // //     setError(null);
// // // // // // // // // //     try {
// // // // // // // // // //       const body = date ? JSON.stringify({ tanggal: date }) : undefined;
// // // // // // // // // //       console.log(`Fetching ${dataType} data from ${url}${date ? ` with tanggal: ${date}` : ""}`);
// // // // // // // // // //       const response = await fetch(url, {
// // // // // // // // // //         method: date ? "POST" : "GET",
// // // // // // // // // //         headers: date ? { "Content-Type": "application/json" } : undefined,
// // // // // // // // // //         body,
// // // // // // // // // //         cache: "no-store",
// // // // // // // // // //       });
// // // // // // // // // //       if (!response.ok) throw new Error(`Failed to fetch ${dataType} data: ${response.status}`);
// // // // // // // // // //       const rawText = await response.text();
// // // // // // // // // //       const cleanText = rawText.replace(/NaN/g, "null");
// // // // // // // // // //       const data = JSON.parse(cleanText);
// // // // // // // // // //       if (data.error) throw new Error(data.error || `Gagal memuat data ${dataType}`);
// // // // // // // // // //       if (!data.type || data.type !== "FeatureCollection" || !Array.isArray(data.features)) {
// // // // // // // // // //         throw new Error(`Invalid GeoJSON format for ${dataType}`);
// // // // // // // // // //       }
// // // // // // // // // //       return data;
// // // // // // // // // //     } catch (err) {
// // // // // // // // // //       console.error(`Error fetching ${dataType} data:`, err);
// // // // // // // // // //       throw new Error(err instanceof Error ? (err.message.includes("Tidak ada data") ? `Data ${dataType} pada tanggal ini tidak tersedia` : err.message) : "Terjadi kesalahan saat memuat data");
// // // // // // // // // //     } finally {
// // // // // // // // // //       setIsLoading(false);
// // // // // // // // // //     }
// // // // // // // // // //   };

// // // // // // // // // //   useEffect(() => {
// // // // // // // // // //     const loadData = async () => {
// // // // // // // // // //       try {
// // // // // // // // // //         const [data, boundary] = await Promise.all([fetchData(fetchUrl), fetch("/data/batas_kelurahan_jakarta.geojson", { cache: "no-store" })]);
// // // // // // // // // //         if (!boundary.ok) throw new Error(`Failed to fetch boundary data: ${boundary.status}`);
// // // // // // // // // //         const boundaryData = await boundary.json();
// // // // // // // // // //         if (!boundaryData.type || boundaryData.type !== "FeatureCollection" || !Array.isArray(boundaryData.features)) {
// // // // // // // // // //           throw new Error("Invalid GeoJSON format for boundary data");
// // // // // // // // // //         }
// // // // // // // // // //         setGeoData(data);
// // // // // // // // // //         setBoundaryData(boundaryData);
// // // // // // // // // //       } catch (err) {
// // // // // // // // // //         console.error(`Error in loadData (${dataType}):`, err);
// // // // // // // // // //         setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // //       }
// // // // // // // // // //     };

// // // // // // // // // //     loadData();
// // // // // // // // // //   }, [fetchUrl, dataType]);

// // // // // // // // // //   const handleDateChange = async (date: string) => {
// // // // // // // // // //     setSelectedDate(date);
// // // // // // // // // //     try {
// // // // // // // // // //       const data = await fetchData(fetchByDateUrl, date);
// // // // // // // // // //       setGeoData(data);
// // // // // // // // // //     } catch (err) {
// // // // // // // // // //       setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // // // //     }
// // // // // // // // // //   };

// // // // // // // // // //   useEffect(() => {
// // // // // // // // // //     if (mapRef.current) {
// // // // // // // // // //       setTimeout(() => mapRef.current?.invalidateSize(), 100);
// // // // // // // // // //     }
// // // // // // // // // //   }, [isSplitView]);

// // // // // // // // // //   const handleMapReady = () => {
// // // // // // // // // //     if (mapRef.current) {
// // // // // // // // // //       mapRef.current.invalidateSize();
// // // // // // // // // //     }
// // // // // // // // // //   };

// // // // // // // // // //   const styleBoundary = () => ({
// // // // // // // // // //     weight: 2,
// // // // // // // // // //     opacity: 1,
// // // // // // // // // //     color: "#1a4971",
// // // // // // // // // //     fillOpacity: 0.05,
// // // // // // // // // //   });

// // // // // // // // // //   return (
// // // // // // // // // //     <div className="relative min-h-screen w-full flex flex-col">
// // // // // // // // // //       <div className={styles.searchBarContainer}>
// // // // // // // // // //         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// // // // // // // // // //       </div>
// // // // // // // // // //       {error && (
// // // // // // // // // //         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
// // // // // // // // // //           <span>{error}</span>
// // // // // // // // // //           <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
// // // // // // // // // //             Coba Lagi
// // // // // // // // // //           </button>
// // // // // // // // // //           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
// // // // // // // // // //             Tutup
// // // // // // // // // //           </button>
// // // // // // // // // //         </div>
// // // // // // // // // //       )}
// // // // // // // // // //       <div className={`flex flex-col md:flex-row h-screen ${isSplitView ? "md:flex-row" : ""}`}>
// // // // // // // // // //         <div className={`${isSplitView ? "w-full md:w-1/2" : "w-full"} h-full relative`}>
// // // // // // // // // //           <MapContainer
// // // // // // // // // //             center={[-6.1754, 106.8272]}
// // // // // // // // // //             zoom={12}
// // // // // // // // // //             minZoom={12}
// // // // // // // // // //             maxZoom={16}
// // // // // // // // // //             maxBounds={[
// // // // // // // // // //               [-6.45, 106.55],
// // // // // // // // // //               [-5.9, 107.15],
// // // // // // // // // //             ]}
// // // // // // // // // //             maxBoundsViscosity={1}
// // // // // // // // // //             className="h-full w-full"
// // // // // // // // // //             style={{ height: "100%", width: "100%" }}
// // // // // // // // // //             zoomControl={false}
// // // // // // // // // //             ref={mapRef}
// // // // // // // // // //             whenReady={handleMapReady}
// // // // // // // // // //           >
// // // // // // // // // //             <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
// // // // // // // // // //             {boundaryData && (
// // // // // // // // // //               <GeoJSON
// // // // // // // // // //                 data={boundaryData}
// // // // // // // // // //                 style={styleBoundary}
// // // // // // // // // //                 onEachFeature={(feature, layer) => {
// // // // // // // // // //                   layer.on({
// // // // // // // // // //                     mouseover: (e) => {
// // // // // // // // // //                       const layer = e.target;
// // // // // // // // // //                       layer.setStyle({
// // // // // // // // // //                         weight: 3,
// // // // // // // // // //                         color: "#1a4971",
// // // // // // // // // //                         fillOpacity: 0.1,
// // // // // // // // // //                       });
// // // // // // // // // //                       layer.bringToFront();
// // // // // // // // // //                     },
// // // // // // // // // //                     mouseout: (e) => {
// // // // // // // // // //                       const layer = e.target;
// // // // // // // // // //                       layer.setStyle(styleBoundary());
// // // // // // // // // //                     },
// // // // // // // // // //                   });
// // // // // // // // // //                 }}
// // // // // // // // // //               />
// // // // // // // // // //             )}
// // // // // // // // // //             <GenericHeatMapLayer
// // // // // // // // // //               dataType={dataType}
// // // // // // // // // //               geoData={geoData}
// // // // // // // // // //               boundaryData={boundaryData}
// // // // // // // // // //               selectedDate={selectedDate}
// // // // // // // // // //               setSelectedDate={handleDateChange} // Gunakan handleDateChange
// // // // // // // // // //               isLoading={isLoading}
// // // // // // // // // //               legendTitle={legendTitle}
// // // // // // // // // //               inputRef={inputRef}
// // // // // // // // // //             />
// // // // // // // // // //             {marker && (
// // // // // // // // // //               <Marker position={marker}>
// // // // // // // // // //                 <Popup>Lokasi Terpilih</Popup>
// // // // // // // // // //               </Marker>
// // // // // // // // // //             )}
// // // // // // // // // //           </MapContainer>
// // // // // // // // // //           <button onClick={() => setIsSplitView(!isSplitView)} className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700" title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}>
// // // // // // // // // //             {isSplitView ? "✕" : "📅"}
// // // // // // // // // //           </button>
// // // // // // // // // //         </div>
// // // // // // // // // //         {isSplitView && (
// // // // // // // // // //           <div className="w-full md:w-1/2 h-full overflow-auto">
// // // // // // // // // //             <Calendar showRightPanel={false} isSplitView={true} />
// // // // // // // // // //           </div>
// // // // // // // // // //         )}
// // // // // // // // // //       </div>
// // // // // // // // // //     </div>
// // // // // // // // // //   );
// // // // // // // // // // };

// // // // // // // // // // export default GenericMap;

// // // // // // // // // "use client";

// // // // // // // // // import React, { useState, useEffect, useRef } from "react";
// // // // // // // // // import dynamic from "next/dynamic";
// // // // // // // // // import L, { LatLngBoundsExpression } from "leaflet";
// // // // // // // // // import "leaflet/dist/leaflet.css";
// // // // // // // // // import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// // // // // // // // // import SearchBar from "@/components/aod/SearchBar";
// // // // // // // // // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
// // // // // // // // // import styles from "@/styles/searchbar.module.css";

// // // // // // // // // const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
// // // // // // // // // const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
// // // // // // // // // const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
// // // // // // // // // const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
// // // // // // // // // const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });

// // // // // // // // // const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
// // // // // // // // //   ssr: false,
// // // // // // // // //   loading: () => <div className="h-full w-full flex items-center justify-center">Memuat kalender...</div>,
// // // // // // // // // });

// // // // // // // // // interface GenericMapProps {
// // // // // // // // //   dataType: "aod" | "pm25-est"; // Hanya aod dan pm25-est
// // // // // // // // //   fetchUrl: string;
// // // // // // // // //   fetchByDateUrl: string;
// // // // // // // // //   legendTitle: string;
// // // // // // // // //   geoData: GeoJSONData | null;
// // // // // // // // //   boundaryData: BoundaryGeoJSONData | null;
// // // // // // // // //   isLoading: boolean;
// // // // // // // // //   setGeoData: (data: GeoJSONData | null) => void;
// // // // // // // // //   setError: (error: string | null) => void;
// // // // // // // // //   selectedDate: string;
// // // // // // // // //   setSelectedDate: (date: string) => void;
// // // // // // // // // }

// // // // // // // // // const GenericMap: React.FC<GenericMapProps> = ({
// // // // // // // // //   dataType,
// // // // // // // // //   fetchUrl,
// // // // // // // // //   fetchByDateUrl,
// // // // // // // // //   legendTitle,
// // // // // // // // //   geoData,
// // // // // // // // //   boundaryData,
// // // // // // // // //   isLoading,
// // // // // // // // //   setGeoData,
// // // // // // // // //   setError,
// // // // // // // // //   selectedDate,
// // // // // // // // //   setSelectedDate,
// // // // // // // // // }) => {
// // // // // // // // //   const mapRef = useRef<L.Map | null>(null);
// // // // // // // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // // // // // // //   const [marker, setMarker] = useState<L.LatLng | null>(null);
// // // // // // // // //   const [isSplitView, setIsSplitView] = useState(false);

// // // // // // // // //   const updateMarker = (latlng: L.LatLng) => {
// // // // // // // // //     setMarker(latlng);
// // // // // // // // //   };

// // // // // // // // //   useEffect(() => {
// // // // // // // // //     if (mapRef.current) {
// // // // // // // // //       setTimeout(() => mapRef.current?.invalidateSize(), 100);
// // // // // // // // //     }
// // // // // // // // //   }, [isSplitView]);

// // // // // // // // //   const handleMapReady = () => {
// // // // // // // // //     if (mapRef.current) {
// // // // // // // // //       mapRef.current.invalidateSize();
// // // // // // // // //     }
// // // // // // // // //   };

// // // // // // // // //   const styleBoundary = () => ({
// // // // // // // // //     weight: 2,
// // // // // // // // //     opacity: 1,
// // // // // // // // //     color: "#1a4971",
// // // // // // // // //     fillOpacity: 0.05,
// // // // // // // // //   });

// // // // // // // // //   return (
// // // // // // // // //     <div className="relative min-h-screen w-full flex flex-col">
// // // // // // // // //       <div className={styles.searchBarContainer}>
// // // // // // // // //         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// // // // // // // // //       </div>
// // // // // // // // //       {error && (
// // // // // // // // //         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
// // // // // // // // //           <span>{error}</span>
// // // // // // // // //           <button
// // // // // // // // //             onClick={() => {
// // // // // // // // //               setError(null);
// // // // // // // // //               // Fetch ulang data awal
// // // // // // // // //               fetch(fetchUrl, { cache: "no-store" })
// // // // // // // // //                 .then((res) => res.json())
// // // // // // // // //                 .then((data) => {
// // // // // // // // //                   if (data.error) throw new Error(data.error);
// // // // // // // // //                   if (!data.type || data.type !== "FeatureCollection" || !Array.isArray(data.features)) {
// // // // // // // // //                     throw new Error(`Invalid GeoJSON format for ${dataType}`);
// // // // // // // // //                   }
// // // // // // // // //                   setGeoData(data);
// // // // // // // // //                 })
// // // // // // // // //                 .catch((err) => setError(err.message || "Terjadi kesalahan"));
// // // // // // // // //             }}
// // // // // // // // //             className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
// // // // // // // // //           >
// // // // // // // // //             Coba Lagi
// // // // // // // // //           </button>
// // // // // // // // //           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
// // // // // // // // //             Tutup
// // // // // // // // //           </button>
// // // // // // // // //         </div>
// // // // // // // // //       )}
// // // // // // // // //       <div className={`flex flex-col md:flex-row h-screen ${isSplitView ? "md:flex-row" : ""}`}>
// // // // // // // // //         <div className={`${isSplitView ? "w-full md:w-1/2" : "w-full"} h-full relative`}>
// // // // // // // // //           <MapContainer
// // // // // // // // //             center={[-6.1754, 106.8272]}
// // // // // // // // //             zoom={12}
// // // // // // // // //             minZoom={12}
// // // // // // // // //             maxZoom={16}
// // // // // // // // //             maxBounds={[
// // // // // // // // //               [-6.45, 106.55],
// // // // // // // // //               [-5.9, 107.15],
// // // // // // // // //             ]}
// // // // // // // // //             maxBoundsViscosity={1}
// // // // // // // // //             className="h-full w-full"
// // // // // // // // //             style={{ height: "100%", width: "100%" }}
// // // // // // // // //             zoomControl={false}
// // // // // // // // //             ref={mapRef}
// // // // // // // // //             whenReady={handleMapReady}
// // // // // // // // //           >
// // // // // // // // //             <TileLayer
// // // // // // // // //               url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
// // // // // // // // //               attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
// // // // // // // // //             />
// // // // // // // // //             {boundaryData && (
// // // // // // // // //               <GeoJSON
// // // // // // // // //                 data={boundaryData}
// // // // // // // // //                 style={styleBoundary}
// // // // // // // // //                 onEachFeature={(feature, layer) => {
// // // // // // // // //                   layer.on({
// // // // // // // // //                     mouseover: (e) => {
// // // // // // // // //                       const layer = e.target;
// // // // // // // // //                       layer.setStyle({
// // // // // // // // //                         weight: 3,
// // // // // // // // //                         color: "#1a4971",
// // // // // // // // //                         fillOpacity: 0.1,
// // // // // // // // //                       });
// // // // // // // // //                       layer.bringToFront();
// // // // // // // // //                     },
// // // // // // // // //                     mouseout: (e) => {
// // // // // // // // //                       const layer = e.target;
// // // // // // // // //                       layer.setStyle(styleBoundary());
// // // // // // // // //                     },
// // // // // // // // //                   });
// // // // // // // // //                 }}
// // // // // // // // //               />
// // // // // // // // //             )}
// // // // // // // // //             <GenericHeatMapLayer
// // // // // // // // //               dataType={dataType}
// // // // // // // // //               geoData={geoData}
// // // // // // // // //               boundaryData={boundaryData}
// // // // // // // // //               selectedDate={selectedDate}
// // // // // // // // //               setSelectedDate={setSelectedDate}
// // // // // // // // //               isLoading={isLoading}
// // // // // // // // //               legendTitle={legendTitle}
// // // // // // // // //               inputRef={inputRef}
// // // // // // // // //             />
// // // // // // // // //             {marker && (
// // // // // // // // //               <Marker position={marker}>
// // // // // // // // //                 <Popup>Lokasi Terpilih</Popup>
// // // // // // // // //               </Marker>
// // // // // // // // //             )}
// // // // // // // // //           </MapContainer>
// // // // // // // // //           <button
// // // // // // // // //             onClick={() => setIsSplitView(!isSplitView)}
// // // // // // // // //             className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
// // // // // // // // //             title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}
// // // // // // // // //           >
// // // // // // // // //             {isSplitView ? "✕" : "📅"}
// // // // // // // // //           </button>
// // // // // // // // //         </div>
// // // // // // // // //         {isSplitView && (
// // // // // // // // //           <div className="w-full md:w-1/2 h-full overflow-auto">
// // // // // // // // //             <Calendar showRightPanel={false} isSplitView={true} />
// // // // // // // // //           </div>
// // // // // // // // //         )}
// // // // // // // // //       </div>
// // // // // // // // //     </div>
// // // // // // // // //   );
// // // // // // // // // };

// // // // // // // // // export default GenericMap;

// // // // // // // // "use client";

// // // // // // // // import React, { useState, useEffect, useRef } from "react";
// // // // // // // // import dynamic from "next/dynamic";
// // // // // // // // import L, { LatLngBoundsExpression } from "leaflet";
// // // // // // // // import "leaflet/dist/leaflet.css";
// // // // // // // // import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// // // // // // // // import SearchBar from "@/components/aod/SearchBar";
// // // // // // // // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
// // // // // // // // import styles from "@/styles/searchbar.module.css";

// // // // // // // // const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
// // // // // // // // const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
// // // // // // // // const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
// // // // // // // // const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
// // // // // // // // const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });

// // // // // // // // const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
// // // // // // // //   ssr: false,
// // // // // // // //   loading: () => <div className="h-full w-full flex items-center justify-center">Memuat kalender...</div>,
// // // // // // // // });

// // // // // // // // interface GenericMapProps {
// // // // // // // //   dataType: "aod" | "pm25-est";
// // // // // // // //   fetchUrl: string;
// // // // // // // //   fetchByDateUrl: string;
// // // // // // // //   legendTitle: string;
// // // // // // // // }

// // // // // // // // const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
// // // // // // // //   const mapRef = useRef<L.Map | null>(null);
// // // // // // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // // // // // //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// // // // // // // //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// // // // // // // //   const [isLoading, setIsLoading] = useState(true);
// // // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // // //   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
// // // // // // // //   const [marker, setMarker] = useState<L.LatLng | null>(null);
// // // // // // // //   const [isSplitView, setIsSplitView] = useState(false);

// // // // // // // //   const updateMarker = (latlng: L.LatLng) => {
// // // // // // // //     setMarker(latlng);
// // // // // // // //   };

// // // // // // // //   const fetchData = async (url: string, date?: string) => {
// // // // // // // //     setIsLoading(true);
// // // // // // // //     setError(null);
// // // // // // // //     try {
// // // // // // // //       const body = date ? JSON.stringify({ tanggal: date }) : undefined;
// // // // // // // //       console.log(`Fetching ${dataType} data from ${url}${date ? ` with tanggal: ${date}` : ""}`);
// // // // // // // //       console.log("Request body:", body);
// // // // // // // //       const response = await fetch(url, {
// // // // // // // //         method: date ? "POST" : "GET",
// // // // // // // //         headers: date ? { "Content-Type": "application/json" } : undefined,
// // // // // // // //         body,
// // // // // // // //         cache: "no-store",
// // // // // // // //       });
// // // // // // // //       console.log("Response status:", response.status);
// // // // // // // //       if (!response.ok) throw new Error(`Failed to fetch ${dataType} data: ${response.status}`);
// // // // // // // //       const rawText = await response.text();
// // // // // // // //       console.log("Response raw text:", rawText.slice(0, 300));
// // // // // // // //       const cleanText = rawText.replace(/NaN/g, "null");
// // // // // // // //       const data = JSON.parse(cleanText);
// // // // // // // //       if (data.error) throw new Error(data.error || `Gagal memuat data ${dataType}`);
// // // // // // // //       console.log(`Fetched ${dataType} data:`, JSON.stringify(data).slice(0, 300));
// // // // // // // //       return data;
// // // // // // // //     } catch (err) {
// // // // // // // //       console.error(`Error fetching ${dataType} data:`, err);
// // // // // // // //       throw new Error(err instanceof Error ? (err.message.includes("Tidak ada data") ? `Data ${dataType} pada tanggal ini tidak tersedia` : err.message) : "Terjadi kesalahan saat memuat data");
// // // // // // // //     } finally {
// // // // // // // //       setIsLoading(false);
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   useEffect(() => {
// // // // // // // //     const loadData = async () => {
// // // // // // // //       try {
// // // // // // // //         const [data, boundary] = await Promise.all([fetchData(fetchUrl), fetch("/data/batas_kelurahan_jakarta.geojson", { cache: "no-store" })]);
// // // // // // // //         if (!boundary.ok) throw new Error(`Failed to fetch boundary data: ${boundary.status}`);
// // // // // // // //         const boundaryData = await boundary.json();
// // // // // // // //         console.log("Boundary data:", JSON.stringify(boundaryData).slice(0, 300));
// // // // // // // //         console.log("Boundary features count:", boundaryData?.features?.length || 0);
// // // // // // // //         setGeoData(data);
// // // // // // // //         setBoundaryData(boundaryData);
// // // // // // // //       } catch (err) {
// // // // // // // //         console.error(`Error in loadData (${dataType}):`, err);
// // // // // // // //         setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // //       }
// // // // // // // //     };

// // // // // // // //     loadData();
// // // // // // // //   }, [fetchUrl, dataType]);

// // // // // // // //   useEffect(() => {
// // // // // // // //     if (mapRef.current) {
// // // // // // // //       setTimeout(() => mapRef.current?.invalidateSize(), 100);
// // // // // // // //     }
// // // // // // // //   }, [isSplitView]);

// // // // // // // //   const handleDateChange = async (date: string) => {
// // // // // // // //     setSelectedDate(date);
// // // // // // // //     try {
// // // // // // // //       const data = await fetchData(fetchByDateUrl, date);
// // // // // // // //       setGeoData(data);
// // // // // // // //     } catch (err) {
// // // // // // // //       setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   const handleMapReady = () => {
// // // // // // // //     if (mapRef.current) {
// // // // // // // //       mapRef.current.invalidateSize();
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   const styleBoundary = () => ({
// // // // // // // //     weight: 2,
// // // // // // // //     opacity: 1,
// // // // // // // //     color: "#1a4971",
// // // // // // // //     fillOpacity: 0.05,
// // // // // // // //   });

// // // // // // // //   return (
// // // // // // // //     <div className="relative min-h-screen w-full flex flex-col">
// // // // // // // //       <div className={styles.searchBarContainer}>
// // // // // // // //         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// // // // // // // //       </div>
// // // // // // // //       {error && (
// // // // // // // //         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
// // // // // // // //           <span>{error}</span>
// // // // // // // //           <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
// // // // // // // //             Coba Lagi
// // // // // // // //           </button>
// // // // // // // //           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
// // // // // // // //             Tutup
// // // // // // // //           </button>
// // // // // // // //         </div>
// // // // // // // //       )}
// // // // // // // //       <div className={`flex flex-col md:flex-row h-screen ${isSplitView ? "md:flex-row" : ""}`}>
// // // // // // // //         <div className={`${isSplitView ? "w-full md:w-1/2" : "w-full"} h-full relative`}>
// // // // // // // //           <MapContainer
// // // // // // // //             center={[-6.1754, 106.8272]}
// // // // // // // //             zoom={12}
// // // // // // // //             minZoom={12}
// // // // // // // //             maxZoom={16}
// // // // // // // //             maxBounds={[
// // // // // // // //               [-6.45, 106.55],
// // // // // // // //               [-5.9, 107.15],
// // // // // // // //             ]}
// // // // // // // //             maxBoundsViscosity={1}
// // // // // // // //             className="h-full w-full"
// // // // // // // //             style={{ height: "100%", width: "100%" }}
// // // // // // // //             zoomControl={false}
// // // // // // // //             ref={mapRef}
// // // // // // // //             whenReady={handleMapReady}
// // // // // // // //           >
// // // // // // // //             <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
// // // // // // // //             {boundaryData && (
// // // // // // // //               <GeoJSON
// // // // // // // //                 data={boundaryData}
// // // // // // // //                 style={styleBoundary}
// // // // // // // //                 onEachFeature={(feature, layer) => {
// // // // // // // //                   layer.on({
// // // // // // // //                     mouseover: (e) => {
// // // // // // // //                       const layer = e.target;
// // // // // // // //                       layer.setStyle({
// // // // // // // //                         weight: 3,
// // // // // // // //                         color: "#1a4971",
// // // // // // // //                         fillOpacity: 0.1,
// // // // // // // //                       });
// // // // // // // //                       layer.bringToFront();
// // // // // // // //                     },
// // // // // // // //                     mouseout: (e) => {
// // // // // // // //                       const layer = e.target;
// // // // // // // //                       layer.setStyle(styleBoundary());
// // // // // // // //                     },
// // // // // // // //                   });
// // // // // // // //                 }}
// // // // // // // //               />
// // // // // // // //             )}
// // // // // // // //             <GenericHeatMapLayer dataType={dataType} geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} setSelectedDate={handleDateChange} isLoading={isLoading} legendTitle={legendTitle} inputRef={inputRef} />
// // // // // // // //             {marker && (
// // // // // // // //               <Marker position={marker}>
// // // // // // // //                 <Popup>Lokasi Terpilih</Popup>
// // // // // // // //               </Marker>
// // // // // // // //             )}
// // // // // // // //           </MapContainer>
// // // // // // // //           <button onClick={() => setIsSplitView(!isSplitView)} className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700" title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}>
// // // // // // // //             {isSplitView ? "✕" : "📅"}
// // // // // // // //           </button>
// // // // // // // //         </div>
// // // // // // // //         {isSplitView && (
// // // // // // // //           <div className="w-full md:w-1/2 h-full overflow-auto">
// // // // // // // //             <Calendar showRightPanel={false} isSplitView={true} />
// // // // // // // //           </div>
// // // // // // // //         )}
// // // // // // // //       </div>
// // // // // // // //     </div>
// // // // // // // //   );
// // // // // // // // };

// // // // // // // // export default GenericMap;

// // // // // // // // components\map\GenericMap.tsx
// // // // // // // "use client";

// // // // // // // import React, { useState, useEffect, useRef } from "react";
// // // // // // // import dynamic from "next/dynamic";
// // // // // // // import "leaflet/dist/leaflet.css";
// // // // // // // import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// // // // // // // import SearchBar from "@/components/aod/SearchBar";
// // // // // // // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
// // // // // // // import styles from "@/styles/searchbar.module.css";

// // // // // // // // Dynamic imports untuk react-leaflet
// // // // // // // const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
// // // // // // // const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
// // // // // // // const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
// // // // // // // const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
// // // // // // // const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });

// // // // // // // // Dynamic import untuk Calendar
// // // // // // // const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
// // // // // // //   ssr: false,
// // // // // // //   loading: () => <div className="h-full w-full flex items-center justify-center">Memuat kalender...</div>,
// // // // // // // });

// // // // // // // // Dynamic import untuk leaflet
// // // // // // // const L = dynamic(() => import("leaflet").then((mod) => mod.default), { ssr: false });

// // // // // // // interface GenericMapProps {
// // // // // // //   dataType: "aod" | "pm25-est";
// // // // // // //   fetchUrl: string;
// // // // // // //   fetchByDateUrl: string;
// // // // // // //   legendTitle: string;
// // // // // // // }

// // // // // // // const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
// // // // // // //   const mapRef = useRef<any>(null); // Ubah tipe ke any sementara karena L.Map bergantung pada leaflet
// // // // // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // // // // //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// // // // // // //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// // // // // // //   const [isLoading, setIsLoading] = useState(true);
// // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // //   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
// // // // // // //   const [marker, setMarker] = useState<any | null>(null); // Ubah ke any karena L.LatLng bergantung pada leaflet
// // // // // // //   const [isSplitView, setIsSplitView] = useState(false);

// // // // // // //   const updateMarker = (latlng: any) => {
// // // // // // //     setMarker(latlng);
// // // // // // //   };

// // // // // // //   const fetchData = async (url: string, date?: string) => {
// // // // // // //     setIsLoading(true);
// // // // // // //     setError(null);
// // // // // // //     try {
// // // // // // //       const body = date ? JSON.stringify({ tanggal: date }) : undefined;
// // // // // // //       console.log(`Fetching ${dataType} data from ${url}${date ? ` with tanggal: ${date}` : ""}`);
// // // // // // //       console.log("Request body:", body);
// // // // // // //       const response = await fetch(url, {
// // // // // // //         method: date ? "POST" : "GET",
// // // // // // //         headers: date ? { "Content-Type": "application/json" } : undefined,
// // // // // // //         body,
// // // // // // //         cache: "no-store",
// // // // // // //       });
// // // // // // //       console.log("Response status:", response.status);
// // // // // // //       if (!response.ok) throw new Error(`Failed to fetch ${dataType} data: ${response.status}`);
// // // // // // //       const rawText = await response.text();
// // // // // // //       console.log("Response raw text:", rawText.slice(0, 300));
// // // // // // //       const cleanText = rawText.replace(/NaN/g, "null");
// // // // // // //       const data = JSON.parse(cleanText);
// // // // // // //       if (data.error) throw new Error(data.error || `Gagal memuat data ${dataType}`);
// // // // // // //       console.log(`Fetched ${dataType} data:`, JSON.stringify(data).slice(0, 300));
// // // // // // //       return data;
// // // // // // //     } catch (err) {
// // // // // // //       console.error(`Error fetching ${dataType} data:`, err);
// // // // // // //       throw new Error(err instanceof Error ? (err.message.includes("Tidak ada data") ? `Data ${dataType} pada tanggal ini tidak tersedia` : err.message) : "Terjadi kesalahan saat memuat data");
// // // // // // //     } finally {
// // // // // // //       setIsLoading(false);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   useEffect(() => {
// // // // // // //     const loadData = async () => {
// // // // // // //       try {
// // // // // // //         const [data, boundary] = await Promise.all([fetchData(fetchUrl), fetch("/data/batas_kelurahan_jakarta.geojson", { cache: "no-store" })]);
// // // // // // //         if (!boundary.ok) throw new Error(`Failed to fetch boundary data: ${boundary.status}`);
// // // // // // //         const boundaryData = await boundary.json();
// // // // // // //         console.log("Boundary data:", JSON.stringify(boundaryData).slice(0, 300));
// // // // // // //         console.log("Boundary features count:", boundaryData?.features?.length || 0);
// // // // // // //         setGeoData(data);
// // // // // // //         setBoundaryData(boundaryData);
// // // // // // //       } catch (err) {
// // // // // // //         console.error(`Error in loadData (${dataType}):`, err);
// // // // // // //         setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // //       }
// // // // // // //     };

// // // // // // //     loadData();
// // // // // // //   }, [fetchUrl, dataType]);

// // // // // // //   useEffect(() => {
// // // // // // //     if (mapRef.current) {
// // // // // // //       setTimeout(() => mapRef.current?.invalidateSize(), 100);
// // // // // // //     }
// // // // // // //   }, [isSplitView]);

// // // // // // //   const handleDateChange = async (date: string) => {
// // // // // // //     setSelectedDate(date);
// // // // // // //     try {
// // // // // // //       const data = await fetchData(fetchByDateUrl, date);
// // // // // // //       setGeoData(data);
// // // // // // //     } catch (err) {
// // // // // // //       setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const handleMapReady = () => {
// // // // // // //     if (mapRef.current) {
// // // // // // //       mapRef.current.invalidateSize();
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const styleBoundary = () => ({
// // // // // // //     weight: 2,
// // // // // // //     opacity: 1,
// // // // // // //     color: "#1a4971",
// // // // // // //     fillOpacity: 0.05,
// // // // // // //   });

// // // // // // //   return (
// // // // // // //     <div className="relative min-h-screen w-full flex flex-col">
// // // // // // //       <div className={styles.searchBarContainer}>
// // // // // // //         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// // // // // // //       </div>
// // // // // // //       {error && (
// // // // // // //         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
// // // // // // //           <span>{error}</span>
// // // // // // //           <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
// // // // // // //             Coba Lagi
// // // // // // //           </button>
// // // // // // //           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
// // // // // // //             Tutup
// // // // // // //           </button>
// // // // // // //         </div>
// // // // // // //       )}
// // // // // // //       <div className={`flex flex-col md:flex-row h-screen ${isSplitView ? "md:flex-row" : ""}`}>
// // // // // // //         <div className={`${isSplitView ? "w-full md:w-1/2" : "w-full"} h-full relative`}>
// // // // // // //           <MapContainer
// // // // // // //             center={[-6.1754, 106.8272]}
// // // // // // //             zoom={12}
// // // // // // //             minZoom={12}
// // // // // // //             maxZoom={16}
// // // // // // //             maxBounds={[
// // // // // // //               [-6.45, 106.55],
// // // // // // //               [-5.9, 107.15],
// // // // // // //             ]}
// // // // // // //             maxBoundsViscosity={1}
// // // // // // //             className="h-full w-full"
// // // // // // //             style={{ height: "100%", width: "100%" }}
// // // // // // //             zoomControl={false}
// // // // // // //             ref={mapRef}
// // // // // // //             whenReady={handleMapReady}
// // // // // // //           >
// // // // // // //             <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
// // // // // // //             {boundaryData && (
// // // // // // //               <GeoJSON
// // // // // // //                 data={boundaryData}
// // // // // // //                 style={styleBoundary}
// // // // // // //                 onEachFeature={(feature, layer) => {
// // // // // // //                   layer.on({
// // // // // // //                     mouseover: (e: any) => {
// // // // // // //                       const layer = e.target;
// // // // // // //                       layer.setStyle({
// // // // // // //                         weight: 3,
// // // // // // //                         color: "#1a4971",
// // // // // // //                         fillOpacity: 0.1,
// // // // // // //                       });
// // // // // // //                       layer.bringToFront();
// // // // // // //                     },
// // // // // // //                     mouseout: (e: any) => {
// // // // // // //                       const layer = e.target;
// // // // // // //                       layer.setStyle(styleBoundary());
// // // // // // //                     },
// // // // // // //                   });
// // // // // // //                 }}
// // // // // // //               />
// // // // // // //             )}
// // // // // // //             <GenericHeatMapLayer dataType={dataType} geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} setSelectedDate={handleDateChange} isLoading={isLoading} legendTitle={legendTitle} inputRef={inputRef} />
// // // // // // //             {marker && (
// // // // // // //               <Marker position={marker}>
// // // // // // //                 <Popup>Lokasi Terpilih</Popup>
// // // // // // //               </Marker>
// // // // // // //             )}
// // // // // // //           </MapContainer>
// // // // // // //           <button onClick={() => setIsSplitView(!isSplitView)} className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700" title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}>
// // // // // // //             {isSplitView ? "✕" : "📅"}
// // // // // // //           </button>
// // // // // // //         </div>
// // // // // // //         {isSplitView && (
// // // // // // //           <div className="w-full md:w-1/2 h-full overflow-auto">
// // // // // // //             <Calendar showRightPanel={false} isSplitView={true} />
// // // // // // //           </div>
// // // // // // //         )}
// // // // // // //       </div>
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // };

// // // // // // // export default GenericMap;

// // // // // // // components\map\GenericMap.tsx
// // // // // // "use client";

// // // // // // import React, { useState, useEffect, useRef } from "react";
// // // // // // import dynamic from "next/dynamic";
// // // // // // import "leaflet/dist/leaflet.css";
// // // // // // import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// // // // // // import SearchBar from "@/components/aod/SearchBar";
// // // // // // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
// // // // // // import styles from "@/styles/searchbar.module.css";
// // // // // // import * as L from "leaflet"; // Import biasa untuk leaflet

// // // // // // // Dynamic imports untuk react-leaflet
// // // // // // const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
// // // // // // const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
// // // // // // const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
// // // // // // const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
// // // // // // const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });

// // // // // // // Dynamic import untuk Calendar
// // // // // // const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
// // // // // //   ssr: false,
// // // // // //   loading: () => <div className="h-full w-full flex items-center justify-center">Memuat kalender...</div>,
// // // // // // });

// // // // // // interface GenericMapProps {
// // // // // //   dataType: "aod" | "pm25-est";
// // // // // //   fetchUrl: string;
// // // // // //   fetchByDateUrl: string;
// // // // // //   legendTitle: string;
// // // // // // }

// // // // // // const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
// // // // // //   const mapRef = useRef<L.Map | null>(null);
// // // // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // // // //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// // // // // //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// // // // // //   const [isLoading, setIsLoading] = useState(true);
// // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // //   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
// // // // // //   const [marker, setMarker] = useState<L.LatLng | null>(null);
// // // // // //   const [isSplitView, setIsSplitView] = useState(false);

// // // // // //   const updateMarker = (latlng: L.LatLng) => {
// // // // // //     setMarker(latlng);
// // // // // //   };

// // // // // //   const fetchData = async (url: string, date?: string) => {
// // // // // //     setIsLoading(true);
// // // // // //     setError(null);
// // // // // //     try {
// // // // // //       const body = date ? JSON.stringify({ tanggal: date }) : undefined;
// // // // // //       console.log(`Fetching ${dataType} data from ${url}${date ? ` with tanggal: ${date}` : ""}`);
// // // // // //       console.log("Request body:", body);
// // // // // //       const response = await fetch(url, {
// // // // // //         method: date ? "POST" : "GET",
// // // // // //         headers: date ? { "Content-Type": "application/json" } : undefined,
// // // // // //         body,
// // // // // //         cache: "no-store",
// // // // // //       });
// // // // // //       console.log("Response status:", response.status);
// // // // // //       if (!response.ok) throw new Error(`Failed to fetch ${dataType} data: ${response.status}`);
// // // // // //       const rawText = await response.text();
// // // // // //       console.log("Response raw text:", rawText.slice(0, 300));
// // // // // //       const cleanText = rawText.replace(/NaN/g, "null");
// // // // // //       const data = JSON.parse(cleanText);
// // // // // //       if (data.error) throw new Error(data.error || `Gagal memuat data ${dataType}`);
// // // // // //       console.log(`Fetched ${dataType} data:`, JSON.stringify(data).slice(0, 300));
// // // // // //       return data;
// // // // // //     } catch (err) {
// // // // // //       console.error(`Error fetching ${dataType} data:`, err);
// // // // // //       throw new Error(err instanceof Error ? (err.message.includes("Tidak ada data") ? `Data ${dataType} pada tanggal ini tidak tersedia` : err.message) : "Terjadi kesalahan saat memuat data");
// // // // // //     } finally {
// // // // // //       setIsLoading(false);
// // // // // //     }
// // // // // //   };

// // // // // //   useEffect(() => {
// // // // // //     const loadData = async () => {
// // // // // //       try {
// // // // // //         const [data, boundary] = await Promise.all([fetchData(fetchUrl), fetch("/data/batas_kelurahan_jakarta.geojson", { cache: "no-store" })]);
// // // // // //         if (!boundary.ok) throw new Error(`Failed to fetch boundary data: ${boundary.status}`);
// // // // // //         const boundaryData = await boundary.json();
// // // // // //         console.log("Boundary data:", JSON.stringify(boundaryData).slice(0, 300));
// // // // // //         console.log("Boundary features count:", boundaryData?.features?.length || 0);
// // // // // //         setGeoData(data);
// // // // // //         setBoundaryData(boundaryData);
// // // // // //       } catch (err) {
// // // // // //         console.error(`Error in loadData (${dataType}):`, err);
// // // // // //         setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // //       }
// // // // // //     };

// // // // // //     loadData();
// // // // // //   }, [fetchUrl, dataType]);

// // // // // //   useEffect(() => {
// // // // // //     if (mapRef.current) {
// // // // // //       setTimeout(() => mapRef.current?.invalidateSize(), 100);
// // // // // //     }
// // // // // //   }, [isSplitView]);

// // // // // //   const handleDateChange = async (date: string) => {
// // // // // //     setSelectedDate(date);
// // // // // //     try {
// // // // // //       const data = await fetchData(fetchByDateUrl, date);
// // // // // //       setGeoData(data);
// // // // // //     } catch (err) {
// // // // // //       setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // // //     }
// // // // // //   };

// // // // // //   const handleMapReady = () => {
// // // // // //     if (mapRef.current) {
// // // // // //       mapRef.current.invalidateSize();
// // // // // //     }
// // // // // //   };

// // // // // //   const styleBoundary = () => ({
// // // // // //     weight: 2,
// // // // // //     opacity: 1,
// // // // // //     color: "#1a4971",
// // // // // //     fillOpacity: 0.05,
// // // // // //   });

// // // // // //   return (
// // // // // //     <div className="relative min-h-screen w-full flex flex-col">
// // // // // //       <div className={styles.searchBarContainer}>
// // // // // //         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// // // // // //       </div>
// // // // // //       {error && (
// // // // // //         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
// // // // // //           <span>{error}</span>
// // // // // //           <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
// // // // // //             Coba Lagi
// // // // // //           </button>
// // // // // //           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
// // // // // //             Tutup
// // // // // //           </button>
// // // // // //         </div>
// // // // // //       )}
// // // // // //       <div className={`flex flex-col md:flex-row h-screen ${isSplitView ? "md:flex-row" : ""}`}>
// // // // // //         <div className={`${isSplitView ? "w-full md:w-1/2" : "w-full"} h-full relative`}>
// // // // // //           <MapContainer
// // // // // //             center={[-6.1754, 106.8272]}
// // // // // //             zoom={12}
// // // // // //             minZoom={12}
// // // // // //             maxZoom={16}
// // // // // //             maxBounds={[
// // // // // //               [-6.45, 106.55],
// // // // // //               [-5.9, 107.15],
// // // // // //             ]}
// // // // // //             maxBoundsViscosity={1}
// // // // // //             className="h-full w-full"
// // // // // //             style={{ height: "100%", width: "100%" }}
// // // // // //             zoomControl={false}
// // // // // //             ref={mapRef}
// // // // // //             whenReady={handleMapReady}
// // // // // //           >
// // // // // //             <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
// // // // // //             {boundaryData && (
// // // // // //               <GeoJSON
// // // // // //                 data={boundaryData}
// // // // // //                 style={styleBoundary}
// // // // // //                 onEachFeature={(feature, layer) => {
// // // // // //                   layer.on({
// // // // // //                     mouseover: (e: any) => {
// // // // // //                       const layer = e.target;
// // // // // //                       layer.setStyle({
// // // // // //                         weight: 3,
// // // // // //                         color: "#1a4971",
// // // // // //                         fillOpacity: 0.1,
// // // // // //                       });
// // // // // //                       layer.bringToFront();
// // // // // //                     },
// // // // // //                     mouseout: (e: any) => {
// // // // // //                       const layer = e.target;
// // // // // //                       layer.setStyle(styleBoundary());
// // // // // //                     },
// // // // // //                   });
// // // // // //                 }}
// // // // // //               />
// // // // // //             )}
// // // // // //             <GenericHeatMapLayer dataType={dataType} geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} setSelectedDate={handleDateChange} isLoading={isLoading} legendTitle={legendTitle} inputRef={inputRef} />
// // // // // //             {marker && (
// // // // // //               <Marker position={marker}>
// // // // // //                 <Popup>Lokasi Terpilih</Popup>
// // // // // //               </Marker>
// // // // // //             )}
// // // // // //           </MapContainer>
// // // // // //           <button onClick={() => setIsSplitView(!isSplitView)} className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700" title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}>
// // // // // //             {isSplitView ? "✕" : "📅"}
// // // // // //           </button>
// // // // // //         </div>
// // // // // //         {isSplitView && (
// // // // // //           <div className="w-full md:w-1/2 h-full overflow-auto">
// // // // // //             <Calendar showRightPanel={false} isSplitView={true} />
// // // // // //           </div>
// // // // // //         )}
// // // // // //       </div>
// // // // // //     </div>
// // // // // //   );
// // // // // // };

// // // // // // export default GenericMap;

// // // // // "use client";

// // // // // import React, { useState, useEffect, useRef } from "react";
// // // // // import dynamic from "next/dynamic";
// // // // // import "leaflet/dist/leaflet.css";
// // // // // import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// // // // // import SearchBar from "@/components/aod/SearchBar";
// // // // // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
// // // // // import * as L from "leaflet";

// // // // // const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
// // // // // const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
// // // // // const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
// // // // // const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
// // // // // const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });

// // // // // const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
// // // // //   ssr: false,
// // // // //   loading: () => <div className="h-full w-full flex items-center justify-center">Memuat kalender...</div>,
// // // // // });

// // // // // interface GenericMapProps {
// // // // //   dataType: "aod" | "pm25-est";
// // // // //   fetchUrl: string;
// // // // //   fetchByDateUrl: string;
// // // // //   legendTitle: string;
// // // // // }

// // // // // const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
// // // // //   const mapRef = useRef<L.Map | null>(null);
// // // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // // //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// // // // //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// // // // //   const [isLoading, setIsLoading] = useState(true);
// // // // //   const [error, setError] = useState<string | null>(null);
// // // // //   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
// // // // //   const [marker, setMarker] = useState<L.LatLng | null>(null);
// // // // //   const [isSplitView, setIsSplitView] = useState(false);

// // // // //   const updateMarker = (latlng: L.LatLng) => {
// // // // //     setMarker(latlng);
// // // // //   };

// // // // //   const fetchData = async (url: string, date?: string) => {
// // // // //     setIsLoading(true);
// // // // //     setError(null);
// // // // //     try {
// // // // //       const body = date ? JSON.stringify({ tanggal: date }) : undefined;
// // // // //       console.log(`Fetching ${dataType} data from ${url}${date ? ` with tanggal: ${date}` : ""}`);
// // // // //       console.log("Request body:", body);
// // // // //       const response = await fetch(url, {
// // // // //         method: date ? "POST" : "GET",
// // // // //         headers: date ? { "Content-Type": "application/json" } : undefined,
// // // // //         body,
// // // // //         cache: "no-store",
// // // // //       });
// // // // //       console.log("Response status:", response.status);
// // // // //       if (!response.ok) throw new Error(`Failed to fetch ${dataType} data: ${response.status}`);
// // // // //       const rawText = await response.text();
// // // // //       console.log("Response raw text:", rawText.slice(0, 300));
// // // // //       const cleanText = rawText.replace(/NaN/g, "null");
// // // // //       const data = JSON.parse(cleanText);
// // // // //       if (data.error) throw new Error(data.error || `Gagal memuat data ${dataType}`);
// // // // //       console.log(`Fetched ${dataType} data:`, JSON.stringify(data).slice(0, 300));
// // // // //       return data;
// // // // //     } catch (err) {
// // // // //       console.error(`Error fetching ${dataType} data:`, err);
// // // // //       throw new Error(err instanceof Error ? (err.message.includes("Tidak ada data") ? `Data ${dataType} pada tanggal ini tidak tersedia` : err.message) : "Terjadi kesalahan saat memuat data");
// // // // //     } finally {
// // // // //       setIsLoading(false);
// // // // //     }
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     const loadData = async () => {
// // // // //       try {
// // // // //         const [data, boundary] = await Promise.all([fetchData(fetchUrl), fetch("/data/batas_kelurahan_jakarta.geojson", { cache: "no-store" })]);
// // // // //         if (!boundary.ok) throw new Error(`Failed to fetch boundary data: ${boundary.status}`);
// // // // //         const boundaryData = await boundary.json();
// // // // //         console.log("Boundary data:", JSON.stringify(boundaryData).slice(0, 300));
// // // // //         console.log("Boundary features count:", boundaryData?.features?.length || 0);
// // // // //         setGeoData(data);
// // // // //         setBoundaryData(boundaryData);
// // // // //       } catch (err) {
// // // // //         console.error(`Error in loadData (${dataType}):`, err);
// // // // //         setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // //       }
// // // // //     };

// // // // //     loadData();
// // // // //   }, [fetchUrl, dataType, fetchData]);

// // // // //   useEffect(() => {
// // // // //     if (mapRef.current) {
// // // // //       setTimeout(() => mapRef.current?.invalidateSize(), 100);
// // // // //     }
// // // // //   }, [isSplitView]);

// // // // //   const handleDateChange = async (date: string) => {
// // // // //     setSelectedDate(date);
// // // // //     try {
// // // // //       const data = await fetchData(fetchByDateUrl, date);
// // // // //       setGeoData(data);
// // // // //     } catch (err) {
// // // // //       setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // // //     }
// // // // //   };

// // // // //   const handleMapReady = () => {
// // // // //     if (mapRef.current) {
// // // // //       mapRef.current.invalidateSize();
// // // // //     }
// // // // //   };

// // // // //   const styleBoundary = (): L.PathOptions => ({
// // // // //     weight: 2,
// // // // //     opacity: 1,
// // // // //     color: "#1a4971",
// // // // //     fillOpacity: 0.05,
// // // // //   });

// // // // //   return (
// // // // //     <div className="relative min-h-screen w-full flex flex-col">
// // // // //       <div className="absolute top-4 left-4 z-[1000]">
// // // // //         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// // // // //       </div>
// // // // //       {error && (
// // // // //         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
// // // // //           <span>{error}</span>
// // // // //           <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
// // // // //             Coba Lagi
// // // // //           </button>
// // // // //           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
// // // // //             Tutup
// // // // //           </button>
// // // // //         </div>
// // // // //       )}
// // // // //       <div className={`flex flex-col md:flex-row h-screen ${isSplitView ? "md:flex-row" : ""}`}>
// // // // //         <div className={`${isSplitView ? "w-full md:w-1/2" : "w-full"} h-full relative`}>
// // // // //           <MapContainer
// // // // //             center={[-6.1754, 106.8272]}
// // // // //             zoom={12}
// // // // //             minZoom={12}
// // // // //             maxZoom={16}
// // // // //             maxBounds={[
// // // // //               [-6.45, 106.55],
// // // // //               [-5.9, 107.15],
// // // // //             ]}
// // // // //             maxBoundsViscosity={1}
// // // // //             className="h-full w-full"
// // // // //             style={{ height: "100%", width: "100%" }}
// // // // //             zoomControl={false}
// // // // //             ref={mapRef}
// // // // //             whenReady={handleMapReady}
// // // // //           >
// // // // //             <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
// // // // //             {boundaryData && (
// // // // //               <GeoJSON
// // // // //                 data={boundaryData}
// // // // //                 style={styleBoundary}
// // // // //                 onEachFeature={(feature, layer) => {
// // // // //                   layer.on({
// // // // //                     mouseover: (e: L.LeafletEvent) => {
// // // // //                       const layer = e.target as L.Layer;
// // // // //                       layer.setStyle({
// // // // //                         weight: 3,
// // // // //                         color: "#1a4971",
// // // // //                         fillOpacity: 0.1,
// // // // //                       });
// // // // //                       layer.bringToFront();
// // // // //                     },
// // // // //                     mouseout: (e: L.LeafletEvent) => {
// // // // //                       const layer = e.target as L.Layer;
// // // // //                       layer.setStyle(styleBoundary());
// // // // //                     },
// // // // //                   });
// // // // //                 }}
// // // // //               />
// // // // //             )}
// // // // //             <GenericHeatMapLayer dataType={dataType} geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} setSelectedDate={handleDateChange} isLoading={isLoading} legendTitle={legendTitle} inputRef={inputRef} />
// // // // //             {marker && (
// // // // //               <Marker position={marker}>
// // // // //                 <Popup>Lokasi Terpilih</Popup>
// // // // //               </Marker>
// // // // //             )}
// // // // //           </MapContainer>
// // // // //           <button onClick={() => setIsSplitView(!isSplitView)} className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700" title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}>
// // // // //             {isSplitView ? "✕" : "📅"}
// // // // //           </button>
// // // // //         </div>
// // // // //         {isSplitView && (
// // // // //           <div className="w-full md:w-1/2 h-full overflow-auto">
// // // // //             <Calendar showRightPanel={false} isSplitView={true} />
// // // // //           </div>
// // // // //         )}
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default GenericMap;

// // // // "use client";

// // // // import React, { useState, useEffect, useRef } from "react";
// // // // import dynamic from "next/dynamic";
// // // // import "leaflet/dist/leaflet.css";
// // // // import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// // // // import SearchBar from "@/components/aod/SearchBar";
// // // // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
// // // // import * as L from "leaflet";

// // // // const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
// // // // const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
// // // // const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
// // // // const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
// // // // const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });

// // // // const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
// // // //   ssr: false,
// // // //   loading: () => <div className="h-full w-full flex items-center justify-center">Memuat kalender...</div>,
// // // // });

// // // // interface GenericMapProps {
// // // //   dataType: "aod" | "pm25-est";
// // // //   fetchUrl: string;
// // // //   fetchByDateUrl: string;
// // // //   legendTitle: string;
// // // // }

// // // // const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
// // // //   const mapRef = useRef<L.Map | null>(null);
// // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// // // //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// // // //   const [isLoading, setIsLoading] = useState(true);
// // // //   const [error, setError] = useState<string | null>(null);
// // // //   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
// // // //   const [marker, setMarker] = useState<L.LatLng | null>(null);
// // // //   const [isSplitView, setIsSplitView] = useState(false);

// // // //   const updateMarker = (latlng: L.LatLng) => {
// // // //     setMarker(latlng);
// // // //   };

// // // //   const fetchData = async (url: string, date?: string) => {
// // // //     setIsLoading(true);
// // // //     setError(null);
// // // //     try {
// // // //       const body = date ? JSON.stringify({ tanggal: date }) : undefined;
// // // //       console.log(`Fetching ${dataType} data from ${url}${date ? ` with tanggal: ${date}` : ""}`);
// // // //       console.log("Request body:", body);
// // // //       const response = await fetch(url, {
// // // //         method: date ? "POST" : "GET",
// // // //         headers: date ? { "Content-Type": "application/json" } : undefined,
// // // //         body,
// // // //         cache: "no-store",
// // // //       });
// // // //       console.log("Response status:", response.status);
// // // //       if (!response.ok) throw new Error(`Failed to fetch ${dataType} data: ${response.status}`);
// // // //       const rawText = await response.text();
// // // //       console.log("Response raw text:", rawText.slice(0, 300));
// // // //       const cleanText = rawText.replace(/NaN/g, "null");
// // // //       const data = JSON.parse(cleanText);
// // // //       if (data.error) throw new Error(data.error || `Gagal memuat data ${dataType}`);
// // // //       console.log(`Fetched ${dataType} data:`, JSON.stringify(data).slice(0, 300));
// // // //       return data;
// // // //     } catch (err) {
// // // //       console.error(`Error fetching ${dataType} data:`, err);
// // // //       throw new Error(err instanceof Error ? (err.message.includes("Tidak ada data") ? `Data ${dataType} pada tanggal ini tidak tersedia` : err.message) : "Terjadi kesalahan saat memuat data");
// // // //     } finally {
// // // //       setIsLoading(false);
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     const loadData = async () => {
// // // //       try {
// // // //         const [data, boundary] = await Promise.all([fetchData(fetchUrl), fetch("/data/batas_kelurahan_jakarta.geojson", { cache: "no-store" })]);
// // // //         if (!boundary.ok) throw new Error(`Failed to fetch boundary data: ${boundary.status}`);
// // // //         const boundaryData = await boundary.json();
// // // //         console.log("Boundary data:", JSON.stringify(boundaryData).slice(0, 300));
// // // //         console.log("Boundary features count:", boundaryData?.features?.length || 0);
// // // //         setGeoData(data);
// // // //         setBoundaryData(boundaryData);
// // // //       } catch (err) {
// // // //         console.error(`Error in loadData (${dataType}):`, err);
// // // //         setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // //       }
// // // //     };

// // // //     loadData();
// // // //   }, [fetchUrl, dataType, fetchData]);

// // // //   useEffect(() => {
// // // //     if (mapRef.current) {
// // // //       setTimeout(() => mapRef.current?.invalidateSize(), 100);
// // // //     }
// // // //   }, [isSplitView]);

// // // //   const handleDateChange = async (date: string) => {
// // // //     setSelectedDate(date);
// // // //     try {
// // // //       const data = await fetchData(fetchByDateUrl, date);
// // // //       setGeoData(data);
// // // //     } catch (err) {
// // // //       setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // // //     }
// // // //   };

// // // //   const handleMapReady = () => {
// // // //     if (mapRef.current) {
// // // //       mapRef.current.invalidateSize();
// // // //     }
// // // //   };

// // // //   const styleBoundary = (): L.PathOptions => ({
// // // //     weight: 2,
// // // //     opacity: 1,
// // // //     color: "#1a4971",
// // // //     fillOpacity: 0.05,
// // // //   });

// // // //   return (
// // // //     <div className="relative min-h-screen w-full flex flex-col">
// // // //       <div className="absolute top-4 left-4 z-[1000]">
// // // //         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// // // //       </div>
// // // //       {error && (
// // // //         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
// // // //           <span>{error}</span>
// // // //           <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
// // // //             Coba Lagi
// // // //           </button>
// // // //           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
// // // //             Tutup
// // // //           </button>
// // // //         </div>
// // // //       )}
// // // //       <div className={`flex flex-col md:flex-row h-screen ${isSplitView ? "md:flex-row" : ""}`}>
// // // //         <div className={`${isSplitView ? "w-full md:w-1/2" : "w-full"} h-full relative`}>
// // // //           <MapContainer
// // // //             center={[-6.1754, 106.8272]}
// // // //             zoom={12}
// // // //             minZoom={12}
// // // //             maxZoom={16}
// // // //             maxBounds={[
// // // //               [-6.45, 106.55],
// // // //               [-5.9, 107.15],
// // // //             ]}
// // // //             maxBoundsViscosity={1}
// // // //             className="h-full w-full"
// // // //             style={{ height: "100%", width: "100%" }}
// // // //             zoomControl={false}
// // // //             ref={mapRef}
// // // //             whenReady={handleMapReady}
// // // //           >
// // // //             <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
// // // //             {boundaryData && (
// // // //               <GeoJSON
// // // //                 data={boundaryData}
// // // //                 style={styleBoundary}
// // // //                 onEachFeature={(feature, layer: L.GeoJSON) => {
// // // //                   layer.on({
// // // //                     mouseover: () => {
// // // //                       layer.setStyle({
// // // //                         weight: 3,
// // // //                         color: "#1a4971",
// // // //                         fillOpacity: 0.1,
// // // //                       });
// // // //                       layer.bringToFront();
// // // //                     },
// // // //                     mouseout: () => {
// // // //                       layer.setStyle(styleBoundary());
// // // //                     },
// // // //                   });
// // // //                 }}
// // // //               />
// // // //             )}
// // // //             <GenericHeatMapLayer dataType={dataType} geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} setSelectedDate={handleDateChange} isLoading={isLoading} legendTitle={legendTitle} inputRef={inputRef} />
// // // //             {marker && (
// // // //               <Marker position={marker}>
// // // //                 <Popup>Lokasi Terpilih</Popup>
// // // //               </Marker>
// // // //             )}
// // // //           </MapContainer>
// // // //           <button onClick={() => setIsSplitView(!isSplitView)} className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700" title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}>
// // // //             {isSplitView ? "✕" : "📅"}
// // // //           </button>
// // // //         </div>
// // // //         {isSplitView && (
// // // //           <div className="w-full md:w-1/2 h-full overflow-auto">
// // // //             <Calendar showRightPanel={false} isSplitView={true} />
// // // //           </div>
// // // //         )}
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default GenericMap;

// // // "use client";

// // // import React, { useState, useEffect, useRef, useCallback } from "react";
// // // import dynamic from "next/dynamic";
// // // import "leaflet/dist/leaflet.css";
// // // import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// // // import SearchBar from "@/components/aod/SearchBar";
// // // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
// // // import * as L from "leaflet";
// // // import { getBoundaryStyle } from "@/utils/map";

// // // const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
// // // const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
// // // const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
// // // const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
// // // const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });

// // // const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
// // //   ssr: false,
// // //   loading: () => <div className="h-full w-full flex items-center justify-center">Memuat kalender...</div>,
// // // });

// // // interface GenericMapProps {
// // //   dataType: "aod" | "pm25-est";
// // //   fetchUrl: string;
// // //   fetchByDateUrl: string;
// // //   legendTitle: string;
// // // }

// // // const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
// // //   const mapRef = useRef<L.Map | null>(null);
// // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// // //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// // //   const [isLoading, setIsLoading] = useState(true);
// // //   const [error, setError] = useState<string | null>(null);
// // //   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
// // //   const [marker, setMarker] = useState<L.LatLng | null>(null);
// // //   const [isSplitView, setIsSplitView] = useState(false);

// // //   const updateMarker = (latlng: L.LatLng) => {
// // //     setMarker(latlng);
// // //   };

// // //   const fetchData = useCallback(
// // //     async (url: string, date?: string) => {
// // //       setIsLoading(true);
// // //       setError(null);
// // //       try {
// // //         const body = date ? JSON.stringify({ tanggal: date }) : undefined;
// // //         console.log(`Fetching ${dataType} data from ${url}${date ? ` with tanggal: ${date}` : ""}`);
// // //         console.log("Request body:", body);
// // //         const response = await fetch(url, {
// // //           method: date ? "POST" : "GET",
// // //           headers: date ? { "Content-Type": "application/json" } : undefined,
// // //           body,
// // //           cache: "no-store",
// // //         });
// // //         console.log("Response status:", response.status);
// // //         if (!response.ok) throw new Error(`Failed to fetch ${dataType} data: ${response.status}`);
// // //         const rawText = await response.text();
// // //         console.log("Response raw text:", rawText.slice(0, 300));
// // //         const cleanText = rawText.replace(/NaN/g, "null");
// // //         const data = JSON.parse(cleanText);
// // //         if (data.error) throw new Error(data.error || `Gagal memuat data ${dataType}`);
// // //         console.log(`Fetched ${dataType} data:`, JSON.stringify(data).slice(0, 300));
// // //         return data;
// // //       } catch (err) {
// // //         console.error(`Error fetching ${dataType} data:`, err);
// // //         throw new Error(err instanceof Error ? (err.message.includes("Tidak ada data") ? `Data ${dataType} pada tanggal ini tidak tersedia` : err.message) : "Terjadi kesalahan saat memuat data");
// // //       } finally {
// // //         setIsLoading(false);
// // //       }
// // //     },
// // //     [dataType, setIsLoading, setError]
// // //   );

// // //   useEffect(() => {
// // //     const loadData = async () => {
// // //       try {
// // //         const [data, boundary] = await Promise.all([fetchData(fetchUrl), fetch("/data/batas_kelurahan_jakarta.geojson", { cache: "no-store" })]);
// // //         if (!boundary.ok) throw new Error(`Failed to fetch boundary data: ${boundary.status}`);
// // //         const boundaryData = await boundary.json();
// // //         console.log("Boundary data:", JSON.stringify(boundaryData).slice(0, 300));
// // //         console.log("Boundary features count:", boundaryData?.features?.length || 0);
// // //         setGeoData(data);
// // //         setBoundaryData(boundaryData);
// // //       } catch (err) {
// // //         console.error(`Error in loadData (${dataType}):`, err);
// // //         setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // //       }
// // //     };

// // //     loadData();
// // //   }, [fetchUrl, dataType, fetchData]);

// // //   useEffect(() => {
// // //     if (mapRef.current) {
// // //       setTimeout(() => mapRef.current?.invalidateSize(), 100);
// // //     }
// // //   }, [isSplitView]);

// // //   const handleDateChange = async (date: string) => {
// // //     setSelectedDate(date);
// // //     try {
// // //       const data = await fetchData(fetchByDateUrl, date);
// // //       setGeoData(data);
// // //     } catch (err) {
// // //       setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// // //     }
// // //   };

// // //   const handleMapReady = () => {
// // //     if (mapRef.current) {
// // //       mapRef.current.invalidateSize();
// // //     }
// // //   };

// // //   const styleBoundary = (): L.PathOptions => ({
// // //     weight: 2,
// // //     opacity: 1,
// // //     color: "#1a4971",
// // //     fillOpacity: 0.05,
// // //   });

// // //   return (
// // //     <div className="relative min-h-screen w-full flex flex-col">
// // //       <div className="absolute top-4 left-4 z-[1000]">
// // //         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// // //       </div>
// // //       {error && (
// // //         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
// // //           <span>{error}</span>
// // //           <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
// // //             Coba Lagi
// // //           </button>
// // //           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
// // //             Tutup
// // //           </button>
// // //         </div>
// // //       )}
// // //       <div className={`flex flex-col md:flex-row h-screen ${isSplitView ? "md:flex-row" : ""}`}>
// // //         <div className={`${isSplitView ? "w-full md:w-1/2" : "w-full"} h-full relative`}>
// // //           <MapContainer
// // //             center={[-6.1754, 106.8272]}
// // //             zoom={12}
// // //             minZoom={12}
// // //             maxZoom={16}
// // //             maxBounds={[
// // //               [-6.45, 106.55],
// // //               [-5.9, 107.15],
// // //             ]}
// // //             maxBoundsViscosity={1}
// // //             className="h-full w-full"
// // //             style={{ height: "100%", width: "100%" }}
// // //             zoomControl={false}
// // //             ref={mapRef}
// // //             whenReady={handleMapReady}
// // //           >
// // //             <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
// // //             {boundaryData && (
// // //               <GeoJSON
// // //                 data={boundaryData}
// // //                 style={getBoundaryStyle}
// // //                 onEachFeature={(feature, layer: L.GeoJSON) => {
// // //                   layer.on({
// // //                     mouseover: () => {
// // //                       layer.setStyle({
// // //                         weight: 1.2,
// // //                         color: "#1a4971",
// // //                         fillOpacity: 0.1,
// // //                       });
// // //                       layer.bringToFront();
// // //                     },
// // //                     mouseout: () => {
// // //                       layer.setStyle(getBoundaryStyle());
// // //                     },
// // //                   });
// // //                 }}
// // //               />
// // //             )}
// // //             <GenericHeatMapLayer dataType={dataType} geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} setSelectedDate={handleDateChange} isLoading={isLoading} legendTitle={legendTitle} inputRef={inputRef} />
// // //             {marker && (
// // //               <Marker position={marker}>
// // //                 <Popup>Lokasi Terpilih</Popup>
// // //               </Marker>
// // //             )}
// // //           </MapContainer>
// // //           <button onClick={() => setIsSplitView(!isSplitView)} className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700" title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}>
// // //             {isSplitView ? "✕" : "📅"}
// // //           </button>
// // //         </div>
// // //         {isSplitView && (
// // //           <div className="w-full md:w-1/2 h-full overflow-auto">
// // //             <Calendar showRightPanel={false} isSplitView={true} />
// // //           </div>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default GenericMap;

// // "use client";

// // import React, { useState, useEffect, useRef, useCallback } from "react";
// // import dynamic from "next/dynamic";
// // import "leaflet/dist/leaflet.css";
// // import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// // import SearchBar from "@/components/aod/SearchBar";
// // import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
// // import * as L from "leaflet";
// // import { getBoundaryStyle } from "@/utils/map";

// // const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
// // const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
// // const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
// // const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
// // const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });

// // const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
// //   ssr: false,
// //   loading: () => <div className="h-full w-full flex items-center justify-center">Memuat kalender...</div>,
// // });

// // interface GenericMapProps {
// //   dataType: "aod" | "pm25-est";
// //   fetchUrl: string;
// //   fetchByDateUrl: string;
// //   legendTitle: string;
// // }

// // const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
// //   const mapRef = useRef<L.Map | null>(null);
// //   const containerRef = useRef<HTMLDivElement | null>(null); // Tambahkan containerRef
// //   const inputRef = useRef<HTMLInputElement | null>(null);
// //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);
// //   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
// //   const [marker, setMarker] = useState<L.LatLng | null>(null);
// //   const [isSplitView, setIsSplitView] = useState(false);

// //   const updateMarker = (latlng: L.LatLng) => {
// //     setMarker(latlng);
// //   };

// //   const fetchData = useCallback(
// //     async (url: string, date?: string) => {
// //       setIsLoading(true);
// //       setError(null);
// //       try {
// //         const body = date ? JSON.stringify({ tanggal: date }) : undefined;
// //         console.log(`Fetching ${dataType} data from ${url}${date ? ` with tanggal: ${date}` : ""}`);
// //         console.log("Request body:", body);
// //         const response = await fetch(url, {
// //           method: date ? "POST" : "GET",
// //           headers: date ? { "Content-Type": "application/json" } : undefined,
// //           body,
// //           cache: "no-store",
// //         });
// //         console.log("Response status:", response.status);
// //         if (!response.ok) throw new Error(`Failed to fetch ${dataType} data: ${response.status}`);
// //         const rawText = await response.text();
// //         console.log("Response raw text:", rawText.slice(0, 300));
// //         const cleanText = rawText.replace(/NaN/g, "null");
// //         const data = JSON.parse(cleanText);
// //         if (data.error) throw new Error(data.error || `Gagal memuat data ${dataType}`);
// //         console.log(`Fetched ${dataType} data:`, JSON.stringify(data).slice(0, 300));
// //         return data;
// //       } catch (err) {
// //         console.error(`Error fetching ${dataType} data:`, err);
// //         throw new Error(err instanceof Error ? (err.message.includes("Tidak ada data") ? `Data ${dataType} pada tanggal ini tidak tersedia` : err.message) : "Terjadi kesalahan saat memuat data");
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     },
// //     [dataType]
// //   );

// //   useEffect(() => {
// //     const loadData = async () => {
// //       try {
// //         const [data, boundary] = await Promise.all([fetchData(fetchUrl), fetch("/data/batas_kelurahan_jakarta.geojson", { cache: "no-store" })]);
// //         if (!boundary.ok) throw new Error(`Failed to fetch boundary data: ${boundary.status}`);
// //         const boundaryData = await boundary.json();
// //         console.log("Boundary data:", JSON.stringify(boundaryData).slice(0, 300));
// //         console.log("Boundary features count:", boundaryData?.features?.length || 0);
// //         setGeoData(data);
// //         setBoundaryData(boundaryData);
// //       } catch (err) {
// //         console.error(`Error in loadData (${dataType}):`, err);
// //         setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// //       }
// //     };

// //     loadData();
// //   }, [fetchUrl, dataType, fetchData]);

// //   // Cleanup instance peta saat komponen di-unmount
// //   useEffect(() => {
// //     return () => {
// //       if (mapRef.current) {
// //         try {
// //           mapRef.current.remove();
// //           mapRef.current = null;
// //           console.log("Map instance cleaned up in GenericMap");
// //         } catch (err) {
// //           console.error("Error during map cleanup in GenericMap:", err);
// //         }
// //       }
// //     };
// //   }, []);

// //   useEffect(() => {
// //     if (mapRef.current) {
// //       setTimeout(() => mapRef.current?.invalidateSize(), 100);
// //     }
// //   }, [isSplitView]);

// //   const handleDateChange = async (date: string) => {
// //     setSelectedDate(date);
// //     try {
// //       const data = await fetchData(fetchByDateUrl, date);
// //       setGeoData(data);
// //     } catch (err) {
// //       setError(err instanceof Error ? err.message : "Terjadi kesalahan");
// //     }
// //   };

// //   const handleMapReady = () => {
// //     if (mapRef.current) {
// //       mapRef.current.invalidateSize();
// //       console.log("Map initialized in GenericMap");
// //     }
// //   };

// //   return (
// //     <div ref={containerRef} className="relative min-h-screen w-full flex flex-col">
// //       <div className="absolute top-4 left-4 z-[1000]">
// //         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// //       </div>
// //       {error && (
// //         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
// //           <span>{error}</span>
// //           <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
// //             Coba Lagi
// //           </button>
// //           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
// //             Tutup
// //           </button>
// //         </div>
// //       )}
// //       <div className={`flex flex-col md:flex-row h-screen ${isSplitView ? "md:flex-row" : ""}`}>
// //         <div className={`${isSplitView ? "w-full md:w-1/2" : "w-full"} h-full relative`}>
// //           <MapContainer
// //             center={[-6.1754, 106.8272]}
// //             zoom={12}
// //             minZoom={12}
// //             maxZoom={16}
// //             maxBounds={[
// //               [-6.45, 106.55],
// //               [-5.9, 107.15],
// //             ]}
// //             maxBoundsViscosity={1}
// //             className="h-full w-full"
// //             style={{ height: "100%", width: "100%" }}
// //             zoomControl={false}
// //             ref={mapRef}
// //             whenReady={handleMapReady}
// //           >
// //             <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
// //             {boundaryData && (
// //               <GeoJSON
// //                 data={boundaryData}
// //                 style={getBoundaryStyle}
// //                 onEachFeature={(feature, layer: L.GeoJSON) => {
// //                   layer.on({
// //                     mouseover: () => {
// //                       layer.setStyle({
// //                         weight: 1.2,
// //                         color: "#1a4971",
// //                         fillOpacity: 0.1,
// //                       });
// //                       layer.bringToFront();
// //                     },
// //                     mouseout: () => {
// //                       layer.setStyle(getBoundaryStyle());
// //                     },
// //                   });
// //                 }}
// //               />
// //             )}
// //             <GenericHeatMapLayer
// //               dataType={dataType}
// //               geoData={geoData}
// //               boundaryData={boundaryData}
// //               selectedDate={selectedDate}
// //               setSelectedDate={handleDateChange}
// //               isLoading={isLoading}
// //               legendTitle={legendTitle}
// //               inputRef={inputRef}
// //             />
// //             {marker && (
// //               <Marker position={marker}>
// //                 <Popup>Lokasi Terpilih</Popup>
// //               </Marker>
// //             )}
// //           </MapContainer>
// //           <button
// //             onClick={() => setIsSplitView(!isSplitView)}
// //             className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
// //             title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}
// //           >
// //             {isSplitView ? "✕" : "📅"}
// //           </button>
// //         </div>
// //         {isSplitView && (
// //           <div className="w-full md:w-1/2 h-full overflow-auto">
// //             <Calendar showRightPanel={false} isSplitView={true} />
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default GenericMap;

// "use client";

// import React, { useState, useEffect, useRef, useCallback } from "react";
// import dynamic from "next/dynamic";
// import "leaflet/dist/leaflet.css";
// import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
// import SearchBar from "@/components/aod/SearchBar";
// import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
// import * as L from "leaflet";
// import { getBoundaryStyle } from "@/utils/map";

// const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
// const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
// const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
// const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
// const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });

// interface GenericMapProps {
//   dataType: "aod" | "pm25-est";
//   fetchUrl: string;
//   fetchByDateUrl: string;
//   legendTitle: string;
// }

// const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
//   const mapRef = useRef<L.Map | null>(null);
//   const inputRef = useRef<HTMLInputElement | null>(null);
//   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
//   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
//   const [marker, setMarker] = useState<L.LatLng | null>(null);

//   const updateMarker = (latlng: L.LatLng) => {
//     setMarker(latlng);
//   };

//   const fetchData = useCallback(
//     async (url: string, date?: string) => {
//       setIsLoading(true);
//       setError(null);
//       setGeoData(null); // Reset geoData saat fetch baru
//       try {
//         const body = date ? JSON.stringify({ tanggal: date }) : undefined;
//         const response = await fetch(url, {
//           method: date ? "POST" : "GET",
//           headers: date ? { "Content-Type": "application/json" } : undefined,
//           body,
//           cache: "no-store",
//         });
//         if (!response.ok) throw new Error(`Failed to fetch ${dataType} data: ${response.status}`);
//         const rawText = await response.text();
//         const cleanText = rawText.replace(/NaN/g, "null");
//         const data = JSON.parse(cleanText);
//         if (data.error) throw new Error(data.error || `Gagal memuat data ${dataType}`);

//         // Cek apakah semua nilai data bernilai 0
//         const allZero = data.features?.every((f: any) => {
//           const value = dataType === "aod" ? f.properties.aod_value : f.properties.pm25_value;
//           return value === 0 || value === null;
//         });

//         if (!data.features || data.features.length === 0) {
//           throw new Error(`Data ${dataType} pada tanggal yang dipilih tidak tersedia`);
//         }
//         if (allZero) {
//           throw new Error(`Data ${dataType} pada tanggal yang dipilih bernilai 0.0`);
//         }

//         setGeoData(data);
//       } catch (err) {
//         setGeoData(null);
//         setError(err instanceof Error ? (err.message.includes("Tidak ada data") || err.message.includes("bernila 0.0") ? err.message : `Gagal memuat data ${dataType}: ${err.message}`) : "Terjadi kesalahan saat memuat data");
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [dataType]
//   );

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const [data, boundary] = await Promise.all([fetchData(fetchUrl), fetch("/data/batas_kelurahan_jakarta.geojson", { cache: "no-store" })]);
//         if (!boundary.ok) throw new Error(`Failed to fetch boundary data: ${boundary.status}`);
//         const boundaryData = await boundary.json();
//         setBoundaryData(boundaryData);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Terjadi kesalahan");
//       }
//     };

//     loadData();
//   }, [fetchUrl, dataType, fetchData]);

//   useEffect(() => {
//     return () => {
//       if (mapRef.current) {
//         try {
//           mapRef.current.remove();
//           mapRef.current = null;
//         } catch (err) {
//           console.error("Error during map cleanup:", err);
//         }
//       }
//     };
//   }, []);

//   const handleDateChange = async (date: string) => {
//     setSelectedDate(date);
//     await fetchData(fetchByDateUrl, date);
//   };

//   const handleMapReady = () => {
//     if (mapRef.current) {
//       mapRef.current.invalidateSize();
//     }
//   };

//   return (
//     <div className="relative min-h-screen w-full flex flex-col">
//       <div className="absolute top-16 left-4 z-[1000]">
//         <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
//       </div>
//       {error && (
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
//           <span>{error}</span>
//           <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
//             Coba Lagi
//           </button>
//           <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
//             Tutup
//           </button>
//         </div>
//       )}
//       <MapContainer
//         center={[-6.1754, 106.8272]}
//         zoom={12}
//         minZoom={12}
//         maxZoom={16}
//         maxBounds={[
//           [-6.45, 106.55],
//           [-5.9, 107.15],
//         ]}
//         maxBoundsViscosity={1}
//         className="h-full w-full"
//         style={{ height: "100vh", width: "100%", minHeight: "400px" }} // Tambahkan minHeight
//         zoomControl={false}
//         ref={mapRef}
//         whenReady={() => {
//           console.log("MapContainer rendered"); // Tambahkan log
//           handleMapReady();
//         }}
//       >
//         <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
//         {boundaryData && (
//           <GeoJSON
//             data={boundaryData}
//             style={getBoundaryStyle}
//             onEachFeature={(feature, layer: L.GeoJSON) => {
//               layer.on({
//                 mouseover: () => {
//                   layer.setStyle({
//                     weight: 1.2,
//                     color: "#1a4971",
//                     fillOpacity: 0.1,
//                   });
//                   layer.bringToFront();
//                 },
//                 mouseout: () => {
//                   layer.setStyle(getBoundaryStyle());
//                 },
//               });
//             }}
//           />
//         )}
//         <GenericHeatMapLayer dataType={dataType} geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} setSelectedDate={handleDateChange} isLoading={isLoading} legendTitle={legendTitle} inputRef={inputRef} />
//         {marker && (
//           <Marker position={marker}>
//             <Popup>Lokasi Terpilih</Popup>
//           </Marker>
//         )}
//       </MapContainer>
//     </div>
//   );
// };

// export default GenericMap;

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
import SearchBar from "@/components/aod/SearchBar";
import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
import * as L from "leaflet";
import { getBoundaryStyle } from "@/utils/map";

// Definisi ikon kustom untuk marker
const customIcon = L.icon({
  iconUrl: "/images/marker_lokasi.png", // Path ke gambar marker
  iconSize: [38, 38], // Ukuran ikon (lebar, tinggi)
  iconAnchor: [19, 38], // Titik anchor ikon (tengah bawah)
  popupAnchor: [0, -38], // Titik anchor popup (di atas marker)
});

// Impor dinamis untuk komponen react-leaflet agar aman untuk SSR
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });

interface GenericMapProps {
  dataType: "aod" | "pm25-est";
  fetchUrl: string;
  fetchByDateUrl: string;
  legendTitle: string;
}

const GenericMap: React.FC<GenericMapProps> = ({ dataType, fetchUrl, fetchByDateUrl, legendTitle }) => {
  const mapRef = useRef<L.Map | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
  const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [markerPosition, setMarkerPosition] = useState<L.LatLng | null>(null); // Ubah dari 'marker' ke 'markerPosition'

  const updateMarker = (latlng: L.LatLng) => {
    setMarkerPosition(latlng); // Memperbarui posisi marker
  };

  const fetchData = useCallback(
    async (url: string, date?: string) => {
      setIsLoading(true);
      setError(null);
      setGeoData(null); // Reset geoData saat fetch baru
      try {
        const body = date ? JSON.stringify({ tanggal: date }) : undefined;
        const response = await fetch(url, {
          method: date ? "POST" : "GET",
          headers: date ? { "Content-Type": "application/json" } : undefined,
          body,
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`Failed to fetch ${dataType} data: ${response.status}`);
        const rawText = await response.text();
        const cleanText = rawText.replace(/NaN/g, "null");
        const data = JSON.parse(cleanText);
        if (data.error) throw new Error(data.error || `Gagal memuat data ${dataType}`);

        // Cek apakah semua nilai data bernilai 0
        const allZero = data.features?.every((f: any) => {
          const value = dataType === "aod" ? f.properties.aod_value : f.properties.pm25_value;
          return value === 0 || value === null;
        });

        if (!data.features || data.features.length === 0) {
          throw new Error(`Data ${dataType} pada tanggal yang dipilih tidak tersedia`);
        }
        if (allZero) {
          throw new Error(`Data ${dataType} pada tanggal yang dipilih bernilai 0.0`);
        }

        setGeoData(data);
      } catch (err) {
        setGeoData(null);
        setError(err instanceof Error ? (err.message.includes("Tidak ada data") || err.message.includes("bernilai 0.0") ? err.message : `Gagal memuat data ${dataType}: ${err.message}`) : "Terjadi kesalahan saat memuat data");
      } finally {
        setIsLoading(false);
      }
    },
    [dataType]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const [data, boundary] = await Promise.all([fetchData(fetchUrl), fetch("/data/batas_kelurahan_jakarta.geojson", { cache: "no-store" })]);
        if (!boundary.ok) throw new Error(`Failed to fetch boundary data: ${boundary.status}`);
        const boundaryData = await boundary.json();
        setBoundaryData(boundaryData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      }
    };

    loadData();
  }, [fetchUrl, dataType, fetchData]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
          mapRef.current = null;
        } catch (err) {
          console.error("Error during map cleanup:", err);
        }
      }
    };
  }, []);

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    await fetchData(fetchByDateUrl, date);
  };

  const handleMapReady = () => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      <div className="absolute top-16 left-4 z-[1000]">
        <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
      </div>
      {error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
          <span>{error}</span>
          {/* <button onClick={() => fetchData(fetchUrl)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
            Coba Lagi
          </button>
          <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
            Tutup
          </button> */}
        </div>
      )}
      <MapContainer
        center={[-6.1754, 106.8272]}
        zoom={12}
        minZoom={12}
        maxZoom={16}
        maxBounds={[
          [-6.45, 106.55],
          [-5.9, 107.15],
        ]}
        maxBoundsViscosity={1}
        className="h-full w-full"
        style={{ height: "100vh", width: "100%", minHeight: "400px" }}
        zoomControl={false}
        ref={mapRef}
        whenReady={() => {
          console.log("MapContainer rendered");
          handleMapReady();
        }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
        {boundaryData && (
          <GeoJSON
            data={boundaryData}
            style={getBoundaryStyle}
            onEachFeature={(feature, layer: L.GeoJSON) => {
              layer.on({
                mouseover: () => {
                  layer.setStyle({
                    weight: 1.2,
                    color: "#1a4971",
                    fillOpacity: 0.1,
                  });
                  layer.bringToFront();
                },
                mouseout: () => {
                  layer.setStyle(getBoundaryStyle());
                },
              });
            }}
          />
        )}
        <GenericHeatMapLayer dataType={dataType} geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} setSelectedDate={handleDateChange} isLoading={isLoading} legendTitle={legendTitle} inputRef={inputRef} />
        {markerPosition && (
          <Marker position={markerPosition} icon={customIcon}>
            <Popup>
              Lokasi yang dipilih: <br />
              Lat: {markerPosition.lat.toFixed(4)}, Lng: {markerPosition.lng.toFixed(4)}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default GenericMap;
