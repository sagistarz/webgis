// // "use client";

// // import { useEffect, useRef, useMemo, useCallback, useState } from "react";
// // import { useMap } from "react-leaflet";
// // import dynamic from "next/dynamic";
// // import * as turf from "@turf/turf";
// // import RBush from "rbush";
// // import * as L from "leaflet";
// // import styles from "@/styles/heatmap.module.css";
// // import { interpolateColor, interpolatePM25Color } from "@/utils/color";
// // import { GeoJSONData, BoundaryGeoJSONData, BoundaryFeature, Feature } from "@/app/types";
// // import GradientLegend from "../legend/GradientLegend";

// // const ImageOverlay = dynamic(() => import("react-leaflet").then((mod) => mod.ImageOverlay), { ssr: false });

// // interface HeatMapLayerProps {
// //   dataType: "aod" | "pm25-est";
// //   geoData: GeoJSONData | null;
// //   boundaryData: BoundaryGeoJSONData | null;
// //   selectedDate: string;
// //   setSelectedDate: (date: string) => void;
// //   isLoading: boolean;
// //   legendTitle: string;
// //   inputRef: React.RefObject<HTMLInputElement | null>;
// // }

// // interface RBushItem {
// //   minX: number;
// //   minY: number;
// //   maxX: number;
// //   maxY: number;
// //   featureIndex: number;
// // }

// // interface InterpolatedFeature {
// //   type: "Feature";
// //   geometry: GeoJSON.Point;
// //   properties: { value: number };
// // }

// // const GenericHeatMapLayer: React.FC<HeatMapLayerProps> = ({ dataType, geoData, boundaryData, selectedDate, setSelectedDate, isLoading, legendTitle, inputRef }) => {
// //   const map = useMap();
// //   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
// //   const tooltipRef = useRef<L.Tooltip | null>(null);
// //   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
// //   const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);
// //   const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);
// //   const [imageUrl, setImageUrl] = useState<string | null>(null);
// //   const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);

// //   const getTooltipContent = useCallback(
// //     (value: number | null, kelurahanName: string): string => {
// //       const formattedValue = value !== null && value > 0 ? (dataType === "aod" ? value.toFixed(4) : value.toFixed(2)) : "No data";
// //       const color = value !== null && value > 0 ? (dataType === "aod" ? interpolateColor(value) : interpolatePM25Color(value)) : "#a0aec0";
// //       const textColor = color === "rgba(0, 255, 0, 0.85)" || color === "rgba(255, 255, 0, 0.85)" ? "#000000" : "#ffffff";
// //       return `
// //         <div class="${styles.customTooltip}">
// //           <div class="${styles.kelurahanName}">${kelurahanName}</div>
// //           <div class="${styles.valueContainer}">
// //             <div class="${styles.valueCircle}" style="background-color: ${color}; color: ${textColor}">
// //               ${formattedValue} ${dataType === "aod" || formattedValue === "No data" ? "" : "µg/m³"}
// //             </div>
// //           </div>
// //         </div>
// //       `;
// //     },
// //     [dataType]
// //   );

// //   const cachedBoundaries = useMemo(() => {
// //     if (!geoData) {
// //       console.log("cachedBoundaries: Tidak ada geoData");
// //       return turf.featureCollection([]);
// //     }
// //     const validFeatures = geoData.features
// //       .filter((f: Feature) => {
// //         const value = dataType === "aod" ? f.properties.aod_value : f.properties.pm25_value;
// //         return value !== null && value !== undefined && !isNaN(value);
// //       })
// //       .map((feature: Feature) => {
// //         const buffered = turf.buffer(feature.geometry, 0.002, { units: "degrees" });
// //         if (buffered && (buffered.geometry.type === "Polygon" || buffered.geometry.type === "MultiPolygon")) {
// //           return buffered as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
// //         }
// //         console.log("cachedBoundaries: Fitur tidak valid setelah buffer:", feature);
// //         return null;
// //       })
// //       .filter((f): f is GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> => f != null);
// //     console.log("cachedBoundaries: Jumlah fitur valid:", validFeatures.length);
// //     return turf.featureCollection(validFeatures);
// //   }, [geoData, dataType]);

// //   useEffect(() => {
// //     if (!boundaryData || !boundaryData.features) {
// //       console.log("Tidak ada boundaryData atau fitur, melewati pembuatan indeks spasial");
// //       return;
// //     }
// //     const spatialIndex = new RBush<RBushItem>();
// //     console.log("Jumlah fitur boundaryData:", boundaryData.features.length);
// //     boundaryData.features.forEach((feature: BoundaryFeature, index: number) => {
// //       if (feature.geometry.type !== "Polygon" && feature.geometry.type !== "MultiPolygon") {
// //         console.log(`Melewati fitur ${index}: Tipe geometri tidak valid ${feature.geometry.type}`);
// //         return;
// //       }
// //       try {
// //         const bbox = turf.bbox(feature.geometry);
// //         if (bbox.some((val) => isNaN(val))) {
// //           console.log(`Melewati fitur ${index}: Bbox tidak valid`, bbox);
// //           return;
// //         }
// //         spatialIndex.insert({
// //           minX: bbox[0],
// //           minY: bbox[1],
// //           maxX: bbox[2],
// //           maxY: bbox[3],
// //           featureIndex: index,
// //         });
// //         console.log(`Menambahkan fitur ${index} (${feature.properties?.NAMOBJ || "Tidak ada nama"}):`, bbox);
// //       } catch (error) {
// //         console.error(`Error memproses fitur ${index}:`, error);
// //       }
// //     });
// //     console.log("Indeks spasial selesai dibuat, jumlah item:", spatialIndex.all().length);
// //     spatialIndexRef.current = spatialIndex;

// //     return () => {
// //       spatialIndexRef.current = null;
// //       console.log("Membersihkan indeks spasial");
// //     };
// //   }, [boundaryData]);

// //   const generateStaticGrid = useCallback(
// //     (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
// //       console.log("generateStaticGrid: Memulai dengan jumlah fitur geoData:", geoData.features.length);
// //       if (!boundaryData || !boundaryData.features) {
// //         console.warn("generateStaticGrid: boundaryData kosong atau tidak ada fitur");
// //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// //       }

// //       const validBoundaryFeatures = boundaryData.features.filter((f: BoundaryFeature): f is BoundaryFeature => f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon");
// //       if (validBoundaryFeatures.length === 0) {
// //         console.warn("generateStaticGrid: Tidak ada fitur Polygon atau MultiPolygon yang valid di boundaryData");
// //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// //       }

// //       const points = geoData.features
// //         .map((feature: Feature) => {
// //           if (!feature.geometry) {
// //             console.log("generateStaticGrid: Fitur tanpa geometri:", feature);
// //             return null;
// //           }
// //           const centroid = turf.centroid(feature.geometry);
// //           const value = dataType === "aod" ? feature.properties.aod_value : feature.properties.pm25_value;
// //           if (value == null || isNaN(value)) {
// //             console.log("generateStaticGrid: Melewati fitur karena nilai tidak valid:", feature);
// //             return null;
// //           }
// //           return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], value];
// //         })
// //         .filter((p): p is [number, number, number] => p != null);
// //       console.log("generateStaticGrid: Jumlah titik valid untuk interpolasi:", points.length);

// //       const bbox = turf.bbox(turf.featureCollection(validBoundaryFeatures));
// //       console.log("generateStaticGrid: Bounding box:", bbox);

// //       const cellSize = 0.02;
// //       let grid;
// //       try {
// //         grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });
// //         console.log("generateStaticGrid: Titik grid dibuat:", grid.features.length);
// //       } catch (error) {
// //         console.error("generateStaticGrid: Error membuat grid titik:", error);
// //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// //       }

// //       let interpolated = turf.featureCollection([]);
// //       if (points.length > 0) {
// //         try {
// //           interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { value: p[2] }))), cellSize / 4, { gridType: "point", property: "value", units: "degrees", weight: 2.5 });
// //           console.log("generateStaticGrid: Titik interpolasi dibuat:", interpolated.features.length);
// //         } catch (error) {
// //           console.error("generateStaticGrid: Error menginterpolasi data:", error);
// //           return { imageUrl: null, bbox: [0, 0, 0, 0] };
// //         }
// //       } else {
// //         console.warn("generateStaticGrid: Tidak ada titik valid untuk interpolasi");
// //       }
// //       interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];

// //       const canvas = document.createElement("canvas");
// //       const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
// //       const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
// //       canvas.width = width;
// //       canvas.height = height;
// //       const ctx = canvas.getContext("2d");

// //       if (!ctx) {
// //         console.error("generateStaticGrid: Gagal mendapatkan konteks kanvas");
// //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// //       }

// //       ctx.fillStyle = "rgba(0, 0, 0, 0)";
// //       ctx.fillRect(0, 0, width, height);

// //       let validPoints = 0;
// //       grid.features.forEach((feature) => {
// //         const coords = feature.geometry.coordinates;
// //         if (!Array.isArray(coords) || coords.length !== 2 || typeof coords[0] !== "number" || typeof coords[1] !== "number") {
// //           console.warn("generateStaticGrid: Koordinat tidak valid, melewati:", coords);
// //           return;
// //         }

