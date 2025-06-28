// // // // // // // // // "use client";

// // // // // // // // // import React, { useRef, useEffect } from "react";
// // // // // // // // // import { MapContainer, TileLayer, useMap, GeoJSON } from "react-leaflet";
// // // // // // // // // import L from "leaflet";
// // // // // // // // // import "leaflet/dist/leaflet.css";
// // // // // // // // // import "leaflet.heat";
// // // // // // // // // import styles from "./map.module.css";
// // // // // // // // // import HeatMapLayer from "./HeatMapLayer";

// // // // // // // // // interface MapProps {
// // // // // // // // //   geoData: any | null;
// // // // // // // // //   boundaryData: any | null;
// // // // // // // // //   selectedDate: string;
// // // // // // // // //   isLoading: boolean;
// // // // // // // // // }

// // // // // // // // // const Map: React.FC<MapProps> = ({ geoData, boundaryData, selectedDate, isLoading }) => {
// // // // // // // // //   const mapRef = useRef<L.Map | null>(null);
// // // // // // // // //   const inputRef = useRef<HTMLInputElement | null>(null);

// // // // // // // // //   const MapHandler = () => {
// // // // // // // // //     const map = useMap();

// // // // // // // // //     useEffect(() => {
// // // // // // // // //       mapRef.current = map;
// // // // // // // // //       const stopKeyboardPropagation = (e: L.LeafletKeyboardEvent) => {
// // // // // // // // //         if (inputRef.current === document.activeElement) {
// // // // // // // // //           e.originalEvent.stopPropagation();
// // // // // // // // //         }
// // // // // // // // //       };

// // // // // // // // //       map.addEventListener("keydown", stopKeyboardPropagation);
// // // // // // // // //       return () => {
// // // // // // // // //         map.removeEventListener("keydown", stopKeyboardPropagation);
// // // // // // // // //         mapRef.current = null;
// // // // // // // // //       };
// // // // // // // // //     }, [map]);

// // // // // // // // //     return null;
// // // // // // // // //   };

// // // // // // // // //   const styleBoundary = () => ({
// // // // // // // // //     weight: 1,
// // // // // // // // //     opacity: 0.8,
// // // // // // // // //     color: "#4a90e2",
// // // // // // // // //     fillOpacity: 0,
// // // // // // // // //   });

// // // // // // // // //   return (
// // // // // // // // //     <MapContainer
// // // // // // // // //       center={[-6.1754, 106.8272]}
// // // // // // // // //       zoom={12}
// // // // // // // // //       className={styles.map}
// // // // // // // // //       zoomControl={false}
// // // // // // // // //       minZoom={11}
// // // // // // // // //       maxZoom={18}
// // // // // // // // //       maxBounds={[
// // // // // // // // //         [-6.42, 106.64],
// // // // // // // // //         [-5.98, 107.05],
// // // // // // // // //       ]}
// // // // // // // // //       maxBoundsViscosity={1.0}
// // // // // // // // //     >
// // // // // // // // //       <MapHandler />
// // // // // // // // //       <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/">CARTO</a>' />
// // // // // // // // //       {geoData && boundaryData && <HeatMapLayer geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} isLoading={isLoading} inputRef={inputRef} />}
// // // // // // // // //       {boundaryData && (
// // // // // // // // //         <GeoJSON
// // // // // // // // //           data={boundaryData}
// // // // // // // // //           style={styleBoundary}
// // // // // // // // //           onEachFeature={(feature, layer) => {
// // // // // // // // //             layer.on({
// // // // // // // // //               mouseover: (e) => {
// // // // // // // // //                 const layer = e.target;
// // // // // // // // //                 layer.setStyle({
// // // // // // // // //                   weight: 2,
// // // // // // // // //                   color: "#2b6cb0",
// // // // // // // // //                   fillOpacity: 0.1,
// // // // // // // // //                 });
// // // // // // // // //                 layer.bringToFront();
// // // // // // // // //               },
// // // // // // // // //               mouseout: (e) => {
// // // // // // // // //                 const layer = e.target;
// // // // // // // // //                 layer.setStyle({
// // // // // // // // //                   weight: 1,
// // // // // // // // //                   color: "#4a90e2",
// // // // // // // // //                   fillOpacity: 0,
// // // // // // // // //                 });
// // // // // // // // //               },
// // // // // // // // //             });
// // // // // // // // //           }}
// // // // // // // // //         />
// // // // // // // // //       )}
// // // // // // // // //     </MapContainer>
// // // // // // // // //   );
// // // // // // // // // };

// // // // // // // // // export default Map;

// // // // // // // // "use client";

// // // // // // // // import React, { useRef, useEffect } from "react";
// // // // // // // // import { MapContainer, TileLayer, useMap, GeoJSON } from "react-leaflet";
// // // // // // // // import L from "leaflet";
// // // // // // // // import "leaflet/dist/leaflet.css";
// // // // // // // // import "leaflet.heat";
// // // // // // // // import styles from "./map.module.css";
// // // // // // // // import HeatMapLayer from "./HeatMapLayer";

