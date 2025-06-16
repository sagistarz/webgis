"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, GeoJSON, Pane } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import Navbar from "../components/navbar/page";
import styles from "./map.module.css";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { OpenStreetMapProvider, GeoSearchControl } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import HeatMapLayer from "./HeatMapLayer";
import dynamic from "next/dynamic";
import * as turf from "@turf/turf";

interface FeatureProperties {
  pm25_value: number;
  name?: string;
}

interface BoundaryProperties {
  NAMOBJ: string;
}

interface Feature {
  type: string;
  id: number;
  properties: FeatureProperties;
  geometry: turf.Polygon | turf.MultiPolygon;
}

interface BoundaryFeature {
  type: string;
  properties: BoundaryProperties;
  geometry: turf.Polygon | turf.MultiPolygon;
}

interface GeoJSONData {
  type: string;
  features: Feature[];
}

interface BoundaryGeoJSONData {
  type: string;
  features: BoundaryFeature[];
}

const Calendar = dynamic(() => import("../calendar/page"), {
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

const getColorByPM25 = (pm25Value: number): string => {
  if (pm25Value <= 50) return "rgba(0, 204, 0, 0.7)"; // Baik
  if (pm25Value <= 100) return "rgba(1, 51, 255, 0.7)"; // Sedang
  if (pm25Value <= 150) return "rgba(255, 201, 0, 0.7)"; // Tidak Sehat
  if (pm25Value <= 200) return "rgba(255, 102, 0, 0.7)"; // Sangat Tidak Sehat
  if (pm25Value <= 300) return "rgba(255, 0, 0, 0.7)"; // Berbahaya
  return "rgba(153, 0, 76, 0.8)"; // Sangat Berbahaya
};

const getPM25Category = (value: number): string => {
  if (value <= 50) return "Baik";
  if (value <= 100) return "Sedang";
  if (value <= 150) return "Tidak Sehat untuk Grup Sensitif";
  if (value <= 200) return "Tidak Sehat";
  if (value <= 300) return "Sangat Tidak Sehat";
  return "Berbahaya";
};

const getTooltipContent = (pm25Feature: Feature | null, kelurahanName: string): string => {
  const pm25Value = pm25Feature ? pm25Feature.properties.pm25_value.toFixed(2) : "N/A";
  const pm25Color = pm25Feature ? getColorByPM25(pm25Feature.properties.pm25_value) : "#808080";
  return `
    <div class="${styles.customTooltip}">
      <div class="${styles.kelurahanName}">${kelurahanName}</div>
      <div class="${styles.aodContainer}">
        <div class="${styles.aodCircle}" style="background-color: ${pm25Color};">
          ${pm25Value}
        </div>
      </div>
    </div>
  `;
};

const JakartaMapPM25 = () => {
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
      let pm25Response;
      const today = getTodayDate();
      // console.log(`Fetching PM2.5 data for date: ${date || "current"}; Today: ${today}`);

      if (!date || date === today) {
        // console.log("Mengambil data PM2.5 dari /api/pm25");
        pm25Response = await fetch("/api/pm25", { cache: "no-store" });
      } else {
        // console.log(`Mengambil data PM2.5 historis untuk tanggal: ${date}`);
        pm25Response = await fetch("/api/pm25/pmbydate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tanggal: date }),
        });
      }

      if (!pm25Response.ok) {
        const errorData = await pm25Response.json();
        throw new Error(errorData.details || `HTTP error! status: ${pm25Response.status}`);
      }
      const pm25Data = await pm25Response.json();

      if (!pm25Data.features || !Array.isArray(pm25Data.features)) {
        throw new Error("Tidak ada data PM2.5 tersedia untuk tanggal ini");
      }

      // console.log(
      //   "PM2.5 Values:",
      //   pm25Data.features.map((f: Feature) => f.properties.pm25_value)
      // );
      setGeoData(pm25Data);

      const boundaryResponse = await fetch("/data/batas_kelurahan_jakarta.geojson");
      if (!boundaryResponse.ok) throw new Error(`Failed to load boundary data: ${boundaryResponse.status}`);
      const boundaryData = await boundaryResponse.json();
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
        "Memperbarui layer GeoJSON dengan data PM2.5 baru:",
        geoData.features.map((f) => f.properties.pm25_value)
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
        const pm25Feature = geoData.features.find((feature) => {
          const polygon = feature.geometry.type === "Polygon" ? turf.polygon(feature.geometry.coordinates) : turf.multiPolygon(feature.geometry.coordinates);
          return turf.booleanPointInPolygon(point, polygon);
        });

        const boundaryFeature = boundaryData.features.find((bf) => {
          const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
          return turf.booleanPointInPolygon(point, polygon);
        });

        if (pm25Feature && boundaryFeature) {
          const tooltipContent = getTooltipContent(pm25Feature, boundaryFeature.properties.NAMOBJ);
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

  const SearchControl = () => {
    const map = useMap();

    useEffect(() => {
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
        searchLabel: "Cari lokasi di Jakarta...",
      });

      const handleSearchResult = (result: any) => {
        const { x: lng, y: lat } = result.location;
        updateMarker(L.latLng(lat, lng));
      };

      map.on("geosearch/showlocation", handleSearchResult);
      map.addControl(searchControl);

      return () => {
        map.off("geosearch/showlocation", handleSearchResult);
        map.removeControl(searchControl);
      };
    }, [map]);

    return null;
  };

  const styleFeature = (feature: Feature) => ({
    fillColor: getColorByPM25(feature.properties.pm25_value),
    weight: 1,
    opacity: 1,
    color: "white",
    dashArray: "3",
    fillOpacity: 0.7,
  });

  const styleBoundary = () => ({
    weight: 1,
    opacity: 0.8,
    color: "#86CEE0",
    fillOpacity: 0,
  });

  const findPM25FeatureAtLatLng = (latlng: L.LatLng): Feature | null => {
    if (!geoData) return null;
    const point = turf.point([latlng.lng, latlng.lat]);
    for (const feature of geoData.features) {
      const polygon = feature.geometry.type === "Polygon" ? turf.polygon(feature.geometry.coordinates) : turf.multiPolygon(feature.geometry.coordinates);
      if (turf.booleanPointInPolygon(point, polygon)) {
        return feature;
      }
    }
    return null;
  };

  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, []);

  return (
    <>
      <Navbar />
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
                <p>Memuat data PM2.5...</p>
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
                [-5.98, 107.0],
              ]}
              maxBoundsViscosity={1.0}
            >
              <MapHandler />
              <Pane name="choropleth" style={{ zIndex: 400 }} />
              <Pane name="divisions" style={{ zIndex: 450 }} />
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/attributions">CartoDB</a> & <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
              <SearchControl />
              {showHeatmap && geoData && <HeatMapLayer geoData={geoData} selectedDate={selectedDate} />}
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

                        // Find corresponding boundary feature
                        const point = turf.point([e.latlng.lng, e.latlng.lat]);
                        const boundaryFeature = boundaryData?.features.find((bf) => {
                          const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
                          return turf.booleanPointInPolygon(point, polygon);
                        });

                        if (boundaryFeature) {
                          const tooltipContent = getTooltipContent(feature as Feature, boundaryFeature.properties.NAMOBJ);
                          L.tooltip({
                            sticky: true,
                            direction: "top",
                            offset: [0, -20],
                            className: "custom-tooltip",
                          })
                            .setLatLng(e.latlng)
                            .setContent(tooltipContent)
                            .addTo(mapRef.current!);
                        }
                      },
                      mouseout: (e) => {
                        const layer = e.target;
                        layer.setStyle({
                          weight: 1,
                          color: "white",
                          dashArray: "3",
                          fillOpacity: 0.7,
                        });
                        if (tooltipRef.current) {
                          tooltipRef.current.remove();
                          tooltipRef.current = null;
                        }
                      },
                    });
                  }}
                />
              )}
              {boundaryData && (
                <GeoJSON
                  data={boundaryData as any}
                  style={styleBoundary}
                  pane="divisions"
                  onEachFeature={(feature, layer) => {
                    layer.on({
                      click: (e) => {
                        const latlng = e.latlng;
                        const pm25Feature = findPM25FeatureAtLatLng(latlng);
                        const pm25Value = pm25Feature ? pm25Feature.properties.pm25_value.toFixed(2) : "N/A";
                        const category = pm25Feature ? getPM25Category(pm25Feature.properties.pm25_value) : "";
                        const popupContent = `
                          <div class="${styles.customPopup}">
                            <div class="${styles.kelurahanName}">${feature.properties.NAMOBJ}</div>
                            <div class="${styles.aodContainer}">
                              <div>PM2.5: ${pm25Value} µg/m³</div>
                              <div>(${category})</div>
                            </div>
                          </div>
                        `;
                        L.popup({ className: "custom-popup" }).setLatLng(latlng).setContent(popupContent).openOn(mapRef.current!);
                      },
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
                <h4>Indikator PM2.5 (µg/m³)</h4>
                {[
                  { color: "rgba(0, 204, 0, 0.7)", label: "Baik (0 - 50)" },
                  { color: "rgba(1, 51, 255, 0.7)", label: "Sedang (51 - 100)" },
                  { color: "rgba(255, 201, 0, 0.7)", label: "Tidak Sehat (101  - 199)" },
                  { color: "rgba(255, 0, 0, 0.7)", label: "Sangat Tidak Sehat (200 - 299)" },
                  { color: "rgba(0, 0, 0, 0.8)", label: "Berbahaya (> 300)" },
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
    </>
  );
};

export default JakartaMapPM25;
