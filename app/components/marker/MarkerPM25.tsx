"use client";

import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import React from "react";

interface PM25MarkerProps {
  station: {
    id: number;
    station_name: string;
    latitude: number;
    longitude: number;
    date: string;
    pm25_value: number | null;
    station: number;
  };
}

const PM25Marker: React.FC<PM25MarkerProps> = ({ station }) => {
  const getMarkerIcon = (pm25: number | null) => {
    let color = "#888"; // Default gray for null/NaN

    if (pm25 !== null && !isNaN(pm25)) {
      if (pm25 <= 50) color = "#00CC00"; // Good
      else if (pm25 <= 100) color = "#0133FF"; // Moderate
      else if (pm25 <= 199) color = "#FFC900"; // Unhealthy
      else if (pm25 <= 299) color = "#FF0000"; // Very unhealthy
      else color = "#222222"; // Hazardous
    }

    return L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          background: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          ${pm25 !== null && !isNaN(pm25) ? Math.round(pm25) : "N/A"}
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  return (
    <Marker position={[station.latitude, station.longitude]} icon={getMarkerIcon(station.pm25_value)}>
      <Popup>
        <div className="pm25-popup">
          <h3 className="font-bold text-lg mb-2">{station.station_name.replace(/_/g, " ").toUpperCase()}</h3>
          <div className="grid gap-2">
            <div>
              <p className="font-semibold">Konsentrasi PM2.5:</p>
              <p>{station.pm25_value !== null && !isNaN(station.pm25_value) ? `${station.pm25_value.toFixed(2)} µg/m³` : "Data tidak tersedia"}</p>
            </div>
            <div>
              <p className="font-semibold">Tanggal:</p>
              <p>{new Date(station.date).toLocaleDateString("id-ID")}</p>
            </div>
            <div>
              <p className="font-semibold">Kategori:</p>
              <p>
                {station.pm25_value === null || isNaN(station.pm25_value)
                  ? "Tidak diketahui"
                  : station.pm25_value <= 50
                  ? "BAIK"
                  : station.pm25_value <= 100
                  ? "SEDANG"
                  : station.pm25_value <= 199
                  ? "TIDAK SEHAT"
                  : station.pm25_value <= 299
                  ? "SANGAT TIDAK SEHAT"
                  : "BERBAHAYA"}
              </p>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default PM25Marker;