// // // // // // // // interface MapProps {
// // // // // // // //   geoData: any | null;
// // // // // // // //   boundaryData: any | null;
// // // // // // // //   selectedDate: string;
// // // // // // // //   isLoading: boolean;
// // // // // // // //   mapRef: React.MutableRefObject<L.Map | null>;
// // // // // // // // }

// // // // // // // // const Map: React.FC<MapProps> = ({ geoData, boundaryData, selectedDate, isLoading, mapRef }) => {
// // // // // // // //   const inputRef = useRef<HTMLInputElement | null>(null);

// // // // // // // //   const MapHandler = () => {
// // // // // // // //     const map = useMap();

// // // // // // // //     useEffect(() => {
// // // // // // // //       mapRef.current = map;
// // // // // // // //       const stopKeyboardPropagation = (e: L.LeafletKeyboardEvent) => {
// // // // // // // //         if (inputRef.current === document.activeElement) {
// // // // // // // //           e.originalEvent.stopPropagation();
// // // // // // // //         }
// // // // // // // //       };

// // // // // // // //       map.addEventListener("keydown", stopKeyboardPropagation);
// // // // // // // //       return () => {
// // // // // // // //         map.removeEventListener("keydown", stopKeyboardPropagation);
// // // // // // // //         mapRef.current = null;
// // // // // // // //       };
// // // // // // // //     }, [map]);

// // // // // // // //     return null;
// // // // // // // //   };

// // // // // // // //   const styleBoundary = () => ({
// // // // // // // //     weight: 1,
// // // // // // // //     opacity: 0.8,
// // // // // // // //     color: "#4a90e2",
// // // // // // // //     fillOpacity: 0,
// // // // // // // //   });

// // // // // // // //   return (
// // // // // // // //     <MapContainer
// // // // // // // //       center={[-6.1754, 106.8272]}
// // // // // // // //       zoom={12}
// // // // // // // //       className={styles.map}
// // // // // // // //       zoomControl={false}
// // // // // // // //       minZoom={11}
// // // // // // // //       maxZoom={18}
// // // // // // // //       maxBounds={[
// // // // // // // //         [-6.42, 106.64],
// // // // // // // //         [-5.98, 107.05],
// // // // // // // //       ]}
// // // // // // // //       maxBoundsViscosity={1.0}
// // // // // // // //     >
// // // // // // // //       <MapHandler />
// // // // // // // //       <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/">CARTO</a>' />
// // // // // // // //       {geoData && boundaryData && <HeatMapLayer geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} isLoading={isLoading} inputRef={inputRef} />}
// // // // // // // //       {boundaryData && (
// // // // // // // //         <GeoJSON
// // // // // // // //           data={boundaryData}
// // // // // // // //           style={styleBoundary}
// // // // // // // //           onEachFeature={(feature, layer) => {
// // // // // // // //             layer.on({
// // // // // // // //               mouseover: (e) => {
// // // // // // // //                 const layer = e.target;
// // // // // // // //                 layer.setStyle({
// // // // // // // //                   weight: 2,
// // // // // // // //                   color: "#2b6cb0",
// // // // // // // //                   fillOpacity: 0.1,
// // // // // // // //                 });
// // // // // // // //                 layer.bringToFront();
// // // // // // // //               },
// // // // // // // //               mouseout: (e) => {
// // // // // // // //                 const layer = e.target;
// // // // // // // //                 layer.setStyle({
// // // // // // // //                   weight: 1,
// // // // // // // //                   color: "#4a90e2",
// // // // // // // //                   fillOpacity: 0,
// // // // // // // //                 });
// // // // // // // //               },
// // // // // // // //             });
// // // // // // // //           }}
// // // // // // // //         />
// // // // // // // //       )}
// // // // // // // //     </MapContainer>
// // // // // // // //   );
// // // // // // // // };

// // // // // // // // export default Map;

// // // // // // // "use client";

// // // // // // // import React, { useRef, useEffect } from "react";
// // // // // // // import { MapContainer, TileLayer, useMap, GeoJSON } from "react-leaflet";
// // // // // // // import L from "leaflet";
// // // // // // // import "leaflet/dist/leaflet.css";
// // // // // // // import "leaflet.heat";
// // // // // // // import styles from "./map.module.css";
// // // // // // // import HeatMapLayer from "./HeatMapLayer";

// // // // // // // // Impor tipe dari HeatMapLayer untuk konsistensi
// // // // // // // import { GeoJSONData, BoundaryGeoJSONData } from "./HeatMapLayer";

// // // // // // // interface MapProps {
// // // // // // //   geoData: GeoJSONData | null;
// // // // // // //   boundaryData: BoundaryGeoJSONData | null;
// // // // // // //   selectedDate: string;
// // // // // // //   isLoading: boolean;
// // // // // // //   mapRef: React.MutableRefObject<L.Map | null>;
// // // // // // // }

// // // // // // // const Map: React.FC<MapProps> = ({ geoData, boundaryData, selectedDate, isLoading, mapRef }) => {
// // // // // // //   const inputRef = useRef<HTMLInputElement>(null!); // Konsisten dengan HeatMapLayer

// // // // // // //   const MapHandler = () => {
// // // // // // //     const map = useMap();