// //         const point = turf.point(coords as [number, number]);
// //         const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>));

// //         let value: number | null = null;
// //         if (inBuffer && interpolated.features.length > 0) {
// //           const closest = interpolated.features.reduce(
// //             (acc, f) => {
// //               if (f.geometry.type !== "Point" || !f.properties || f.properties.value == null) return acc;
// //               const dist = turf.distance(f.geometry as GeoJSON.Point, coords as [number, number], { units: "degrees" });
// //               return dist < acc.dist ? { dist, value: f.properties.value } : acc;
// //             },
// //             { dist: Infinity, value: null as number | null }
// //           );
// //           value = closest.value !== null && closest.value > 0 ? closest.value : null;
// //         } else {
// //           const dataFeature = geoData.features.find((feature: Feature) => {
// //             if (!feature.geometry) {
// //               console.log("Fitur tidak memiliki geometri");
// //               return false;
// //             }
// //             try {
// //               if (feature.geometry.type === "Polygon") {
// //                 return turf.booleanPointInPolygon(point, turf.polygon(feature.geometry.coordinates));
// //               } else if (feature.geometry.type === "MultiPolygon") {
// //                 return turf.booleanPointInPolygon(point, turf.multiPolygon(feature.geometry.coordinates));
// //               }
// //               console.log(`Fitur memiliki tipe geometri tidak didukung: ${feature.geometry.type}`);
// //               return false;
// //             } catch (error) {
// //               console.error("Error memeriksa titik dalam poligon:", error);
// //               return false;
// //             }
// //           });

// //           if (dataFeature) {
// //             const rawValue = dataType === "aod" ? dataFeature.properties.aod_value : dataFeature.properties.pm25_value;
// //             value = rawValue !== undefined && rawValue !== null ? rawValue : null;
// //           }
// //         }

// //         if (value === null) return;

// //         const color = dataType === "aod" ? interpolateColor(value) : interpolatePM25Color(value);
// //         const x = Math.round((coords[0] - bbox[0]) / cellSize);
// //         const y = Math.round((bbox[3] - coords[1]) / cellSize);
// //         ctx.fillStyle = color;
// //         ctx.fillRect(x, y, 1, 1);
// //         validPoints++;
// //       });

// //       console.log("generateStaticGrid: Jumlah titik valid yang digambar di kanvas:", validPoints);
// //       const newImageUrl = validPoints > 0 ? canvas.toDataURL() : null;
// //       return { imageUrl: newImageUrl, bbox };
// //     },
// //     [dataType, cachedBoundaries]
// //   );

// //   const cachedGrid = useMemo(() => {
// //     if (!geoData || !boundaryData) {
// //       console.warn("cachedGrid: Tidak ada geoData atau boundaryData");
// //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// //     }
// //     return generateStaticGrid(geoData, boundaryData);
// //   }, [geoData, boundaryData, generateStaticGrid]);

// //   useEffect(() => {
// //     if (!map || !geoData || !boundaryData || isLoading) {
// //       console.log("Melewati useEffect: Tidak ada map, geoData, boundaryData, atau sedang memuat");
// //       if (staticLayerRef.current) {
// //         map.removeLayer(staticLayerRef.current);
// //         staticLayerRef.current = null;
// //       }
// //       if (tooltipRef.current) {
// //         tooltipRef.current.remove();
// //         tooltipRef.current = null;
// //       }
// //       setImageUrl(null);
// //       setBounds(null);
// //       return;
// //     }

// //     const { imageUrl: newImageUrl, bbox } = cachedGrid;
// //     console.log("useEffect: Image URL dan bbox:", { newImageUrl, bbox });

// //     if (staticLayerRef.current) {
// //       map.removeLayer(staticLayerRef.current);
// //       staticLayerRef.current = null;
// //     }
// //     if (tooltipRef.current) {
// //       tooltipRef.current.remove();
// //       tooltipRef.current = null;
// //     }

// //     if (newImageUrl && Array.isArray(bbox) && bbox.length === 4 && bbox.every((val) => typeof val === "number" && !isNaN(val))) {
// //       const newBounds: L.LatLngBoundsExpression = [
// //         [bbox[1], bbox[0]], // [latMin, lngMin]
// //         [bbox[3], bbox[2]], // [latMax, lngMax]
// //       ];
// //       staticLayerRef.current = L.imageOverlay(newImageUrl, newBounds, { opacity: 0.85, interactive: true }).addTo(map);
// //       console.log("useEffect: ImageOverlay ditambahkan ke peta");
// //       setImageUrl(newImageUrl);
// //       setBounds(L.latLngBounds(newBounds));
// //     } else {
// //       console.warn("useEffect: imageUrl atau bbox tidak valid", { newImageUrl, bbox });
// //       setImageUrl(null);
// //       setBounds(null);
// //     }

// //     const handleMouseMove = (e: L.LeafletMouseEvent) => {
// //       if (inputRef.current && document.activeElement === inputRef.current) {
// //         console.log("Melewati mousemove: Input pencarian sedang difokuskan");
// //         return;
// //       }
// //       const { lat, lng } = e.latlng;
// //       console.log("Kursor berpindah ke:", { lat, lng });

// //       if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
// //         console.log("Melewati mousemove: Posisi tidak berubah");
// //         return;
// //       }
// //       lastPosition.current = { lat, lng };

// //       try {
// //         const point = turf.point([lng, lat]);
// //         console.log("Membuat titik Turf:", point);

// //         const buffer = 0.001;
// //         const candidates =
// //           spatialIndexRef.current?.search({
// //             minX: lng - buffer,
// //             minY: lat - buffer,
// //             maxX: lng + buffer,
// //             maxY: lat + buffer,
// //           }) || [];
// //         console.log("Kandidat indeks spasial:", candidates);

// //         const kelurahan = boundaryData?.features.find((bf: BoundaryFeature, index: number) => {
// //           if (!candidates.some((c: RBushItem) => c.featureIndex === index)) {
// //             console.log(`Fitur ${index} tidak ada di kandidat`);
// //             return false;
// //           }
// //           if (bf.geometry.type !== "Polygon" && bf.geometry.type !== "MultiPolygon") {
// //             console.log(`Fitur ${index} memiliki tipe geometri tidak valid: ${bf.geometry.type}`);
// //             return false;
// //           }
// //           try {
// //             const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
// //             const isInside = turf.booleanPointInPolygon(point, polygon as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>);
// //             console.log(`Fitur ${index} (${bf.properties?.NAMOBJ || "Tidak ada nama"}): isInside = ${isInside}`);
// //             return isInside;
// //           } catch (error) {
// //             console.error(`Error memeriksa titik dalam poligon untuk fitur ${index}:`, error);
// //             return false;
// //           }
// //         });

// //         const dataFeature = geoData?.features.find((feature: Feature) => {
// //           if (!feature.geometry) {
// //             console.log("Fitur tidak memiliki geometri");
// //             return false;
// //           }
// //           try {
// //             if (feature.geometry.type === "Polygon") {
// //               return turf.booleanPointInPolygon(point, turf.polygon(feature.geometry.coordinates));
// //             } else if (feature.geometry.type === "MultiPolygon") {
// //               return turf.booleanPointInPolygon(point, turf.multiPolygon(feature.geometry.coordinates));
// //             }
// //             console.log(`Fitur memiliki tipe geometri tidak didukung: ${feature.geometry.type}`);
// //             return false;
// //           } catch (error) {
// //             console.error("Error memeriksa titik dalam poligon:", error);
// //             return false;
// //           }
// //         });

// //         console.log("Kelurahan ditemukan:", kelurahan);
// //         console.log("DataFeature ditemukan:", dataFeature);

// //         let value: number | null = null;
// //         if (dataFeature) {
// //           const rawValue = dataType === "aod" ? dataFeature.properties.aod_value : dataFeature.properties.pm25_value;
// //           value = rawValue !== undefined && rawValue !== null ? rawValue : null;
// //           console.log("Nilai diekstrak:", { rawValue, value });
// //         }

// //         // Selalu tampilkan tooltip
// //         const kelurahanName = kelurahan?.properties?.NAMOBJ || "Lokasi Tidak Dikenal";
// //         const content = getTooltipContent(value, kelurahanName);
// //         console.log("Mengatur tooltip:", { content, lat, lng });

// //         if (tooltipRef.current) {
// //           tooltipRef.current.remove();
// //         }
// //         tooltipRef.current = L.tooltip({
// //           sticky: true,
// //           direction: "top",
// //           offset: [0, -20],
// //           className: styles.customTooltip,
// //         })
// //           .setLatLng(e.latlng)
// //           .setContent(content)
// //           .addTo(map);
// //         console.log("Tooltip ditambahkan ke peta");
// //       } catch (error) {
// //         console.error("Error dalam handleMouseMove:", error);
// //         if (tooltipRef.current) {
// //           tooltipRef.current.remove();
// //           tooltipRef.current = null;
// //         }
// //       }
// //     };

// //     map.on("mousemove", handleMouseMove);
// //     console.log("Menambahkan event listener mousemove");

