// types/leaflet-geosearch.d.ts
declare module "leaflet-geosearch" {
  import { Control } from "leaflet";

  export class OpenStreetMapProvider {
    constructor(options?: any);
    search(query: string): Promise<any>;
  }

  export class GeoSearchControl extends Control {
    constructor(options: { provider: any; style?: string; showMarker?: boolean; showPopup?: boolean; autoClose?: boolean; retainZoomLevel?: boolean; animateZoom?: boolean; keepResult?: boolean; searchLabel?: string });
  }
}
