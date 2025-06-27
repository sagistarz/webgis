// // // import { GeoJSON } from "geojson";

// // // export interface PM25Data {
// // //   date: string;
// // //   PM2_5: number;
// // // }

// // // export interface JakartaFeatureProperties {
// // //   name: string;
// // //   city?: string;
// // //   district?: string;
// // //   subdistrict?: string;
// // //   pm25: number;
// // //   color?: string;
// // //   updated: string;
// // //   kecamatan?: string;
// // //   kota?: string;
// // //   // tambahkan properti lain yang diperlukan
// // //   [key: string]: any; // untuk menangani properti tambahan
// // // }

// // // export interface JakartaFeature extends GeoJSON.Feature<GeoJSON.Polygon> {
// // //   properties: JakartaFeatureProperties;
// // // }

// // import { GeoJSON, Polygon, MultiPolygon } from "geojson";

// // export interface PM25Data {
// //   date: string;
// //   PM2_5: number;
// // }

// // export interface JakartaFeatureProperties {
// //   name: string;
// //   city?: string;
// //   district?: string;
// //   subdistrict?: string;
// //   pm25: number;
// //   color?: string;
// //   updated: string;
// //   kecamatan?: string;
// //   kota?: string;
// //   aod_value?: number;
// //   NAMOBJ?: string;
// //   [key: string]: string | number | undefined;
// // }

// // export interface JakartaFeature extends GeoJSON.Feature<Polygon | MultiPolygon, JakartaFeatureProperties> {}

// import { GeoJSON, Polygon, MultiPolygon } from "geojson";

// export interface PM25Data {
//   date: string;
//   PM2_5: number;
// }

// export interface JakartaFeatureProperties {
//   name: string;
//   city?: string;
//   district?: string;
//   subdistrict?: string;
//   pm25: number;
//   color?: string;
//   updated: string;
//   kecamatan?: string;
//   kota?: string;
//   aod_value?: number;
//   NAMOBJ?: string;
//   // Allow additional properties with specific types
//   [key: string]: string | number | boolean | null | undefined;
// }

// export interface JakartaFeature extends GeoJSON.Feature<Polygon | MultiPolygon, JakartaFeatureProperties> {}

import { GeoJSON, Polygon, MultiPolygon } from "geojson";

export interface PM25Data {
  date: string;
  PM2_5: number;
}

export interface JakartaFeatureProperties {
  name: string;
  city?: string;
  district?: string;
  subdistrict?: string;
  pm25: number;
  color?: string;
  updated: string;
  kecamatan?: string;
  kota?: string;
  aod_value?: number;
  NAMOBJ?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export type JakartaFeature = GeoJSON.Feature<Polygon | MultiPolygon, JakartaFeatureProperties>;
