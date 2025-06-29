// "use client";

// import { useEffect, useRef, useState, useMemo, useCallback } from "react";
// import { useMap, MapContainer, TileLayer, GeoJSON } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import Navbar from "@/components/navbar/Navbar";
// import HeatMapLayer from "./HeatMapLayer";
// import SearchBar from "./SearchBar";
// import styles from "../../styles/aod.module.css";
// import { GeoJSONData, BoundaryGeoJSONData } from "./types";

// const JakartaMap = () => {
//   const mapRef = useRef<L.Map | null>(null);
//   const markerRef = useRef<L.Marker | null>(null);
//   const inputRef = useRef<HTMLInputElement | null>(null);
//   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
//   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedDate, setSelectedDate] = useState<string>("");

//   const stableGeoData = useMemo(() => geoData, [geoData]);
//   const stableBoundaryData = useMemo(() => boundaryData, [boundaryData]);

//   const getTodayDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   const updateMarker = useCallback((latlng: L.LatLng) => {
//     if (markerRef.current) {
//       markerRef.current.remove();
//       markerRef.current = null;
//     }
//     markerRef.current = L.marker(latlng, {
//       icon: L.divIcon({
//         html: '<div style="font-size:24px">📍</div>',
//         className: "emoji-marker",
//         iconSize: [24, 24],
//         iconAnchor: [12, 24],
//       }),
//     }).addTo(mapRef.current!);
//     mapRef.current?.setView(latlng, 14);
//   }, []);

//   const clearMarker = useCallback(() => {
//     if (markerRef.current) {
//       markerRef.current.remove();
//       markerRef.current = null;
//     }
//     if (mapRef.current) {
//       mapRef.current.setView([-6.1754, 106.8272], 12);
//     }
//   }, []);

//   const fetchData = useCallback(async (date?: string) => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       let aodResponse;
//       const today = getTodayDate();
//       if (!date || date === today) {
//         aodResponse = await fetch("/api/aod", { cache: "no-store" });
//       } else {
//         aodResponse = await fetch("/api/aod/aod-by-date", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ tanggal: date }),
//         });
//       }

//       if (!aodResponse.ok) {
//         throw new Error("Data pada tanggal ini tidak tersedia");
//       }
//       const aodData: GeoJSONData = await aodResponse.json();
//       console.log("fetchData: aodData:", JSON.stringify(aodData, null, 2));
//       console.log(
//         "fetchData: aod_values:",
//         aodData.features.map((f) => f.properties.aod_value)
//       );

//       if (aodData.type !== "FeatureCollection" || !Array.isArray(aodData.features)) {
//         throw new Error("Format data GeoJSON tidak valid");
//       }
//       if (aodData.features.some((f) => f.type !== "Feature" || (f.geometry.type !== "Polygon" && f.geometry.type !== "MultiPolygon"))) {
//         throw new Error("Beberapa fitur GeoJSON memiliki tipe geometri yang tidak valid");
//       }

//       if (!aodData.features || aodData.features.length === 0) {
//         throw new Error("Data pada tanggal ini tidak tersedia");
//       }

//       const allZero = aodData.features.every((feature) => feature.properties.aod_value === 0 || feature.properties.aod_value == null);
//       if (allZero) {
//         throw new Error("Data pada tanggal ini bernilai 0.00 atau kosong");
//       }

//       setGeoData(aodData);

//       const boundaryResponse = await fetch("/data/batas_kelurahan_jakarta.geojson");
//       if (!boundaryResponse.ok) throw new Error("Gagal memuat data batas kelurahan");
//       const boundaryData: BoundaryGeoJSONData = await boundaryResponse.json();
//       console.log("fetchData: boundaryData:", JSON.stringify(boundaryData, null, 2));

//       if (boundaryData.type !== "FeatureCollection" || !Array.isArray(boundaryData.features)) {
//         throw new Error("Format data batas kelurahan GeoJSON tidak valid");
//       }
//       if (boundaryData.features.some((f) => f.type !== "Feature" || (f.geometry.type !== "Polygon" && f.geometry.type !== "MultiPolygon"))) {
//         throw new Error("Beberapa fitur batas kelurahan memiliki tipe geometri yang tidak valid");
//       }

