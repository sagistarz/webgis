"use client";
import "leaflet/dist/leaflet.css";
import MapWrapper from "@/components/aod/MapWrapper";
import Navbar from "@/components/navbar/Navbar";

export default function MainPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <MapWrapper />
      </main>
    </div>
  );
}
