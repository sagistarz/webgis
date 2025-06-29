import * as GeoJSON from "geojson";

export interface Feature {
  type: "Feature";
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  properties: {
    aod_value: number | null;
    pm25_value: number | null;
  } & Record<string, unknown>;
}

export interface BoundaryFeature {
  type: "Feature";
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  properties: {
    NAMOBJ: string;
  } & Record<string, unknown>;
}

export interface GeoJSONData {
  type: "FeatureCollection";
  features: GeoJSON.Feature<GeoJSON.Point | GeoJSON.Polygon | GeoJSON.MultiPolygon, { aod_value?: number; pm25_value?: number }>[];
}

export interface BoundaryGeoJSONData {
  type: "FeatureCollection";
  features: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, { NAMOBJ: string } & Record<string, unknown>>[];
}

export interface PM25Data {
  id: number;
  station_name: string;
  latitude: number;
  longitude: number;
  date: string;
  pm25_value: number | null;
  station: number;
}

export interface WeatherData {
  id: number;
  temperature: number;
  precipitation: number;
  humidity: number;
  wind_dir: number;
  wind_speed: number;
  station_name: string;
  latitude: number;
  longitude: number;
}

export interface StationData {
  station_name: string;
  latitude: number;
  longitude: number;
  pm25_value: number | null;
}

export interface FeatureProperties {
  name: string;
  city?: string;
  district?: string;
  subdistrict?: string;
  pm25_value?: number;
  aod_value?: number;
  color?: string;
  updated: string;
  kecamatan?: string;
  kota?: string;
  NAMOBJ?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface BoundaryProperties {
  NAMOBJ: string;
  [key: string]: string | number | boolean | null | undefined;
}