// //     return () => {
// //       map.off("mousemove", handleMouseMove);
// //       if (tooltipRef.current) {
// //         tooltipRef.current.remove();
// //         tooltipRef.current = null;
// //       }
// //       if (staticLayerRef.current) {
// //         map.removeLayer(staticLayerRef.current);
// //         staticLayerRef.current = null;
// //       }
// //       setImageUrl(null);
// //       setBounds(null);
// //       console.log("Membersihkan event listener mousemove");
// //     };
// //   }, [map, cachedGrid, selectedDate, inputRef, geoData, boundaryData, dataType, getTooltipContent, isLoading]);

// //   return (
// //     <>
// //       {isLoading && (
// //         <div className={styles.spinnerOverlay}>
// //           <div className={styles.spinner}></div>
// //           <span>Memuat Heatmap...</span>
// //         </div>
// //       )}
// //       <div className={`${styles.controlsContainer}`}>
// //         <label htmlFor="datePicker" className={styles.dateLabel}>
// //           Pilih Tanggal
// //         </label>
// //         <input type="date" id="datePicker" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={styles.dateInput} ref={inputRef} />
// //       </div>
// //       {imageUrl && bounds && (
// //         <ImageOverlay
// //           url={imageUrl}
// //           bounds={bounds}
// //           opacity={0.85}
// //           interactive={true}
// //           zIndex={1000}
// //           eventHandlers={{
// //             mouseover: () => console.log("Kursor di atas ImageOverlay"),
// //             mousemove: () => console.log("Kursor bergerak di ImageOverlay"),
// //           }}
// //         />
// //       )}
// //       <div className={`${styles.legend} z-[1000]`}>
// //         <h4>{legendTitle}</h4>
// //         <GradientLegend dataType={dataType} />
// //       </div>
// //     </>
// //   );
// // };

// // export default GenericHeatMapLayer;

// // // "use client";

// // // import { useEffect, useRef, useMemo, useCallback, useState } from "react";
// // // import { useMap } from "react-leaflet";
// // // import dynamic from "next/dynamic";
// // // import * as turf from "@turf/turf";
// // // import RBush from "rbush";
// // // import * as L from "leaflet";
// // // import styles from "@/styles/heatmap.module.css";
// // // import { interpolateColor, interpolatePM25Color } from "@/utils/color";
// // // import { GeoJSONData, BoundaryGeoJSONData, BoundaryFeature } from "@/app/types";
// // // import GradientLegend from "../legend/GradientLegend";

// // // const ImageOverlay = dynamic(() => import("react-leaflet").then((mod) => mod.ImageOverlay), { ssr: false });

// // // interface HeatMapLayerProps {
// // //   dataType: "aod" | "pm25-est";
// // //   geoData: GeoJSONData | null;
// // //   boundaryData: BoundaryGeoJSONData | null;
// // //   selectedDate: string;
// // //   setSelectedDate: (date: string) => void;
// // //   isLoading: boolean;
// // //   legendTitle: string;
// // //   inputRef: React.RefObject<HTMLInputElement | null>;
// // // }

// // // interface RBushItem {
// // //   minX: number;
// // //   minY: number;
// // //   maxX: number;
// // //   maxY: number;
// // //   featureIndex: number;
// // // }

// // // interface InterpolatedFeature {
// // //   type: "Feature";
// // //   geometry: GeoJSON.Point;
// // //   properties: { value: number };
// // // }

// // // const GenericHeatMapLayer: React.FC<HeatMapLayerProps> = ({ dataType, geoData, boundaryData, selectedDate, setSelectedDate, isLoading, legendTitle, inputRef }) => {
// // //   const map = useMap();
// // //   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
// // //   const tooltipRef = useRef<L.Tooltip | null>(null);
// // //   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
// // //   const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);
// // //   const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);
// // //   const [imageUrl, setImageUrl] = useState<string | null>(null);
// // //   const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);

// // //   const getTooltipContent = useCallback(
// // //     (value: number | null, kelurahanName: string): string => {
// // //       const formattedValue = value !== null && value > 0 ? (dataType === "aod" ? value.toFixed(4) : value.toFixed(2)) : "No data";
// // //       const color = value !== null && value > 0 ? (dataType === "aod" ? interpolateColor(value) : interpolatePM25Color(value)) : "#a0aec0";
// // //       const textColor = color === "rgba(0, 255, 0, 0.85)" || color === "rgba(255, 255, 0, 0.85)" ? "#000000" : "#ffffff";
// // //       return `
// // //         <div class="${styles.customTooltip}">
// // //           <div class="${styles.kelurahanName}">${kelurahanName}</div>
// // //           <div class="${styles.valueContainer}">
// // //             <div class="${styles.valueCircle}" style="background-color: ${color}; color: ${textColor}">
// // //               ${formattedValue} ${dataType === "aod" || formattedValue === "No data" ? "" : "µg/m³"}
// // //             </div>
// // //           </div>
// // //         </div>
// // //       `;
// // //     },
// // //     [dataType]
// // //   );

// // //   const cachedBoundaries = useMemo(() => {
// // //     if (!geoData) {
// // //       console.log("cachedBoundaries: Tidak ada geoData");
// // //       return turf.featureCollection([]);
// // //     }
// // //     const validFeatures = geoData.features
// // //       .filter((f) => {
// // //         const value = dataType === "aod" ? f.properties.aod_value : f.properties.pm25_value;
// // //         return value !== null && value !== undefined && !isNaN(value);
// // //       })
// // //       .map((feature) => {
// // //         const buffered = turf.buffer(feature.geometry, 0.002, { units: "degrees" });
// // //         if (buffered && (buffered.geometry.type === "Polygon" || buffered.geometry.type === "MultiPolygon")) {
// // //           return buffered as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
// // //         }
// // //         console.log("cachedBoundaries: Fitur tidak valid setelah buffer:", feature);
// // //         return null;
// // //       })
// // //       .filter((f): f is GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> => f != null);
// // //     console.log("cachedBoundaries: Jumlah fitur valid:", validFeatures.length);
// // //     return turf.featureCollection(validFeatures);
// // //   }, [geoData, dataType]);

// // //   useEffect(() => {
// // //     if (!boundaryData || !boundaryData.features) {
// // //       console.log("Tidak ada boundaryData atau fitur, melewati pembuatan indeks spasial");
// // //       return;
// // //     }
// // //     const spatialIndex = new RBush<RBushItem>();
// // //     console.log("Jumlah fitur boundaryData:", boundaryData.features.length);
// // //     boundaryData.features.forEach((feature, index) => {
// // //       if (feature.geometry.type !== "Polygon" && feature.geometry.type !== "MultiPolygon") {
// // //         console.log(`Melewati fitur ${index}: Tipe geometri tidak valid ${feature.geometry.type}`);
// // //         return;
// // //       }
// // //       try {
// // //         const bbox = turf.bbox(feature.geometry);
// // //         if (bbox.some((val) => isNaN(val))) {
// // //           console.log(`Melewati fitur ${index}: Bbox tidak valid`, bbox);
// // //           return;
// // //         }
// // //         spatialIndex.insert({
// // //           minX: bbox[0],
// // //           minY: bbox[1],
// // //           maxX: bbox[2],
// // //           maxY: bbox[3],
// // //           featureIndex: index,
// // //         });
// // //         console.log(`Menambahkan fitur ${index} (${feature.properties?.NAMOBJ || "Tidak ada nama"}):`, bbox);
// // //       } catch (error) {
// // //         console.error(`Error memproses fitur ${index}:`, error);
// // //       }
// // //     });
// // //     console.log("Indeks spasial selesai dibuat, jumlah item:", spatialIndex.all().length);
// // //     spatialIndexRef.current = spatialIndex;

// // //     return () => {
// // //       spatialIndexRef.current = null;
// // //       console.log("Membersihkan indeks spasial");
// // //     };
// // //   }, [boundaryData]);

// // //   const generateStaticGrid = useCallback(
// // //     (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
// // //       console.log("generateStaticGrid: Memulai dengan jumlah fitur geoData:", geoData.features.length);
// // //       if (!boundaryData || !boundaryData.features) {
// // //         console.warn("generateStaticGrid: boundaryData kosong atau tidak ada fitur");
// // //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // //       }

// // //       const validBoundaryFeatures = boundaryData.features.filter((f): f is BoundaryFeature => f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon");
// // //       if (validBoundaryFeatures.length === 0) {
// // //         console.warn("generateStaticGrid: Tidak ada fitur Polygon atau MultiPolygon yang valid di boundaryData");
// // //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // //       }

// // //       const points = geoData.features
// // //         .map((feature) => {
// // //           if (!feature.geometry) {
// // //             console.log("generateStaticGrid: Fitur tanpa geometri:", feature);
// // //             return null;
// // //           }
// // //           const centroid = turf.centroid(feature.geometry);
// // //           const value = dataType === "aod" ? feature.properties.aod_value : feature.properties.pm25_value;
// // //           if (value == null || isNaN(value)) {
// // //             console.log("generateStaticGrid: Melewati fitur karena nilai tidak valid:", feature);
// // //             return null;
// // //           }
// // //           return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], value];
// // //         })
// // //         .filter((p): p is [number, number, number] => p != null);
// // //       console.log("generateStaticGrid: Jumlah titik valid untuk interpolasi:", points.length);