// // // // // // //     useEffect(() => {
// // // // // // //       mapRef.current = map;
// // // // // // //       const stopKeyboardPropagation = (e: L.LeafletKeyboardEvent) => {
// // // // // // //         if (inputRef.current === document.activeElement) {
// // // // // // //           e.originalEvent.stopPropagation();
// // // // // // //         }
// // // // // // //       };

// // // // // // //       map.addEventListener("keydown", stopKeyboardPropagation);
// // // // // // //       return () => {
// // // // // // //         map.removeEventListener("keydown", stopKeyboardPropagation);
// // // // // // //         mapRef.current = null;
// // // // // // //       };
// // // // // // //     }, [map]);

// // // // // // //     return null;
// // // // // // //   };

// // // // // // //   const styleBoundary = () => ({
// // // // // // //     weight: 1,
// // // // // // //     opacity: 0.8,
// // // // // // //     color: "#4a90e2",
// // // // // // //     fillOpacity: 0,
// // // // // // //   });

// // // // // // //   return (
// // // // // // //     <MapContainer
// // // // // // //       center={[-6.1754, 106.8272]}
// // // // // // //       zoom={12}
// // // // // // //       className={styles.map}
// // // // // // //       zoomControl={false}
// // // // // // //       minZoom={11}
// // // // // // //       maxZoom={18}
// // // // // // //       maxBounds={[
// // // // // // //         [-6.42, 106.64],
// // // // // // //         [-5.98, 107.05],
// // // // // // //       ]}
// // // // // // //       maxBoundsViscosity={1.0}
// // // // // // //     >
// // // // // // //       <MapHandler />
// // // // // // //       <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/">CARTO</a>' />
// // // // // // //       {geoData && boundaryData && <HeatMapLayer geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} isLoading={isLoading} inputRef={inputRef} />}
// // // // // // //       {boundaryData && (
// // // // // // //         <GeoJSON
// // // // // // //           data={boundaryData}
// // // // // // //           style={styleBoundary}
// // // // // // //           onEachFeature={(feature, layer) => {
// // // // // // //             layer.on({
// // // // // // //               mouseover: (e) => {
// // // // // // //                 const layer = e.target;
// // // // // // //                 layer.setStyle({
// // // // // // //                   weight: 2,
// // // // // // //                   color: "#2b6cb0",
// // // // // // //                   fillOpacity: 0.1,
// // // // // // //                 });
// // // // // // //                 layer.bringToFront();
// // // // // // //               },
// // // // // // //               mouseout: (e) => {
// // // // // // //                 const layer = e.target;
// // // // // // //                 layer.setStyle({
// // // // // // //                   weight: 1,
// // // // // // //                   color: "#4a90e2",
// // // // // // //                   fillOpacity: 0,
// // // // // // //                 });
// // // // // // //               },
// // // // // // //             });
// // // // // // //           }}
// // // // // // //         />
// // // // // // //       )}
// // // // // // //     </MapContainer>
// // // // // // //   );
// // // // // // // };

// // // // // // // export default Map;

// // // // // // "use client";

// // // // // // import React, { useRef, useEffect } from "react";
// // // // // // import { MapContainer, TileLayer, useMap, GeoJSON } from "react-leaflet";
// // // // // // import L from "leaflet";
// // // // // // import "leaflet/dist/leaflet.css";
// // // // // // import "leaflet.heat";
// // // // // // import styles from "./map.module.css";
// // // // // // import HeatMapLayer from "./HeatMapLayer";
// // // // // // import { GeoJSONData, BoundaryGeoJSONData } from "./types";

// // // // // // interface MapProps {
// // // // // //   geoData: GeoJSONData | null;
// // // // // //   boundaryData: BoundaryGeoJSONData | null;
// // // // // //   selectedDate: string;
// // // // // //   isLoading: boolean;
// // // // // //   mapRef: React.MutableRefObject<L.Map | null>;
// // // // // // }

// // // // // // const Map: React.FC<MapProps> = ({ geoData, boundaryData, selectedDate, isLoading, mapRef }) => {
// // // // // //   const inputRef = useRef<HTMLInputElement>(null!);

// // // // // //   const MapHandler = () => {
// // // // // //     const map = useMap();

// // // // // //     useEffect(() => {
// // // // // //       mapRef.current = map;
// // // // // //       const stopKeyboardPropagation = (e: L.LeafletKeyboardEvent) => {
// // // // // //         if (inputRef.current === document.activeElement) {
// // // // // //           e.originalEvent.stopPropagation();
// // // // // //         }
// // // // // //       };

// // // // // //       map.addEventListener("keydown", stopKeyboardPropagation);
// // // // // //       return () => {
// // // // // //         map.removeEventListener("keydown", stopKeyboardPropagation);
// // // // // //         mapRef.current = null;
// // // // // //       };
// // // // // //     }, [map]);

// // // // // //     return null;
// // // // // //   };

// // // // // //   const styleBoundary = () => ({
// // // // // //     weight: 1,
// // // // // //     opacity: 0.8,
// // // // // //     color: "#4a90e2",
// // // // // //     fillOpacity: 0,
// // // // // //   });

