import { Polygon, MultiPolygon } from "geojson";

export interface FeatureProperties {
  aod_value: number;
  [key: string]: any;
}

export interface Feature {
  type: string;
  id: number | string;
  properties: FeatureProperties;
  geometry: Polygon | MultiPolygon;
}

export interface GeoJSONData {
  type: string;
  features: Feature[];
  crs?: {
    type: string;
    properties: {
      name: string;
    };
  };
}
