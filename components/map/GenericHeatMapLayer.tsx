// "use client";

// import { useEffect, useRef, useMemo, useState, useCallback } from "react";
// import { useMap } from "react-leaflet";
// import dynamic from "next/dynamic";
// import * as turf from "@turf/turf";
// import RBush from "rbush";
// import * as L from "leaflet";
// import styles from "@/styles/heatmap.module.css";
// import { interpolateColor, interpolatePM25Color } from "@/utils/color";
// import { GeoJSONData, BoundaryGeoJSONData, BoundaryFeature } from "@/app/types";
// import * as GeoJSONTypes from "geojson";
// import GradientLegend from "../legend/GradientLegend";
// import { debounce } from "lodash";

// const ImageOverlay = dynamic(() => import("react-leaflet").then((mod) => mod.ImageOverlay), { ssr: false });

// interface HeatMapLayerProps {
//   dataType: "aod" | "pm25-est";
//   geoData: GeoJSONData | null;
//   boundaryData: BoundaryGeoJSONData | null;
//   selectedDate: string;
//   setSelectedDate: (date: string) => void;
//   isLoading: boolean;
//   legendTitle: string;
//   inputRef: React.RefObject<HTMLInputElement | null>;
//   error?: string | null; // Tambahkan prop error
// }

// interface RBushItem {
//   minX: number;
//   minY: number;
//   maxX: number;
//   maxY: number;
//   featureIndex: number;
// }

// interface InterpolatedFeature {
//   type: "Feature";
//   geometry: GeoJSONTypes.Point;
//   properties: { value: number };
// }

// const isPolygonOrMultiPolygon = (geometry: GeoJSONTypes.Geometry): geometry is GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon => {
//   return geometry.type === "Polygon" || geometry.type === "MultiPolygon";
// };

// const GenericHeatMapLayer: React.FC<HeatMapLayerProps> = ({
//   dataType,
//   geoData,
//   boundaryData,
//   selectedDate,
//   setSelectedDate,
//   isLoading,
//   legendTitle,
//   inputRef,
//   error, // Tambahkan error ke destructure
// }) => {
//   const map = useMap();
//   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
//   const tooltipRef = useRef<L.Tooltip | null>(null);
//   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
//   const [imageUrl, setImageUrl] = useState<string | null>(null);
//   const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
//   const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);
//   const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);

//   const cachedBoundaries = useMemo(() => {
//     if (!geoData) {
//       console.log("DEBUG: cachedBoundaries - Tidak ada geoData");
//       return turf.featureCollection([]);
//     }
//     console.log("DEBUG: cachedBoundaries - Jumlah geoData.features:", geoData.features.length);
//     const validFeatures = geoData.features
//       .filter((f: GeoJSONTypes.Feature<GeoJSONTypes.Point | GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon, { aod_value?: number; pm25_value?: number }>) => {
//         const value = dataType === "aod" ? f.properties.aod_value : f.properties.pm25_value;
//         console.log(`DEBUG: cachedBoundaries - Fitur tipe: ${f.geometry?.type}, nilai valid: ${value !== null && value !== undefined && !isNaN(value)}`);
//         return value !== null && value !== undefined && !isNaN(value);
//       })
//       .map((feature: GeoJSONTypes.Feature<GeoJSONTypes.Point | GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon, { aod_value?: number; pm25_value?: number }>) => {
//         try {
//           const buffered = turf.buffer(feature.geometry, 0.002, { units: "degrees" });
//           if (buffered && isPolygonOrMultiPolygon(buffered.geometry)) {
//             console.log(`DEBUG: cachedBoundaries - Fitur valid dengan tipe geometri: ${buffered.geometry.type}`);
//             return buffered as GeoJSONTypes.Feature<GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon>;
//           }
//           console.log("DEBUG: cachedBoundaries - Fitur tidak valid setelah buffer:", feature);
//           return null;
//         } catch (error) {
//           console.error("DEBUG: cachedBoundaries - Error buffering feature:", error);
//           return null;
//         }
//       })
//       .filter((f): f is GeoJSONTypes.Feature<GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon> => f != null);
//     console.log("DEBUG: cachedBoundaries - Jumlah fitur valid:", validFeatures.length);
//     return turf.featureCollection(validFeatures);
//   }, [geoData, dataType]);

