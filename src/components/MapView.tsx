
"use client";

import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { RankedStation } from "@/lib/charging";

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="relative h-[430px] w-full rounded-3xl border border-white/10 bg-[#07090f] flex items-center justify-center">
        <div className="text-cyan-400/50 animate-pulse font-headline tracking-widest text-xs">
          INITIALIZING GEOSPATIAL UPLINK...
        </div>
      </div>
    );
  }

  // Import Leaflet components dynamically or inside the render cycle after mount
  const { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } = require("react-leaflet");
  const L = require("leaflet");

  // Fix Leaflet's default icon path issues
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  const center: [number, number] = stations.length > 0 
    ? [stations[0].location.lat, stations[0].location.lng] 
    : [12.9716, 77.5946];

  const bestStation = stations.find(s => s.id === bestStationId);

  // Custom Neon Icon Generator
  const createNeonIcon = (color: string, isHighlighted: boolean) => {
    const size = isHighlighted ? 24 : 16;
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
          transform: translate(-25%, -25%);
        "></div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  return (
    <div className="relative h-[430px] w-full rounded-3xl overflow-hidden border border-white/10 glass shadow-2xl">
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: "100%", width: "100%", zIndex: 1 }} 
        scrollWheelZoom={true}
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
                      <span className="font-semibold text-slate-500 uppercase">Distance:</span> 
                      <span className="font-mono">{station.distanceKm.toFixed(1)} km</span>
                    </p>
                    <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between items-end">
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Total ETA</span>
                        <span className="text-lg font-black text-primary font-headline leading-none">
                          {station.totalEffectiveTime}<small className="text-[10px] ml-0.5">MIN</small>
                        </span>
                      </div>
                      <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                        {station.chargerKW}kW
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -10]} opacity={0.9} permanent={isBest || isSelected}>
                <span className="font-bold text-[10px] uppercase tracking-wider">{station.name}</span>
              </Tooltip>
            </Marker>
          );
        })}

        {bestStation && (
          <Polyline 
            positions={[center, [bestStation.location.lat, bestStation.location.lng]]}
            pathOptions={{ 
              color: '#22c55e', 
              weight: 3, 
              dashArray: '10, 15', 
              opacity: 0.6,
              className: 'animate-pulse'
            }}
          />
        )}
      </MapContainer>

      {/* Map HUD Overlays */}
      <div className="absolute top-4 left-4 z-[500] pointer-events-none">
        <div className="glass p-3 rounded-2xl border border-white/10 backdrop-blur-md">
          <p className="tiny-label text-cyan-400">Tactical HUD</p>
          <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono">
            {mode === 'demo' ? 'SIM_UPLINK_ACTIVE' : 'REAL_TIME_SAT_LINK'}
          </p>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-[500] pointer-events-none text-right">
        <div className="glass p-3 rounded-2xl border border-white/10 backdrop-blur-md">
          <p className="tiny-label text-green-400">Best Vector</p>
          <p className="text-xs font-bold text-white/90 truncate max-w-[140px] uppercase">
            {bestStation?.name || "SCANNING..."}
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-[500] pointer-events-none">
        <div className="glass px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
          <p className="text-[9px] text-white/40 font-mono tracking-tighter">
            LAT: {center[0].toFixed(5)} // LNG: {center[1].toFixed(5)}
          </p>
        </div>
      </div>

      <style jsx global>{`
        .cyberpunk-popup .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .cyberpunk-popup .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.95);
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .4; }
        }
      `}</style>
    </div>
  );
}