// // // // // //   return (
// // // // // //     <MapContainer
// // // // // //       center={[-6.1754, 106.8272]}
// // // // // //       zoom={12}
// // // // // //       className={styles.map}
// // // // // //       zoomControl={false}
// // // // // //       minZoom={11}
// // // // // //       maxZoom={18}
// // // // // //       maxBounds={[
// // // // // //         [-6.42, 106.64],
// // // // // //         [-5.98, 107.05],
// // // // // //       ]}
// // // // // //       maxBoundsViscosity={1.0}
// // // // // //     >
// // // // // //       <MapHandler />
// // // // // //       <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/">CARTO</a>' />
// // // // // //       {geoData && boundaryData && <HeatMapLayer geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} isLoading={isLoading} inputRef={inputRef} />}
// // // // // //       {boundaryData && (
// // // // // //         <GeoJSON
// // // // // //           data={boundaryData}
// // // // // //           style={styleBoundary}
// // // // // //           onEachFeature={(feature, layer) => {
// // // // // //             layer.on({
// // // // // //               mouseover: (e) => {
// // // // // //                 const layer = e.target;
// // // // // //                 layer.setStyle({
// // // // // //                   weight: 2,
// // // // // //                   color: "#2b6cb0",
// // // // // //                   fillOpacity: 0.1,
// // // // // //                 });
// // // // // //                 layer.bringToFront();
// // // // // //               },
// // // // // //               mouseout: (e) => {
// // // // // //                 const layer = e.target;
// // // // // //                 layer.setStyle({
// // // // // //                   weight: 1,
// // // // // //                   color: "#4a90e2",
// // // // // //                   fillOpacity: 0,
// // // // // //                 });
// // // // // //               },
// // // // // //             });
// // // // // //           }}
// // // // // //         />
// // // // // //       )}
// // // // // //     </MapContainer>
// // // // // //   );
// // // // // // };

// // // // // // export default Map;

// // // // // "use client";

// // // // // import React from "react";
// // // // // import dynamic from "next/dynamic";
// // // // // import L from "leaflet";
// // // // // import "leaflet/dist/leaflet.css";
// // // // // import styles from "./map.module.css";
// // // // // import HeatMapLayer from "./HeatMapLayer";
// // // // // import { GeoJSONData, BoundaryGeoJSONData } from "./types";

// // // // // // Impor komponen react-leaflet secara dinamis
// // // // // const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
// // // // //   ssr: false,
// // // // // });
// // // // // const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {
// // // // //   ssr: false,
// // // // // });
// // // // // const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), {
// // // // //   ssr: false,
// // // // // });
// // // // // const useMap = dynamic(() => import("react-leaflet").then((mod) => mod.useMap), {
// // // // //   ssr: false,
// // // // // });

// // // // // interface MapProps {
// // // // //   geoData: GeoJSONData | null;
// // // // //   boundaryData: BoundaryGeoJSONData | null;
// // // // //   selectedDate: string;
// // // // //   isLoading: boolean;
// // // // //   mapRef: React.MutableRefObject<L.Map | null>;
// // // // //   inputRef: React.RefObject<HTMLInputElement>;
// // // // // }

// // // // // const MapHandler: React.FC<{ mapRef: React.MutableRefObject<L.Map | null>; inputRef: React.RefObject<HTMLInputElement> }> = ({ mapRef, inputRef }) => {
// // // // //   const map = useMap();

// // // // //   React.useEffect(() => {
// // // // //     mapRef.current = map;
// // // // //     const stopKeyboardPropagation = (e: L.LeafletKeyboardEvent) => {
// // // // //       if (inputRef.current === document.activeElement) {
// // // // //         e.originalEvent.stopPropagation();
// // // // //       }
// // // // //     };

// // // // //     map.addEventListener("keydown", stopKeyboardPropagation);
// // // // //     return () => {
// // // // //       map.removeEventListener("keydown", stopKeyboardPropagation);
// // // // //       mapRef.current = null;
// // // // //     };
// // // // //   }, [map, mapRef, inputRef]);

// // // // //   return null;
// // // // // };

// // // // // const Map: React.FC<MapProps> = ({ geoData, boundaryData, selectedDate, isLoading, mapRef, inputRef }) => {
// // // // //   const styleBoundary = () => ({
// // // // //     weight: 1,
// // // // //     opacity: 0.8,
// // // // //     color: "#4a90e2",
// // // // //     fillOpacity: 0,
// // // // //   });

