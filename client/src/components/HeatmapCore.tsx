"use client";

import { MapContainer, TileLayer, useMap, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import { useEffect } from "react";

// Dummy misinformation points near Mumbai (lat, lng, intensity)
const points: [number, number, number][] = [
  [19.076, 72.8777, 0.8],  // Mumbai
  [19.21, 72.84, 0.6],     // North Mumbai
  [18.95, 72.82, 0.7],     // South Mumbai
  [19.12, 72.92, 0.9],     // Thane side
  [18.97, 72.83, 0.5],     // Colaba
];

// Custom Heatmap layer using leaflet.heat
function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();

  useEffect(() => {
    // Create heat layer with darker, more intense colors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const heatLayer = (L as any).heatLayer(points, {
      radius: 30,   // slightly larger radius for better visibility
      blur: 15,     // more blur for smoother gradients
      maxZoom: 17,
      max: 1.0,     // maximum point intensity
      minOpacity: 0.6, // minimum opacity to make points darker
      gradient: {
        0.1: "#000080", // dark blue
        0.3: "#0000FF", // blue
        0.5: "#00FF00", // green
        0.7: "#FFFF00", // yellow
        0.8: "#FF8000", // orange
        0.9: "#FF4000", // red-orange
        1.0: "#FF0000", // red
      },
    }).addTo(map);

    // cleanup on unmount
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

// Helper function to create polygon points around a center
function createRegionPolygon(lat: number, lng: number, intensity: number): [number, number][] {
  const points: [number, number][] = [];
  const baseRadius = intensity * 0.03; // Base radius in degrees
  const sides = 8; // Octagon for more organic shape
  
  // Create irregular polygon by varying the radius
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides;
    // Add some randomness to make it more organic
    const radiusVariation = 0.7 + (Math.sin(angle * 3) * 0.3);
    const currentRadius = baseRadius * radiusVariation;
    
    const pointLat = lat + currentRadius * Math.cos(angle);
    const pointLng = lng + currentRadius * Math.sin(angle);
    points.push([pointLat, pointLng]);
  }
  
  return points;
}

// Component for outlined regions around high-intensity points
function OutlinedAreas({ points }: { points: [number, number, number][] }) {
  return (
    <>
      {points.map((point, index) => {
        const [lat, lng, intensity] = point;
        const polygonPoints = createRegionPolygon(lat, lng, intensity);
        
        // Red-yellow color mix based on intensity
        const redComponent = Math.round(255 * intensity);
        const yellowComponent = Math.round(255 * (1 - intensity * 0.5));
        const color = `rgb(${redComponent}, ${yellowComponent}, 0)`;
        
        return (
          <Polygon
            key={index}
            positions={polygonPoints}
            pathOptions={{
              color: color,
              weight: 3,
              opacity: 0.9,
              fillColor: color,
              fillOpacity: 0.15,
              dashArray: "8, 4", // dashed outline
            }}
          />
        );
      })}
    </>
  );
}

export default function HeatmapCore() {
  return (
    <div className="h-80 w-full rounded-xl overflow-hidden">
      <MapContainer
        center={[19.076, 72.8777]} // Mumbai
        zoom={11}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatmapLayer points={points} />
        <OutlinedAreas points={points} />
      </MapContainer>
    </div>
  );
}
