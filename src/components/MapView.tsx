"use client";

import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RankedStation } from "@/lib/types";

// Fix Leaflet icon issue
const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
};

const RecenterMap = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13, { animate: true });
  }, [center, map]);
  return null;
};

interface Props {
  stations: RankedStation[];
  bestStationId: string | null;
  selectedStationId: string | null;
  onStationSelect: (id: string) => void;
}

export default function MapView({ 
  stations, 
  bestStationId, 
  selectedStationId, 
  onStationSelect 
}: Props) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const center = useMemo<[number, number]>(() => {
    if (stations.length === 0) return [12.9716, 77.5946]; // Default to Bangalore
    const lat = stations.reduce((acc, s) => acc + s.location.lat, 0) / stations.length;
    const lng = stations.reduce((acc, s) => acc + s.location.lng, 0) / stations.length;
    return [lat, lng];
  }, [stations]);

  const bestStation = stations.find(s => s.id === bestStationId);

  return (
    <div className="relative w-full h-[450px] rounded-[2rem] overflow-hidden border border-white/10 glass shadow-2xl z-0">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%", background: "#0a0a0a" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <RecenterMap center={center} />

        {stations.map((s) => {
          const isBest = s.id === bestStationId;
          const isSelected = s.id === selectedStationId;
          
          const icon = L.divIcon({
            className: "custom-marker",
            html: `
              <div class="relative flex items-center justify-center">
                <div class="absolute w-12 h-12 rounded-full animate-ping opacity-10 ${isBest ? 'bg-green-500' : isSelected ? 'bg-cyan-500' : 'bg-white'}"></div>
                <div class="w-6 h-6 rounded-full border-4 border-black shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-300 ${isBest ? 'bg-green-500 scale-125' : isSelected ? 'bg-cyan-400 scale-125' : 'bg-slate-400'}"></div>
                <div class="absolute -top-8 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 whitespace-nowrap">
                  <span class="text-[8px] font-black text-white">${s.name}</span>
                </div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          return (
            <Marker 
              key={s.id} 
              position={[s.location.lat, s.location.lng]} 
              icon={icon}
              eventHandlers={{ click: () => onStationSelect(s.id) }}
            >
              <Popup className="cyber-popup">
                <div className="p-3 min-w-[240px]">
                  <h4 className="font-bold text-xl mb-1 text-cyan-400">{s.name}</h4>
                  <p className="text-[10px] text-white/50 mb-4 uppercase tracking-widest">{s.city}, {s.state}</p>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/5 p-2 rounded-xl">
                      <p className="text-[8px] opacity-40 uppercase">Hardware</p>
                      <p className="font-bold">{s.chargerKW}kW {s.connectorType}</p>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl">
                      <p className="text-[8px] opacity-40 uppercase">Avail Ports</p>
                      <p className="font-bold text-green-400">{s.availablePorts}/{s.totalPorts}</p>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl">
                      <p className="text-[8px] opacity-40 uppercase">Current Queue</p>
                      <p className="font-bold text-amber-400">{s.queueLength} Vehicles</p>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl">
                      <p className="text-[8px] opacity-40 uppercase">Travel ETA</p>
                      <p className="font-bold text-cyan-400">{s.travelMinutes} Min</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-white/10 text-[10px] uppercase font-black text-cyan-400 flex justify-between">
                    <span>STATUS: {s.status}</span>
                    <span>{s.operator}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {bestStation && (
          <Polyline 
            positions={[center, [bestStation.location.lat, bestStation.location.lng]]}
            pathOptions={{ 
              color: '#22c55e', 
              weight: 3, 
              dashArray: '12, 12', 
              opacity: 0.8,
              lineCap: 'round',
              className: 'animate-pulse'
            }}
          />
        )}
      </MapContainer>

      <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl">
          <p className="text-[10px] text-cyan-400 font-black tracking-[0.2em] uppercase mb-1">Grid Uplink</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-white text-sm font-bold">Sector: SOUTH-INDIA-1</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none w-[90%]">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-3xl flex items-center justify-between">
          <div className="flex gap-10">
            <div>
              <p className="text-[9px] text-white/40 uppercase font-black">Active Nodes</p>
              <p className="text-sm font-bold">{stations.length}</p>
            </div>
            <div>
              <p className="text-[9px] text-white/40 uppercase font-black">Target Sync</p>
              <p className="text-sm font-bold text-green-400">{bestStation?.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-white/40 uppercase font-black">Coordinate Precision</p>
            <p className="text-[10px] text-cyan-400 font-mono">LAT: {center[0].toFixed(4)} LNG: {center[1].toFixed(4)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
