// // // // // // // // // // // // // // // // // "use client";
// // // // // // // // // // // // // // // // // import { useEffect, useRef, useMemo } from "react";
// // // // // // // // // // // // // // // // // import { useMap } from "react-leaflet";
// // // // // // // // // // // // // // // // // import L from "leaflet";
// // // // // // // // // // // // // // // // // import * as turf from "@turf/turf";
// // // // // // // // // // // // // // // // // import RBush from "rbush";
// // // // // // // // // // // // // // // // // import styles from "./map.module.css";
// // // // // // // // // // // // // // // // // import { interpolateColor } from "../../utils/color";

// // // // // // // // // // // // // // // // // interface FeatureProperties {
// // // // // // // // // // // // // // // // //   aod_value: number;
// // // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // // interface BoundaryProperties {
// // // // // // // // // // // // // // // // //   NAMOBJ: string;
// // // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // // interface Feature {
// // // // // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // // // // //   id: number;
// // // // // // // // // // // // // // // // //   properties: FeatureProperties;
// // // // // // // // // // // // // // // // //   geometry: turf.Polygon | turf.MultiPolygon;
// // // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // // interface BoundaryFeature {
// // // // // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // // // // //   properties: BoundaryProperties;
// // // // // // // // // // // // // // // // //   geometry: turf.Polygon | turf.MultiPolygon;
// // // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // // interface GeoJSONData {
// // // // // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // // // // //   features: Feature[];
// // // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // // interface BoundaryGeoJSONData {
// // // // // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // // // // //   features: BoundaryFeature[];
// // // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // // interface HeatMapLayerProps {
// // // // // // // // // // // // // // // // //   geoData: GeoJSONData | null;
// // // // // // // // // // // // // // // // //   boundaryData: BoundaryGeoJSONData | null;
// // // // // // // // // // // // // // // // //   selectedDate: string;
// // // // // // // // // // // // // // // // //   isLoading: boolean;
// // // // // // // // // // // // // // // // //   inputRef: React.RefObject<HTMLInputElement>;
// // // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // // const HeatMapLayer = ({ geoData, boundaryData, selectedDate, isLoading, inputRef }: HeatMapLayerProps) => {
// // // // // // // // // // // // // // // // //   const map = useMap();
// // // // // // // // // // // // // // // // //   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
// // // // // // // // // // // // // // // // //   const tooltipRef = useRef<L.Tooltip | null>(null);
// // // // // // // // // // // // // // // // //   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
// // // // // // // // // // // // // // // // //   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
// // // // // // // // // // // // // // // // //   const interpolatedDataRef = useRef<any[]>([]);
// // // // // // // // // // // // // // // // //   const spatialIndexRef = useRef<RBush | null>(null);

// // // // // // // // // // // // // // // // //   const getTooltipContent = (aodValue: number | null, kelurahanName: string): string => {
// // // // // // // // // // // // // // // // //     const formattedAodValue = aodValue !== null ? aodValue.toFixed(4) : "-";
// // // // // // // // // // // // // // // // //     const aodColor = aodValue !== null ? interpolateColor(aodValue) : "#a0aec0";
// // // // // // // // // // // // // // // // //     // Warna teks hanya untuk nilai AOD, nama kelurahan tetap default (#374151 dari CSS)
// // // // // // // // // // // // // // // // //     const textColor = (aodColor === "rgba(0, 255, 0, 0.85)" || aodColor === "rgba(255, 255, 0, 0.85)") ? "#000000" : "#ffffff";
// // // // // // // // // // // // // // // // //     return `
// // // // // // // // // // // // // // // // //       <div class="${styles.customTooltip}">
// // // // // // // // // // // // // // // // //         <div class="${styles.kelurahanName}">${kelurahanName}</div>
// // // // // // // // // // // // // // // // //         <div class="${styles.aodContainer}">
// // // // // // // // // // // // // // // // //           <div class="${styles.aodCircle}" style="background-color: ${aodColor}; color: ${textColor}">
// // // // // // // // // // // // // // // // //             ${formattedAodValue}
// // // // // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // // // //     `;
// // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // //   const cachedBoundaries = useMemo(() => {
// // // // // // // // // // // // // // // // //     if (!geoData) return turf.featureCollection([]);
// // // // // // // // // // // // // // // // //     return turf.featureCollection(geoData.features.filter((f) => f.properties.aod_value != null && f.properties.aod_value >= 0).map((feature) => turf.buffer(feature.geometry, 0.002, { units: "degrees" })));
// // // // // // // // // // // // // // // // //   }, [geoData]);

// // // // // // // // // // // // // // // // //   const initializeSpatialIndex = useMemo(() => {
// // // // // // // // // // // // // // // // //     if (!boundaryData) return () => {};
// // // // // // // // // // // // // // // // //     const spatialIndex = new RBush();
// // // // // // // // // // // // // // // // //     boundaryData.features.forEach((feature, index) => {
// // // // // // // // // // // // // // // // //       const bbox = turf.bbox(feature.geometry);
// // // // // // // // // // // // // // // // //       spatialIndex.insert({
// // // // // // // // // // // // // // // // //         minX: bbox[0],
// // // // // // // // // // // // // // // // //         minY: bbox[1],
// // // // // // // // // // // // // // // // //         maxX: bbox[2],
// // // // // // // // // // // // // // // // //         maxY: bbox[3],
// // // // // // // // // // // // // // // // //         featureIndex: index,
// // // // // // // // // // // // // // // // //       });
// // // // // // // // // // // // // // // // //     });
// // // // // // // // // // // // // // // // //     spatialIndexRef.current = spatialIndex;
// // // // // // // // // // // // // // // // //     return () => {
// // // // // // // // // // // // // // // // //       spatialIndexRef.current = null;
// // // // // // // // // // // // // // // // //     };
// // // // // // // // // // // // // // // // //   }, [boundaryData]);

// // // // // // // // // // // // // // // // //   const generateStaticGrid = (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
// // // // // // // // // // // // // // // // //     const points = geoData.features
// // // // // // // // // // // // // // // // //       .map((feature) => {
// // // // // // // // // // // // // // // // //         const centroid = turf.centroid(feature.geometry);
// // // // // // // // // // // // // // // // //         const aod = feature.properties.aod_value;
// // // // // // // // // // // // // // // // //         if (aod == null || aod < 0 || isNaN(aod)) return null;
// // // // // // // // // // // // // // // // //         return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], aod];
// // // // // // // // // // // // // // // // //       })
// // // // // // // // // // // // // // // // //       .filter((p): p is [number, number, number] => p !== null);

// // // // // // // // // // // // // // // // //     const bbox = turf.bbox(turf.featureCollection(boundaryData.features));
// // // // // // // // // // // // // // // // //     const cellSize = 0.02;
// // // // // // // // // // // // // // // // //     const grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });

// // // // // // // // // // // // // // // // //     let interpolated = turf.featureCollection([]);
// // // // // // // // // // // // // // // // //     if (points.length > 0) {
// // // // // // // // // // // // // // // // //       try {
// // // // // // // // // // // // // // // // //         interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { aod: p[2] }))), cellSize / 4, { gridType: "point", property: "aod", units: "degrees", weight: 2.5 });
// // // // // // // // // // // // // // // // //       } catch (error) {
// // // // // // // // // // // // // // // // //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // // // // // // // //       }
// // // // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // // //     interpolatedDataRef.current = interpolated.features;

// // // // // // // // // // // // // // // // //     const boundaryPolygon = turf.featureCollection(boundaryData.features);
// // // // // // // // // // // // // // // // //     const clipped = turf.pointsWithinPolygon(turf.featureCollection(grid.features), boundaryPolygon);

// // // // // // // // // // // // // // // // //     const canvas = document.createElement("canvas");
// // // // // // // // // // // // // // // // //     const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
// // // // // // // // // // // // // // // // //     const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
// // // // // // // // // // // // // // // // //     canvas.width = width;
// // // // // // // // // // // // // // // // //     canvas.height = height;
// // // // // // // // // // // // // // // // //     const ctx = canvas.getContext("2d");

// // // // // // // // // // // // // // // // //     if (!ctx) return { imageUrl: null, bbox: [0, 0, 0, 0] };

// // // // // // // // // // // // // // // // //     ctx.fillStyle = "rgba(0, 0, 0, 0)";
// // // // // // // // // // // // // // // // //     ctx.fillRect(0, 0, width, height);

// // // // // // // // // // // // // // // // //     clipped.features.forEach((feature) => {
// // // // // // // // // // // // // // // // //       const coords = feature.geometry.coordinates;
// // // // // // // // // // // // // // // // //       const point = turf.point(coords);

// // // // // // // // // // // // // // // // //       const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer));

// // // // // // // // // // // // // // // // //       let aodValue: number | null = null;
// // // // // // // // // // // // // // // // //       if (inBuffer && interpolated.features.length > 0) {
// // // // // // // // // // // // // // // // //         const closest = interpolated.features.reduce(
// // // // // // // // // // // // // // // // //           (acc, f) => {
// // // // // // // // // // // // // // // // //             const dist = turf.distance(f.geometry.coordinates, coords, { units: "degrees" });
// // // // // // // // // // // // // // // // //             return dist < acc.dist ? { dist, value: f.properties.aod } : acc;
// // // // // // // // // // // // // // // // //           },
// // // // // // // // // // // // // // // // //           { dist: Infinity, value: 0 }
// // // // // // // // // // // // // // // // //         );
// // // // // // // // // // // // // // // // //         aodValue = closest.value;
// // // // // // // // // // // // // // // // //       } else {
// // // // // // // // // // // // // // // // //         const aodFeature = geoData.features.find((f) => {
// // // // // // // // // // // // // // // // //           const polygon = f.geometry.type === "Polygon" ? turf.polygon(f.geometry.coordinates) : turf.multiPolygon(f.geometry.coordinates);
// // // // // // // // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // // // // // // // //         });
// // // // // // // // // // // // // // // // //         aodValue = aodFeature && aodFeature.properties.aod_value != null && aodFeature.properties.aod_value >= 0 ? aodFeature.properties.aod_value : null;
// // // // // // // // // // // // // // // // //       }

// // // // // // // // // // // // // // // // //       if (aodValue == null) return;

// // // // // // // // // // // // // // // // //       const color = interpolateColor(aodValue);
// // // // // // // // // // // // // // // // //       const x = Math.round((coords[0] - bbox[0]) / cellSize);
// // // // // // // // // // // // // // // // //       const y = Math.round((bbox[3] - coords[1]) / cellSize);
// // // // // // // // // // // // // // // // //       ctx.fillStyle = color;
// // // // // // // // // // // // // // // // //       ctx.fillRect(x, y, 1, 1);
// // // // // // // // // // // // // // // // //     });

// // // // // // // // // // // // // // // // //     return { imageUrl: canvas.toDataURL(), bbox };
// // // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // // //   const cachedGrid = useMemo(() => {
// // // // // // // // // // // // // // // // //     if (!geoData || !boundaryData) return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // // // // // // // //     return generateStaticGrid(geoData, boundaryData);
// // // // // // // // // // // // // // // // //   }, [geoData, boundaryData]);

// // // // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // // // //     if (!map || !geoData || !boundaryData) {
// // // // // // // // // // // // // // // // //       return;
// // // // // // // // // // // // // // // // //     }

// // // // // // // // // // // // // // // // //     const { imageUrl, bbox } = cachedGrid;

// // // // // // // // // // // // // // // // //     if (staticLayerRef.current) {
// // // // // // // // // // // // // // // // //       map.removeLayer(staticLayerRef.current);
// // // // // // // // // // // // // // // // //       staticLayerRef.current = null;
// // // // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // // //     if (tooltipRef.current) {
// // // // // // // // // // // // // // // // //       tooltipRef.current.remove();
// // // // // // // // // // // // // // // // //       tooltipRef.current = null;
// // // // // // // // // // // // // // // // //     }

// // // // // // // // // // // // // // // // //     if (imageUrl) {
// // // // // // // // // // // // // // // // //       const bounds = [
// // // // // // // // // // // // // // // // //         [bbox[1], bbox[0]],
// // // // // // // // // // // // // // // // //         [bbox[3], bbox[2]],
// // // // // // // // // // // // // // // // //       ];
// // // // // // // // // // // // // // // // //       staticLayerRef.current = L.imageOverlay(imageUrl, bounds, { opacity: 0.85, interactive: true }).addTo(map);
// // // // // // // // // // // // // // // // //     }

// // // // // // // // // // // // // // // // //     const handleMouseMove = (e: L.LeafletMouseEvent) => {
// // // // // // // // // // // // // // // // //       if (document.activeElement === inputRef.current) {
// // // // // // // // // // // // // // // // //         return;
// // // // // // // // // // // // // // // // //       }
// // // // // // // // // // // // // // // // //       const { lat, lng } = e.latlng;
// // // // // // // // // // // // // // // // //       if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
// // // // // // // // // // // // // // // // //         return;
// // // // // // // // // // // // // // // // //       }
// // // // // // // // // // // // // // // // //       lastPosition.current = { lat, lng };

// // // // // // // // // // // // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);

// // // // // // // // // // // // // // // // //       timeoutRef.current = setTimeout(() => {
// // // // // // // // // // // // // // // // //         if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // // // // // // // // // // // //         const point = turf.point([lng, lat]);

// // // // // // // // // // // // // // // // //         const candidates =
// // // // // // // // // // // // // // // // //           spatialIndexRef.current?.search({
// // // // // // // // // // // // // // // // //             minX: lng,
// // // // // // // // // // // // // // // // //             minY: lat,
// // // // // // // // // // // // // // // // //             maxX: lng,
// // // // // // // // // // // // // // // // //             maxY: lat,
// // // // // // // // // // // // // // // // //           }) || [];

// // // // // // // // // // // // // // // // //         const kelurahan = boundaryData.features.find((bf, index) => {
// // // // // // // // // // // // // // // // //           if (!candidates.some((c: any) => c.featureIndex === index)) return false;
// // // // // // // // // // // // // // // // //           const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
// // // // // // // // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // // // // // // // //         });

// // // // // // // // // // // // // // // // //         const aodFeature = geoData.features.find((feature) => {
// // // // // // // // // // // // // // // // //           const polygon = feature.geometry.type === "Polygon" ? turf.polygon(feature.geometry.coordinates) : turf.multiPolygon(feature.geometry.coordinates);
// // // // // // // // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // // // // // // // //         });
// // // // // // // // // // // // // // // // //         const aodValue = aodFeature ? aodFeature.properties.aod_value : null;

// // // // // // // // // // // // // // // // //         if (kelurahan?.properties) {
// // // // // // // // // // // // // // // // //           tooltipRef.current = L.tooltip({
// // // // // // // // // // // // // // // // //             sticky: true,
// // // // // // // // // // // // // // // // //             direction: "top",
// // // // // // // // // // // // // // // // //             offset: [0, -20],
// // // // // // // // // // // // // // // // //             className: styles.customTooltip,
// // // // // // // // // // // // // // // // //           })
// // // // // // // // // // // // // // // // //             .setLatLng(e.latlng)
// // // // // // // // // // // // // // // // //             .setContent(getTooltipContent(aodValue, kelurahan.properties.NAMOBJ))
// // // // // // // // // // // // // // // // //             .addTo(map);
// // // // // // // // // // // // // // // // //         }
// // // // // // // // // // // // // // // // //       }, 500);
// // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // //     map.on("mousemove", handleMouseMove);

// // // // // // // // // // // // // // // // //     return () => {
// // // // // // // // // // // // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);
// // // // // // // // // // // // // // // // //       map.off("mousemove", handleMouseMove);
// // // // // // // // // // // // // // // // //       if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // // // // // // // // // // // //       if (staticLayerRef.current) map.removeLayer(staticLayerRef.current);
// // // // // // // // // // // // // // // // //     };
// // // // // // // // // // // // // // // // //   }, [map, cachedGrid, selectedDate, inputRef]);

// // // // // // // // // // // // // // // // //   return (
// // // // // // // // // // // // // // // // //     <>
// // // // // // // // // // // // // // // // //       {isLoading && (
// // // // // // // // // // // // // // // // //         <div className={styles.loadingOverlay}>
// // // // // // // // // // // // // // // // //           <div className={styles.spinner}></div>
// // // // // // // // // // // // // // // // //           <span>Memuat Heatmap...</span>
// // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // //       )}
// // // // // // // // // // // // // // // // //       <div className={styles.legend}>
// // // // // // // // // // // // // // // // //         <h4>Legenda AOD</h4>
// // // // // // // // // // // // // // // // //         <div className={styles.gradientLegend}>
// // // // // // // // // // // // // // // // //           <div
// // // // // // // // // // // // // // // // //             className={styles.gradientBar}
// // // // // // // // // // // // // // // // //             style={{
// // // // // // // // // // // // // // // // //               background: "linear-gradient(to right, rgba(0, 255, 0, 0.85), rgba(0, 0, 255, 0.85), rgba(255, 255, 0, 0.85), rgba(255, 0, 0, 0.85))",
// // // // // // // // // // // // // // // // //             }}
// // // // // // // // // // // // // // // // //           ></div>
// // // // // // // // // // // // // // // // //           <div className={styles.gradientLabels}>
// // // // // // // // // // // // // // // // //             <span>0.0</span>
// // // // // // // // // // // // // // // // //             <span>1.0+</span>
// // // // // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // // // //     </>
// // // // // // // // // // // // // // // // //   );
// // // // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // // // export default HeatMapLayer;

// // // // // // // // // // // // // // // // "use client";
// // // // // // // // // // // // // // // // import { useEffect, useRef, useMemo } from "react";
// // // // // // // // // // // // // // // // import { useMap } from "react-leaflet";
// // // // // // // // // // // // // // // // import L from "leaflet";
// // // // // // // // // // // // // // // // import * as turf from "@turf/turf";
// // // // // // // // // // // // // // // // import RBush from "rbush";
// // // // // // // // // // // // // // // // import styles from "./map.module.css";
// // // // // // // // // // // // // // // // import { interpolateColor } from "../../utils/color";

// // // // // // // // // // // // // // // // interface FeatureProperties {
// // // // // // // // // // // // // // // //   aod_value: number;
// // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // interface BoundaryProperties {
// // // // // // // // // // // // // // // //   NAMOBJ: string;
// // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // interface Feature {
// // // // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // // // //   id: number;
// // // // // // // // // // // // // // // //   properties: FeatureProperties;
// // // // // // // // // // // // // // // //   geometry: turf.Polygon | turf.MultiPolygon;
// // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // interface BoundaryFeature {
// // // // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // // // //   properties: BoundaryProperties;
// // // // // // // // // // // // // // // //   geometry: turf.Polygon | turf.MultiPolygon;
// // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // interface GeoJSONData {
// // // // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // // // //   features: Feature[];
// // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // interface BoundaryGeoJSONData {
// // // // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // // // //   features: BoundaryFeature[];
// // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // interface HeatMapLayerProps {
// // // // // // // // // // // // // // // //   geoData: GeoJSONData | null;
// // // // // // // // // // // // // // // //   boundaryData: BoundaryGeoJSONData | null;
// // // // // // // // // // // // // // // //   selectedDate: string;
// // // // // // // // // // // // // // // //   isLoading: boolean;
// // // // // // // // // // // // // // // //   inputRef: React.RefObject<HTMLInputElement>;
// // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // interface RBushItem {
// // // // // // // // // // // // // // // //   minX: number;
// // // // // // // // // // // // // // // //   minY: number;
// // // // // // // // // // // // // // // //   maxX: number;
// // // // // // // // // // // // // // // //   maxY: number;
// // // // // // // // // // // // // // // //   featureIndex: number;
// // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // const HeatMapLayer = ({ geoData, boundaryData, selectedDate, isLoading, inputRef }: HeatMapLayerProps) => {
// // // // // // // // // // // // // // // //   const map = useMap();
// // // // // // // // // // // // // // // //   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
// // // // // // // // // // // // // // // //   const tooltipRef = useRef<L.Tooltip | null>(null);
// // // // // // // // // // // // // // // //   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
// // // // // // // // // // // // // // // //   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
// // // // // // // // // // // // // // // //   const interpolatedDataRef = useRef<turf.Feature<turf.Point, { aod: number }>[]>([]);
// // // // // // // // // // // // // // // //   const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);

// // // // // // // // // // // // // // // //   const getTooltipContent = (aodValue: number | null, kelurahanName: string): string => {
// // // // // // // // // // // // // // // //     const formattedAodValue = aodValue !== null && aodValue > 0 ? aodValue.toFixed(4) : "No Data";
// // // // // // // // // // // // // // // //     const aodColor = aodValue !== null && aodValue > 0 ? interpolateColor(aodValue) : "#a0aec0";
// // // // // // // // // // // // // // // //     const textColor = aodColor === "rgba(0, 255, 0, 0.85)" || aodColor === "rgba(255, 255, 0, 0.85)" ? "#000000" : "#ffffff";
// // // // // // // // // // // // // // // //     return `
// // // // // // // // // // // // // // // //       <div class="${styles.customTooltip}">
// // // // // // // // // // // // // // // //         <div class="${styles.kelurahanName}">${kelurahanName}</div>
// // // // // // // // // // // // // // // //         <div class="${styles.aodContainer}">
// // // // // // // // // // // // // // // //           <div class="${styles.aodCircle}" style="background-color: ${aodColor}; color: ${textColor}">
// // // // // // // // // // // // // // // //             ${formattedAodValue}
// // // // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // // //     `;
// // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // //   const cachedBoundaries = useMemo(() => {
// // // // // // // // // // // // // // // //     if (!geoData) return turf.featureCollection([]);
// // // // // // // // // // // // // // // //     return turf.featureCollection(geoData.features.filter((f) => f.properties.aod_value != null && f.properties.aod_value > 0).map((feature) => turf.buffer(feature.geometry, 0.002, { units: "degrees" })));
// // // // // // // // // // // // // // // //   }, [geoData]);

// // // // // // // // // // // // // // // //   useMemo(() => {
// // // // // // // // // // // // // // // //     if (!boundaryData) return;
// // // // // // // // // // // // // // // //     const spatialIndex = new RBush<RBushItem>();
// // // // // // // // // // // // // // // //     boundaryData.features.forEach((feature, index) => {
// // // // // // // // // // // // // // // //       const bbox = turf.bbox(feature.geometry);
// // // // // // // // // // // // // // // //       spatialIndex.insert({
// // // // // // // // // // // // // // // //         minX: bbox[0],
// // // // // // // // // // // // // // // //         minY: bbox[1],
// // // // // // // // // // // // // // // //         maxX: bbox[2],
// // // // // // // // // // // // // // // //         maxY: bbox[3],
// // // // // // // // // // // // // // // //         featureIndex: index,
// // // // // // // // // // // // // // // //       });
// // // // // // // // // // // // // // // //     });
// // // // // // // // // // // // // // // //     spatialIndexRef.current = spatialIndex;
// // // // // // // // // // // // // // // //   }, [boundaryData]);

// // // // // // // // // // // // // // // //   const generateStaticGrid = (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
// // // // // // // // // // // // // // // //     const points = geoData.features
// // // // // // // // // // // // // // // //       .map((feature) => {
// // // // // // // // // // // // // // // //         const centroid = turf.centroid(feature.geometry);
// // // // // // // // // // // // // // // //         const aod = feature.properties.aod_value;
// // // // // // // // // // // // // // // //         if (aod == null || aod <= 0 || isNaN(aod)) return null;
// // // // // // // // // // // // // // // //         return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], aod];
// // // // // // // // // // // // // // // //       })
// // // // // // // // // // // // // // // //       .filter((p): p is [number, number, number] => p !== null);

// // // // // // // // // // // // // // // //     const bbox = turf.bbox(turf.featureCollection(boundaryData.features));
// // // // // // // // // // // // // // // //     const cellSize = 0.02;
// // // // // // // // // // // // // // // //     const grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });

// // // // // // // // // // // // // // // //     let interpolated = turf.featureCollection([]);
// // // // // // // // // // // // // // // //     if (points.length > 0) {
// // // // // // // // // // // // // // // //       try {
// // // // // // // // // // // // // // // //         interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { aod: p[2] }))), cellSize / 4, { gridType: "point", property: "aod", units: "degrees", weight: 2.5 });
// // // // // // // // // // // // // // // //       } catch {
// // // // // // // // // // // // // // // //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // // // // // // //       }
// // // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // //     interpolatedDataRef.current = interpolated.features;

// // // // // // // // // // // // // // // //     const boundaryPolygon = turf.featureCollection(boundaryData.features);
// // // // // // // // // // // // // // // //     const clipped = turf.pointsWithinPolygon(turf.featureCollection(grid.features), boundaryPolygon);

// // // // // // // // // // // // // // // //     const canvas = document.createElement("canvas");
// // // // // // // // // // // // // // // //     const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
// // // // // // // // // // // // // // // //     const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
// // // // // // // // // // // // // // // //     canvas.width = width;
// // // // // // // // // // // // // // // //     canvas.height = height;
// // // // // // // // // // // // // // // //     const ctx = canvas.getContext("2d");

// // // // // // // // // // // // // // // //     if (!ctx) return { imageUrl: null, bbox: [0, 0, 0, 0] };

// // // // // // // // // // // // // // // //     ctx.fillStyle = "rgba(0, 0, 0, 0)";
// // // // // // // // // // // // // // // //     ctx.fillRect(0, 0, width, height);

// // // // // // // // // // // // // // // //     clipped.features.forEach((feature) => {
// // // // // // // // // // // // // // // //       const coords = feature.geometry.coordinates;
// // // // // // // // // // // // // // // //       const point = turf.point(coords);

// // // // // // // // // // // // // // // //       const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer));

// // // // // // // // // // // // // // // //       let aodValue: number | null = null;
// // // // // // // // // // // // // // // //       if (inBuffer && interpolated.features.length > 0) {
// // // // // // // // // // // // // // // //         const closest = interpolated.features.reduce(
// // // // // // // // // // // // // // // //           (acc, f) => {
// // // // // // // // // // // // // // // //             const dist = turf.distance(f.geometry.coordinates, coords, { units: "degrees" });
// // // // // // // // // // // // // // // //             return dist < acc.dist ? { dist, value: f.properties.aod } : acc;
// // // // // // // // // // // // // // // //           },
// // // // // // // // // // // // // // // //           { dist: Infinity, value: 0 }
// // // // // // // // // // // // // // // //         );
// // // // // // // // // // // // // // // //         aodValue = closest.value > 0 ? closest.value : null;
// // // // // // // // // // // // // // // //       } else {
// // // // // // // // // // // // // // // //         const aodFeature = geoData.features.find((f) => {
// // // // // // // // // // // // // // // //           const polygon = f.geometry.type === "Polygon" ? turf.polygon(f.geometry.coordinates) : turf.multiPolygon(f.geometry.coordinates);
// // // // // // // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // // // // // // //         });
// // // // // // // // // // // // // // // //         aodValue = aodFeature && aodFeature.properties.aod_value != null && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;
// // // // // // // // // // // // // // // //       }

// // // // // // // // // // // // // // // //       if (aodValue == null) return;

// // // // // // // // // // // // // // // //       const color = interpolateColor(aodValue);
// // // // // // // // // // // // // // // //       const x = Math.round((coords[0] - bbox[0]) / cellSize);
// // // // // // // // // // // // // // // //       const y = Math.round((bbox[3] - coords[1]) / cellSize);
// // // // // // // // // // // // // // // //       ctx.fillStyle = color;
// // // // // // // // // // // // // // // //       ctx.fillRect(x, y, 1, 1);
// // // // // // // // // // // // // // // //     });

// // // // // // // // // // // // // // // //     return { imageUrl: canvas.toDataURL(), bbox };
// // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // //   const cachedGrid = useMemo(() => {
// // // // // // // // // // // // // // // //     if (!geoData || !boundaryData) return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // // // // // // //     return generateStaticGrid(geoData, boundaryData);
// // // // // // // // // // // // // // // //   }, [geoData, boundaryData]);

// // // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // // //     if (!map || !geoData || !boundaryData) {
// // // // // // // // // // // // // // // //       return;
// // // // // // // // // // // // // // // //     }

// // // // // // // // // // // // // // // //     const { imageUrl, bbox } = cachedGrid;

// // // // // // // // // // // // // // // //     if (staticLayerRef.current) {
// // // // // // // // // // // // // // // //       map.removeLayer(staticLayerRef.current);
// // // // // // // // // // // // // // // //       staticLayerRef.current = null;
// // // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // //     if (tooltipRef.current) {
// // // // // // // // // // // // // // // //       tooltipRef.current.remove();
// // // // // // // // // // // // // // // //       tooltipRef.current = null;
// // // // // // // // // // // // // // // //     }

// // // // // // // // // // // // // // // //     if (imageUrl) {
// // // // // // // // // // // // // // // //       const bounds = [
// // // // // // // // // // // // // // // //         [bbox[1], bbox[0]],
// // // // // // // // // // // // // // // //         [bbox[3], bbox[2]],
// // // // // // // // // // // // // // // //       ];
// // // // // // // // // // // // // // // //       staticLayerRef.current = L.imageOverlay(imageUrl, bounds, { opacity: 0.85, interactive: true }).addTo(map);
// // // // // // // // // // // // // // // //     }

// // // // // // // // // // // // // // // //     const handleMouseMove = (e: L.LeafletMouseEvent) => {
// // // // // // // // // // // // // // // //       if (document.activeElement === inputRef.current) {
// // // // // // // // // // // // // // // //         return;
// // // // // // // // // // // // // // // //       }
// // // // // // // // // // // // // // // //       const { lat, lng } = e.latlng;
// // // // // // // // // // // // // // // //       if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
// // // // // // // // // // // // // // // //         return;
// // // // // // // // // // // // // // // //       }
// // // // // // // // // // // // // // // //       lastPosition.current = { lat, lng };

// // // // // // // // // // // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);

// // // // // // // // // // // // // // // //       timeoutRef.current = setTimeout(() => {
// // // // // // // // // // // // // // // //         if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // // // // // // // // // // //         const point = turf.point([lng, lat]);

// // // // // // // // // // // // // // // //         const candidates =
// // // // // // // // // // // // // // // //           spatialIndexRef.current?.search({
// // // // // // // // // // // // // // // //             minX: lng,
// // // // // // // // // // // // // // // //             minY: lat,
// // // // // // // // // // // // // // // //             maxX: lng,
// // // // // // // // // // // // // // // //             maxY: lat,
// // // // // // // // // // // // // // // //           }) || [];

// // // // // // // // // // // // // // // //         const kelurahan = boundaryData.features.find((bf, index) => {
// // // // // // // // // // // // // // // //           if (!candidates.some((c) => c.featureIndex === index)) return false;
// // // // // // // // // // // // // // // //           const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
// // // // // // // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // // // // // // //         });

// // // // // // // // // // // // // // // //         const aodFeature = geoData.features.find((feature) => {
// // // // // // // // // // // // // // // //           const polygon = feature.geometry.type === "Polygon" ? turf.polygon(feature.geometry.coordinates) : turf.multiPolygon(feature.geometry.coordinates);
// // // // // // // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // // // // // // //         });
// // // // // // // // // // // // // // // //         const aodValue = aodFeature && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;

// // // // // // // // // // // // // // // //         if (kelurahan?.properties) {
// // // // // // // // // // // // // // // //           tooltipRef.current = L.tooltip({
// // // // // // // // // // // // // // // //             sticky: true,
// // // // // // // // // // // // // // // //             direction: "top",
// // // // // // // // // // // // // // // //             offset: [0, -20],
// // // // // // // // // // // // // // // //             className: styles.customTooltip,
// // // // // // // // // // // // // // // //           })
// // // // // // // // // // // // // // // //             .setLatLng(e.latlng)
// // // // // // // // // // // // // // // //             .setContent(getTooltipContent(aodValue, kelurahan.properties.NAMOBJ))
// // // // // // // // // // // // // // // //             .addTo(map);
// // // // // // // // // // // // // // // //         }
// // // // // // // // // // // // // // // //       }, 500);
// // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // //     map.on("mousemove", handleMouseMove);

// // // // // // // // // // // // // // // //     return () => {
// // // // // // // // // // // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);
// // // // // // // // // // // // // // // //       map.off("mousemove", handleMouseMove);
// // // // // // // // // // // // // // // //       if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // // // // // // // // // // //       if (staticLayerRef.current) map.removeLayer(staticLayerRef.current);
// // // // // // // // // // // // // // // //     };
// // // // // // // // // // // // // // // //   }, [map, cachedGrid, selectedDate, inputRef]);

// // // // // // // // // // // // // // // //   return (
// // // // // // // // // // // // // // // //     <>
// // // // // // // // // // // // // // // //       {isLoading && (
// // // // // // // // // // // // // // // //         <div className={styles.loadingOverlay}>
// // // // // // // // // // // // // // // //           <div className={styles.spinner}></div>
// // // // // // // // // // // // // // // //           <span>Memuat Heatmap...</span>
// // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // //       )}
// // // // // // // // // // // // // // // //       <div className={styles.legend}>
// // // // // // // // // // // // // // // //         <h4>Legenda AOD</h4>
// // // // // // // // // // // // // // // //         <div className={styles.gradientLegend}>
// // // // // // // // // // // // // // // //           <div
// // // // // // // // // // // // // // // //             className={styles.gradientBar}
// // // // // // // // // // // // // // // //             style={{
// // // // // // // // // // // // // // // //               background: "linear-gradient(to right, rgba(0, 255, 0, 0.85), rgba(0, 0, 255, 0.85), rgba(255, 255, 0, 0.85), rgba(255, 0, 0, 0.85))",
// // // // // // // // // // // // // // // //             }}
// // // // // // // // // // // // // // // //           ></div>
// // // // // // // // // // // // // // // //           <div className={styles.gradientLabels}>
// // // // // // // // // // // // // // // //             <span>0.0</span>
// // // // // // // // // // // // // // // //             <span>1.0+</span>
// // // // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // // //     </>
// // // // // // // // // // // // // // // //   );
// // // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // // export default HeatMapLayer;

// // // // // // // // // // // // // // // // "use client";

// // // // // // // // // // // // // // // // import { useEffect, useRef, useMemo } from "react";
// // // // // // // // // // // // // // // // import { useMap } from "react-leaflet";
// // // // // // // // // // // // // // // // import L from "leaflet";
// // // // // // // // // // // // // // // // import * as turf from "@turf/turf";
// // // // // // // // // // // // // // // // import * as GeoJSON from "geojson";
// // // // // // // // // // // // // // // // import RBush from "rbush";
// // // // // // // // // // // // // // // // import styles from "./map.module.css";
// // // // // // // // // // // // // // // // import { interpolateColor } from "../../utils/color";

// // // // // // // // // // // // // // // // interface FeatureProperties {
// // // // // // // // // // // // // // // //   aod_value: number;
// // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // interface BoundaryProperties {
// // // // // // // // // // // // // // // //   NAMOBJ: string;
// // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // interface Feature {
// // // // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // // // //   id: number;
// // // // // // // // // // // // // // // //   properties: FeatureProperties;
// // // // // // // // // // // // // // // //   geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
// // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // interface BoundaryFeature {
// // // // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // // // //   properties: BoundaryProperties;
// // // // // // // // // // // // // // // //   geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
// // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // interface GeoJSONData {
// // // // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // // // //   features: Feature[];
// // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // interface BoundaryGeoJSONData {
// // // // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // // // //   features: BoundaryFeature[];
// // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // interface HeatMapLayerProps {
// // // // // // // // // // // // // // // //   geoData: GeoJSONData | null;
// // // // // // // // // // // // // // // //   boundaryData: BoundaryGeoJSONData | null;
// // // // // // // // // // // // // // // //   selectedDate: string;
// // // // // // // // // // // // // // // //   isLoading: boolean;
// // // // // // // // // // // // // // // //   inputRef: React.RefObject<HTMLInputElement>;
// // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // interface RBushItem {
// // // // // // // // // // // // // // // //   minX: number;
// // // // // // // // // // // // // // // //   minY: number;
// // // // // // // // // // // // // // // //   maxX: number;
// // // // // // // // // // // // // // // //   maxY: number;
// // // // // // // // // // // // // // // //   featureIndex: number;
// // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // interface InterpolatedFeature {
// // // // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // // // //   geometry: turf.Point;
// // // // // // // // // // // // // // // //   properties: { aod: number };
// // // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // // const HeatMapLayer: React.FC<HeatMapLayerProps> = ({ geoData, boundaryData, selectedDate, isLoading, inputRef }) => {
// // // // // // // // // // // // // // // //   const map = useMap();
// // // // // // // // // // // // // // // //   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
// // // // // // // // // // // // // // // //   const tooltipRef = useRef<L.Tooltip | null>(null);
// // // // // // // // // // // // // // // //   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
// // // // // // // // // // // // // // // //   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
// // // // // // // // // // // // // // // //   const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);

// // // // // // // // // // // // // // // //   const getTooltipContent = (aodValue: number | null, kelurahanName: string): string => {
// // // // // // // // // // // // // // // //     const formattedAodValue = aodValue !== null && aodValue > 0 ? aodValue.toFixed(4) : "No Data";
// // // // // // // // // // // // // // // //     const aodColor = aodValue !== null && aodValue > 0 ? interpolateColor(aodValue) : "#a0aec0";
// // // // // // // // // // // // // // // //     const textColor = aodColor === "rgba(0, 255, 0, 0.85)" || aodColor === "rgba(255, 255, 0, 0.85)" ? "#000000" : "#ffffff";
// // // // // // // // // // // // // // // //     return `
// // // // // // // // // // // // // // // //       <div class="${styles.customTooltip}">
// // // // // // // // // // // // // // // //         <div class="${styles.kelurahanName}">${kelurahanName}</div>
// // // // // // // // // // // // // // // //         <div class="${styles.aodContainer}">
// // // // // // // // // // // // // // // //           <div class="${styles.aodCircle}" style="background-color: ${aodColor}; color: ${textColor}">
// // // // // // // // // // // // // // // //             ${formattedAodValue}
// // // // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // // //     `;
// // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // //   const cachedBoundaries = useMemo(() => {
// // // // // // // // // // // // // // // //     if (!geoData) return turf.featureCollection([]);
// // // // // // // // // // // // // // // //     return turf.featureCollection(geoData.features.filter((f) => f.properties.aod_value != null && f.properties.aod_value > 0).map((feature) => turf.buffer(feature.geometry, 0.002, { units: "degrees" })));
// // // // // // // // // // // // // // // //   }, [geoData]);

// // // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // // //     if (!boundaryData) return;
// // // // // // // // // // // // // // // //     const spatialIndex = new RBush<RBushItem>();
// // // // // // // // // // // // // // // //     boundaryData.features.forEach((feature, index) => {
// // // // // // // // // // // // // // // //       const bbox = turf.bbox(feature.geometry);
// // // // // // // // // // // // // // // //       spatialIndex.insert({
// // // // // // // // // // // // // // // //         minX: bbox[0],
// // // // // // // // // // // // // // // //         minY: bbox[1],
// // // // // // // // // // // // // // // //         maxX: bbox[2],
// // // // // // // // // // // // // // // //         maxY: bbox[3],
// // // // // // // // // // // // // // // //         featureIndex: index,
// // // // // // // // // // // // // // // //       });
// // // // // // // // // // // // // // // //     });
// // // // // // // // // // // // // // // //     spatialIndexRef.current = spatialIndex;

// // // // // // // // // // // // // // // //     return () => {
// // // // // // // // // // // // // // // //       spatialIndexRef.current = null;
// // // // // // // // // // // // // // // //     };
// // // // // // // // // // // // // // // //   }, [boundaryData]);

// // // // // // // // // // // // // // // //   const generateStaticGrid = (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
// // // // // // // // // // // // // // // //     const points = geoData.features
// // // // // // // // // // // // // // // //       .map((feature) => {
// // // // // // // // // // // // // // // //         const centroid = turf.centroid(feature.geometry);
// // // // // // // // // // // // // // // //         const aod = feature.properties.aod_value;
// // // // // // // // // // // // // // // //         if (aod == null || aod <= 0 || isNaN(aod)) return null;
// // // // // // // // // // // // // // // //         return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], aod];
// // // // // // // // // // // // // // // //       })
// // // // // // // // // // // // // // // //       .filter((p): p is [number, number, number] => p !== null);

// // // // // // // // // // // // // // // //     const bbox = turf.bbox(turf.featureCollection(boundaryData.features));
// // // // // // // // // // // // // // // //     const cellSize = 0.02;
// // // // // // // // // // // // // // // //     const grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });

// // // // // // // // // // // // // // // //     let interpolated = turf.featureCollection([]);
// // // // // // // // // // // // // // // //     if (points.length > 0) {
// // // // // // // // // // // // // // // //       try {
// // // // // // // // // // // // // // // //         interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { aod: p[2] }))), cellSize / 4, { gridType: "point", property: "aod", units: "degrees", weight: 2.5 });
// // // // // // // // // // // // // // // //       } catch (error) {
// // // // // // // // // // // // // // // //         console.error("Interpolation error:", error);
// // // // // // // // // // // // // // // //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // // // // // // //       }
// // // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // //     interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];

// // // // // // // // // // // // // // // //     const boundaryPolygon = turf.featureCollection(boundaryData.features);
// // // // // // // // // // // // // // // //     const clipped = turf.pointsWithinPolygon(turf.featureCollection(grid.features), boundaryPolygon);

// // // // // // // // // // // // // // // //     const canvas = document.createElement("canvas");
// // // // // // // // // // // // // // // //     const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
// // // // // // // // // // // // // // // //     const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
// // // // // // // // // // // // // // // //     canvas.width = width;
// // // // // // // // // // // // // // // //     canvas.height = height;
// // // // // // // // // // // // // // // //     const ctx = canvas.getContext("2d");

// // // // // // // // // // // // // // // //     if (!ctx) return { imageUrl: null, bbox: [0, 0, 0, 0] };

// // // // // // // // // // // // // // // //     ctx.fillStyle = "rgba(0, 0, 0, 0)";
// // // // // // // // // // // // // // // //     ctx.fillRect(0, 0, width, height);

// // // // // // // // // // // // // // // //     clipped.features.forEach((feature) => {
// // // // // // // // // // // // // // // //       const coords = feature.geometry.coordinates;
// // // // // // // // // // // // // // // //       const point = turf.point(coords);

// // // // // // // // // // // // // // // //       const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer));

// // // // // // // // // // // // // // // //       let aodValue: number | null = null;
// // // // // // // // // // // // // // // //       if (inBuffer && interpolated.features.length > 0) {
// // // // // // // // // // // // // // // //         const closest = interpolated.features.reduce(
// // // // // // // // // // // // // // // //           (acc, f) => {
// // // // // // // // // // // // // // // //             const dist = turf.distance(f.geometry.coordinates, coords, { units: "degrees" });
// // // // // // // // // // // // // // // //             return dist < acc.dist ? { dist, value: f.properties.aod } : acc;
// // // // // // // // // // // // // // // //           },
// // // // // // // // // // // // // // // //           { dist: Infinity, value: 0 }
// // // // // // // // // // // // // // // //         );
// // // // // // // // // // // // // // // //         aodValue = closest.value > 0 ? closest.value : null;
// // // // // // // // // // // // // // // //       } else {
// // // // // // // // // // // // // // // //         const aodFeature = geoData.features.find((f) => {
// // // // // // // // // // // // // // // //           const polygon = f.geometry.type === "Polygon" ? turf.polygon(f.geometry.coordinates) : turf.multiPolygon(f.geometry.coordinates);
// // // // // // // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // // // // // // //         });
// // // // // // // // // // // // // // // //         aodValue = aodFeature && aodFeature.properties.aod_value != null && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;
// // // // // // // // // // // // // // // //       }

// // // // // // // // // // // // // // // //       if (aodValue == null) return;

// // // // // // // // // // // // // // // //       const color = interpolateColor(aodValue);
// // // // // // // // // // // // // // // //       const x = Math.round((coords[0] - bbox[0]) / cellSize);
// // // // // // // // // // // // // // // //       const y = Math.round((bbox[3] - coords[1]) / cellSize);
// // // // // // // // // // // // // // // //       ctx.fillStyle = color;
// // // // // // // // // // // // // // // //       ctx.fillRect(x, y, 1, 1);
// // // // // // // // // // // // // // // //     });

// // // // // // // // // // // // // // // //     return { imageUrl: canvas.toDataURL(), bbox };
// // // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // // //   const cachedGrid = useMemo(() => {
// // // // // // // // // // // // // // // //     if (!geoData || !boundaryData) return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // // // // // // //     return generateStaticGrid(geoData, boundaryData);
// // // // // // // // // // // // // // // //   }, [geoData, boundaryData]);

// // // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // // //     if (!map || !geoData || !boundaryData) {
// // // // // // // // // // // // // // // //       return;
// // // // // // // // // // // // // // // //     }

// // // // // // // // // // // // // // // //     const { imageUrl, bbox } = cachedGrid;

// // // // // // // // // // // // // // // //     if (staticLayerRef.current) {
// // // // // // // // // // // // // // // //       map.removeLayer(staticLayerRef.current);
// // // // // // // // // // // // // // // //       staticLayerRef.current = null;
// // // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // //     if (tooltipRef.current) {
// // // // // // // // // // // // // // // //       tooltipRef.current.remove();
// // // // // // // // // // // // // // // //       tooltipRef.current = null;
// // // // // // // // // // // // // // // //     }

// // // // // // // // // // // // // // // //     if (imageUrl) {
// // // // // // // // // // // // // // // //       const bounds = [
// // // // // // // // // // // // // // // //         [bbox[1], bbox[0]],
// // // // // // // // // // // // // // // //         [bbox[3], bbox[2]],
// // // // // // // // // // // // // // // //       ];
// // // // // // // // // // // // // // // //       staticLayerRef.current = L.imageOverlay(imageUrl, bounds, { opacity: 0.85, interactive: true }).addTo(map);
// // // // // // // // // // // // // // // //     }

// // // // // // // // // // // // // // // //     const handleMouseMove = (e: L.LeafletMouseEvent) => {
// // // // // // // // // // // // // // // //       if (document.activeElement === inputRef.current) {
// // // // // // // // // // // // // // // //         return;
// // // // // // // // // // // // // // // //       }
// // // // // // // // // // // // // // // //       const { lat, lng } = e.latlng;
// // // // // // // // // // // // // // // //       if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
// // // // // // // // // // // // // // // //         return;
// // // // // // // // // // // // // // // //       }
// // // // // // // // // // // // // // // //       lastPosition.current = { lat, lng };

// // // // // // // // // // // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);

// // // // // // // // // // // // // // // //       timeoutRef.current = setTimeout(() => {
// // // // // // // // // // // // // // // //         if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // // // // // // // // // // //         const point = turf.point([lng, lat]);

// // // // // // // // // // // // // // // //         const candidates =
// // // // // // // // // // // // // // // //           spatialIndexRef.current?.search({
// // // // // // // // // // // // // // // //             minX: lng,
// // // // // // // // // // // // // // // //             minY: lat,
// // // // // // // // // // // // // // // //             maxX: lng,
// // // // // // // // // // // // // // // //             maxY: lat,
// // // // // // // // // // // // // // // //           }) || [];

// // // // // // // // // // // // // // // //         const kelurahan = boundaryData.features.find((bf, index) => {
// // // // // // // // // // // // // // // //           if (!candidates.some((c: RBushItem) => c.featureIndex === index)) return false;
// // // // // // // // // // // // // // // //           const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
// // // // // // // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // // // // // // //         });

// // // // // // // // // // // // // // // //         const aodFeature = geoData.features.find((feature) => {
// // // // // // // // // // // // // // // //           const polygon = feature.geometry.type === "Polygon" ? turf.polygon(feature.geometry.coordinates) : turf.multiPolygon(feature.geometry.coordinates);
// // // // // // // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // // // // // // //         });
// // // // // // // // // // // // // // // //         const aodValue = aodFeature && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;

// // // // // // // // // // // // // // // //         if (kelurahan?.properties) {
// // // // // // // // // // // // // // // //           tooltipRef.current = L.tooltip({
// // // // // // // // // // // // // // // //             sticky: true,
// // // // // // // // // // // // // // // //             direction: "top",
// // // // // // // // // // // // // // // //             offset: [0, -20],
// // // // // // // // // // // // // // // //             className: styles.customTooltip,
// // // // // // // // // // // // // // // //           })
// // // // // // // // // // // // // // // //             .setLatLng(e.latlng)
// // // // // // // // // // // // // // // //             .setContent(getTooltipContent(aodValue, kelurahan.properties.NAMOBJ))
// // // // // // // // // // // // // // // //             .addTo(map);
// // // // // // // // // // // // // // // //         }
// // // // // // // // // // // // // // // //       }, 500);
// // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // //     map.on("mousemove", handleMouseMove);

// // // // // // // // // // // // // // // //     return () => {
// // // // // // // // // // // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);
// // // // // // // // // // // // // // // //       map.off("mousemove", handleMouseMove);
// // // // // // // // // // // // // // // //       if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // // // // // // // // // // //       if (staticLayerRef.current) map.removeLayer(staticLayerRef.current);
// // // // // // // // // // // // // // // //     };
// // // // // // // // // // // // // // // //   }, [map, cachedGrid, selectedDate, inputRef, geoData, boundaryData]);

// // // // // // // // // // // // // // // //   return (
// // // // // // // // // // // // // // // //     <>
// // // // // // // // // // // // // // // //       {isLoading && (
// // // // // // // // // // // // // // // //         <div className={styles.loadingOverlay}>
// // // // // // // // // // // // // // // //           <div className={styles.spinner}></div>
// // // // // // // // // // // // // // // //           <span>Memuat Heatmap...</span>
// // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // //       )}
// // // // // // // // // // // // // // // //       <div className={styles.legend}>
// // // // // // // // // // // // // // // //         <h4>Legenda AOD</h4>
// // // // // // // // // // // // // // // //         <div className={styles.gradientLegend}>
// // // // // // // // // // // // // // // //           <div
// // // // // // // // // // // // // // // //             className={styles.gradientBar}
// // // // // // // // // // // // // // // //             style={{
// // // // // // // // // // // // // // // //               background: "linear-gradient(to right, rgba(0, 255, 0, 0.85), rgba(0, 0, 255, 0.85), rgba(255, 255, 0, 0.85), rgba(255, 0, 0, 0.85))",
// // // // // // // // // // // // // // // //             }}
// // // // // // // // // // // // // // // //           ></div>
// // // // // // // // // // // // // // // //           <div className={styles.gradientLabels}>
// // // // // // // // // // // // // // // //             <span>0.0</span>
// // // // // // // // // // // // // // // //             <span>1.0+</span>
// // // // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // // //     </>
// // // // // // // // // // // // // // // //   );
// // // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // // export default HeatMapLayer;

// // // // // // // // // // // // // // // "use client";

// // // // // // // // // // // // // // // import { useEffect, useRef, useMemo } from "react";
// // // // // // // // // // // // // // // import { useMap } from "react-leaflet";
// // // // // // // // // // // // // // // import L from "leaflet";
// // // // // // // // // // // // // // // import * as turf from "@turf/turf";
// // // // // // // // // // // // // // // import * as GeoJSON from "geojson";
// // // // // // // // // // // // // // // import RBush from "rbush";
// // // // // // // // // // // // // // // import styles from "./map.module.css";
// // // // // // // // // // // // // // // import { interpolateColor } from "../../utils/color";

// // // // // // // // // // // // // // // interface FeatureProperties {
// // // // // // // // // // // // // // //   aod_value: number;
// // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // interface BoundaryProperties {
// // // // // // // // // // // // // // //   NAMOBJ: string;
// // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // interface Feature {
// // // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // // //   id: number;
// // // // // // // // // // // // // // //   properties: FeatureProperties;
// // // // // // // // // // // // // // //   geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
// // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // interface BoundaryFeature {
// // // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // // //   properties: BoundaryProperties;
// // // // // // // // // // // // // // //   geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
// // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // interface GeoJSONData {
// // // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // // //   features: Feature[];
// // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // interface BoundaryGeoJSONData {
// // // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // // //   features: BoundaryFeature[];
// // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // interface HeatMapLayerProps {
// // // // // // // // // // // // // // //   geoData: GeoJSONData | null;
// // // // // // // // // // // // // // //   boundaryData: BoundaryGeoJSONData | null;
// // // // // // // // // // // // // // //   selectedDate: string;
// // // // // // // // // // // // // // //   isLoading: boolean;
// // // // // // // // // // // // // // //   inputRef: React.RefObject<HTMLInputElement>;
// // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // interface RBushItem {
// // // // // // // // // // // // // // //   minX: number;
// // // // // // // // // // // // // // //   minY: number;
// // // // // // // // // // // // // // //   maxX: number;
// // // // // // // // // // // // // // //   maxY: number;
// // // // // // // // // // // // // // //   featureIndex: number;
// // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // interface InterpolatedFeature {
// // // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // // //   geometry: turf.Point;
// // // // // // // // // // // // // // //   properties: { aod: number };
// // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // const HeatMapLayer: React.FC<HeatMapLayerProps> = ({ geoData, boundaryData, selectedDate, isLoading, inputRef }) => {
// // // // // // // // // // // // // // //   const map = useMap();
// // // // // // // // // // // // // // //   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
// // // // // // // // // // // // // // //   const tooltipRef = useRef<L.Tooltip | null>(null);
// // // // // // // // // // // // // // //   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
// // // // // // // // // // // // // // //   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
// // // // // // // // // // // // // // //   const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);
// // // // // // // // // // // // // // //   const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);

// // // // // // // // // // // // // // //   const getTooltipContent = (aodValue: number | null, kelurahanName: string): string => {
// // // // // // // // // // // // // // //     const formattedAodValue = aodValue !== null && aodValue > 0 ? aodValue.toFixed(4) : "No Data";
// // // // // // // // // // // // // // //     const aodColor = aodValue !== null && aodValue > 0 ? interpolateColor(aodValue) : "#a0aec0";
// // // // // // // // // // // // // // //     const textColor = aodColor === "rgba(0, 255, 0, 0.85)" || aodColor === "rgba(255, 255, 0, 0.85)" ? "#000000" : "#ffffff";
// // // // // // // // // // // // // // //     return `
// // // // // // // // // // // // // // //       <div class="${styles.customTooltip}">
// // // // // // // // // // // // // // //         <div class="${styles.kelurahanName}">${kelurahanName}</div>
// // // // // // // // // // // // // // //         <div class="${styles.aodContainer}">
// // // // // // // // // // // // // // //           <div class="${styles.aodCircle}" style="background-color: ${aodColor}; color: ${textColor}">
// // // // // // // // // // // // // // //             ${formattedAodValue}
// // // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // //     `;
// // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // //   const cachedBoundaries = useMemo(() => {
// // // // // // // // // // // // // // //     if (!geoData) return turf.featureCollection([]);
// // // // // // // // // // // // // // //     return turf.featureCollection(geoData.features.filter((f) => f.properties.aod_value != null && f.properties.aod_value > 0).map((feature) => turf.buffer(feature.geometry, 0.002, { units: "degrees" })));
// // // // // // // // // // // // // // //   }, [geoData]);

// // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // //     if (!boundaryData) return;
// // // // // // // // // // // // // // //     const spatialIndex = new RBush<RBushItem>();
// // // // // // // // // // // // // // //     boundaryData.features.forEach((feature, index) => {
// // // // // // // // // // // // // // //       const bbox = turf.bbox(feature.geometry);
// // // // // // // // // // // // // // //       spatialIndex.insert({
// // // // // // // // // // // // // // //         minX: bbox[0],
// // // // // // // // // // // // // // //         minY: bbox[1],
// // // // // // // // // // // // // // //         maxX: bbox[2],
// // // // // // // // // // // // // // //         maxY: bbox[3],
// // // // // // // // // // // // // // //         featureIndex: index,
// // // // // // // // // // // // // // //       });
// // // // // // // // // // // // // // //     });
// // // // // // // // // // // // // // //     spatialIndexRef.current = spatialIndex;

// // // // // // // // // // // // // // //     return () => {
// // // // // // // // // // // // // // //       spatialIndexRef.current = null;
// // // // // // // // // // // // // // //     };
// // // // // // // // // // // // // // //   }, [boundaryData]);

// // // // // // // // // // // // // // //   const generateStaticGrid = (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
// // // // // // // // // // // // // // //     const points = geoData.features
// // // // // // // // // // // // // // //       .map((feature) => {
// // // // // // // // // // // // // // //         const centroid = turf.centroid(feature.geometry);
// // // // // // // // // // // // // // //         const aod = feature.properties.aod_value;
// // // // // // // // // // // // // // //         if (aod == null || aod <= 0 || isNaN(aod)) return null;
// // // // // // // // // // // // // // //         return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], aod];
// // // // // // // // // // // // // // //       })
// // // // // // // // // // // // // // //       .filter((p): p is [number, number, number] => p !== null);

// // // // // // // // // // // // // // //     const bbox = turf.bbox(turf.featureCollection(boundaryData.features));
// // // // // // // // // // // // // // //     const cellSize = 0.02;
// // // // // // // // // // // // // // //     const grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });

// // // // // // // // // // // // // // //     let interpolated = turf.featureCollection([]);
// // // // // // // // // // // // // // //     if (points.length > 0) {
// // // // // // // // // // // // // // //       try {
// // // // // // // // // // // // // // //         interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { aod: p[2] }))), cellSize / 4, { gridType: "point", property: "aod", units: "degrees", weight: 2.5 });
// // // // // // // // // // // // // // //       } catch (error) {
// // // // // // // // // // // // // // //         console.error("Interpolation error:", error);
// // // // // // // // // // // // // // //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // // // // // //       }
// // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // //     interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];

// // // // // // // // // // // // // // //     const boundaryPolygon = turf.featureCollection(boundaryData.features);
// // // // // // // // // // // // // // //     const clipped = turf.pointsWithinPolygon(turf.featureCollection(grid.features), boundaryPolygon);

// // // // // // // // // // // // // // //     const canvas = document.createElement("canvas");
// // // // // // // // // // // // // // //     const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
// // // // // // // // // // // // // // //     const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
// // // // // // // // // // // // // // //     canvas.width = width;
// // // // // // // // // // // // // // //     canvas.height = height;
// // // // // // // // // // // // // // //     const ctx = canvas.getContext("2d");

// // // // // // // // // // // // // // //     if (!ctx) return { imageUrl: null, bbox: [0, 0, 0, 0] };

// // // // // // // // // // // // // // //     ctx.fillStyle = "rgba(0, 0, 0, 0)";
// // // // // // // // // // // // // // //     ctx.fillRect(0, 0, width, height);

// // // // // // // // // // // // // // //     clipped.features.forEach((feature) => {
// // // // // // // // // // // // // // //       const coords = feature.geometry.coordinates;
// // // // // // // // // // // // // // //       const point = turf.point(coords);

// // // // // // // // // // // // // // //       const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer));

// // // // // // // // // // // // // // //       let aodValue: number | null = null;
// // // // // // // // // // // // // // //       if (inBuffer && interpolated.features.length > 0) {
// // // // // // // // // // // // // // //         const closest = interpolated.features.reduce(
// // // // // // // // // // // // // // //           (acc, f) => {
// // // // // // // // // // // // // // //             const dist = turf.distance(f.geometry.coordinates, coords, { units: "degrees" });
// // // // // // // // // // // // // // //             return dist < acc.dist ? { dist, value: f.properties.aod } : acc;
// // // // // // // // // // // // // // //           },
// // // // // // // // // // // // // // //           { dist: Infinity, value: 0 }
// // // // // // // // // // // // // // //         );
// // // // // // // // // // // // // // //         aodValue = closest.value > 0 ? closest.value : null;
// // // // // // // // // // // // // // //       } else {
// // // // // // // // // // // // // // //         const aodFeature = geoData.features.find((f) => {
// // // // // // // // // // // // // // //           const polygon = f.geometry.type === "Polygon" ? turf.polygon(f.geometry.coordinates) : turf.multiPolygon(f.geometry.coordinates);
// // // // // // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // // // // // //         });
// // // // // // // // // // // // // // //         aodValue = aodFeature && aodFeature.properties.aod_value != null && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;
// // // // // // // // // // // // // // //       }

// // // // // // // // // // // // // // //       if (aodValue == null) return;

// // // // // // // // // // // // // // //       const color = interpolateColor(aodValue);
// // // // // // // // // // // // // // //       const x = Math.round((coords[0] - bbox[0]) / cellSize);
// // // // // // // // // // // // // // //       const y = Math.round((bbox[3] - coords[1]) / cellSize);
// // // // // // // // // // // // // // //       ctx.fillStyle = color;
// // // // // // // // // // // // // // //       ctx.fillRect(x, y, 1, 1);
// // // // // // // // // // // // // // //     });

// // // // // // // // // // // // // // //     return { imageUrl: canvas.toDataURL(), bbox };
// // // // // // // // // // // // // // //   };

// // // // // // // // // // // // // // //   const cachedGrid = useMemo(() => {
// // // // // // // // // // // // // // //     if (!geoData || !boundaryData) return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // // // // // //     return generateStaticGrid(geoData, boundaryData);
// // // // // // // // // // // // // // //   }, [geoData, boundaryData]);

// // // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // // //     if (!map || !geoData || !boundaryData) {
// // // // // // // // // // // // // // //       return;
// // // // // // // // // // // // // // //     }

// // // // // // // // // // // // // // //     const { imageUrl, bbox } = cachedGrid;

// // // // // // // // // // // // // // //     if (staticLayerRef.current) {
// // // // // // // // // // // // // // //       map.removeLayer(staticLayerRef.current);
// // // // // // // // // // // // // // //       staticLayerRef.current = null;
// // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // //     if (tooltipRef.current) {
// // // // // // // // // // // // // // //       tooltipRef.current.remove();
// // // // // // // // // // // // // // //       tooltipRef.current = null;
// // // // // // // // // // // // // // //     }

// // // // // // // // // // // // // // //     if (imageUrl) {
// // // // // // // // // // // // // // //       const bounds = [
// // // // // // // // // // // // // // //         [bbox[1], bbox[0]],
// // // // // // // // // // // // // // //         [bbox[3], bbox[2]],
// // // // // // // // // // // // // // //       ];
// // // // // // // // // // // // // // //       staticLayerRef.current = L.imageOverlay(imageUrl, bounds, { opacity: 0.85, interactive: true }).addTo(map);
// // // // // // // // // // // // // // //     }

// // // // // // // // // // // // // // //     const handleMouseMove = (e: L.LeafletMouseEvent) => {
// // // // // // // // // // // // // // //       if (document.activeElement === inputRef.current) {
// // // // // // // // // // // // // // //         return;
// // // // // // // // // // // // // // //       }
// // // // // // // // // // // // // // //       const { lat, lng } = e.latlng;
// // // // // // // // // // // // // // //       if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
// // // // // // // // // // // // // // //         return;
// // // // // // // // // // // // // // //       }
// // // // // // // // // // // // // // //       lastPosition.current = { lat, lng };

// // // // // // // // // // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);

// // // // // // // // // // // // // // //       timeoutRef.current = setTimeout(() => {
// // // // // // // // // // // // // // //         if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // // // // // // // // // //         const point = turf.point([lng, lat]);

// // // // // // // // // // // // // // //         const candidates =
// // // // // // // // // // // // // // //           spatialIndexRef.current?.search({
// // // // // // // // // // // // // // //             minX: lng,
// // // // // // // // // // // // // // //             minY: lat,
// // // // // // // // // // // // // // //             maxX: lng,
// // // // // // // // // // // // // // //             maxY: lat,
// // // // // // // // // // // // // // //           }) || [];

// // // // // // // // // // // // // // //         const kelurahan = boundaryData.features.find((bf, index) => {
// // // // // // // // // // // // // // //           if (!candidates.some((c: RBushItem) => c.featureIndex === index)) return false;
// // // // // // // // // // // // // // //           const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
// // // // // // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // // // // // //         });

// // // // // // // // // // // // // // //         const aodFeature = geoData.features.find((feature) => {
// // // // // // // // // // // // // // //           const polygon = feature.geometry.type === "Polygon" ? turf.polygon(feature.geometry.coordinates) : turf.multiPolygon(feature.geometry.coordinates);
// // // // // // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // // // // // //         });
// // // // // // // // // // // // // // //         const aodValue = aodFeature && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;

// // // // // // // // // // // // // // //         if (kelurahan?.properties) {
// // // // // // // // // // // // // // //           tooltipRef.current = L.tooltip({
// // // // // // // // // // // // // // //             sticky: true,
// // // // // // // // // // // // // // //             direction: "top",
// // // // // // // // // // // // // // //             offset: [0, -20],
// // // // // // // // // // // // // // //             className: styles.customTooltip,
// // // // // // // // // // // // // // //           })
// // // // // // // // // // // // // // //             .setLatLng(e.latlng)
// // // // // // // // // // // // // // //             .setContent(getTooltipContent(aodValue, kelurahan.properties.NAMOBJ))
// // // // // // // // // // // // // // //             .addTo(map);
// // // // // // // // // // // // // // //         }
// // // // // // // // // // // // // // //       }, 500);
// // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // //     map.on("mousemove", handleMouseMove);

// // // // // // // // // // // // // // //     return () => {
// // // // // // // // // // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);
// // // // // // // // // // // // // // //       map.off("mousemove", handleMouseMove);
// // // // // // // // // // // // // // //       if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // // // // // // // // // //       if (staticLayerRef.current) map.removeLayer(staticLayerRef.current);
// // // // // // // // // // // // // // //     };
// // // // // // // // // // // // // // //   }, [map, cachedGrid, selectedDate, inputRef, geoData, boundaryData]);

// // // // // // // // // // // // // // //   return (
// // // // // // // // // // // // // // //     <>
// // // // // // // // // // // // // // //       {isLoading && (
// // // // // // // // // // // // // // //         <div className={styles.loadingOverlay}>
// // // // // // // // // // // // // // //           <div className={styles.spinner}></div>
// // // // // // // // // // // // // // //           <span>Memuat Heatmap...</span>
// // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // //       )}
// // // // // // // // // // // // // // //       <div className={styles.legend}>
// // // // // // // // // // // // // // //         <h4>Legenda AOD</h4>
// // // // // // // // // // // // // // //         <div className={styles.gradientLegend}>
// // // // // // // // // // // // // // //           <div
// // // // // // // // // // // // // // //             className={styles.gradientBar}
// // // // // // // // // // // // // // //             style={{
// // // // // // // // // // // // // // //               background: "linear-gradient(to right, rgba(0, 255, 0, 0.85), rgba(0, 0, 255, 0.85), rgba(255, 255, 0, 0.85), rgba(255, 0, 0, 0.85))",
// // // // // // // // // // // // // // //             }}
// // // // // // // // // // // // // // //           ></div>
// // // // // // // // // // // // // // //           <div className={styles.gradientLabels}>
// // // // // // // // // // // // // // //             <span>0.0</span>
// // // // // // // // // // // // // // //             <span>1.0+</span>
// // // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // // //     </>
// // // // // // // // // // // // // // //   );
// // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // export default HeatMapLayer;

// // // // // // // // // // // // // // "use client";

// // // // // // // // // // // // // // import { useEffect, useRef, useMemo } from "react";
// // // // // // // // // // // // // // import { useMap } from "react-leaflet";
// // // // // // // // // // // // // // import L from "leaflet";
// // // // // // // // // // // // // // import * as turf from "@turf/turf";
// // // // // // // // // // // // // // import * as GeoJSON from "geojson";
// // // // // // // // // // // // // // import RBush from "rbush";
// // // // // // // // // // // // // // import styles from "./map.module.css";
// // // // // // // // // // // // // // import { interpolateColor } from "../../utils/color";

// // // // // // // // // // // // // // interface FeatureProperties {
// // // // // // // // // // // // // //   aod_value: number;
// // // // // // // // // // // // // // }

// // // // // // // // // // // // // // interface BoundaryProperties {
// // // // // // // // // // // // // //   NAMOBJ: string;
// // // // // // // // // // // // // // }

// // // // // // // // // // // // // // interface Feature {
// // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // //   id: number;
// // // // // // // // // // // // // //   properties: FeatureProperties;
// // // // // // // // // // // // // //   geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
// // // // // // // // // // // // // // }

// // // // // // // // // // // // // // interface BoundaryFeature {
// // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // //   properties: BoundaryProperties;
// // // // // // // // // // // // // //   geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
// // // // // // // // // // // // // // }

// // // // // // // // // // // // // // interface GeoJSONData {
// // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // //   features: Feature[];
// // // // // // // // // // // // // // }

// // // // // // // // // // // // // // interface BoundaryGeoJSONData {
// // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // //   features: BoundaryFeature[];
// // // // // // // // // // // // // // }

// // // // // // // // // // // // // // interface HeatMapLayerProps {
// // // // // // // // // // // // // //   geoData: GeoJSONData | null;
// // // // // // // // // // // // // //   boundaryData: BoundaryGeoJSONData | null;
// // // // // // // // // // // // // //   selectedDate: string;
// // // // // // // // // // // // // //   isLoading: boolean;
// // // // // // // // // // // // // //   inputRef: React.RefObject<HTMLInputElement>;
// // // // // // // // // // // // // // }

// // // // // // // // // // // // // // interface RBushItem {
// // // // // // // // // // // // // //   minX: number;
// // // // // // // // // // // // // //   minY: number;
// // // // // // // // // // // // // //   maxX: number;
// // // // // // // // // // // // // //   maxY: number;
// // // // // // // // // // // // // //   featureIndex: number;
// // // // // // // // // // // // // // }

// // // // // // // // // // // // // // interface InterpolatedFeature {
// // // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // // //   geometry: GeoJSON.Point;
// // // // // // // // // // // // // //   properties: { aod: number };
// // // // // // // // // // // // // // }

// // // // // // // // // // // // // // const HeatMapLayer: React.FC<HeatMapLayerProps> = ({ geoData, boundaryData, selectedDate, isLoading, inputRef }) => {
// // // // // // // // // // // // // //   const map = useMap();
// // // // // // // // // // // // // //   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
// // // // // // // // // // // // // //   const tooltipRef = useRef<L.Tooltip | null>(null);
// // // // // // // // // // // // // //   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
// // // // // // // // // // // // // //   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
// // // // // // // // // // // // // //   const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);
// // // // // // // // // // // // // //   const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);

// // // // // // // // // // // // // //   const getTooltipContent = (aodValue: number | null, kelurahanName: string): string => {
// // // // // // // // // // // // // //     const formattedAodValue = aodValue !== null && aodValue > 0 ? aodValue.toFixed(4) : "No Data";
// // // // // // // // // // // // // //     const aodColor = aodValue !== null && aodValue > 0 ? interpolateColor(aodValue) : "#a0aec0";
// // // // // // // // // // // // // //     const textColor = aodColor === "rgba(0, 255, 0, 0.85)" || aodColor === "rgba(255, 255, 0, 0.85)" ? "#000000" : "#ffffff";
// // // // // // // // // // // // // //     return `
// // // // // // // // // // // // // //       <div class="${styles.customTooltip}">
// // // // // // // // // // // // // //         <div class="${styles.kelurahanName}">${kelurahanName}</div>
// // // // // // // // // // // // // //         <div class="${styles.aodContainer}">
// // // // // // // // // // // // // //           <div class="${styles.aodCircle}" style="background-color: ${aodColor}; color: ${textColor}">
// // // // // // // // // // // // // //             ${formattedAodValue}
// // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // //     `;
// // // // // // // // // // // // // //   };

// // // // // // // // // // // // // //   const cachedBoundaries = useMemo(() => {
// // // // // // // // // // // // // //     if (!geoData) return turf.featureCollection([]);
// // // // // // // // // // // // // //     return turf.featureCollection(geoData.features.filter((f) => f.properties.aod_value != null && f.properties.aod_value > 0).map((feature) => turf.buffer(feature.geometry, 0.002, { units: "degrees" })));
// // // // // // // // // // // // // //   }, [geoData]);

// // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // //     if (!boundaryData) return;
// // // // // // // // // // // // // //     const spatialIndex = new RBush<RBushItem>();
// // // // // // // // // // // // // //     boundaryData.features.forEach((feature, index) => {
// // // // // // // // // // // // // //       const bbox = turf.bbox(feature.geometry);
// // // // // // // // // // // // // //       spatialIndex.insert({
// // // // // // // // // // // // // //         minX: bbox[0],
// // // // // // // // // // // // // //         minY: bbox[1],
// // // // // // // // // // // // // //         maxX: bbox[2],
// // // // // // // // // // // // // //         maxY: bbox[3],
// // // // // // // // // // // // // //         featureIndex: index,
// // // // // // // // // // // // // //       });
// // // // // // // // // // // // // //     });
// // // // // // // // // // // // // //     spatialIndexRef.current = spatialIndex;

// // // // // // // // // // // // // //     return () => {
// // // // // // // // // // // // // //       spatialIndexRef.current = null;
// // // // // // // // // // // // // //     };
// // // // // // // // // // // // // //   }, [boundaryData]);

// // // // // // // // // // // // // //   const generateStaticGrid = (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
// // // // // // // // // // // // // //     console.log("generateStaticGrid: Starting with geoData features:", geoData.features.length);

// // // // // // // // // // // // // //     const points = geoData.features
// // // // // // // // // // // // // //       .map((feature) => {
// // // // // // // // // // // // // //         const centroid = turf.centroid(feature.geometry);
// // // // // // // // // // // // // //         const aod = feature.properties.aod_value;
// // // // // // // // // // // // // //         if (aod == null || aod <= 0 || isNaN(aod)) {
// // // // // // // // // // // // // //           console.log("Skipping feature due to invalid aod_value:", feature);
// // // // // // // // // // // // // //           return null;
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //         return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], aod];
// // // // // // // // // // // // // //       })
// // // // // // // // // // // // // //       .filter((p): p is [number, number, number] => p !== null);

// // // // // // // // // // // // // //     console.log("generateStaticGrid: Valid points for interpolation:", points.length, points);

// // // // // // // // // // // // // //     const bbox = turf.bbox(turf.featureCollection(boundaryData.features));
// // // // // // // // // // // // // //     console.log("generateStaticGrid: Bounding box:", bbox);

// // // // // // // // // // // // // //     const cellSize = 0.02;
// // // // // // // // // // // // // //     const grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });
// // // // // // // // // // // // // //     console.log("generateStaticGrid: Grid points created:", grid.features.length);

// // // // // // // // // // // // // //     let interpolated = turf.featureCollection([]);
// // // // // // // // // // // // // //     if (points.length > 0) {
// // // // // // // // // // // // // //       try {
// // // // // // // // // // // // // //         interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { aod: p[2] }))), cellSize / 4, { gridType: "point", property: "aod", units: "degrees", weight: 2.5 });
// // // // // // // // // // // // // //         console.log("generateStaticGrid: Interpolated points:", interpolated.features.length);
// // // // // // // // // // // // // //       } catch (error) {
// // // // // // // // // // // // // //         console.error("Interpolation error:", error);
// // // // // // // // // // // // // //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // // // // //       }
// // // // // // // // // // // // // //     } else {
// // // // // // // // // // // // // //       console.warn("generateStaticGrid: No valid points for interpolation");
// // // // // // // // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // // // // //     }
// // // // // // // // // // // // // //     interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];

