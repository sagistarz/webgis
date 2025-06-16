"use client";
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, GeoJSON, Pane } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import HeatmapLayer from "./HeatMapLayer";
import styles from "./map.module.css";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import dynamic from "next/dynamic";
import { OpenStreetMapProvider, GeoSearchControl } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import * as turf from "@turf/turf";
import { Geometry, Polygon, MultiPolygon } from "geojson";

interface FeatureProperties {
  aod_value: number;
}

interface BoundaryProperties {
  NAMOBJ: string;
}

interface Feature {
  type: string;
  id: number;
  properties: FeatureProperties;
  geometry: Polygon | MultiPolygon;
}

interface BoundaryFeature {
  type: string;
  properties: BoundaryProperties;
  geometry: Polygon | MultiPolygon;
}

interface GeoJSONData {
  type: string;
  features: Feature[];
}

interface BoundaryGeoJSONData {
  type: string;
  features: BoundaryFeature[];
}

const Calendar = dynamic(() => import("../../calendar/page"), {
  ssr: false,
  loading: () => <div>Loading calendar...</div>,
});

const createEmojiMarker = () => {
  return L.divIcon({
    html: '<div style="font-size:24px">📍</div>',
    className: "emoji-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
};

const JakartaMap = () => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);
  const tooltipRef = useRef<L.Tooltip | null>(null);
  const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
  const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isSplitView, setIsSplitView] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const updateMarker = (latlng: L.LatLng) => {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    markerRef.current = L.marker(latlng, {
      icon: createEmojiMarker(),
    }).addTo(mapRef.current!);
  };

  const fetchData = async (date?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      let aodResponse;
      const today = getTodayDate();
      console.log(`Fetching data for date: ${date || "current"}; Today: ${today}`);

      if (!date || date === today) {
        console.log("Mengambil data dari /api/aod");
        aodResponse = await fetch("/api/aod");
      } else {
        console.log(`Mengambil data dari /api/aod-by-date untuk tanggal: ${date}`);
        aodResponse = await fetch("/api/aod-by-date", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tanggal: date }),
        });
      }

      if (!aodResponse.ok) {
        const errorData = await aodResponse.json();
        throw new Error(errorData.details || `HTTP error! status: ${aodResponse.status}`);
      }
      const aodData = await aodResponse.json();
      console.log("Fetched AOD Data:", aodData);
      console.log(
        "AOD Values:",
        aodData.features.map((f) => f.properties.aod_value)
      );
      setGeoData(aodData);

      // Fetch boundary data
      const boundaryResponse = await fetch("/data/batas_kelurahan_jakarta.geojson");
      if (!boundaryResponse.ok) throw new Error(`Failed to load boundary data: ${boundaryResponse.status}`);
      const boundaryData = await boundaryResponse.json();
      console.log("Fetched Boundary Data:", boundaryData);
      setBoundaryData(boundaryData);
    } catch (error) {
      setError(`Gagal memuat data: ${error instanceof Error ? error.message : "Kesalahan tidak diketahui"}`);
      setGeoData(null);
      setBoundaryData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (geoJsonRef.current && mapRef.current && geoData) {
      console.log(
        "Memperbarui layer GeoJSON dengan data baru:",
        geoData.features.map((f) => f.properties.aod_value)
      );
      geoJsonRef.current.clearLayers();
      geoJsonRef.current.addData(geoData as any);
      geoJsonRef.current.eachLayer((layer) => {
        const feature = (layer as any).feature;
        if (feature) {
          layer.setStyle(styleFeature(feature as Feature));
        }
      });
    }
  }, [geoData]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    console.log("Tanggal Dipilih:", date);
    setSelectedDate(date);
    fetchData(date);
  };

  const MapHandler = () => {
    const map = useMap();
    useEffect(() => {
      mapRef.current = map;
      return () => {
        mapRef.current = null;
      };
    }, [map]);

    useEffect(() => {
      if (showHeatmap || !geoData || !boundaryData) {
        if (tooltipRef.current) {
          tooltipRef.current.remove();
          tooltipRef.current = null;
        }
        return;
      }

      const handleMouseMove = (e: L.LeafletMouseEvent) => {
        if (tooltipRef.current) {
          tooltipRef.current.remove();
          tooltipRef.current = null;
        }

        const point = turf.point([e.latlng.lng, e.latlng.lat]);
        const aodFeature = geoData.features.find((feature) => {
          const polygon = feature.geometry.type === "Polygon" ? turf.polygon(feature.geometry.coordinates) : turf.multiPolygon(feature.geometry.coordinates);
          return turf.booleanPointInPolygon(point, polygon);
        });

        const boundaryFeature = boundaryData.features.find((bf) => {
          const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
          return turf.booleanPointInPolygon(point, polygon);
        });

        if (aodFeature || boundaryFeature) {
          const tooltipContent = getTooltipContent(aodFeature || null, boundaryFeature || null);
          tooltipRef.current = L.tooltip({
            sticky: true,
            direction: "top",
            offset: [0, -20],
            className: "custom-tooltip",
          })
            .setLatLng(e.latlng)
            .setContent(tooltipContent)
            .addTo(map);
        }
      };

      map.on("mousemove", handleMouseMove);

      return () => {
        map.off("mousemove", handleMouseMove);
        if (tooltipRef.current) {
          tooltipRef.current.remove();
        }
      };
    }, [map, geoData, boundaryData, showHeatmap]);

    return null;
  };

  const handleZoomToFeature = (feature: Feature) => {
    if (mapRef.current && feature.geometry) {
      const layer = L.geoJSON(feature.geometry);
      mapRef.current.fitBounds(layer.getBounds(), {
        padding: [50, 50],
        maxZoom: 16,
      });
    }
  };

  const handleFeatureClick = (feature: Feature) => {
    setSelectedFeature(feature);
    setIsSplitView(true);
    handleZoomToFeature(feature);

    const center = L.geoJSON(feature.geometry).getBounds().getCenter();
    updateMarker(center);
  };

  const toggleSplitView = () => {
    setIsSplitView(!isSplitView);
  };

  const SearchControl = ({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) => {
    const map = useMap();

    useEffect(() => {
      if (!map) return;

      const provider = new OpenStreetMapProvider();
      const searchControl = new (GeoSearchControl as any)({
        provider,
        style: "bar",
        showMarker: false,
        showPopup: false,
        autoClose: true,
        retainZoomLevel: false,
        animateZoom: true,
        keepResult: true,
        searchLabel: "Cari lokasi...",
      });

      const handleSearchResult = (result: any) => {
        const { x: lng, y: lat } = result.location;
        updateMarker(L.latLng(lat, lng));
      };

      map.on("geosearch/showlocation", handleSearchResult);

      map.addControl(searchControl);
      mapRef.current = map;

      return () => {
        map.off("geosearch/showlocation", handleSearchResult);
        map.removeControl(searchControl);
      };
    }, [map]);

    return null;
  };

  const getColorByAOD = (aodValue: number): string => {
    if (aodValue < 0.4) return "rgba(0, 204, 0, 0.7)"; // Hijau
    if (aodValue < 0.5) return "rgba(1, 51, 255, 0.7)"; // Biru
    if (aodValue < 0.6) return "rgba(255, 201, 0, 0.7)"; // Kuning
    return "rgba(255, 0, 0, 0.8)"; // Merah
  };

  const styleFeature = (feature: Feature) => {
    const style = {
      fillColor: getColorByAOD(feature.properties.aod_value),
      weight: 1,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.7,
    };
    console.log("Menerapkan style untuk feature:", feature.properties.aod_value, style);
    return style;
  };

  const styleBoundary = () => ({
    weight: 1,
    opacity: 0.8,
    color: "#86CEE0",
    fillOpacity: 0,
  });

  const getTooltipContent = (aodFeature: Feature | null, boundaryFeature: BoundaryFeature | null): string => {
    const aodValue = aodFeature ? aodFeature.properties.aod_value.toFixed(4) : "-";
    const aodColor = aodFeature ? getColorByAOD(aodFeature.properties.aod_value) : "#808080";
    const kelurahanName = boundaryFeature ? boundaryFeature.properties.NAMOBJ : "Unknown";
    return `
      <div class="${styles.customTooltip}">
        <div class="${styles.kelurahanName}">${kelurahanName}</div>
        <div class="${styles.aodContainer}">
          <div class="${styles.aodCircle}" style="background-color: ${aodColor};">
            ${aodValue}
          </div>
        </div>
      </div>
    `;
  };

  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, []);

  return (
    <div className={`relative ${isSplitView ? "h-screen" : "h-full"} w-full`}>
      <div className={`flex h-full ${isSplitView ? "flex-row" : ""}`}>
        <div className={`${isSplitView ? "w-1/2" : "w-full"} h-full relative`}>
          <div className={styles.toggle}>
            <label className={styles.toggleLabel}>
              <input type="checkbox" checked={showHeatmap} onChange={() => setShowHeatmap(!showHeatmap)} />
              Heatmap
            </label>
            <div className={styles.dateInputContainer}>
              <label htmlFor="dateInput" className={styles.dateInputLabel}>
                Pilih Tanggal:{" "}
              </label>
              <input id="dateInput" type="date" value={selectedDate} onChange={handleDateChange} className={styles.dateInput} max={getTodayDate()} />
            </div>
          </div>

          {isLoading && (
            <div className={styles.spinnerOverlay}>
              <div className={styles.spinner}></div>
              <p>Memuat data...</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          )}

          <MapContainer
            center={[-6.1754, 106.8272]}
            zoom={isSplitView ? 14 : 12}
            className={styles.map}
            zoomControl={false}
            minZoom={11}
            maxZoom={18}
            maxBounds={[
              [-6.42, 106.64],
              [-5.98, 107.05],
            ]}
            maxBoundsViscosity={1.0}
          >
            <MapHandler />
            <Pane name="choropleth" style={{ zIndex: 400 }} />
            <Pane name="boundary" style={{ zIndex: 450 }} />
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/">CARTO</a>' />
            <SearchControl mapRef={mapRef} />
            {showHeatmap && geoData && <HeatmapLayer geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} />}
            {!showHeatmap && geoData && (
              <GeoJSON
                key={selectedDate || "current"}
                ref={geoJsonRef}
                data={geoData as any}
                style={(feature) => styleFeature(feature as Feature)}
                pane="choropleth"
                onEachFeature={(feature, layer) => {
                  layer.on({
                    click: () => handleFeatureClick(feature as Feature),
                    mouseover: (e) => {
                      const layer = e.target;
                      layer.setStyle({
                        weight: 2,
                        color: "#fff",
                        dashArray: "",
                        fillOpacity: 0.9,
                      });
                      layer.bringToFront();
                    },
                    mouseout: (e) => {
                      const layer = e.target;
                      layer.setStyle({
                        weight: 1,
                        color: "white",
                        dashArray: "3",
                        fillOpacity: 0.7,
                      });
                    },
                  });
                }}
              />
            )}
            {boundaryData && (
              <GeoJSON
                data={boundaryData as any}
                style={styleBoundary}
                pane="boundary"
                onEachFeature={(feature, layer) => {
                  layer.on({
                    mouseover: (e) => {
                      const layer = e.target;
                      layer.setStyle({
                        weight: 2,
                        color: "#86CEE0",
                        fillOpacity: 0.1,
                      });
                      layer.bringToFront();
                    },
                    mouseout: (e) => {
                      const layer = e.target;
                      layer.setStyle({
                        weight: 1,
                        color: "#86CEE0",
                        fillOpacity: 0,
                      });
                    },
                  });
                }}
              />
            )}
          </MapContainer>

          <button onClick={toggleSplitView} className={styles.toggleButton}>
            {isSplitView ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
          </button>

          {!isSplitView && (
            <div className={styles.legend}>
              <h4>Indikator AOD</h4>
              {[
                { color: "rgba(0, 204, 0, 0.7)", label: "Rendah (< 0.4)" },
                { color: "rgba(1, 51, 255, 0.7)", label: "Sedang (0.4 - 0.5)" },
                { color: "rgba(255, 201, 0, 0.7)", label: "Tinggi (0.5 - 0.6)" },
                { color: "rgba(255, 0, 0, 0.8)", label: "Sangat Tinggi (> 0.6)" },
              ].map((item, index) => (
                <div key={index} className={styles.legendItem}>
                  <span className={styles.legendColor} style={{ backgroundColor: item.color }}></span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {isSplitView && (
          <div className="w-1/2 h-full overflow-auto">
            <Calendar isSplitView={true} showRightPanel={false} showHeader={false} />
          </div>
        )}
      </div>
    </div>
  );
};

export default JakartaMap;
