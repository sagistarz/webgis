// import * as GeoJSON from "geojson";

// export interface FeatureProperties {
//   pm25_value: number | null;
// }

// export interface BoundaryProperties {
//   NAMOBJ: string;
// }

// export interface Feature extends GeoJSON.Feature {
//   id?: number;
//   properties: FeatureProperties;
//   geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
// }

// export interface BoundaryFeature extends GeoJSON.Feature {
//   properties: BoundaryProperties;
//   geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
// }

// export interface GeoJSONData extends GeoJSON.FeatureCollection {
//   features: Feature[];
// }

// export interface BoundaryGeoJSONData extends GeoJSON.FeatureCollection {
//   features: BoundaryFeature[];
// }

// export interface InterpolatedFeature extends GeoJSON.Feature {
//   geometry: GeoJSON.Point;
//   properties: { pm25: number };
// }

// export interface RBushItem {
//   minX: number;
//   minY: number;
//   maxX: number;
//   maxY: number;
//   featureIndex: number;
// }

import * as GeoJSON from "geojson";

export interface FeatureProperties {
  pm25_value: number;
}

export interface BoundaryProperties {
  NAMOBJ: string;
}

export interface Feature {
  type: "Feature";
  id: number;
  properties: FeatureProperties;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}

export interface BoundaryFeature {
  type: "Feature";
  properties: BoundaryProperties;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}

export interface GeoJSONData {
  type: "FeatureCollection";
  features: Feature[];
}

export interface BoundaryGeoJSONData {
  type: "FeatureCollection";
  features: BoundaryFeature[];
}
