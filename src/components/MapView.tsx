"use client";

import React, { useMemo } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, PolylineF } from "@react-google-maps/api";
import type { RankedStation } from "@/lib/charging";
import { Info, Loader2, MapPin } from "lucide-react";

type Props = {
  stations: RankedStation[];
  bestStationId: string | null;
  selectedStationId: string | null;
  mode: "demo" | "real";
};

const mapContainerStyle = {
  width: "100%",
  height: "430px",
};

// Cyberpunk Dark Map Theme for Google Maps
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0b0f14" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b0f14" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#49d9ff" }, { opacity: 0.6 }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bc7dff" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#49d9ff" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0b151a" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a232e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2c3e50" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#001b2e" }] },
];

const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 }; // Bangalore

export default function MapView({
  stations,
  bestStationId,
  selectedStationId,
  mode,
}: Props) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const center = useMemo(() => {
    if (stations.length > 0) {
      return stations[0].location;
    }
    return DEFAULT_CENTER;
  }, [stations]);

  const bestStation = useMemo(
    () => stations.find((s) => s.id === bestStationId),
    [stations, bestStationId]
  );

  const routePath = useMemo(() => {
    if (!bestStation) return [];
    // Drawing a simple straight neural-link for the route
    return [center, bestStation.location];
  }, [center, bestStation]);

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-[430px] rounded-[2rem] border border-red-500/20 text-center p-8 glass bg-black/40">
        <Info className="w-12 h-12 text-red-500 mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-white mb-2">Uplink Failed</h3>
        <p className="text-sm text-white/40 max-w-xs">
          Google Maps API key is invalid or missing from environment variables.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[430px] rounded-[2rem] border border-white/5 glass bg-black/40">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#020408] w-full"
      style={{
        boxShadow: "inset 0 0 60px rgba(0,255,255,0.03), 0 20px 50px rgba(0,0,0,0.5)",
      }}
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
        options={{
          styles: darkMapStyle,
          disableDefaultUI: true,
          zoomControl: false,
          gestureHandling: "cooperative",
        }}
      >
        {bestStation && (
          <PolylineF
            path={routePath}
            options={{
              strokeColor: "#34f5a3",
              strokeOpacity: 0.6,
              strokeWeight: 4,
              icons: [
                {
                  icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 4 },
                  offset: "0",
                  repeat: "20px",
                },
              ],
            }}
          />
        )}

        {stations.map((station) => {
          const isBest = station.id === bestStationId;
          const isSelected = station.id === selectedStationId;

          let color = "#49d9ff"; // Default cyan
          if (isBest) color = "#34f5a3"; // Best green
          else if (isSelected) color = "#bc7dff"; // Selected purple

          return (
            <MarkerF
              key={station.id}
              position={station.location}
              title={station.name}
              icon={{
                path: "M 12 2 C 7.03 2 3 6.03 3 11 C 3 16.55 12 22 12 22 C 12 22 21 16.55 21 11 C 21 6.03 16.97 2 12 2 Z",
                fillColor: color,
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 1,
                scale: isBest || isSelected ? 1.5 : 1,
                anchor: { x: 12, y: 22 } as any,
              }}
            />
          );
        })}
      </GoogleMap>

      {/* Real-time HUD Status Overlay */}
      <div className="absolute inset-x-6 bottom-6 z-20 pointer-events-none">
        <div className="rounded-3xl border border-white/10 bg-black/60 p-5 backdrop-blur-2xl shadow-2xl relative pointer-events-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${bestStation ? 'text-green-400' : 'text-cyan-400'}`}>
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Optimal Target</p>
                <p className="text-sm font-bold text-white tracking-tight">{bestStation?.name || "Identifying Station..."}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-6">
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Est. Total Time</p>
                <p className="text-2xl font-black text-white tracking-tighter">
                  {bestStation?.totalEffectiveTime || "--"} <span className="text-[10px] text-cyan-400 font-bold ml-1 uppercase">Min</span>
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[10px] font-bold text-white/60 uppercase tracking-widest">
                {mode} Uplink
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}