// // // // //   return (
// // // // //     <MapContainer
// // // // //       center={[-6.1754, 106.8272]}
// // // // //       zoom={12}
// // // // //       className={styles.map}
// // // // //       zoomControl={false}
// // // // //       minZoom={11}
// // // // //       maxZoom={18}
// // // // //       maxBounds={[
// // // // //         [-6.42, 106.64],
// // // // //         [-5.98, 107.05],
// // // // //       ]}
// // // // //       maxBoundsViscosity={1.0}
// // // // //     >
// // // // //       <MapHandler mapRef={mapRef} inputRef={inputRef} />
// // // // //       <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/">CARTO</a>' />
// // // // //       {geoData && boundaryData && <HeatMapLayer geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} isLoading={isLoading} inputRef={inputRef} />}
// // // // //       {boundaryData && (
// // // // //         <GeoJSON
// // // // //           data={boundaryData}
// // // // //           style={styleBoundary}
// // // // //           onEachFeature={(feature, layer) => {
// // // // //             layer.on({
// // // // //               mouseover: (e) => {
// // // // //                 const layer = e.target;
// // // // //                 layer.setStyle({
// // // // //                   weight: 2,
// // // // //                   color: "#2b6cb0",
// // // // //                   fillOpacity: 0.1,
// // // // //                 });
// // // // //                 layer.bringToFront();
// // // // //               },
// // // // //               mouseout: (e) => {
// // // // //                 const layer = e.target;
// // // // //                 layer.setStyle({
// // // // //                   weight: 1,
// // // // //                   color: "#4a90e2",
// // // // //                   fillOpacity: 0,
// // // // //                 });
// // // // //               },
// // // // //             });
// // // // //           }}
// // // // //         />
// // // // //       )}
// // // // //     </MapContainer>
// // // // //   );
// // // // // };

// // // // // export default Map;

// // // // "use client";

// // // // import React from "react";
// // // // import dynamic from "next/dynamic";
// // // // import { useMap } from "react-leaflet"; // Impor useMap secara statis
// // // // import L from "leaflet";
// // // // import "leaflet/dist/leaflet.css";
// // // // import styles from "./map.module.css";
// // // // import HeatMapLayer from "./HeatMapLayer";
// // // // import { GeoJSONData, BoundaryGeoJSONData } from "./types";

// // // // // Impor komponen react-leaflet secara dinamis
// // // // const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
// // // //   ssr: false,
// // // // });
// // // // const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {
// // // //   ssr: false,
// // // // });
// // // // const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), {
// // // //   ssr: false,
// // // // });

// // // // interface MapProps {
// // // //   geoData: GeoJSONData | null;
// // // //   boundaryData: BoundaryGeoJSONData | null;
// // // //   selectedDate: string;
// // // //   isLoading: boolean;
// // // //   mapRef: React.MutableRefObject<L.Map | null>;
// // // //   inputRef: React.RefObject<HTMLInputElement | null>; // Perbaiki tipe untuk menerima null
// // // // }

// // // // const MapHandler: React.FC<{ mapRef: React.MutableRefObject<L.Map | null>; inputRef: React.RefObject<HTMLInputElement | null> }> = ({ mapRef, inputRef }) => {
// // // //   const map = useMap();

// // // //   React.useEffect(() => {
// // // //     mapRef.current = map;
// // // //     const stopKeyboardPropagation = (e: L.LeafletKeyboardEvent) => {
// // // //       if (inputRef.current === document.activeElement) {
// // // //         e.originalEvent.stopPropagation();
// // // //       }
// // // //     };

// // // //     map.addEventListener("keydown", stopKeyboardPropagation);
// // // //     return () => {
// // // //       map.removeEventListener("keydown", stopKeyboardPropagation);
// // // //       mapRef.current = null;
// // // //     };
// // // //   }, [map, mapRef, inputRef]);

// // // //   return null;
// // // // };

// // // // const Map: React.FC<MapProps> = ({ geoData, boundaryData, selectedDate, isLoading, mapRef, inputRef }) => {
// // // //   const styleBoundary = () => ({
// // // //     weight: 1,
// // // //     opacity: 0.8,
// // // //     color: "#4a90e2",
// // // //     fillOpacity: 0,
// // // //   });

// // // //   return (
// // // //     <MapContainer
// // // //       center={[-6.1754, 106.8272]}
// // // //       zoom={12}
// // // //       className={styles.map}
// // // //       zoomControl={false}
// // // //       minZoom={11}
// // // //       maxZoom={18}
// // // //       maxBounds={[
// // // //         [-6.42, 106.64],
// // // //         [-5.98, 107.05],
// // // //       ]}
// // // //       maxBoundsViscosity={1.0}
// // // //     >
// // // //       <MapHandler mapRef={mapRef} inputRef={inputRef} />
// // // //       <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/">CARTO</a>' />
// // // //       {geoData && boundaryData && <HeatMapLayer geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} isLoading={isLoading} inputRef={inputRef} />}
// // // //       {boundaryData && (
// // // //         <GeoJSON
// // // //           data={boundaryData}
// // // //           style={styleBoundary}
// // // //           onEachFeature={(feature, layer) => {
// // // //             layer.on({
// // // //               mouseover: (e) => {
// // // //                 const layer = e.target;
// // // //                 layer.setStyle({
// // // //                   weight: 2,
// // // //                   color: "#2b6cb0",
// // // //                   fillOpacity: 0.1,
// // // //                 });
// // // //                 layer.bringToFront();
// // // //               },
// // // //               mouseout: (e) => {
// // // //                 const layer = e.target;
// // // //                 layer.setStyle({
// // // //                   weight: 1,
// // // //                   color: "#4a90e2",
// // // //                   fillOpacity: 0,
// // // //                 });
// // // //               },
// // // //             });
// // // //           }}
// // // //         />
// // // //       )}
// // // //     </MapContainer>
// // // //   );
// // // // };