// // //       const bbox = turf.bbox(turf.featureCollection(validBoundaryFeatures));
// // //       console.log("generateStaticGrid: Bounding box:", bbox);

// // //       const cellSize = 0.02;
// // //       let grid;
// // //       try {
// // //         grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });
// // //         console.log("generateStaticGrid: Titik grid dibuat:", grid.features.length);
// // //       } catch (error) {
// // //         console.error("generateStaticGrid: Error membuat grid titik:", error);
// // //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // //       }

// // //       let interpolated = turf.featureCollection([]);
// // //       if (points.length > 0) {
// // //         try {
// // //           interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { value: p[2] }))), cellSize / 4, { gridType: "point", property: "value", units: "degrees", weight: 2.5 });
// // //           console.log("generateStaticGrid: Titik interpolasi dibuat:", interpolated.features.length);
// // //         } catch (error) {
// // //           console.error("generateStaticGrid: Error menginterpolasi data:", error);
// // //           return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // //         }
// // //       } else {
// // //         console.warn("generateStaticGrid: Tidak ada titik valid untuk interpolasi");
// // //       }
// // //       interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];

// // //       const canvas = document.createElement("canvas");
// // //       const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
// // //       const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
// // //       canvas.width = width;
// // //       canvas.height = height;
// // //       const ctx = canvas.getContext("2d");

// // //       if (!ctx) {
// // //         console.error("generateStaticGrid: Gagal mendapatkan konteks kanvas");
// // //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // //       }

// // //       ctx.fillStyle = "rgba(0, 0, 0, 0)";
// // //       ctx.fillRect(0, 0, width, height);

// // //       let validPoints = 0;
// // //       grid.features.forEach((feature) => {
// // //         const coords = feature.geometry.coordinates;
// // //         if (!Array.isArray(coords) || coords.length !== 2 || typeof coords[0] !== "number" || typeof coords[1] !== "number") {
// // //           console.warn("generateStaticGrid: Koordinat tidak valid, melewati:", coords);
// // //           return;
// // //         }

// // //         const point = turf.point(coords as [number, number]);
// // //         const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>));

// // //         let value: number | null = null;
// // //         if (inBuffer && interpolated.features.length > 0) {
// // //           const closest = interpolated.features.reduce(
// // //             (acc, f) => {
// // //               if (f.geometry.type !== "Point" || !f.properties || f.properties.value == null) return acc;
// // //               const dist = turf.distance(f.geometry as GeoJSON.Point, coords as [number, number], { units: "degrees" });
// // //               return dist < acc.dist ? { dist, value: f.properties.value } : acc;
// // //             },
// // //             { dist: Infinity, value: null as number | null }
// // //           );
// // //           value = closest.value !== null && closest.value > 0 ? closest.value : null;
// // //         } else {
// // //           const dataFeature = geoData.features.find((feature: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>) => {
// // //             if (!feature.geometry) {
// // //               console.log("Fitur tidak memiliki geometri");
// // //               return false;
// // //             }
// // //             try {
// // //               if (feature.geometry.type === "Polygon") {
// // //                 return turf.booleanPointInPolygon(point, turf.polygon(feature.geometry.coordinates));
// // //               } else if (feature.geometry.type === "MultiPolygon") {
// // //                 return turf.booleanPointInPolygon(point, turf.multiPolygon(feature.geometry.coordinates));
// // //               }
// // //               console.log(`Fitur memiliki tipe geometri tidak didukung: ${feature.geometry.type}`);
// // //               return false;
// // //             } catch (error) {
// // //               console.error("Error memeriksa titik dalam poligon:", error);
// // //               return false;
// // //             }
// // //           });

// // //           if (dataFeature) {
// // //             const rawValue = dataType === "aod" ? dataFeature.properties.aod_value : dataFeature.properties.pm25_value;
// // //             value = rawValue !== undefined && rawValue !== null ? rawValue : null;
// // //           }
// // //         }

// // //         if (value === null) return;

// // //         const color = dataType === "aod" ? interpolateColor(value) : interpolatePM25Color(value);
// // //         const x = Math.round((coords[0] - bbox[0]) / cellSize);
// // //         const y = Math.round((bbox[3] - coords[1]) / cellSize);
// // //         ctx.fillStyle = color;
// // //         ctx.fillRect(x, y, 1, 1);
// // //         validPoints++;
// // //       });

// // //       console.log("generateStaticGrid: Jumlah titik valid yang digambar di kanvas:", validPoints);
// // //       const newImageUrl = validPoints > 0 ? canvas.toDataURL() : null;
// // //       return { imageUrl: newImageUrl, bbox };
// // //     },
// // //     [dataType, cachedBoundaries]
// // //   );

// // //   const cachedGrid = useMemo(() => {
// // //     if (!geoData || !boundaryData) {
// // //       console.warn("cachedGrid: Tidak ada geoData atau boundaryData");
// // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // //     }
// // //     return generateStaticGrid(geoData, boundaryData);
// // //   }, [geoData, boundaryData, generateStaticGrid]);

// // //   useEffect(() => {
// // //     if (!map || !geoData || !boundaryData || isLoading) {
// // //       console.log("Melewati useEffect: Tidak ada map, geoData, boundaryData, atau sedang memuat");
// // //       if (staticLayerRef.current) {
// // //         map.removeLayer(staticLayerRef.current);
// // //         staticLayerRef.current = null;
// // //       }
// // //       if (tooltipRef.current) {
// // //         tooltipRef.current.remove();
// // //         tooltipRef.current = null;
// // //       }
// // //       setImageUrl(null);
// // //       setBounds(null);
// // //       return;
// // //     }

// // //     const { imageUrl: newImageUrl, bbox } = cachedGrid;
// // //     console.log("useEffect: Image URL dan bbox:", { newImageUrl, bbox });

// // //     if (staticLayerRef.current) {
// // //       map.removeLayer(staticLayerRef.current);
// // //       staticLayerRef.current = null;
// // //     }
// // //     if (tooltipRef.current) {
// // //       tooltipRef.current.remove();
// // //       tooltipRef.current = null;
// // //     }

// // //     if (newImageUrl && Array.isArray(bbox) && bbox.length === 4 && bbox.every((val) => typeof val === "number" && !isNaN(val))) {
// // //       const newBounds: L.LatLngBoundsExpression = [
// // //         [bbox[1], bbox[0]], // [latMin, lngMin]
// // //         [bbox[3], bbox[2]], // [latMax, lngMax]
// // //       ];
// // //       staticLayerRef.current = L.imageOverlay(newImageUrl, newBounds, { opacity: 0.85, interactive: true }).addTo(map);
// // //       console.log("useEffect: ImageOverlay ditambahkan ke peta");
// // //       setImageUrl(newImageUrl);
// // //       setBounds(L.latLngBounds(newBounds));
// // //     } else {
// // //       console.warn("useEffect: imageUrl atau bbox tidak valid", { newImageUrl, bbox });
// // //       setImageUrl(null);
// // //       setBounds(null);
// // //     }

// // //     const handleMouseMove = (e: L.LeafletMouseEvent) => {
// // //       if (inputRef.current && document.activeElement === inputRef.current) {
// // //         console.log("Melewati mousemove: Input pencarian sedang difokuskan");
// // //         return;
// // //       }
// // //       const { lat, lng } = e.latlng;
// // //       console.log("Kursor berpindah ke:", { lat, lng });

// // //       if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
// // //         console.log("Melewati mousemove: Posisi tidak berubah");
// // //         return;
// // //       }
// // //       lastPosition.current = { lat, lng };

// // //       try {
// // //         const point = turf.point([lng, lat]);
// // //         console.log("Membuat titik Turf:", point);

// // //         const buffer = 0.001;
// // //         const candidates =
// // //           spatialIndexRef.current?.search({
// // //             minX: lng - buffer,
// // //             minY: lat - buffer,
// // //             maxX: lng + buffer,
// // //             maxY: lat + buffer,
// // //           }) || [];
// // //         console.log("Kandidat indeks spasial:", candidates);

// // //         const kelurahan = boundaryData?.features.find((bf, index) => {
// // //           if (!candidates.some((c: RBushItem) => c.featureIndex === index)) {
// // //             console.log(`Fitur ${index} tidak ada di kandidat`);
// // //             return false;
// // //           }
// // //           if (bf.geometry.type !== "Polygon" && bf.geometry.type !== "MultiPolygon") {
// // //             console.log(`Fitur ${index} memiliki tipe geometri tidak valid: ${bf.geometry.type}`);
// // //             return false;
// // //           }
// // //           try {
// // //             const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
// // //             const isInside = turf.booleanPointInPolygon(point, polygon as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>);
// // //             console.log(`Fitur ${index} (${bf.properties?.NAMOBJ || "Tidak ada nama"}): isInside = ${isInside}`);
// // //             return isInside;
// // //           } catch (error) {
// // //             console.error(`Error memeriksa titik dalam poligon untuk fitur ${index}:`, error);
// // //             return false;
// // //           }
// // //         });

