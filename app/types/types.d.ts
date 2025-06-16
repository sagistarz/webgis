// types.d.ts
import * as L from "leaflet";

declare module "georaster" {
  interface GeoRaster {
    values: any[][][];
    noDataValue: number;
    projection: number;
    xmin: number;
    xmax: number;
    ymin: number;
    ymax: number;
    width: number;
    height: number;
    pixelWidth: number;
    pixelHeight: number;
  }
  function parseGeoraster(data: ArrayBuffer): Promise<GeoRaster>;
}

declare module "georaster-layer-for-leaflet" {
  class GeoRasterLayer extends L.Layer {
    constructor(options: { georaster: any; opacity?: number; resolution?: number; pixelValuesToColorFn?: (values: number[]) => string; clip?: any });
  }
}
