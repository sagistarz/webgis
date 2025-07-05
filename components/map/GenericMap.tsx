"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import GenericHeatMapLayer from "@/components/map/GenericHeatMapLayer";
import SearchBar from "@/components/aod/SearchBar";
import { GeoJSONData, BoundaryGeoJSONData } from "@/app/types";
import * as GeoJSONTypes from "geojson";
import * as L from "leaflet";
import { getBoundaryStyle } from "@/utils/map";
import { interpolateAODColor, interpolatePM25Color } from "@/utils/color";

const customIcon = L.icon({
  iconUrl: "/images/marker_lokasi.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
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
  const tooltipRef = useRef<L.Tooltip | null>(null);
  const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
  const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [markerPosition, setMarkerPosition] = useState<L.LatLng | null>(null);

  const updateMarker = (latlng: L.LatLng) => {
    setMarkerPosition(latlng);
  };

  const resetMap = useCallback(() => {
    setMarkerPosition(null);
    if (mapRef.current) {
      mapRef.current.setView([-6.1754, 106.8272], 12);
    }
  }, []);

  const getTooltipContent = (value: number | null, kelurahanName: string): string => {
    const formattedValue = value !== null && value > 0 ? (dataType === "aod" ? value.toFixed(4) : value.toFixed(2)) : "No data";
    const color = value !== null && value > 0 ? (dataType === "aod" ? interpolateAODColor(value) : interpolatePM25Color(value)) : "rgba(160, 174, 192, 0.85)";
    const textColor = dataType === "aod" ? "#ffffff" : "#000000";
    return `
      <div class="customTooltip">
        <div class="kelurahanName">${kelurahanName}</div>
        <div class="valueContainer">
          <div class="valueCircle" style="background-color: ${color}; color: ${textColor}">
            ${formattedValue} ${dataType === "aod" || formattedValue === "No data" ? "" : "µg/m³"}
          </div>
        </div>
      </div>
    `;
  };

  const fetchData = useCallback(
    async (url: string, date?: string) => {
      setIsLoading(true);
      setError(null);
      setGeoData(null);
      try {
        const body = date ? JSON.stringify({ tanggal: date }) : undefined;
        const response = await fetch(url, {
          method: date ? "POST" : "GET",
          headers: date ? { "Content-Type": "application/json" } : undefined,
          body,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Tidak ditemukan data pada tanggal ini");
        }

        const rawText = await response.text();
        const cleanText = rawText.replace(/NaN/g, "null");
        const data = JSON.parse(cleanText);

        if (data.error) {
          throw new Error("Tidak ditemukan data pada tanggal ini");
        }

        if (!data.features || !Array.isArray(data.features) || data.features.length === 0) {
          throw new Error("Tidak ditemukan data pada tanggal ini");
        }

        const allZero = data.features.every((f: GeoJSONTypes.Feature<GeoJSONTypes.Point, { aod_value?: number; pm25_value?: number }>) => {
          const value = dataType === "aod" ? f.properties?.aod_value : f.properties?.pm25_value;
          return value === 0;
        });

        if (allZero) {
          throw new Error("Data pada hari ini bernilai 0.0");
        }

        const validFeatures = data.features.filter((f: GeoJSONTypes.Feature<GeoJSONTypes.Point, { aod_value?: number; pm25_value?: number }>) => {
          const value = dataType === "aod" ? f.properties?.aod_value : f.properties?.pm25_value;
          return f.geometry && value !== null && value !== undefined && !isNaN(value);
        });

        if (validFeatures.length === 0) {
          throw new Error("Data pada hari ini bernilai 0.0");
        }

        setGeoData({ ...data, features: validFeatures });
      } catch (err) {
        setGeoData(null);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data");
      } finally {
        setIsLoading(false);
      }
    },
    [dataType]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const [, boundary] = await Promise.all([fetchData(fetchUrl), fetch("/data/batas_kelurahan_jakarta.geojson", { cache: "no-store" })]);
        if (!boundary.ok) throw new Error(`Gagal memuat batas  wilayah`);
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

  useEffect(() => {
    setMarkerPosition(null); // Reset marker saat tanggal berubah
  }, [selectedDate]);

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    const today = new Date().toISOString().split("T")[0];
    const url = date === today ? fetchUrl : fetchByDateUrl;
    await fetchData(url, date === today ? undefined : date);
  };

  const handleMapReady = () => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      <div className="absolute top-16 left-4 z-[1000]">
        <SearchBar updateMarker={updateMarker} mapRef={mapRef} boundaryData={boundaryData} resetMap={resetMap} />
      </div>
      {error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-red-100 text-red-600 p-4 rounded-md shadow-md flex items-center gap-4">
          <span>{error}</span>
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
        {boundaryData && !error && (
          <GeoJSON
            data={boundaryData}
            style={getBoundaryStyle}
            onEachFeature={(feature, layer: L.GeoJSON) => {
              layer.on({
                mouseover: (e: L.LeafletMouseEvent) => {
                  if (error) return;
                  layer.setStyle({
                    weight: 1.2,
                    color: "#1a4971",
                    fillOpacity: 0.1,
                  });
                  layer.bringToFront();

                  const dataFeature = geoData?.features.find((f: GeoJSONTypes.Feature) => {
                    if (!f.geometry) return false;
                    try {
                      const point = L.latLng(e.latlng);
                      const isInside = L.geoJSON(f.geometry).getBounds().contains(point);
                      return isInside;
                    } catch {
                      return false;
                    }
                  });

                  const value = dataFeature ? (dataType === "aod" ? dataFeature.properties.aod_value ?? null : dataFeature.properties.pm25_value ?? null) : null;
                  const kelurahanName = feature.properties?.NAMOBJ || "Lokasi Tidak Dikenal";

                  if (tooltipRef.current) {
                    tooltipRef.current.remove();
                    tooltipRef.current = null;
                  }

                  tooltipRef.current = L.tooltip({
                    sticky: true,
                    direction: "top",
                    offset: [0, -20],
                    className: "customTooltip",
                  })
                    .setLatLng(e.latlng)
                    .setContent(getTooltipContent(value, kelurahanName))
                    .addTo(mapRef.current!);
                },
                mouseout: () => {
                  if (error) return;
                  layer.setStyle(getBoundaryStyle());
                  if (tooltipRef.current) {
                    tooltipRef.current.remove();
                    tooltipRef.current = null;
                  }
                },
              });
            }}
          />
        )}
        <GenericHeatMapLayer
          dataType={dataType}
          geoData={geoData}
          boundaryData={boundaryData}
          selectedDate={selectedDate}
          setSelectedDate={handleDateChange}
          isLoading={isLoading}
          legendTitle={legendTitle}
          inputRef={inputRef}
          fetchUrl={fetchUrl}
          fetchByDateUrl={fetchByDateUrl}
        />
        {markerPosition && <Marker position={markerPosition} icon={customIcon} />}
      </MapContainer>
    </div>
  );
};

export default GenericMap;