// // // // export default Map;

// // // "use client";

// // // import React from "react";
// // // import dynamic from "next/dynamic";
// // // import { useMap } from "react-leaflet";
// // // import styles from "./map.module.css";
// // // import HeatMapLayer from "./HeatMapLayer";
// // // import { GeoJSONData, BoundaryGeoJSONData } from "./types";

// // // // Impor komponen react-leaflet secara dinamis
// // // const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
// // //   ssr: false,
// // // });
// // // const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {
// // //   ssr: false,
// // // });
// // // const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), {
// // //   ssr: false,
// // // });

// // // interface MapProps {
// // //   geoData: GeoJSONData | null;
// // //   boundaryData: BoundaryGeoJSONData | null;
// // //   selectedDate: string;
// // //   isLoading: boolean;
// // //   mapRef: React.MutableRefObject<L.Map | null>;
// // //   inputRef: React.RefObject<HTMLInputElement | null>;
// // // }

// // // const MapHandler: React.FC<{ mapRef: React.MutableRefObject<L.Map | null>; inputRef: React.RefObject<HTMLInputElement | null> }> = ({ mapRef, inputRef }) => {
// // //   const map = useMap();

// // //   React.useEffect(() => {
// // //     if (typeof window === "undefined") return;

// // //     mapRef.current = map;
// // //     const stopKeyboardPropagation = (e: L.LeafletKeyboardEvent) => {
// // //       if (inputRef.current === document.activeElement) {
// // //         e.originalEvent.stopPropagation();
// // //       }
// // //     };

// // //     map.addEventListener("keydown", stopKeyboardPropagation);
// // //     return () => {
// // //       map.removeEventListener("keydown", stopKeyboardPropagation);
// // //       mapRef.current = null;
// // //     };
// // //   }, [map, mapRef, inputRef]);

// // //   return null;
// // // };

// // // const Map: React.FC<MapProps> = ({ geoData, boundaryData, selectedDate, isLoading, mapRef, inputRef }) => {
// // //   const styleBoundary = () => ({
// // //     weight: 1,
// // //     opacity: 0.8,
// // //     color: "#4a90e2",
// // //     fillOpacity: 0,
// // //   });

// // //   // Muat CSS leaflet secara dinamis di sisi klien
// // //   React.useEffect(() => {
// // //     if (typeof window === "undefined") return;

// // //     const link = document.createElement("link");
// // //     link.rel = "stylesheet";
// // //     link.href = "/_next/static/css/leaflet.css"; // Pastikan file CSS ada di public atau build output
// // //     document.head.appendChild(link);

// // //     return () => {
// // //       document.head.removeChild(link);
// // //     };
// // //   }, []);

// // //   return (
// // //     <MapContainer
// // //       center={[-6.1754, 106.8272]}
// // //       zoom={12}
// // //       className={styles.map}
// // //       zoomControl={false}
// // //       minZoom={11}
// // //       maxZoom={18}
// // //       maxBounds={[
// // //         [-6.42, 106.64],
// // //         [-5.98, 107.05],
// // //       ]}
// // //       maxBoundsViscosity={1.0}
// // //     >
// // //       <MapHandler mapRef={mapRef} inputRef={inputRef} />
// // //       <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/">CARTO</a>' />
// // //       {geoData && boundaryData && <HeatMapLayer geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} isLoading={isLoading} inputRef={inputRef} />}
// // //       {boundaryData && (
// // //         <GeoJSON
// // //           data={boundaryData}
// // //           style={styleBoundary}
// // //           onEachFeature={(feature, layer) => {
// // //             layer.on({
// // //               mouseover: async (e) => {
// // //                 const L = (await import("leaflet")).default;
// // //                 const layer = e.target;
// // //                 layer.setStyle({
// // //                   weight: 2,
// // //                   color: "#2b6cb0",
// // //                   fillOpacity: 0.1,
// // //                 });
// // //                 layer.bringToFront();
// // //               },
// // //               mouseout: async (e) => {
// // //                 const L = (await import("leaflet")).default;
// // //                 const layer = e.target;
// // //                 layer.setStyle({
// // //                   weight: 1,
// // //                   color: "#4a90e2",
// // //                   fillOpacity: 0,
// // //                 });
// // //               },
// // //             });
// // //           }}
// // //         />
// // //       )}
// // //     </MapContainer>
// // //   );
// // // };

// // // export default Map;

// // "use client";

// // import React from "react";
// // import dynamic from "next/dynamic";
// // import { useMap } from "react-leaflet";
// // import styles from "./map.module.css";
// // import HeatMapLayer from "./HeatMapLayer";
// // import { GeoJSONData, BoundaryGeoJSONData } from "./types";

// // // Impor komponen react-leaflet secara dinamis
// // const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
// //   ssr: false,
// // });
// // const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {
// //   ssr: false,
// // });
// // const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), {
// //   ssr: false,
// // });

// // interface MapProps {
// //   geoData: GeoJSONData | null;
// //   boundaryData: BoundaryGeoJSONData | null;
// //   selectedDate: string;
// //   isLoading: boolean;
// //   mapRef: React.MutableRefObject<L.Map | null>;
// //   inputRef: React.RefObject<HTMLInputElement | null>;
// // }

