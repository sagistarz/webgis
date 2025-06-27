// "use client";

// import React, { useRef, useEffect, useState } from "react";
// import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import Navbar from "../components/navbar/page";
// import styles from "./stasiun.module.css";
// import { FiChevronRight } from "react-icons/fi";
// import dynamic from "next/dynamic";

// interface StationData {
//   station_name: string;
//   latitude: number;
//   longitude: number;
//   pm25_value: number | null;
// }

// interface WeatherData {
//   station_name: string;
//   temperature: number;
//   precipitation: number;
//   humidity: number;
//   wind_dir: number;
//   wind_speed: number;
//   latitude: number;
//   longitude: number;
// }

// const Calendar = dynamic(() => import("../calendar/page"), {
//   ssr: false,
//   loading: () => (
//     <div className="h-full w-full flex items-center justify-center">
//       <div className={styles.spinner}></div>
//       <span>Memuat kalender...</span>
//     </div>
//   ),
// });

// const StasiunPM25 = () => {
//   const mapRef = useRef<L.Map | null>(null);
//   const [stations, setStations] = useState<StationData[]>([]);
//   const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [boundaryJakarta, setBoundaryJakarta] = useState<any>(null);
//   const [isSplitView, setIsSplitView] = useState(false);
//   const [selectedStation, setSelectedStation] = useState<string | null>(null);

//   const createIcon = (imgName: string) =>
//     L.icon({
//       iconUrl: `/images/${imgName}`,
//       iconSize: [37, 37],
//       iconAnchor: [16, 37],
//       popupAnchor: [0, -37],
//       shadowUrl: undefined,
//     });

//   const getIconByPM25 = (pm25: number | null) => {
//     if (pm25 === null || isNaN(pm25)) return createIcon("indikator_null.png");
//     if (pm25 >= 0 && pm25 <= 50.9) return createIcon("indikator_baik.png");
//     if (pm25 >= 51 && pm25 <= 100.9) return createIcon("indikator_sedang.png");
//     if (pm25 >= 101 && pm25 <= 199.9) return createIcon("indikator_tidak_sehat.png");
//     if (pm25 >= 200 && pm25 <= 299.9) return createIcon("indikator_sangat_tidak_sehat.png");
//     if (pm25 >= 300) return createIcon("indikator_berbahaya.png");
//     return createIcon("indikator_null.png");
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const pm25Response = await fetch("/api/pm25-aktual", { cache: "no-store" });
//         if (!pm25Response.ok) throw new Error(`PM2.5 fetch failed: ${pm25Response.status}`);
//         const pm25RawText = await pm25Response.text();
//         const pm25CleanText = pm25RawText.replace(/NaN/g, "null");
//         const pm25Data = JSON.parse(pm25CleanText);

//         if (Array.isArray(pm25Data)) {
//           setStations(pm25Data);
//         } else {
//           setStations([]);
//           const errorMessage = pm25Data.message?.includes("Tidak ada data PM2.5") ? "Tidak ada data PM2.5 tersedia untuk tanggal ini" : "Gagal memuat data stasiun";
//           setError(errorMessage);
//         }

//         const weatherResponse = await fetch("/api/weather", { cache: "no-store" });
//         if (!weatherResponse.ok) throw new Error(`Weather fetch failed: ${weatherResponse.status}`);
//         const weather = await weatherResponse.json();
//         setWeatherData(Array.isArray(weather) ? weather : []);

//         const boundaryResponse = await fetch("/data/batas_kelurahan_jakarta.geojson");
//         if (!boundaryResponse.ok) throw new Error(`Boundary fetch failed: ${boundaryResponse.status}`);
//         const boundaryData = await boundaryResponse.json();
//         setBoundaryJakarta(boundaryData);
//       } catch (err) {
//         setError("Terjadi kesalahan saat memuat data peta");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const getWeatherForStation = (stationName: string) => {
//     return weatherData.find((w) => w.station_name === stationName);
//   };

//   const handleMarkerClick = (station: StationData) => {
//     setSelectedStation(station.station_name);
//     setIsSplitView(true);
//     if (mapRef.current) {
//       mapRef.current.setView([station.latitude, station.longitude], 14);
//     }
//   };