// // //         const dataFeature = geoData?.features.find((feature: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>) => {
// // //           if (!feature.geometry) {
// // //             console.log("Fitur tidak memiliki geometri");
// // //             return false;
// // //           }
// // //           try {
// // //             if (feature.geometry.type === "Polygon") {
// // //               return turf.booleanPointInPolygon(point, turf.polygon(feature.geometry.coordinates));
// // //             } else if (feature.geometry.type === "MultiPolygon") {
// // //               return turf.booleanPointInPolygon(point, turf.multiPolygon(feature.geometry.coordinates));
// // //             }
// // //             console.log(`Fitur memiliki tipe geometri tidak didukung: ${feature.geometry.type}`);
// // //             return false;
// // //           } catch (error) {
// // //             console.error("Error memeriksa titik dalam poligon:", error);
// // //             return false;
// // //           }
// // //         });

// // //         console.log("Kelurahan ditemukan:", kelurahan);
// // //         console.log("DataFeature ditemukan:", dataFeature);

// // //         let value: number | null = null;
// // //         if (dataFeature) {
// // //           const rawValue = dataType === "aod" ? dataFeature.properties.aod_value : dataFeature.properties.pm25_value;
// // //           value = rawValue !== undefined && rawValue !== null ? rawValue : null;
// // //           console.log("Nilai diekstrak:", { rawValue, value });
// // //         }

// // //         // Selalu tampilkan tooltip
// // //         const kelurahanName = kelurahan?.properties?.NAMOBJ || "Lokasi Tidak Dikenal";
// // //         const content = getTooltipContent(value, kelurahanName);
// // //         console.log("Mengatur tooltip:", { content, lat, lng });

// // //         if (tooltipRef.current) {
// // //           tooltipRef.current.remove();
// // //         }
// // //         tooltipRef.current = L.tooltip({
// // //           sticky: true,
// // //           direction: "top",
// // //           offset: [0, -20],
// // //           className: styles.customTooltip,
// // //         })
// // //           .setLatLng(e.latlng)
// // //           .setContent(content)
// // //           .addTo(map);
// // //         console.log("Tooltip ditambahkan ke peta");
// // //       } catch (error) {
// // //         console.error("Error dalam handleMouseMove:", error);
// // //         if (tooltipRef.current) {
// // //           tooltipRef.current.remove();
// // //           tooltipRef.current = null;
// // //         }
// // //       }
// // //     };

// // //     map.on("mousemove", handleMouseMove);
// // //     console.log("Menambahkan event listener mousemove");

// // //     return () => {
// // //       map.off("mousemove", handleMouseMove);
// // //       if (tooltipRef.current) {
// // //         tooltipRef.current.remove();
// // //         tooltipRef.current = null;
// // //       }
// // //       if (staticLayerRef.current) {
// // //         map.removeLayer(staticLayerRef.current);
// // //         staticLayerRef.current = null;
// // //       }
// // //       setImageUrl(null);
// // //       setBounds(null);
// // //       console.log("Membersihkan event listener mousemove");
// // //     };
// // //   }, [map, cachedGrid, selectedDate, inputRef, geoData, boundaryData, dataType, getTooltipContent, isLoading]);

// // //   return (
// // //     <>
// // //       {isLoading && (
// // //         <div className={styles.spinnerOverlay}>
// // //           <div className={styles.spinner}></div>
// // //           <span>Memuat Heatmap...</span>
// // //         </div>
// // //       )}
// // //       <div className={`${styles.controlsContainer}`}>
// // //         <label htmlFor="datePicker" className={styles.dateLabel}>
// // //           Pilih Tanggal
// // //         </label>
// // //         <input type="date" id="datePicker" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={styles.dateInput} ref={inputRef} />
// // //       </div>
// // //       {imageUrl && bounds && (
// // //         <ImageOverlay
// // //           url={imageUrl}
// // //           bounds={bounds}
// // //           opacity={0.85}
// // //           interactive={true}
// // //           zIndex={1000}
// // //           eventHandlers={{
// // //             mouseover: () => console.log("Kursor di atas ImageOverlay"),
// // //             mousemove: () => console.log("Kursor bergerak di ImageOverlay"),
// // //           }}
// // //         />
// // //       )}
// // //       <div className={`${styles.legend} z-[1000]`}>
// // //         <h4>{legendTitle}</h4>
// // //         <GradientLegend dataType={dataType} />
// // //       </div>
// // //     </>
// // //   );
// // // };

// // // export default GenericHeatMapLayer;

// "use client";

// import { useEffect, useRef, useMemo, useCallback, useState } from "react";
// import { useMap } from "react-leaflet";
// import dynamic from "next/dynamic";
// import * as turf from "@turf/turf";
// import RBush from "rbush";
// import * as L from "leaflet";
// import styles from "@/styles/heatmap.module.css";
// import { interpolateColor, interpolatePM25Color } from "@/utils/color";
// import { GeoJSONData, BoundaryGeoJSONData, Feature, BoundaryFeature } from "@/app/types";
// import GradientLegend from "../legend/GradientLegend";

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
//   geometry: GeoJSON.Point;
//   properties: { value: number };
// }

// const GenericHeatMapLayer: React.FC<HeatMapLayerProps> = ({
//   dataType,
//   geoData,
//   boundaryData,
//   selectedDate,
//   setSelectedDate,
//   isLoading,
//   legendTitle,
//   inputRef,
// }) => {
//   const map = useMap();
//   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
//   const tooltipRef = useRef<L.Tooltip | null>(null);
//   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
//   const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);
//   const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);
//   const [imageUrl, setImageUrl] = useState<string | null>(null);
//   const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);

//   const getTooltipContent = useCallback(
//     (value: number | null, kelurahanName: string): string => {
//       const formattedValue = value !== null && value > 0 ? (dataType === "aod" ? value.toFixed(4) : value.toFixed(2)) : "No data";
//       const color = value !== null && value > 0 ? (dataType === "aod" ? interpolateColor(value) : interpolatePM25Color(value)) : "#a0aec0";
//       const textColor = color === "rgba(0, 255, 0, 0.85)" || color === "rgba(255, 255, 0, 0.85)" ? "#000000" : "#ffffff";
//       return `
//         <div class="${styles.customTooltip}">
//           <div class="${styles.kelurahanName}">${kelurahanName}</div>
//           <div class="${styles.valueContainer}">
//             <div class="${styles.valueCircle}" style="background-color: ${color}; color: ${textColor}">
//               ${formattedValue} ${dataType === "aod" || formattedValue === "No data" ? "" : "µg/m³"}
//             </div>
//           </div>
//         </div>
//       `;
//     },
//     [dataType]
//   );

//   const cachedBoundaries = useMemo(() => {
//     if (!geoData) {
//       console.log("cachedBoundaries: Tidak ada geoData");
//       return turf.featureCollection([]);
//     }
//     const validFeatures = geoData.features
//       .filter((f: Feature) => {
//         const value = dataType === "aod" ? f.properties.aod_value : f.properties.pm25_value;
//         return value !== null && value !== undefined && !isNaN(value);
//       })
//       .map((feature: Feature) => {
//         const buffered = turf.buffer(feature.geometry, 0.002, { units: "degrees" }) as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
//         if (buffered && (buffered.geometry.type === "Polygon" || buffered.geometry.type === "MultiPolygon")) {
//           return buffered;
//         }
//         console.log("cachedBoundaries: Fitur tidak valid setelah buffer:", feature);
//         return null;
//       })
//       .filter((f): f is GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> => f != null);
//     console.log("cachedBoundaries: Jumlah fitur valid:", validFeatures.length);
//     return turf.featureCollection(validFeatures);
//   }, [geoData, dataType]);

//   useEffect(() => {
//     if (!boundaryData || !boundaryData.features) {
//       console.log("Tidak ada boundaryData atau fitur, melewati pembuatan indeks spasial");
//       return;
//     }
//     const spatialIndex = new RBush<RBushItem>();
//     console.log("Jumlah fitur boundaryData:", boundaryData.features.length);
//     boundaryData.features.forEach((feature: BoundaryFeature, index: number) => {
//       if (feature.geometry.type !== "Polygon" && feature.geometry.type !== "MultiPolygon") {
//         console.log(`Melewati fitur ${index}: Tipe geometri tidak valid ${feature.geometry.type}`);
//         return;
//       }
//       try {
//         const bbox = turf.bbox(feature.geometry);
//         if (bbox.some((val) => isNaN(val))) {
//           console.log(`Melewati fitur ${index}: Bbox tidak valid`, bbox);
//           return;
//         }
//         spatialIndex.insert({
//           minX: bbox[0],
//           minY: bbox[1],
//           maxX: bbox[2],
//           maxY: bbox[3],
//           featureIndex: index,
//         });
//         console.log(`Menambahkan fitur ${index} (${feature.properties?.NAMOBJ || "Tidak ada nama"}):`, bbox);
//       } catch (error) {
//         console.error(`Error memproses fitur ${index}:`, error);
//       }
//     });
//     console.log("Indeks spasial selesai dibuat, jumlah item:", spatialIndex.all().length);
//     spatialIndexRef.current = spatialIndex;