// // const MapHandler: React.FC<{ mapRef: React.MutableRefObject<L.Map | null>; inputRef: React.RefObject<HTMLInputElement | null> }> = ({ mapRef, inputRef }) => {
// //   const map = useMap();

// //   React.useEffect(() => {
// //     if (typeof window === "undefined") return;

// //     mapRef.current = map;
// //     const stopKeyboardPropagation = (e: L.LeafletKeyboardEvent) => {
// //       if (inputRef.current === document.activeElement) {
// //         e.originalEvent.stopPropagation();
// //       }
// //     };

// //     map.addEventListener("keydown", stopKeyboardPropagation);
// //     return () => {
// //       map.removeEventListener("keydown", stopKeyboardPropagation);
// //       mapRef.current = null;
// //     };
// //   }, [map, mapRef, inputRef]);

// //   return null;
// // };

// // const Map: React.FC<MapProps> = ({ geoData, boundaryData, selectedDate, isLoading, mapRef, inputRef }) => {
// //   const styleBoundary = () => ({
// //     weight: 1,
// //     opacity: 0.8,
// //     color: "#4a90e2",
// //     fillOpacity: 0,
// //   });

// //   // Muat CSS leaflet secara dinamis di sisi klien
// //   React.useEffect(() => {
// //     if (typeof window === "undefined") return;

// //     const link = document.createElement("link");
// //     link.rel = "stylesheet";
// //     link.href = "/leaflet.css"; // Pastikan file ada di public/leaflet.css
// //     document.head.appendChild(link);

// //     return () => {
// //       document.head.removeChild(link);
// //     };
// //   }, []);

// //   return (
// //     <MapContainer
// //       center={[-6.1754, 106.8272]}
// //       zoom={12}
// //       className={styles.map}
// //       zoomControl={false}
// //       minZoom={11}
// //       maxZoom={18}
// //       maxBounds={[
// //         [-6.42, 106.64],
// //         [-5.98, 107.05],
// //       ]}
// //       maxBoundsViscosity={1.0}
// //     >
// //       <MapHandler mapRef={mapRef} inputRef={inputRef} />
// //       <TileLayer
// //         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // Ganti ke OpenStreetMap sebagai cadangan
// //         attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// //       />
// //       {geoData && boundaryData && <HeatMapLayer geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} isLoading={isLoading} inputRef={inputRef} />}
// //       {boundaryData && (
// //         <GeoJSON
// //           data={boundaryData}
// //           style={styleBoundary}
// //           onEachFeature={(feature, layer) => {
// //             layer.on({
// //               mouseover: async (e) => {
// //                 const L = (await import("leaflet")).default;
// //                 const layer = e.target;
// //                 layer.setStyle({
// //                   weight: 2,
// //                   color: "#2b6cb0",
// //                   fillOpacity: 0.1,
// //                 });
// //                 layer.bringToFront();
// //               },
// //               mouseout: async (e) => {
// //                 const L = (await import("leaflet")).default;
// //                 const layer = e.target;
// //                 layer.setStyle({
// //                   weight: 1,
// //                   color: "#4a90e2",
// //                   fillOpacity: 0,
// //                 });
// //               },
// //             });
// //           }}
// //         />
// //       )}
// //     </MapContainer>
// //   );
// // };

// // export default Map;

// "use client";

// import React from "react";
// import dynamic from "next/dynamic";
// import { useMap } from "react-leaflet";
// import styles from "./map.module.css";
// import HeatMapLayer from "./HeatMapLayer";
// import { GeoJSONData, BoundaryGeoJSONData } from "./types";

// // Impor komponen react-leaflet secara dinamis
// const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
//   ssr: false,
// });
// const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {
//   ssr: false,
// });
// const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), {
//   ssr: false,
// });

// interface MapProps {
//   geoData: GeoJSONData | null;
//   boundaryData: BoundaryGeoJSONData | null;
//   selectedDate: string;
//   isLoading: boolean;
//   mapRef: React.MutableRefObject<L.Map | null>;
//   inputRef: React.RefObject<HTMLInputElement | null>;
// }

// const MapHandler: React.FC<{ mapRef: React.MutableRefObject<L.Map | null>; inputRef: React.RefObject<HTMLInputElement | null> }> = ({ mapRef, inputRef }) => {
//   const map = useMap();

//   React.useEffect(() => {
//     if (typeof window === "undefined") return;

//     mapRef.current = map;
//     const stopKeyboardPropagation = (e: L.LeafletKeyboardEvent) => {
//       if (inputRef.current === document.activeElement) {
//         e.originalEvent.stopPropagation();
//       }
//     };

//     map.addEventListener("keydown", stopKeyboardPropagation);
//     return () => {
//       map.removeEventListener("keydown", stopKeyboardPropagation);
//       mapRef.current = null;
//     };
//   }, [map, mapRef, inputRef]);

//   return null;
// };

// const Map: React.FC<MapProps> = ({ geoData, boundaryData, selectedDate, isLoading, mapRef, inputRef }) => {
//   const styleBoundary = () => ({
//     weight: 1,
//     opacity: 0.8,
//     color: "#4a90e2",
//     fillOpacity: 0,
//   });

