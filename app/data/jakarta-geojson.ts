import { JakartaFeature } from "../types";

export const loadJakartaGeoJSON = async (): Promise<JakartaFeature[]> => {
  try {
    const response = await fetch("/geojson/kelurahan-jakarta.json");
    const geoJSON = await response.json();

    return geoJSON.features.map((feature: any) => ({
      ...feature,
      properties: {
        ...feature.properties,
        pm25: 0, // Default value, bisa di-override nanti
        color: "#CCCCCC", // Default color
        updated: new Date().toISOString(),
      },
    }));
  } catch (error) {
    console.error("Failed to load GeoJSON:", error);
    return [];
  }
};