//   const toggleSplitView = () => {
//     setIsSplitView(!isSplitView);
//     if (isSplitView) {
//       setSelectedStation(null);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="h-full w-full flex items-center justify-center bg-gray-100">
//         <div className="flex flex-col items-center gap-4">
//           <div className={styles.spinner}></div>
//           <span className="text-lg font-medium text-gray-700">Memuat data stasiun...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <Navbar />
//       <div className={`relative ${isSplitView ? "h-screen" : "h-full"} w-full`}>
//         {error && (
//           <div className={styles.alert}>
//             <div className={styles.alertContent}>
//               <span className="text-red-500 font-semibold">{error}</span>
//               <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
//                 Tutup
//               </button>
//             </div>
//           </div>
//         )}
//         <div className={`flex h-full ${isSplitView ? "flex-row" : ""}`}>
//           <div className={`${isSplitView ? "w-1/2" : "w-full"} h-full relative`}>
//             <MapContainer
//               center={[-6.1754, 106.8272]}
//               zoom={12}
//               minZoom={12}
//               maxZoom={16}
//               maxBounds={[
//                 [-6.45, 106.55],
//                 [-5.9, 107.15],
//               ]}
//               maxBoundsViscosity={1}
//               className="h-full w-full"
//               zoomControl={false}
//               ref={mapRef}
//             >
//               <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />

//               {boundaryJakarta && (
//                 <GeoJSON
//                   data={boundaryJakarta}
//                   style={() => ({
//                     color: "#257285",
//                     weight: 0.3,
//                     fillColor: "#FFFFFF",
//                     fillOpacity: 0.01,
//                   })}
//                 />
//               )}

//               {Array.isArray(stations) &&
//                 stations.length > 0 &&
//                 stations.map((station, index) => {
//                   const weather = getWeatherForStation(station.station_name);
//                   const icon = getIconByPM25(station.pm25_value);

//                   return (
//                     <Marker
//                       key={index}
//                       position={[station.latitude, station.longitude]}
//                       icon={icon}
//                       eventHandlers={{
//                         click: () => handleMarkerClick(station),
//                       }}
//                     >
//                       <Popup>
//                         <div className="font-bold">Stasiun: {station.station_name}</div>
//                         <div className="font-bold">PM2.5: {station.pm25_value !== null && !isNaN(station.pm25_value) ? station.pm25_value.toFixed(2) : "Tidak tersedia"}</div>
//                         <div
//                           className="text-white font-semibold px-2 py-1 rounded mt-1 mb-1 inline-block"
//                           style={{
//                             backgroundColor:
//                               station.pm25_value === null || isNaN(station.pm25_value)
//                                 ? "#6c757d"
//                                 : station.pm25_value <= 50.9
//                                 ? "#00CC00"
//                                 : station.pm25_value <= 100.9
//                                 ? "#0133FF"
//                                 : station.pm25_value <= 199.9
//                                 ? "#FFC900"
//                                 : station.pm25_value <= 299.9
//                                 ? "#FF0000"
//                                 : "#000000",
//                           }}
//                         >
//                           {station.pm25_value === null || isNaN(station.pm25_value)
//                             ? "Kualitas: Tidak tersedia"
//                             : station.pm25_value <= 50.9
//                             ? "Kualitas: BAIK"
//                             : station.pm25_value <= 100.9
//                             ? "Kualitas: SEDANG"
//                             : station.pm25_value <= 199.9
//                             ? "Kualitas: TIDAK SEHAT"
//                             : station.pm25_value <= 299.9
//                             ? "Kualitas: SANGAT TIDAK SEHAT"
//                             : "Kualitas: BERBAHAYA"}
//                         </div>
//                         {weather ? (
//                           <div className="mt-2 text-sm">
//                             <div>Suhu: {weather.temperature} °C</div>
//                             <div>Curah hujan: {weather.precipitation} mm</div>
//                             <div>Kelembaban: {weather.humidity} %</div>
//                             <div>Arah angin {weather.wind_dir}°</div>
//                             <div>Kec. angin: {weather.wind_speed} km/h</div>
//                           </div>
//                         ) : (
//                           <div className="mt-2 text-sm italic text-gray-500">Data cuaca tidak tersedia</div>
//                         )}
//                       </Popup>
//                     </Marker>
//                   );
//                 })}
//             </MapContainer>

//             <div className={styles.legend}>
//               <h4>Indikator PM2.5 (µg/m³)</h4>
//               <div className={styles.legendItem}>
//                 <span className={styles.legendColor} style={{ backgroundColor: "rgba(0, 204, 0, 0.7)" }}></span>
//                 <span>Baik (0 - 50)</span>
//               </div>
//               <div className={styles.legendItem}>
//                 <span className={styles.legendColor} style={{ backgroundColor: "rgba(1, 51, 255, 0.7)" }}></span>
//                 <span>Sedang (51 - 100)</span>
//               </div>
//               <div className={styles.legendItem}>
//                 <span className={styles.legendColor} style={{ backgroundColor: "rgba(255, 201, 0, 0.7)" }}></span>
//                 <span>Tidak Sehat (101 - 199)</span>
//               </div>
//               <div className={styles.legendItem}>
//                 <span className={styles.legendColor} style={{ backgroundColor: "rgba(255, 0, 0, 0.7)" }}></span>
//                 <span>Sangat Tidak Sehat (200 - 299)</span>
//               </div>
//               <div className={styles.legendItem}>
//                 <span className={styles.legendColor} style={{ backgroundColor: "rgba(34, 34, 34, 1)" }}></span>
//                 <span>Berbahaya (&gt; 300)</span>
//               </div>
//             </div>
//           </div>

