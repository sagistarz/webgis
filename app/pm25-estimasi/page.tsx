// // "use client";

// // import { useEffect, useRef, useState, useMemo, useCallback } from "react";
// // import { MapContainer, TileLayer, useMap, GeoJSON } from "react-leaflet";
// // import L from "leaflet";
// // import "leaflet/dist/leaflet.css";
// // import "leaflet.heat";
// // import Navbar from "../components/navbar/page";
// // import styles from "./map.module.css";
// // import HeatMapLayer from "./HeatMapLayer";
// // import SearchBar from "../components/aod/SearchBar";
// // import * as turf from "@turf/turf";

// // interface FeatureProperties {
// //   pm25_value: number;
// // }

// // interface BoundaryProperties {
// //   NAMOBJ: string;
// // }

// // interface Feature {
// //   type: string;
// //   id: number;
// //   properties: FeatureProperties;
// //   geometry: turf.Polygon | turf.MultiPolygon;
// // }

// // interface BoundaryFeature {
// //   type: string;
// //   properties: BoundaryProperties;
// //   geometry: turf.Polygon | turf.MultiPolygon;
// // }

// // interface GeoJSONData {
// //   type: string;
// //   features: Feature[];
// // }

// // interface BoundaryGeoJSONData {
// //   type: string;
// //   features: BoundaryFeature[];
// // }

// // const JakartaMapPM25 = () => {
// //   const mapRef = useRef<L.Map | null>(null);
// //   const markerRef = useRef<L.Marker | null>(null);
// //   const inputRef = useRef<HTMLInputElement | null>(null);
// //   const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
// //   const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [error, setError] = useState<string | null>(null);
// //   const [selectedDate, setSelectedDate] = useState<string>("");

// //   const stableGeoData = useMemo(() => geoData, [geoData]);
// //   const stableBoundaryData = useMemo(() => boundaryData, [boundaryData]);

// //   const getTodayDate = () => {
// //     const today = new Date();
// //     return today.toISOString().split("T")[0];
// //   };

// //   const updateMarker = useCallback((latlng: L.LatLng) => {
// //     if (markerRef.current) {
// //       markerRef.current.remove();
// //       markerRef.current = null;
// //     }
// //     markerRef.current = L.marker(latlng, {
// //       icon: L.divIcon({
// //         html: '<div style="font-size:24px">📍</div>',
// //         className: "emoji-marker",
// //         iconSize: [24, 24],
// //         iconAnchor: [12, 24],
// //       }),
// //     }).addTo(mapRef.current!);
// //   }, []);

// //   const clearMarker = useCallback(() => {
// //     if (markerRef.current) {
// //       markerRef.current.remove();
// //       markerRef.current = null;
// //     }
// //     if (mapRef.current) {
// //       mapRef.current.setView([-6.1754, 106.8272], 12);
// //     }
// //   }, []);

// //   const fetchData = async (date?: string) => {
// //     setIsLoading(true);
// //     setError(null); // Reset error state sebelum fetch
// //     try {
// //       let pm25Response;
// //       const today = getTodayDate();
// //       if (!date || date === today) {
// //         pm25Response = await fetch("/api/pm25-est", { cache: "no-store" });
// //       } else {
// //         pm25Response = await fetch("/api/pm25-est/pm25-est-by-date", {
// //           method: "POST",
// //           headers: {
// //             "Content-Type": "application/json",
// //           },
// //           body: JSON.stringify({ tanggal: date }),
// //         });
// //       }

// //       if (!pm25Response.ok) {
// //         throw new Error("Data pada tanggal ini tidak tersedia");
// //       }
// //       const pm25Data = await pm25Response.json();

// //       if (!pm25Data.features || pm25Data.features.length === 0) {
// //         throw new Error("Data pada tanggal ini tidak tersedia");
// //       }

// //       setGeoData(pm25Data);

// //       const boundaryResponse = await fetch("/data/batas_kelurahan_jakarta.geojson");
// //       if (!boundaryResponse.ok) throw new Error("Gagal memuat data batas kelurahan");
// //       const boundaryData = await boundaryResponse.json();
// //       setBoundaryData(boundaryData);
// //     } catch (error) {
// //       setError(error instanceof Error ? error.message : "Data pada tanggal ini tidak tersedia");
// //       setGeoData(null);
// //       setBoundaryData(null);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchData();
// //   }, []);

// //   const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const date = e.target.value;
// //     setSelectedDate(date);
// //     clearMarker();
// //     fetchData(date);
// //   };

// //   const handleCloseError = () => {
// //     setError(null); // Menutup overlay error
// //   };

// //   const MapHandler = () => {
// //     const map = useMap();