// // // // // // // // // // // // // //     const boundaryPolygon = turf.featureCollection(boundaryData.features);
// // // // // // // // // // // // // //     const clipped = turf.pointsWithinPolygon(turf.featureCollection(grid.features), boundaryPolygon);
// // // // // // // // // // // // // //     console.log("generateStaticGrid: Clipped points:", clipped.features.length);

// // // // // // // // // // // // // //     const canvas = document.createElement("canvas");
// // // // // // // // // // // // // //     const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
// // // // // // // // // // // // // //     const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
// // // // // // // // // // // // // //     canvas.width = width;
// // // // // // // // // // // // // //     canvas.height = height;
// // // // // // // // // // // // // //     const ctx = canvas.getContext("2d");

// // // // // // // // // // // // // //     if (!ctx) {
// // // // // // // // // // // // // //       console.error("generateStaticGrid: Failed to get canvas context");
// // // // // // // // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // // // // //     }

// // // // // // // // // // // // // //     ctx.fillStyle = "rgba(0, 0, 0, 0)";
// // // // // // // // // // // // // //     ctx.fillRect(0, 0, width, height);

// // // // // // // // // // // // // //     let validPoints = 0;
// // // // // // // // // // // // // //     clipped.features.forEach((feature) => {
// // // // // // // // // // // // // //       const coords = feature.geometry.coordinates;
// // // // // // // // // // // // // //       const point = turf.point(coords);

// // // // // // // // // // // // // //       const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer));

// // // // // // // // // // // // // //       let aodValue: number | null = null;
// // // // // // // // // // // // // //       if (inBuffer && interpolated.features.length > 0) {
// // // // // // // // // // // // // //         const closest = interpolated.features.reduce(
// // // // // // // // // // // // // //           (acc, f) => {
// // // // // // // // // // // // // //             const dist = turf.distance(f.geometry.coordinates, coords, { units: "degrees" });
// // // // // // // // // // // // // //             return dist < acc.dist ? { dist, value: f.properties.aod } : acc;
// // // // // // // // // // // // // //           },
// // // // // // // // // // // // // //           { dist: Infinity, value: 0 }
// // // // // // // // // // // // // //         );
// // // // // // // // // // // // // //         aodValue = closest.value > 0 ? closest.value : null;
// // // // // // // // // // // // // //       } else {
// // // // // // // // // // // // // //         const aodFeature = geoData.features.find((f) => {
// // // // // // // // // // // // // //           const polygon = f.geometry.type === "Polygon" ? turf.polygon(f.geometry.coordinates) : turf.multiPolygon(f.geometry.coordinates);
// // // // // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // // // // //         });
// // // // // // // // // // // // // //         aodValue = aodFeature && aodFeature.properties.aod_value != null && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;
// // // // // // // // // // // // // //       }

// // // // // // // // // // // // // //       if (aodValue == null) return;

// // // // // // // // // // // // // //       const color = interpolateColor(aodValue);
// // // // // // // // // // // // // //       const x = Math.round((coords[0] - bbox[0]) / cellSize);
// // // // // // // // // // // // // //       const y = Math.round((bbox[3] - coords[1]) / cellSize);
// // // // // // // // // // // // // //       ctx.fillStyle = color;
// // // // // // // // // // // // // //       ctx.fillRect(x, y, 1, 1);
// // // // // // // // // // // // // //       validPoints++;
// // // // // // // // // // // // // //     });

// // // // // // // // // // // // // //     console.log("generateStaticGrid: Valid points drawn on canvas:", validPoints);

// // // // // // // // // // // // // //     return { imageUrl: canvas.toDataURL(), bbox };
// // // // // // // // // // // // // //   };

// // // // // // // // // // // // // //   const cachedGrid = useMemo(() => {
// // // // // // // // // // // // // //     if (!geoData || !boundaryData) {
// // // // // // // // // // // // // //       console.warn("cachedGrid: Missing geoData or boundaryData");
// // // // // // // // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // // // // //     }
// // // // // // // // // // // // // //     return generateStaticGrid(geoData, boundaryData);
// // // // // // // // // // // // // //   }, [geoData, boundaryData]);

// // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // //     if (!map || !geoData || !boundaryData) {
// // // // // // // // // // // // // //       console.warn("useEffect: Missing map, geoData, or boundaryData");
// // // // // // // // // // // // // //       return;
// // // // // // // // // // // // // //     }

// // // // // // // // // // // // // //     const { imageUrl, bbox } = cachedGrid;
// // // // // // // // // // // // // //     console.log("useEffect: Image URL and bbox:", imageUrl, bbox);

// // // // // // // // // // // // // //     if (staticLayerRef.current) {
// // // // // // // // // // // // // //       map.removeLayer(staticLayerRef.current);
// // // // // // // // // // // // // //       staticLayerRef.current = null;
// // // // // // // // // // // // // //     }
// // // // // // // // // // // // // //     if (tooltipRef.current) {
// // // // // // // // // // // // // //       tooltipRef.current.remove();
// // // // // // // // // // // // // //       tooltipRef.current = null;
// // // // // // // // // // // // // //     }

// // // // // // // // // // // // // //     if (imageUrl) {
// // // // // // // // // // // // // //       const bounds = [
// // // // // // // // // // // // // //         [bbox[1], bbox[0]],
// // // // // // // // // // // // // //         [bbox[3], bbox[2]],
// // // // // // // // // // // // // //       ];
// // // // // // // // // // // // // //       staticLayerRef.current = L.imageOverlay(imageUrl, bounds, { opacity: 0.85, interactive: true }).addTo(map);
// // // // // // // // // // // // // //       console.log("useEffect: ImageOverlay added to map");
// // // // // // // // // // // // // //     } else {
// // // // // // // // // // // // // //       console.warn("useEffect: No valid imageUrl for ImageOverlay");
// // // // // // // // // // // // // //     }

// // // // // // // // // // // // // //     const handleMouseMove = (e: L.LeafletMouseEvent) => {
// // // // // // // // // // // // // //       if (document.activeElement === inputRef.current) {
// // // // // // // // // // // // // //         return;
// // // // // // // // // // // // // //       }
// // // // // // // // // // // // // //       const { lat, lng } = e.latlng;
// // // // // // // // // // // // // //       if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
// // // // // // // // // // // // // //         return;
// // // // // // // // // // // // // //       }
// // // // // // // // // // // // // //       lastPosition.current = { lat, lng };

// // // // // // // // // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);

// // // // // // // // // // // // // //       timeoutRef.current = setTimeout(() => {
// // // // // // // // // // // // // //         if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // // // // // // // // //         const point = turf.point([lng, lat]);

// // // // // // // // // // // // // //         const candidates =
// // // // // // // // // // // // // //           spatialIndexRef.current?.search({
// // // // // // // // // // // // // //             minX: lng,
// // // // // // // // // // // // // //             minY: lat,
// // // // // // // // // // // // // //             maxX: lng,
// // // // // // // // // // // // // //             maxY: lat,
// // // // // // // // // // // // // //           }) || [];

// // // // // // // // // // // // // //         const kelurahan = boundaryData.features.find((bf, index) => {
// // // // // // // // // // // // // //           if (!candidates.some((c: RBushItem) => c.featureIndex === index)) return false;
// // // // // // // // // // // // // //           const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
// // // // // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // // // // //         });

// // // // // // // // // // // // // //         const aodFeature = geoData.features.find((feature) => {
// // // // // // // // // // // // // //           const polygon = feature.geometry.type === "Polygon" ? turf.polygon(feature.geometry.coordinates) : turf.multiPolygon(feature.geometry.coordinates);
// // // // // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // // // // //         });
// // // // // // // // // // // // // //         const aodValue = aodFeature && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;

// // // // // // // // // // // // // //         if (kelurahan?.properties) {
// // // // // // // // // // // // // //           tooltipRef.current = L.tooltip({
// // // // // // // // // // // // // //             sticky: true,
// // // // // // // // // // // // // //             direction: "top",
// // // // // // // // // // // // // //             offset: [0, -20],
// // // // // // // // // // // // // //             className: styles.customTooltip,
// // // // // // // // // // // // // //           })
// // // // // // // // // // // // // //             .setLatLng(e.latlng)
// // // // // // // // // // // // // //             .setContent(getTooltipContent(aodValue, kelurahan.properties.NAMOBJ))
// // // // // // // // // // // // // //             .addTo(map);
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //       }, 500);
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     map.on("mousemove", handleMouseMove);

// // // // // // // // // // // // // //     return () => {
// // // // // // // // // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);
// // // // // // // // // // // // // //       map.off("mousemove", handleMouseMove);
// // // // // // // // // // // // // //       if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // // // // // // // // //       if (staticLayerRef.current) map.removeLayer(staticLayerRef.current);
// // // // // // // // // // // // // //     };
// // // // // // // // // // // // // //   }, [map, cachedGrid, selectedDate, inputRef, geoData, boundaryData]);

// // // // // // // // // // // // // //   return (
// // // // // // // // // // // // // //     <>
// // // // // // // // // // // // // //       {isLoading && (
// // // // // // // // // // // // // //         <div className={styles.loadingOverlay}>
// // // // // // // // // // // // // //           <div className={styles.spinner}></div>
// // // // // // // // // // // // // //           <span>Memuat Heatmap...</span>
// // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // //       )}
// // // // // // // // // // // // // //       <div className={styles.legend}>
// // // // // // // // // // // // // //         <h4>Legenda AOD</h4>
// // // // // // // // // // // // // //         <div className={styles.gradientLegend}>
// // // // // // // // // // // // // //           <div
// // // // // // // // // // // // // //             className={styles.gradientBar}
// // // // // // // // // // // // // //             style={{
// // // // // // // // // // // // // //               background: "linear-gradient(to right, rgba(0, 255, 0, 0.85), rgba(0, 0, 255, 0.85), rgba(255, 255, 0, 0.85), rgba(255, 0, 0, 0.85))",
// // // // // // // // // // // // // //             }}
// // // // // // // // // // // // // //           ></div>
// // // // // // // // // // // // // //           <div className={styles.gradientLabels}>
// // // // // // // // // // // // // //             <span>0.0</span>
// // // // // // // // // // // // // //             <span>1.0+</span>
// // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // //     </>
// // // // // // // // // // // // // //   );
// // // // // // // // // // // // // // };

// // // // // // // // // // // // // // export default HeatMapLayer;

// // // // // // // // // // // // // "use client";

// // // // // // // // // // // // // import { useEffect, useRef, useMemo } from "react";
// // // // // // // // // // // // // import { useMap } from "react-leaflet";
// // // // // // // // // // // // // import L from "leaflet";
// // // // // // // // // // // // // import * as turf from "@turf/turf";
// // // // // // // // // // // // // import * as GeoJSON from "geojson";
// // // // // // // // // // // // // import RBush from "rbush";
// // // // // // // // // // // // // import styles from "./map.module.css";
// // // // // // // // // // // // // import { interpolateColor } from "../../utils/color";

// // // // // // // // // // // // // interface FeatureProperties {
// // // // // // // // // // // // //   aod_value: number;
// // // // // // // // // // // // // }

// // // // // // // // // // // // // interface BoundaryProperties {
// // // // // // // // // // // // //   NAMOBJ: string;
// // // // // // // // // // // // // }

// // // // // // // // // // // // // interface Feature {
// // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // //   id: number;
// // // // // // // // // // // // //   properties: FeatureProperties;
// // // // // // // // // // // // //   geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
// // // // // // // // // // // // // }

// // // // // // // // // // // // // interface BoundaryFeature {
// // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // //   properties: BoundaryProperties;
// // // // // // // // // // // // //   geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
// // // // // // // // // // // // // }

// // // // // // // // // // // // // interface GeoJSONData {
// // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // //   features: Feature[];
// // // // // // // // // // // // // }

// // // // // // // // // // // // // interface BoundaryGeoJSONData {
// // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // //   features: BoundaryFeature[];
// // // // // // // // // // // // // }

// // // // // // // // // // // // // interface HeatMapLayerProps {
// // // // // // // // // // // // //   geoData: GeoJSONData | null;
// // // // // // // // // // // // //   boundaryData: BoundaryGeoJSONData | null;
// // // // // // // // // // // // //   selectedDate: string;
// // // // // // // // // // // // //   isLoading: boolean;
// // // // // // // // // // // // //   inputRef: React.RefObject<HTMLInputElement>;
// // // // // // // // // // // // // }

// // // // // // // // // // // // // interface RBushItem {
// // // // // // // // // // // // //   minX: number;
// // // // // // // // // // // // //   minY: number;
// // // // // // // // // // // // //   maxX: number;
// // // // // // // // // // // // //   maxY: number;
// // // // // // // // // // // // //   featureIndex: number;
// // // // // // // // // // // // // }

// // // // // // // // // // // // // interface InterpolatedFeature {
// // // // // // // // // // // // //   type: string;
// // // // // // // // // // // // //   geometry: GeoJSON.Point;
// // // // // // // // // // // // //   properties: { aod: number };
// // // // // // // // // // // // // }

// // // // // // // // // // // // // const HeatMapLayer: React.FC<HeatMapLayerProps> = ({ geoData, boundaryData, selectedDate, isLoading, inputRef }) => {
// // // // // // // // // // // // //   const map = useMap();
// // // // // // // // // // // // //   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
// // // // // // // // // // // // //   const tooltipRef = useRef<L.Tooltip | null>(null);
// // // // // // // // // // // // //   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
// // // // // // // // // // // // //   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
// // // // // // // // // // // // //   const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);
// // // // // // // // // // // // //   const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);

