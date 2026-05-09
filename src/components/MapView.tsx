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
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

interface Props {
  stations: RankedStation[];
  bestStationId: string | null;
  selectedStationId: string | null;
  mode: "demo" | "real";
  onStationSelect: (id: string) => void;
}

export default function MapView({ 
  stations, 
  bestStationId, 
  selectedStationId, 
  mode,
  onStationSelect 
}: Props) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const center = useMemo<[number, number]>(() => {
    if (stations.length === 0) return [37.7749, -122.4194];
    const lat = stations.reduce((acc, s) => acc + s.location.lat, 0) / stations.length;
    const lng = stations.reduce((acc, s) => acc + s.location.lng, 0) / stations.length;
    return [lat, lng];
  }, [stations]);

  const bestStation = stations.find(s => s.id === bestStationId);

  return (
    <div className="relative w-full h-[430px] rounded-3xl overflow-hidden border border-white/10 glass shadow-2xl">
      <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
          <p className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">Tactical Overlay</p>
          <p className="text-white text-sm font-bold">Sector: {mode.toUpperCase()}</p>
        </div>
      </div>

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
                <div class="absolute w-8 h-8 rounded-full animate-ping opacity-20 ${isBest ? 'bg-green-500' : isSelected ? 'bg-cyan-500' : 'bg-white'}"></div>
                <div class="w-4 h-4 rounded-full border-2 border-white shadow-lg ${isBest ? 'bg-green-500' : isSelected ? 'bg-cyan-400' : 'bg-slate-400'}"></div>
              </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          return (
            <Marker 
              key={s.id} 
              position={[s.location.lat, s.location.lng]} 
              icon={icon}
              eventHandlers={{ click: () => onStationSelect(s.id) }}
            >
              <Popup className="cyber-popup">
                <div className="p-2 min-w-[200px]">
                  <h4 className="font-bold text-lg mb-1">{s.name}</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs opacity-80">
                    <div>Ports: <span className="text-white font-bold">{s.availablePorts}/{s.totalPorts}</span></div>
                    <div>Wait: <span className="text-white font-bold">{s.waitMinutes}m</span></div>
                    <div>Power: <span className="text-white font-bold">{s.chargerKW}kW</span></div>
                    <div>ETA: <span className="text-white font-bold">{s.travelMinutes}m</span></div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/10 text-[10px] uppercase font-bold text-cyan-400">
                    Status: {s.status}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {bestStation && (
          <Polyline 
            positions={[center, [bestStation.location.lat, bestStation.location.lng]]}
            pathOptions={{ color: '#22c55e', weight: 2, dashArray: '10, 10', opacity: 0.6 }}
          />
        )}
      </MapContainer>

      <div className="absolute bottom-4 right-4 z-[1000] pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-right">
          <p className="text-[10px] text-white/40 font-bold uppercase">Uplink Active</p>
          <p className="text-xs text-green-400 font-mono">LAT: {center[0].toFixed(4)} LNG: {center[1].toFixed(4)}</p>
        </div>
      </div>
    </div>
  );
}