// //     useEffect(() => {
// //       mapRef.current = map;
// //       const stopKeyboardPropagation = (e: L.LeafletKeyboardEvent) => {
// //         if (inputRef.current === document.activeElement) {
// //           e.originalEvent.stopPropagation();
// //         }
// //       };

// //       map.addEventListener("keydown", stopKeyboardPropagation);
// //       return () => {
// //         map.removeEventListener("keydown", stopKeyboardPropagation);
// //         mapRef.current = null;
// //       };
// //     }, [map]);

// //     return null;
// //   };

// //   const styleBoundary = () => ({
// //     weight: 1,
// //     opacity: 0.8,
// //     color: "#4a90e2",
// //     fillOpacity: 0,
// //   });

// //   return (
// //     <>
// //       <Navbar />
// //       <div className={`${styles.mapContainer} relative h-full w-full bg-gray-100`}>
// //         <div className="absolute top-16 mt-2 left-4 z-[1100] flex flex-col gap-4">
// //           <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-md">
// //             <label htmlFor="dateInput" className="text-sm font-medium text-black">
// //               Pilih Tanggal:
// //             </label>
// //             <input
// //               id="dateInput"
// //               type="date"
// //               value={selectedDate}
// //               onChange={handleDateChange}
// //               className="border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
// //               max={getTodayDate()}
// //             />
// //           </div>
// //           <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
// //         </div>
// //         {isLoading && (
// //           <div className={styles.spinnerOverlay}>
// //             <div className={styles.spinner}></div>
// //             <p>Memuat data...</p>
// //           </div>
// //         )}
// //         {error && (
// //           <div className="absolute inset-0 flex items-center justify-center z-[1000]">
// //             <div className="bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded-lg shadow-md max-w-md text-center flex items-center gap-4">
// //               <p className="font-medium">{error}</p>
// //               <button onClick={handleCloseError} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
// //                 Tutup
// //               </button>
// //             </div>
// //           </div>
// //         )}
// //         <MapContainer
// //           center={[-6.1754, 106.8272]}
// //           zoom={12}
// //           className={styles.map}
// //           zoomControl={false}
// //           minZoom={11}
// //           maxZoom={18}
// //           maxBounds={[
// //             [-6.42, 106.64],
// //             [-5.98, 107.05],
// //           ]}
// //           maxBoundsViscosity={1.0}
// //         >
// //           <MapHandler />
// //           <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/">CARTO</a>' />
// //           {geoData && boundaryData && <HeatMapLayer geoData={stableGeoData} boundaryData={stableBoundaryData} selectedDate={selectedDate} isLoading={isLoading} inputRef={inputRef} />}
// //           {boundaryData && (
// //             <GeoJSON
// //               data={boundaryData as any}
// //               style={styleBoundary}
// //               onEachFeature={(feature, layer) => {
// //                 layer.on({
// //                   mouseover: (e) => {
// //                     const layer = e.target;
// //                     layer.setStyle({
// //                       weight: 2,
// //                       color: "#2b6cb0",
// //                       fillOpacity: 0.1,
// //                     });
// //                     layer.bringToFront();
// //                   },
// //                   mouseout: (e) => {
// //                     const layer = e.target;
// //                     layer.setStyle({
// //                       weight: 1,
// //                       color: "#4a90e2",
// //                       fillOpacity: 0,
// //                     });
// //                   },
// //                 });
// //               }}
// //             />
// //           )}
// //         </MapContainer>
// //       </div>
// //     </>
// //   );
// // };

// // export default JakartaMapPM25;

// "use client";

// import { useEffect, useRef, useState, useMemo, useCallback } from "react";
// import { MapContainer, TileLayer, useMap, GeoJSON } from "react-leaflet";
// import { GeoJsonObject } from "geojson";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import "leaflet.heat";
// import Navbar from "../components/navbar/Navbar";
// import styles from "./map.module.css";
// import HeatMapLayer from "./HeatMapLayer";
// import SearchBar from "../components/aod/SearchBar";
// import * as turf from "@turf/turf";

// interface FeatureProperties {
//   pm25_value: number;
// }

// interface BoundaryProperties {
//   NAMOBJ: string;
// }

// interface Feature {
//   type: string;
//   id: number;
//   properties: FeatureProperties;
//   geometry: turf.Polygon | turf.MultiPolygon;
// }

// interface BoundaryFeature {
//   type: string;
//   properties: BoundaryProperties;
//   geometry: turf.Polygon | turf.MultiPolygon;
// }

// interface GeoJSONData {
//   type: string;
//   features: Feature[];
// }

// interface BoundaryGeoJSONData {
//   type: string;
//   features: BoundaryFeature[];
// }