//           {isSplitView && (
//             <button onClick={toggleSplitView} className={styles.toggleButton} title="Close Calendar">
//               <FiChevronRight size={20} />
//             </button>
//           )}

//           {isSplitView && selectedStation && (
//             <div className="w-1/2 h-full overflow-auto">
//               <Calendar location={selectedStation} isSplitView={true} showRightPanel={false} showHeader={false} />
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default StasiunPM25;

"use client";

import React, { useRef, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/navbar/Navbar";
import styles from "./stasiun.module.css";
import { FiChevronRight } from "react-icons/fi";
import dynamic from "next/dynamic";
import { GeoJSON as GeoJSONType } from "geojson"; // Import GeoJSON type

interface StationData {
  station_name: string;
  latitude: number;
  longitude: number;
  pm25_value: number | null;
}

interface WeatherData {
  station_name: string;
  temperature: number;
  precipitation: number;
  humidity: number;
  wind_dir: number;
  wind_speed: number;
  latitude: number;
  longitude: number;
}

const Calendar = dynamic(() => import("../components/calendar/Calendar"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center">
      <div className={styles.spinner}></div>
      <span>Memuat kalender...</span>
    </div>
  ),
});

const StasiunPM25 = () => {
  const mapRef = useRef<L.Map | null>(null);
  const [stations, setStations] = useState<StationData[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boundaryJakarta, setBoundaryJakarta] = useState<GeoJSONType | null>(null); // Use GeoJSON type
  const [isSplitView, setIsSplitView] = useState(false);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  const createIcon = (imgName: string) =>
    L.icon({
      iconUrl: `/images/${imgName}`,
      iconSize: [37, 37],
      iconAnchor: [16, 37],
      popupAnchor: [0, -37],
      shadowUrl: undefined,
    });

  const getIconByPM25 = (pm25: number | null) => {
    if (pm25 === null || isNaN(pm25)) return createIcon("indikator_null.png");
    if (pm25 >= 0 && pm25 <= 50.9) return createIcon("indikator_baik.png");
    if (pm25 >= 51 && pm25 <= 100.9) return createIcon("indikator_sedang.png");
    if (pm25 >= 101 && pm25 <= 199.9) return createIcon("indikator_tidak_sehat.png");
    if (pm25 >= 200 && pm25 <= 299.9) return createIcon("indikator_sangat_tidak_sehat.png");
    if (pm25 >= 300) return createIcon("indikator_berbahaya.png");
    return createIcon("indikator_null.png");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pm25Response = await fetch("/api/pm25-aktual", { cache: "no-store" });
        if (!pm25Response.ok) throw new Error(`PM2.5 fetch failed: ${pm25Response.status}`);
        const pm25RawText = await pm25Response.text();
        const pm25CleanText = pm25RawText.replace(/NaN/g, "null");
        const pm25Data = JSON.parse(pm25CleanText);

        if (Array.isArray(pm25Data)) {
          setStations(pm25Data);
        } else {
          setStations([]);
          const errorMessage = pm25Data.message?.includes("Tidak ada data PM2.5") ? "Tidak ada data PM2.5 tersedia untuk tanggal ini" : "Gagal memuat data stasiun";
          setError(errorMessage);
        }

        const weatherResponse = await fetch("/api/weather", { cache: "no-store" });
        if (!weatherResponse.ok) throw new Error(`Weather fetch failed: ${weatherResponse.status}`);
        const weather = await weatherResponse.json();
        setWeatherData(Array.isArray(weather) ? weather : []);

        const boundaryResponse = await fetch("/data/batas_kelurahan_jakarta.geojson");
        if (!boundaryResponse.ok) throw new Error(`Boundary fetch failed: ${boundaryResponse.status}`);
        const boundaryData = await boundaryResponse.json();
        setBoundaryJakarta(boundaryData);
      } catch {
        setError("Terjadi kesalahan saat memuat data peta");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getWeatherForStation = (stationName: string) => {
    return weatherData.find((w) => w.station_name === stationName);
  };

  const handleMarkerClick = (station: StationData) => {
    setSelectedStation(station.station_name);
    setIsSplitView(true);
    if (mapRef.current) {
      mapRef.current.setView([station.latitude, station.longitude], 14);
    }
  };

  const toggleSplitView = () => {
    setIsSplitView(!isSplitView);
    if (isSplitView) {
      setSelectedStation(null);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className={styles.spinner}></div>
          <span className="text-lg font-medium text-gray-700">Memuat data stasiun...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className={`relative ${isSplitView ? "h-screen" : "h-full"} w-full`}>
        {error && (
          <div className={styles.alert}>
            <div className={styles.alertContent}>
              <span className="text-red-500 font-semibold">{error}</span>
              <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
                Tutup
              </button>
            </div>
          </div>
        )}
        <div className={`flex h-full ${isSplitView ? "flex-row" : ""}`}>
          <div className={`${isSplitView ? "w-1/2" : "w-full"} h-full relative`}>
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
              zoomControl={false}
              ref={mapRef}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />

              {boundaryJakarta && (
                <GeoJSON
                  data={boundaryJakarta}
                  style={() => ({
                    color: "#257285",
                    weight: 0.3,
                    fillColor: "#FFFFFF",
                    fillOpacity: 0.01,
                  })}
                />
              )}

              {Array.isArray(stations) &&
                stations.length > 0 &&
                stations.map((station, index) => {
                  const weather = getWeatherForStation(station.station_name);
                  const icon = getIconByPM25(station.pm25_value);

                  return (
                    <Marker
                      key={index}
                      position={[station.latitude, station.longitude]}
                      icon={icon}
                      eventHandlers={{
                        click: () => handleMarkerClick(station),
                      }}
                    >
                      <Popup>
                        <div className="font-bold">Stasiun: {station.station_name}</div>
                        <div className="font-bold">PM2.5: {station.pm25_value !== null && !isNaN(station.pm25_value) ? station.pm25_value.toFixed(2) : "Tidak tersedia"}</div>
                        <div
                          className="text-white font-semibold px-2 py-1 rounded mt-1 mb-1 inline-block"
                          style={{
                            backgroundColor:
                              station.pm25_value === null || isNaN(station.pm25_value)
                                ? "#6c757d"
                                : station.pm25_value <= 50.9
                                ? "#00CC00"
                                : station.pm25_value <= 100.9
                                ? "#0133FF"
                                : station.pm25_value <= 199.9
                                ? "#FFC900"
                                : station.pm25_value <= 299.9
                                ? "#FF0000"
                                : "#000000",
                          }}
                        >
                          {station.pm25_value === null || isNaN(station.pm25_value)
                            ? "Kualitas: Tidak tersedia"
                            : station.pm25_value <= 50.9
                            ? "Kualitas: BAIK"
                            : station.pm25_value <= 100.9
                            ? "Kualitas: SEDANG"
                            : station.pm25_value <= 199.9
                            ? "Kualitas: TIDAK SEHAT"
                            : station.pm25_value <= 299.9
                            ? "Kualitas: SANGAT TIDAK SEHAT"
                            : "Kualitas: BERBAHAYA"}
                        </div>
                        {weather ? (
                          <div className="mt-2 text-sm">
                            <div>Suhu: {weather.temperature} °C</div>
                            <div>Curah hujan: {weather.precipitation} mm</div>
                            <div>Kelembaban: {weather.humidity} %</div>
                            <div>Arah angin {weather.wind_dir}°</div>
                            <div>Kec. angin: {weather.wind_speed} km/h</div>
                          </div>
                        ) : (
                          <div className="mt-2 text-sm italic text-gray-500">Data cuaca tidak tersedia</div>
                        )}
                      </Popup>
                    </Marker>
                  );
                })}
            </MapContainer>

            <div className={styles.legend}>
              <h4>Indikator PM2.5 (µg/m³)</h4>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: "rgba(0, 204, 0, 0.7)" }}></span>
                <span>Baik (0 - 50)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: "rgba(1, 51, 255, 0.7)" }}></span>
                <span>Sedang (51 - 100)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: "rgba(255, 201, 0, 0.7)" }}></span>
                <span>Tidak Sehat (101 - 199)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: "rgba(255, 0, 0, 0.7)" }}></span>
                <span>Sangat Tidak Sehat (200 - 299)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: "rgba(34, 34, 34, 1)" }}></span>
                <span>Berbahaya (&gt; 300)</span>
              </div>
            </div>
          </div>

          {isSplitView && (
            <button onClick={toggleSplitView} className={styles.toggleButton} title="Close Calendar">
              <FiChevronRight size={20} />
            </button>
          )}

          {isSplitView && selectedStation && (
            <div className="w-1/2 h-full overflow-auto">
              <Calendar location={selectedStation} isSplitView={true} showRightPanel={false} showHeader={false} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StasiunPM25;
