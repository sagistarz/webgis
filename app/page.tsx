"use client";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapWrapper from "./components/map/MapWrapper";
import Navbar from "./components/navbar/page";
import Link from "next/link";

export default function MainPage() {
  return (
    <>
      <Navbar />
      <MapWrapper />
    </>
  );
}

// const AODMap = () => {
//   useEffect(() => {
//     // Batas koordinat Jakarta
//     const jakartaBounds: L.LatLngBoundsExpression = [
//       [-6.5, 106.5], // Southwest (Jakarta bagian bawah)
//       [-5.9, 107.0], // Northeast (Jakarta bagian atas)
//     ];

//     // Inisialisasi peta di Jakarta
//     const map = L.map("map", {
//       center: [-6.2, 106.8], // Posisi tengah (Jakarta)
//       zoom: 11, // Perbesar agar fokus ke Jakarta
//       maxBounds: jakartaBounds, // Batasi peta di sekitar Jakarta
//       maxBoundsViscosity: 1.0, // Buat batasan lebih ketat
//     });

//     // Tambahkan basemap OpenStreetMap
//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//       attribution: "&copy; OpenStreetMap contributors",
//     }).addTo(map);

//     // Tambahkan layer AOD dari NASA (MODIS)
//     L.tileLayer("https://gibs.earthdata.nasa.gov/tiles/epsg3857/best/MODIS_Terra_Aerosol/default/2024-02-10/250m/{z}/{y}/{x}.png", {
//       attribution: "&copy; NASA GIBS",
//       opacity: 0.6,
//     }).addTo(map);

//     return () => {
//       map.remove(); // Hapus map saat komponen unmount
//     };
//   }, []);

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
//       <h2 className="text-2xl font-bold mb-4">Peta AOD Jakarta</h2>
//       <div id="map" className="w-full h-[500px] rounded-lg shadow-lg"></div>

//       {/* Legenda */}
//       <div className="mt-4 bg-white p-4 rounded-md shadow-md">
//         <h3 className="text-lg font-semibold">Skala AOD</h3>
//         <div className="flex items-center gap-2">
//           <span className="w-5 h-5 bg-blue-500 rounded"></span>
//           <span>0.1 - Udara bersih</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="w-5 h-5 bg-yellow-500 rounded"></span>
//           <span>0.5 - Sedang</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="w-5 h-5 bg-red-500 rounded"></span>
//           <span>1.5+ - Polusi tinggi</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AODMap;
