// "use client";
// import React, { useState, useEffect } from "react";
// import { MapContainer, GeoJSON, TileLayer, useMap } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import dynamic from "next/dynamic";
// import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
// import { generateJakartaGeoJSON, getPM25Status } from "../../utils/geoJSONHelpers";
// import { JakartaFeature } from "../../types";
// import styles from "./SplitView.module.css";
// import { OpenStreetMapProvider, GeoSearchControl } from "leaflet-geosearch";
// import "leaflet-geosearch/dist/geosearch.css";

// const createEmojiMarker = () => {
//   return L.divIcon({
//     html: '<div style="font-size:24px">📍</div>',
//     className: "emoji-marker",
//     iconSize: [24, 24],
//     iconAnchor: [12, 24],
//   });
// };

// const Calendar = dynamic(() => import("../../calendar/page"), {
//   ssr: false,
//   loading: () => <div>Loading calendar...</div>,
// });

// // search control ke peta
// const SearchControl = ({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) => {
//   const map = useMap();

//   useEffect(() => {
//     if (!map) return;

//     const provider = new OpenStreetMapProvider();

//     const searchControl = new (GeoSearchControl as any)({
//       provider,
//       style: "bar",
//       showMarker: true,
//       marker: {
//         icon: createEmojiMarker(), // custom marker didieu
//         draggable: false,
//       },
//       showPopup: false,
//       autoClose: true,
//       retainZoomLevel: false,
//       animateZoom: true,
//       keepResult: true,
//       searchLabel: "Cari lokasi...",
//     });

//     map.addControl(searchControl);
//     mapRef.current = map;

//     return () => {
//       map.removeControl(searchControl);
//     };
//   }, [map]);

//   return null;
// };

// const SplitViewJakartaMap = () => {
//   const [geoJSONData, setGeoJSONData] = useState<any>(null);
//   const [isSplitView, setIsSplitView] = useState(false);
//   const [selectedFeature, setSelectedFeature] = useState<JakartaFeature | null>(null);
//   const mapRef = React.useRef<L.Map | null>(null);

//   // load geojson data
//   useEffect(() => {
//     const data = generateJakartaGeoJSON();
//     setGeoJSONData(data);
//   }, []);

//   const handleZoomToFeature = (feature: JakartaFeature) => {
//     if (mapRef.current && feature.geometry) {
//       const layer = L.geoJSON(feature.geometry);
//       mapRef.current.fitBounds(layer.getBounds(), {
//         padding: [50, 50], // optional padding
//         maxZoom: 16, // zoom maksimum
//       });
//     }
//   };

//   const handleFeatureClick = (feature: JakartaFeature) => {
//     setSelectedFeature(feature);
//     setIsSplitView(true);
//     handleZoomToFeature(feature); // Tambahkan ini
//   };

//   const toggleSplitView = () => {
//     setIsSplitView(!isSplitView);
//   };

//   const mapStyle = (feature?: GeoJSON.Feature<GeoJSON.Geometry, any>) => {
//     const props = feature?.properties as JakartaFeature["properties"];
//     return {
//       fillColor: props?.color || "#999",
//       weight: 1,
//       opacity: 1,
//       color: "white",
//       dashArray: "3",
//       fillOpacity: 0.7,
//     };
//   };

//   const onEachFeature = (feature: JakartaFeature, layer: L.Layer) => {
//     if (!feature.properties) return;

//     const { name, pm25 = 0, updated } = feature.properties;
//     const status = getPM25Status(pm25);

//     layer.bindPopup(`
//       <div style="min-width: 200px; background-color: #F7FFF0; padding: 10px; text-align: center;">
//         <h3 style="margin: 0 0 10px 0; font-size: 16px;">${name}</h3>
//         <div style="margin: 15px 0;">
//           <div style="
//             width: 40px;
//             height: 40px;
//             background-color: #4CAF50;
//             border-radius: 50%;
//             display: inline-flex;
//             justify-content: center;
//             align-items: center;
//             color: white;
//             font-weight: bold;
//             font-size: 14px;
//             margin-bottom: 8px;">
//             ${pm25}
//           </div>
//           <div style="font-size: 14px; font-weight: bold;">
//             ${status}
//           </div>
//         </div>
//         <div style="margin-top: 10px;">
//           <small>Terakhir diperbarui</small><br>
//           <small>${new Date(updated || "").toLocaleString()}</small>
//         </div>
//       </div>
//     `);

//     layer.on({
//       click: () => {
//         // Hapus marker sebelumnya jika ada
//         if (mapRef.current && (window as any).lastMarker) {
//           mapRef.current.removeLayer((window as any).lastMarker);
//         }

//         const center = L.geoJSON(feature.geometry).getBounds().getCenter();
//         const marker = L.marker(center, {
//           icon: createEmojiMarker(),
//         }).addTo(mapRef.current!);

//         // Simpan referensi marker
//         (window as any).lastMarker = marker;

//         handleFeatureClick(feature);
//         if (mapRef.current && feature.geometry) {
//           mapRef.current.flyToBounds(L.geoJSON(feature.geometry).getBounds(), {
//             duration: 1,
//           });
//         }
//       },

//       mouseover: (e) => {
//         const layer = e.target;
//         layer.setStyle({
//           weight: 2,
//           color: "#fff",
//           dashArray: "",
//           fillOpacity: 0.9,
//         });
//         layer.bringToFront();
//       },
//       mouseout: (e) => {
//         const layer = e.target;
//         layer.setStyle({
//           weight: 1,
//           color: "white",
//           dashArray: "3",
//           fillOpacity: 0.7,
//         });
//       },
//     });
//   };

//   return (
//     <div className="relative h-screen w-full">
//       <div className={`flex h-full ${isSplitView ? "flex-row" : ""}`}>
//         {/* map section */}
//         <div className={`${isSplitView ? "w-1/2" : "w-full"} h-full relative`}>
//           <MapContainer center={[-6.1754, 106.8272]} zoom={isSplitView ? 14 : 12} className="h-full w-full">
//             <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
//             {geoJSONData && <GeoJSON data={geoJSONData} style={mapStyle} onEachFeature={onEachFeature} />}
//             <SearchControl mapRef={mapRef} />
//           </MapContainer>

//           {/* toggle open dan close */}
//           <button onClick={toggleSplitView} className="absolute top-1/2 right-0 z-[1000] bg-[#6A9C80] p-2 rounded-full shadow-lg transform translate-x-1/2 -translate-y-1/2">
//             {isSplitView ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
//           </button>
//         </div>

//         {/* calendar */}
//         {isSplitView && (
//           <div className={`w-1/2 h-full overflow-auto ${styles.splitViewContainer}`}>
//             <Calendar isSplitView={true} showRightPanel={false} showHeader={false} />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SplitViewJakartaMap;
