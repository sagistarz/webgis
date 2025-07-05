import * as L from "leaflet";

export const getBoundaryStyle = (): L.PathOptions => ({
  color: "black", 
  weight: 0.3,
  fillColor: "#FFFFFF",
  fillOpacity: 0.01,
});
