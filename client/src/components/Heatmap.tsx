"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Create a wrapper component that will be dynamically imported
const MapWrapper = dynamic(() => import("@/components/HeatmapCore"), { 
  ssr: false,
  loading: () => (
    <div className="h-80 w-full rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  )
});

export default function HeatmapMap() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-80 w-full rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return <MapWrapper />;
}