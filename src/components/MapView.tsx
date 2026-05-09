"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import type { RankedStation } from "@/lib/charging";

// Dynamically import Leaflet components to prevent SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });
const Tooltip = dynamic(() => import("react-leaflet").then((mod) => mod.Tooltip), { ssr: false });

interface MapViewProps {
  stations: RankedStation[];
  bestStationId?: string | null;
  selectedStationId?: string | null;
  mode?: "demo" | "real";
}

export default function MapView({
  stations,
  bestStationId,
  selectedStationId,
  mode = "demo",
}: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    import("leaflet").then((leaflet) => {
      setL(leaflet);
      // Fix Leaflet's default icon path issues
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, []);

  if (!isMounted || !L) {
    return (
      <div className="relative h-[430px] w-full rounded-3xl border border-white/10 bg-[#07090f] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="text-cyan-400/50 animate-pulse font-headline tracking-widest text-xs z-10">
          SYNCHRONIZING GEOSPATIAL UPLINK...
        </div>
      </div>
    );
  }

  const center: [number, number] = stations.length > 0 
    ? [stations[0].location.lat, stations[0].location.lng] 
    : [12.9716, 77.5946];

  const bestStation = stations.find(s => s.id === bestStationId);

  // Custom Neon Icon Generator
  const createNeonIcon = (color: string, isHighlighted: boolean) => {
    const size = isHighlighted ? 28 : 20;
    return L.divIcon({
      className: "custom-neon-marker",
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border: 2px solid #fff;
          border-radius: 50%;
          box-shadow: 0 0 ${isHighlighted ? '25px' : '12px'} ${color}, inset 0 0 5px rgba(255,255,255,0.8);
          transform: translate(-10%, -10%);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${isHighlighted ? '<div class="w-2 h-2 bg-white rounded-full animate-ping"></div>' : ''}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  return (
    <div className="relative h-[430px] w-full rounded-3xl overflow-hidden border border-white/10 glass shadow-2xl isolate">
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: "100%", width: "100%", zIndex: 1 }} 
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {stations.map((station) => {
          const isBest = station.id === bestStationId;
          const isSelected = station.id === selectedStationId;
          
          // Color coding: Green for Best, Cyan for Selected, Purple for others
          const color = isBest ? "#22c55e" : isSelected ? "#06b6d4" : "#a855f7";
          
          return (
            <Marker 
              key={station.id} 
              position={[station.location.lat, station.location.lng]}
              icon={createNeonIcon(color, isBest || isSelected)}
            >
              <Popup className="cyberpunk-popup">
                <div className="p-2 font-body text-slate-900 min-w-[200px]">
                  <h4 className="font-bold border-b border-slate-200 pb-1 mb-2 text-primary uppercase tracking-tight">
                    {station.name}
                  </h4>
                  <div className="space-y-1 text-[11px]">
                    <p className="flex justify-between">
                      <span className="font-semibold text-slate-500 uppercase">Status:</span> 
                      <span className={station.status === 'Free' ? 'text-green-600 font-bold' : 'text-amber-600 font-bold'}>
                        {station.status}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold text-slate-500 uppercase">Ports:</span> 
                      <span className="font-mono">{station.availablePorts} / {station.totalPorts} Available</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold text-slate-500 uppercase">Queue:</span> 
                      <span className="font-mono text-amber-600">{station.queueLength} vehicles</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold text-slate-500 uppercase">Total ETA:</span> 
                      <span className="font-black text-primary">{station.totalEffectiveTime} MIN</span>
                    </p>
                    <div className="pt-2 mt-2 border-t border-slate-100 flex justify-center">
                       <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                        {station.chargerKW}kW Charging
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -15]} opacity={0.9} permanent={isBest || isSelected}>
                <span className="font-bold text-[10px] uppercase tracking-wider bg-black/80 text-white px-2 py-0.5 rounded border border-white/20 backdrop-blur-sm">
                   {isBest ? '⚡ OPTIMAL: ' : ''}{station.name}
                </span>
              </Tooltip>
            </Marker>
          );
        })}

        {bestStation && (
          <Polyline 
            positions={[center, [bestStation.location.lat, bestStation.location.lng]]}
            pathOptions={{ 
              color: '#22c55e', 
              weight: 2, 
              dashArray: '8, 12', 
              opacity: 0.7,
              className: 'animate-pulse'
            }}
          />
        )}
      </MapContainer>

      {/* Map HUD Overlays - Positioned absolutely over the MapContainer */}
      <div className="absolute top-4 left-4 z-[500] pointer-events-none">
        <div className="glass p-3 rounded-2xl border border-white/10 backdrop-blur-md bg-black/40 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <p className="tiny-label text-cyan-400 mb-1">Tactical Grid</p>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[10px] text-white/70 uppercase tracking-widest font-mono">
              {mode === 'demo' ? 'SIM_LINK: ACTIVE' : 'REAL_TIME: SAT_FEED'}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-[500] pointer-events-none text-right">
        <div className="glass p-3 rounded-2xl border border-white/10 backdrop-blur-md bg-black/40 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <p className="tiny-label text-green-400 mb-1">Target Vector</p>
          <p className="text-xs font-bold text-white/90 truncate max-w-[140px] uppercase font-headline">
            {bestStation?.name || "SCANNING..."}
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-[500] pointer-events-none">
        <div className="glass px-4 py-2 rounded-full border border-white/10 backdrop-blur-md bg-black/40 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center space-x-4">
          <p className="text-[10px] text-white/60 font-mono tracking-tighter">
            LAT: {center[0].toFixed(5)}
          </p>
          <div className="w-px h-3 bg-white/20" />
          <p className="text-[10px] text-white/60 font-mono tracking-tighter">
            LNG: {center[1].toFixed(5)}
          </p>
        </div>
      </div>

      <style jsx global>{`
        .cyberpunk-popup .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          border: 1px solid rgba(73, 217, 255, 0.3);
          box-shadow: 0 10px 40px rgba(0,0,0,0.8);
        }
        .cyberpunk-popup .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.95);
        }
        .leaflet-container {
          background: #0b0f14 !important;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .4; }
        }
      `}</style>
    </div>
  );
}