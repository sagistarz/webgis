// "use client";
// import { useEffect, useRef, useMemo } from "react";
// import { useMap } from "react-leaflet";
// import L from "leaflet";
// import * as turf from "@turf/turf";
// import RBush from "rbush";
// import styles from "./map.module.css";
// import { interpolateColor } from "../../utils/color";

// interface FeatureProperties {
//   aod_value: number;
// }

// interface BoundaryProperties {
//   NAMOBJ: string;
// }

// interface Feature {
//   type: string;
//   id: number;
//   properties: FeatureProperties;
//   geometry: turf.Polygon | turf.MultiPolygon;
// }

// interface BoundaryFeature {
//   type: string;
//   properties: BoundaryProperties;
//   geometry: turf.Polygon | turf.MultiPolygon;
// }

// interface GeoJSONData {
//   type: string;
//   features: Feature[];
// }

// interface BoundaryGeoJSONData {
//   type: string;
//   features: BoundaryFeature[];
// }

// interface HeatMapLayerProps {
//   geoData: GeoJSONData | null;
//   boundaryData: BoundaryGeoJSONData | null;
//   selectedDate: string;
//   isLoading: boolean;
//   inputRef: React.RefObject<HTMLInputElement>;
// }

// const HeatMapLayer = ({ geoData, boundaryData, selectedDate, isLoading, inputRef }: HeatMapLayerProps) => {
//   const map = useMap();
//   const staticLayerRef = useRef<L.ImageOverlay | null>(null);
//   const tooltipRef = useRef<L.Tooltip | null>(null);
//   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
//   const interpolatedDataRef = useRef<any[]>([]);
//   const spatialIndexRef = useRef<RBush | null>(null);

//   const getTooltipContent = (aodValue: number | null, kelurahanName: string): string => {
//     const formattedAodValue = aodValue !== null ? aodValue.toFixed(4) : "-";
//     const aodColor = aodValue !== null ? interpolateColor(aodValue) : "#a0aec0";
//     // Warna teks hanya untuk nilai AOD, nama kelurahan tetap default (#374151 dari CSS)
//     const textColor = (aodColor === "rgba(0, 255, 0, 0.85)" || aodColor === "rgba(255, 255, 0, 0.85)") ? "#000000" : "#ffffff";
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
//     return turf.featureCollection(geoData.features.filter((f) => f.properties.aod_value != null && f.properties.aod_value >= 0).map((feature) => turf.buffer(feature.geometry, 0.002, { units: "degrees" })));
//   }, [geoData]);

//   const initializeSpatialIndex = useMemo(() => {
//     if (!boundaryData) return () => {};
//     const spatialIndex = new RBush();
//     boundaryData.features.forEach((feature, index) => {
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

//   const generateStaticGrid = (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
//     const points = geoData.features
//       .map((feature) => {
//         const centroid = turf.centroid(feature.geometry);
//         const aod = feature.properties.aod_value;
//         if (aod == null || aod < 0 || isNaN(aod)) return null;
//         return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], aod];
//       })
//       .filter((p): p is [number, number, number] => p !== null);

//     const bbox = turf.bbox(turf.featureCollection(boundaryData.features));
//     const cellSize = 0.02;
//     const grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });

//     let interpolated = turf.featureCollection([]);
//     if (points.length > 0) {
//       try {
//         interpolated = turf.interpolate(turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { aod: p[2] }))), cellSize / 4, { gridType: "point", property: "aod", units: "degrees", weight: 2.5 });
//       } catch (error) {
//         return { imageUrl: null, bbox: [0, 0, 0, 0] };
//       }
//     }
//     interpolatedDataRef.current = interpolated.features;

//     const boundaryPolygon = turf.featureCollection(boundaryData.features);
//     const clipped = turf.pointsWithinPolygon(turf.featureCollection(grid.features), boundaryPolygon);

//     const canvas = document.createElement("canvas");
//     const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
//     const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
//     canvas.width = width;
//     canvas.height = height;
//     const ctx = canvas.getContext("2d");

//     if (!ctx) return { imageUrl: null, bbox: [0, 0, 0, 0] };

//     ctx.fillStyle = "rgba(0, 0, 0, 0)";
//     ctx.fillRect(0, 0, width, height);

//     clipped.features.forEach((feature) => {
//       const coords = feature.geometry.coordinates;
//       const point = turf.point(coords);

//       const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer));