//   useEffect(() => {
//     console.log("DEBUG: useEffect for spatialIndex - boundaryData:", !!boundaryData);
//     if (!boundaryData || !boundaryData.features) {
//       console.log("DEBUG: Tidak ada boundaryData atau fitur, melewati pembuatan indeks spasial");
//       return;
//     }
//     const spatialIndex = new RBush<RBushItem>();
//     boundaryData.features.forEach((feature: BoundaryFeature, index: number) => {
//       try {
//         console.log(`DEBUG: spatialIndex - Fitur ${index} tipe geometri: ${feature.geometry.type}`);
//         const bbox = turf.bbox(feature.geometry);
//         if (bbox.some((val) => isNaN(val))) {
//           console.log(`DEBUG: Melewati fitur ${index}: Bbox tidak valid`, bbox);
//           return;
//         }
//         spatialIndex.insert({
//           minX: bbox[0],
//           minY: bbox[1],
//           maxX: bbox[2],
//           maxY: bbox[3],
//           featureIndex: index,
//         });
//       } catch (error) {
//         console.error(`DEBUG: Error memproses fitur ${index}:`, error);
//         return;
//       }
//     });
//     spatialIndexRef.current = spatialIndex;
//     console.log("DEBUG: spatialIndex created with items:", spatialIndex.all().length);

//     return () => {
//       spatialIndexRef.current = null;
//       console.log("DEBUG: spatialIndexRef cleaned up");
//     };
//   }, [boundaryData]);

//   const getTooltipContent = (value: number | null, kelurahanName: string): string => {
//     const formattedValue = value !== null && value > 0 ? (dataType === "aod" ? value.toFixed(4) : value.toFixed(2)) : "No data";
//     const color = value !== null && value > 0 ? (dataType === "aod" ? interpolateColor(value) : interpolatePM25Color(value)) : "rgba(160, 174, 192, 0.85)";
//     const textColor = "#000000";
//     const unit = dataType === "pm25-est" && formattedValue !== "No data" ? "µg/m³" : "";
//     console.log("DEBUG: getTooltipContent - kelurahan:", kelurahanName, "value:", formattedValue, "color:", color, "textColor:", textColor, "unit:", unit);
//     return `
//       <div class="${styles.customTooltip}">
//         <div class="${styles.kelurahanName}">${kelurahanName}</div>
//         <div class="${styles.valueContainer}">
//           <div class="${styles.valueCircle}" style="background-color: ${color}; color: ${textColor}">
//             ${formattedValue}${unit ? ` ${unit}` : ""}
//           </div>
//         </div>
//       </div>
//     `;
//   };

//   const generateStaticGrid = useCallback(
//     (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
//       console.log("DEBUG: generateStaticGrid - Mulai");
//       if (!boundaryData || !boundaryData.features) {
//         console.warn("DEBUG: generateStaticGrid - boundaryData kosong atau tidak ada fitur");
//         return { imageUrl: null, bbox: [0, 0, 0, 0] };
//       }

//       const validBoundaryFeatures = boundaryData.features;
//       if (validBoundaryFeatures.length === 0) {
//         console.warn("DEBUG: generateStaticGrid - Tidak ada fitur Polygon atau MultiPolygon yang valid di boundaryData");
//         return { imageUrl: null, bbox: [0, 0, 0, 0] };
//       }

//       const points = geoData.features
//         .map((feature: GeoJSONTypes.Feature<GeoJSONTypes.Point | GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon, { aod_value?: number; pm25_value?: number }>) => {
//           if (!feature.geometry) {
//             console.log("DEBUG: generateStaticGrid - Fitur tanpa geometri:", feature);
//             return null;
//           }
//           let centroid: GeoJSONTypes.Feature<GeoJSONTypes.Point>;
//           try {
//             centroid = turf.centroid(feature.geometry);
//           } catch {
//             console.log("DEBUG: generateStaticGrid - Gagal menghitung centroid untuk fitur:", feature);
//             return null;
//           }
//           const value = dataType === "aod" ? feature.properties.aod_value : feature.properties.pm25_value;
//           if (value == null || isNaN(value)) {
//             console.log("DEBUG: generateStaticGrid - Melewati fitur karena nilai tidak valid:", feature);
//             return null;
//           }
//           return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], value];
//         })
//         .filter((p): p is [number, number, number] => p != null);
//       console.log("DEBUG: generateStaticGrid - Jumlah points:", points.length);

//       const bbox = turf.bbox(turf.featureCollection(validBoundaryFeatures));
//       console.log("DEBUG: generateStaticGrid - bbox:", bbox);
//       const cellSize = 0.02;
//       let grid;
//       try {
//         grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });
//         console.log("DEBUG: generateStaticGrid - Grid created with features:", grid.features.length);
//       } catch (error) {
//         console.error("DEBUG: generateStaticGrid - Error membuat grid titik:", error);
//         return { imageUrl: null, bbox: [0, 0, 0, 0] };
//       }

