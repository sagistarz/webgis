declare module "leaflet.heat" {
  import * as L from "leaflet";

  export function heatLayer(
    latlngs: [number, number, number][],
    options?: {
      minOpacity?: number;
      maxZoom?: number;
      max?: number;
      radius?: number;
      blur?: number;
      gradient?: { [key: number]: string };
    }
  ): L.Layer;
}