//   // Muat CSS leaflet secara dinamis di sisi klien
//   React.useEffect(() => {
//     if (typeof window === "undefined") return;

//     const link = document.createElement("link");
//     link.rel = "stylesheet";
//     link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
//     link.integrity = "sha512-Zcn6bjwF/JyibSL561zR1wO5q+7T7/4DxhB1Pq5W0+kt9US7nT/jKdxrvSQLxAEW7o1xQ2lQOzNaU09/9ooC/4g==";
//     link.crossOrigin = "anonymous";
//     document.head.appendChild(link);

//     return () => {
//       document.head.removeChild(link);
//     };
//   }, []);

//   return (
//     <MapContainer
//       center={[-6.1754, 106.8272]}
//       zoom={12}
//       className={styles.map}
//       zoomControl={false}
//       minZoom={11}
//       maxZoom={18}
//       maxBounds={[
//         [-6.42, 106.64],
//         [-5.98, 107.05],
//       ]}
//       maxBoundsViscosity={1.0}
//       style={{ height: "100vh", width: "100%" }} // Pastikan ukuran peta jelas
//     >
//       <MapHandler mapRef={mapRef} inputRef={inputRef} />
//       <TileLayer
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         maxZoom={18}
//         tileSize={256}
//         detectRetina={true} // Optimalkan untuk layar retina
//       />
//       {geoData && boundaryData && <HeatMapLayer geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} isLoading={isLoading} inputRef={inputRef} />}
//       {boundaryData && (
//         <GeoJSON
//           data={boundaryData}
//           style={styleBoundary}
//           onEachFeature={(feature, layer) => {
//             layer.on({
//               mouseover: async (e) => {
//                 const L = (await import("leaflet")).default;
//                 const layer = e.target;
//                 layer.setStyle({
//                   weight: 2,
//                   color: "#2b6cb0",
//                   fillOpacity: 0.1,
//                 });
//                 layer.bringToFront();
//               },
//               mouseout: async (e) => {
//                 const L = (await import("leaflet")).default;
//                 const layer = e.target;
//                 layer.setStyle({
//                   weight: 1,
//                   color: "#4a90e2",
//                   fillOpacity: 0,
//                 });
//               },
//             });
//           }}
//         />
//       )}
//     </MapContainer>
//   );
// };

// export default Map;

"use client";

import React from "react";
import { MapContainer, TileLayer, useMap, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // Impor statis seperti di aod
import styles from "./map.module.css";
import HeatMapLayer from "./HeatMapLayer";
import { GeoJSONData, BoundaryGeoJSONData } from "./types";

interface MapProps {
  geoData: GeoJSONData | null;
  boundaryData: BoundaryGeoJSONData | null;
  selectedDate: string;
  isLoading: boolean;
  mapRef: React.MutableRefObject<L.Map | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const MapHandler: React.FC<{ mapRef: React.MutableRefObject<L.Map | null>; inputRef: React.RefObject<HTMLInputElement | null> }> = ({ mapRef, inputRef }) => {
  const map = useMap();

  React.useEffect(() => {
    mapRef.current = map;
    const stopKeyboardPropagation = (e: L.LeafletKeyboardEvent) => {
      if (inputRef.current === document.activeElement) {
        e.originalEvent.stopPropagation();
      }
    };

    map.addEventListener("keydown", stopKeyboardPropagation);
    return () => {
      map.removeEventListener("keydown", stopKeyboardPropagation);
      mapRef.current = null;
    };
  }, [map, mapRef, inputRef]);

  return null;
};

const Map: React.FC<MapProps> = ({ geoData, boundaryData, selectedDate, isLoading, mapRef, inputRef }) => {
  const styleBoundary = () => ({
    weight: 1,
    opacity: 0.8,
    color: "#4a90e2",
    fillOpacity: 0,
  });

  return (
    <MapContainer
      center={[-6.1754, 106.8272]}
      zoom={12}
      className={styles.map}
      zoomControl={false}
      minZoom={11}
      maxZoom={18}
      maxBounds={[
        [-6.42, 106.64],
        [-5.98, 107.05],
      ]}
      maxBoundsViscosity={1.0}
      style={{ height: "100vh", width: "100%" }}
    >
      <MapHandler mapRef={mapRef} inputRef={inputRef} />
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/">CARTO</a>' maxZoom={18} tileSize={256} detectRetina={true} />
      {geoData && boundaryData && <HeatMapLayer geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} isLoading={isLoading} inputRef={inputRef} />}
      {boundaryData && (
        <GeoJSON
          data={boundaryData}
          style={styleBoundary}
          onEachFeature={(feature, layer) => {
            layer.on({
              mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                  weight: 2,
                  color: "#2b6cb0",
                  fillOpacity: 0.1,
                });
                layer.bringToFront();
              },
              mouseout: (e) => {
                const layer = e.target;
                layer.setStyle({
                  weight: 1,
                  color: "#4a90e2",
                  fillOpacity: 0,
                });
              },
            });
          }}
        />
      )}
    </MapContainer>
  );
};

export default Map;
