"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/navbar/Navbar";
import styles from "../../styles/pm25act.module.css";
import { FiChevronRight } from "react-icons/fi";
import { getStaticPM25Color } from "@/utils/color";
import { BoundaryGeoJSONData, StationData, WeatherData } from "@/app/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getBoundaryStyle } from "@/utils/map";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });

const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center">
      <div className={styles.spinner}></div>
      <span style={{ color: 'black' }}>Memuat kalender...</span>
    </div>
  ),
});

const MapComponent = React.memo(
  ({
    stations,
    boundaryJakarta,
    getIconByPM25,
    getWeatherForStation,
    handleMarkerClick,
    mapRef,
  }: {
    stations: StationData[];
    weatherData: WeatherData[];
    boundaryJakarta: BoundaryGeoJSONData | null;
    getIconByPM25: (pm25: number | null) => L.Icon;
    getWeatherForStation: (stationName: string) => WeatherData | undefined;
    handleMarkerClick: (station: StationData, layer: L.Marker) => void;
    mapRef: React.MutableRefObject<L.Map | null>;
    isSplitView: boolean;
  }) => {
    const handleMapReady = useCallback(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
        console.log("Map initialized and size invalidated");
      }
    }, [mapRef]);

    return (
      <MapContainer
        key={`map-${stations.length}`}
        center={[-6.1754, 106.8272]}
        zoom={12}
        minZoom={12}
        maxZoom={16}
        maxBounds={[
          [-6.45, 106.55],
          [-5.9, 107.15],
        ]}
        maxBoundsViscosity={1}
        className={`h-full w-full ${styles.mapContainer}`}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        ref={mapRef}
        whenReady={handleMapReady}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
        {boundaryJakarta && <GeoJSON data={boundaryJakarta} style={getBoundaryStyle} />}
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
                  click: (e) => handleMarkerClick(station, e.target),
                }}
              >
                <Popup>
                  <div className="font-bold">Stasiun: {station.station_name}</div>
                  <div className="font-bold">PM2.5: {station.pm25_value !== null && !isNaN(station.pm25_value) ? station.pm25_value.toFixed(2) : "Tidak tersedia"}</div>
                  <div className="text-white font-semibold px-2 py-1 rounded mt-1 mb-1 inline-block" style={{ backgroundColor: getStaticPM25Color(station.pm25_value) }}>
                    {station.pm25_value === null || isNaN(station.pm25_value)
                      ? "Kualitas: Tidak tersedia"
                      : station.pm25_value <= 50
                      ? "Kualitas: BAIK"
                      : station.pm25_value <= 100
                      ? "Kualitas: SEDANG"
                      : station.pm25_value <= 199
                      ? "Kualitas: TIDAK SEHAT"
                      : station.pm25_value <= 299
                      ? "Kualitas: SANGAT TIDAK SEHAT"
                      : "Kualitas: BERBAHAYA"}
                  </div>
                  {weather ? (
                    <div className="mt-2 text-sm">
                      <div>Suhu: {weather.temperature.toFixed(1)} °C</div>
                      <div>Curah hujan: {weather.precipitation.toFixed(1)} mm</div>
                      <div>Kelembaban: {weather.humidity.toFixed(1)} %</div>
                      <div>Arah angin {weather.wind_dir}°</div>
                      <div>Kec. angin: {weather.wind_speed.toFixed(1)} km/h</div>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm italic text-gray-500">Data cuaca tidak tersedia</div>
                  )}
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    );
  }
);
MapComponent.displayName = "MapComponent";

