// components/map/GenericHeatMapLayer.tsx
"use client";

import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import { useMap } from "react-leaflet";
import dynamic from "next/dynamic";
import * as turf from "@turf/turf";
import RBush from "rbush";
import * as L from "leaflet";
import styles from "@/styles/heatmap.module.css";
import { interpolateColor, interpolatePM25Color } from "@/utils/color";
import { GeoJSONData, BoundaryGeoJSONData, BoundaryFeature } from "@/app/types";
import * as GeoJSONTypes from "geojson";
import GradientLegend from "../legend/GradientLegend";

const ImageOverlay = dynamic(() => import("react-leaflet").then((mod) => mod.ImageOverlay), { ssr: false });

interface HeatMapLayerProps {
  dataType: "aod" | "pm25-est";
  geoData: GeoJSONData | null;
  boundaryData: BoundaryGeoJSONData | null;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  isLoading: boolean;
  legendTitle: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

interface RBushItem {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  featureIndex: number;
}

interface InterpolatedFeature {
  type: "Feature";
  geometry: GeoJSONTypes.Point;
  properties: { value: number };
}

const GenericHeatMapLayer: React.FC<HeatMapLayerProps> = ({ dataType, geoData, boundaryData, selectedDate, setSelectedDate, isLoading, legendTitle, inputRef }) => {
  const map = useMap();
  const staticLayerRef = useRef<L.ImageOverlay | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);
  const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);

  const cachedBoundaries = useMemo(() => {
    if (!geoData) {
      console.log("cachedBoundaries: Tidak ada geoData");
      return turf.featureCollection([]);
    }
    const validFeatures = geoData.features
      .filter((f: GeoJSONTypes.Feature<GeoJSONTypes.Point | GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon, { aod_value?: number; pm25_value?: number }>) => {
        const value = dataType === "aod" ? f.properties.aod_value : f.properties.pm25_value;
        return value !== null && value !== undefined && !isNaN(value);
      })
      .map((feature: GeoJSONTypes.Feature<GeoJSONTypes.Point | GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon, { aod_value?: number; pm25_value?: number }>) => {
        const buffered = turf.buffer(feature.geometry, 0.002, { units: "degrees" }) as GeoJSONTypes.Feature<GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon>;
        if (buffered && (buffered.geometry.type === "Polygon" || buffered.geometry.type === "MultiPolygon")) {
          return buffered;
        }
        console.log("cachedBoundaries: Fitur tidak valid setelah buffer:", feature);
        return null;
      })
      .filter((f): f is GeoJSONTypes.Feature<GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon> => f != null);
    console.log("cachedBoundaries: Jumlah fitur valid:", validFeatures.length);
    return turf.featureCollection(validFeatures);
  }, [geoData, dataType]);

  useEffect(() => {
    if (!boundaryData || !boundaryData.features) {
      console.log("Tidak ada boundaryData atau fitur, melewati pembuatan indeks spasial");
      return;
    }
    const spatialIndex = new RBush<RBushItem>();
    boundaryData.features.forEach((feature: BoundaryFeature, index: number) => {
      if (!feature.geometry) {
        console.log(`Melewati fitur ${index}: Geometri tidak valid`);
        return;
      }
      try {
        const bbox = turf.bbox(feature.geometry);
        if (bbox.some((val) => isNaN(val))) {
          console.log(`Melewati fitur ${index}: Bbox tidak valid`, bbox);
          return;
        }
        spatialIndex.insert({
          minX: bbox[0],
          minY: bbox[1],
          maxX: bbox[2],
          maxY: bbox[3],
          featureIndex: index,
        });
      } catch {
        console.error(`Error memproses fitur ${index}`);
        return;
      }
    });
    spatialIndexRef.current = spatialIndex;

    return () => {
      spatialIndexRef.current = null;
    };
  }, [boundaryData]);

  const generateStaticGrid = useCallback(
    (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
      if (!boundaryData || !boundaryData.features) {
        console.warn("generateStaticGrid: boundaryData kosong atau tidak ada fitur");
        return { imageUrl: null, bbox: [0, 0, 0, 0] };
      }

      const validBoundaryFeatures = boundaryData.features.filter((f: BoundaryFeature): f is BoundaryFeature => f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon");
      if (validBoundaryFeatures.length === 0) {
        console.warn("generateStaticGrid: Tidak ada fitur Polygon atau MultiPolygon yang valid di boundaryData");
        return { imageUrl: null, bbox: [0, 0, 0, 0] };
      }

      const points = geoData.features
        .map((feature: GeoJSONTypes.Feature<GeoJSONTypes.Point | GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon, { aod_value?: number; pm25_value?: number }>) => {
          if (!feature.geometry) {
            console.log("generateStaticGrid: Fitur tanpa geometri:", feature);
            return null;
          }
          let centroid: GeoJSONTypes.Feature<GeoJSONTypes.Point>;
          try {
            centroid = turf.centroid(feature.geometry);
          } catch {
            console.log("generateStaticGrid: Gagal menghitung centroid untuk fitur:", feature);
            return null;
          }
          const value = dataType === "aod" ? feature.properties.aod_value : feature.properties.pm25_value;
          if (value == null || isNaN(value)) {
            console.log("generateStaticGrid: Melewati fitur karena nilai tidak valid:", feature);
            return null;
          }
          return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], value];
        })
        .filter((p): p is [number, number, number] => p != null);

      const bbox = turf.bbox(turf.featureCollection(validBoundaryFeatures));
      const cellSize = 0.02;
      let grid;
      try {
        grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });
      } catch {
        console.error("generateStaticGrid: Error membuat grid titik");
        return { imageUrl: null, bbox: [0, 0, 0, 0] };
      }

      let interpolated = turf.featureCollection([]);
      if (points.length > 0) {
        try {
          interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { value: p[2] }))), cellSize / 4, { gridType: "point", property: "value", units: "degrees", weight: 2.5 });
        } catch {
          console.error("generateStaticGrid: Error menginterpolasi data");
          return { imageUrl: null, bbox: [0, 0, 0, 0] };
        }
      }
      interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];

      const canvas = document.createElement("canvas");
      const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
      const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error("generateStaticGrid: Gagal mendapatkan konteks kanvas");
        return { imageUrl: null, bbox: [0, 0, 0, 0] };
      }

      ctx.fillStyle = "rgba(0, 0, 0, 0)";
      ctx.fillRect(0, 0, width, height);

      let validPoints = 0;
      grid.features.forEach((feature) => {
        const coords = feature.geometry.coordinates;
        if (!Array.isArray(coords) || coords.length !== 2 || typeof coords[0] !== "number" || typeof coords[1] !== "number") {
          console.warn("generateStaticGrid: Koordinat tidak valid, melewati:", coords);
          return;
        }

        const point = turf.point(coords as [number, number]);
        const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer as GeoJSONTypes.Feature<GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon>));

        let value: number | null = null;
        if (inBuffer && interpolated.features.length > 0) {
          const closest = interpolated.features.reduce(
            (acc, f) => {
              if (f.geometry.type !== "Point" || !f.properties || f.properties.value == null) return acc;
              const dist = turf.distance(f.geometry as GeoJSONTypes.Point, coords as [number, number], { units: "degrees" });
              return dist < acc.dist ? { dist, value: f.properties.value } : acc;
            },
            { dist: Infinity, value: null as number | null }
          );
          value = closest.value !== null && closest.value > 0 ? closest.value : null;
        } else {
          const dataFeature = geoData.features.find((feature: GeoJSONTypes.Feature<GeoJSONTypes.Point | GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon, { aod_value?: number; pm25_value?: number }>) => {
            if (!feature.geometry) {
              console.log("generateStaticGrid: Fitur tanpa geometri:", feature);
              return false;
            }
            try {
              const centroid = turf.centroid(feature.geometry);
              const featurePoint = turf.point(centroid.geometry.coordinates);
              const distance = turf.distance(point, featurePoint, { units: "degrees" });
              return distance < 0.002;
            } catch {
              console.error("generateStaticGrid: Error memeriksa jarak titik");
              return false;
            }
          });

          if (dataFeature) {
            const rawValue = dataType === "aod" ? dataFeature.properties.aod_value : dataFeature.properties.pm25_value;
            value = rawValue !== undefined && rawValue !== null ? rawValue : null;
          }
        }

        if (value === null) return;

        const color = dataType === "aod" ? interpolateColor(value) : interpolatePM25Color(value);
        const x = Math.round((coords[0] - bbox[0]) / cellSize);
        const y = Math.round((bbox[3] - coords[1]) / cellSize);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
        validPoints++;
      });

      const newImageUrl = validPoints > 0 ? canvas.toDataURL() : null;
      return { imageUrl: newImageUrl, bbox };
    },
    [dataType, cachedBoundaries]
  );

  const cachedGrid = useMemo(() => {
    if (!geoData || !boundaryData) {
      console.warn("cachedGrid: Tidak ada geoData atau boundaryData");
      return { imageUrl: null, bbox: [0, 0, 0, 0] };
    }
    return generateStaticGrid(geoData, boundaryData);
  }, [geoData, boundaryData, generateStaticGrid]);

  useEffect(() => {
    if (!map || !geoData || !boundaryData || isLoading) {
      if (staticLayerRef.current) {
        map.removeLayer(staticLayerRef.current);
        staticLayerRef.current = null;
      }
      setImageUrl(null);
      setBounds(null);
      return;
    }

    const { imageUrl: newImageUrl, bbox } = cachedGrid;

    if (staticLayerRef.current) {
      map.removeLayer(staticLayerRef.current);
      staticLayerRef.current = null;
    }

    if (newImageUrl && Array.isArray(bbox) && bbox.length === 4 && bbox.every((val) => typeof val === "number" && !isNaN(val))) {
      const newBounds: L.LatLngBoundsExpression = [
        [bbox[1], bbox[0]],
        [bbox[3], bbox[2]],
      ];
      staticLayerRef.current = L.imageOverlay(newImageUrl, newBounds, { opacity: 0.85, interactive: true }).addTo(map);
      setImageUrl(newImageUrl);
      setBounds(L.latLngBounds(newBounds));
    } else {
      setImageUrl(null);
      setBounds(null);
    }

    return () => {
      if (staticLayerRef.current) {
        map.removeLayer(staticLayerRef.current);
        staticLayerRef.current = null;
      }
      setImageUrl(null);
      setBounds(null);
    };
  }, [map, cachedGrid, geoData, boundaryData, isLoading]);

  return (
    <>
      {isLoading && (
        <div className={styles.spinnerOverlay}>
          <div className={styles.spinner}></div>
          <span>Memuat Heatmap...</span>
        </div>
      )}
      <div className={`${styles.controlsContainer}`}>
        <label htmlFor="datePicker" className={styles.dateLabel}>
          Pilih Tanggal
        </label>
        <input type="date" id="datePicker" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={styles.dateInput} ref={inputRef} />
      </div>
      {imageUrl && bounds && (
        <ImageOverlay
          url={imageUrl}
          bounds={bounds}
          opacity={0.85}
          interactive={true}
          zIndex={1000}
        />
      )}
      <div className={`${styles.legend} z-[1000]`}>
        <h4>{legendTitle}</h4>
        <GradientLegend dataType={dataType} />
      </div>
    </>
  );
};

export default GenericHeatMapLayer;