//       let aodValue: number | null = null;
//       if (inBuffer && interpolated.features.length > 0) {
//         const closest = interpolated.features.reduce(
//           (acc, f) => {
//             const dist = turf.distance(f.geometry.coordinates, coords, { units: "degrees" });
//             return dist < acc.dist ? { dist, value: f.properties.aod } : acc;
//           },
//           { dist: Infinity, value: 0 }
//         );
//         aodValue = closest.value;
//       } else {
//         const aodFeature = geoData.features.find((f) => {
//           const polygon = f.geometry.type === "Polygon" ? turf.polygon(f.geometry.coordinates) : turf.multiPolygon(f.geometry.coordinates);
//           return turf.booleanPointInPolygon(point, polygon);
//         });
//         aodValue = aodFeature && aodFeature.properties.aod_value != null && aodFeature.properties.aod_value >= 0 ? aodFeature.properties.aod_value : null;
//       }

//       if (aodValue == null) return;

//       const color = interpolateColor(aodValue);
//       const x = Math.round((coords[0] - bbox[0]) / cellSize);
//       const y = Math.round((bbox[3] - coords[1]) / cellSize);
//       ctx.fillStyle = color;
//       ctx.fillRect(x, y, 1, 1);
//     });

//     return { imageUrl: canvas.toDataURL(), bbox };
//   };

//   const cachedGrid = useMemo(() => {
//     if (!geoData || !boundaryData) return { imageUrl: null, bbox: [0, 0, 0, 0] };
//     return generateStaticGrid(geoData, boundaryData);
//   }, [geoData, boundaryData]);

//   useEffect(() => {
//     if (!map || !geoData || !boundaryData) {
//       return;
//     }

//     const { imageUrl, bbox } = cachedGrid;

//     if (staticLayerRef.current) {
//       map.removeLayer(staticLayerRef.current);
//       staticLayerRef.current = null;
//     }
//     if (tooltipRef.current) {
//       tooltipRef.current.remove();
//       tooltipRef.current = null;
//     }

//     if (imageUrl) {
//       const bounds = [
//         [bbox[1], bbox[0]],
//         [bbox[3], bbox[2]],
//       ];
//       staticLayerRef.current = L.imageOverlay(imageUrl, bounds, { opacity: 0.85, interactive: true }).addTo(map);
//     }

//     const handleMouseMove = (e: L.LeafletMouseEvent) => {
//       if (document.activeElement === inputRef.current) {
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
//           if (!candidates.some((c: any) => c.featureIndex === index)) return false;
//           const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
//           return turf.booleanPointInPolygon(point, polygon);
//         });

//         const aodFeature = geoData.features.find((feature) => {
//           const polygon = feature.geometry.type === "Polygon" ? turf.polygon(feature.geometry.coordinates) : turf.multiPolygon(feature.geometry.coordinates);
//           return turf.booleanPointInPolygon(point, polygon);
//         });
//         const aodValue = aodFeature ? aodFeature.properties.aod_value : null;

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
//   }, [map, cachedGrid, selectedDate, inputRef]);

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
import { useEffect, useRef, useMemo } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import * as turf from "@turf/turf";
import RBush from "rbush";
import styles from "./map.module.css";
import { interpolateColor } from "../../utils/color";

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

interface HeatMapLayerProps {
  geoData: GeoJSONData | null;
  boundaryData: BoundaryGeoJSONData | null;
  selectedDate: string;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}

