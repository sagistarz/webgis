// "use client";

// import React, { useRef, useEffect } from "react";
// import { MapContainer, TileLayer, useMap, GeoJSON } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import "leaflet.heat";
// import styles from "./map.module.css";
// import HeatMapLayer from "./HeatMapLayer";

// interface MapProps {
//   geoData: any | null;
//   boundaryData: any | null;
//   selectedDate: string;
//   isLoading: boolean;
// }

// const Map: React.FC<MapProps> = ({ geoData, boundaryData, selectedDate, isLoading }) => {
//   const mapRef = useRef<L.Map | null>(null);
//   const inputRef = useRef<HTMLInputElement | null>(null);

//   const MapHandler = () => {
//     const map = useMap();

//     useEffect(() => {
//       mapRef.current = map;
//       const stopKeyboardPropagation = (e: L.LeafletKeyboardEvent) => {
//         if (inputRef.current === document.activeElement) {
//           e.originalEvent.stopPropagation();
//         }
//       };

//       map.addEventListener("keydown", stopKeyboardPropagation);
//       return () => {
//         map.removeEventListener("keydown", stopKeyboardPropagation);
//         mapRef.current = null;
//       };
//     }, [map]);

//     return null;
//   };

//   const styleBoundary = () => ({
//     weight: 1,
//     opacity: 0.8,
//     color: "#4a90e2",
//     fillOpacity: 0,
//   });

//   return (
//     <MapContainer
//       center={[-6.1754, 106.8272]}
//       zoom={12}
//       className={styles.map}
//       zoomControl={false}
//       minZoom={11}
//       maxZoom={18}
//       maxBounds={[
//         [-6.42, 106.64],
//         [-5.98, 107.05],
//       ]}
//       maxBoundsViscosity={1.0}
//     >
//       <MapHandler />
//       <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/">CARTO</a>' />
//       {geoData && boundaryData && <HeatMapLayer geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} isLoading={isLoading} inputRef={inputRef} />}
//       {boundaryData && (
//         <GeoJSON
//           data={boundaryData}
//           style={styleBoundary}
//           onEachFeature={(feature, layer) => {
//             layer.on({
//               mouseover: (e) => {
//                 const layer = e.target;
//                 layer.setStyle({
//                   weight: 2,
//                   color: "#2b6cb0",
//                   fillOpacity: 0.1,
//                 });
//                 layer.bringToFront();
//               },
//               mouseout: (e) => {
//                 const layer = e.target;
//                 layer.setStyle({
//                   weight: 1,
//                   color: "#4a90e2",
//                   fillOpacity: 0,
//                 });
//               },
//             });
//           }}
//         />
//       )}
//     </MapContainer>
//   );
// };

// export default Map;

"use client";

import React, { useRef, useEffect } from "react";
import { MapContainer, TileLayer, useMap, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import styles from "./map.module.css";
import HeatMapLayer from "./HeatMapLayer";

interface MapProps {
  geoData: any | null;
  boundaryData: any | null;
  selectedDate: string;
  isLoading: boolean;
  mapRef: React.MutableRefObject<L.Map | null>;
}

const Map: React.FC<MapProps> = ({ geoData, boundaryData, selectedDate, isLoading, mapRef }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const MapHandler = () => {
    const map = useMap();

    useEffect(() => {
      mapRef.current = map;
      const stopKeyboardPropagation = (e: L.LeafletKeyboardEvent) => {
        if (inputRef.current === document.activeElement) {
          e.originalEvent.stopPropagation();
        }
      };

      map.addEventListener("keydown", stopKeyboardPropagation);
      return () => {
        map.removeEventListener("keydown", stopKeyboardPropagation);
        mapRef.current = null;
      };
    }, [map]);

    return null;
  };

  const styleBoundary = () => ({
    weight: 1,
    opacity: 0.8,
    color: "#4a90e2",
    fillOpacity: 0,
  });

  return (
    <MapContainer
      center={[-6.1754, 106.8272]}
      zoom={12}
      className={styles.map}
      zoomControl={false}
      minZoom={11}
      maxZoom={18}
      maxBounds={[
        [-6.42, 106.64],
        [-5.98, 107.05],
      ]}
      maxBoundsViscosity={1.0}
    >
      <MapHandler />
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='© <a href="https://carto.com/">CARTO</a>' />
      {geoData && boundaryData && <HeatMapLayer geoData={geoData} boundaryData={boundaryData} selectedDate={selectedDate} isLoading={isLoading} inputRef={inputRef} />}
      {boundaryData && (
        <GeoJSON
          data={boundaryData}
          style={styleBoundary}
          onEachFeature={(feature, layer) => {
            layer.on({
              mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                  weight: 2,
                  color: "#2b6cb0",
                  fillOpacity: 0.1,
                });
                layer.bringToFront();
              },
              mouseout: (e) => {
                const layer = e.target;
                layer.setStyle({
                  weight: 1,
                  color: "#4a90e2",
                  fillOpacity: 0,
                });
              },
            });
          }}
        />
      )}
    </MapContainer>
  );
};

export default Map;