//       let interpolated = turf.featureCollection([]);
//       if (points.length > 0) {
//         try {
//           interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { value: p[2] }))), cellSize / 4, { gridType: "point", property: "value", units: "degrees", weight: 2.5 });
//           console.log("DEBUG: generateStaticGrid - Interpolated features:", interpolated.features.length);
//         } catch (error) {
//           console.error("DEBUG: generateStaticGrid - Error menginterpolasi data:", error);
//           return { imageUrl: null, bbox: [0, 0, 0, 0] };
//         }
//       }
//       interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];
//       console.log("DEBUG: interpolatedDataRef set with length:", interpolatedDataRef.current.length);

//       const canvas = document.createElement("canvas");
//       const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
//       const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
//       canvas.width = width;
//       canvas.height = height;
//       const ctx = canvas.getContext("2d");

//       if (!ctx) {
//         console.error("DEBUG: generateStaticGrid - Gagal mendapatkan konteks kanvas");
//         return { imageUrl: null, bbox: [0, 0, 0, 0] };
//       }

//       ctx.fillStyle = "rgba(0, 0, 0, 0)";
//       ctx.fillRect(0, 0, width, height);

//       let validPoints = 0;
//       grid.features.forEach((feature) => {
//         const coords = feature.geometry.coordinates;
//         if (!Array.isArray(coords) || coords.length !== 2 || typeof coords[0] !== "number" || typeof coords[1] !== "number") {
//           console.warn("DEBUG: generateStaticGrid - Koordinat tidak valid, melewati:", coords);
//           return;
//         }

//         const point = turf.point(coords as [number, number]);
//         const inBuffer = cachedBoundaries.features.some((buffer) => {
//           if (!isPolygonOrMultiPolygon(buffer.geometry)) {
//             console.warn(`DEBUG: generateStaticGrid - Fitur dengan tipe geometri tidak valid: ${buffer.geometry.type}`);
//             return false;
//           }
//           try {
//             return turf.booleanPointInPolygon(point, buffer.geometry);
//           } catch {
//             return false;
//           }
//         });

//         let value: number | null = null;
//         if (inBuffer && interpolated.features.length > 0) {
//           const closest = interpolated.features.reduce(
//             (acc, f) => {
//               if (f.geometry.type !== "Point" || !f.properties || f.properties.value == null) return acc;
//               const dist = turf.distance(f.geometry as GeoJSONTypes.Point, coords as [number, number], { units: "degrees" });
//               return dist < acc.dist ? { dist, value: f.properties.value } : acc;
//             },
//             { dist: Infinity, value: null as number | null }
//           );
//           value = closest.value !== null && closest.value > 0 ? closest.value : null;
//         } else {
//           const dataFeature = geoData.features.find((feature: GeoJSONTypes.Feature<GeoJSONTypes.Point | GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon, { aod_value?: number; pm25_value?: number }>) => {
//             if (!feature.geometry) {
//               console.log("DEBUG: generateStaticGrid - Fitur tanpa geometri:", feature);
//               return false;
//             }
//             try {
//               const centroid = turf.centroid(feature.geometry);
//               const featurePoint = turf.point(centroid.geometry.coordinates);
//               const distance = turf.distance(point, featurePoint, { units: "degrees" });
//               return distance < 0.002;
//             } catch {
//               console.error("DEBUG: generateStaticGrid - Error memeriksa jarak titik");
//               return false;
//             }
//           });

//           if (dataFeature) {
//             const rawValue = dataType === "aod" ? dataFeature.properties.aod_value : dataFeature.properties.pm25_value;
//             value = rawValue !== undefined && rawValue !== null ? rawValue : null;
//           }
//         }

//         if (value === null) return;

//         const color = dataType === "aod" ? interpolateColor(value) : interpolatePM25Color(value);
//         const x = Math.round((coords[0] - bbox[0]) / cellSize);
//         const y = Math.round((bbox[3] - coords[1]) / cellSize);
//         ctx.fillStyle = color;
//         ctx.fillRect(x, y, 1, 1);
//         validPoints++;
//       });
//       console.log("DEBUG: generateStaticGrid - Valid points drawn:", validPoints);

//       const newImageUrl = validPoints > 0 ? canvas.toDataURL() : null;
//       console.log("DEBUG: generateStaticGrid - Image URL generated:", newImageUrl ? "Success" : "None");
//       return { imageUrl: newImageUrl, bbox };
//     },
//     [dataType, cachedBoundaries]
//   );

