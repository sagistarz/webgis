"use client";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapWrapper from "./components/aod/MapWrapper";
import Navbar from "./components/navbar/page";
import Link from "next/link";

export default function MainPage() {
  return (
    <>
      <Navbar />
      <MapWrapper />
    </>
  );
}
