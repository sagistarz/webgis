import * as L from "leaflet";

export const getBoundaryStyle = (): L.PathOptions => ({
  color: "blue", // Warna biru terang
  weight: 0.3,
  fillColor: "#FFFFFF",
  fillOpacity: 0.01,
});