//   const cachedGrid = useMemo(() => {
//     if (!geoData || !boundaryData) {
//       console.warn("DEBUG: cachedGrid - Tidak ada geoData atau boundaryData");
//       return { imageUrl: null, bbox: [0, 0, 0, 0] };
//     }
//     return generateStaticGrid(geoData, boundaryData);
//   }, [geoData, boundaryData, generateStaticGrid]);

//   const isPolygonOrMultiPolygonFeature = (
//     feature: GeoJSONTypes.Feature<GeoJSONTypes.Point | GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon, any>
//   ): feature is GeoJSONTypes.Feature<GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon, any> => {
//     return isPolygonOrMultiPolygon(feature.geometry);
//   };

//   const handleMouseMove = useCallback(
//     debounce((e: L.LeafletMouseEvent) => {
//       if (!map || !boundaryData || !spatialIndexRef.current || error) {
//         // Periksa error
//         if (tooltipRef.current) {
//           tooltipRef.current.remove();
//           tooltipRef.current = null;
//         }
//         return;
//       }

//       const point = turf.point([e.latlng.lng, e.latlng.lat]);
//       const isInside = boundaryData.features.some((f: BoundaryFeature) => {
//         try {
//           return turf.booleanPointInPolygon(point, f.geometry);
//         } catch {
//           return false;
//         }
//       });

//       if (!isInside) {
//         if (tooltipRef.current) {
//           tooltipRef.current.remove();
//           tooltipRef.current = null;
//         }
//         return;
//       }

//       const nearbyFeatures = spatialIndexRef.current.search({
//         minX: e.latlng.lng,
//         minY: e.latlng.lat,
//         maxX: e.latlng.lng,
//         maxY: e.latlng.lat,
//       });

//       const featureIndex = nearbyFeatures.find((item) => {
//         const feature = boundaryData.features[item.featureIndex];
//         try {
//           return turf.booleanPointInPolygon(point, feature.geometry);
//         } catch {
//           return false;
//         }
//       })?.featureIndex;

//       if (featureIndex === undefined) {
//         if (tooltipRef.current) {
//           tooltipRef.current.remove();
//           tooltipRef.current = null;
//         }
//         return;
//       }

//       const feature = boundaryData.features[featureIndex];
//       const kelurahanName = feature.properties?.NAMOBJ || "Lokasi Tidak Dikenal";

//       const validGeoDataFeatures = geoData?.features.filter(isPolygonOrMultiPolygonFeature) || [];

//       const dataFeature = validGeoDataFeatures.find((f) => {
//         try {
//           return turf.booleanPointInPolygon(point, f.geometry);
//         } catch {
//           return false;
//         }
//       });

//       let value: number | null = null;
//       if (dataFeature) {
//         value = dataType === "aod" ? dataFeature.properties.aod_value ?? null : dataFeature.properties.pm25_value ?? null;
//       }

//       if (tooltipRef.current) {
//         tooltipRef.current.remove();
//         tooltipRef.current = null;
//       }

//       if (map) {
//         tooltipRef.current = L.tooltip({
//           sticky: true,
//           direction: "top",
//           offset: [0, -20],
//           className: "customTooltip",
//         })
//           .setLatLng(e.latlng)
//           .setContent(getTooltipContent(value, kelurahanName))
//           .addTo(map);
//       }
//     }, 100),
//     [map, boundaryData, geoData, dataType, error] // Tambahkan error ke dependensi
//   );

//   useEffect(() => {
//     console.log("DEBUG: useEffect for ImageOverlay - isLoading:", isLoading, "geoData:", !!geoData, "boundaryData:", !!boundaryData);
//     if (!map || !geoData || !boundaryData || isLoading || error) {
//       // Tambahkan pengecekan error
//       if (staticLayerRef.current) {
//         map.removeLayer(staticLayerRef.current);
//         staticLayerRef.current = null;
//         console.log("DEBUG: Removed existing ImageOverlay due to missing data, loading, or error");
//       }
//       if (tooltipRef.current) {
//         tooltipRef.current.remove();
//         tooltipRef.current = null;
//         console.log("DEBUG: Removed existing tooltip");
//       }
//       setImageUrl(null);
//       setBounds(null);
//       return;
//     }

//     const { imageUrl: newImageUrl, bbox } = cachedGrid;
//     console.log("DEBUG: cachedGrid result - imageUrl:", newImageUrl ? "Exists" : "Null", "bbox:", bbox);

//     if (staticLayerRef.current) {
//       map.removeLayer(staticLayerRef.current);
//       staticLayerRef.current = null;
//       console.log("DEBUG: Removed previous ImageOverlay");
//     }