// const JakartaMapPM25 = () => {
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
//       let pm25Response;
//       const today = getTodayDate();
//       if (!date || date === today) {
//         pm25Response = await fetch("/api/pm25-est", { cache: "no-store" });
//       } else {
//         pm25Response = await fetch("/api/pm25-est/pm25-est-by-date", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ tanggal: date }),
//         });
//       }

//       if (!pm25Response.ok) {
//         throw new Error("Data pada tanggal ini tidak tersedia");
//       }
//       const pm25Data = await pm25Response.json();

//       if (!pm25Data.features || pm25Data.features.length === 0) {
//         throw new Error("Data pada tanggal ini tidak tersedia");
//       }

//       setGeoData(pm25Data);

//       const boundaryResponse = await fetch("/data/batas_kelurahan_jakarta.geojson");
//       if (!boundaryResponse.ok) throw new Error("Gagal memuat data batas kelurahan");
//       const boundaryData = await boundaryResponse.json();
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
//         >
//           <MapHandler />
//           <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/">CARTO</a>' />
//           {geoData && boundaryData && <HeatMapLayer geoData={stableGeoData} boundaryData={stableBoundaryData} selectedDate={selectedDate} isLoading={isLoading} inputRef={inputRef} />}
//           {boundaryData && (
//             <GeoJSON
//               data={boundaryData as GeoJsonObject}
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

// export default JakartaMapPM25;

"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Navbar from "../components/navbar/Navbar";
import styles from "./map.module.css";
import dynamic from "next/dynamic";
import SearchBar from "../components/aod/SearchBar";
import L from "leaflet";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className={`${styles.mapContainer} flex items-center justify-center h-full bg-white`}>
      <div className="flex flex-col items-center gap-4">
        <div className={styles.spinner}></div>
        <span className="text-lg font-medium text-gray-700">Memuat peta...</span>
      </div>
    </div>
  ),
});

const JakartaMapPM25 = () => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [geoData, setGeoData] = useState<any | null>(null);
  const [boundaryData, setBoundaryData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const updateMarker = useCallback((latlng: L.LatLng) => {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    markerRef.current = L.marker(latlng, {
      icon: L.divIcon({
        html: '<div style="font-size:24px">📍</div>',
        className: "emoji-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      }),
    }).addTo(mapRef.current!);
    mapRef.current?.setView(latlng, 14); // Zoom ke lokasi marker
  }, []);

  const clearMarker = useCallback(() => {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (mapRef.current) {
      mapRef.current.setView([-6.1754, 106.8272], 12); // Reset ke posisi awal
    }
  }, []);

  const fetchData = useCallback(async (date?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      let pm25Response;
      const today = getTodayDate();
      if (!date || date === today) {
        pm25Response = await fetch("/api/pm25-est", { cache: "no-store" });
      } else {
        pm25Response = await fetch("/api/pm25-est/pm25-est-by-date", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tanggal: date }),
        });
      }

      if (!pm25Response.ok) {
        throw new Error("Data pada tanggal ini tidak tersedia");
      }
      const pm25Data = await pm25Response.json();

      if (!pm25Data.features || pm25Data.features.length === 0) {
        throw new Error("Data pada tanggal ini tidak tersedia");
      }

      setGeoData(pm25Data);

      const boundaryResponse = await fetch("/data/batas_kelurahan_jakarta.geojson");
      if (!boundaryResponse.ok) throw new Error("Gagal memuat data batas kelurahan");
      const boundaryData = await boundaryResponse.json();
      setBoundaryData(boundaryData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Data pada tanggal ini tidak tersedia");
      setGeoData(null);
      setBoundaryData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    clearMarker();
    fetchData(date);
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <>
      <Navbar />
      <div className={`${styles.mapContainer} relative h-full w-full bg-gray-100`}>
        <div className="absolute top-16 mt-2 left-4 z-[1100] flex flex-col gap-4">
          <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-md">
            <label htmlFor="dateInput" className="text-sm font-medium text-black">
              Pilih Tanggal:
            </label>
            <input
              id="dateInput"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              max={getTodayDate()}
            />
          </div>
          <SearchBar updateMarker={updateMarker} mapRef={mapRef} />
        </div>
        {isLoading && (
          <div className={styles.spinnerOverlay}>
            <div className={styles.spinner}></div>
            <p>Memuat data...</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-[1000]">
            <div className="bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded-lg shadow-md max-w-md text-center flex items-center gap-4">
              <p className="font-medium">{error}</p>
              <button onClick={handleCloseError} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
                Tutup
              </button>
            </div>
          </div>
        )}
        <Map geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} isLoading={isLoading} mapRef={mapRef} />
      </div>
    </>
  );
};

export default JakartaMapPM25;
