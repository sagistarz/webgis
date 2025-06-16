"use client";

import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import * as turf from "@turf/turf";
import styles from "./map.module.css";

interface PM25Feature {
  geometry: turf.Polygon | turf.MultiPolygon;
  properties: { pm25_value: number; name?: string };
}

interface BoundaryProperties {
  NAMOBJ: string;
}

interface BoundaryFeature {
  type: string;
  properties: BoundaryProperties;
  geometry: turf.Polygon | turf.MultiPolygon;
}

interface BoundaryGeoJSONData {
  type: string;
  features: BoundaryFeature[];
}

interface GeoJSONData {
  type: string;
  features: PM25Feature[];
}

interface Gradient {
  [key: number]: string;
}

interface HeatMapLayerProps {
  geoData: GeoJSONData | null;
  selectedDate: string;
}

const HeatMapLayer = ({ geoData, selectedDate }: HeatMapLayerProps) => {
  const [heatPoints, setHeatPoints] = useState<[number, number, number][]>([]);
  const [boundaryData, setBoundaryData] = useState<BoundaryGeoJSONData | null>(null);
  const [maxPM25, setMaxPM25] = useState<number>(0);
  const [activeKelurahan, setActiveKelurahan] = useState<string | null>(null);
  const map = useMap();
  const tooltipRef = useRef<L.Tooltip | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPosition = useRef<{ lat: number; lng: number } | null>(null);

  const getColorByPM25 = (pm25Value: number): string => {
    if (pm25Value <= 50) return "rgba(0, 204, 0, 0.7)"; // Baik
    if (pm25Value <= 100) return "rgba(1, 51, 255, 0.7)"; // Sedang
    if (pm25Value <= 150) return "rgba(255, 201, 0, 0.7)"; // Tidak Sehat
    if (pm25Value <= 200) return "rgba(255, 102, 0, 0.7)"; // Sangat Tidak Sehat
    if (pm25Value <= 300) return "rgba(255, 0, 0, 0.7)"; // Berbahaya
    return "rgba(153, 0, 76, 0.8)"; // Sangat Berbahaya
  };

  const getTooltipContent = (pm25Feature: PM25Feature | null, kelurahanName: string): string => {
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

  const generatePointsInPolygon = (polygon: turf.Polygon | turf.MultiPolygon, pm25: number, name?: string) => {
    const points: [number, number, number][] = [];
    const turfPolygon = polygon.type === "Polygon" ? turf.polygon(polygon.coordinates) : turf.multiPolygon(polygon.coordinates);

    const area = turf.area(turfPolygon);
    const bbox = turf.bbox(turfPolygon);

    const pointCount = Math.min(1000, Math.max(100, Math.floor(area / 10000)));

    if (area < 100000 && pm25 >= 201) {
      console.warn(`Poligon kecil (area: ${area.toFixed(2)} m², nama: ${name || "unknown"}) memiliki PM2.5 tinggi: ${pm25.toFixed(2)}`);
    }

    if (area < 100000) {
      const center = turf.centroid(turfPolygon);
      points.push([center.geometry.coordinates[1], center.geometry.coordinates[0], pm25]);
      const extraPoints = turf.randomPoint(5, { bbox });
      const pointsWithin = turf.pointsWithinPolygon(extraPoints, turfPolygon);
      pointsWithin.features.forEach((point) => {
        if (point.geometry?.coordinates) {
          points.push([point.geometry.coordinates[1], point.geometry.coordinates[0], pm25]);
        }
      });
    } else {
      const randomPoints = turf.randomPoint(pointCount, { bbox });
      const pointsWithin = turf.pointsWithinPolygon(randomPoints, turfPolygon);
      pointsWithin.features.forEach((point) => {
        if (point.geometry?.coordinates) {
          points.push([point.geometry.coordinates[1], point.geometry.coordinates[0], pm25]);
        }
      });
    }

    return points;
  };

  useEffect(() => {
    const fetchBoundaryData = async () => {
      try {
        const boundaryRes = await fetch("/data/batas_kelurahan_jakarta.geojson");
        if (!boundaryRes.ok) throw new Error("Gagal mengambil data batas");
        const boundaryData = await boundaryRes.json();
        setBoundaryData(boundaryData);
      } catch (error) {
        console.error("Error fetching boundary data:", error);
      }
    };

    fetchBoundaryData();
  }, []);

  useEffect(() => {
    if (!geoData || !geoData.features) {
      setHeatPoints([]);
      setMaxPM25(0);
      return;
    }

    let allPoints: [number, number, number][] = [];
    let maxPM25 = 0;
    let minPM25 = Infinity;

    console.log("PM2.5 Data Summary for Heatmap:");
    geoData.features.forEach((feature, index) => {
      const pm25 = feature.properties.pm25_value;
      maxPM25 = Math.max(maxPM25, pm25);
      minPM25 = Math.min(minPM25, pm25);
      const points = generatePointsInPolygon(feature.geometry, pm25, feature.properties.name);
      console.log(`Feature ${index}: PM2.5=${pm25.toFixed(2)}, Points=${points.length}`);
      allPoints.push(...points);
    });

    console.log(`Min PM2.5: ${minPM25}, Max PM2.5: ${maxPM25}, Total Points: ${allPoints.length}`);
    setHeatPoints(allPoints);
    setMaxPM25(maxPM25);
  }, [geoData, selectedDate]);

  useEffect(() => {
    if (!map || heatPoints.length === 0 || !boundaryData || !geoData) {
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
      return;
    }

    const normalizeValue = (value: number, maxPM25: number): number => {
      const CATEGORIES = {
        GOOD: 50,
        MODERATE: 100,
        UNHEALTHY_SENSITIVE: 150,
        UNHEALTHY: 200,
        VERY_UNHEALTHY: 300,
        HAZARDOUS: 1000,
      };
      if (maxPM25 <= CATEGORIES.MODERATE) {
        if (value <= CATEGORIES.GOOD) return (value / CATEGORIES.GOOD) * 0.2;
        return 0.2 + ((value - CATEGORIES.GOOD) / (CATEGORIES.MODERATE - CATEGORIES.GOOD)) * 0.2;
      }
      if (value <= CATEGORIES.GOOD) return (value / CATEGORIES.GOOD) * 0.2;
      if (value <= CATEGORIES.MODERATE) return 0.2 + ((value - CATEGORIES.GOOD) / (CATEGORIES.MODERATE - CATEGORIES.GOOD)) * 0.2;
      if (value <= CATEGORIES.UNHEALTHY_SENSITIVE) return 0.4 + ((value - CATEGORIES.MODERATE) / (CATEGORIES.UNHEALTHY_SENSITIVE - CATEGORIES.MODERATE)) * 0.2;
      if (value <= CATEGORIES.UNHEALTHY) return 0.6 + ((value - CATEGORIES.UNHEALTHY_SENSITIVE) / (CATEGORIES.UNHEALTHY - CATEGORIES.UNHEALTHY_SENSITIVE)) * 0.2;
      if (value <= CATEGORIES.VERY_UNHEALTHY) return 0.8 + ((value - CATEGORIES.UNHEALTHY) / (CATEGORIES.VERY_UNHEALTHY - CATEGORIES.UNHEALTHY)) * 0.2;
      return 1.0;
    };

    const gradient: Gradient = {
      0.0: "rgba(0, 204, 0, 0.7)", // Baik (0–50)
      0.199: "rgba(0, 204, 0, 0.7)", // Just below Sedang
      0.2: "rgba(1, 51, 255, 0.7)", // Sedang (51–100)
      0.399: "rgba(1, 51, 255, 0.7)", // Just below Tidak Sehat
      0.4: "rgba(255, 201, 0, 0.7)", // Tidak Sehat (101–150)
      0.599: "rgba(255, 201, 0, 0.7)", // Just below Sangat Tidak Sehat
      0.6: "rgba(255, 102, 0, 0.7)", // Sangat Tidak Sehat (151–200)
      0.799: "rgba(255, 102, 0, 0.7)", // Just below Berbahaya
      0.8: "rgba(255, 0, 0, 0.7)", // Berbahaya (201–300)
      0.999: "rgba(255, 0, 0, 0.7)", // Just below Sangat Berbahaya
      1.0: "rgba(153, 0, 76, 0.8)", // Sangat Berbahaya (>300)
    };

    const normalizedPoints = heatPoints.map(([lat, lng, val]) => ({
      lat,
      lng,
      colorValue: normalizeValue(val, maxPM25),
    }));

    console.log("Heatmap Points Sample:", normalizedPoints.slice(0, 5));

    const heatLayer = (L as any)
      .heatLayer(
        normalizedPoints.map((p) => [p.lat, p.lng, p.colorValue]),
        {
          radius: 25,
          blur: 10,
          max: 1.0,
          gradient,
        }
      )
      .addTo(map);

    const handleMouseMove = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
        return;
      }
      lastPosition.current = { lat, lng };

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (tooltipRef.current) {
          tooltipRef.current.remove();
          tooltipRef.current = null;
        }

        const point = turf.point([lng, lat]);
        const kelurahan = boundaryData.features.find((bf) => {
          const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
          return turf.booleanPointInPolygon(point, polygon);
        });

        const pm25Feature = geoData.features.find((feature) => {
          const polygon = feature.geometry.type === "Polygon" ? turf.polygon(feature.geometry.coordinates) : turf.multiPolygon(feature.geometry.coordinates);
          return turf.booleanPointInPolygon(point, polygon);
        });

        if (kelurahan && kelurahan.properties && kelurahan.properties.NAMOBJ !== activeKelurahan && (pm25Feature || kelurahan)) {
          setActiveKelurahan(kelurahan.properties.NAMOBJ);
          const content = getTooltipContent(pm25Feature || null, kelurahan.properties.NAMOBJ);

          tooltipRef.current = L.tooltip({
            sticky: true,
            direction: "top",
            offset: [0, -20],
            className: "custom-tooltip",
          })
            .setLatLng(e.latlng)
            .setContent(content)
            .addTo(map);
        } else if (!kelurahan && activeKelurahan) {
          setActiveKelurahan(null);
        }
      }, 100); // Debounce delay 100ms
    };

    map.on("mousemove", handleMouseMove);

    const boundaryLayer = L.geoJSON(boundaryData as any, {
      style: {
        weight: 1,
        opacity: 0.8,
        color: "#86CEE0",
        fillOpacity: 0,
      },
      onEachFeature: (feature, layer) => {
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
      },
    }).addTo(map);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      map.off("mousemove", handleMouseMove);
      if (tooltipRef.current) {
        tooltipRef.current.remove();
      }
      map.removeLayer(heatLayer);
      map.removeLayer(boundaryLayer);
    };
  }, [map, heatPoints, boundaryData, geoData, maxPM25, selectedDate]);

  return null;
};

export default HeatMapLayer;