//     if (newImageUrl && Array.isArray(bbox) && bbox.length === 4 && bbox.every((val) => typeof val === "number" && !isNaN(val))) {
//       const newBounds: L.LatLngBoundsExpression = [
//         [bbox[1], bbox[0]],
//         [bbox[3], bbox[2]],
//       ];
//       staticLayerRef.current = L.imageOverlay(newImageUrl, newBounds, { opacity: 0.85, interactive: true, zIndex: 1000 }).addTo(map);
//       console.log("DEBUG: ImageOverlay added with bounds:", newBounds);

//       map.on("mousemove", handleMouseMove);

//       return () => {
//         if (timeoutRef.current) {
//           clearTimeout(timeoutRef.current);
//           console.log("DEBUG: Cleanup - Cleared timeout");
//         }
//         map.off("mousemove", handleMouseMove);
//         if (tooltipRef.current) {
//           tooltipRef.current.remove();
//           tooltipRef.current = null;
//           console.log("DEBUG: Cleanup - Removed tooltip");
//         }
//         if (staticLayerRef.current) {
//           map.removeLayer(staticLayerRef.current);
//           staticLayerRef.current = null;
//           console.log("DEBUG: Cleanup - Removed ImageOverlay");
//         }
//         setImageUrl(null);
//         setBounds(null);
//       };
//     } else {
//       setImageUrl(null);
//       setBounds(null);
//       console.log("DEBUG: No valid imageUrl or bbox, skipping ImageOverlay");
//     }
//   }, [map, cachedGrid, geoData, boundaryData, isLoading, dataType, handleMouseMove, error]); // Tambahkan error ke dependensi

//   return (
//     <>
//       {isLoading && (
//         <div className={styles.spinnerOverlay}>
//           <div className={styles.spinner}></div>
//           <span>Memuat Heatmap...</span>
//         </div>
//       )}
//       <div className={`${styles.controlsContainer}`}>
//         <label htmlFor="datePicker" className={styles.dateLabel}>
//           Pilih Tanggal
//         </label>
//         <input type="date" id="datePicker" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={styles.dateInput} ref={inputRef} />
//       </div>
//       {imageUrl && bounds && <ImageOverlay url={imageUrl} bounds={bounds} opacity={0.85} interactive={true} zIndex={1000} />}
//       <div className={`${styles.legend} z-[1000]`}>
//         <h4>{legendTitle}</h4>
//         <GradientLegend dataType={dataType} />
//       </div>
//     </>
//   );
// };

// export default GenericHeatMapLayer;

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
import { debounce } from "lodash";

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
  error?: string | null;
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

const isPolygonOrMultiPolygon = (geometry: GeoJSONTypes.Geometry): geometry is GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon => {
  return geometry.type === "Polygon" || geometry.type === "MultiPolygon";
};

