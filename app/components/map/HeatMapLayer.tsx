"use client";
import { useEffect, useState, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import * as turf from "@turf/turf";
import styles from "./map.module.css";

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

interface Gradient {
  [key: number]: string;
}

interface HeatMapLayerProps {
  geoData: GeoJSONData | null;
  boundaryData: BoundaryGeoJSONData | null;
  selectedDate: string;
}

const HeatMapLayer = ({ geoData, boundaryData, selectedDate }: HeatMapLayerProps) => {
  const [heatPoints, setHeatPoints] = useState<[number, number, number][]>([]);
  const [activeKelurahan, setActiveKelurahan] = useState<string | null>(null);
  const map = useMap();
  const tooltipRef = useRef<L.Tooltip | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPosition = useRef<{ lat: number; lng: number } | null>(null);

  const getColorByAOD = (aodValue: number): string => {
    if (aodValue < 0.4) return "rgba(0, 204, 0, 0.7)"; // Hijau
    if (aodValue < 0.5) return "rgba(1, 51, 255, 0.7)"; // Biru
    if (aodValue < 0.6) return "rgba(255, 201, 0, 0.7)"; // Kuning
    return "rgba(255, 0, 0, 0.8)"; // Merah
  };

  const getTooltipContent = (aodFeature: Feature | null, kelurahanName: string): string => {
    const aodValue = aodFeature ? aodFeature.properties.aod_value.toFixed(4) : "-";
    const aodColor = aodFeature ? getColorByAOD(aodFeature.properties.aod_value) : "#808080";
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

  const generatePointsInPolygon = (polygon: turf.Polygon | turf.MultiPolygon, aod: number) => {
    //array long, lat, aod_value
    const points: [number, number, number][] = [];
    const turfPolygon = polygon.type === "Polygon" ? turf.polygon(polygon.coordinates) : turf.multiPolygon(polygon.coordinates);

    const area = turf.area(turfPolygon);
    const bbox = turf.bbox(turfPolygon);

    const pointCount = Math.min(500, Math.max(50, Math.floor(area / 10000)));

    if (area < 100000) {
      const center = turf.centroid(turfPolygon);
      points.push([center.geometry.coordinates[1], center.geometry.coordinates[0], aod]);
    }

    const randomPoints = turf.randomPoint(pointCount, { bbox });
    const pointsWithin = turf.pointsWithinPolygon(randomPoints, turfPolygon);
    // memastikan bahwa titik-titik heatmap hanya berada di area poligon yang valid
    pointsWithin.features.forEach((point) => {
      if (point.geometry?.coordinates) {
        points.push([point.geometry.coordinates[1], point.geometry.coordinates[0], aod]);
      }
    });

    return points;
  };

  // jika geoData bernilai null atau undefined, maka state heatPoints diatur menjadi array kosong ([]
  useEffect(() => {
    if (!geoData) {
      setHeatPoints([]);
      return;
    }

    let allPoints: [number, number, number][] = [];
    let maxAOD = 0;
    let minAOD = Infinity;

    geoData.features.forEach((feature, index) => {
      const aod = feature.properties.aod_value;
      maxAOD = Math.max(maxAOD, aod);
      minAOD = Math.min(minAOD, aod);
      const points = generatePointsInPolygon(feature.geometry, aod);
      allPoints.push(...points);
    });

    setHeatPoints(allPoints);
  }, [geoData, selectedDate]);

  useEffect(() => {
    if (!map || heatPoints.length === 0 || !boundaryData || !geoData) return;

    const gradient: Gradient = {
      0.0: "rgba(0, 204, 0, 0.7)", // Rendah (< 0.4)
      0.4: "rgba(1, 51, 255, 0.7)", // Sedang (0.4–0.5)
      0.5: "rgba(255, 201, 0, 0.7)", // Tinggi (0.5–0.6)
      0.6: "rgba(255, 0, 0, 0.8)", // Sangat Tinggi (> 0.6)
      1.0: "rgba(139, 0, 0, 0.8)", // Sangat Tinggi (capped)
    };

    const normalizedPoints = heatPoints.map(([lat, lng, val]) => ({
      lat,
      lng,
      colorValue: Math.min(val, 1.0),
    }));

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
      // Skip jika posisi kursor tidak berubah signifikan
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

        const aodFeature = geoData.features.find((feature) => {
          const polygon = feature.geometry.type === "Polygon" ? turf.polygon(feature.geometry.coordinates) : turf.multiPolygon(feature.geometry.coordinates);
          return turf.booleanPointInPolygon(point, polygon);
        });

        if (kelurahan && kelurahan.properties && kelurahan.properties.NAMOBJ !== activeKelurahan && (aodFeature || kelurahan)) {
          setActiveKelurahan(kelurahan.properties.NAMOBJ);
          const content = getTooltipContent(aodFeature || null, kelurahan.properties.NAMOBJ);

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

    // Add boundary layer tanpa tooltip
    let boundaryLayer: L.GeoJSON | null = null;
    boundaryLayer = L.geoJSON(boundaryData as any, {
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
      if (boundaryLayer) {
        map.removeLayer(boundaryLayer);
      }
    };
  }, [map, heatPoints, boundaryData, geoData]);

  return null;
};

export default HeatMapLayer;