//     return () => {
//       spatialIndexRef.current = null;
//       console.log("Membersihkan indeks spasial");
//     };
//   }, [boundaryData]);

//   const generateStaticGrid = useCallback(
//     (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
//       console.log("generateStaticGrid: Memulai dengan jumlah fitur geoData:", geoData.features.length);
//       if (!boundaryData || !boundaryData.features) {
//         console.warn("generateStaticGrid: boundaryData kosong atau tidak ada fitur");
//         return { imageUrl: null, bbox: [0, 0, 0, 0] };
//       }

//       const validBoundaryFeatures = boundaryData.features.filter(
//         (f: BoundaryFeature): f is BoundaryFeature => f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon"
//       );
//       if (validBoundaryFeatures.length === 0) {
//         console.warn("generateStaticGrid: Tidak ada fitur Polygon atau MultiPolygon yang valid di boundaryData");
//         return { imageUrl: null, bbox: [0, 0, 0, 0] };
//       }

//       const points = geoData.features
//         .map((feature: Feature) => {
//           if (!feature.geometry) {
//             console.log("generateStaticGrid: Fitur tanpa geometri:", feature);
//             return null;
//           }
//           const centroid = turf.centroid(feature.geometry);
//           const value = dataType === "aod" ? feature.properties.aod_value : feature.properties.pm25_value;
//           if (value == null || isNaN(value)) {
//             console.log("generateStaticGrid: Melewati fitur karena nilai tidak valid:", feature);
//             return null;
//           }
//           return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], value];
//         })
//         .filter((p): p is [number, number, number] => p != null);
//       console.log("generateStaticGrid: Jumlah titik valid untuk interpolasi:", points.length);

//       const bbox = turf.bbox(turf.featureCollection(validBoundaryFeatures));
//       console.log("generateStaticGrid: Bounding box:", bbox);

//       const cellSize = 0.02;
//       let grid;
//       try {
//         grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });
//         console.log("generateStaticGrid: Titik grid dibuat:", grid.features.length);
//       } catch (error) {
//         console.error("generateStaticGrid: Error membuat grid titik:", error);
//         return { imageUrl: null, bbox: [0, 0, 0, 0] };
//       }

//       let interpolated = turf.featureCollection([]);
//       if (points.length > 0) {
//         try {
//           interpolated = turf.interpolate(
//             turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { value: p[2] }))),
//             cellSize / 4,
//             { gridType: "point", property: "value", units: "degrees", weight: 2.5 }
//           );
//           console.log("generateStaticGrid: Titik interpolasi dibuat:", interpolated.features.length);
//         } catch (error) {
//           console.error("generateStaticGrid: Error menginterpolasi data:", error);
//           return { imageUrl: null, bbox: [0, 0, 0, 0] };
//         }
//       } else {
//         console.warn("generateStaticGrid: Tidak ada titik valid untuk interpolasi");
//       }
//       interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];

//       const canvas = document.createElement("canvas");
//       const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
//       const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
//       canvas.width = width;
//       canvas.height = height;
//       const ctx = canvas.getContext("2d");

//       if (!ctx) {
//         console.error("generateStaticGrid: Gagal mendapatkan konteks kanvas");
//         return { imageUrl: null, bbox: [0, 0, 0, 0] };
//       }

//       ctx.fillStyle = "rgba(0, 0, 0, 0)";
//       ctx.fillRect(0, 0, width, height);

//       let validPoints = 0;
//       grid.features.forEach((feature) => {
//         const coords = feature.geometry.coordinates;
//         if (!Array.isArray(coords) || coords.length !== 2 || typeof coords[0] !== "number" || typeof coords[1] !== "number") {
//           console.warn("generateStaticGrid: Koordinat tidak valid, melewati:", coords);
//           return;
//         }

//         const point = turf.point(coords as [number, number]);
//         const inBuffer = cachedBoundaries.features.some((buffer) =>
//           turf.booleanPointInPolygon(point, buffer as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>)
//         );

//         let value: number | null = null;
//         if (inBuffer && interpolated.features.length > 0) {
//           const closest = interpolated.features.reduce(
//             (acc, f) => {
//               if (f.geometry.type !== "Point" || !f.properties || f.properties.value == null) return acc;
//               const dist = turf.distance(f.geometry as GeoJSON.Point, coords as [number, number], { units: "degrees" });
//               return dist < acc.dist ? { dist, value: f.properties.value } : acc;
//             },
//             { dist: Infinity, value: null as number | null }
//           );
//           value = closest.value !== null && closest.value > 0 ? closest.value : null;
//         } else {
//           const dataFeature = geoData.features.find((feature: Feature) => {
//             if (!feature.geometry) {
//               console.log("Fitur tidak memiliki geometri");
//               return false;
//             }
//             try {
//               if (feature.geometry.type === "Polygon") {
//                 return turf.booleanPointInPolygon(point, turf.polygon(feature.geometry.coordinates));
//               } else if (feature.geometry.type === "MultiPolygon") {
//                 return turf.booleanPointInPolygon(point, turf.multiPolygon(feature.geometry.coordinates));
//               }
//               console.log(`Fitur memiliki tipe geometri tidak didukung: ${feature.geometry.type}`);
//               return false;
//             } catch (error) {
//               console.error("Error memeriksa titik dalam poligon:", error);
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

//       console.log("generateStaticGrid: Jumlah titik valid yang digambar di kanvas:", validPoints);
//       const newImageUrl = validPoints > 0 ? canvas.toDataURL() : null;
//       return { imageUrl: newImageUrl, bbox };
//     },
//     [dataType, cachedBoundaries]
//   );

//   const cachedGrid = useMemo(() => {
//     if (!geoData || !boundaryData) {
//       console.warn("cachedGrid: Tidak ada geoData atau boundaryData");
//       return { imageUrl: null, bbox: [0, 0, 0, 0] };
//     }
//     return generateStaticGrid(geoData, boundaryData);
//   }, [geoData, boundaryData, generateStaticGrid]);

//   useEffect(() => {
//     if (!map || !geoData || !boundaryData || isLoading) {
//       console.log("Melewati useEffect: Tidak ada map, geoData, boundaryData, atau sedang memuat");
//       if (staticLayerRef.current) {
//         map.removeLayer(staticLayerRef.current);
//         staticLayerRef.current = null;
//       }
//       if (tooltipRef.current) {
//         tooltipRef.current.remove();
//         tooltipRef.current = null;
//       }
//       setImageUrl(null);
//       setBounds(null);
//       return;
//     }

//     const { imageUrl: newImageUrl, bbox } = cachedGrid;
//     console.log("useEffect: Image URL dan bbox:", { newImageUrl, bbox });

//     if (staticLayerRef.current) {
//       map.removeLayer(staticLayerRef.current);
//       staticLayerRef.current = null;
//     }
//     if (tooltipRef.current) {
//       tooltipRef.current.remove();
//       tooltipRef.current = null;
//     }

//     if (newImageUrl && Array.isArray(bbox) && bbox.length === 4 && bbox.every((val) => typeof val === "number" && !isNaN(val))) {
//       const newBounds: L.LatLngBoundsExpression = [
//         [bbox[1], bbox[0]], // [latMin, lngMin]
//         [bbox[3], bbox[2]], // [latMax, lngMax]
//       ];
//       staticLayerRef.current = L.imageOverlay(newImageUrl, newBounds, { opacity: 0.85, interactive: true }).addTo(map);
//       console.log("useEffect: ImageOverlay ditambahkan ke peta");
//       setImageUrl(newImageUrl);
//       setBounds(L.latLngBounds(newBounds));
//     } else {
//       console.warn("useEffect: imageUrl atau bbox tidak valid", { newImageUrl, bbox });
//       setImageUrl(null);
//       setBounds(null);
//     }

//     const handleMouseMove = (e: L.LeafletMouseEvent) => {
//       if (inputRef.current && document.activeElement === inputRef.current) {
//         console.log("Melewati mousemove: Input pencarian sedang difokuskan");
//         return;
//       }
//       const { lat, lng } = e.latlng;
//       console.log("Kursor berpindah ke:", { lat, lng });

//       if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
//         console.log("Melewati mousemove: Posisi tidak berubah");
//         return;
//       }
//       lastPosition.current = { lat, lng };

//       try {
//         const point = turf.point([lng, lat]);
//         console.log("Membuat titik Turf:", point);

//         const buffer = 0.001;
//         const candidates = spatialIndexRef.current?.search({
//           minX: lng - buffer,
//           minY: lat - buffer,
//           maxX: lng + buffer,
//           maxY: lat + buffer,
//         }) || [];
//         console.log("Kandidat indeks spasial:", candidates);

