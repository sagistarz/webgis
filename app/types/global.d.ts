// export {};

// declare global {
//   interface Window {
//     initMap: () => void;
//   }
// }

declare module "@turf/turf" {
  export type Polygon = GeoJSON.Polygon;
  export type MultiPolygon = GeoJSON.MultiPolygon;
  export type Position = GeoJSON.Position;
}
