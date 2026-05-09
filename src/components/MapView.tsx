
"use client";

import React, { useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api";
import type { RankedStation } from "@/lib/charging";
import { Navigation, Activity, Info, Loader2 } from "lucide-react";

type Props = {
  stations: RankedStation[];
  bestStationId: string | null;
  selectedStationId: string | null;
  mode: "demo" | "real";
};

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

// Cyberpunk Dark Map Theme
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0b0f14" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b0f14" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#49d9ff" }, { opacity: 0.6 }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bc7dff" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#49d9ff" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#0b151a" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1a232e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#2c3e50" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#001b2e" }],
  },
];

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
    return { lat: 12.9716, lng: 77.5946 }; // Default to Bangalore center
  }, [stations]);

  const bestStation = useMemo(() => stations.find((s) => s.id === bestStationId), [stations, bestStationId]);
  const selectedStation = useMemo(() => stations.find((s) => s.id === selectedStationId), [stations, selectedStationId]);

  // Route to best station
  const routePath = useMemo(() => {
    if (!bestStation) return [];
    return [center, bestStation.location];
  }, [center, bestStation]);

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-black/40 rounded-[2rem] border border-red-500/20 text-center p-8 glass">
        <Info className="w-12 h-12 text-red-500 mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-white mb-2">Navigation Uplink Failed</h3>
        <p className="text-sm text-white/40 max-w-xs">Could not initialize Google Maps. Check your API key in the environment configuration.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-black/40 rounded-[2rem] border border-white/5 glass">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#020408] min-h-[500px] w-full group"
      style={{
        boxShadow: "inset 0 0 60px rgba(0,255,255,0.03), 0 20px 50px rgba(0,0,0,0.5)",
      }}
    >
      {/* HUD Header Labels */}
      <div className="absolute inset-x-8 top-8 flex items-start justify-between z-10 pointer-events-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">
            <Activity className="w-3 h-3" />
            <span>Smart Neural Navigation</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tighter text-white/90">
            Sector <span className="text-cyan-400">Uplink</span> Feed
          </h3>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-[10px] font-bold text-cyan-300 backdrop-blur-md uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,255,0.1)]">
            {mode === "demo" ? "Simulation Active" : "Real-Time GPS"}
          </div>
        </div>
      </div>

      {/* Google Map Implementation */}
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
        {/* Route Line */}
        {bestStation && (
          <Polyline
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

        {/* Station Markers */}
        {stations.map((station) => {
          const isBest = station.id === bestStationId;
          const isSelected = station.id === selectedStationId;

          let color = "#ffffff";
          if (isBest) color = "#34f5a3";
          else if (isSelected) color = "#49d9ff";

          return (
            <Marker
              key={station.id}
              position={station.location}
              title={station.name}
              icon={{
                path: "M 0,0 m -8,0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0",
                fillColor: color,
                fillOpacity: 1,
                strokeColor: "#000",
                strokeWeight: 2,
                scale: isBest || isSelected ? 1.5 : 1,
              }}
            />
          );
        })}
      </GoogleMap>

      {/* Bottom Glass HUD Panel */}
      <div className="absolute inset-x-6 bottom-6 z-20 pointer-events-none">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl shadow-2xl overflow-hidden relative pointer-events-auto">
          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/[0.02] to-transparent h-[200%] animate-[scan_8s_linear_infinite]" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="flex items-center gap-4 border-r border-white/5 pr-6">
              <div className="p-3 rounded-2xl bg-white/5 text-cyan-400">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Active Mode</p>
                <p className="text-sm font-bold text-white capitalize">{mode} Integration</p>
              </div>
            </div>

            <div className="flex items-center gap-4 border-r border-white/5 pr-6">
              <div className={`p-3 rounded-2xl bg-white/5 ${bestStation ? 'text-green-400' : 'text-white/20'}`}>
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Target Vector</p>
                <p className="text-sm font-bold text-white">{bestStation?.name || "Locating..."}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-white/5 text-purple-400">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Network ETA</p>
                <p className="text-xl font-black text-white tracking-tighter">
                  {bestStation?.totalEffectiveTime || "--"} <span className="text-[10px] text-cyan-400 font-bold ml-1">MIN</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          from { transform: translateY(-50%); }
          to { transform: translateY(50%); }
        }
      `}</style>
    </div>
  );
}