//         const kelurahan = boundaryData?.features.find((bf: BoundaryFeature, index: number) => {
//           if (!candidates.some((c: RBushItem) => c.featureIndex === index)) {
//             console.log(`Fitur ${index} tidak ada di kandidat`);
//             return false;
//           }
//           if (bf.geometry.type !== "Polygon" && bf.geometry.type !== "MultiPolygon") {
//             console.log(`Fitur ${index} memiliki tipe geometri tidak valid: ${bf.geometry.type}`);
//             return false;
//           }
//           try {
//             const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
//             const isInside = turf.booleanPointInPolygon(point, polygon as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>);
//             console.log(`Fitur ${index} (${bf.properties?.NAMOBJ || "Tidak ada nama"}): isInside = ${isInside}`);
//             return isInside;
//           } catch (error) {
//             console.error(`Error memeriksa titik dalam poligon untuk fitur ${index}:`, error);
//             return false;
//           }
//         });

//         const dataFeature = geoData?.features.find((feature: Feature) => {
//           if (!feature.geometry) {
//             console.log("Fitur tidak memiliki geometri");
//             return false;
//           }
//           try {
//             if (feature.geometry.type === "Polygon") {
//               return turf.booleanPointInPolygon(point, turf.polygon(feature.geometry.coordinates));
//             } else if (feature.geometry.type === "MultiPolygon") {
//               return turf.booleanPointInPolygon(point, turf.multiPolygon(feature.geometry.coordinates));
//             }
//             console.log(`Fitur memiliki tipe geometri tidak didukung: ${feature.geometry.type}`);
//             return false;
//           } catch (error) {
//             console.error("Error memeriksa titik dalam poligon:", error);
//             return false;
//           }
//         });

//         console.log("Kelurahan ditemukan:", kelurahan);
//         console.log("DataFeature ditemukan:", dataFeature);

//         let value: number | null = null;
//         if (dataFeature) {
//           const rawValue = dataType === "aod" ? dataFeature.properties.aod_value : dataFeature.properties.pm25_value;
//           value = rawValue !== undefined && rawValue !== null ? rawValue : null;
//           console.log("Nilai diekstrak:", { rawValue, value });
//         }

//         // Selalu tampilkan tooltip
//         const kelurahanName = kelurahan?.properties?.NAMOBJ || "Lokasi Tidak Dikenal";
//         const content = getTooltipContent(value, kelurahanName);
//         console.log("Mengatur tooltip:", { content, lat, lng });

//         if (tooltipRef.current) {
//           tooltipRef.current.remove();
//         }
//         tooltipRef.current = L.tooltip({
//           sticky: true,
//           direction: "top",
//           offset: [0, -20],
//           className: styles.customTooltip,
//         })
//           .setLatLng(e.latlng)
//           .setContent(content)
//           .addTo(map);
//         console.log("Tooltip ditambahkan ke peta");
//       } catch (error) {
//         console.error("Error dalam handleMouseMove:", error);
//         if (tooltipRef.current) {
//           tooltipRef.current.remove();
//           tooltipRef.current = null;
//         }
//       }
//     };

//     map.on("mousemove", handleMouseMove);
//     console.log("Menambahkan event listener mousemove");

//     return () => {
//       map.off("mousemove", handleMouseMove);
//       if (tooltipRef.current) {
//         tooltipRef.current.remove();
//         tooltipRef.current = null;
//       }
//       if (staticLayerRef.current) {
//         map.removeLayer(staticLayerRef.current);
//         staticLayerRef.current = null;
//       }
//       setImageUrl(null);
//       setBounds(null);
//       console.log("Membersihkan event listener mousemove");
//     };
//   }, [map, cachedGrid, selectedDate, inputRef, geoData, boundaryData, dataType, getTooltipContent, isLoading]);

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
//         <input
//           type="date"
//           id="datePicker"
//           value={selectedDate}
//           onChange={(e) => setSelectedDate(e.target.value)}
//           className={styles.dateInput}
//           ref={inputRef}
//         />
//       </div>
//       {imageUrl && bounds && (
//         <ImageOverlay
//           url={imageUrl}
//           bounds={bounds}
//           opacity={0.85}
//           interactive={true}
//           zIndex={1000}
//           eventHandlers={{
//             mouseover: () => console.log("Kursor di atas ImageOverlay"),
//             mousemove: () => console.log("Kursor bergerak di ImageOverlay"),
//           }}
//         />
//       )}
//       <div className={`${styles.legend} z-[1000]`}>
//         <h4>{legendTitle}</h4>
//         <GradientLegend dataType={dataType} />
//       </div>
//     </>
//   );
// };

// export default GenericHeatMapLayer;

"use client";

import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { useMap } from "react-leaflet";
import dynamic from "next/dynamic";
import * as turf from "@turf/turf";
import RBush from "rbush";
import * as L from "leaflet";
import styles from "@/styles/heatmap.module.css";
import { interpolateColor, interpolatePM25Color } from "@/utils/color";
import { GeoJSONData, BoundaryGeoJSONData, Feature, BoundaryFeature } from "@/app/types";
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
  geometry: GeoJSON.Point;
  properties: { value: number };
}