const GenericHeatMapLayer: React.FC<HeatMapLayerProps> = ({
  dataType,
  geoData,
  boundaryData,
  selectedDate,
  setSelectedDate,
  isLoading,
  legendTitle,
  inputRef,
  error,
}) => {
  const map = useMap();
  const staticLayerRef = useRef<L.ImageOverlay | null>(null);
  const tooltipRef = useRef<L.Tooltip | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);
  const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);

  const cachedBoundaries = useMemo(() => {
    if (!geoData) {
      console.log("DEBUG: cachedBoundaries - Tidak ada geoData");
      return turf.featureCollection([]);
    }
    console.log("DEBUG: cachedBoundaries - Jumlah geoData.features:", geoData.features.length);
    const validFeatures = geoData.features
      .filter((f: GeoJSONTypes.Feature<GeoJSONTypes.Point | GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon, { aod_value?: number; pm25_value?: number }>) => {
        const value = dataType === "aod" ? f.properties.aod_value : f.properties.pm25_value;
        console.log(`DEBUG: cachedBoundaries - Fitur tipe: ${f.geometry?.type}, nilai valid: ${value !== null && value !== undefined && !isNaN(value)}`);
        return value !== null && value !== undefined && !isNaN(value);
      })
      .map((feature: GeoJSONTypes.Feature<GeoJSONTypes.Point | GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon, { aod_value?: number; pm25_value?: number }>) => {
        try {
          const buffered = turf.buffer(feature.geometry, 0.002, { units: "degrees" });
          if (buffered && isPolygonOrMultiPolygon(buffered.geometry)) {
            console.log(`DEBUG: cachedBoundaries - Fitur valid dengan tipe geometri: ${buffered.geometry.type}`);
            return buffered as GeoJSONTypes.Feature<GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon>;
          }
          console.log("DEBUG: cachedBoundaries - Fitur tidak valid setelah buffer:", feature);
          return null;
        } catch (error) {
          console.error("DEBUG: cachedBoundaries - Error buffering feature:", error);
          return null;
        }
      })
      .filter((f): f is GeoJSONTypes.Feature<GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon> => f != null);
    console.log("DEBUG: cachedBoundaries - Jumlah fitur valid:", validFeatures.length);
    return turf.featureCollection(validFeatures);
  }, [geoData, dataType]);

  useEffect(() => {
    console.log("DEBUG: useEffect for spatialIndex - boundaryData:", !!boundaryData);
    if (!boundaryData || !boundaryData.features) {
      console.log("DEBUG: Tidak ada boundaryData atau fitur, melewati pembuatan indeks spasial");
      return;
    }
    const spatialIndex = new RBush<RBushItem>();
    boundaryData.features.forEach((feature: BoundaryFeature, index: number) => {
      try {
        console.log(`DEBUG: spatialIndex - Fitur ${index} tipe geometri: ${feature.geometry.type}`);
        const bbox = turf.bbox(feature.geometry);
        if (bbox.some((val) => isNaN(val))) {
          console.log(`DEBUG: Melewati fitur ${index}: Bbox tidak valid`, bbox);
          return;
        }
        spatialIndex.insert({
          minX: bbox[0],
          minY: bbox[1],
          maxX: bbox[2],
          maxY: bbox[3],
          featureIndex: index,
        });
      } catch (error) {
        console.error(`DEBUG: Error memproses fitur ${index}:`, error);
        return;
      }
    });
    spatialIndexRef.current = spatialIndex;
    console.log("DEBUG: spatialIndex created with items:", spatialIndex.all().length);

    return () => {
      spatialIndexRef.current = null;
      console.log("DEBUG: spatialIndexRef cleaned up");
    };
  }, [boundaryData]);

  const getTooltipContent = (value: number | null, kelurahanName: string): string => {
    const formattedValue = value !== null && value > 0 ? (dataType === "aod" ? value.toFixed(4) : value.toFixed(2)) : "No data";
    const color = value !== null && value > 0 ? (dataType === "aod" ? interpolateColor(value) : interpolatePM25Color(value)) : "rgba(160, 174, 192, 0.85)";
    const textColor = dataType === "aod" ? "#ffffff" : "#000000"; // Putih untuk AOD, hitam untuk PM2.5
    const unit = dataType === "pm25-est" && formattedValue !== "No data" ? "µg/m³" : "";
    console.log("DEBUG: getTooltipContent - kelurahan:", kelurahanName, "value:", formattedValue, "color:", color, "textColor:", textColor, "unit:", unit);
    return `
      <div class="${styles.customTooltip}">
        <div class="${styles.kelurahanName}">${kelurahanName}</div>
        <div class="${styles.valueContainer}">
          <div class="${styles.valueCircle}" style="background-color: ${color}; color: ${textColor}">
            ${formattedValue}${unit ? ` ${unit}` : ""}
          </div>
        </div>
      </div>
    `;
  };

  const generateStaticGrid = useCallback(
    (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
      console.log("DEBUG: generateStaticGrid - Mulai");
      if (!boundaryData || !boundaryData.features) {
        console.warn("DEBUG: generateStaticGrid - boundaryData kosong atau tidak ada fitur");
        return { imageUrl: null, bbox: [0, 0, 0, 0] };
      }

      const validBoundaryFeatures = boundaryData.features;
      if (validBoundaryFeatures.length === 0) {
        console.warn("DEBUG: generateStaticGrid - Tidak ada fitur Polygon atau MultiPolygon yang valid di boundaryData");
        return { imageUrl: null, bbox: [0, 0, 0, 0] };
      }

      const points = geoData.features
        .map((feature: GeoJSONTypes.Feature<GeoJSONTypes.Point | GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon, { aod_value?: number; pm25_value?: number }>) => {
          if (!feature.geometry) {
            console.log("DEBUG: generateStaticGrid - Fitur tanpa geometri:", feature);
            return null;
          }
          let centroid: GeoJSONTypes.Feature<GeoJSONTypes.Point>;
          try {
            centroid = turf.centroid(feature.geometry);
          } catch {
            console.log("DEBUG: generateStaticGrid - Gagal menghitung centroid untuk fitur:", feature);
            return null;
          }
          const value = dataType === "aod" ? feature.properties.aod_value : feature.properties.pm25_value;
          if (value == null || isNaN(value)) {
            console.log("DEBUG: generateStaticGrid - Melewati fitur karena nilai tidak valid:", feature);
            return null;
          }
          return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], value];
        })
        .filter((p): p is [number, number, number] => p != null);
      console.log("DEBUG: generateStaticGrid - Jumlah points:", points.length);

      const bbox = turf.bbox(turf.featureCollection(validBoundaryFeatures));
      console.log("DEBUG: generateStaticGrid - bbox:", bbox);
      const cellSize = 0.02;
      let grid;
      try {
        grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });
        console.log("DEBUG: generateStaticGrid - Grid created with features:", grid.features.length);
      } catch (error) {
        console.error("DEBUG: generateStaticGrid - Error membuat grid titik:", error);
        return { imageUrl: null, bbox: [0, 0, 0, 0] };
      }

      let interpolated = turf.featureCollection([]);
      if (points.length > 0) {
        try {
          interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { value: p[2] }))), cellSize / 4, { gridType: "point", property: "value", units: "degrees", weight: 2.5 });
          console.log("DEBUG: generateStaticGrid - Interpolated features:", interpolated.features.length);
        } catch (error) {
          console.error("DEBUG: generateStaticGrid - Error menginterpolasi data:", error);
          return { imageUrl: null, bbox: [0, 0, 0, 0] };
        }
      }
      interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];
      console.log("DEBUG: interpolatedDataRef set with length:", interpolatedDataRef.current.length);

      const canvas = document.createElement("canvas");
      const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
      const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error("DEBUG: generateStaticGrid - Gagal mendapatkan konteks kanvas");
        return { imageUrl: null, bbox: [0, 0, 0, 0] };
      }

      ctx.fillStyle = "rgba(0, 0, 0, 0)";
      ctx.fillRect(0, 0, width, height);

      let validPoints = 0;
      grid.features.forEach((feature) => {
        const coords = feature.geometry.coordinates;
        if (!Array.isArray(coords) || coords.length !== 2 || typeof coords[0] !== "number" || typeof coords[1] !== "number") {
          console.warn("DEBUG: generateStaticGrid - Koordinat tidak valid, melewati:", coords);
          return;
        }

        const point = turf.point(coords as [number, number]);
        const inBuffer = cachedBoundaries.features.some((buffer) => {
          if (!isPolygonOrMultiPolygon(buffer.geometry)) {
            console.warn(`DEBUG: generateStaticGrid - Fitur dengan tipe geometri tidak valid: ${buffer.geometry.type}`);
            return false;
          }
          try {
            return turf.booleanPointInPolygon(point, buffer.geometry);
          } catch {
            return false;
          }
        });

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
              console.log("DEBUG: generateStaticGrid - Fitur tanpa geometri:", feature);
              return false;
            }
            try {
              const centroid = turf.centroid(feature.geometry);
              const featurePoint = turf.point(centroid.geometry.coordinates);
              const distance = turf.distance(point, featurePoint, { units: "degrees" });
              return distance < 0.002;
            } catch {
              console.error("DEBUG: generateStaticGrid - Error memeriksa jarak titik");
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
      console.log("DEBUG: generateStaticGrid - Valid points drawn:", validPoints);

      const newImageUrl = validPoints > 0 ? canvas.toDataURL() : null;
      console.log("DEBUG: generateStaticGrid - Image URL generated:", newImageUrl ? "Success" : "None");
      return { imageUrl: newImageUrl, bbox };
    },
    [dataType, cachedBoundaries]
  );

  const cachedGrid = useMemo(() => {
    if (!geoData || !boundaryData) {
      console.warn("DEBUG: cachedGrid - Tidak ada geoData atau boundaryData");
      return { imageUrl: null, bbox: [0, 0, 0, 0] };
    }
    return generateStaticGrid(geoData, boundaryData);
  }, [geoData, boundaryData, generateStaticGrid]);

  const isPolygonOrMultiPolygonFeature = (
    feature: GeoJSONTypes.Feature<GeoJSONTypes.Point | GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon, any>
  ): feature is GeoJSONTypes.Feature<GeoJSONTypes.Polygon | GeoJSONTypes.MultiPolygon, any> => {
    return isPolygonOrMultiPolygon(feature.geometry);
  };

  const handleMouseMove = useCallback(
    debounce((e: L.LeafletMouseEvent) => {
      if (!map || !boundaryData || !spatialIndexRef.current || error) {
        if (tooltipRef.current) {
          tooltipRef.current.remove();
          tooltipRef.current = null;
        }
        return;
      }

      const point = turf.point([e.latlng.lng, e.latlng.lat]);
      const isInside = boundaryData.features.some((f: BoundaryFeature) => {
        try {
          return turf.booleanPointInPolygon(point, f.geometry);
        } catch {
          return false;
        }
      });

      if (!isInside) {
        if (tooltipRef.current) {
          tooltipRef.current.remove();
          tooltipRef.current = null;
        }
        return;
      }

      const nearbyFeatures = spatialIndexRef.current.search({
        minX: e.latlng.lng,
        minY: e.latlng.lat,
        maxX: e.latlng.lng,
        maxY: e.latlng.lat,
      });

      const featureIndex = nearbyFeatures.find((item) => {
        const feature = boundaryData.features[item.featureIndex];
        try {
          return turf.booleanPointInPolygon(point, feature.geometry);
        } catch {
          return false;
        }
      })?.featureIndex;

      if (featureIndex === undefined) {
        if (tooltipRef.current) {
          tooltipRef.current.remove();
          tooltipRef.current = null;
        }
        return;
      }

      const feature = boundaryData.features[featureIndex];
      const kelurahanName = feature.properties?.NAMOBJ || "Lokasi Tidak Dikenal";

      const validGeoDataFeatures = geoData?.features.filter(isPolygonOrMultiPolygonFeature) || [];

      const dataFeature = validGeoDataFeatures.find((f) => {
        try {
          return turf.booleanPointInPolygon(point, f.geometry);
        } catch {
          return false;
        }
      });

      let value: number | null = null;
      if (dataFeature) {
        value = dataType === "aod" ? dataFeature.properties.aod_value ?? null : dataFeature.properties.pm25_value ?? null;
      }

      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }

      if (map) {
        tooltipRef.current = L.tooltip({
          sticky: true,
          direction: "top",
          offset: [0, -20],
          className: "customTooltip",
        })
          .setLatLng(e.latlng)
          .setContent(getTooltipContent(value, kelurahanName))
          .addTo(map);
      }
    }, 100),
    [map, boundaryData, geoData, dataType, error]
  );

  useEffect(() => {
    console.log("DEBUG: useEffect for ImageOverlay - isLoading:", isLoading, "geoData:", !!geoData, "boundaryData:", !!boundaryData);
    if (!map || !geoData || !boundaryData || isLoading || error) {
      if (staticLayerRef.current) {
        map.removeLayer(staticLayerRef.current);
        staticLayerRef.current = null;
        console.log("DEBUG: Removed existing ImageOverlay due to missing data, loading, or error");
      }
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
        console.log("DEBUG: Removed existing tooltip");
      }
      setImageUrl(null);
      setBounds(null);
      return;
    }

    const { imageUrl: newImageUrl, bbox } = cachedGrid;
    console.log("DEBUG: cachedGrid result - imageUrl:", newImageUrl ? "Exists" : "Null", "bbox:", bbox);

    if (staticLayerRef.current) {
      map.removeLayer(staticLayerRef.current);
      staticLayerRef.current = null;
      console.log("DEBUG: Removed previous ImageOverlay");
    }

    if (newImageUrl && Array.isArray(bbox) && bbox.length === 4 && bbox.every((val) => typeof val === "number" && !isNaN(val))) {
      const newBounds: L.LatLngBoundsExpression = [
        [bbox[1], bbox[0]],
        [bbox[3], bbox[2]],
      ];
      staticLayerRef.current = L.imageOverlay(newImageUrl, newBounds, { opacity: 0.85, interactive: true, zIndex: 1000 }).addTo(map);
      console.log("DEBUG: ImageOverlay added with bounds:", newBounds);

      map.on("mousemove", handleMouseMove);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          console.log("DEBUG: Cleanup - Cleared timeout");
        }
        map.off("mousemove", handleMouseMove);
        if (tooltipRef.current) {
          tooltipRef.current.remove();
          tooltipRef.current = null;
          console.log("DEBUG: Cleanup - Removed tooltip");
        }
        if (staticLayerRef.current) {
          map.removeLayer(staticLayerRef.current);
          staticLayerRef.current = null;
          console.log("DEBUG: Cleanup - Removed ImageOverlay");
        }
        setImageUrl(null);
        setBounds(null);
      };
    } else {
      setImageUrl(null);
      setBounds(null);
      console.log("DEBUG: No valid imageUrl or bbox, skipping ImageOverlay");
    }
  }, [map, cachedGrid, geoData, boundaryData, isLoading, dataType, handleMouseMove, error]);

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
      {imageUrl && bounds && <ImageOverlay url={imageUrl} bounds={bounds} opacity={0.85} interactive={true} zIndex={1000} />}
      <div className={`${styles.legend} z-[1000]`}>
        <h4>{legendTitle}</h4>
        <GradientLegend dataType={dataType} />
      </div>
    </>
  );
};

export default GenericHeatMapLayer;