// // // // // // // // // // // // //   const getTooltipContent = (aodValue: number | null, kelurahanName: string): string => {
// // // // // // // // // // // // //     const formattedAodValue = aodValue !== null && aodValue > 0 ? aodValue.toFixed(4) : "No Data";
// // // // // // // // // // // // //     const aodColor = aodValue !== null && aodValue > 0 ? interpolateColor(aodValue) : "#a0aec0";
// // // // // // // // // // // // //     const textColor = aodColor === "rgba(0, 255, 0, 0.85)" || aodColor === "rgba(255, 255, 0, 0.85)" ? "#000000" : "#ffffff";
// // // // // // // // // // // // //     return `
// // // // // // // // // // // // //       <div class="${styles.customTooltip}">
// // // // // // // // // // // // //         <div class="${styles.kelurahanName}">${kelurahanName}</div>
// // // // // // // // // // // // //         <div class="${styles.aodContainer}">
// // // // // // // // // // // // //           <div class="${styles.aodCircle}" style="background-color: ${aodColor}; color: ${textColor}">
// // // // // // // // // // // // //             ${formattedAodValue}
// // // // // // // // // // // // //           </div>
// // // // // // // // // // // // //         </div>
// // // // // // // // // // // // //       </div>
// // // // // // // // // // // // //     `;
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   const cachedBoundaries = useMemo(() => {
// // // // // // // // // // // // //     if (!geoData) return turf.featureCollection([]);
// // // // // // // // // // // // //     const validFeatures = geoData.features
// // // // // // // // // // // // //       .filter((f) => f.properties.aod_value != null && f.properties.aod_value > 0)
// // // // // // // // // // // // //       .map((feature) => turf.buffer(feature.geometry, 0.002, { units: "degrees" }))
// // // // // // // // // // // // //       .filter((f): f is turf.Feature<turf.Polygon | turf.MultiPolygon> => f != null);
// // // // // // // // // // // // //     return turf.featureCollection(validFeatures);
// // // // // // // // // // // // //   }, [geoData]);

// // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // //     if (!boundaryData) return;
// // // // // // // // // // // // //     const spatialIndex = new RBush<RBushItem>();
// // // // // // // // // // // // //     boundaryData.features.forEach((feature, index) => {
// // // // // // // // // // // // //       const bbox = turf.bbox(feature.geometry);
// // // // // // // // // // // // //       spatialIndex.insert({
// // // // // // // // // // // // //         minX: bbox[0],
// // // // // // // // // // // // //         minY: bbox[1],
// // // // // // // // // // // // //         maxX: bbox[2],
// // // // // // // // // // // // //         maxY: bbox[3],
// // // // // // // // // // // // //         featureIndex: index,
// // // // // // // // // // // // //       });
// // // // // // // // // // // // //     });
// // // // // // // // // // // // //     spatialIndexRef.current = spatialIndex;

// // // // // // // // // // // // //     return () => {
// // // // // // // // // // // // //       spatialIndexRef.current = null;
// // // // // // // // // // // // //     };
// // // // // // // // // // // // //   }, [boundaryData]);

// // // // // // // // // // // // //   const generateStaticGrid = (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
// // // // // // // // // // // // //     console.log("generateStaticGrid: Starting with geoData features:", geoData.features.length);

// // // // // // // // // // // // //     const points = geoData.features
// // // // // // // // // // // // //       .map((feature) => {
// // // // // // // // // // // // //         const centroid = turf.centroid(feature.geometry);
// // // // // // // // // // // // //         const aod = feature.properties.aod_value;
// // // // // // // // // // // // //         if (aod == null || aod <= 0 || isNaN(aod)) {
// // // // // // // // // // // // //           console.log("Skipping feature due to invalid aod_value:", feature);
// // // // // // // // // // // // //           return null;
// // // // // // // // // // // // //         }
// // // // // // // // // // // // //         return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], aod];
// // // // // // // // // // // // //       })
// // // // // // // // // // // // //       .filter((p): p is [number, number, number] => p !== null);

// // // // // // // // // // // // //     console.log("generateStaticGrid: Valid points for interpolation:", points.length, points);

// // // // // // // // // // // // //     const bbox = turf.bbox(turf.featureCollection(boundaryData.features));
// // // // // // // // // // // // //     console.log("generateStaticGrid: Bounding box:", bbox);

// // // // // // // // // // // // //     const cellSize = 0.02;
// // // // // // // // // // // // //     const grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });
// // // // // // // // // // // // //     console.log("generateStaticGrid: Grid points created:", grid.features.length);

// // // // // // // // // // // // //     let interpolated = turf.featureCollection([]);
// // // // // // // // // // // // //     if (points.length > 0) {
// // // // // // // // // // // // //       try {
// // // // // // // // // // // // //         interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { aod: p[2] }))), cellSize / 4, { gridType: "point", property: "aod", units: "degrees", weight: 2.5 });
// // // // // // // // // // // // //         console.log("generateStaticGrid: Interpolated points:", interpolated.features.length);
// // // // // // // // // // // // //       } catch (error) {
// // // // // // // // // // // // //         console.error("Interpolation error:", error);
// // // // // // // // // // // // //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // // // //       }
// // // // // // // // // // // // //     } else {
// // // // // // // // // // // // //       console.warn("generateStaticGrid: No valid points for interpolation");
// // // // // // // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //     interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];

// // // // // // // // // // // // //     const boundaryPolygon = turf.featureCollection(boundaryData.features);
// // // // // // // // // // // // //     const clipped = turf.pointsWithinPolygon(turf.featureCollection(grid.features), boundaryPolygon);
// // // // // // // // // // // // //     console.log("generateStaticGrid: Clipped points:", clipped.features.length);

// // // // // // // // // // // // //     const canvas = document.createElement("canvas");
// // // // // // // // // // // // //     const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
// // // // // // // // // // // // //     const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
// // // // // // // // // // // // //     canvas.width = width;
// // // // // // // // // // // // //     canvas.height = height;
// // // // // // // // // // // // //     const ctx = canvas.getContext("2d");

// // // // // // // // // // // // //     if (!ctx) {
// // // // // // // // // // // // //       console.error("generateStaticGrid: Failed to get canvas context");
// // // // // // // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // // // //     }

// // // // // // // // // // // // //     ctx.fillStyle = "rgba(0, 0, 0, 0)";
// // // // // // // // // // // // //     ctx.fillRect(0, 0, width, height);

// // // // // // // // // // // // //     let validPoints = 0;
// // // // // // // // // // // // //     clipped.features.forEach((feature) => {
// // // // // // // // // // // // //       const coords = feature.geometry.coordinates;
// // // // // // // // // // // // //       const point = turf.point(coords);

// // // // // // // // // // // // //       const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer));

// // // // // // // // // // // // //       let aodValue: number | null = null;
// // // // // // // // // // // // //       if (inBuffer && interpolated.features.length > 0) {
// // // // // // // // // // // // //         const closest = interpolated.features.reduce(
// // // // // // // // // // // // //           (acc, f) => {
// // // // // // // // // // // // //             const dist = turf.distance(f.geometry.coordinates, coords, { units: "degrees" });
// // // // // // // // // // // // //             return dist < acc.dist ? { dist, value: f.properties.aod } : acc;
// // // // // // // // // // // // //           },
// // // // // // // // // // // // //           { dist: Infinity, value: 0 }
// // // // // // // // // // // // //         );
// // // // // // // // // // // // //         aodValue = closest.value > 0 ? closest.value : null;
// // // // // // // // // // // // //       } else {
// // // // // // // // // // // // //         const aodFeature = geoData.features.find((f) => {
// // // // // // // // // // // // //           const polygon = f.geometry.type === "Polygon" ? turf.polygon(f.geometry.coordinates) : turf.multiPolygon(f.geometry.coordinates);
// // // // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // // // //         });
// // // // // // // // // // // // //         aodValue = aodFeature && aodFeature.properties.aod_value != null && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;
// // // // // // // // // // // // //       }

// // // // // // // // // // // // //       if (aodValue == null) return;

// // // // // // // // // // // // //       const color = interpolateColor(aodValue);
// // // // // // // // // // // // //       const x = Math.round((coords[0] - bbox[0]) / cellSize);
// // // // // // // // // // // // //       const y = Math.round((bbox[3] - coords[1]) / cellSize);
// // // // // // // // // // // // //       ctx.fillStyle = color;
// // // // // // // // // // // // //       ctx.fillRect(x, y, 1, 1);
// // // // // // // // // // // // //       validPoints++;
// // // // // // // // // // // // //     });

// // // // // // // // // // // // //     console.log("generateStaticGrid: Valid points drawn on canvas:", validPoints);

// // // // // // // // // // // // //     return { imageUrl: canvas.toDataURL(), bbox };
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   const cachedGrid = useMemo(() => {
// // // // // // // // // // // // //     if (!geoData || !boundaryData) {
// // // // // // // // // // // // //       console.warn("cachedGrid: Missing geoData or boundaryData");
// // // // // // // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //     return generateStaticGrid(geoData, boundaryData);
// // // // // // // // // // // // //   }, [geoData, boundaryData]);

// // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // //     if (!map || !geoData || !boundaryData) {
// // // // // // // // // // // // //       console.warn("useEffect: Missing map, geoData, or boundaryData");
// // // // // // // // // // // // //       return;
// // // // // // // // // // // // //     }

// // // // // // // // // // // // //     const { imageUrl, bbox } = cachedGrid;
// // // // // // // // // // // // //     console.log("useEffect: Image URL and bbox:", imageUrl, bbox);

// // // // // // // // // // // // //     if (staticLayerRef.current) {
// // // // // // // // // // // // //       map.removeLayer(staticLayerRef.current);
// // // // // // // // // // // // //       staticLayerRef.current = null;
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //     if (tooltipRef.current) {
// // // // // // // // // // // // //       tooltipRef.current.remove();
// // // // // // // // // // // // //       tooltipRef.current = null;
// // // // // // // // // // // // //     }

// // // // // // // // // // // // //     if (imageUrl) {
// // // // // // // // // // // // //       const bounds = [
// // // // // // // // // // // // //         [bbox[1], bbox[0]],
// // // // // // // // // // // // //         [bbox[3], bbox[2]],
// // // // // // // // // // // // //       ];
// // // // // // // // // // // // //       staticLayerRef.current = L.imageOverlay(imageUrl, bounds, { opacity: 0.85, interactive: true }).addTo(map);
// // // // // // // // // // // // //       console.log("useEffect: ImageOverlay added to map");
// // // // // // // // // // // // //     } else {
// // // // // // // // // // // // //       console.warn("useEffect: No valid imageUrl for ImageOverlay");
// // // // // // // // // // // // //     }

// // // // // // // // // // // // //     const handleMouseMove = (e: L.LeafletMouseEvent) => {
// // // // // // // // // // // // //       if (document.activeElement === inputRef.current) {
// // // // // // // // // // // // //         return;
// // // // // // // // // // // // //       }
// // // // // // // // // // // // //       const { lat, lng } = e.latlng;
// // // // // // // // // // // // //       if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
// // // // // // // // // // // // //         return;
// // // // // // // // // // // // //       }
// // // // // // // // // // // // //       lastPosition.current = { lat, lng };

// // // // // // // // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);

// // // // // // // // // // // // //       timeoutRef.current = setTimeout(() => {
// // // // // // // // // // // // //         if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // // // // // // // //         const point = turf.point([lng, lat]);

// // // // // // // // // // // // //         const candidates =
// // // // // // // // // // // // //           spatialIndexRef.current?.search({
// // // // // // // // // // // // //             minX: lng,
// // // // // // // // // // // // //             minY: lat,
// // // // // // // // // // // // //             maxX: lng,
// // // // // // // // // // // // //             maxY: lat,
// // // // // // // // // // // // //           }) || [];

// // // // // // // // // // // // //         const kelurahan = boundaryData.features.find((bf, index) => {
// // // // // // // // // // // // //           if (!candidates.some((c: RBushItem) => c.featureIndex === index)) return false;
// // // // // // // // // // // // //           const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
// // // // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // // // //         });

// // // // // // // // // // // // //         const aodFeature = geoData.features.find((feature) => {
// // // // // // // // // // // // //           const polygon = feature.geometry.type === "Polygon" ? turf.polygon(feature.geometry.coordinates) : turf.multiPolygon(f.geometry.coordinates);
// // // // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // // // //         });
// // // // // // // // // // // // //         const aodValue = aodFeature && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;

// // // // // // // // // // // // //         if (kelurahan?.properties) {
// // // // // // // // // // // // //           tooltipRef.current = L.tooltip({
// // // // // // // // // // // // //             sticky: true,
// // // // // // // // // // // // //             direction: "top",
// // // // // // // // // // // // //             offset: [0, -20],
// // // // // // // // // // // // //             className: styles.customTooltip,
// // // // // // // // // // // // //           })
// // // // // // // // // // // // //             .setLatLng(e.latlng)
// // // // // // // // // // // // //             .setContent(getTooltipContent(aodValue, kelurahan.properties.NAMOBJ))
// // // // // // // // // // // // //             .addTo(map);
// // // // // // // // // // // // //         }
// // // // // // // // // // // // //       }, 500);
// // // // // // // // // // // // //     };

// // // // // // // // // // // // //     map.on("mousemove", handleMouseMove);

// // // // // // // // // // // // //     return () => {
// // // // // // // // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);
// // // // // // // // // // // // //       map.off("mousemove", handleMouseMove);
// // // // // // // // // // // // //       if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // // // // // // // //       if (staticLayerRef.current) map.removeLayer(staticLayerRef.current);
// // // // // // // // // // // // //     };
// // // // // // // // // // // // //   }, [map, cachedGrid, selectedDate, inputRef, geoData, boundaryData]);

// // // // // // // // // // // // //   return (
// // // // // // // // // // // // //     <>
// // // // // // // // // // // // //       {isLoading && (
// // // // // // // // // // // // //         <div className={styles.loadingOverlay}>
// // // // // // // // // // // // //           <div className={styles.spinner}></div>
// // // // // // // // // // // // //           <span>Memuat Heatmap...</span>
// // // // // // // // // // // // //         </div>
// // // // // // // // // // // // //       )}
// // // // // // // // // // // // //       <div className={styles.legend}>
// // // // // // // // // // // // //         <h4>Legenda AOD</h4>
// // // // // // // // // // // // //         <div className={styles.gradientLegend}>
// // // // // // // // // // // // //           <div
// // // // // // // // // // // // //             className={styles.gradientBar}
// // // // // // // // // // // // //             style={{
// // // // // // // // // // // // //               background: "linear-gradient(to right, rgba(0, 255, 0, 0.85), rgba(0, 0, 255, 0.85), rgba(255, 255, 0, 0.85), rgba(255, 0, 0, 0.85))",
// // // // // // // // // // // // //             }}
// // // // // // // // // // // // //           ></div>
// // // // // // // // // // // // //           <div className={styles.gradientLabels}>
// // // // // // // // // // // // //             <span>0.0</span>
// // // // // // // // // // // // //             <span>1.0+</span>
// // // // // // // // // // // // //           </div>
// // // // // // // // // // // // //         </div>
// // // // // // // // // // // // //       </div>
// // // // // // // // // // // // //     </>
// // // // // // // // // // // // //   );
// // // // // // // // // // // // // };

// // // // // // // // // // // // // export default HeatMapLayer;

// // // // // // // // // // // // "use client";

// // // // // // // // // // // // import { useEffect, useRef, useMemo } from "react";
// // // // // // // // // // // // import { useMap } from "react-leaflet";
// // // // // // // // // // // // import L from "leaflet";
// // // // // // // // // // // // import * as turf from "@turf/turf";
// // // // // // // // // // // // import * as GeoJSON from "geojson";
// // // // // // // // // // // // import RBush from "rbush";
// // // // // // // // // // // // import styles from "./map.module.css";
// // // // // // // // // // // // import { interpolateColor } from "../../utils/color";

// // // // // // // // // // // // interface FeatureProperties {
// // // // // // // // // // // //   aod_value: number;
// // // // // // // // // // // // }

// // // // // // // // // // // // interface BoundaryProperties {
// // // // // // // // // // // //   NAMOBJ: string;
// // // // // // // // // // // // }

// // // // // // // // // // // // interface Feature {
// // // // // // // // // // // //   type: string;
// // // // // // // // // // // //   id: number;
// // // // // // // // // // // //   properties: FeatureProperties;
// // // // // // // // // // // //   geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
// // // // // // // // // // // // }

// // // // // // // // // // // // interface BoundaryFeature {
// // // // // // // // // // // //   type: string;
// // // // // // // // // // // //   properties: BoundaryProperties;
// // // // // // // // // // // //   geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
// // // // // // // // // // // // }

// // // // // // // // // // // // interface GeoJSONData {
// // // // // // // // // // // //   type: string;
// // // // // // // // // // // //   features: Feature[];
// // // // // // // // // // // // }

// // // // // // // // // // // // interface BoundaryGeoJSONData {
// // // // // // // // // // // //   type: string;
// // // // // // // // // // // //   features: BoundaryFeature[];
// // // // // // // // // // // // }

// // // // // // // // // // // // interface HeatMapLayerProps {
// // // // // // // // // // // //   geoData: GeoJSONData | null;
// // // // // // // // // // // //   boundaryData: BoundaryGeoJSONData | null;
// // // // // // // // // // // //   selectedDate: string;
// // // // // // // // // // // //   isLoading: boolean;
// // // // // // // // // // // //   inputRef: React.RefObject<HTMLInputElement>;
// // // // // // // // // // // // }

// // // // // // // // // // // // interface RBushItem {
// // // // // // // // // // // //   minX: number;
// // // // // // // // // // // //   minY: number;
// // // // // // // // // // // //   maxX: number;
// // // // // // // // // // // //   maxY: number;
// // // // // // // // // // // //   featureIndex: number;
// // // // // // // // // // // // }

// // // // // // // // // // // // interface InterpolatedFeature {
// // // // // // // // // // // //   type: string;
// // // // // // // // // // // //   geometry: GeoJSON.Point;
// // // // // // // // // // // //   properties: { aod: number };
// // // // // // // // // // // // }

// // // // // // // // // // // // const HeatMapLayer: React.FC<HeatMapLayerProps> = ({ geoData, boundaryData, selectedDate, isLoading, inputRef }) => {
// // // // // // // // // // // //   const map = useMap();
// // // // // // // // // // // //   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
// // // // // // // // // // // //   const tooltipRef = useRef<L.Tooltip | null>(null);
// // // // // // // // // // // //   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
// // // // // // // // // // // //   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
// // // // // // // // // // // //   const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);
// // // // // // // // // // // //   const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);

// // // // // // // // // // // //   const getTooltipContent = (aodValue: number | null, kelurahanName: string): string => {
// // // // // // // // // // // //     const formattedAodValue = aodValue !== null && aodValue > 0 ? aodValue.toFixed(4) : "No Data";
// // // // // // // // // // // //     const aodColor = aodValue !== null && aodValue > 0 ? interpolateColor(aodValue) : "#a0aec0";
// // // // // // // // // // // //     const textColor = aodColor === "rgba(0, 255, 0, 0.85)" || aodColor === "rgba(255, 255, 0, 0.85)" ? "#000000" : "#ffffff";
// // // // // // // // // // // //     return `
// // // // // // // // // // // //       <div class="${styles.customTooltip}">
// // // // // // // // // // // //         <div class="${styles.kelurahanName}">${kelurahanName}</div>
// // // // // // // // // // // //         <div class="${styles.aodContainer}">
// // // // // // // // // // // //           <div class="${styles.aodCircle}" style="background-color: ${aodColor}; color: ${textColor}">
// // // // // // // // // // // //             ${formattedAodValue}
// // // // // // // // // // // //           </div>
// // // // // // // // // // // //         </div>
// // // // // // // // // // // //       </div>
// // // // // // // // // // // //     `;
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const cachedBoundaries = useMemo(() => {
// // // // // // // // // // // //     if (!geoData) return turf.featureCollection([]);
// // // // // // // // // // // //     const validFeatures = geoData.features
// // // // // // // // // // // //       .filter((f) => f.properties.aod_value != null && f.properties.aod_value > 0)
// // // // // // // // // // // //       .map((feature) => turf.buffer(feature.geometry, 0.002, { units: "degrees" }))
// // // // // // // // // // // //       .filter((f): f is GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> => f != null);
// // // // // // // // // // // //     return turf.featureCollection(validFeatures);
// // // // // // // // // // // //   }, [geoData]);

// // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // //     if (!boundaryData) return;
// // // // // // // // // // // //     const spatialIndex = new RBush<RBushItem>();
// // // // // // // // // // // //     boundaryData.features.forEach((feature, index) => {
// // // // // // // // // // // //       const bbox = turf.bbox(feature.geometry);
// // // // // // // // // // // //       spatialIndex.insert({
// // // // // // // // // // // //         minX: bbox[0],
// // // // // // // // // // // //         minY: bbox[1],
// // // // // // // // // // // //         maxX: bbox[2],
// // // // // // // // // // // //         maxY: bbox[3],
// // // // // // // // // // // //         featureIndex: index,
// // // // // // // // // // // //       });
// // // // // // // // // // // //     });
// // // // // // // // // // // //     spatialIndexRef.current = spatialIndex;

// // // // // // // // // // // //     return () => {
// // // // // // // // // // // //       spatialIndexRef.current = null;
// // // // // // // // // // // //     };
// // // // // // // // // // // //   }, [boundaryData]);

// // // // // // // // // // // //   const generateStaticGrid = (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
// // // // // // // // // // // //     console.log("generateStaticGrid: Starting with geoData features:", geoData.features.length);

// // // // // // // // // // // //     const points = geoData.features
// // // // // // // // // // // //       .map((feature) => {
// // // // // // // // // // // //         const centroid = turf.centroid(feature.geometry);
// // // // // // // // // // // //         const aod = feature.properties.aod_value;
// // // // // // // // // // // //         if (aod == null || aod <= 0 || isNaN(aod)) {
// // // // // // // // // // // //           console.log("Skipping feature due to invalid aod_value:", feature);
// // // // // // // // // // // //           return null;
// // // // // // // // // // // //         }
// // // // // // // // // // // //         return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], aod];
// // // // // // // // // // // //       })
// // // // // // // // // // // //       .filter((p): p is [number, number, number] => p !== null);

// // // // // // // // // // // //     console.log("generateStaticGrid: Valid points for interpolation:", points.length, points);

// // // // // // // // // // // //     const bbox = turf.bbox(turf.featureCollection(boundaryData.features));
// // // // // // // // // // // //     console.log("generateStaticGrid: Bounding box:", bbox);

// // // // // // // // // // // //     const cellSize = 0.02;
// // // // // // // // // // // //     const grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });
// // // // // // // // // // // //     console.log("generateStaticGrid: Grid points created:", grid.features.length);

// // // // // // // // // // // //     let interpolated = turf.featureCollection([]);
// // // // // // // // // // // //     if (points.length > 0) {
// // // // // // // // // // // //       try {
// // // // // // // // // // // //         interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { aod: p[2] }))), cellSize / 4, { gridType: "point", property: "aod", units: "degrees", weight: 2.5 });
// // // // // // // // // // // //         console.log("generateStaticGrid: Interpolated points:", interpolated.features.length);
// // // // // // // // // // // //       } catch (error) {
// // // // // // // // // // // //         console.error("Interpolation error:", error);
// // // // // // // // // // // //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // // //       }
// // // // // // // // // // // //     } else {
// // // // // // // // // // // //       console.warn("generateStaticGrid: No valid points for interpolation");
// // // // // // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // // //     }
// // // // // // // // // // // //     interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];

// // // // // // // // // // // //     const boundaryPolygon = turf.featureCollection(boundaryData.features);
// // // // // // // // // // // //     const clipped = turf.pointsWithinPolygon(turf.featureCollection(grid.features), boundaryPolygon);
// // // // // // // // // // // //     console.log("generateStaticGrid: Clipped points:", clipped.features.length);

// // // // // // // // // // // //     const canvas = document.createElement("canvas");
// // // // // // // // // // // //     const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
// // // // // // // // // // // //     const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
// // // // // // // // // // // //     canvas.width = width;
// // // // // // // // // // // //     canvas.height = height;
// // // // // // // // // // // //     const ctx = canvas.getContext("2d");

// // // // // // // // // // // //     if (!ctx) {
// // // // // // // // // // // //       console.error("generateStaticGrid: Failed to get canvas context");
// // // // // // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // // //     }

// // // // // // // // // // // //     ctx.fillStyle = "rgba(0, 0, 0, 0)";
// // // // // // // // // // // //     ctx.fillRect(0, 0, width, height);

// // // // // // // // // // // //     let validPoints = 0;
// // // // // // // // // // // //     clipped.features.forEach((feature) => {
// // // // // // // // // // // //       const coords = feature.geometry.coordinates;
// // // // // // // // // // // //       const point = turf.point(coords);

// // // // // // // // // // // //       const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer));

// // // // // // // // // // // //       let aodValue: number | null = null;
// // // // // // // // // // // //       if (inBuffer && interpolated.features.length > 0) {
// // // // // // // // // // // //         const closest = interpolated.features.reduce(
// // // // // // // // // // // //           (acc, f) => {
// // // // // // // // // // // //             const dist = turf.distance(f.geometry.coordinates, coords, { units: "degrees" });
// // // // // // // // // // // //             return dist < acc.dist ? { dist, value: f.properties.aod } : acc;
// // // // // // // // // // // //           },
// // // // // // // // // // // //           { dist: Infinity, value: 0 }
// // // // // // // // // // // //         );
// // // // // // // // // // // //         aodValue = closest.value > 0 ? closest.value : null;
// // // // // // // // // // // //       } else {
// // // // // // // // // // // //         const aodFeature = geoData.features.find((f) => {
// // // // // // // // // // // //           const polygon = f.geometry.type === "Polygon" ? turf.polygon(f.geometry.coordinates) : turf.multiPolygon(f.geometry.coordinates);
// // // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // // //         });
// // // // // // // // // // // //         aodValue = aodFeature && aodFeature.properties.aod_value != null && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;
// // // // // // // // // // // //       }

// // // // // // // // // // // //       if (aodValue == null) return;

// // // // // // // // // // // //       const color = interpolateColor(aodValue);
// // // // // // // // // // // //       const x = Math.round((coords[0] - bbox[0]) / cellSize);
// // // // // // // // // // // //       const y = Math.round((bbox[3] - coords[1]) / cellSize);
// // // // // // // // // // // //       ctx.fillStyle = color;
// // // // // // // // // // // //       ctx.fillRect(x, y, 1, 1);
// // // // // // // // // // // //       validPoints++;
// // // // // // // // // // // //     });

// // // // // // // // // // // //     console.log("generateStaticGrid: Valid points drawn on canvas:", validPoints);

// // // // // // // // // // // //     return { imageUrl: canvas.toDataURL(), bbox };
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const cachedGrid = useMemo(() => {
// // // // // // // // // // // //     if (!geoData || !boundaryData) {
// // // // // // // // // // // //       console.warn("cachedGrid: Missing geoData or boundaryData");
// // // // // // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // // //     }
// // // // // // // // // // // //     return generateStaticGrid(geoData, boundaryData);
// // // // // // // // // // // //   }, [geoData, boundaryData]);

// // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // //     if (!map || !geoData || !boundaryData) {
// // // // // // // // // // // //       console.warn("useEffect: Missing map, geoData, or boundaryData");
// // // // // // // // // // // //       return;
// // // // // // // // // // // //     }

// // // // // // // // // // // //     const { imageUrl, bbox } = cachedGrid;
// // // // // // // // // // // //     console.log("useEffect: Image URL and bbox:", imageUrl, bbox);

// // // // // // // // // // // //     if (staticLayerRef.current) {
// // // // // // // // // // // //       map.removeLayer(staticLayerRef.current);
// // // // // // // // // // // //       staticLayerRef.current = null;
// // // // // // // // // // // //     }
// // // // // // // // // // // //     if (tooltipRef.current) {
// // // // // // // // // // // //       tooltipRef.current.remove();
// // // // // // // // // // // //       tooltipRef.current = null;
// // // // // // // // // // // //     }

// // // // // // // // // // // //     if (imageUrl) {
// // // // // // // // // // // //       const bounds = [
// // // // // // // // // // // //         [bbox[1], bbox[0]],
// // // // // // // // // // // //         [bbox[3], bbox[2]],
// // // // // // // // // // // //       ];
// // // // // // // // // // // //       staticLayerRef.current = L.imageOverlay(imageUrl, bounds, { opacity: 0.85, interactive: true }).addTo(map);
// // // // // // // // // // // //       console.log("useEffect: ImageOverlay added to map");
// // // // // // // // // // // //     } else {
// // // // // // // // // // // //       console.warn("useEffect: No valid imageUrl for ImageOverlay");
// // // // // // // // // // // //     }

// // // // // // // // // // // //     const handleMouseMove = (e: L.LeafletMouseEvent) => {
// // // // // // // // // // // //       if (document.activeElement === inputRef.current) {
// // // // // // // // // // // //         return;
// // // // // // // // // // // //       }
// // // // // // // // // // // //       const { lat, lng } = e.latlng;
// // // // // // // // // // // //       if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
// // // // // // // // // // // //         return;
// // // // // // // // // // // //       }
// // // // // // // // // // // //       lastPosition.current = { lat, lng };

// // // // // // // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);

// // // // // // // // // // // //       timeoutRef.current = setTimeout(() => {
// // // // // // // // // // // //         if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // // // // // // //         const point = turf.point([lng, lat]);

// // // // // // // // // // // //         const candidates =
// // // // // // // // // // // //           spatialIndexRef.current?.search({
// // // // // // // // // // // //             minX: lng,
// // // // // // // // // // // //             minY: lat,
// // // // // // // // // // // //             maxX: lng,
// // // // // // // // // // // //             maxY: lat,
// // // // // // // // // // // //           }) || [];

// // // // // // // // // // // //         const kelurahan = boundaryData.features.find((bf, index) => {
// // // // // // // // // // // //           if (!candidates.some((c: RBushItem) => c.featureIndex === index)) return false;
// // // // // // // // // // // //           const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
// // // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // // //         });

// // // // // // // // // // // //         const aodFeature = geoData.features.find((feature) => {
// // // // // // // // // // // //           const polygon = feature.geometry.type === "Polygon" ? turf.polygon(feature.geometry.coordinates) : turf.multiPolygon(f.geometry.coordinates);
// // // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // // //         });
// // // // // // // // // // // //         const aodValue = aodFeature && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;

// // // // // // // // // // // //         if (kelurahan?.properties) {
// // // // // // // // // // // //           tooltipRef.current = L.tooltip({
// // // // // // // // // // // //             sticky: true,
// // // // // // // // // // // //             direction: "top",
// // // // // // // // // // // //             offset: [0, -20],
// // // // // // // // // // // //             className: styles.customTooltip,
// // // // // // // // // // // //           })
// // // // // // // // // // // //             .setLatLng(e.latlng)
// // // // // // // // // // // //             .setContent(getTooltipContent(aodValue, kelurahan.properties.NAMOBJ))
// // // // // // // // // // // //             .addTo(map);
// // // // // // // // // // // //         }
// // // // // // // // // // // //       }, 500);
// // // // // // // // // // // //     };

// // // // // // // // // // // //     map.on("mousemove", handleMouseMove);

// // // // // // // // // // // //     return () => {
// // // // // // // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);
// // // // // // // // // // // //       map.off("mousemove", handleMouseMove);
// // // // // // // // // // // //       if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // // // // // // //       if (staticLayerRef.current) map.removeLayer(staticLayerRef.current);
// // // // // // // // // // // //     };
// // // // // // // // // // // //   }, [map, cachedGrid, selectedDate, inputRef, geoData, boundaryData]);

// // // // // // // // // // // //   return (
// // // // // // // // // // // //     <>
// // // // // // // // // // // //       {isLoading && (
// // // // // // // // // // // //         <div className={styles.loadingOverlay}>
// // // // // // // // // // // //           <div className={styles.spinner}></div>
// // // // // // // // // // // //           <span>Memuat Heatmap...</span>
// // // // // // // // // // // //         </div>
// // // // // // // // // // // //       )}
// // // // // // // // // // // //       <div className={styles.legend}>
// // // // // // // // // // // //         <h4>Legenda AOD</h4>
// // // // // // // // // // // //         <div className={styles.gradientLegend}>
// // // // // // // // // // // //           <div
// // // // // // // // // // // //             className={styles.gradientBar}
// // // // // // // // // // // //             style={{
// // // // // // // // // // // //               background: "linear-gradient(to right, rgba(0, 255, 0, 0.85), rgba(0, 0, 255, 0.85), rgba(255, 255, 0, 0.85), rgba(255, 0, 0, 0.85))",
// // // // // // // // // // // //             }}
// // // // // // // // // // // //           ></div>
// // // // // // // // // // // //           <div className={styles.gradientLabels}>
// // // // // // // // // // // //             <span>0.0</span>
// // // // // // // // // // // //             <span>1.0+</span>
// // // // // // // // // // // //           </div>
// // // // // // // // // // // //         </div>
// // // // // // // // // // // //       </div>
// // // // // // // // // // // //     </>
// // // // // // // // // // // //   );
// // // // // // // // // // // // };

// // // // // // // // // // // // export default HeatMapLayer;

// // // // // // // // // // // "use client";

// // // // // // // // // // // import { useEffect, useRef, useMemo } from "react";
// // // // // // // // // // // import { useMap } from "react-leaflet";
// // // // // // // // // // // import L from "leaflet";
// // // // // // // // // // // import * as turf from "@turf/turf";
// // // // // // // // // // // import RBush from "rbush";
// // // // // // // // // // // import styles from "./map.module.css";
// // // // // // // // // // // import { interpolateColor } from "../../utils/color";
// // // // // // // // // // // import { GeoJSONData, BoundaryGeoJSONData, Feature, BoundaryFeature } from "./types";

// // // // // // // // // // // interface HeatMapLayerProps {
// // // // // // // // // // //   geoData: GeoJSONData | null;
// // // // // // // // // // //   boundaryData: BoundaryGeoJSONData | null;
// // // // // // // // // // //   selectedDate: string;
// // // // // // // // // // //   isLoading: boolean;
// // // // // // // // // // //   inputRef: React.RefObject<HTMLInputElement>;
// // // // // // // // // // // }

// // // // // // // // // // // interface RBushItem {
// // // // // // // // // // //   minX: number;
// // // // // // // // // // //   minY: number;
// // // // // // // // // // //   maxX: number;
// // // // // // // // // // //   maxY: number;
// // // // // // // // // // //   featureIndex: number;
// // // // // // // // // // // }

// // // // // // // // // // // interface InterpolatedFeature {
// // // // // // // // // // //   type: "Feature";
// // // // // // // // // // //   geometry: GeoJSON.Point;
// // // // // // // // // // //   properties: { aod: number };
// // // // // // // // // // // }

// // // // // // // // // // // const HeatMapLayer: React.FC<HeatMapLayerProps> = ({ geoData, boundaryData, selectedDate, isLoading, inputRef }) => {
// // // // // // // // // // //   const map = useMap();
// // // // // // // // // // //   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
// // // // // // // // // // //   const tooltipRef = useRef<L.Tooltip | null>(null);
// // // // // // // // // // //   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
// // // // // // // // // // //   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
// // // // // // // // // // //   const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);
// // // // // // // // // // //   const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);

// // // // // // // // // // //   const getTooltipContent = (aodValue: number | null, kelurahanName: string): string => {
// // // // // // // // // // //     const formattedAodValue = aodValue !== null && aodValue > 0 ? aodValue.toFixed(4) : "No Data";
// // // // // // // // // // //     const aodColor = aodValue !== null && aodValue > 0 ? interpolateColor(aodValue) : "#a0aec0";
// // // // // // // // // // //     const textColor = aodColor === "rgba(0, 255, 0, 0.85)" || aodColor === "rgba(255, 255, 0, 0.85)" ? "#000000" : "#ffffff";
// // // // // // // // // // //     return `
// // // // // // // // // // //       <div class="${styles.customTooltip}">
// // // // // // // // // // //         <div class="${styles.kelurahanName}">${kelurahanName}</div>
// // // // // // // // // // //         <div class="${styles.aodContainer}">
// // // // // // // // // // //           <div class="${styles.aodCircle}" style="background-color: ${aodColor}; color: ${textColor}">
// // // // // // // // // // //             ${formattedAodValue}
// // // // // // // // // // //           </div>
// // // // // // // // // // //         </div>
// // // // // // // // // // //       </div>
// // // // // // // // // // //     `;
// // // // // // // // // // //   };

// // // // // // // // // // //   const cachedBoundaries = useMemo(() => {
// // // // // // // // // // //     if (!geoData) return turf.featureCollection([]);
// // // // // // // // // // //     const validFeatures = geoData.features
// // // // // // // // // // //       .filter((f) => f.properties.aod_value != null && f.properties.aod_value > 0)
// // // // // // // // // // //       .map((feature) => turf.buffer(feature.geometry, 0.002, { units: "degrees" }))
// // // // // // // // // // //       .filter((f): f is GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> => f != null);
// // // // // // // // // // //     return turf.featureCollection(validFeatures);
// // // // // // // // // // //   }, [geoData]);

// // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // //     if (!boundaryData) return;
// // // // // // // // // // //     const spatialIndex = new RBush<RBushItem>();
// // // // // // // // // // //     boundaryData.features.forEach((feature, index) => {
// // // // // // // // // // //       const bbox = turf.bbox(feature.geometry);
// // // // // // // // // // //       spatialIndex.insert({
// // // // // // // // // // //         minX: bbox[0],
// // // // // // // // // // //         minY: bbox[1],
// // // // // // // // // // //         maxX: bbox[2],
// // // // // // // // // // //         maxY: bbox[3],
// // // // // // // // // // //         featureIndex: index,
// // // // // // // // // // //       });
// // // // // // // // // // //     });
// // // // // // // // // // //     spatialIndexRef.current = spatialIndex;

// // // // // // // // // // //     return () => {
// // // // // // // // // // //       spatialIndexRef.current = null;
// // // // // // // // // // //     };
// // // // // // // // // // //   }, [boundaryData]);

// // // // // // // // // // //   const generateStaticGrid = (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
// // // // // // // // // // //     console.log("generateStaticGrid: Starting with geoData features:", geoData.features.length);

// // // // // // // // // // //     if (!boundaryData || !boundaryData.features) {
// // // // // // // // // // //       console.warn("generateStaticGrid: boundaryData is null or has no features");
// // // // // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // //     }

// // // // // // // // // // //     const points = geoData.features
// // // // // // // // // // //       .map((feature) => {
// // // // // // // // // // //         const centroid = turf.centroid(feature.geometry);
// // // // // // // // // // //         const aod = feature.properties.aod_value;
// // // // // // // // // // //         if (aod == null || aod <= 0 || isNaN(aod)) {
// // // // // // // // // // //           console.log("Skipping feature due to invalid aod_value:", feature);
// // // // // // // // // // //           return null;
// // // // // // // // // // //         }
// // // // // // // // // // //         return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], aod];
// // // // // // // // // // //       })
// // // // // // // // // // //       .filter((p): p is [number, number, number] => p !== null);

// // // // // // // // // // //     console.log("generateStaticGrid: Valid points for interpolation:", points.length, points);

// // // // // // // // // // //     const bbox = turf.bbox(turf.featureCollection(boundaryData.features));
// // // // // // // // // // //     console.log("generateStaticGrid: Bounding box:", bbox);

// // // // // // // // // // //     const cellSize = 0.02;
// // // // // // // // // // //     const grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });
// // // // // // // // // // //     console.log("generateStaticGrid: Grid points created:", grid.features.length);

// // // // // // // // // // //     let interpolated = turf.featureCollection([]);
// // // // // // // // // // //     if (points.length > 0) {
// // // // // // // // // // //       try {
// // // // // // // // // // //         interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { aod: p[2] }))), cellSize / 4, { gridType: "point", property: "aod", units: "degrees", weight: 2.5 });
// // // // // // // // // // //         console.log("generateStaticGrid: Interpolated points:", interpolated.features.length);
// // // // // // // // // // //       } catch (error) {
// // // // // // // // // // //         console.error("Interpolation error:", error);
// // // // // // // // // // //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // //       }
// // // // // // // // // // //     } else {
// // // // // // // // // // //       console.warn("generateStaticGrid: No valid points for interpolation");
// // // // // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // //     }
// // // // // // // // // // //     interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];

// // // // // // // // // // //     const boundaryPolygon = turf.featureCollection(boundaryData.features);
// // // // // // // // // // //     const clipped = turf.pointsWithinPolygon(turf.featureCollection(grid.features), boundaryPolygon);
// // // // // // // // // // //     console.log("generateStaticGrid: Clipped points:", clipped.features.length);

// // // // // // // // // // //     const canvas = document.createElement("canvas");
// // // // // // // // // // //     const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
// // // // // // // // // // //     const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
// // // // // // // // // // //     canvas.width = width;
// // // // // // // // // // //     canvas.height = height;
// // // // // // // // // // //     const ctx = canvas.getContext("2d");

// // // // // // // // // // //     if (!ctx) {
// // // // // // // // // // //       console.error("generateStaticGrid: Failed to get canvas context");
// // // // // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // //     }

// // // // // // // // // // //     ctx.fillStyle = "rgba(0, 0, 0, 0)";
// // // // // // // // // // //     ctx.fillRect(0, 0, width, height);

// // // // // // // // // // //     let validPoints = 0;
// // // // // // // // // // //     clipped.features.forEach((feature) => {
// // // // // // // // // // //       const coords = feature.geometry.coordinates;
// // // // // // // // // // //       const point = turf.point(coords);

// // // // // // // // // // //       const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer));

// // // // // // // // // // //       let aodValue: number | null = null;
// // // // // // // // // // //       if (inBuffer && interpolated.features.length > 0) {
// // // // // // // // // // //         const closest = interpolated.features.reduce(
// // // // // // // // // // //           (acc, f) => {
// // // // // // // // // // //             const dist = turf.distance(f.geometry.coordinates, coords, { units: "degrees" });
// // // // // // // // // // //             return dist < acc.dist ? { dist, value: f.properties.aod } : acc;
// // // // // // // // // // //           },
// // // // // // // // // // //           { dist: Infinity, value: 0 }
// // // // // // // // // // //         );
// // // // // // // // // // //         aodValue = closest.value > 0 ? closest.value : null;
// // // // // // // // // // //       } else {
// // // // // // // // // // //         const aodFeature = geoData.features.find((f) => {
// // // // // // // // // // //           const polygon = f.geometry.type === "Polygon" ? turf.polygon(f.geometry.coordinates) : turf.multiPolygon(f.geometry.coordinates);
// // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // //         });
// // // // // // // // // // //         aodValue = aodFeature && aodFeature.properties.aod_value != null && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;
// // // // // // // // // // //       }

// // // // // // // // // // //       if (aodValue == null) return;

// // // // // // // // // // //       const color = interpolateColor(aodValue);
// // // // // // // // // // //       const x = Math.round((coords[0] - bbox[0]) / cellSize);
// // // // // // // // // // //       const y = Math.round((bbox[3] - coords[1]) / cellSize);
// // // // // // // // // // //       ctx.fillStyle = color;
// // // // // // // // // // //       ctx.fillRect(x, y, 1, 1);
// // // // // // // // // // //       validPoints++;
// // // // // // // // // // //     });

// // // // // // // // // // //     console.log("generateStaticGrid: Valid points drawn on canvas:", validPoints);

// // // // // // // // // // //     return { imageUrl: canvas.toDataURL(), bbox };
// // // // // // // // // // //   };

// // // // // // // // // // //   const cachedGrid = useMemo(() => {
// // // // // // // // // // //     if (!geoData || !boundaryData) {
// // // // // // // // // // //       console.warn("cachedGrid: Missing geoData or boundaryData");
// // // // // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // // //     }
// // // // // // // // // // //     return generateStaticGrid(geoData, boundaryData);
// // // // // // // // // // //   }, [geoData, boundaryData]);

// // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // //     if (!map || !geoData || !boundaryData) {
// // // // // // // // // // //       console.warn("useEffect: Missing map, geoData, or boundaryData");
// // // // // // // // // // //       return;
// // // // // // // // // // //     }

// // // // // // // // // // //     const { imageUrl, bbox } = cachedGrid;
// // // // // // // // // // //     console.log("useEffect: Image URL and bbox:", imageUrl, bbox);

// // // // // // // // // // //     if (staticLayerRef.current) {
// // // // // // // // // // //       map.removeLayer(staticLayerRef.current);
// // // // // // // // // // //       staticLayerRef.current = null;
// // // // // // // // // // //     }
// // // // // // // // // // //     if (tooltipRef.current) {
// // // // // // // // // // //       tooltipRef.current.remove();
// // // // // // // // // // //       tooltipRef.current = null;
// // // // // // // // // // //     }

// // // // // // // // // // //     if (imageUrl) {
// // // // // // // // // // //       const bounds = [
// // // // // // // // // // //         [bbox[1], bbox[0]],
// // // // // // // // // // //         [bbox[3], bbox[2]],
// // // // // // // // // // //       ];
// // // // // // // // // // //       staticLayerRef.current = L.imageOverlay(imageUrl, bounds, { opacity: 0.85, interactive: true }).addTo(map);
// // // // // // // // // // //       console.log("useEffect: ImageOverlay added to map");
// // // // // // // // // // //     } else {
// // // // // // // // // // //       console.warn("useEffect: No valid imageUrl for ImageOverlay");
// // // // // // // // // // //     }

// // // // // // // // // // //     const handleMouseMove = (e: L.LeafletMouseEvent) => {
// // // // // // // // // // //       if (document.activeElement === inputRef.current) {
// // // // // // // // // // //         return;
// // // // // // // // // // //       }
// // // // // // // // // // //       const { lat, lng } = e.latlng;
// // // // // // // // // // //       if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
// // // // // // // // // // //         return;
// // // // // // // // // // //       }
// // // // // // // // // // //       lastPosition.current = { lat, lng };

// // // // // // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);

// // // // // // // // // // //       timeoutRef.current = setTimeout(() => {
// // // // // // // // // // //         if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // // // // // //         const point = turf.point([lng, lat]);

// // // // // // // // // // //         const candidates =
// // // // // // // // // // //           spatialIndexRef.current?.search({
// // // // // // // // // // //             minX: lng,
// // // // // // // // // // //             minY: lat,
// // // // // // // // // // //             maxX: lng,
// // // // // // // // // // //             maxY: lat,
// // // // // // // // // // //           }) || [];

// // // // // // // // // // //         const kelurahan = boundaryData.features.find((bf, index) => {
// // // // // // // // // // //           if (!candidates.some((c: RBushItem) => c.featureIndex === index)) return false;
// // // // // // // // // // //           const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
// // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // //         });

// // // // // // // // // // //         const aodFeature = geoData.features.find((feature) => {
// // // // // // // // // // //           const polygon = feature.geometry.type === "Polygon" ? turf.polygon(feature.geometry.coordinates) : turf.multiPolygon(feature.geometry.coordinates);
// // // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // // //         });
// // // // // // // // // // //         const aodValue = aodFeature && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;

// // // // // // // // // // //         if (kelurahan?.properties) {
// // // // // // // // // // //           tooltipRef.current = L.tooltip({
// // // // // // // // // // //             sticky: true,
// // // // // // // // // // //             direction: "top",
// // // // // // // // // // //             offset: [0, -20],
// // // // // // // // // // //             className: styles.customTooltip,
// // // // // // // // // // //           })
// // // // // // // // // // //             .setLatLng(e.latlng)
// // // // // // // // // // //             .setContent(getTooltipContent(aodValue, kelurahan.properties.NAMOBJ))
// // // // // // // // // // //             .addTo(map);
// // // // // // // // // // //         }
// // // // // // // // // // //       }, 500);
// // // // // // // // // // //     };

// // // // // // // // // // //     map.on("mousemove", handleMouseMove);

// // // // // // // // // // //     return () => {
// // // // // // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);
// // // // // // // // // // //       map.off("mousemove", handleMouseMove);
// // // // // // // // // // //       if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // // // // // //       if (staticLayerRef.current) map.removeLayer(staticLayerRef.current);
// // // // // // // // // // //     };
// // // // // // // // // // //   }, [map, cachedGrid, selectedDate, inputRef, geoData, boundaryData]);

// // // // // // // // // // //   return (
// // // // // // // // // // //     <>
// // // // // // // // // // //       {isLoading && (
// // // // // // // // // // //         <div className={styles.loadingOverlay}>
// // // // // // // // // // //           <div className={styles.spinner}></div>
// // // // // // // // // // //           <span>Memuat Heatmap...</span>
// // // // // // // // // // //         </div>
// // // // // // // // // // //       )}
// // // // // // // // // // //       <div className={styles.legend}>
// // // // // // // // // // //         <h4>Legenda AOD</h4>
// // // // // // // // // // //         <div className={styles.gradientLegend}>
// // // // // // // // // // //           <div
// // // // // // // // // // //             className={styles.gradientBar}
// // // // // // // // // // //             style={{
// // // // // // // // // // //               background: "linear-gradient(to right, rgba(0, 255, 0, 0.85), rgba(0, 0, 255, 0.85), rgba(255, 255, 0, 0.85), rgba(255, 0, 0, 0.85))",
// // // // // // // // // // //             }}
// // // // // // // // // // //           ></div>
// // // // // // // // // // //           <div className={styles.gradientLabels}>
// // // // // // // // // // //             <span>0.0</span>
// // // // // // // // // // //             <span>1.0+</span>
// // // // // // // // // // //           </div>
// // // // // // // // // // //         </div>
// // // // // // // // // // //       </div>
// // // // // // // // // // //     </>
// // // // // // // // // // //   );
// // // // // // // // // // // };

// // // // // // // // // // // export default HeatMapLayer;

// // // // // // // // // // "use client";

// // // // // // // // // // import { useEffect, useRef, useMemo } from "react";
// // // // // // // // // // import { useMap } from "react-leaflet";
// // // // // // // // // // import L from "leaflet";
// // // // // // // // // // import * as turf from "@turf/turf";
// // // // // // // // // // import RBush from "rbush";
// // // // // // // // // // import styles from "./map.module.css";
// // // // // // // // // // import { interpolateColor } from "../../utils/color";
// // // // // // // // // // import { GeoJSONData, BoundaryGeoJSONData, Feature, BoundaryFeature } from "./types";

// // // // // // // // // // interface HeatMapLayerProps {
// // // // // // // // // //   geoData: GeoJSONData | null;
// // // // // // // // // //   boundaryData: BoundaryGeoJSONData | null;
// // // // // // // // // //   selectedDate: string;
// // // // // // // // // //   isLoading: boolean;
// // // // // // // // // //   inputRef: React.RefObject<HTMLInputElement>;
// // // // // // // // // // }

// // // // // // // // // // interface RBushItem {
// // // // // // // // // //   minX: number;
// // // // // // // // // //   minY: number;
// // // // // // // // // //   maxX: number;
// // // // // // // // // //   maxY: number;
// // // // // // // // // //   featureIndex: number;
// // // // // // // // // // }

// // // // // // // // // // interface InterpolatedFeature {
// // // // // // // // // //   type: "Feature";
// // // // // // // // // //   geometry: GeoJSON.Point;
// // // // // // // // // //   properties: { aod: number };
// // // // // // // // // // }

// // // // // // // // // // const HeatMapLayer: React.FC<HeatMapLayerProps> = ({ geoData, boundaryData, selectedDate, isLoading, inputRef }) => {
// // // // // // // // // //   const map = useMap();
// // // // // // // // // //   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
// // // // // // // // // //   const tooltipRef = useRef<L.Tooltip | null>(null);
// // // // // // // // // //   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
// // // // // // // // // //   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
// // // // // // // // // //   const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);
// // // // // // // // // //   const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);

// // // // // // // // // //   const getTooltipContent = (aodValue: number | null, kelurahanName: string): string => {
// // // // // // // // // //     const formattedAodValue = aodValue !== null && aodValue > 0 ? aodValue.toFixed(4) : "No Data";
// // // // // // // // // //     const aodColor = aodValue !== null && aodValue > 0 ? interpolateColor(aodValue) : "#a0aec0";
// // // // // // // // // //     const textColor = aodColor === "rgba(0, 255, 0, 0.85)" || aodColor === "rgba(255, 255, 0, 0.85)" ? "#000000" : "#ffffff";
// // // // // // // // // //     return `
// // // // // // // // // //       <div class="${styles.customTooltip}">
// // // // // // // // // //         <div class="${styles.kelurahanName}">${kelurahanName}</div>
// // // // // // // // // //         <div class="${styles.aodContainer}">
// // // // // // // // // //           <div class="${styles.aodCircle}" style="background-color: ${aodColor}; color: ${textColor}">
// // // // // // // // // //             ${formattedAodValue}
// // // // // // // // // //           </div>
// // // // // // // // // //         </div>
// // // // // // // // // //       </div>
// // // // // // // // // //     `;
// // // // // // // // // //   };

// // // // // // // // // //   const cachedBoundaries = useMemo(() => {
// // // // // // // // // //     if (!geoData) return turf.featureCollection([]);
// // // // // // // // // //     const validFeatures = geoData.features
// // // // // // // // // //       .filter((f) => f.properties.aod_value != null && f.properties.aod_value > 0)
// // // // // // // // // //       .map((feature) => turf.buffer(feature.geometry, 0.002, { units: "degrees" }))
// // // // // // // // // //       .filter((f): f is GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> => f != null);
// // // // // // // // // //     return turf.featureCollection(validFeatures);
// // // // // // // // // //   }, [geoData]);

// // // // // // // // // //   useEffect(() => {
// // // // // // // // // //     if (!boundaryData) return;
// // // // // // // // // //     const spatialIndex = new RBush<RBushItem>();
// // // // // // // // // //     boundaryData.features.forEach((feature, index) => {
// // // // // // // // // //       const bbox = turf.bbox(feature.geometry);
// // // // // // // // // //       spatialIndex.insert({
// // // // // // // // // //         minX: bbox[0],
// // // // // // // // // //         minY: bbox[1],
// // // // // // // // // //         maxX: bbox[2],
// // // // // // // // // //         maxY: bbox[3],
// // // // // // // // // //         featureIndex: index,
// // // // // // // // // //       });
// // // // // // // // // //     });
// // // // // // // // // //     spatialIndexRef.current = spatialIndex;

// // // // // // // // // //     return () => {
// // // // // // // // // //       spatialIndexRef.current = null;
// // // // // // // // // //     };
// // // // // // // // // //   }, [boundaryData]);

// // // // // // // // // //   const generateStaticGrid = (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
// // // // // // // // // //     console.log("generateStaticGrid: Starting with geoData features:", geoData.features.length);

// // // // // // // // // //     if (!boundaryData || !boundaryData.features) {
// // // // // // // // // //       console.warn("generateStaticGrid: boundaryData is null or has no features");
// // // // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // //     }

// // // // // // // // // //     const points = geoData.features
// // // // // // // // // //       .map((feature) => {
// // // // // // // // // //         const centroid = turf.centroid(feature.geometry);
// // // // // // // // // //         const aod = feature.properties.aod_value;
// // // // // // // // // //         if (aod == null || aod <= 0 || isNaN(aod)) {
// // // // // // // // // //           console.log("Skipping feature due to invalid aod_value:", feature);
// // // // // // // // // //           return null;
// // // // // // // // // //         }
// // // // // // // // // //         return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], aod];
// // // // // // // // // //       })
// // // // // // // // // //       .filter((p): p is [number, number, number] => p !== null);

// // // // // // // // // //     console.log("generateStaticGrid: Valid points for interpolation:", points.length, points);

// // // // // // // // // //     const bbox = turf.bbox(turf.featureCollection(boundaryData.features));
// // // // // // // // // //     console.log("generateStaticGrid: Bounding box:", bbox);

// // // // // // // // // //     const cellSize = 0.02;
// // // // // // // // // //     const grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });
// // // // // // // // // //     console.log("generateStaticGrid: Grid points created:", grid.features.length);

// // // // // // // // // //     let interpolated = turf.featureCollection([]);
// // // // // // // // // //     if (points.length > 0) {
// // // // // // // // // //       try {
// // // // // // // // // //         interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { aod: p[2] }))), cellSize / 4, { gridType: "point", property: "aod", units: "degrees", weight: 2.5 });
// // // // // // // // // //         console.log("generateStaticGrid: Interpolated points:", interpolated.features.length);
// // // // // // // // // //       } catch (error) {
// // // // // // // // // //         console.error("Interpolation error:", error);
// // // // // // // // // //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // //       }
// // // // // // // // // //     } else {
// // // // // // // // // //       console.warn("generateStaticGrid: No valid points for interpolation");
// // // // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // //     }
// // // // // // // // // //     interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];

// // // // // // // // // //     const boundaryPolygon = turf.featureCollection(boundaryData.features);
// // // // // // // // // //     const clipped = turf.pointsWithinPolygon(turf.featureCollection(grid.features), boundaryPolygon);
// // // // // // // // // //     console.log("generateStaticGrid: Clipped points:", clipped.features.length);

// // // // // // // // // //     const canvas = document.createElement("canvas");
// // // // // // // // // //     const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
// // // // // // // // // //     const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
// // // // // // // // // //     canvas.width = width;
// // // // // // // // // //     canvas.height = height;
// // // // // // // // // //     const ctx = canvas.getContext("2d");

// // // // // // // // // //     if (!ctx) {
// // // // // // // // // //       console.error("generateStaticGrid: Failed to get canvas context");
// // // // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // //     }

// // // // // // // // // //     ctx.fillStyle = "rgba(0, 0, 0, 0)";
// // // // // // // // // //     ctx.fillRect(0, 0, width, height);

// // // // // // // // // //     let validPoints = 0;
// // // // // // // // // //     clipped.features.forEach((feature) => {
// // // // // // // // // //       const coords = feature.geometry.coordinates;

// // // // // // // // // //       // Validasi bahwa coords adalah [number, number]
// // // // // // // // // //       if (!Array.isArray(coords) || coords.length !== 2 || typeof coords[0] !== "number" || typeof coords[1] !== "number") {
// // // // // // // // // //         console.warn("Invalid coordinates, skipping:", coords);
// // // // // // // // // //         return;
// // // // // // // // // //       }

// // // // // // // // // //       const point = turf.point(coords as [number, number]);

// // // // // // // // // //       const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer));

// // // // // // // // // //       let aodValue: number | null = null;
// // // // // // // // // //       if (inBuffer && interpolated.features.length > 0) {
// // // // // // // // // //         const closest = interpolated.features.reduce(
// // // // // // // // // //           (acc, f) => {
// // // // // // // // // //             const dist = turf.distance(f.geometry.coordinates, coords, { units: "degrees" });
// // // // // // // // // //             return dist < acc.dist ? { dist, value: f.properties.aod } : acc;
// // // // // // // // // //           },
// // // // // // // // // //           { dist: Infinity, value: 0 }
// // // // // // // // // //         );
// // // // // // // // // //         aodValue = closest.value > 0 ? closest.value : null;
// // // // // // // // // //       } else {
// // // // // // // // // //         const aodFeature = geoData.features.find((f) => {
// // // // // // // // // //           const polygon = f.geometry.type === "Polygon" ? turf.polygon(f.geometry.coordinates) : turf.multiPolygon(f.geometry.coordinates);
// // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // //         });
// // // // // // // // // //         aodValue = aodFeature && aodFeature.properties.aod_value != null && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;
// // // // // // // // // //       }

// // // // // // // // // //       if (aodValue == null) return;

// // // // // // // // // //       const color = interpolateColor(aodValue);
// // // // // // // // // //       const x = Math.round((coords[0] - bbox[0]) / cellSize);
// // // // // // // // // //       const y = Math.round((bbox[3] - coords[1]) / cellSize);
// // // // // // // // // //       ctx.fillStyle = color;
// // // // // // // // // //       ctx.fillRect(x, y, 1, 1);
// // // // // // // // // //       validPoints++;
// // // // // // // // // //     });

// // // // // // // // // //     console.log("generateStaticGrid: Valid points drawn on canvas:", validPoints);

// // // // // // // // // //     return { imageUrl: canvas.toDataURL(), bbox };
// // // // // // // // // //   };

// // // // // // // // // //   const cachedGrid = useMemo(() => {
// // // // // // // // // //     if (!geoData || !boundaryData) {
// // // // // // // // // //       console.warn("cachedGrid: Missing geoData or boundaryData");
// // // // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // // //     }
// // // // // // // // // //     return generateStaticGrid(geoData, boundaryData);
// // // // // // // // // //   }, [geoData, boundaryData]);

// // // // // // // // // //   useEffect(() => {
// // // // // // // // // //     if (!map || !geoData || !boundaryData) {
// // // // // // // // // //       console.warn("useEffect: Missing map, geoData, or boundaryData");
// // // // // // // // // //       return;
// // // // // // // // // //     }

// // // // // // // // // //     const { imageUrl, bbox } = cachedGrid;
// // // // // // // // // //     console.log("useEffect: Image URL and bbox:", imageUrl, bbox);

// // // // // // // // // //     if (staticLayerRef.current) {
// // // // // // // // // //       map.removeLayer(staticLayerRef.current);
// // // // // // // // // //       staticLayerRef.current = null;
// // // // // // // // // //     }
// // // // // // // // // //     if (tooltipRef.current) {
// // // // // // // // // //       tooltipRef.current.remove();
// // // // // // // // // //       tooltipRef.current = null;
// // // // // // // // // //     }

// // // // // // // // // //     if (imageUrl) {
// // // // // // // // // //       const bounds = [
// // // // // // // // // //         [bbox[1], bbox[0]],
// // // // // // // // // //         [bbox[3], bbox[2]],
// // // // // // // // // //       ];
// // // // // // // // // //       staticLayerRef.current = L.imageOverlay(imageUrl, bounds, { opacity: 0.85, interactive: true }).addTo(map);
// // // // // // // // // //       console.log("useEffect: ImageOverlay added to map");
// // // // // // // // // //     } else {
// // // // // // // // // //       console.warn("useEffect: No valid imageUrl for ImageOverlay");
// // // // // // // // // //     }

// // // // // // // // // //     const handleMouseMove = (e: L.LeafletMouseEvent) => {
// // // // // // // // // //       if (document.activeElement === inputRef.current) {
// // // // // // // // // //         return;
// // // // // // // // // //       }
// // // // // // // // // //       const { lat, lng } = e.latlng;
// // // // // // // // // //       if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
// // // // // // // // // //         return;
// // // // // // // // // //       }
// // // // // // // // // //       lastPosition.current = { lat, lng };

// // // // // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);

// // // // // // // // // //       timeoutRef.current = setTimeout(() => {
// // // // // // // // // //         if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // // // // //         const point = turf.point([lng, lat]);

// // // // // // // // // //         const candidates =
// // // // // // // // // //           spatialIndexRef.current?.search({
// // // // // // // // // //             minX: lng,
// // // // // // // // // //             minY: lat,
// // // // // // // // // //             maxX: lng,
// // // // // // // // // //             maxY: lat,
// // // // // // // // // //           }) || [];

// // // // // // // // // //         const kelurahan = boundaryData.features.find((bf, index) => {
// // // // // // // // // //           if (!candidates.some((c: RBushItem) => c.featureIndex === index)) return false;
// // // // // // // // // //           const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
// // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // //         });

// // // // // // // // // //         const aodFeature = geoData.features.find((feature) => {
// // // // // // // // // //           const polygon = feature.geometry.type === "Polygon" ? turf.polygon(feature.geometry.coordinates) : turf.multiPolygon(feature.geometry.coordinates);
// // // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // // //         });
// // // // // // // // // //         const aodValue = aodFeature && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;

// // // // // // // // // //         if (kelurahan?.properties) {
// // // // // // // // // //           tooltipRef.current = L.tooltip({
// // // // // // // // // //             sticky: true,
// // // // // // // // // //             direction: "top",
// // // // // // // // // //             offset: [0, -20],
// // // // // // // // // //             className: styles.customTooltip,
// // // // // // // // // //           })
// // // // // // // // // //             .setLatLng(e.latlng)
// // // // // // // // // //             .setContent(getTooltipContent(aodValue, kelurahan.properties.NAMOBJ))
// // // // // // // // // //             .addTo(map);
// // // // // // // // // //         }
// // // // // // // // // //       }, 500);
// // // // // // // // // //     };

// // // // // // // // // //     map.on("mousemove", handleMouseMove);

// // // // // // // // // //     return () => {
// // // // // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);
// // // // // // // // // //       map.off("mousemove", handleMouseMove);
// // // // // // // // // //       if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // // // // //       if (staticLayerRef.current) map.removeLayer(staticLayerRef.current);
// // // // // // // // // //     };
// // // // // // // // // //   }, [map, cachedGrid, selectedDate, inputRef, geoData, boundaryData]);

// // // // // // // // // //   return (
// // // // // // // // // //     <>
// // // // // // // // // //       {isLoading && (
// // // // // // // // // //         <div className={styles.loadingOverlay}>
// // // // // // // // // //           <div className={styles.spinner}></div>
// // // // // // // // // //           <span>Memuat Heatmap...</span>
// // // // // // // // // //         </div>
// // // // // // // // // //       )}
// // // // // // // // // //       <div className={styles.legend}>
// // // // // // // // // //         <h4>Legenda AOD</h4>
// // // // // // // // // //         <div className={styles.gradientLegend}>
// // // // // // // // // //           <div
// // // // // // // // // //             className={styles.gradientBar}
// // // // // // // // // //             style={{
// // // // // // // // // //               background: "linear-gradient(to right, rgba(0, 255, 0, 0.85), rgba(0, 0, 255, 0.85), rgba(255, 255, 0, 0.85), rgba(255, 0, 0, 0.85))",
// // // // // // // // // //             }}
// // // // // // // // // //           ></div>
// // // // // // // // // //           <div className={styles.gradientLabels}>
// // // // // // // // // //             <span>0.0</span>
// // // // // // // // // //             <span>1.0+</span>
// // // // // // // // // //           </div>
// // // // // // // // // //         </div>
// // // // // // // // // //       </div>
// // // // // // // // // //     </>
// // // // // // // // // //   );
// // // // // // // // // // };

// // // // // // // // // // export default HeatMapLayer;

// // // // // // // // // "use client";

// // // // // // // // // import { useEffect, useRef, useMemo } from "react";
// // // // // // // // // import { useMap } from "react-leaflet";
// // // // // // // // // import L from "leaflet";
// // // // // // // // // import * as turf from "@turf/turf";
// // // // // // // // // import RBush from "rbush";
// // // // // // // // // import styles from "./map.module.css";
// // // // // // // // // import { interpolateColor } from "../../utils/color";
// // // // // // // // // import { GeoJSONData, BoundaryGeoJSONData, Feature, BoundaryFeature } from "./types";

// // // // // // // // // interface HeatMapLayerProps {
// // // // // // // // //   geoData: GeoJSONData | null;
// // // // // // // // //   boundaryData: BoundaryGeoJSONData | null;
// // // // // // // // //   selectedDate: string;
// // // // // // // // //   isLoading: boolean;
// // // // // // // // //   inputRef: React.RefObject<HTMLInputElement>;
// // // // // // // // // }

// // // // // // // // // interface RBushItem {
// // // // // // // // //   minX: number;
// // // // // // // // //   minY: number;
// // // // // // // // //   maxX: number;
// // // // // // // // //   maxY: number;
// // // // // // // // //   featureIndex: number;
// // // // // // // // // }

// // // // // // // // // interface InterpolatedFeature {
// // // // // // // // //   type: "Feature";
// // // // // // // // //   geometry: GeoJSON.Point;
// // // // // // // // //   properties: { aod: number };
// // // // // // // // // }

// // // // // // // // // const HeatMapLayer: React.FC<HeatMapLayerProps> = ({ geoData, boundaryData, selectedDate, isLoading, inputRef }) => {
// // // // // // // // //   const map = useMap();
// // // // // // // // //   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
// // // // // // // // //   const tooltipRef = useRef<L.Tooltip | null>(null);
// // // // // // // // //   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
// // // // // // // // //   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
// // // // // // // // //   const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);
// // // // // // // // //   const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);

// // // // // // // // //   const getTooltipContent = (aodValue: number | null, kelurahanName: string): string => {
// // // // // // // // //     const formattedAodValue = aodValue !== null && aodValue > 0 ? aodValue.toFixed(4) : "No Data";
// // // // // // // // //     const aodColor = aodValue !== null && aodValue > 0 ? interpolateColor(aodValue) : "#a0aec0";
// // // // // // // // //     const textColor = aodColor === "rgba(0, 255, 0, 0.85)" || aodColor === "rgba(255, 255, 0, 0.85)" ? "#000000" : "#ffffff";
// // // // // // // // //     return `
// // // // // // // // //       <div class="${styles.customTooltip}">
// // // // // // // // //         <div class="${styles.kelurahanName}">${kelurahanName}</div>
// // // // // // // // //         <div class="${styles.aodContainer}">
// // // // // // // // //           <div class="${styles.aodCircle}" style="background-color: ${aodColor}; color: ${textColor}">
// // // // // // // // //             ${formattedAodValue}
// // // // // // // // //           </div>
// // // // // // // // //         </div>
// // // // // // // // //       </div>
// // // // // // // // //     `;
// // // // // // // // //   };

// // // // // // // // //   const cachedBoundaries = useMemo(() => {
// // // // // // // // //     if (!geoData) return turf.featureCollection([]);
// // // // // // // // //     const validFeatures = geoData.features
// // // // // // // // //       .filter((f) => f.properties.aod_value != null && f.properties.aod_value > 0)
// // // // // // // // //       .map((feature) => {
// // // // // // // // //         const buffered = turf.buffer(feature.geometry, 0.002, { units: "degrees" });
// // // // // // // // //         if (buffered && (buffered.geometry.type === "Polygon" || buffered.geometry.type === "MultiPolygon")) {
// // // // // // // // //           return buffered as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
// // // // // // // // //         }
// // // // // // // // //         return null;
// // // // // // // // //       })
// // // // // // // // //       .filter((f): f is GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> => f != null);
// // // // // // // // //     return turf.featureCollection(validFeatures);
// // // // // // // // //   }, [geoData]);

// // // // // // // // //   useEffect(() => {
// // // // // // // // //     if (!boundaryData) return;
// // // // // // // // //     const spatialIndex = new RBush<RBushItem>();
// // // // // // // // //     boundaryData.features.forEach((feature, index) => {
// // // // // // // // //       if (feature.geometry.type !== "Polygon" && feature.geometry.type !== "MultiPolygon") {
// // // // // // // // //         return;
// // // // // // // // //       }
// // // // // // // // //       const bbox = turf.bbox(feature.geometry);
// // // // // // // // //       spatialIndex.insert({
// // // // // // // // //         minX: bbox[0],
// // // // // // // // //         minY: bbox[1],
// // // // // // // // //         maxX: bbox[2],
// // // // // // // // //         maxY: bbox[3],
// // // // // // // // //         featureIndex: index,
// // // // // // // // //       });
// // // // // // // // //     });
// // // // // // // // //     spatialIndexRef.current = spatialIndex;

// // // // // // // // //     return () => {
// // // // // // // // //       spatialIndexRef.current = null;
// // // // // // // // //     };
// // // // // // // // //   }, [boundaryData]);

// // // // // // // // //   const generateStaticGrid = (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
// // // // // // // // //     console.log("generateStaticGrid: Starting with geoData features:", geoData.features.length);

// // // // // // // // //     if (!boundaryData || !boundaryData.features) {
// // // // // // // // //       console.warn("generateStaticGrid: boundaryData is null or has no features");
// // // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // //     }

// // // // // // // // //     const validBoundaryFeatures = boundaryData.features.filter((f): f is BoundaryFeature => f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon");
// // // // // // // // //     if (validBoundaryFeatures.length === 0) {
// // // // // // // // //       console.warn("generateStaticGrid: No valid Polygon or MultiPolygon features in boundaryData");
// // // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // //     }

// // // // // // // // //     const points = geoData.features
// // // // // // // // //       .map((feature) => {
// // // // // // // // //         const centroid = turf.centroid(feature.geometry);
// // // // // // // // //         const aod = feature.properties.aod_value;
// // // // // // // // //         if (aod == null || aod <= 0 || isNaN(aod)) {
// // // // // // // // //           console.log("Skipping feature due to invalid aod_value:", feature);
// // // // // // // // //           return null;
// // // // // // // // //         }
// // // // // // // // //         return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], aod];
// // // // // // // // //       })
// // // // // // // // //       .filter((p): p is [number, number, number] => p !== null);

// // // // // // // // //     console.log("generateStaticGrid: Valid points for interpolation:", points.length, points);

// // // // // // // // //     const bbox = turf.bbox(turf.featureCollection(validBoundaryFeatures));
// // // // // // // // //     console.log("generateStaticGrid: Bounding box:", bbox);

// // // // // // // // //     const cellSize = 0.02;
// // // // // // // // //     const grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });
// // // // // // // // //     console.log("generateStaticGrid: Grid points created:", grid.features.length);

// // // // // // // // //     let interpolated = turf.featureCollection([]);
// // // // // // // // //     if (points.length > 0) {
// // // // // // // // //       try {
// // // // // // // // //         interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { aod: p[2] }))), cellSize / 4, { gridType: "point", property: "aod", units: "degrees", weight: 2.5 });
// // // // // // // // //         console.log("generateStaticGrid: Interpolated points:", interpolated.features.length);
// // // // // // // // //       } catch (error) {
// // // // // // // // //         console.error("Interpolation error:", error);
// // // // // // // // //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // //       }
// // // // // // // // //     } else {
// // // // // // // // //       console.warn("generateStaticGrid: No valid points for interpolation");
// // // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // //     }
// // // // // // // // //     interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];

// // // // // // // // //     const boundaryPolygon = turf.featureCollection(validBoundaryFeatures);
// // // // // // // // //     const clipped = turf.pointsWithinPolygon(turf.featureCollection(grid.features), boundaryPolygon);
// // // // // // // // //     console.log("generateStaticGrid: Clipped points:", clipped.features.length);

// // // // // // // // //     const canvas = document.createElement("canvas");
// // // // // // // // //     const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
// // // // // // // // //     const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
// // // // // // // // //     canvas.width = width;
// // // // // // // // //     canvas.height = height;
// // // // // // // // //     const ctx = canvas.getContext("2d");

// // // // // // // // //     if (!ctx) {
// // // // // // // // //       console.error("generateStaticGrid: Failed to get canvas context");
// // // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // //     }

// // // // // // // // //     ctx.fillStyle = "rgba(0, 0, 0, 0)";
// // // // // // // // //     ctx.fillRect(0, 0, width, height);

// // // // // // // // //     let validPoints = 0;
// // // // // // // // //     clipped.features.forEach((feature) => {
// // // // // // // // //       const coords = feature.geometry.coordinates;

// // // // // // // // //       if (!Array.isArray(coords) || coords.length !== 2 || typeof coords[0] !== "number" || typeof coords[1] !== "number") {
// // // // // // // // //         console.warn("Invalid coordinates, skipping:", coords);
// // // // // // // // //         return;
// // // // // // // // //       }

// // // // // // // // //       const point = turf.point(coords as [number, number]);

// // // // // // // // //       const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>));

// // // // // // // // //       let aodValue: number | null = null;
// // // // // // // // //       if (inBuffer && interpolated.features.length > 0) {
// // // // // // // // //         const closest = interpolated.features.reduce(
// // // // // // // // //           (acc, f) => {
// // // // // // // // //             const dist = turf.distance(f.geometry.coordinates, coords, { units: "degrees" });
// // // // // // // // //             return dist < acc.dist ? { dist, value: f.properties.aod } : acc;
// // // // // // // // //           },
// // // // // // // // //           { dist: Infinity, value: 0 }
// // // // // // // // //         );
// // // // // // // // //         aodValue = closest.value > 0 ? closest.value : null;
// // // // // // // // //       } else {
// // // // // // // // //         const aodFeature = geoData.features.find((f) => {
// // // // // // // // //           const polygon = f.geometry.type === "Polygon" ? turf.polygon(f.geometry.coordinates) : turf.multiPolygon(f.geometry.coordinates);
// // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // //         });
// // // // // // // // //         aodValue = aodFeature && aodFeature.properties.aod_value != null && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;
// // // // // // // // //       }

// // // // // // // // //       if (aodValue == null) return;

// // // // // // // // //       const color = interpolateColor(aodValue);
// // // // // // // // //       const x = Math.round((coords[0] - bbox[0]) / cellSize);
// // // // // // // // //       const y = Math.round((bbox[3] - coords[1]) / cellSize);
// // // // // // // // //       ctx.fillStyle = color;
// // // // // // // // //       ctx.fillRect(x, y, 1, 1);
// // // // // // // // //       validPoints++;
// // // // // // // // //     });

// // // // // // // // //     console.log("generateStaticGrid: Valid points drawn on canvas:", validPoints);

// // // // // // // // //     return { imageUrl: canvas.toDataURL(), bbox };
// // // // // // // // //   };

// // // // // // // // //   const cachedGrid = useMemo(() => {
// // // // // // // // //     if (!geoData || !boundaryData) {
// // // // // // // // //       console.warn("cachedGrid: Missing geoData or boundaryData");
// // // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // // //     }
// // // // // // // // //     return generateStaticGrid(geoData, boundaryData);
// // // // // // // // //   }, [geoData, boundaryData]);

// // // // // // // // //   useEffect(() => {
// // // // // // // // //     if (!map || !geoData || !boundaryData) {
// // // // // // // // //       console.warn("useEffect: Missing map, geoData, or boundaryData");
// // // // // // // // //       return;
// // // // // // // // //     }

// // // // // // // // //     const { imageUrl, bbox } = cachedGrid;
// // // // // // // // //     console.log("useEffect: Image URL and bbox:", imageUrl, bbox);

// // // // // // // // //     if (staticLayerRef.current) {
// // // // // // // // //       map.removeLayer(staticLayerRef.current);
// // // // // // // // //       staticLayerRef.current = null;
// // // // // // // // //     }
// // // // // // // // //     if (tooltipRef.current) {
// // // // // // // // //       tooltipRef.current.remove();
// // // // // // // // //       tooltipRef.current = null;
// // // // // // // // //     }

// // // // // // // // //     if (imageUrl) {
// // // // // // // // //       const bounds = [
// // // // // // // // //         [bbox[1], bbox[0]],
// // // // // // // // //         [bbox[3], bbox[2]],
// // // // // // // // //       ];
// // // // // // // // //       staticLayerRef.current = L.imageOverlay(imageUrl, bounds, { opacity: 0.85, interactive: true }).addTo(map);
// // // // // // // // //       console.log("useEffect: ImageOverlay added to map");
// // // // // // // // //     } else {
// // // // // // // // //       console.warn("useEffect: No valid imageUrl for ImageOverlay");
// // // // // // // // //     }

// // // // // // // // //     const handleMouseMove = (e: L.LeafletMouseEvent) => {
// // // // // // // // //       if (document.activeElement === inputRef.current) {
// // // // // // // // //         return;
// // // // // // // // //       }
// // // // // // // // //       const { lat, lng } = e.latlng;
// // // // // // // // //       if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
// // // // // // // // //         return;
// // // // // // // // //       }
// // // // // // // // //       lastPosition.current = { lat, lng };

// // // // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);

// // // // // // // // //       timeoutRef.current = setTimeout(() => {
// // // // // // // // //         if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // // // //         const point = turf.point([lng, lat]);

// // // // // // // // //         const candidates =
// // // // // // // // //           spatialIndexRef.current?.search({
// // // // // // // // //             minX: lng,
// // // // // // // // //             minY: lat,
// // // // // // // // //             maxX: lng,
// // // // // // // // //             maxY: lat,
// // // // // // // // //           }) || [];

// // // // // // // // //         const kelurahan = boundaryData.features.find((bf, index) => {
// // // // // // // // //           if (!candidates.some((c: RBushItem) => c.featureIndex === index)) return false;
// // // // // // // // //           if (bf.geometry.type !== "Polygon" && bf.geometry.type !== "MultiPolygon") return false;
// // // // // // // // //           const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
// // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // //         });

// // // // // // // // //         const aodFeature = geoData.features.find((feature) => {
// // // // // // // // //           const polygon = feature.geometry.type === "Polygon" ? turf.polygon(feature.geometry.coordinates) : turf.multiPolygon(feature.geometry.coordinates);
// // // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // // //         });
// // // // // // // // //         const aodValue = aodFeature && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;

// // // // // // // // //         if (kelurahan?.properties) {
// // // // // // // // //           tooltipRef.current = L.tooltip({
// // // // // // // // //             sticky: true,
// // // // // // // // //             direction: "top",
// // // // // // // // //             offset: [0, -20],
// // // // // // // // //             className: styles.customTooltip,
// // // // // // // // //           })
// // // // // // // // //             .setLatLng(e.latlng)
// // // // // // // // //             .setContent(getTooltipContent(aodValue, kelurahan.properties.NAMOBJ))
// // // // // // // // //             .addTo(map);
// // // // // // // // //         }
// // // // // // // // //       }, 500);
// // // // // // // // //     };

// // // // // // // // //     map.on("mousemove", handleMouseMove);

// // // // // // // // //     return () => {
// // // // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);
// // // // // // // // //       map.off("mousemove", handleMouseMove);
// // // // // // // // //       if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // // // //       if (staticLayerRef.current) map.removeLayer(staticLayerRef.current);
// // // // // // // // //     };
// // // // // // // // //   }, [map, cachedGrid, selectedDate, inputRef, geoData, boundaryData]);

// // // // // // // // //   return (
// // // // // // // // //     <>
// // // // // // // // //       {isLoading && (
// // // // // // // // //         <div className={styles.loadingOverlay}>
// // // // // // // // //           <div className={styles.spinner}></div>
// // // // // // // // //           <span>Memuat Heatmap...</span>
// // // // // // // // //         </div>
// // // // // // // // //       )}
// // // // // // // // //       <div className={styles.legend}>
// // // // // // // // //         <h4>Legenda AOD</h4>
// // // // // // // // //         <div className={styles.gradientLegend}>
// // // // // // // // //           <div
// // // // // // // // //             className={styles.gradientBar}
// // // // // // // // //             style={{
// // // // // // // // //               background: "linear-gradient(to right, rgba(0, 255, 0, 0.85), rgba(0, 0, 255, 0.85), rgba(255, 255, 0, 0.85), rgba(255, 0, 0, 0.85))",
// // // // // // // // //             }}
// // // // // // // // //           ></div>
// // // // // // // // //           <div className={styles.gradientLabels}>
// // // // // // // // //             <span>0.0</span>
// // // // // // // // //             <span>1.0+</span>
// // // // // // // // //           </div>
// // // // // // // // //         </div>
// // // // // // // // //       </div>
// // // // // // // // //     </>
// // // // // // // // //   );
// // // // // // // // // };

// // // // // // // // // export default HeatMapLayer;

// // // // // // // // "use client";

// // // // // // // // import { useEffect, useRef, useMemo } from "react";
// // // // // // // // import { useMap } from "react-leaflet";
// // // // // // // // import L from "leaflet";
// // // // // // // // import * as turf from "@turf/turf";
// // // // // // // // import RBush from "rbush";
// // // // // // // // import styles from "./map.module.css";
// // // // // // // // import { interpolateColor } from "../../utils/color";
// // // // // // // // import { GeoJSONData, BoundaryGeoJSONData, Feature, BoundaryFeature } from "./types";

// // // // // // // // interface HeatMapLayerProps {
// // // // // // // //   geoData: GeoJSONData | null;
// // // // // // // //   boundaryData: BoundaryGeoJSONData | null;
// // // // // // // //   selectedDate: string;
// // // // // // // //   isLoading: boolean;
// // // // // // // //   inputRef: React.RefObject<HTMLInputElement>;
// // // // // // // // }

// // // // // // // // interface RBushItem {
// // // // // // // //   minX: number;
// // // // // // // //   minY: number;
// // // // // // // //   maxX: number;
// // // // // // // //   maxY: number;
// // // // // // // //   featureIndex: number;
// // // // // // // // }

// // // // // // // // interface InterpolatedFeature {
// // // // // // // //   type: "Feature";
// // // // // // // //   geometry: GeoJSON.Point;
// // // // // // // //   properties: { aod: number };
// // // // // // // // }

// // // // // // // // const HeatMapLayer: React.FC<HeatMapLayerProps> = ({ geoData, boundaryData, selectedDate, isLoading, inputRef }) => {
// // // // // // // //   const map = useMap();
// // // // // // // //   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
// // // // // // // //   const tooltipRef = useRef<L.Tooltip | null>(null);
// // // // // // // //   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
// // // // // // // //   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
// // // // // // // //   const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);
// // // // // // // //   const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);

// // // // // // // //   const getTooltipContent = (aodValue: number | null, kelurahanName: string): string => {
// // // // // // // //     const formattedAodValue = aodValue !== null && aodValue > 0 ? aodValue.toFixed(4) : "No Data";
// // // // // // // //     const aodColor = aodValue !== null && aodValue > 0 ? interpolateColor(aodValue) : "#a0aec0";
// // // // // // // //     const textColor = aodColor === "rgba(0, 255, 0, 0.85)" || aodColor === "rgba(255, 255, 0, 0.85)" ? "#000000" : "#ffffff";
// // // // // // // //     return `
// // // // // // // //       <div class="${styles.customTooltip}">
// // // // // // // //         <div class="${styles.kelurahanName}">${kelurahanName}</div>
// // // // // // // //         <div class="${styles.aodContainer}">
// // // // // // // //           <div class="${styles.aodCircle}" style="background-color: ${aodColor}; color: ${textColor}">
// // // // // // // //             ${formattedAodValue}
// // // // // // // //           </div>
// // // // // // // //         </div>
// // // // // // // //       </div>
// // // // // // // //     `;
// // // // // // // //   };

// // // // // // // //   const cachedBoundaries = useMemo(() => {
// // // // // // // //     if (!geoData) return turf.featureCollection([]);
// // // // // // // //     const validFeatures = geoData.features
// // // // // // // //       .filter((f) => f.properties.aod_value != null && f.properties.aod_value > 0)
// // // // // // // //       .map((feature) => {
// // // // // // // //         const buffered = turf.buffer(feature.geometry, 0.002, { units: "degrees" });
// // // // // // // //         if (buffered && (buffered.geometry.type === "Polygon" || buffered.geometry.type === "MultiPolygon")) {
// // // // // // // //           return buffered as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
// // // // // // // //         }
// // // // // // // //         return null;
// // // // // // // //       })
// // // // // // // //       .filter((f): f is GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> => f != null);
// // // // // // // //     return turf.featureCollection(validFeatures);
// // // // // // // //   }, [geoData]);

// // // // // // // //   useEffect(() => {
// // // // // // // //     if (!boundaryData) return;
// // // // // // // //     const spatialIndex = new RBush<RBushItem>();
// // // // // // // //     boundaryData.features.forEach((feature, index) => {
// // // // // // // //       if (feature.geometry.type !== "Polygon" && feature.geometry.type !== "MultiPolygon") {
// // // // // // // //         return;
// // // // // // // //       }
// // // // // // // //       const bbox = turf.bbox(feature.geometry);
// // // // // // // //       spatialIndex.insert({
// // // // // // // //         minX: bbox[0],
// // // // // // // //         minY: bbox[1],
// // // // // // // //         maxX: bbox[2],
// // // // // // // //         maxY: bbox[3],
// // // // // // // //         featureIndex: index,
// // // // // // // //       });
// // // // // // // //     });
// // // // // // // //     spatialIndexRef.current = spatialIndex;

// // // // // // // //     return () => {
// // // // // // // //       spatialIndexRef.current = null;
// // // // // // // //     };
// // // // // // // //   }, [boundaryData]);

// // // // // // // //   const generateStaticGrid = (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
// // // // // // // //     console.log("generateStaticGrid: Starting with geoData features:", geoData.features.length);

// // // // // // // //     if (!boundaryData || !boundaryData.features) {
// // // // // // // //       console.warn("generateStaticGrid: boundaryData is null or has no features");
// // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // //     }

// // // // // // // //     const validBoundaryFeatures = boundaryData.features.filter((f): f is BoundaryFeature => f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon");
// // // // // // // //     if (validBoundaryFeatures.length === 0) {
// // // // // // // //       console.warn("generateStaticGrid: No valid Polygon or MultiPolygon features in boundaryData");
// // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // //     }

// // // // // // // //     const points = geoData.features
// // // // // // // //       .map((feature) => {
// // // // // // // //         const centroid = turf.centroid(feature.geometry);
// // // // // // // //         const aod = feature.properties.aod_value;
// // // // // // // //         if (aod == null || aod <= 0 || isNaN(aod)) {
// // // // // // // //           console.log("Skipping feature due to invalid aod_value:", feature);
// // // // // // // //           return null;
// // // // // // // //         }
// // // // // // // //         return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], aod];
// // // // // // // //       })
// // // // // // // //       .filter((p): p is [number, number, number] => p !== null);

// // // // // // // //     console.log("generateStaticGrid: Valid points for interpolation:", points.length, points);

// // // // // // // //     const bbox = turf.bbox(turf.featureCollection(validBoundaryFeatures));
// // // // // // // //     console.log("generateStaticGrid: Bounding box:", bbox);

// // // // // // // //     const cellSize = 0.02;
// // // // // // // //     const grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });
// // // // // // // //     console.log("generateStaticGrid: Grid points created:", grid.features.length);

// // // // // // // //     let interpolated = turf.featureCollection([]);
// // // // // // // //     if (points.length > 0) {
// // // // // // // //       try {
// // // // // // // //         interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { aod: p[2] }))), cellSize / 4, { gridType: "point", property: "aod", units: "degrees", weight: 2.5 });
// // // // // // // //         console.log("generateStaticGrid: Interpolated points:", interpolated.features.length);
// // // // // // // //       } catch (error) {
// // // // // // // //         console.error("Interpolation error:", error);
// // // // // // // //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // //       }
// // // // // // // //     } else {
// // // // // // // //       console.warn("generateStaticGrid: No valid points for interpolation");
// // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // //     }
// // // // // // // //     interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];

// // // // // // // //     const boundaryPolygon = turf.featureCollection(validBoundaryFeatures);
// // // // // // // //     const clipped = turf.pointsWithinPolygon(turf.featureCollection(grid.features), boundaryPolygon);
// // // // // // // //     console.log("generateStaticGrid: Clipped points:", clipped.features.length);

// // // // // // // //     const canvas = document.createElement("canvas");
// // // // // // // //     const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
// // // // // // // //     const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
// // // // // // // //     canvas.width = width;
// // // // // // // //     canvas.height = height;
// // // // // // // //     const ctx = canvas.getContext("2d");

// // // // // // // //     if (!ctx) {
// // // // // // // //       console.error("generateStaticGrid: Failed to get canvas context");
// // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // //     }

// // // // // // // //     ctx.fillStyle = "rgba(0, 0, 0, 0)";
// // // // // // // //     ctx.fillRect(0, 0, width, height);

// // // // // // // //     let validPoints = 0;
// // // // // // // //     clipped.features.forEach((feature) => {
// // // // // // // //       const coords = feature.geometry.coordinates;

// // // // // // // //       if (!Array.isArray(coords) || coords.length !== 2 || typeof coords[0] !== "number" || typeof coords[1] !== "number") {
// // // // // // // //         console.warn("Invalid coordinates, skipping:", coords);
// // // // // // // //         return;
// // // // // // // //       }

// // // // // // // //       const point = turf.point(coords as [number, number]);

// // // // // // // //       const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>));

// // // // // // // //       let aodValue: number | null = null;
// // // // // // // //       if (inBuffer && interpolated.features.length > 0) {
// // // // // // // //         const closest = interpolated.features.reduce(
// // // // // // // //           (acc, f) => {
// // // // // // // //             if (f.geometry.type !== "Point") return acc; // Pastikan geometri adalah Point
// // // // // // // //             const dist = turf.distance(f.geometry as GeoJSON.Point, coords as [number, number], { units: "degrees" });
// // // // // // // //             return dist < acc.dist ? { dist, value: f.properties.aod } : acc;
// // // // // // // //           },
// // // // // // // //           { dist: Infinity, value: 0 }
// // // // // // // //         );
// // // // // // // //         aodValue = closest.value > 0 ? closest.value : null;
// // // // // // // //       } else {
// // // // // // // //         const aodFeature = geoData.features.find((f) => {
// // // // // // // //           const polygon = f.geometry.type === "Polygon" ? turf.polygon(f.geometry.coordinates) : turf.multiPolygon(f.geometry.coordinates);
// // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // //         });
// // // // // // // //         aodValue = aodFeature && aodFeature.properties.aod_value != null && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;
// // // // // // // //       }

// // // // // // // //       if (aodValue == null) return;

// // // // // // // //       const color = interpolateColor(aodValue);
// // // // // // // //       const x = Math.round((coords[0] - bbox[0]) / cellSize);
// // // // // // // //       const y = Math.round((bbox[3] - coords[1]) / cellSize);
// // // // // // // //       ctx.fillStyle = color;
// // // // // // // //       ctx.fillRect(x, y, 1, 1);
// // // // // // // //       validPoints++;
// // // // // // // //     });

// // // // // // // //     console.log("generateStaticGrid: Valid points drawn on canvas:", validPoints);

// // // // // // // //     return { imageUrl: canvas.toDataURL(), bbox };
// // // // // // // //   };

// // // // // // // //   const cachedGrid = useMemo(() => {
// // // // // // // //     if (!geoData || !boundaryData) {
// // // // // // // //       console.warn("cachedGrid: Missing geoData or boundaryData");
// // // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // // //     }
// // // // // // // //     return generateStaticGrid(geoData, boundaryData);
// // // // // // // //   }, [geoData, boundaryData]);

// // // // // // // //   useEffect(() => {
// // // // // // // //     if (!map || !geoData || !boundaryData) {
// // // // // // // //       console.warn("useEffect: Missing map, geoData, or boundaryData");
// // // // // // // //       return;
// // // // // // // //     }

// // // // // // // //     const { imageUrl, bbox } = cachedGrid;
// // // // // // // //     console.log("useEffect: Image URL and bbox:", imageUrl, bbox);

// // // // // // // //     if (staticLayerRef.current) {
// // // // // // // //       map.removeLayer(staticLayerRef.current);
// // // // // // // //       staticLayerRef.current = null;
// // // // // // // //     }
// // // // // // // //     if (tooltipRef.current) {
// // // // // // // //       tooltipRef.current.remove();
// // // // // // // //       tooltipRef.current = null;
// // // // // // // //     }

// // // // // // // //     if (imageUrl) {
// // // // // // // //       const bounds = [
// // // // // // // //         [bbox[1], bbox[0]],
// // // // // // // //         [bbox[3], bbox[2]],
// // // // // // // //       ];
// // // // // // // //       staticLayerRef.current = L.imageOverlay(imageUrl, bounds, { opacity: 0.85, interactive: true }).addTo(map);
// // // // // // // //       console.log("useEffect: ImageOverlay added to map");
// // // // // // // //     } else {
// // // // // // // //       console.warn("useEffect: No valid imageUrl for ImageOverlay");
// // // // // // // //     }

// // // // // // // //     const handleMouseMove = (e: L.LeafletMouseEvent) => {
// // // // // // // //       if (document.activeElement === inputRef.current) {
// // // // // // // //         return;
// // // // // // // //       }
// // // // // // // //       const { lat, lng } = e.latlng;
// // // // // // // //       if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
// // // // // // // //         return;
// // // // // // // //       }
// // // // // // // //       lastPosition.current = { lat, lng };

// // // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);

// // // // // // // //       timeoutRef.current = setTimeout(() => {
// // // // // // // //         if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // // //         const point = turf.point([lng, lat]);

// // // // // // // //         const candidates =
// // // // // // // //           spatialIndexRef.current?.search({
// // // // // // // //             minX: lng,
// // // // // // // //             minY: lat,
// // // // // // // //             maxX: lng,
// // // // // // // //             maxY: lat,
// // // // // // // //           }) || [];

// // // // // // // //         const kelurahan = boundaryData.features.find((bf, index) => {
// // // // // // // //           if (!candidates.some((c: RBushItem) => c.featureIndex === index)) return false;
// // // // // // // //           if (bf.geometry.type !== "Polygon" && bf.geometry.type !== "MultiPolygon") return false;
// // // // // // // //           const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
// // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // //         });

// // // // // // // //         const aodFeature = geoData.features.find((feature) => {
// // // // // // // //           const polygon = feature.geometry.type === "Polygon" ? turf.polygon(feature.geometry.coordinates) : turf.multiPolygon(feature.geometry.coordinates);
// // // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // // //         });
// // // // // // // //         const aodValue = aodFeature && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;

// // // // // // // //         if (kelurahan?.properties) {
// // // // // // // //           tooltipRef.current = L.tooltip({
// // // // // // // //             sticky: true,
// // // // // // // //             direction: "top",
// // // // // // // //             offset: [0, -20],
// // // // // // // //             className: styles.customTooltip,
// // // // // // // //           })
// // // // // // // //             .setLatLng(e.latlng)
// // // // // // // //             .setContent(getTooltipContent(aodValue, kelurahan.properties.NAMOBJ))
// // // // // // // //             .addTo(map);
// // // // // // // //         }
// // // // // // // //       }, 500);
// // // // // // // //     };

// // // // // // // //     map.on("mousemove", handleMouseMove);

// // // // // // // //     return () => {
// // // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);
// // // // // // // //       map.off("mousemove", handleMouseMove);
// // // // // // // //       if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // // //       if (staticLayerRef.current) map.removeLayer(staticLayerRef.current);
// // // // // // // //     };
// // // // // // // //   }, [map, cachedGrid, selectedDate, inputRef, geoData, boundaryData]);

// // // // // // // //   return (
// // // // // // // //     <>
// // // // // // // //       {isLoading && (
// // // // // // // //         <div className={styles.loadingOverlay}>
// // // // // // // //           <div className={styles.spinner}></div>
// // // // // // // //           <span>Memuat Heatmap...</span>
// // // // // // // //         </div>
// // // // // // // //       )}
// // // // // // // //       <div className={styles.legend}>
// // // // // // // //         <h4>Legenda AOD</h4>
// // // // // // // //         <div className={styles.gradientLegend}>
// // // // // // // //           <div
// // // // // // // //             className={styles.gradientBar}
// // // // // // // //             style={{
// // // // // // // //               background: "linear-gradient(to right, rgba(0, 255, 0, 0.85), rgba(0, 0, 255, 0.85), rgba(255, 255, 0, 0.85), rgba(255, 0, 0, 0.85))",
// // // // // // // //             }}
// // // // // // // //           ></div>
// // // // // // // //           <div className={styles.gradientLabels}>
// // // // // // // //             <span>0.0</span>
// // // // // // // //             <span>1.0+</span>
// // // // // // // //           </div>
// // // // // // // //         </div>
// // // // // // // //       </div>
// // // // // // // //     </>
// // // // // // // //   );
// // // // // // // // };

// // // // // // // // export default HeatMapLayer;

// // // // // // // "use client";

// // // // // // // import { useEffect, useRef, useMemo } from "react";
// // // // // // // import { useMap } from "react-leaflet";
// // // // // // // import L from "leaflet";
// // // // // // // import * as turf from "@turf/turf";
// // // // // // // import RBush from "rbush";
// // // // // // // import styles from "./map.module.css";
// // // // // // // import { interpolateColor } from "../../utils/color";
// // // // // // // import { GeoJSONData, BoundaryGeoJSONData, Feature, BoundaryFeature } from "./types";

// // // // // // // interface HeatMapLayerProps {
// // // // // // //   geoData: GeoJSONData | null;
// // // // // // //   boundaryData: BoundaryGeoJSONData | null;
// // // // // // //   selectedDate: string;
// // // // // // //   isLoading: boolean;
// // // // // // //   inputRef: React.RefObject<HTMLInputElement>;
// // // // // // // }

// // // // // // // interface RBushItem {
// // // // // // //   minX: number;
// // // // // // //   minY: number;
// // // // // // //   maxX: number;
// // // // // // //   maxY: number;
// // // // // // //   featureIndex: number;
// // // // // // // }

// // // // // // // interface InterpolatedFeature {
// // // // // // //   type: "Feature";
// // // // // // //   geometry: GeoJSON.Point;
// // // // // // //   properties: { aod: number };
// // // // // // // }

// // // // // // // const HeatMapLayer: React.FC<HeatMapLayerProps> = ({ geoData, boundaryData, selectedDate, isLoading, inputRef }) => {
// // // // // // //   const map = useMap();
// // // // // // //   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
// // // // // // //   const tooltipRef = useRef<L.Tooltip | null>(null);
// // // // // // //   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
// // // // // // //   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
// // // // // // //   const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);
// // // // // // //   const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);

// // // // // // //   const getTooltipContent = (aodValue: number | null, kelurahanName: string): string => {
// // // // // // //     const formattedAodValue = aodValue !== null && aodValue > 0 ? aodValue.toFixed(4) : "No Data";
// // // // // // //     const aodColor = aodValue !== null && aodValue > 0 ? interpolateColor(aodValue) : "#a0aec0";
// // // // // // //     const textColor = aodColor === "rgba(0, 255, 0, 0.85)" || aodColor === "rgba(255, 255, 0, 0.85)" ? "#000000" : "#ffffff";
// // // // // // //     return `
// // // // // // //       <div class="${styles.customTooltip}">
// // // // // // //         <div class="${styles.kelurahanName}">${kelurahanName}</div>
// // // // // // //         <div class="${styles.aodContainer}">
// // // // // // //           <div class="${styles.aodCircle}" style="background-color: ${aodColor}; color: ${textColor}">
// // // // // // //             ${formattedAodValue}
// // // // // // //           </div>
// // // // // // //         </div>
// // // // // // //       </div>
// // // // // // //     `;
// // // // // // //   };

// // // // // // //   const cachedBoundaries = useMemo(() => {
// // // // // // //     if (!geoData) return turf.featureCollection([]);
// // // // // // //     const validFeatures = geoData.features
// // // // // // //       .filter((f) => f.properties.aod_value != null && f.properties.aod_value > 0)
// // // // // // //       .map((feature) => {
// // // // // // //         const buffered = turf.buffer(feature.geometry, 0.002, { units: "degrees" });
// // // // // // //         if (buffered && (buffered.geometry.type === "Polygon" || buffered.geometry.type === "MultiPolygon")) {
// // // // // // //           return buffered as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
// // // // // // //         }
// // // // // // //         return null;
// // // // // // //       })
// // // // // // //       .filter((f): f is GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> => f != null);
// // // // // // //     return turf.featureCollection(validFeatures);
// // // // // // //   }, [geoData]);

// // // // // // //   useEffect(() => {
// // // // // // //     if (!boundaryData) return;
// // // // // // //     const spatialIndex = new RBush<RBushItem>();
// // // // // // //     boundaryData.features.forEach((feature, index) => {
// // // // // // //       if (feature.geometry.type !== "Polygon" && feature.geometry.type !== "MultiPolygon") {
// // // // // // //         return;
// // // // // // //       }
// // // // // // //       const bbox = turf.bbox(feature.geometry);
// // // // // // //       spatialIndex.insert({
// // // // // // //         minX: bbox[0],
// // // // // // //         minY: bbox[1],
// // // // // // //         maxX: bbox[2],
// // // // // // //         maxY: bbox[3],
// // // // // // //         featureIndex: index,
// // // // // // //       });
// // // // // // //     });
// // // // // // //     spatialIndexRef.current = spatialIndex;

// // // // // // //     return () => {
// // // // // // //       spatialIndexRef.current = null;
// // // // // // //     };
// // // // // // //   }, [boundaryData]);

// // // // // // //   const generateStaticGrid = (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
// // // // // // //     console.log("generateStaticGrid: Starting with geoData features:", geoData.features.length);

// // // // // // //     if (!boundaryData || !boundaryData.features) {
// // // // // // //       console.warn("generateStaticGrid: boundaryData is null or has no features");
// // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // //     }

// // // // // // //     const validBoundaryFeatures = boundaryData.features.filter((f): f is BoundaryFeature => f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon");
// // // // // // //     if (validBoundaryFeatures.length === 0) {
// // // // // // //       console.warn("generateStaticGrid: No valid Polygon or MultiPolygon features in boundaryData");
// // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // //     }

// // // // // // //     const points = geoData.features
// // // // // // //       .map((feature) => {
// // // // // // //         const centroid = turf.centroid(feature.geometry);
// // // // // // //         const aod = feature.properties.aod_value;
// // // // // // //         if (aod == null || aod <= 0 || isNaN(aod)) {
// // // // // // //           console.log("Skipping feature due to invalid aod_value:", feature);
// // // // // // //           return null;
// // // // // // //         }
// // // // // // //         return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], aod];
// // // // // // //       })
// // // // // // //       .filter((p): p is [number, number, number] => p !== null);

// // // // // // //     console.log("generateStaticGrid: Valid points for interpolation:", points.length, points);

// // // // // // //     const bbox = turf.bbox(turf.featureCollection(validBoundaryFeatures));
// // // // // // //     console.log("generateStaticGrid: Bounding box:", bbox);

// // // // // // //     const cellSize = 0.02;
// // // // // // //     const grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });
// // // // // // //     console.log("generateStaticGrid: Grid points created:", grid.features.length);

// // // // // // //     let interpolated = turf.featureCollection([]);
// // // // // // //     if (points.length > 0) {
// // // // // // //       try {
// // // // // // //         interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { aod: p[2] }))), cellSize / 4, { gridType: "point", property: "aod", units: "degrees", weight: 2.5 });
// // // // // // //         console.log("generateStaticGrid: Interpolated points:", interpolated.features.length);
// // // // // // //       } catch (error) {
// // // // // // //         console.error("Interpolation error:", error);
// // // // // // //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // //       }
// // // // // // //     } else {
// // // // // // //       console.warn("generateStaticGrid: No valid points for interpolation");
// // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // //     }
// // // // // // //     interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];

// // // // // // //     const boundaryPolygon = turf.featureCollection(validBoundaryFeatures);
// // // // // // //     const clipped = turf.pointsWithinPolygon(turf.featureCollection(grid.features), boundaryPolygon);
// // // // // // //     console.log("generateStaticGrid: Clipped points:", clipped.features.length);

// // // // // // //     const canvas = document.createElement("canvas");
// // // // // // //     const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
// // // // // // //     const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
// // // // // // //     canvas.width = width;
// // // // // // //     canvas.height = height;
// // // // // // //     const ctx = canvas.getContext("2d");

// // // // // // //     if (!ctx) {
// // // // // // //       console.error("generateStaticGrid: Failed to get canvas context");
// // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // //     }

// // // // // // //     ctx.fillStyle = "rgba(0, 0, 0, 0)";
// // // // // // //     ctx.fillRect(0, 0, width, height);

// // // // // // //     let validPoints = 0;
// // // // // // //     clipped.features.forEach((feature) => {
// // // // // // //       const coords = feature.geometry.coordinates;

// // // // // // //       if (!Array.isArray(coords) || coords.length !== 2 || typeof coords[0] !== "number" || typeof coords[1] !== "number") {
// // // // // // //         console.warn("Invalid coordinates, skipping:", coords);
// // // // // // //         return;
// // // // // // //       }

// // // // // // //       const point = turf.point(coords as [number, number]);

// // // // // // //       const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>));

// // // // // // //       let aodValue: number | null = null;
// // // // // // //       if (inBuffer && interpolated.features.length > 0) {
// // // // // // //         const closest = interpolated.features.reduce(
// // // // // // //           (acc, f) => {
// // // // // // //             if (f.geometry.type !== "Point" || !f.properties) return acc;
// // // // // // //             const dist = turf.distance(f.geometry as GeoJSON.Point, coords as [number, number], { units: "degrees" });
// // // // // // //             return dist < acc.dist ? { dist, value: f.properties.aod } : acc;
// // // // // // //           },
// // // // // // //           { dist: Infinity, value: 0 }
// // // // // // //         );
// // // // // // //         aodValue = closest.value > 0 ? closest.value : null;
// // // // // // //       } else {
// // // // // // //         const aodFeature = geoData.features.find((f) => {
// // // // // // //           const polygon = f.geometry.type === "Polygon" ? turf.polygon(f.geometry.coordinates) : turf.multiPolygon(f.geometry.coordinates);
// // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // //         });
// // // // // // //         aodValue = aodFeature && aodFeature.properties.aod_value != null && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;
// // // // // // //       }

// // // // // // //       if (aodValue == null) return;

// // // // // // //       const color = interpolateColor(aodValue);
// // // // // // //       const x = Math.round((coords[0] - bbox[0]) / cellSize);
// // // // // // //       const y = Math.round((bbox[3] - coords[1]) / cellSize);
// // // // // // //       ctx.fillStyle = color;
// // // // // // //       ctx.fillRect(x, y, 1, 1);
// // // // // // //       validPoints++;
// // // // // // //     });

// // // // // // //     console.log("generateStaticGrid: Valid points drawn on canvas:", validPoints);

// // // // // // //     return { imageUrl: canvas.toDataURL(), bbox };
// // // // // // //   };

// // // // // // //   const cachedGrid = useMemo(() => {
// // // // // // //     if (!geoData || !boundaryData) {
// // // // // // //       console.warn("cachedGrid: Missing geoData or boundaryData");
// // // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // // //     }
// // // // // // //     return generateStaticGrid(geoData, boundaryData);
// // // // // // //   }, [geoData, boundaryData]);

// // // // // // //   useEffect(() => {
// // // // // // //     if (!map || !geoData || !boundaryData) {
// // // // // // //       console.warn("useEffect: Missing map, geoData, or boundaryData");
// // // // // // //       return;
// // // // // // //     }

// // // // // // //     const { imageUrl, bbox } = cachedGrid;
// // // // // // //     console.log("useEffect: Image URL and bbox:", imageUrl, bbox);

// // // // // // //     if (staticLayerRef.current) {
// // // // // // //       map.removeLayer(staticLayerRef.current);
// // // // // // //       staticLayerRef.current = null;
// // // // // // //     }
// // // // // // //     if (tooltipRef.current) {
// // // // // // //       tooltipRef.current.remove();
// // // // // // //       tooltipRef.current = null;
// // // // // // //     }

// // // // // // //     if (imageUrl) {
// // // // // // //       const bounds = [
// // // // // // //         [bbox[1], bbox[0]],
// // // // // // //         [bbox[3], bbox[2]],
// // // // // // //       ];
// // // // // // //       staticLayerRef.current = L.imageOverlay(imageUrl, bounds, { opacity: 0.85, interactive: true }).addTo(map);
// // // // // // //       console.log("useEffect: ImageOverlay added to map");
// // // // // // //     } else {
// // // // // // //       console.warn("useEffect: No valid imageUrl for ImageOverlay");
// // // // // // //     }

// // // // // // //     const handleMouseMove = (e: L.LeafletMouseEvent) => {
// // // // // // //       if (document.activeElement === inputRef.current) {
// // // // // // //         return;
// // // // // // //       }
// // // // // // //       const { lat, lng } = e.latlng;
// // // // // // //       if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
// // // // // // //         return;
// // // // // // //       }
// // // // // // //       lastPosition.current = { lat, lng };

// // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);

// // // // // // //       timeoutRef.current = setTimeout(() => {
// // // // // // //         if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // //         const point = turf.point([lng, lat]);

// // // // // // //         const candidates =
// // // // // // //           spatialIndexRef.current?.search({
// // // // // // //             minX: lng,
// // // // // // //             minY: lat,
// // // // // // //             maxX: lng,
// // // // // // //             maxY: lat,
// // // // // // //           }) || [];

// // // // // // //         const kelurahan = boundaryData.features.find((bf, index) => {
// // // // // // //           if (!candidates.some((c: RBushItem) => c.featureIndex === index)) return false;
// // // // // // //           if (bf.geometry.type !== "Polygon" && bf.geometry.type !== "MultiPolygon") return false;
// // // // // // //           const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
// // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // //         });

// // // // // // //         const aodFeature = geoData.features.find((feature) => {
// // // // // // //           const polygon = feature.geometry.type === "Polygon" ? turf.polygon(feature.geometry.coordinates) : turf.multiPolygon(feature.geometry.coordinates);
// // // // // // //           return turf.booleanPointInPolygon(point, polygon);
// // // // // // //         });
// // // // // // //         const aodValue = aodFeature && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;

// // // // // // //         if (kelurahan?.properties) {
// // // // // // //           tooltipRef.current = L.tooltip({
// // // // // // //             sticky: true,
// // // // // // //             direction: "top",
// // // // // // //             offset: [0, -20],
// // // // // // //             className: styles.customTooltip,
// // // // // // //           })
// // // // // // //             .setLatLng(e.latlng)
// // // // // // //             .setContent(getTooltipContent(aodValue, kelurahan.properties.NAMOBJ))
// // // // // // //             .addTo(map);
// // // // // // //         }
// // // // // // //       }, 500);
// // // // // // //     };

// // // // // // //     map.on("mousemove", handleMouseMove);

// // // // // // //     return () => {
// // // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);
// // // // // // //       map.off("mousemove", handleMouseMove);
// // // // // // //       if (tooltipRef.current) tooltipRef.current.remove();
// // // // // // //       if (staticLayerRef.current) map.removeLayer(staticLayerRef.current);
// // // // // // //     };
// // // // // // //   }, [map, cachedGrid, selectedDate, inputRef, geoData, boundaryData]);

// // // // // // //   return (
// // // // // // //     <>
// // // // // // //       {isLoading && (
// // // // // // //         <div className={styles.loadingOverlay}>
// // // // // // //           <div className={styles.spinner}></div>
// // // // // // //           <span>Memuat Heatmap...</span>
// // // // // // //         </div>
// // // // // // //       )}
// // // // // // //       <div className={styles.legend}>
// // // // // // //         <h4>Legenda AOD</h4>
// // // // // // //         <div className={styles.gradientLegend}>
// // // // // // //           <div
// // // // // // //             className={styles.gradientBar}
// // // // // // //             style={{
// // // // // // //               background: "linear-gradient(to right, rgba(0, 255, 0, 0.85), rgba(0, 0, 255, 0.85), rgba(255, 255, 0, 0.85), rgba(255, 0, 0, 0.85))",
// // // // // // //             }}
// // // // // // //           ></div>
// // // // // // //           <div className={styles.gradientLabels}>
// // // // // // //             <span>0.0</span>
// // // // // // //             <span>1.0+</span>
// // // // // // //           </div>
// // // // // // //         </div>
// // // // // // //       </div>
// // // // // // //     </>
// // // // // // //   );
// // // // // // // };

// // // // // // // export default HeatMapLayer;

// // // // // // "use client";

// // // // // // import { useEffect, useRef, useMemo } from "react";
// // // // // // import { useMap } from "react-leaflet";
// // // // // // import L from "leaflet";
// // // // // // import * as turf from "@turf/turf";
// // // // // // import RBush from "rbush";
// // // // // // import styles from "./map.module.css";
// // // // // // import { interpolateColor } from "../../utils/color";
// // // // // // import { GeoJSONData, BoundaryGeoJSONData, Feature, BoundaryFeature } from "./types";

// // // // // // interface HeatMapLayerProps {
// // // // // //   geoData: GeoJSONData | null;
// // // // // //   boundaryData: BoundaryGeoJSONData | null;
// // // // // //   selectedDate: string;
// // // // // //   isLoading: boolean;
// // // // // //   inputRef: React.RefObject<HTMLInputElement>;
// // // // // // }

// // // // // // interface RBushItem {
// // // // // //   minX: number;
// // // // // //   minY: number;
// // // // // //   maxX: number;
// // // // // //   maxY: number;
// // // // // //   featureIndex: number;
// // // // // // }

// // // // // // interface InterpolatedFeature {
// // // // // //   type: "Feature";
// // // // // //   geometry: GeoJSON.Point;
// // // // // //   properties: { aod: number };
// // // // // // }

// // // // // // const HeatMapLayer: React.FC<HeatMapLayerProps> = ({ geoData, boundaryData, selectedDate, isLoading, inputRef }) => {
// // // // // //   const map = useMap();
// // // // // //   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
// // // // // //   const tooltipRef = useRef<L.Tooltip | null>(null);
// // // // // //   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
// // // // // //   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
// // // // // //   const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);
// // // // // //   const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);

// // // // // //   const getTooltipContent = (aodValue: number | null, kelurahanName: string): string => {
// // // // // //     const formattedAodValue = aodValue !== null && aodValue > 0 ? aodValue.toFixed(4) : "No Data";
// // // // // //     const aodColor = aodValue !== null && aodValue > 0 ? interpolateColor(aodValue) : "#a0aec0";
// // // // // //     const textColor = aodColor === "rgba(0, 255, 0, 0.85)" || aodColor === "rgba(255, 255, 0, 0.85)" ? "#000000" : "#ffffff";
// // // // // //     return `
// // // // // //       <div class="${styles.customTooltip}">
// // // // // //         <div class="${styles.kelurahanName}">${kelurahanName}</div>
// // // // // //         <div class="${styles.aodContainer}">
// // // // // //           <div class="${styles.aodCircle}" style="background-color: ${aodColor}; color: ${textColor}">
// // // // // //             ${formattedAodValue}
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       </div>
// // // // // //     `;
// // // // // //   };

// // // // // //   const cachedBoundaries = useMemo(() => {
// // // // // //     if (!geoData) return turf.featureCollection([]);
// // // // // //     const validFeatures = geoData.features
// // // // // //       .filter((f) => f.properties.aod_value != null && f.properties.aod_value > 0)
// // // // // //       .map((feature) => {
// // // // // //         const buffered = turf.buffer(feature.geometry, 0.002, { units: "degrees" });
// // // // // //         if (buffered && (buffered.geometry.type === "Polygon" || buffered.geometry.type === "MultiPolygon")) {
// // // // // //           return buffered as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
// // // // // //         }
// // // // // //         return null;
// // // // // //       })
// // // // // //       .filter((f): f is GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> => f != null);
// // // // // //     return turf.featureCollection(validFeatures);
// // // // // //   }, [geoData]);

// // // // // //   useEffect(() => {
// // // // // //     if (!boundaryData) return;
// // // // // //     const spatialIndex = new RBush<RBushItem>();
// // // // // //     boundaryData.features.forEach((feature, index) => {
// // // // // //       if (feature.geometry.type !== "Polygon" && feature.geometry.type !== "MultiPolygon") {
// // // // // //         return;
// // // // // //       }
// // // // // //       const bbox = turf.bbox(feature.geometry);
// // // // // //       spatialIndex.insert({
// // // // // //         minX: bbox[0],
// // // // // //         minY: bbox[1],
// // // // // //         maxX: bbox[2],
// // // // // //         maxY: bbox[3],
// // // // // //         featureIndex: index,
// // // // // //       });
// // // // // //     });
// // // // // //     spatialIndexRef.current = spatialIndex;

// // // // // //     return () => {
// // // // // //       spatialIndexRef.current = null;
// // // // // //     };
// // // // // //   }, [boundaryData]);

// // // // // //   const generateStaticGrid = (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
// // // // // //     console.log("generateStaticGrid: Starting with geoData features:", geoData.features.length);

// // // // // //     if (!boundaryData || !boundaryData.features) {
// // // // // //       console.warn("generateStaticGrid: boundaryData is null or has no features");
// // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // //     }

// // // // // //     const validBoundaryFeatures = boundaryData.features.filter((f): f is BoundaryFeature => f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon");
// // // // // //     if (validBoundaryFeatures.length === 0) {
// // // // // //       console.warn("generateStaticGrid: No valid Polygon or MultiPolygon features in boundaryData");
// // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // //     }

// // // // // //     const points = geoData.features
// // // // // //       .map((feature) => {
// // // // // //         const centroid = turf.centroid(feature.geometry);
// // // // // //         const aod = feature.properties.aod_value;
// // // // // //         if (aod == null || aod <= 0 || isNaN(aod)) {
// // // // // //           console.log("Skipping feature due to invalid aod_value:", feature);
// // // // // //           return null;
// // // // // //         }
// // // // // //         return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], aod];
// // // // // //       })
// // // // // //       .filter((p): p is [number, number, number] => p !== null);

// // // // // //     console.log("generateStaticGrid: Valid points for interpolation:", points.length, points);

// // // // // //     const bbox = turf.bbox(turf.featureCollection(validBoundaryFeatures));
// // // // // //     console.log("generateStaticGrid: Bounding box:", bbox);

// // // // // //     const cellSize = 0.02;
// // // // // //     const grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });
// // // // // //     console.log("generateStaticGrid: Grid points created:", grid.features.length);

// // // // // //     let interpolated = turf.featureCollection([]);
// // // // // //     if (points.length > 0) {
// // // // // //       try {
// // // // // //         interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { aod: p[2] }))), cellSize / 4, { gridType: "point", property: "aod", units: "degrees", weight: 2.5 });
// // // // // //         console.log("generateStaticGrid: Interpolated points:", interpolated.features.length);
// // // // // //       } catch (error) {
// // // // // //         console.error("Interpolation error:", error);
// // // // // //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // //       }
// // // // // //     } else {
// // // // // //       console.warn("generateStaticGrid: No valid points for interpolation");
// // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // //     }
// // // // // //     interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];

// // // // // //     const boundaryPolygon = turf.featureCollection(validBoundaryFeatures);
// // // // // //     const clipped = turf.pointsWithinPolygon(turf.featureCollection(grid.features), boundaryPolygon);
// // // // // //     console.log("generateStaticGrid: Clipped points:", clipped.features.length);

// // // // // //     const canvas = document.createElement("canvas");
// // // // // //     const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
// // // // // //     const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
// // // // // //     canvas.width = width;
// // // // // //     canvas.height = height;
// // // // // //     const ctx = canvas.getContext("2d");

// // // // // //     if (!ctx) {
// // // // // //       console.error("generateStaticGrid: Failed to get canvas context");
// // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // //     }

// // // // // //     ctx.fillStyle = "rgba(0, 0, 0, 0)";
// // // // // //     ctx.fillRect(0, 0, width, height);

// // // // // //     let validPoints = 0;
// // // // // //     clipped.features.forEach((feature) => {
// // // // // //       const coords = feature.geometry.coordinates;

// // // // // //       if (!Array.isArray(coords) || coords.length !== 2 || typeof coords[0] !== "number" || typeof coords[1] !== "number") {
// // // // // //         console.warn("Invalid coordinates, skipping:", coords);
// // // // // //         return;
// // // // // //       }

// // // // // //       const point = turf.point(coords as [number, number]);

// // // // // //       const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>));

// // // // // //       let aodValue: number | null = null;
// // // // // //       if (inBuffer && interpolated.features.length > 0) {
// // // // // //         const closest = interpolated.features.reduce(
// // // // // //           (acc, f) => {
// // // // // //             if (f.geometry.type !== "Point" || !f.properties) return acc;
// // // // // //             const dist = turf.distance(f.geometry as GeoJSON.Point, coords as [number, number], { units: "degrees" });
// // // // // //             return dist < acc.dist ? { dist, value: f.properties.aod } : acc;
// // // // // //           },
// // // // // //           { dist: Infinity, value: 0 }
// // // // // //         );
// // // // // //         aodValue = closest.value > 0 ? closest.value : null;
// // // // // //       } else {
// // // // // //         const aodFeature = geoData.features.find((f) => {
// // // // // //           if (f.geometry.type === "Polygon") {
// // // // // //             return turf.booleanPointInPolygon(point, turf.polygon(f.geometry.coordinates));
// // // // // //           } else if (f.geometry.type === "MultiPolygon") {
// // // // // //             return turf.booleanPointInPolygon(point, turf.multiPolygon(f.geometry.coordinates) as GeoJSON.Feature<GeoJSON.MultiPolygon>);
// // // // // //           }
// // // // // //           return false;
// // // // // //         });
// // // // // //         aodValue = aodFeature && aodFeature.properties.aod_value != null && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;
// // // // // //       }

// // // // // //       if (aodValue == null) return;

// // // // // //       const color = interpolateColor(aodValue);
// // // // // //       const x = Math.round((coords[0] - bbox[0]) / cellSize);
// // // // // //       const y = Math.round((bbox[3] - coords[1]) / cellSize);
// // // // // //       ctx.fillStyle = color;
// // // // // //       ctx.fillRect(x, y, 1, 1);
// // // // // //       validPoints++;
// // // // // //     });

// // // // // //     console.log("generateStaticGrid: Valid points drawn on canvas:", validPoints);

// // // // // //     return { imageUrl: canvas.toDataURL(), bbox };
// // // // // //   };

// // // // // //   const cachedGrid = useMemo(() => {
// // // // // //     if (!geoData || !boundaryData) {
// // // // // //       console.warn("cachedGrid: Missing geoData or boundaryData");
// // // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // // //     }
// // // // // //     return generateStaticGrid(geoData, boundaryData);
// // // // // //   }, [geoData, boundaryData]);

// // // // // //   useEffect(() => {
// // // // // //     if (!map || !geoData || !boundaryData) {
// // // // // //       console.warn("useEffect: Missing map, geoData, or boundaryData");
// // // // // //       return;
// // // // // //     }

// // // // // //     const { imageUrl, bbox } = cachedGrid;
// // // // // //     console.log("useEffect: Image URL and bbox:", imageUrl, bbox);

// // // // // //     if (staticLayerRef.current) {
// // // // // //       map.removeLayer(staticLayerRef.current);
// // // // // //       staticLayerRef.current = null;
// // // // // //     }
// // // // // //     if (tooltipRef.current) {
// // // // // //       tooltipRef.current.remove();
// // // // // //       tooltipRef.current = null;
// // // // // //     }

// // // // // //     if (imageUrl && Array.isArray(bbox) && bbox.length === 4 && bbox.every((val) => typeof val === "number" && !isNaN(val))) {
// // // // // //       const bounds: L.LatLngBoundsExpression = [
// // // // // //         [bbox[1], bbox[0]], // [latMin, lngMin]
// // // // // //         [bbox[3], bbox[2]], // [latMax, lngMax]
// // // // // //       ];
// // // // // //       staticLayerRef.current = L.imageOverlay(imageUrl, bounds, { opacity: 0.85, interactive: true }).addTo(map);
// // // // // //       console.log("useEffect: ImageOverlay added to map");
// // // // // //     } else {
// // // // // //       console.warn("useEffect: Invalid imageUrl or bbox", { imageUrl, bbox });
// // // // // //     }

// // // // // //     const handleMouseMove = (e: L.LeafletMouseEvent) => {
// // // // // //       if (document.activeElement === inputRef.current) {
// // // // // //         return;
// // // // // //       }
// // // // // //       const { lat, lng } = e.latlng;
// // // // // //       if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
// // // // // //         return;
// // // // // //       }
// // // // // //       lastPosition.current = { lat, lng };

// // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);

// // // // // //       timeoutRef.current = setTimeout(() => {
// // // // // //         if (tooltipRef.current) tooltipRef.current.remove();
// // // // // //         const point = turf.point([lng, lat]);

// // // // // //         const candidates =
// // // // // //           spatialIndexRef.current?.search({
// // // // // //             minX: lng,
// // // // // //             minY: lat,
// // // // // //             maxX: lng,
// // // // // //             maxY: lat,
// // // // // //           }) || [];

// // // // // //         const kelurahan = boundaryData.features.find((bf, index) => {
// // // // // //           if (!candidates.some((c: RBushItem) => c.featureIndex === index)) return false;
// // // // // //           if (bf.geometry.type !== "Polygon" && bf.geometry.type !== "MultiPolygon") return false;
// // // // // //           const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
// // // // // //           return turf.booleanPointInPolygon(point, polygon as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>);
// // // // // //         });

// // // // // //         const aodFeature = geoData.features.find((feature) => {
// // // // // //           if (feature.geometry.type === "Polygon") {
// // // // // //             return turf.booleanPointInPolygon(point, turf.polygon(feature.geometry.coordinates));
// // // // // //           } else if (feature.geometry.type === "MultiPolygon") {
// // // // // //             return turf.booleanPointInPolygon(point, turf.multiPolygon(feature.geometry.coordinates) as GeoJSON.Feature<GeoJSON.MultiPolygon>);
// // // // // //           }
// // // // // //           return false;
// // // // // //         });
// // // // // //         const aodValue = aodFeature && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;

// // // // // //         if (kelurahan?.properties) {
// // // // // //           tooltipRef.current = L.tooltip({
// // // // // //             sticky: true,
// // // // // //             direction: "top",
// // // // // //             offset: [0, -20],
// // // // // //             className: styles.customTooltip,
// // // // // //           })
// // // // // //             .setLatLng(e.latlng)
// // // // // //             .setContent(getTooltipContent(aodValue, kelurahan.properties.NAMOBJ))
// // // // // //             .addTo(map);
// // // // // //         }
// // // // // //       }, 500);
// // // // // //     };

// // // // // //     map.on("mousemove", handleMouseMove);

// // // // // //     return () => {
// // // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);
// // // // // //       map.off("mousemove", handleMouseMove);
// // // // // //       if (tooltipRef.current) tooltipRef.current.remove();
// // // // // //       if (staticLayerRef.current) map.removeLayer(staticLayerRef.current);
// // // // // //     };
// // // // // //   }, [map, cachedGrid, selectedDate, inputRef, geoData, boundaryData]);

// // // // // //   return (
// // // // // //     <>
// // // // // //       {isLoading && (
// // // // // //         <div className={styles.loadingOverlay}>
// // // // // //           <div className={styles.spinner}></div>
// // // // // //           <span>Memuat Heatmap...</span>
// // // // // //         </div>
// // // // // //       )}
// // // // // //       <div className={styles.legend}>
// // // // // //         <h4>Legenda AOD</h4>
// // // // // //         <div className={styles.gradientLegend}>
// // // // // //           <div
// // // // // //             className={styles.gradientBar}
// // // // // //             style={{
// // // // // //               background: "linear-gradient(to right, rgba(0, 255, 0, 0.85), rgba(0, 0, 255, 0.85), rgba(255, 255, 0, 0.85), rgba(255, 0, 0, 0.85))",
// // // // // //             }}
// // // // // //           ></div>
// // // // // //           <div className={styles.gradientLabels}>
// // // // // //             <span>0.0</span>
// // // // // //             <span>1.0+</span>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       </div>
// // // // // //     </>
// // // // // //   );
// // // // // // };

// // // // // // export default HeatMapLayer;

// // // // // "use client";

// // // // // import { useEffect, useRef, useMemo } from "react";
// // // // // import { useMap } from "react-leaflet";
// // // // // import L from "leaflet";
// // // // // import * as turf from "@turf/turf";
// // // // // import RBush from "rbush";
// // // // // import styles from "./map.module.css";
// // // // // import { interpolateColor } from "../../utils/color";
// // // // // import { GeoJSONData, BoundaryGeoJSONData, Feature, BoundaryFeature } from "./types";

// // // // // interface HeatMapLayerProps {
// // // // //   geoData: GeoJSONData | null;
// // // // //   boundaryData: BoundaryGeoJSONData | null;
// // // // //   selectedDate: string;
// // // // //   isLoading: boolean;
// // // // //   inputRef: React.RefObject<HTMLInputElement>;
// // // // // }

// // // // // interface RBushItem {
// // // // //   minX: number;
// // // // //   minY: number;
// // // // //   maxX: number;
// // // // //   maxY: number;
// // // // //   featureIndex: number;
// // // // // }

// // // // // interface InterpolatedFeature {
// // // // //   type: "Feature";
// // // // //   geometry: GeoJSON.Point;
// // // // //   properties: { aod: number };
// // // // // }

// // // // // const HeatMapLayer: React.FC<HeatMapLayerProps> = ({ geoData, boundaryData, selectedDate, isLoading, inputRef }) => {
// // // // //   const map = useMap();
// // // // //   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
// // // // //   const tooltipRef = useRef<L.Tooltip | null>(null);
// // // // //   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
// // // // //   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
// // // // //   const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);
// // // // //   const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);

// // // // //   const getTooltipContent = (aodValue: number | null, kelurahanName: string): string => {
// // // // //     const formattedAodValue = aodValue !== null && aodValue > 0 ? aodValue.toFixed(4) : "No Data";
// // // // //     const aodColor = aodValue !== null && aodValue > 0 ? interpolateColor(aodValue) : "#a0aec0";
// // // // //     const textColor = aodColor === "rgba(0, 255, 0, 0.85)" || aodColor === "rgba(255, 255, 0, 0.85)" ? "#000000" : "#ffffff";
// // // // //     return `
// // // // //       <div class="${styles.customTooltip}">
// // // // //         <div class="${styles.kelurahanName}">${kelurahanName}</div>
// // // // //         <div class="${styles.aodContainer}">
// // // // //           <div class="${styles.aodCircle}" style="background-color: ${aodColor}; color: ${textColor}">
// // // // //             ${formattedAodValue}
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>
// // // // //     `;
// // // // //   };

// // // // //   const cachedBoundaries = useMemo(() => {
// // // // //     if (!geoData) return turf.featureCollection([]);
// // // // //     const validFeatures = geoData.features
// // // // //       .filter((f) => f.properties.aod_value != null && f.properties.aod_value > 0)
// // // // //       .map((feature) => {
// // // // //         const buffered = turf.buffer(feature.geometry, 0.002, { units: "degrees" });
// // // // //         if (buffered && (buffered.geometry.type === "Polygon" || buffered.geometry.type === "MultiPolygon")) {
// // // // //           return buffered as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
// // // // //         }
// // // // //         return null;
// // // // //       })
// // // // //       .filter((f): f is GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> => f != null);
// // // // //     return turf.featureCollection(validFeatures);
// // // // //   }, [geoData]);

// // // // //   useEffect(() => {
// // // // //     if (!boundaryData) return;
// // // // //     const spatialIndex = new RBush<RBushItem>();
// // // // //     boundaryData.features.forEach((feature, index) => {
// // // // //       if (feature.geometry.type !== "Polygon" && feature.geometry.type !== "MultiPolygon") {
// // // // //         return;
// // // // //       }
// // // // //       const bbox = turf.bbox(feature.geometry);
// // // // //       spatialIndex.insert({
// // // // //         minX: bbox[0],
// // // // //         minY: bbox[1],
// // // // //         maxX: bbox[2],
// // // // //         maxY: bbox[3],
// // // // //         featureIndex: index,
// // // // //       });
// // // // //     });
// // // // //     spatialIndexRef.current = spatialIndex;

// // // // //     return () => {
// // // // //       spatialIndexRef.current = null;
// // // // //     };
// // // // //   }, [boundaryData]);

// // // // //   const generateStaticGrid = (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
// // // // //     console.log("generateStaticGrid: Starting with geoData features:", geoData.features.length);

// // // // //     if (!boundaryData || !boundaryData.features) {
// // // // //       console.warn("generateStaticGrid: boundaryData is null or has no features");
// // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // //     }

// // // // //     const validBoundaryFeatures = boundaryData.features.filter((f): f is BoundaryFeature => f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon");
// // // // //     if (validBoundaryFeatures.length === 0) {
// // // // //       console.warn("generateStaticGrid: No valid Polygon or MultiPolygon features in boundaryData");
// // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // //     }

// // // // //     const points = geoData.features
// // // // //       .map((feature) => {
// // // // //         const centroid = turf.centroid(feature.geometry);
// // // // //         const aod = feature.properties.aod_value;
// // // // //         if (aod == null || aod <= 0 || isNaN(aod)) {
// // // // //           console.log("Skipping feature due to invalid aod_value:", feature);
// // // // //           return null;
// // // // //         }
// // // // //         return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], aod];
// // // // //       })
// // // // //       .filter((p): p is [number, number, number] => p !== null);

// // // // //     console.log("generateStaticGrid: Valid points for interpolation:", points.length, points);

// // // // //     const bbox = turf.bbox(turf.featureCollection(validBoundaryFeatures));
// // // // //     console.log("generateStaticGrid: Bounding box:", bbox);

// // // // //     const cellSize = 0.02;
// // // // //     const grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });
// // // // //     console.log("generateStaticGrid: Grid points created:", grid.features.length);

// // // // //     let interpolated = turf.featureCollection([]);
// // // // //     if (points.length > 0) {
// // // // //       try {
// // // // //         interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { aod: p[2] }))), cellSize / 4, { gridType: "point", property: "aod", units: "degrees", weight: 2.5 });
// // // // //         console.log("generateStaticGrid: Interpolated points:", interpolated.features.length);
// // // // //       } catch (error) {
// // // // //         console.error("Interpolation error:", error);
// // // // //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // //       }
// // // // //     } else {
// // // // //       console.warn("generateStaticGrid: No valid points for interpolation");
// // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // //     }
// // // // //     interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];

// // // // //     const boundaryPolygon = turf.featureCollection(validBoundaryFeatures);
// // // // //     const clipped = turf.pointsWithinPolygon(turf.featureCollection(grid.features), boundaryPolygon);
// // // // //     console.log("generateStaticGrid: Clipped points:", clipped.features.length);

// // // // //     const canvas = document.createElement("canvas");
// // // // //     const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
// // // // //     const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
// // // // //     canvas.width = width;
// // // // //     canvas.height = height;
// // // // //     const ctx = canvas.getContext("2d");

// // // // //     if (!ctx) {
// // // // //       console.error("generateStaticGrid: Failed to get canvas context");
// // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // //     }

// // // // //     ctx.fillStyle = "rgba(0, 0, 0, 0)";
// // // // //     ctx.fillRect(0, 0, width, height);

// // // // //     let validPoints = 0;
// // // // //     clipped.features.forEach((feature) => {
// // // // //       const coords = feature.geometry.coordinates;

// // // // //       if (!Array.isArray(coords) || coords.length !== 2 || typeof coords[0] !== "number" || typeof coords[1] !== "number") {
// // // // //         console.warn("Invalid coordinates, skipping:", coords);
// // // // //         return;
// // // // //       }

// // // // //       const point = turf.point(coords as [number, number]);

// // // // //       const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>));

// // // // //       let aodValue: number | null = null;
// // // // //       if (inBuffer && interpolated.features.length > 0) {
// // // // //         const closest = interpolated.features.reduce(
// // // // //           (acc, f) => {
// // // // //             if (f.geometry.type !== "Point" || !f.properties) return acc;
// // // // //             const dist = turf.distance(f.geometry as GeoJSON.Point, coords as [number, number], { units: "degrees" });
// // // // //             return dist < acc.dist ? { dist, value: f.properties.aod } : acc;
// // // // //           },
// // // // //           { dist: Infinity, value: 0 }
// // // // //         );
// // // // //         aodValue = closest.value > 0 ? closest.value : null;
// // // // //       } else {
// // // // //         const aodFeature = geoData.features.find((f) => {
// // // // //           if (f.geometry.type === "Polygon") {
// // // // //             return turf.booleanPointInPolygon(point, turf.polygon(f.geometry.coordinates));
// // // // //           } else if (f.geometry.type === "MultiPolygon") {
// // // // //             return turf.booleanPointInPolygon(point, turf.multiPolygon(f.geometry.coordinates) as GeoJSON.Feature<GeoJSON.MultiPolygon>);
// // // // //           }
// // // // //           return false;
// // // // //         });
// // // // //         aodValue = aodFeature && aodFeature.properties.aod_value != null && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;
// // // // //       }

// // // // //       if (aodValue == null) return;

// // // // //       const color = interpolateColor(aodValue);
// // // // //       const x = Math.round((coords[0] - bbox[0]) / cellSize);
// // // // //       const y = Math.round((bbox[3] - coords[1]) / cellSize);
// // // // //       ctx.fillStyle = color;
// // // // //       ctx.fillRect(x, y, 1, 1);
// // // // //       validPoints++;
// // // // //     });

// // // // //     console.log("generateStaticGrid: Valid points drawn on canvas:", validPoints);

// // // // //     return { imageUrl: canvas.toDataURL(), bbox };
// // // // //   };

// // // // //   const cachedGrid = useMemo(() => {
// // // // //     if (!geoData || !boundaryData) {
// // // // //       console.warn("cachedGrid: Missing geoData or boundaryData");
// // // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // // //     }
// // // // //     return generateStaticGrid(geoData, boundaryData);
// // // // //   }, [geoData, boundaryData]);

// // // // //   useEffect(() => {
// // // // //     if (!map || !geoData || !boundaryData) {
// // // // //       console.warn("useEffect: Missing map, geoData, or boundaryData");
// // // // //       return;
// // // // //     }

// // // // //     const { imageUrl, bbox } = cachedGrid;
// // // // //     console.log("useEffect: Image URL and bbox:", imageUrl, bbox);

// // // // //     if (staticLayerRef.current) {
// // // // //       map.removeLayer(staticLayerRef.current);
// // // // //       staticLayerRef.current = null;
// // // // //     }
// // // // //     if (tooltipRef.current) {
// // // // //       tooltipRef.current.remove();
// // // // //       tooltipRef.current = null;
// // // // //     }

// // // // //     if (imageUrl && Array.isArray(bbox) && bbox.length === 4 && bbox.every((val) => typeof val === "number" && !isNaN(val))) {
// // // // //       const bounds: L.LatLngBoundsExpression = [
// // // // //         [bbox[1], bbox[0]], // [latMin, lngMin]
// // // // //         [bbox[3], bbox[2]], // [latMax, lngMax]
// // // // //       ];
// // // // //       staticLayerRef.current = L.imageOverlay(imageUrl, bounds, { opacity: 0.85, interactive: true }).addTo(map);
// // // // //       console.log("useEffect: ImageOverlay added to map");
// // // // //     } else {
// // // // //       console.warn("useEffect: Invalid imageUrl or bbox", { imageUrl, bbox });
// // // // //     }

// // // // //     const handleMouseMove = (e: L.LeafletMouseEvent) => {
// // // // //       if (inputRef.current && document.activeElement === inputRef.current) {
// // // // //         return;
// // // // //       }
// // // // //       const { lat, lng } = e.latlng;
// // // // //       if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
// // // // //         return;
// // // // //       }
// // // // //       lastPosition.current = { lat, lng };

// // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);

// // // // //       timeoutRef.current = setTimeout(() => {
// // // // //         if (tooltipRef.current) tooltipRef.current.remove();
// // // // //         const point = turf.point([lng, lat]);

// // // // //         const candidates =
// // // // //           spatialIndexRef.current?.search({
// // // // //             minX: lng,
// // // // //             minY: lat,
// // // // //             maxX: lng,
// // // // //             maxY: lat,
// // // // //           }) || [];

// // // // //         const kelurahan = boundaryData.features.find((bf, index) => {
// // // // //           if (!candidates.some((c: RBushItem) => c.featureIndex === index)) return false;
// // // // //           if (bf.geometry.type !== "Polygon" && bf.geometry.type !== "MultiPolygon") return false;
// // // // //           const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
// // // // //           return turf.booleanPointInPolygon(point, polygon as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>);
// // // // //         });

// // // // //         const aodFeature = geoData.features.find((feature) => {
// // // // //           if (feature.geometry.type === "Polygon") {
// // // // //             return turf.booleanPointInPolygon(point, turf.polygon(feature.geometry.coordinates));
// // // // //           } else if (feature.geometry.type === "MultiPolygon") {
// // // // //             return turf.booleanPointInPolygon(point, turf.multiPolygon(feature.geometry.coordinates) as GeoJSON.Feature<GeoJSON.MultiPolygon>);
// // // // //           }
// // // // //           return false;
// // // // //         });
// // // // //         const aodValue = aodFeature && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;

// // // // //         if (kelurahan?.properties) {
// // // // //           tooltipRef.current = L.tooltip({
// // // // //             sticky: true,
// // // // //             direction: "top",
// // // // //             offset: [0, -20],
// // // // //             className: styles.customTooltip,
// // // // //           })
// // // // //             .setLatLng(e.latlng)
// // // // //             .setContent(getTooltipContent(aodValue, kelurahan.properties.NAMOBJ))
// // // // //             .addTo(map);
// // // // //         }
// // // // //       }, 500);
// // // // //     };

// // // // //     map.on("mousemove", handleMouseMove);

// // // // //     return () => {
// // // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);
// // // // //       map.off("mousemove", handleMouseMove);
// // // // //       if (tooltipRef.current) tooltipRef.current.remove();
// // // // //       if (staticLayerRef.current) map.removeLayer(staticLayerRef.current);
// // // // //     };
// // // // //   }, [map, cachedGrid, selectedDate, inputRef, geoData, boundaryData]);

// // // // //   return (
// // // // //     <>
// // // // //       {isLoading && (
// // // // //         <div className={styles.loadingOverlay}>
// // // // //           <div className={styles.spinner}></div>
// // // // //           <span>Memuat Heatmap...</span>
// // // // //         </div>
// // // // //       )}
// // // // //       <div className={styles.legend}>
// // // // //         <h4>Legenda AOD</h4>
// // // // //         <div className={styles.gradientLegend}>
// // // // //           <div
// // // // //             className={styles.gradientBar}
// // // // //             style={{
// // // // //               background: "linear-gradient(to right, rgba(0, 255, 0, 0.85), rgba(0, 0, 255, 0.85), rgba(255, 255, 0, 0.85), rgba(255, 0, 0, 0.85))",
// // // // //             }}
// // // // //           ></div>
// // // // //           <div className={styles.gradientLabels}>
// // // // //             <span>0.0</span>
// // // // //             <span>1.0+</span>
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>
// // // // //     </>
// // // // //   );
// // // // // };

// // // // // export default HeatMapLayer;

// // // // "use client";

// // // // import { useEffect, useRef, useMemo } from "react";
// // // // import { useMap } from "react-leaflet";
// // // // import L from "leaflet";
// // // // import * as turf from "@turf/turf";
// // // // import RBush from "rbush";
// // // // import styles from "./map.module.css";
// // // // import { interpolateColor } from "../../utils/color";
// // // // import { GeoJSONData, BoundaryGeoJSONData, BoundaryFeature } from "./types";

// // // // interface HeatMapLayerProps {
// // // //   geoData: GeoJSONData | null;
// // // //   boundaryData: BoundaryGeoJSONData | null;
// // // //   selectedDate: string;
// // // //   isLoading: boolean;
// // // //   inputRef: React.RefObject<HTMLInputElement>;
// // // // }

// // // // interface RBushItem {
// // // //   minX: number;
// // // //   minY: number;
// // // //   maxX: number;
// // // //   maxY: number;
// // // //   featureIndex: number;
// // // // }

// // // // interface InterpolatedFeature {
// // // //   type: "Feature";
// // // //   geometry: GeoJSON.Point;
// // // //   properties: { aod: number };
// // // // }

// // // // const HeatMapLayer: React.FC<HeatMapLayerProps> = ({ geoData, boundaryData, selectedDate, isLoading, inputRef }) => {
// // // //   const map = useMap();
// // // //   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
// // // //   const tooltipRef = useRef<L.Tooltip | null>(null);
// // // //   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
// // // //   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
// // // //   const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);
// // // //   const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);

// // // //   const getTooltipContent = (aodValue: number | null, kelurahanName: string): string => {
// // // //     const formattedAodValue = aodValue !== null && aodValue > 0 ? aodValue.toFixed(4) : "No Data";
// // // //     const aodColor = aodValue !== null && aodValue > 0 ? interpolateColor(aodValue) : "#a0aec0";
// // // //     const textColor = aodColor === "rgba(0, 255, 0, 0.85)" || aodColor === "rgba(255, 255, 0, 0.85)" ? "#000000" : "#ffffff";
// // // //     return `
// // // //       <div class="${styles.customTooltip}">
// // // //         <div class="${styles.kelurahanName}">${kelurahanName}</div>
// // // //         <div class="${styles.aodContainer}">
// // // //           <div class="${styles.aodCircle}" style="background-color: ${aodColor}; color: ${textColor}">
// // // //             ${formattedAodValue}
// // // //           </div>
// // // //         </div>
// // // //       </div>
// // // //     `;
// // // //   };

// // // //   const cachedBoundaries = useMemo(() => {
// // // //     if (!geoData) return turf.featureCollection([]);
// // // //     const validFeatures = geoData.features
// // // //       .filter((f) => f.properties.aod_value != null && f.properties.aod_value > 0)
// // // //       .map((feature) => {
// // // //         const buffered = turf.buffer(feature.geometry, 0.002, { units: "degrees" });
// // // //         if (buffered && (buffered.geometry.type === "Polygon" || buffered.geometry.type === "MultiPolygon")) {
// // // //           return buffered as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
// // // //         }
// // // //         return null;
// // // //       })
// // // //       .filter((f): f is GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> => f != null);
// // // //     return turf.featureCollection(validFeatures);
// // // //   }, [geoData]);

// // // //   useEffect(() => {
// // // //     if (!boundaryData) return;
// // // //     const spatialIndex = new RBush<RBushItem>();
// // // //     boundaryData.features.forEach((feature, index) => {
// // // //       if (feature.geometry.type !== "Polygon" && feature.geometry.type !== "MultiPolygon") {
// // // //         return;
// // // //       }
// // // //       const bbox = turf.bbox(feature.geometry);
// // // //       spatialIndex.insert({
// // // //         minX: bbox[0],
// // // //         minY: bbox[1],
// // // //         maxX: bbox[2],
// // // //         maxY: bbox[3],
// // // //         featureIndex: index,
// // // //       });
// // // //     });
// // // //     spatialIndexRef.current = spatialIndex;

// // // //     return () => {
// // // //       spatialIndexRef.current = null;
// // // //     };
// // // //   }, [boundaryData]);

// // // //   const generateStaticGrid = (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
// // // //     console.log("generateStaticGrid: Starting with geoData features:", geoData.features.length);

// // // //     if (!boundaryData || !boundaryData.features) {
// // // //       console.warn("generateStaticGrid: boundaryData is null or has no features");
// // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // //     }

// // // //     const validBoundaryFeatures = boundaryData.features.filter((f): f is BoundaryFeature => f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon");
// // // //     if (validBoundaryFeatures.length === 0) {
// // // //       console.warn("generateStaticGrid: No valid Polygon or MultiPolygon features in boundaryData");
// // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // //     }

// // // //     const points = geoData.features
// // // //       .map((feature) => {
// // // //         const centroid = turf.centroid(feature.geometry);
// // // //         const aod = feature.properties.aod_value;
// // // //         if (aod == null || aod <= 0 || isNaN(aod)) {
// // // //           console.log("Skipping feature due to invalid aod_value:", feature);
// // // //           return null;
// // // //         }
// // // //         return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], aod];
// // // //       })
// // // //       .filter((p): p is [number, number, number] => p !== null);

// // // //     console.log("generateStaticGrid: Valid points for interpolation:", points.length, points);

// // // //     const bbox = turf.bbox(turf.featureCollection(validBoundaryFeatures));
// // // //     console.log("generateStaticGrid: Bounding box:", bbox);

// // // //     const cellSize = 0.02;
// // // //     const grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });
// // // //     console.log("generateStaticGrid: Grid points created:", grid.features.length);

// // // //     let interpolated = turf.featureCollection([]);
// // // //     if (points.length > 0) {
// // // //       try {
// // // //         interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { aod: p[2] }))), cellSize / 4, { gridType: "point", property: "aod", units: "degrees", weight: 2.5 });
// // // //         console.log("generateStaticGrid: Interpolated points:", interpolated.features.length);
// // // //       } catch (error) {
// // // //         console.error("Interpolation error:", error);
// // // //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // //       }
// // // //     } else {
// // // //       console.warn("generateStaticGrid: No valid points for interpolation");
// // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // //     }
// // // //     interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];

// // // //     const boundaryPolygon = turf.featureCollection(validBoundaryFeatures);
// // // //     const clipped = turf.pointsWithinPolygon(turf.featureCollection(grid.features), boundaryPolygon);
// // // //     console.log("generateStaticGrid: Clipped points:", clipped.features.length);

// // // //     const canvas = document.createElement("canvas");
// // // //     const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
// // // //     const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
// // // //     canvas.width = width;
// // // //     canvas.height = height;
// // // //     const ctx = canvas.getContext("2d");

// // // //     if (!ctx) {
// // // //       console.error("generateStaticGrid: Failed to get canvas context");
// // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // //     }

// // // //     ctx.fillStyle = "rgba(0, 0, 0, 0)";
// // // //     ctx.fillRect(0, 0, width, height);

// // // //     let validPoints = 0;
// // // //     clipped.features.forEach((feature) => {
// // // //       const coords = feature.geometry.coordinates;

// // // //       if (!Array.isArray(coords) || coords.length !== 2 || typeof coords[0] !== "number" || typeof coords[1] !== "number") {
// // // //         console.warn("Invalid coordinates, skipping:", coords);
// // // //         return;
// // // //       }

// // // //       const point = turf.point(coords as [number, number]);

// // // //       const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>));

// // // //       let aodValue: number | null = null;
// // // //       if (inBuffer && interpolated.features.length > 0) {
// // // //         const closest = interpolated.features.reduce(
// // // //           (acc, f) => {
// // // //             if (f.geometry.type !== "Point" || !f.properties) return acc;
// // // //             const dist = turf.distance(f.geometry as GeoJSON.Point, coords as [number, number], { units: "degrees" });
// // // //             return dist < acc.dist ? { dist, value: f.properties.aod } : acc;
// // // //           },
// // // //           { dist: Infinity, value: 0 }
// // // //         );
// // // //         aodValue = closest.value > 0 ? closest.value : null;
// // // //       } else {
// // // //         const aodFeature = geoData.features.find((f) => {
// // // //           if (f.geometry.type === "Polygon") {
// // // //             return turf.booleanPointInPolygon(point, turf.polygon(f.geometry.coordinates));
// // // //           } else if (f.geometry.type === "MultiPolygon") {
// // // //             return turf.booleanPointInPolygon(point, turf.multiPolygon(f.geometry.coordinates) as GeoJSON.Feature<GeoJSON.MultiPolygon>);
// // // //           }
// // // //           return false;
// // // //         });
// // // //         aodValue = aodFeature && aodFeature.properties.aod_value != null && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;
// // // //       }

// // // //       if (aodValue == null) return;

// // // //       const color = interpolateColor(aodValue);
// // // //       const x = Math.round((coords[0] - bbox[0]) / cellSize);
// // // //       const y = Math.round((bbox[3] - coords[1]) / cellSize);
// // // //       ctx.fillStyle = color;
// // // //       ctx.fillRect(x, y, 1, 1);
// // // //       validPoints++;
// // // //     });

// // // //     console.log("generateStaticGrid: Valid points drawn on canvas:", validPoints);

// // // //     return { imageUrl: canvas.toDataURL(), bbox };
// // // //   };

// // // //   const cachedGrid = useMemo(() => {
// // // //     if (!geoData || !boundaryData) {
// // // //       console.warn("cachedGrid: Missing geoData or boundaryData");
// // // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // // //     }
// // // //     return generateStaticGrid(geoData, boundaryData);
// // // //   }, [geoData, boundaryData, generateStaticGrid]);

// // // //   useEffect(() => {
// // // //     if (!map || !geoData || !boundaryData) {
// // // //       console.warn("useEffect: Missing map, geoData, or boundaryData");
// // // //       return;
// // // //     }

// // // //     const { imageUrl, bbox } = cachedGrid;
// // // //     console.log("useEffect: Image URL and bbox:", imageUrl, bbox);

// // // //     if (staticLayerRef.current) {
// // // //       map.removeLayer(staticLayerRef.current);
// // // //       staticLayerRef.current = null;
// // // //     }
// // // //     if (tooltipRef.current) {
// // // //       tooltipRef.current.remove();
// // // //       tooltipRef.current = null;
// // // //     }

// // // //     if (imageUrl && Array.isArray(bbox) && bbox.length === 4 && bbox.every((val) => typeof val === "number" && !isNaN(val))) {
// // // //       const bounds: L.LatLngBoundsExpression = [
// // // //         [bbox[1], bbox[0]], // [latMin, lngMin]
// // // //         [bbox[3], bbox[2]], // [latMax, lngMax]
// // // //       ];
// // // //       staticLayerRef.current = L.imageOverlay(imageUrl, bounds, { opacity: 0.85, interactive: true }).addTo(map);
// // // //       console.log("useEffect: ImageOverlay added to map");
// // // //     } else {
// // // //       console.warn("useEffect: Invalid imageUrl or bbox", { imageUrl, bbox });
// // // //     }

// // // //     const handleMouseMove = (e: L.LeafletMouseEvent) => {
// // // //       if (inputRef.current && document.activeElement === inputRef.current) {
// // // //         return;
// // // //       }
// // // //       const { lat, lng } = e.latlng;
// // // //       if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
// // // //         return;
// // // //       }
// // // //       lastPosition.current = { lat, lng };

// // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);

// // // //       timeoutRef.current = setTimeout(() => {
// // // //         if (tooltipRef.current) tooltipRef.current.remove();
// // // //         const point = turf.point([lng, lat]);

// // // //         const candidates =
// // // //           spatialIndexRef.current?.search({
// // // //             minX: lng,
// // // //             minY: lat,
// // // //             maxX: lng,
// // // //             maxY: lat,
// // // //           }) || [];

// // // //         const kelurahan = boundaryData.features.find((bf, index) => {
// // // //           if (!candidates.some((c: RBushItem) => c.featureIndex === index)) return false;
// // // //           if (bf.geometry.type !== "Polygon" && bf.geometry.type !== "MultiPolygon") return false;
// // // //           const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
// // // //           return turf.booleanPointInPolygon(point, polygon as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>);
// // // //         });

// // // //         const aodFeature = geoData.features.find((feature) => {
// // // //           if (feature.geometry.type === "Polygon") {
// // // //             return turf.booleanPointInPolygon(point, turf.polygon(feature.geometry.coordinates));
// // // //           } else if (feature.geometry.type === "MultiPolygon") {
// // // //             return turf.booleanPointInPolygon(point, turf.multiPolygon(feature.geometry.coordinates) as GeoJSON.Feature<GeoJSON.MultiPolygon>);
// // // //           }
// // // //           return false;
// // // //         });
// // // //         const aodValue = aodFeature && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;

// // // //         if (kelurahan?.properties) {
// // // //           tooltipRef.current = L.tooltip({
// // // //             sticky: true,
// // // //             direction: "top",
// // // //             offset: [0, -20],
// // // //             className: styles.customTooltip,
// // // //           })
// // // //             .setLatLng(e.latlng)
// // // //             .setContent(getTooltipContent(aodValue, kelurahan.properties.NAMOBJ))
// // // //             .addTo(map);
// // // //         }
// // // //       }, 500);
// // // //     };

// // // //     map.on("mousemove", handleMouseMove);

// // // //     return () => {
// // // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);
// // // //       map.off("mousemove", handleMouseMove);
// // // //       if (tooltipRef.current) tooltipRef.current.remove();
// // // //       if (staticLayerRef.current) map.removeLayer(staticLayerRef.current);
// // // //     };
// // // //   }, [map, cachedGrid, selectedDate, inputRef, geoData, boundaryData]);

// // // //   return (
// // // //     <>
// // // //       {isLoading && (
// // // //         <div className={styles.loadingOverlay}>
// // // //           <div className={styles.spinner}></div>
// // // //           <span>Memuat Heatmap...</span>
// // // //         </div>
// // // //       )}
// // // //       <div className={styles.legend}>
// // // //         <h4>Legenda AOD</h4>
// // // //         <div className={styles.gradientLegend}>
// // // //           <div
// // // //             className={styles.gradientBar}
// // // //             style={{
// // // //               background: "linear-gradient(to right, rgba(0, 255, 0, 0.85), rgba(0, 0, 255, 0.85), rgba(255, 255, 0, 0.85), rgba(255, 0, 0, 0.85))",
// // // //             }}
// // // //           ></div>
// // // //           <div className={styles.gradientLabels}>
// // // //             <span>0.0</span>
// // // //             <span>1.0+</span>
// // // //           </div>
// // // //         </div>
// // // //       </div>
// // // //     </>
// // // //   );
// // // // };

// // // // export default HeatMapLayer;

// // // "use client";

// // // import { useEffect, useRef, useMemo, useCallback } from "react";
// // // import { useMap } from "react-leaflet";
// // // import L from "leaflet";
// // // import * as turf from "@turf/turf";
// // // import RBush from "rbush";
// // // import styles from "./map.module.css";
// // // import { interpolateColor } from "../../utils/color";
// // // import { GeoJSONData, BoundaryGeoJSONData, BoundaryFeature } from "./types";

// // // interface HeatMapLayerProps {
// // //   geoData: GeoJSONData | null;
// // //   boundaryData: BoundaryGeoJSONData | null;
// // //   selectedDate: string;
// // //   isLoading: boolean;
// // //   inputRef: React.RefObject<HTMLInputElement>;
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
// // //   properties: { aod: number };
// // // }

// // // const HeatMapLayer: React.FC<HeatMapLayerProps> = ({ geoData, boundaryData, selectedDate, isLoading, inputRef }) => {
// // //   const map = useMap();
// // //   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
// // //   const tooltipRef = useRef<L.Tooltip | null>(null);
// // //   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
// // //   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
// // //   const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);
// // //   const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);

// // //   const getTooltipContent = (aodValue: number | null, kelurahanName: string): string => {
// // //     const formattedAodValue = aodValue !== null && aodValue > 0 ? aodValue.toFixed(4) : "No Data";
// // //     const aodColor = aodValue !== null && aodValue > 0 ? interpolateColor(aodValue) : "#a0aec0";
// // //     const textColor = aodColor === "rgba(0, 255, 0, 0.85)" || aodColor === "rgba(255, 255, 0, 0.85)" ? "#000000" : "#ffffff";
// // //     return `
// // //       <div class="${styles.customTooltip}">
// // //         <div class="${styles.kelurahanName}">${kelurahanName}</div>
// // //         <div class="${styles.aodContainer}">
// // //           <div class="${styles.aodCircle}" style="background-color: ${aodColor}; color: ${textColor}">
// // //             ${formattedAodValue}
// // //           </div>
// // //         </div>
// // //       </div>
// // //     `;
// // //   };

// // //   const cachedBoundaries = useMemo(() => {
// // //     if (!geoData) return turf.featureCollection([]);
// // //     const validFeatures = geoData.features
// // //       .filter((f) => f.properties.aod_value != null && f.properties.aod_value > 0)
// // //       .map((feature) => {
// // //         const buffered = turf.buffer(feature.geometry, 0.002, { units: "degrees" });
// // //         if (buffered && (buffered.geometry.type === "Polygon" || buffered.geometry.type === "MultiPolygon")) {
// // //           return buffered as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
// // //         }
// // //         return null;
// // //       })
// // //       .filter((f): f is GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> => f != null);
// // //     return turf.featureCollection(validFeatures);
// // //   }, [geoData]);

// // //   useEffect(() => {
// // //     if (!boundaryData) return;
// // //     const spatialIndex = new RBush<RBushItem>();
// // //     boundaryData.features.forEach((feature, index) => {
// // //       if (feature.geometry.type !== "Polygon" && feature.geometry.type !== "MultiPolygon") {
// // //         return;
// // //       }
// // //       const bbox = turf.bbox(feature.geometry);
// // //       spatialIndex.insert({
// // //         minX: bbox[0],
// // //         minY: bbox[1],
// // //         maxX: bbox[2],
// // //         maxY: bbox[3],
// // //         featureIndex: index,
// // //       });
// // //     });
// // //     spatialIndexRef.current = spatialIndex;

// // //     return () => {
// // //       spatialIndexRef.current = null;
// // //     };
// // //   }, [boundaryData]);

// // //   const generateStaticGrid = useCallback((geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
// // //     console.log("generateStaticGrid: Starting with geoData features:", geoData.features.length);

// // //     if (!boundaryData || !boundaryData.features) {
// // //       console.warn("generateStaticGrid: boundaryData is null or has no features");
// // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // //     }

// // //     const validBoundaryFeatures = boundaryData.features.filter((f): f is BoundaryFeature => f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon");
// // //     if (validBoundaryFeatures.length === 0) {
// // //       console.warn("generateStaticGrid: No valid Polygon or MultiPolygon features in boundaryData");
// // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // //     }

// // //     const points = geoData.features
// // //       .map((feature) => {
// // //         const centroid = turf.centroid(feature.geometry);
// // //         const aod = feature.properties.aod_value;
// // //         if (aod == null || aod <= 0 || isNaN(aod)) {
// // //           console.log("Skipping feature due to invalid aod_value:", feature);
// // //           return null;
// // //         }
// // //         return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], aod];
// // //       })
// // //       .filter((p): p is [number, number, number] => p !== null);

// // //     console.log("generateStaticGrid: Valid points for interpolation:", points.length, points);

// // //     const bbox = turf.bbox(turf.featureCollection(validBoundaryFeatures));
// // //     console.log("generateStaticGrid: Bounding box:", bbox);

// // //     const cellSize = 0.02;
// // //     const grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });
// // //     console.log("generateStaticGrid: Grid points created:", grid.features.length);

// // //     let interpolated = turf.featureCollection([]);
// // //     if (points.length > 0) {
// // //       try {
// // //         interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { aod: p[2] }))), cellSize / 4, { gridType: "point", property: "aod", units: "degrees", weight: 2.5 });
// // //         console.log("generateStaticGrid: Interpolated points:", interpolated.features.length);
// // //       } catch (error) {
// // //         console.error("Interpolation error:", error);
// // //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // //       }
// // //     } else {
// // //       console.warn("generateStaticGrid: No valid points for interpolation");
// // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // //     }
// // //     interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];

// // //     const boundaryPolygon = turf.featureCollection(validBoundaryFeatures);
// // //     const clipped = turf.pointsWithinPolygon(turf.featureCollection(grid.features), boundaryPolygon);
// // //     console.log("generateStaticGrid: Clipped points:", clipped.features.length);

// // //     const canvas = document.createElement("canvas");
// // //     const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
// // //     const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
// // //     canvas.width = width;
// // //     canvas.height = height;
// // //     const ctx = canvas.getContext("2d");

// // //     if (!ctx) {
// // //       console.error("generateStaticGrid: Failed to get canvas context");
// // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // //     }

// // //     ctx.fillStyle = "rgba(0, 0, 0, 0)";
// // //     ctx.fillRect(0, 0, width, height);

// // //     let validPoints = 0;
// // //     clipped.features.forEach((feature) => {
// // //       const coords = feature.geometry.coordinates;

// // //       if (!Array.isArray(coords) || coords.length !== 2 || typeof coords[0] !== "number" || typeof coords[1] !== "number") {
// // //         console.warn("Invalid coordinates, skipping:", coords);
// // //         return;
// // //       }

// // //       const point = turf.point(coords as [number, number]);

// // //       const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>));

// // //       let aodValue: number | null = null;
// // //       if (inBuffer && interpolated.features.length > 0) {
// // //         const closest = interpolated.features.reduce(
// // //           (acc, f) => {
// // //             if (f.geometry.type !== "Point" || !f.properties) return acc;
// // //             const dist = turf.distance(f.geometry as GeoJSON.Point, coords as [number, number], { units: "degrees" });
// // //             return dist < acc.dist ? { dist, value: f.properties.aod } : acc;
// // //           },
// // //           { dist: Infinity, value: 0 }
// // //         );
// // //         aodValue = closest.value > 0 ? closest.value : null;
// // //       } else {
// // //         const aodFeature = geoData.features.find((f) => {
// // //           if (f.geometry.type === "Polygon") {
// // //             return turf.booleanPointInPolygon(point, turf.polygon(f.geometry.coordinates));
// // //           } else if (f.geometry.type === "MultiPolygon") {
// // //             return turf.booleanPointInPolygon(point, turf.multiPolygon(f.geometry.coordinates) as GeoJSON.Feature<GeoJSON.MultiPolygon>);
// // //           }
// // //           return false;
// // //         });
// // //         aodValue = aodFeature && aodFeature.properties.aod_value != null && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;
// // //       }

// // //       if (aodValue == null) return;

// // //       const color = interpolateColor(aodValue);
// // //       const x = Math.round((coords[0] - bbox[0]) / cellSize);
// // //       const y = Math.round((bbox[3] - coords[1]) / cellSize);
// // //       ctx.fillStyle = color;
// // //       ctx.fillRect(x, y, 1, 1);
// // //       validPoints++;
// // //     });

// // //     console.log("generateStaticGrid: Valid points drawn on canvas:", validPoints);

// // //     return { imageUrl: canvas.toDataURL(), bbox };
// // //   }, []); // Tidak ada dependensi eksternal

// // //   const cachedGrid = useMemo(() => {
// // //     if (!geoData || !boundaryData) {
// // //       console.warn("cachedGrid: Missing geoData or boundaryData");
// // //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// // //     }
// // //     return generateStaticGrid(geoData, boundaryData);
// // //   }, [geoData, boundaryData]);

// // //   useEffect(() => {
// // //     if (!map || !geoData || !boundaryData) {
// // //       console.warn("useEffect: Missing map, geoData, or boundaryData");
// // //       return;
// // //     }

// // //     const { imageUrl, bbox } = cachedGrid;
// // //     console.log("useEffect: Image URL and bbox:", imageUrl, bbox);

// // //     if (staticLayerRef.current) {
// // //       map.removeLayer(staticLayerRef.current);
// // //       staticLayerRef.current = null;
// // //     }
// // //     if (tooltipRef.current) {
// // //       tooltipRef.current.remove();
// // //       tooltipRef.current = null;
// // //     }

// // //     if (imageUrl && Array.isArray(bbox) && bbox.length === 4 && bbox.every((val) => typeof val === "number" && !isNaN(val))) {
// // //       const bounds: L.LatLngBoundsExpression = [
// // //         [bbox[1], bbox[0]], // [latMin, lngMin]
// // //         [bbox[3], bbox[2]], // [latMax, lngMax]
// // //       ];
// // //       staticLayerRef.current = L.imageOverlay(imageUrl, bounds, { opacity: 0.85, interactive: true }).addTo(map);
// // //       console.log("useEffect: ImageOverlay added to map");
// // //     } else {
// // //       console.warn("useEffect: Invalid imageUrl or bbox", { imageUrl, bbox });
// // //     }

// // //     const handleMouseMove = (e: L.LeafletMouseEvent) => {
// // //       if (inputRef.current && document.activeElement === inputRef.current) {
// // //         return;
// // //       }
// // //       const { lat, lng } = e.latlng;
// // //       if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
// // //         return;
// // //       }
// // //       lastPosition.current = { lat, lng };

// // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);

// // //       timeoutRef.current = setTimeout(() => {
// // //         if (tooltipRef.current) tooltipRef.current.remove();
// // //         const point = turf.point([lng, lat]);

// // //         const candidates =
// // //           spatialIndexRef.current?.search({
// // //             minX: lng,
// // //             minY: lat,
// // //             maxX: lng,
// // //             maxY: lat,
// // //           }) || [];

// // //         const kelurahan = boundaryData.features.find((bf, index) => {
// // //           if (!candidates.some((c: RBushItem) => c.featureIndex === index)) return false;
// // //           if (bf.geometry.type !== "Polygon" && bf.geometry.type !== "MultiPolygon") return false;
// // //           const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
// // //           return turf.booleanPointInPolygon(point, polygon as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>);
// // //         });

// // //         const aodFeature = geoData.features.find((feature) => {
// // //           if (feature.geometry.type === "Polygon") {
// // //             return turf.booleanPointInPolygon(point, turf.polygon(feature.geometry.coordinates));
// // //           } else if (feature.geometry.type === "MultiPolygon") {
// // //             return turf.booleanPointInPolygon(point, turf.multiPolygon(feature.geometry.coordinates) as GeoJSON.Feature<GeoJSON.MultiPolygon>);
// // //           }
// // //           return false;
// // //         });
// // //         const aodValue = aodFeature && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;

// // //         if (kelurahan?.properties) {
// // //           tooltipRef.current = L.tooltip({
// // //             sticky: true,
// // //             direction: "top",
// // //             offset: [0, -20],
// // //             className: styles.customTooltip,
// // //           })
// // //             .setLatLng(e.latlng)
// // //             .setContent(getTooltipContent(aodValue, kelurahan.properties.NAMOBJ))
// // //             .addTo(map);
// // //         }
// // //       }, 500);
// // //     };

// // //     map.on("mousemove", handleMouseMove);

// // //     return () => {
// // //       if (timeoutRef.current) clearTimeout(timeoutRef.current);
// // //       map.off("mousemove", handleMouseMove);
// // //       if (tooltipRef.current) tooltipRef.current.remove();
// // //       if (staticLayerRef.current) map.removeLayer(staticLayerRef.current);
// // //     };
// // //   }, [map, cachedGrid, selectedDate, inputRef, geoData, boundaryData]);

// // //   return (
// // //     <>
// // //       {isLoading && (
// // //         <div className={styles.loadingOverlay}>
// // //           <div className={styles.spinner}></div>
// // //           <span>Memuat Heatmap...</span>
// // //         </div>
// // //       )}
// // //       <div className={styles.legend}>
// // //         <h4>Legenda AOD</h4>
// // //         <div className={styles.gradientLegend}>
// // //           <div
// // //             className={styles.gradientBar}
// // //             style={{
// // //               background: "linear-gradient(to right, rgba(0, 255, 0, 0.85), rgba(0, 0, 255, 0.85), rgba(255, 255, 0, 0.85), rgba(255, 0, 0, 0.85))",
// // //             }}
// // //           ></div>
// // //           <div className={styles.gradientLabels}>
// // //             <span>0.0</span>
// // //             <span>1.0+</span>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </>
// // //   );
// // // };

// // // export default HeatMapLayer;

// // "use client";

// // import { useEffect, useRef, useMemo, useCallback } from "react";
// // import { useMap } from "react-leaflet";
// // import L from "leaflet";
// // import * as turf from "@turf/turf";
// // import RBush from "rbush";
// // import styles from "./map.module.css";
// // import { interpolateColor } from "../../utils/color";
// // import { GeoJSONData, BoundaryGeoJSONData, BoundaryFeature } from "./types";

// // interface HeatMapLayerProps {
// //   geoData: GeoJSONData | null;
// //   boundaryData: BoundaryGeoJSONData | null;
// //   selectedDate: string;
// //   isLoading: boolean;
// //   inputRef: React.RefObject<HTMLInputElement>;
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
// //   properties: { aod: number };
// // }

// // const HeatMapLayer: React.FC<HeatMapLayerProps> = ({ geoData, boundaryData, selectedDate, isLoading, inputRef }) => {
// //   const map = useMap();
// //   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
// //   const tooltipRef = useRef<L.Tooltip | null>(null);
// //   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
// //   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
// //   const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);
// //   const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);

// //   const getTooltipContent = (aodValue: number | null, kelurahanName: string): string => {
// //     const formattedAodValue = aodValue !== null && aodValue > 0 ? aodValue.toFixed(4) : "No Data";
// //     const aodColor = aodValue !== null && aodValue > 0 ? interpolateColor(aodValue) : "#a0aec0";
// //     const textColor = aodColor === "rgba(0, 255, 0, 0.85)" || aodColor === "rgba(255, 255, 0, 0.85)" ? "#000000" : "#ffffff";
// //     return `
// //       <div class="${styles.customTooltip}">
// //         <div class="${styles.kelurahanName}">${kelurahanName}</div>
// //         <div class="${styles.aodContainer}">
// //           <div class="${styles.aodCircle}" style="background-color: ${aodColor}; color: ${textColor}">
// //             ${formattedAodValue}
// //           </div>
// //         </div>
// //       </div>
// //     `;
// //   };

// //   const cachedBoundaries = useMemo(() => {
// //     if (!geoData) return turf.featureCollection([]);
// //     const validFeatures = geoData.features
// //       .filter((f) => f.properties.aod_value != null && f.properties.aod_value > 0)
// //       .map((feature) => {
// //         const buffered = turf.buffer(feature.geometry, 0.002, { units: "degrees" });
// //         if (buffered && (buffered.geometry.type === "Polygon" || buffered.geometry.type === "MultiPolygon")) {
// //           return buffered as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
// //         }
// //         return null;
// //       })
// //       .filter((f): f is GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> => f != null);
// //     return turf.featureCollection(validFeatures);
// //   }, [geoData]);

// //   useEffect(() => {
// //     if (!boundaryData) return;
// //     const spatialIndex = new RBush<RBushItem>();
// //     boundaryData.features.forEach((feature, index) => {
// //       if (feature.geometry.type !== "Polygon" && feature.geometry.type !== "MultiPolygon") {
// //         return;
// //       }
// //       const bbox = turf.bbox(feature.geometry);
// //       spatialIndex.insert({
// //         minX: bbox[0],
// //         minY: bbox[1],
// //         maxX: bbox[2],
// //         maxY: bbox[3],
// //         featureIndex: index,
// //       });
// //     });
// //     spatialIndexRef.current = spatialIndex;

// //     return () => {
// //       spatialIndexRef.current = null;
// //     };
// //   }, [boundaryData]);

// //   const generateStaticGrid = useCallback(
// //     (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
// //       console.log("generateStaticGrid: Starting with geoData features:", geoData.features.length);

// //       if (!boundaryData || !boundaryData.features) {
// //         console.warn("generateStaticGrid: boundaryData is null or has no features");
// //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// //       }

// //       const validBoundaryFeatures = boundaryData.features.filter((f): f is BoundaryFeature => f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon");
// //       if (validBoundaryFeatures.length === 0) {
// //         console.warn("generateStaticGrid: No valid Polygon or MultiPolygon features in boundaryData");
// //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// //       }

// //       const points = geoData.features
// //         .map((feature) => {
// //           const centroid = turf.centroid(feature.geometry);
// //           const aod = feature.properties.aod_value;
// //           if (aod == null || aod <= 0 || isNaN(aod)) {
// //             console.log("Skipping feature due to invalid aod_value:", feature);
// //             return null;
// //           }
// //           return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], aod];
// //         })
// //         .filter((p): p is [number, number, number] => p !== null);

// //       console.log("generateStaticGrid: Valid points for interpolation:", points.length, points);

// //       const bbox = turf.bbox(turf.featureCollection(validBoundaryFeatures));
// //       console.log("generateStaticGrid: Bounding box:", bbox);

// //       const cellSize = 0.02;
// //       const grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });
// //       console.log("generateStaticGrid: Grid points created:", grid.features.length);

// //       let interpolated = turf.featureCollection([]);
// //       if (points.length > 0) {
// //         try {
// //           interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { aod: p[2] }))), cellSize / 4, { gridType: "point", property: "aod", units: "degrees", weight: 2.5 });
// //           console.log("generateStaticGrid: Interpolated points:", interpolated.features.length);
// //         } catch (error) {
// //           console.error("Interpolation error:", error);
// //           return { imageUrl: null, bbox: [0, 0, 0, 0] };
// //         }
// //       } else {
// //         console.warn("generateStaticGrid: No valid points for interpolation");
// //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// //       }
// //       interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];

// //       const boundaryPolygon = turf.featureCollection(validBoundaryFeatures);
// //       const clipped = turf.pointsWithinPolygon(turf.featureCollection(grid.features), boundaryPolygon);
// //       console.log("generateStaticGrid: Clipped points:", clipped.features.length);

// //       // Pastikan kode ini hanya dijalankan di sisi klien
// //       if (typeof window === "undefined") {
// //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// //       }

// //       const canvas = document.createElement("canvas");
// //       const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
// //       const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
// //       canvas.width = width;
// //       canvas.height = height;
// //       const ctx = canvas.getContext("2d");

// //       if (!ctx) {
// //         console.error("generateStaticGrid: Failed to get canvas context");
// //         return { imageUrl: null, bbox: [0, 0, 0, 0] };
// //       }

// //       ctx.fillStyle = "rgba(0, 0, 0, 0)";
// //       ctx.fillRect(0, 0, width, height);

// //       let validPoints = 0;
// //       clipped.features.forEach((feature) => {
// //         const coords = feature.geometry.coordinates;

// //         if (!Array.isArray(coords) || coords.length !== 2 || typeof coords[0] !== "number" || typeof coords[1] !== "number") {
// //           console.warn("Invalid coordinates, skipping:", coords);
// //           return;
// //         }

// //         const point = turf.point(coords as [number, number]);

// //         const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>));

// //         let aodValue: number | null = null;
// //         if (inBuffer && interpolated.features.length > 0) {
// //           const closest = interpolated.features.reduce(
// //             (acc, f) => {
// //               if (f.geometry.type !== "Point" || !f.properties) return acc;
// //               const dist = turf.distance(f.geometry as GeoJSON.Point, coords as [number, number], { units: "degrees" });
// //               return dist < acc.dist ? { dist, value: f.properties.aod } : acc;
// //             },
// //             { dist: Infinity, value: 0 }
// //           );
// //           aodValue = closest.value > 0 ? closest.value : null;
// //         } else {
// //           const aodFeature = geoData.features.find((f) => {
// //             if (f.geometry.type === "Polygon") {
// //               return turf.booleanPointInPolygon(point, turf.polygon(f.geometry.coordinates));
// //             } else if (f.geometry.type === "MultiPolygon") {
// //               return turf.booleanPointInPolygon(point, turf.multiPolygon(f.geometry.coordinates) as GeoJSON.Feature<GeoJSON.MultiPolygon>);
// //             }
// //             return false;
// //           });
// //           aodValue = aodFeature && aodFeature.properties.aod_value != null && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;
// //         }

// //         if (aodValue == null) return;

// //         const color = interpolateColor(aodValue);
// //         const x = Math.round((coords[0] - bbox[0]) / cellSize);
// //         const y = Math.round((bbox[3] - coords[1]) / cellSize);
// //         ctx.fillStyle = color;
// //         ctx.fillRect(x, y, 1, 1);
// //         validPoints++;
// //       });

// //       console.log("generateStaticGrid: Valid points drawn on canvas:", validPoints);

// //       return { imageUrl: canvas.toDataURL(), bbox };
// //     },
// //     [cachedBoundaries.features]
// //   ); // Tambahkan cachedBoundaries.features sebagai dependensi

// //   const cachedGrid = useMemo(() => {
// //     if (!geoData || !boundaryData) {
// //       console.warn("cachedGrid: Missing geoData or boundaryData");
// //       return { imageUrl: null, bbox: [0, 0, 0, 0] };
// //     }
// //     return generateStaticGrid(geoData, boundaryData);
// //   }, [geoData, boundaryData]); // generateStaticGrid tidak perlu disertakan karena sudah stabil dengan useCallback

// //   useEffect(() => {
// //     if (!map || !geoData || !boundaryData) {
// //       console.warn("useEffect: Missing map, geoData, or boundaryData");
// //       return;
// //     }

// //     const { imageUrl, bbox } = cachedGrid;
// //     console.log("useEffect: Image URL and bbox:", imageUrl, bbox);

// //     if (staticLayerRef.current) {
// //       map.removeLayer(staticLayerRef.current);
// //       staticLayerRef.current = null;
// //     }
// //     if (tooltipRef.current) {
// //       tooltipRef.current.remove();
// //       tooltipRef.current = null;
// //     }

// //     if (imageUrl && Array.isArray(bbox) && bbox.length === 4 && bbox.every((val) => typeof val === "number" && !isNaN(val))) {
// //       const bounds: L.LatLngBoundsExpression = [
// //         [bbox[1], bbox[0]], // [latMin, lngMin]
// //         [bbox[3], bbox[2]], // [latMax, lngMax]
// //       ];
// //       staticLayerRef.current = L.imageOverlay(imageUrl, bounds, { opacity: 0.85, interactive: true }).addTo(map);
// //       console.log("useEffect: ImageOverlay added to map");
// //     } else {
// //       console.warn("useEffect: Invalid imageUrl or bbox", { imageUrl, bbox });
// //     }

// //     const handleMouseMove = (e: L.LeafletMouseEvent) => {
// //       if (inputRef.current && document.activeElement === inputRef.current) {
// //         return;
// //       }
// //       const { lat, lng } = e.latlng;
// //       if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
// //         return;
// //       }
// //       lastPosition.current = { lat, lng };

// //       if (timeoutRef.current) clearTimeout(timeoutRef.current);

// //       timeoutRef.current = setTimeout(() => {
// //         if (tooltipRef.current) tooltipRef.current.remove();
// //         const point = turf.point([lng, lat]);

// //         const candidates =
// //           spatialIndexRef.current?.search({
// //             minX: lng,
// //             minY: lat,
// //             maxX: lng,
// //             maxY: lat,
// //           }) || [];

// //         const kelurahan = boundaryData.features.find((bf, index) => {
// //           if (!candidates.some((c: RBushItem) => c.featureIndex === index)) return false;
// //           if (bf.geometry.type !== "Polygon" && bf.geometry.type !== "MultiPolygon") return false;
// //           const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
// //           return turf.booleanPointInPolygon(point, polygon as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>);
// //         });

// //         const aodFeature = geoData.features.find((feature) => {
// //           if (feature.geometry.type === "Polygon") {
// //             return turf.booleanPointInPolygon(point, turf.polygon(feature.geometry.coordinates));
// //           } else if (feature.geometry.type === "MultiPolygon") {
// //             return turf.booleanPointInPolygon(point, turf.multiPolygon(feature.geometry.coordinates) as GeoJSON.Feature<GeoJSON.MultiPolygon>);
// //           }
// //           return false;
// //         });
// //         const aodValue = aodFeature && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;

// //         if (kelurahan?.properties) {
// //           tooltipRef.current = L.tooltip({
// //             sticky: true,
// //             direction: "top",
// //             offset: [0, -20],
// //             className: styles.customTooltip,
// //           })
// //             .setLatLng(e.latlng)
// //             .setContent(getTooltipContent(aodValue, kelurahan.properties.NAMOBJ))
// //             .addTo(map);
// //         }
// //       }, 500);
// //     };

// //     map.on("mousemove", handleMouseMove);

// //     return () => {
// //       if (timeoutRef.current) clearTimeout(timeoutRef.current);
// //       map.off("mousemove", handleMouseMove);
// //       if (tooltipRef.current) tooltipRef.current.remove();
// //       if (staticLayerRef.current) map.removeLayer(staticLayerRef.current);
// //     };
// //   }, [map, cachedGrid, selectedDate, inputRef, geoData, boundaryData]);

// //   return (
// //     <>
// //       {isLoading && (
// //         <div className={styles.loadingOverlay}>
// //           <div className={styles.spinner}></div>
// //           <span>Memuat Heatmap...</span>
// //         </div>
// //       )}
// //       <div className={styles.legend}>
// //         <h4>Legenda AOD</h4>
// //         <div className={styles.gradientLegend}>
// //           <div
// //             className={styles.gradientBar}
// //             style={{
// //               background: "linear-gradient(to right, rgba(0, 255, 0, 0.85), rgba(0, 0, 255, 0.85), rgba(255, 255, 0, 0.85), rgba(255, 0, 0, 0.85))",
// //             }}
// //           ></div>
// //           <div className={styles.gradientLabels}>
// //             <span>0.0</span>
// //             <span>1.0+</span>
// //           </div>
// //         </div>
// //       </div>
// //     </>
// //   );
// // };

// // export default HeatMapLayer;

// "use client";

// import { useEffect, useRef, useMemo, useCallback } from "react";
// import { useMap } from "react-leaflet";
// import L from "leaflet";
// import * as turf from "@turf/turf";
// import RBush from "rbush";
// import styles from "./map.module.css";
// import { interpolateColor } from "../../utils/color";
// import { GeoJSONData, BoundaryGeoJSONData, BoundaryFeature } from "./types";

// interface HeatMapLayerProps {
//   geoData: GeoJSONData | null;
//   boundaryData: BoundaryGeoJSONData | null;
//   selectedDate: string;
//   isLoading: boolean;
//   inputRef: React.RefObject<HTMLInputElement | null>; // Perbaiki tipe untuk menerima null
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
//   properties: { aod: number };
// }

// const HeatMapLayer: React.FC<HeatMapLayerProps> = ({ geoData, boundaryData, selectedDate, isLoading, inputRef }) => {
//   const map = useMap();
//   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
//   const tooltipRef = useRef<L.Tooltip | null>(null);
//   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
//   const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);
//   const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);

//   const getTooltipContent = (aodValue: number | null, kelurahanName: string): string => {
//     const formattedAodValue = aodValue !== null && aodValue > 0 ? aodValue.toFixed(4) : "No Data";
//     const aodColor = aodValue !== null && aodValue > 0 ? interpolateColor(aodValue) : "#a0aec0";
//     const textColor = aodColor === "rgba(0, 255, 0, 0.85)" || aodColor === "rgba(255, 255, 0, 0.85)" ? "#000000" : "#ffffff";
//     return `
//       <div class="${styles.customTooltip}">
//         <div class="${styles.kelurahanName}">${kelurahanName}</div>
//         <div class="${styles.aodContainer}">
//           <div class="${styles.aodCircle}" style="background-color: ${aodColor}; color: ${textColor}">
//             ${formattedAodValue}
//           </div>
//         </div>
//       </div>
//     `;
//   };

//   const cachedBoundaries = useMemo(() => {
//     if (!geoData) return turf.featureCollection([]);
//     const validFeatures = geoData.features
//       .filter((f) => f.properties.aod_value != null && f.properties.aod_value > 0)
//       .map((feature) => {
//         const buffered = turf.buffer(feature.geometry, 0.002, { units: "degrees" });
//         if (buffered && (buffered.geometry.type === "Polygon" || buffered.geometry.type === "MultiPolygon")) {
//           return buffered as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
//         }
//         return null;
//       })
//       .filter((f): f is GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> => f != null);
//     return turf.featureCollection(validFeatures);
//   }, [geoData]);

//   useEffect(() => {
//     if (!boundaryData) return;
//     const spatialIndex = new RBush<RBushItem>();
//     boundaryData.features.forEach((feature, index) => {
//       if (feature.geometry.type !== "Polygon" && feature.geometry.type !== "MultiPolygon") {
//         return;
//       }
//       const bbox = turf.bbox(feature.geometry);
//       spatialIndex.insert({
//         minX: bbox[0],
//         minY: bbox[1],
//         maxX: bbox[2],
//         maxY: bbox[3],
//         featureIndex: index,
//       });
//     });
//     spatialIndexRef.current = spatialIndex;

//     return () => {
//       spatialIndexRef.current = null;
//     };
//   }, [boundaryData]);

//   const generateStaticGrid = useCallback(
//     (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
//       console.log("generateStaticGrid: Starting with geoData features:", geoData.features.length);

//       if (!boundaryData || !boundaryData.features) {
//         console.warn("generateStaticGrid: boundaryData is null or has no features");
//         return { imageUrl: null, bbox: [0, 0, 0, 0] };
//       }

//       const validBoundaryFeatures = boundaryData.features.filter((f): f is BoundaryFeature => f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon");
//       if (validBoundaryFeatures.length === 0) {
//         console.warn("generateStaticGrid: No valid Polygon or MultiPolygon features in boundaryData");
//         return { imageUrl: null, bbox: [0, 0, 0, 0] };
//       }

//       const points = geoData.features
//         .map((feature) => {
//           const centroid = turf.centroid(feature.geometry);
//           const aod = feature.properties.aod_value;
//           if (aod == null || aod <= 0 || isNaN(aod)) {
//             console.log("Skipping feature due to invalid aod_value:", feature);
//             return null;
//           }
//           return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], aod];
//         })
//         .filter((p): p is [number, number, number] => p !== null);

//       console.log("generateStaticGrid: Valid points for interpolation:", points.length, points);

//       const bbox = turf.bbox(turf.featureCollection(validBoundaryFeatures));
//       console.log("generateStaticGrid: Bounding box:", bbox);

//       const cellSize = 0.02;
//       const grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });
//       console.log("generateStaticGrid: Grid points created:", grid.features.length);

//       let interpolated = turf.featureCollection([]);
//       if (points.length > 0) {
//         try {
//           interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { aod: p[2] }))), cellSize / 4, { gridType: "point", property: "aod", units: "degrees", weight: 2.5 });
//           console.log("generateStaticGrid: Interpolated points:", interpolated.features.length);
//         } catch (error) {
//           console.error("Interpolation error:", error);
//           return { imageUrl: null, bbox: [0, 0, 0, 0] };
//         }
//       } else {
//         console.warn("generateStaticGrid: No valid points for interpolation");
//         return { imageUrl: null, bbox: [0, 0, 0, 0] };
//       }
//       interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];

//       const boundaryPolygon = turf.featureCollection(validBoundaryFeatures);
//       const clipped = turf.pointsWithinPolygon(turf.featureCollection(grid.features), boundaryPolygon);
//       console.log("generateStaticGrid: Clipped points:", clipped.features.length);

//       // Pastikan kode ini hanya dijalankan di sisi klien
//       if (typeof window === "undefined") {
//         return { imageUrl: null, bbox: [0, 0, 0, 0] };
//       }

//       const canvas = document.createElement("canvas");
//       const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
//       const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
//       canvas.width = width;
//       canvas.height = height;
//       const ctx = canvas.getContext("2d");

//       if (!ctx) {
//         console.error("generateStaticGrid: Failed to get canvas context");
//         return { imageUrl: null, bbox: [0, 0, 0, 0] };
//       }

//       ctx.fillStyle = "rgba(0, 0, 0, 0)";
//       ctx.fillRect(0, 0, width, height);

//       let validPoints = 0;
//       clipped.features.forEach((feature) => {
//         const coords = feature.geometry.coordinates;

//         if (!Array.isArray(coords) || coords.length !== 2 || typeof coords[0] !== "number" || typeof coords[1] !== "number") {
//           console.warn("Invalid coordinates, skipping:", coords);
//           return;
//         }

//         const point = turf.point(coords as [number, number]);

//         const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>));

//         let aodValue: number | null = null;
//         if (inBuffer && interpolated.features.length > 0) {
//           const closest = interpolated.features.reduce(
//             (acc, f) => {
//               if (f.geometry.type !== "Point" || !f.properties) return acc;
//               const dist = turf.distance(f.geometry as GeoJSON.Point, coords as [number, number], { units: "degrees" });
//               return dist < acc.dist ? { dist, value: f.properties.aod } : acc;
//             },
//             { dist: Infinity, value: 0 }
//           );
//           aodValue = closest.value > 0 ? closest.value : null;
//         } else {
//           const aodFeature = geoData.features.find((f) => {
//             if (f.geometry.type === "Polygon") {
//               return turf.booleanPointInPolygon(point, turf.polygon(f.geometry.coordinates));
//             } else if (f.geometry.type === "MultiPolygon") {
//               return turf.booleanPointInPolygon(point, turf.multiPolygon(f.geometry.coordinates) as GeoJSON.Feature<GeoJSON.MultiPolygon>);
//             }
//             return false;
//           });
//           aodValue = aodFeature && aodFeature.properties.aod_value != null && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;
//         }

//         if (aodValue == null) return;

//         const color = interpolateColor(aodValue);
//         const x = Math.round((coords[0] - bbox[0]) / cellSize);
//         const y = Math.round((bbox[3] - coords[1]) / cellSize);
//         ctx.fillStyle = color;
//         ctx.fillRect(x, y, 1, 1);
//         validPoints++;
//       });

//       console.log("generateStaticGrid: Valid points drawn on canvas:", validPoints);

//       return { imageUrl: canvas.toDataURL(), bbox };
//     },
//     [cachedBoundaries.features]
//   );

//   const cachedGrid = useMemo(() => {
//     if (!geoData || !boundaryData) {
//       console.warn("cachedGrid: Missing geoData or boundaryData");
//       return { imageUrl: null, bbox: [0, 0, 0, 0] };
//     }
//     return generateStaticGrid(geoData, boundaryData);
//   }, [geoData, boundaryData, generateStaticGrid]); // Tambahkan generateStaticGrid ke dependensi

//   useEffect(() => {
//     if (!map || !geoData || !boundaryData) {
//       console.warn("useEffect: Missing map, geoData, or boundaryData");
//       return;
//     }

//     const { imageUrl, bbox } = cachedGrid;
//     console.log("useEffect: Image URL and bbox:", imageUrl, bbox);

//     if (staticLayerRef.current) {
//       map.removeLayer(staticLayerRef.current);
//       staticLayerRef.current = null;
//     }
//     if (tooltipRef.current) {
//       tooltipRef.current.remove();
//       tooltipRef.current = null;
//     }

//     if (imageUrl && Array.isArray(bbox) && bbox.length === 4 && bbox.every((val) => typeof val === "number" && !isNaN(val))) {
//       const bounds: L.LatLngBoundsExpression = [
//         [bbox[1], bbox[0]], // [latMin, lngMin]
//         [bbox[3], bbox[2]], // [latMax, lngMax]
//       ];
//       staticLayerRef.current = L.imageOverlay(imageUrl, bounds, { opacity: 0.85, interactive: true }).addTo(map);
//       console.log("useEffect: ImageOverlay added to map");
//     } else {
//       console.warn("useEffect: Invalid imageUrl or bbox", { imageUrl, bbox });
//     }

//     const handleMouseMove = (e: L.LeafletMouseEvent) => {
//       if (inputRef.current && document.activeElement === inputRef.current) {
//         return;
//       }
//       const { lat, lng } = e.latlng;
//       if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
//         return;
//       }
//       lastPosition.current = { lat, lng };

//       if (timeoutRef.current) clearTimeout(timeoutRef.current);

//       timeoutRef.current = setTimeout(() => {
//         if (tooltipRef.current) tooltipRef.current.remove();
//         const point = turf.point([lng, lat]);

//         const candidates =
//           spatialIndexRef.current?.search({
//             minX: lng,
//             minY: lat,
//             maxX: lng,
//             maxY: lat,
//           }) || [];

//         const kelurahan = boundaryData.features.find((bf, index) => {
//           if (!candidates.some((c: RBushItem) => c.featureIndex === index)) return false;
//           if (bf.geometry.type !== "Polygon" && bf.geometry.type !== "MultiPolygon") return false;
//           const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
//           return turf.booleanPointInPolygon(point, polygon as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>);
//         });

//         const aodFeature = geoData.features.find((feature) => {
//           if (feature.geometry.type === "Polygon") {
//             return turf.booleanPointInPolygon(point, turf.polygon(feature.geometry.coordinates));
//           } else if (feature.geometry.type === "MultiPolygon") {
//             return turf.booleanPointInPolygon(point, turf.multiPolygon(feature.geometry.coordinates) as GeoJSON.Feature<GeoJSON.MultiPolygon>);
//           }
//           return false;
//         });
//         const aodValue = aodFeature && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;

//         if (kelurahan?.properties) {
//           tooltipRef.current = L.tooltip({
//             sticky: true,
//             direction: "top",
//             offset: [0, -20],
//             className: styles.customTooltip,
//           })
//             .setLatLng(e.latlng)
//             .setContent(getTooltipContent(aodValue, kelurahan.properties.NAMOBJ))
//             .addTo(map);
//         }
//       }, 500);
//     };

//     map.on("mousemove", handleMouseMove);

//     return () => {
//       if (timeoutRef.current) clearTimeout(timeoutRef.current);
//       map.off("mousemove", handleMouseMove);
//       if (tooltipRef.current) tooltipRef.current.remove();
//       if (staticLayerRef.current) map.removeLayer(staticLayerRef.current);
//     };
//   }, [map, cachedGrid, selectedDate, inputRef, geoData, boundaryData]);

//   return (
//     <>
//       {isLoading && (
//         <div className={styles.loadingOverlay}>
//           <div className={styles.spinner}></div>
//           <span>Memuat Heatmap...</span>
//         </div>
//       )}
//       <div className={styles.legend}>
//         <h4>Legenda AOD</h4>
//         <div className={styles.gradientLegend}>
//           <div
//             className={styles.gradientBar}
//             style={{
//               background: "linear-gradient(to right, rgba(0, 255, 0, 0.85), rgba(0, 0, 255, 0.85), rgba(255, 255, 0, 0.85), rgba(255, 0, 0, 0.85))",
//             }}
//           ></div>
//           <div className={styles.gradientLabels}>
//             <span>0.0</span>
//             <span>1.0+</span>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default HeatMapLayer;

"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import * as turf from "@turf/turf";
import RBush from "rbush";
import styles from "./map.module.css";
import { interpolateColor } from "../../utils/color";
import { GeoJSONData, BoundaryGeoJSONData, BoundaryFeature } from "./types";

interface HeatMapLayerProps {
  geoData: GeoJSONData | null;
  boundaryData: BoundaryGeoJSONData | null;
  selectedDate: string;
  isLoading: boolean;
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
  properties: { aod: number };
}

const HeatMapLayer: React.FC<HeatMapLayerProps> = ({ geoData, boundaryData, selectedDate, isLoading, inputRef }) => {
  const map = useMap();
  const staticLayerRef = useRef<L.ImageOverlay | null>(null);
  const tooltipRef = useRef<L.Tooltip | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
  const interpolatedDataRef = useRef<InterpolatedFeature[]>([]);
  const spatialIndexRef = useRef<RBush<RBushItem> | null>(null);

  const getTooltipContent = (aodValue: number | null, kelurahanName: string): string => {
    const formattedAodValue = aodValue !== null && aodValue > 0 ? aodValue.toFixed(4) : "No Data";
    const aodColor = aodValue !== null && aodValue > 0 ? interpolateColor(aodValue) : "#a0aec0";
    const textColor = aodColor === "rgba(0, 255, 0, 0.85)" || aodColor === "rgba(255, 255, 0, 0.85)" ? "#000000" : "#ffffff";
    return `
      <div class="${styles.customTooltip}">
        <div class="${styles.kelurahanName}">${kelurahanName}</div>
        <div class="${styles.aodContainer}">
          <div class="${styles.aodCircle}" style="background-color: ${aodColor}; color: ${textColor}">
            ${formattedAodValue}
          </div>
        </div>
      </div>
    `;
  };

  const cachedBoundaries = useMemo(() => {
    if (!geoData) return turf.featureCollection([]);
    const validFeatures = geoData.features
      .filter((f) => f.properties.aod_value != null && f.properties.aod_value > 0)
      .map((feature) => {
        const buffered = turf.buffer(feature.geometry, 0.002, { units: "degrees" });
        if (buffered && (buffered.geometry.type === "Polygon" || buffered.geometry.type === "MultiPolygon")) {
          return buffered as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
        }
        return null;
      })
      .filter((f): f is GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> => f != null);
    return turf.featureCollection(validFeatures);
  }, [geoData]);

  useEffect(() => {
    if (!boundaryData) return;
    const spatialIndex = new RBush<RBushItem>();
    boundaryData.features.forEach((feature, index) => {
      if (feature.geometry.type !== "Polygon" && feature.geometry.type !== "MultiPolygon") {
        return;
      }
      const bbox = turf.bbox(feature.geometry);
      spatialIndex.insert({
        minX: bbox[0],
        minY: bbox[1],
        maxX: bbox[2],
        maxY: bbox[3],
        featureIndex: index,
      });
    });
    spatialIndexRef.current = spatialIndex;

    return () => {
      spatialIndexRef.current = null;
    };
  }, [boundaryData]);

  const generateStaticGrid = useCallback(
    (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
      console.log("generateStaticGrid: Starting with geoData features:", geoData.features.length);

      if (!boundaryData || !boundaryData.features) {
        console.warn("generateStaticGrid: boundaryData is null or has no features");
        return { imageUrl: null, bbox: [0, 0, 0, 0] };
      }

      const validBoundaryFeatures = boundaryData.features.filter((f): f is BoundaryFeature => f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon");
      if (validBoundaryFeatures.length === 0) {
        console.warn("generateStaticGrid: No valid Polygon or MultiPolygon features in boundaryData");
        return { imageUrl: null, bbox: [0, 0, 0, 0] };
      }

      const points = geoData.features
        .map((feature) => {
          const centroid = turf.centroid(feature.geometry);
          const aod = feature.properties.aod_value;
          if (aod == null || aod <= 0 || isNaN(aod)) {
            console.log("Skipping feature due to invalid aod_value:", feature);
            return null;
          }
          return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], aod];
        })
        .filter((p): p is [number, number, number] => p !== null);

      console.log("generateStaticGrid: Valid points for interpolation:", points.length, points);

      const bbox = turf.bbox(turf.featureCollection(validBoundaryFeatures));
      console.log("generateStaticGrid: Bounding box:", bbox);

      const cellSize = 0.02;
      const grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });
      console.log("generateStaticGrid: Grid points created:", grid.features.length);

      let interpolated = turf.featureCollection([]);
      if (points.length > 0) {
        try {
          interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { aod: p[2] }))), cellSize / 4, { gridType: "point", property: "aod", units: "degrees", weight: 2.5 });
          console.log("generateStaticGrid: Interpolated points:", interpolated.features.length);
        } catch (error) {
          console.error("Interpolation error:", error);
          return { imageUrl: null, bbox: [0, 0, 0, 0] };
        }
      } else {
        console.warn("generateStaticGrid: No valid points for interpolation");
        return { imageUrl: null, bbox: [0, 0, 0, 0] };
      }
      interpolatedDataRef.current = interpolated.features as InterpolatedFeature[];

      const boundaryPolygon = turf.featureCollection(validBoundaryFeatures);
      const clipped = turf.pointsWithinPolygon(turf.featureCollection(grid.features), boundaryPolygon);
      console.log("generateStaticGrid: Clipped points:", clipped.features.length);

      // Defer canvas operations to client-side
      let imageUrl: string | null = null;
      if (typeof window !== "undefined") {
        const canvas = document.createElement("canvas");
        const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
        const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          console.error("generateStaticGrid: Failed to get canvas context");
          return { imageUrl: null, bbox };
        }

        ctx.fillStyle = "rgba(0, 0, 0, 0)";
        ctx.fillRect(0, 0, width, height);

        let validPoints = 0;
        clipped.features.forEach((feature) => {
          const coords = feature.geometry.coordinates;

          if (!Array.isArray(coords) || coords.length !== 2 || typeof coords[0] !== "number" || typeof coords[1] !== "number") {
            console.warn("Invalid coordinates, skipping:", coords);
            return;
          }

          const point = turf.point(coords as [number, number]);

          const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>));

          let aodValue: number | null = null;
          if (inBuffer && interpolated.features.length > 0) {
            const closest = interpolated.features.reduce(
              (acc, f) => {
                if (f.geometry.type !== "Point" || !f.properties) return acc;
                const dist = turf.distance(f.geometry as GeoJSON.Point, coords as [number, number], { units: "degrees" });
                return dist < acc.dist ? { dist, value: f.properties.aod } : acc;
              },
              { dist: Infinity, value: 0 }
            );
            aodValue = closest.value > 0 ? closest.value : null;
          } else {
            const aodFeature = geoData.features.find((f) => {
              if (f.geometry.type === "Polygon") {
                return turf.booleanPointInPolygon(point, turf.polygon(f.geometry.coordinates));
              } else if (f.geometry.type === "MultiPolygon") {
                return turf.booleanPointInPolygon(point, turf.multiPolygon(f.geometry.coordinates) as GeoJSON.Feature<GeoJSON.MultiPolygon>);
              }
              return false;
            });
            aodValue = aodFeature && aodFeature.properties.aod_value != null && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;
          }

          if (aodValue == null) return;

          const color = interpolateColor(aodValue);
          const x = Math.round((coords[0] - bbox[0]) / cellSize);
          const y = Math.round((bbox[3] - coords[1]) / cellSize);
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
          validPoints++;
        });

        console.log("generateStaticGrid: Valid points drawn on canvas:", validPoints);
        imageUrl = canvas.toDataURL();
      }

      return { imageUrl, bbox };
    },
    [cachedBoundaries.features]
  );

  const cachedGrid = useMemo(() => {
    if (!geoData || !boundaryData) {
      console.warn("cachedGrid: Missing geoData or boundaryData");
      return { imageUrl: null, bbox: [0, 0, 0, 0] };
    }
    return generateStaticGrid(geoData, boundaryData);
  }, [geoData, boundaryData, generateStaticGrid]);

  useEffect(() => {
    if (!map || !geoData || !boundaryData) {
      console.warn("useEffect: Missing map, geoData, or boundaryData");
      return;
    }

    const { imageUrl, bbox } = cachedGrid;
    console.log("useEffect: Image URL and bbox:", imageUrl, bbox);

    if (staticLayerRef.current) {
      map.removeLayer(staticLayerRef.current);
      staticLayerRef.current = null;
    }
    if (tooltipRef.current) {
      tooltipRef.current.remove();
      tooltipRef.current = null;
    }

    if (imageUrl && Array.isArray(bbox) && bbox.length === 4 && bbox.every((val) => typeof val === "number" && !isNaN(val))) {
      const bounds: L.LatLngBoundsExpression = [
        [bbox[1], bbox[0]], // [latMin, lngMin]
        [bbox[3], bbox[2]], // [latMax, lngMax]
      ];
      staticLayerRef.current = L.imageOverlay(imageUrl, bounds, { opacity: 0.85, interactive: true, zIndex: 500 }).addTo(map);
      console.log("useEffect: ImageOverlay added to map");
    } else {
      console.warn("useEffect: Invalid imageUrl or bbox", { imageUrl, bbox });
    }

    const handleMouseMove = (e: L.LeafletMouseEvent) => {
      if (inputRef.current && document.activeElement === inputRef.current) {
        return;
      }
      const { lat, lng } = e.latlng;
      if (lastPosition.current && Math.abs(lastPosition.current.lat - lat) < 0.0001 && Math.abs(lastPosition.current.lng - lng) < 0.0001) {
        return;
      }
      lastPosition.current = { lat, lng };

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        if (tooltipRef.current) tooltipRef.current.remove();
        const point = turf.point([lng, lat]);

        const candidates =
          spatialIndexRef.current?.search({
            minX: lng,
            minY: lat,
            maxX: lng,
            maxY: lat,
          }) || [];

        const kelurahan = boundaryData.features.find((bf, index) => {
          if (!candidates.some((c: RBushItem) => c.featureIndex === index)) return false;
          if (bf.geometry.type !== "Polygon" && bf.geometry.type !== "MultiPolygon") return false;
          const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
          return turf.booleanPointInPolygon(point, polygon as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>);
        });

        const aodFeature = geoData.features.find((feature) => {
          if (feature.geometry.type === "Polygon") {
            return turf.booleanPointInPolygon(point, turf.polygon(feature.geometry.coordinates));
          } else if (feature.geometry.type === "MultiPolygon") {
            return turf.booleanPointInPolygon(point, turf.multiPolygon(feature.geometry.coordinates) as GeoJSON.Feature<GeoJSON.MultiPolygon>);
          }
          return false;
        });
        const aodValue = aodFeature && aodFeature.properties.aod_value != null && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;

        if (kelurahan?.properties) {
          tooltipRef.current = L.tooltip({
            sticky: true,
            direction: "top",
            offset: [0, -20],
            className: styles.customTooltip,
          })
            .setLatLng(e.latlng)
            .setContent(getTooltipContent(aodValue, kelurahan.properties.NAMOBJ))
            .addTo(map);
        }
      }, 500);
    };

    map.on("mousemove", handleMouseMove);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      map.off("mousemove", handleMouseMove);
      if (tooltipRef.current) tooltipRef.current.remove();
      if (staticLayerRef.current) map.removeLayer(staticLayerRef.current);
    };
  }, [map, cachedGrid, selectedDate, inputRef, geoData, boundaryData]);

  return (
    <>
      {isLoading && (
        <div className={styles.spinnerOverlay}>
          <div className={styles.spinner}></div>
          <span>Memuat Heatmap...</span>
        </div>
      )}
      <div className={styles.legend}>
        <h4>Legenda AOD</h4>
        <div className={styles.gradientLegend}>
          <div
            className={styles.gradientBar}
            style={{
              background: "linear-gradient(to right, rgba(0, 255, 0, 0.85), rgba(0, 0, 255, 0.85), rgba(255, 255, 0, 0.85), rgba(255, 0, 0, 0.85))",
            }}
          ></div>
          <div className={styles.gradientLabels}>
            <span>0.0</span>
            <span>1.0+</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeatMapLayer;
