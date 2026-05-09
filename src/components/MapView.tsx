
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="relative h-[430px] w-full rounded-3xl border border-white/10 bg-[#07090f] flex items-center justify-center">
        <div className="text-cyan-400/50 animate-pulse font-headline tracking-widest text-xs">
          INITIALIZING GEOSPATIAL UPLINK...
        </div>
      </div>
    );
  }

  // Next.js dynamic import alternative: standard require inside client check
  const { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } = require("react-leaflet");
  const L = require("leaflet");

  // Fix missing marker icon issue
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

  // Custom icon colors using DivIcon for a cyberpunk neon feel
  const createIcon = (color: string, isHighlighted: boolean) => {
    const size = isHighlighted ? 22 : 14;
    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border: 2px solid #fff;
          border-radius: 50%;
          box-shadow: 0 0 ${isHighlighted ? '20px' : '10px'} ${color};
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
          const color = isBest ? "#22c55e" : isSelected ? "#06b6d4" : "#a855f7";
          
          return (
            <Marker 
              key={station.id} 
              position={[station.location.lat, station.location.lng]}
              icon={createIcon(color, isBest || isSelected)}
            >
              <Popup className="cyberpunk-popup">
                <div className="p-1 font-body text-slate-900 min-w-[180px]">
                  <h4 className="font-bold border-b border-slate-200 pb-1 mb-2 text-primary">{station.name}</h4>
                  <div className="space-y-1 text-xs">
                    <p className="flex justify-between">
                      <span className="font-semibold text-slate-500">Status:</span> 
                      <span className={station.status === 'Free' ? 'text-green-600 font-bold' : 'text-amber-600 font-bold'}>{station.status}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold text-slate-500">Availability:</span> 
                      <span className="font-mono">{station.availablePorts} / {station.totalPorts} ports</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold text-slate-500">Queue:</span> 
                      <span className="font-mono">{station.queueLength} vehicles</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold text-slate-500">Distance:</span> 
                      <span className="font-mono">{station.distanceKm.toFixed(1)} km</span>
                    </p>
                    <p className="flex justify-between border-t border-slate-100 pt-1 mt-1">
                      <span className="font-semibold text-primary">Total ETA:</span> 
                      <span className="font-bold text-primary font-headline">{station.totalEffectiveTime} min</span>
                    </p>
                  </div>
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                <span className="font-bold text-xs">{station.name}</span>
              </Tooltip>
            </Marker>
          );
        })}

        {bestStation && (
          <Polyline 
            positions={[center, [bestStation.location.lat, bestStation.location.lng]]}
            pathOptions={{ color: '#22c55e', weight: 2, dashArray: '8, 12', opacity: 0.5 }}
          />
        )}
      </MapContainer>

      {/* Map HUD Overlays */}
      <div className="absolute top-4 left-4 z-[500] pointer-events-none">
        <div className="glass p-3 rounded-2xl border border-white/10 backdrop-blur-md">
          <p className="tiny-label text-cyan-400">Tactical HUD</p>
          <p className="text-[10px] text-white/50 uppercase tracking-widest">
            {mode === 'demo' ? 'Uplink: Simulation' : 'Uplink: Real-Time'}
          </p>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-[500] pointer-events-none">
        <div className="glass p-3 rounded-2xl border border-white/10 backdrop-blur-md text-right">
          <p className="tiny-label text-green-400">Target Node</p>
          <p className="text-xs font-bold text-white/90 truncate max-w-[120px]">
            {bestStation?.name || "Searching..."}
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-[500] pointer-events-none">
        <div className="glass px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
          <p className="text-[9px] text-white/40 font-mono">GEO-COORD: {center[0].toFixed(4)}, {center[1].toFixed(4)}</p>
        </div>
      </div>
    </div>
  );
}