const HeatMapLayer = ({ geoData, boundaryData, selectedDate, isLoading, inputRef }: HeatMapLayerProps) => {
  const map = useMap();
  const staticLayerRef = useRef<L.ImageOverlay | null>(null);
  const tooltipRef = useRef<L.Tooltip | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPosition = useRef<{ lat: number; lng: number } | null>(null);
  const interpolatedDataRef = useRef<any[]>([]);
  const spatialIndexRef = useRef<RBush | null>(null);

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
    return turf.featureCollection(
      geoData.features
        .filter((f) => f.properties.aod_value != null && f.properties.aod_value > 0) // Exclude aod_value of 0
        .map((feature) => turf.buffer(feature.geometry, 0.002, { units: "degrees" }))
    );
  }, [geoData]);

  useMemo(() => {
    if (!boundaryData) return;
    const spatialIndex = new RBush();
    boundaryData.features.forEach((feature, index) => {
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
  }, [boundaryData]);

  const generateStaticGrid = (geoData: GeoJSONData, boundaryData: BoundaryGeoJSONData) => {
    const points = geoData.features
      .map((feature) => {
        const centroid = turf.centroid(feature.geometry);
        const aod = feature.properties.aod_value;
        if (aod == null || aod <= 0 || isNaN(aod)) return null; // Treat aod_value of 0 as "No Data"
        return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], aod];
      })
      .filter((p): p is [number, number, number] => p !== null);

    const bbox = turf.bbox(turf.featureCollection(boundaryData.features));
    const cellSize = 0.02;
    const grid = turf.pointGrid(bbox, cellSize, { units: "degrees" });

    let interpolated = turf.featureCollection([]);
    if (points.length > 0) {
      try {
        interpolated = turf.interpolate(
          turf.featureCollection(points.map((p) => turf.point([p[1], p[0]], { aod: p[2] }))),
          cellSize / 4,
          { gridType: "point", property: "aod", units: "degrees", weight: 2.5 }
        );
      } catch (e) {
        return { imageUrl: null, bbox: [0, 0, 0, 0] };
      }
    }
    interpolatedDataRef.current = interpolated.features;

    const boundaryPolygon = turf.featureCollection(boundaryData.features);
    const clipped = turf.pointsWithinPolygon(turf.featureCollection(grid.features), boundaryPolygon);

    const canvas = document.createElement("canvas");
    const width = Math.ceil((bbox[2] - bbox[0]) / cellSize);
    const height = Math.ceil((bbox[3] - bbox[1]) / cellSize);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return { imageUrl: null, bbox: [0, 0, 0, 0] };

    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillRect(0, 0, width, height);

    clipped.features.forEach((feature) => {
      const coords = feature.geometry.coordinates;
      const point = turf.point(coords);

      const inBuffer = cachedBoundaries.features.some((buffer) => turf.booleanPointInPolygon(point, buffer));

      let aodValue: number | null = null;
      if (inBuffer && interpolated.features.length > 0) {
        const closest = interpolated.features.reduce(
          (acc, f) => {
            const dist = turf.distance(f.geometry.coordinates, coords, { units: "degrees" });
            return dist < acc.dist ? { dist, value: f.properties.aod } : acc;
          },
          { dist: Infinity, value: 0 }
        );
        aodValue = closest.value > 0 ? closest.value : null; // Treat interpolated values of 0 as "No Data"
      } else {
        const aodFeature = geoData.features.find((f) => {
          const polygon = f.geometry.type === "Polygon" ? turf.polygon(f.geometry.coordinates) : turf.multiPolygon(f.geometry.coordinates);
          return turf.booleanPointInPolygon(point, polygon);
        });
        aodValue = aodFeature && aodFeature.properties.aod_value != null && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;
      }

      if (aodValue == null) return;

      const color = interpolateColor(aodValue);
      const x = Math.round((coords[0] - bbox[0]) / cellSize);
      const y = Math.round((bbox[3] - coords[1]) / cellSize);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    });

    return { imageUrl: canvas.toDataURL(), bbox };
  };

  const cachedGrid = useMemo(() => {
    if (!geoData || !boundaryData) return { imageUrl: null, bbox: [0, 0, 0, 0] };
    return generateStaticGrid(geoData, boundaryData);
  }, [geoData, boundaryData]);

  useEffect(() => {
    if (!map || !geoData || !boundaryData) {
      return;
    }

    const { imageUrl, bbox } = cachedGrid;

    if (staticLayerRef.current) {
      map.removeLayer(staticLayerRef.current);
      staticLayerRef.current = null;
    }
    if (tooltipRef.current) {
      tooltipRef.current.remove();
      tooltipRef.current = null;
    }

    if (imageUrl) {
      const bounds = [
        [bbox[1], bbox[0]],
        [bbox[3], bbox[2]],
      ];
      staticLayerRef.current = L.imageOverlay(imageUrl, bounds, { opacity: 0.85, interactive: true }).addTo(map);
    }

    const handleMouseMove = (e: L.LeafletMouseEvent) => {
      if (document.activeElement === inputRef.current) {
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
          if (!candidates.some((c: any) => c.featureIndex === index)) return false;
          const polygon = bf.geometry.type === "Polygon" ? turf.polygon(bf.geometry.coordinates) : turf.multiPolygon(bf.geometry.coordinates);
          return turf.booleanPointInPolygon(point, polygon);
        });

        const aodFeature = geoData.features.find((feature) => {
          const polygon = feature.geometry.type === "Polygon" ? turf.polygon(feature.geometry.coordinates) : turf.multiPolygon(feature.geometry.coordinates);
          return turf.booleanPointInPolygon(point, polygon);
        });
        const aodValue = aodFeature && aodFeature.properties.aod_value > 0 ? aodFeature.properties.aod_value : null;

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
  }, [map, cachedGrid, selectedDate, inputRef]);

  return (
    <>
      {isLoading && (
        <div className={styles.loadingOverlay}>
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