// Type guard untuk memeriksa apakah geometri adalah Polygon atau MultiPolygon
const isPolygonOrMultiPolygon = (
  geometry: GeoJSON.Geometry
): geometry is GeoJSON.Polygon | GeoJSON.MultiPolygon => {
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
}) => {
  const map = useMap();
  const staticLayerRef = useRef<L.ImageOverlay | null>(null);
  const tooltipRef = useRef<L.Tooltip | null>(null);
  const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
  const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);
  const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);

  const getTooltipContent = useCallback(
    (value: number | null, kelurahanName: string): string => {
      const formattedValue = value !== null && value > 0 ? (dataType === "aod" ? value.toFixed(4) : value.toFixed(2)) : "No data";
      const color = value !== null && value > 0 ? (dataType === "aod" ? interpolateColor(value) : interpolatePM25Color(value)) : "#a0aec0";
      const textColor = color === "rgba(0, 255, 0, 0.85)" || color === "rgba(255, 255, 0, 0.85)" ? "#000000" : "#ffffff";
      return `
        <div class="${styles.customTooltip}">
          <div class="${styles.kelurahanName}">${kelurahanName}</div>
          <div class="${styles.valueContainer}">
            <div class="${styles.valueCircle}" style="background-color: ${color}; color: ${textColor}">
              ${formattedValue} ${dataType === "aod" || formattedValue === "No data" ? "" : "µg/m³"}
            </div>
          </div>
        </div>
      `;
    },
    [dataType]
  );

  const cachedBoundaries = useMemo(() => {
    if (!geoData) {
      console.log("cachedBoundaries: Tidak ada geoData");
      return turf.featureCollection([]);
    }
    const validFeatures = geoData.features
      .filter((f: Feature) => {
        const value = dataType === "aod" ? f.properties.aod_value : f.properties.pm25_value;
        return value !== null && value !== undefined && !pencarianNaN(value);
      })
      .map((feature: Feature) => {
        const buffered = turf.buffer(feature, 0.002, { units: "degrees" }) as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
        if (buffered && isPolygonOrMultiPolygon(buffered.geometry)) {
          return buffered;
        }
        console.log("cachedBoundaries: Fitur tidak valid setelah buffer:", feature);
        return null;
      })
      .filter((f): f is GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> => f != null);
    console.log("cachedBoundaries: Jumlah fitur valid:", validFeatures.length);
    return turf.featureCollection(validFeatures);
  }, [geoData, dataType]);

  useEffect(() => {
    if (!boundaryData || !boundaryData.features) {
      console.log("Tidak ada boundaryData atau fitur, melewati pembuatan indeks spasial");
      return;
    }
    const spatialIndex = new RBush<RBushItem>();
    console.log("Jumlah fitur boundaryData:", boundaryData.features.length);
    boundaryData.features.forEach((feature: BoundaryFeature, index: number) => {
      if (!isPolygonOrMultiPolygon(feature.geometry)) {
        console.log(`Melewati fitur ${index}: Tipe geometri tidak valid ${feature.geometry.type}`);
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
        console.log(`Menambahkan fitur ${index} (${feature.properties?.NAMOBJ || "Tidak ada nama"}):`, bbox);
      } catch (error) {
        console.error(`Error memproses fitur ${index}:`, error);
      }
    });
    console.log("Indeks spasial selesai dibuat, jumlah item:", spatialIndex.all().length);
    spatialIndexRef.current = spatialIndex;

    return () => {
      spatialIndexRef.current = null;
      console.log("Membersihkan indeks spasial");
    };
  }, [boundaryData]);

  const generateStaticGrid = useCallback(
    (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
      console.log("generateStaticGrid: Memulai dengan jumlah fitur geoData:", geoData.features.length);
      if (!boundaryData || !boundaryData.features) {
        console.warn("generateStaticGrid: boundaryData kosong atau tidak ada fitur");
        return { imageUrl: null, bbox: [0, 0, 0, 0] };
      }

      const validBoundaryFeatures = boundaryData.features.filter(
        (f: BoundaryFeature): f is BoundaryFeature => isPolygonOrMultiPolygon(f.geometry)
      );
      if (validBoundaryFeatures.length === 0) {
        console.warn("generateStaticGrid: Tidak ada fitur Polygon atau MultiPolygon yang valid di boundaryData");
        return { imageUrl: null, bbox: [0, 0, 0, 0] };
      }

      const points = geoData.features
        .map((feature: Feature) => {
          if (!feature.geometry) {
            console.log("generateStaticGrid: Fitur tanpa geometri:", feature);
            return null;
          }
          const centroid = turf.centroid(feature);
          const value = dataType === "aod" ? feature.properties.aod_value : feature.properties.pm25_value;
          if (value == null || isNaN(value)) {
            console.log("generateStaticGrid: Melewati fitur karena nilai tidak valid:", feature);
            return null;
          }
          return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], value];
        })
        .filter((p): p is [number, number, number] => p != null);
      console.log("generateStaticGrid: Jumlah titik valid untuk interpolasi:", points.length);

      const bbox = turf.bbox(turf.featureCollection(validBoundaryFeatures));
      console.log("generateStaticGrid: Bounding box:", bbox);

      const cellSize = 0.02;
      let grid;
      try {
        grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });
        console.log("generateStaticGrid: Titik grid dibuat:", grid.features.length);
      } catch (error) {
        console.error("generateStaticGrid: Error membuat grid titik:", error);
        return { imageUrl: null, bbox: [0, 0, 0, 0] };
      }

      let interpolated = turf.featureCollection([]);
      if (points.length > 0) {
        try {
          interpolated = turf.interpolate(
            turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { value: p[2] }))),
            cellSize / 4,
            { gridType: "point", property: "value", units: "degrees", weight: 2.5 }
          );
          console.log("generateStaticGrid: Titik interpolasi dibuat:", interpolated.features.length);
        } catch (error) {
          console.error("generateStaticGrid: Error menginterpolasi data:", error);
          return { imageUrl: null, bbox: [0, 0, 0, 0] };
        }
      } else {
        console.warn("generateStaticGrid: Tidak ada titik valid untuk interpolasi");
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
        const inBuffer = cachedBoundaries.features.some((buffer) =>
          turf.booleanPointInPolygon(point, buffer as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>)
        );

        let value: number | null = null;
        if (inBuffer && interpolated.features.length > 0) {
          const closest = interpolated.features.reduce(
            (acc, f) => {
              if (f.geometry.type !== "Point" || !f.properties || f.properties.value == null) return acc;
              const dist = turf.distance(f.geometry as GeoJSON.Point, coords as [number, number], { units: "degrees" });
              return dist < acc.dist ? { dist, value: f.properties.value } : acc;
            },
            { dist: Infinity, value: null as number | null }
          );
          value = closest.value !== null && closest.value > 0 ? closest.value : null;
        } else {
          const dataFeature = geoData.features.find((feature: Feature) => {
            if (!feature.geometry) {
              console.log("Fitur tidak memiliki geometri");
              return false;
            }
            try {
              if (isPolygonOrMultiPolygon(feature.geometry)) {
                return turf.booleanPointInPolygon(point, feature.geometry);
              }
              console.log(`Fitur memiliki tipe geometri tidak didukung: ${feature.geometry.type}`);
              return false;
            } catch (error) {
              console.error("Error memeriksa titik dalam poligon:", error);
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

      console.log("generateStaticGrid: Jumlah titik valid yang digambar di kanvas:", validPoints);
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
      console.log("Melewati useEffect: Tidak ada map, geoData, boundaryData, atau sedang memuat");
      if (staticLayerRef.current) {
        map.removeLayer(staticLayerRef.current);
        staticLayerRef.current = null;
      }
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
      setImageUrl(null);
      setBounds(null);
      return;
    }

    const { imageUrl: newImageUrl, bbox } = cachedGrid;
    console.log("useEffect: Image URL dan bbox:", { newImageUrl, bbox });

    if (staticLayerRef.current) {
      map.removeLayer(staticLayerRef.current);
      staticLayerRef.current = null;
    }
    if (tooltipRef.current) {
      tooltipRef.current.remove();
      tooltipRef.current = null;
    }

    if (newImageUrl && Array.isArray(bbox) && bbox.length === 4 && bbox.every((val) => typeof val === "number" && !isNaN(val))) {
      const newBounds: L.LatLngBoundsExpression = [
        [bbox[1], bbox[0]], // [latMin, lngMin]
        [bbox[3], bbox[2]], // [latMax, lngMax]
      ];
      staticLayerRef.current = L.imageOverlay(newImageUrl, newBounds, { opacity: 0.85, interactive: true }).addTo(map);
      console.log("useEffect: ImageOverlay ditambahkan ke peta");
      setImageUrl(newImageUrl);
      setBounds(L.latLngBounds(newBounds));
    } else {
      console.warn("useEffect: imageUrl atau bbox tidak valid", { newImageUrl, bbox });
      setImageUrl(null);
      setBounds(null);
    }

    const handleMouseMove = (e: L.LeafletMouseEvent) => {
      if (inputRef.current && document.activeElement === inputRef.current) {
        console.log("Melewati mousemove: Input pencarian sedang difokuskan");
        return;
      }
 ensue
      const { lat, lng } = e.latlng;
      console.log("Kursor berpindah ke:", { lat, lng });

      if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
        console.log("Melewati mousemove: Posisi tidak berubah");
        return;
      }
      lastPosition.current = { lat, lng };

      try {
        const point = turf.point([lng, lat]);
        console.log("Membuat titik Turf:", point);

        const buffer = 0.001;
        const candidates = spatialIndexRef.current?.search({
          minX: lng - buffer,
          minY: lat - buffer,
          maxX: lng + buffer,
          maxY: lat + buffer,
        }) || [];
        console.log("Kandidat indeks spasial:", candidates);

        const kelurahan = boundaryData?.features.find((bf: BoundaryFeature, index: number) => {
          if (!candidates.some((c: RBushItem) => c.featureIndex === index)) {
            console.log(`Fitur ${index} tidak ada di kandidat`);
            return false;
          }
          if (!isPolygonOrMultiPolygon(bf.geometry)) {
            console.log(`Fitur ${index} memiliki tipe geometri tidak valid: ${bf.geometry.type}`);
            return false;
          }
          try {
            const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
            const isInside = turf.booleanPointInPolygon(point, polygon);
            console.log(`Fitur ${index} (${bf.properties?.NAMOBJ || "Tidak ada nama"}): isInside = ${isInside}`);
            return isInside;
          } catch (error) {
            console.error(`Error memeriksa titik dalam poligon untuk fitur ${index}:`, error);
            return false;
          }
        });

        const dataFeature = geoData?.features.find((feature: Feature) => {
          if (!feature.geometry) {
            console.log("Fitur tidak memiliki geometri");
            return false;
          }
          try {
            if (isPolygonOrMultiPolygon(feature.geometry)) {
              return turf.booleanPointInPolygon(point, feature.geometry);
            }
            console.log(`Fitur memiliki tipe geometri tidak didukung: ${feature.geometry.type}`);
            return false;
          } catch (error) {
            console.error("Error memeriksa titik dalam poligon:", error);
            return false;
          }
        });

        console.log("Kelurahan ditemukan:", kelurahan);
        console.log("DataFeature ditemukan:", dataFeature);

        let value: number | null = null;
        if (dataFeature) {
          const rawValue = dataType === "aod" ? dataFeature.properties.aod_value : dataFeature.properties.pm25_value;
          value = rawValue !== undefined && rawValue !== null ? rawValue : null;
          console.log("Nilai diekstrak:", { rawValue, value });
        }

        // Selalu tampilkan tooltip
        const kelurahanName = kelurahan?.properties?.NAMOBJ || "Lokasi Tidak Dikenal";
        const content = getTooltipContent(value, kelurahanName);
        console.log("Mengatur tooltip:", { content, lat, lng });

        if (tooltipRef.current) {
          tooltipRef.current.remove();
        }
        tooltipRef.current = L.tooltip({
          sticky: true,
          direction: "top",
          offset: [0, -20],
          className: styles.customTooltip,
        })
          .setLatLng(e.latlng)
          .setContent(content)
          .addTo(map);
        console.log("Tooltip ditambahkan ke peta");
      } catch (error) {
        console.error("Error dalam handleMouseMove:", error);
        if (tooltipRef.current) {
          tooltipRef.current.remove();
          tooltipRef.current = null;
        }
      }
    };

    map.on("mousemove", handleMouseMove);
    console.log("Menambahkan event listener mousemove");

    return () => {
      map.off("mousemove", handleMouseMove);
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
      if (staticLayerRef.current) {
        map.removeLayer(staticLayerRef.current);
        staticLayerRef.current = null;
      }
      setImageUrl(null);
      setBounds(null);
      console.log("Membersihkan event listener mousemove");
    };
  }, [map, cachedGrid, selectedDate, inputRef, geoData, boundaryData, dataType, getTooltipContent, isLoading]);

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
        <input
          type="date"
          id="datePicker"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={styles.dateInput}
          ref={inputRef}
        />
      </div>
      {imageUrl && bounds && (
        <ImageOverlay
          url={imageUrl}
          bounds={bounds}
          opacity={0.85}
          interactive={true}
          zIndex={1000}
          eventHandlers={{
            mouseover: () => console.log("Kursor di atas ImageOverlay"),
            mousemove: () => console.log("Kursor bergerak di ImageOverlay"),
          }}
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