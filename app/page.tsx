"use client";
import "leaflet/dist/leaflet.css";
import MapWrapper from "./components/aod/MapWrapper";
import Navbar from "./components/navbar/page";

export default function MainPage() {
  return (
    <>
      <Navbar />
      <MapWrapper />
    </>
  );
}