//       setBoundaryData(boundaryData);
//     } catch (error) {
//       setError(error instanceof Error ? error.message : "Data pada tanggal ini tidak tersedia");
//       setGeoData(null);
//       setBoundaryData(null);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const date = e.target.value;
//     setSelectedDate(date);
//     clearMarker();
//     fetchData(date);
//   };

//   const handleCloseError = () => {
//     setError(null);
//   };

//   const MapHandler = () => {
//     const map = useMap();

//     useEffect(() => {
//       mapRef.current = map;
//       const stopKeyboardPropagation = (e: L.LeafletKeyboardEvent) => {
//         if (inputRef.current === document.activeElement) {
//           e.originalEvent.stopPropagation();
//         }
//       };

//       map.addEventListener("keydown", stopKeyboardPropagation);
//       return () => {
//         map.removeEventListener("keydown", stopKeyboardPropagation);
//         mapRef.current = null;
//       };
//     }, [map]);

//     return null;
//   };

//   const styleBoundary = () => ({
//     weight: 1,
//     opacity: 0.8,
//     color: "#4a90e2",
//     fillOpacity: 0,
//   });

//   return (
//     <>
//       <Navbar />
//       <div className={`${styles.mapContainer} relative h-full w-full bg-gray-100`}>
//         <div className="absolute top-16 mt-2 left-4 z-[1100] flex flex-col gap-4">
//           <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-md">
//             <label htmlFor="dateInput" className="text-sm font-medium text-black">
//               Pilih Tanggal:
//             </label>
//             <input
//               id="dateInput"
//               type="date"
//               value={selectedDate}
//               onChange={handleDateChange}
//               className="border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
//               max={getTodayDate()}
//               ref={inputRef}
//             />
//           </div>
//           <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
//         </div>
//         {isLoading && (
//           <div className={styles.spinnerOverlay}>
//             <div className={styles.spinner}></div>
//             <p>Memuat data...</p>
//           </div>
//         )}
//         {error && (
//           <div className="absolute inset-0 flex items-center justify-center z-[1000]">
//             <div className="bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded-lg shadow-md max-w-md text-center flex items-center gap-4">
//               <p className="font-medium">{error}</p>
//               <button onClick={handleCloseError} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
//                 Tutup
//               </button>
//             </div>
//           </div>
//         )}
//         <MapContainer
//           center={[-6.1754, 106.8272]}
//           zoom={12}
//           className={styles.map}
//           zoomControl={false}
//           minZoom={11}
//           maxZoom={18}
//           maxBounds={[
//             [-6.42, 106.64],
//             [-5.98, 107.05],
//           ]}
//           maxBoundsViscosity={1.0}
//           style={{ height: "100vh", width: "100%" }}
//         >
//           <MapHandler />
//           <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/">CARTO</a>' maxZoom={18} tileSize={256} detectRetina={true} />
//           {stableGeoData && stableBoundaryData && <HeatMapLayer geoData={stableGeoData} boundaryData={stableBoundaryData} selectedDate={selectedDate} isLoading={isLoading} inputRef={inputRef} />}
//           {stableBoundaryData && (
//             <GeoJSON
//               data={stableBoundaryData}
//               style={styleBoundary}
//               onEachFeature={(feature, layer) => {
//                 layer.on({
//                   mouseover: (e) => {
//                     const layer = e.target;
//                     layer.setStyle({
//                       weight: 2,
//                       color: "#2b6cb0",
//                       fillOpacity: 0.1,
//                     });
//                     layer.bringToFront();
//                   },
//                   mouseout: (e) => {
//                     const layer = e.target;
//                     layer.setStyle({
//                       weight: 1,
//                       color: "#4a90e2",
//                       fillOpacity: 0,
//                     });
//                   },
//                 });
//               }}
//             />
//           )}
//         </MapContainer>
//       </div>
//     </>
//   );
// };

// export default JakartaMap;
