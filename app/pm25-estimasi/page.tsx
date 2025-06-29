"use client";

import React from "react";
import Navbar from "@/components/navbar/Navbar";
import Map from "@/components/pm25-estimasi/Map";

export default function PM25EstimasiPage() {
  return (
    <div>
      <Navbar />
      <Map />
    </div>
  );
}