const StasiunPM25 = () => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeMarkerRef = useRef<L.Marker | null>(null);
  const [stations, setStations] = useState<StationData[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boundaryJakarta, setBoundaryJakarta] = useState<BoundaryGeoJSONData | null>(null);
  const [isSplitView, setIsSplitView] = useState(false);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const createIcon = useCallback(
    (imgName: string) =>
      L.icon({
        iconUrl: `/images/${imgName}`,
        iconSize: [37, 37],
        iconAnchor: [16, 37],
        popupAnchor: [0, -37],
        shadowUrl: undefined,
      }),
    []
  );

  const getIconByPM25 = useCallback(
    (pm25: number | null) => {
      if (pm25 === null || isNaN(pm25)) return createIcon("indikator_null.png");
      if (pm25 <= 50) return createIcon("indikator_baik.png");
      if (pm25 <= 100) return createIcon("indikator_sedang.png");
      if (pm25 <= 199) return createIcon("indikator_tidak_sehat.png");
      if (pm25 <= 299) return createIcon("indikator_sangat_tidak_sehat.png");
      return createIcon("indikator_berbahaya.png");
    },
    [createIcon]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pm25Response, weatherResponse, boundaryResponse] = await Promise.all([
        fetch("/api/pm25-aktual", { cache: "no-store" }),
        fetch("/api/weather", { cache: "no-store" }),
        fetch("/data/batas_kelurahan_jakarta.geojson", { cache: "no-store" }),
      ]);

      if (!pm25Response.ok) throw new Error(`PM2.5 fetch failed: ${pm25Response.status}`);
      const pm25RawText = await pm25Response.text();
      const pm25CleanText = pm25RawText.replace(/NaN/g, "null");
      const pm25Data = JSON.parse(pm25CleanText);
      if (pm25Data.error) throw new Error(pm25Data.error || "Gagal memuat data PM2.5");

      if (Array.isArray(pm25Data)) {
        setStations(pm25Data);
      } else {
        setStations([]);
        throw new Error(pm25Data.message?.includes("Tidak ada data PM2.5") ? "Tidak ada data PM2.5 tersedia" : "Gagal memuat data stasiun");
      }

      if (!weatherResponse.ok) throw new Error(`Weather fetch failed: ${weatherResponse.status}`);
      const weatherData = await weatherResponse.json();
      if (weatherData.error) throw new Error(weatherData.error || "Gagal memuat data cuaca");
      setWeatherData(Array.isArray(weatherData) ? weatherData : []);

      if (!boundaryResponse.ok) throw new Error(`Boundary fetch failed: ${boundaryResponse.status}`);
      const boundaryData = await boundaryResponse.json();
      if (boundaryData.error) throw new Error(boundaryData.error || "Gagal memuat data batas wilayah");
      setBoundaryJakarta(boundaryData);

      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError((err as Error).message || "Terjadi kesalahan saat memuat data peta");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
          mapRef.current = null;
          console.log("Map instance cleaned up");
        } catch (err) {
          console.error("Error during map cleanup:", err);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
          console.log(`Map invalidated size due to split view change: isSplitView=${isSplitView}`);
          if (isSplitView && selectedStation && activeMarkerRef.current) {
            activeMarkerRef.current.openPopup();
            console.log(`Popup opened for station: ${selectedStation} after invalidateSize`);
          } else if (!isSplitView) {
            console.log("Split view closed, map resized to fullsize");
          }
        }
      }, 300);
    }
  }, [isSplitView, selectedStation]);

  const getWeatherForStation = useCallback(
    (stationName: string) => {
      return weatherData.find((w) => w.station_name === stationName);
    },
    [weatherData]
  );

  const handleMarkerClick = useCallback(
    (station: StationData, layer: L.Marker) => {
      setSelectedStation(station.station_name);
      activeMarkerRef.current = layer;
      setIsSplitView(true);
      if (mapRef.current) {
        mapRef.current.setView([station.latitude, station.longitude], 14);
        console.log(`Map view set to station: ${station.station_name}, center: [${station.latitude}, ${station.longitude}]`);
      }
    },
    [mapRef]
  );

  const handleStationChange = useCallback(
    (stationName: string) => {
      const selected = stations.find((s) => s.station_name === stationName);
      if (selected && mapRef.current) {
        setSelectedStation(stationName);
        mapRef.current.setView([selected.latitude, selected.longitude], 14);
        console.log(`Station changed from dropdown: ${stationName}, center: [${selected.latitude}, ${selected.longitude}]`);
        mapRef.current.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            const latlng = layer.getLatLng();
            if (latlng.lat === selected.latitude && latlng.lng === selected.longitude) {
              activeMarkerRef.current = layer;
              layer.openPopup();
              console.log(`Popup opened for station: ${stationName} from dropdown`);
            }
          }
        });
      } else {
        console.log(`Station ${stationName} not found or map not ready`);
      }
    },
    [stations, mapRef]
  );

  const toggleSplitView = useCallback(() => {
    setIsSplitView((prev) => {
      if (prev) {
        setSelectedStation(null);
        activeMarkerRef.current = null;
        console.log("Split view closed, resetting selected station and marker");
      } else {
        if (!selectedStation) {
          const defaultStation = stations.find((s) => s.station_name === "bundaran_hi");
          if (defaultStation && mapRef.current) {
            setSelectedStation("bundaran_hi");
            mapRef.current.setView([defaultStation.latitude, defaultStation.longitude], 14);
            console.log("No station selected, defaulting to bundaran_hi");
            mapRef.current.eachLayer((layer) => {
              if (layer instanceof L.Marker) {
                const latlng = layer.getLatLng();
                if (latlng.lat === defaultStation.latitude && latlng.lng === defaultStation.longitude) {
                  activeMarkerRef.current = layer;
                  layer.openPopup();
                  console.log("Popup opened for default station: bundaran_hi");
                }
              }
            });
          } else {
            console.log("Default station bundaran_hi not found or map not ready");
          }
        }
      }
      return !prev;
    });
  }, [selectedStation, stations, mapRef]);

  const memoizedMap = useMemo(
    () => (
      <MapComponent
        stations={stations}
        weatherData={weatherData}
        boundaryJakarta={boundaryJakarta}
        getIconByPM25={getIconByPM25}
        getWeatherForStation={getWeatherForStation}
        handleMarkerClick={handleMarkerClick}
        mapRef={mapRef}
        isSplitView={isSplitView}
      />
    ),
    [stations, weatherData, boundaryJakarta, getIconByPM25, getWeatherForStation, handleMarkerClick, isSplitView]
  );

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className={styles.spinner}></div>
          <span style={{ color: 'black' }}>Memuat peta...</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className={styles.spinner}></div>
          <span style={{ color: 'black' }}>Memuat data stasiun...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className={`relative min-h-screen w-full flex ${isSplitView ? "flex-row" : "flex-col"}`}>
        {error && (
          <div className={styles.alert}>
            <div className={styles.alertContent}>
              <span className="text-red-500 font-semibold">{error}</span>
              <button onClick={fetchData} className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2">
                Coba Lagi
              </button>
              <button onClick={() => setError(null)} className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
                Tutup
              </button>
            </div>
          </div>
        )}
        <div className={`flex w-full h-screen ${isSplitView ? "flex-row" : "flex-col"}`}>
          <div className={`${isSplitView ? "w-1/2" : "w-full"} h-full relative`} ref={containerRef}>
            {memoizedMap}
            <div className={styles.legend}>
              <h4>Indikator PM2.5 (µg/m³)</h4>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: 'rgba(0, 204, 0, 0.7)' }} />
                <span>Baik (0 - 50)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: 'rgba(1, 51, 255, 0.7)' }} />
                <span>Sedang (51 - 100)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: 'rgba(255, 201, 0, 0.7)' }} />
                <span>Tidak Sehat (101 - 199)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: 'rgba(255, 0, 0, 0.7)' }} />
                <span>Sangat Tidak Sehat (200 - 299)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: 'rgba(34, 34, 34, 0.7)' }} />
                <span>Berbahaya (&gt;300)</span>
              </div>
            </div>
          </div>
          {isSplitView && selectedStation && (
            <div className="w-1/2 h-full overflow-auto">
              <Calendar location={selectedStation} isSplitView={true} showRightPanel={false} splitViewContainer={styles.splitViewContainer} onStationChange={handleStationChange} />
            </div>
          )}
          <button onClick={toggleSplitView} className={`${styles.toggleButton} ${isSplitView ? styles.splitView : ""}`} title={isSplitView ? "Tutup Kalender" : "Buka Kalender"}>
            <FiChevronRight size={20} className={isSplitView ? "" : "rotate-180"} />
          </button>
        </div>
      </div>
    </>
  );
};

export default StasiunPM25;