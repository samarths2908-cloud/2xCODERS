"use client";

import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RankedStation, Location } from "@/lib/types";

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
    map.setView(center, 12, { animate: true });
  }, [center, map]);
  return null;
};

interface Props {
  stations: RankedStation[];
  bestStationId: string | null;
  selectedStationId: string | null;
  userLocation: Location;
  onStationSelect: (id: string) => void;
}

export default function MapView({ 
  stations, 
  bestStationId, 
  selectedStationId, 
  userLocation,
  onStationSelect 
}: Props) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  // Group stations by location for multiple connector display
  const groupedStations = useMemo(() => {
    const groups: Record<string, RankedStation[]> = {};
    stations.forEach(s => {
      const key = `${s.latitude.toFixed(6)},${s.longitude.toFixed(6)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return Object.values(groups);
  }, [stations]);

  const bestStation = stations.find(s => s.id === bestStationId);

  const userIcon = L.divIcon({
    className: "user-marker",
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 rounded-full animate-ping opacity-20 bg-cyan-400"></div>
        <div class="w-6 h-6 rounded-full border-2 border-white bg-cyan-500 shadow-xl"></div>
        <div class="absolute -top-8 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 whitespace-nowrap">
          <span class="text-[8px] font-black text-white uppercase tracking-widest">YOU ARE HERE</span>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return (
    <div className="relative w-full h-[450px] rounded-[2rem] overflow-hidden border border-white/10 glass shadow-2xl z-0">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={12}
        style={{ height: "100%", width: "100%", background: "#0a0a0a" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <RecenterMap center={[userLocation.lat, userLocation.lng]} />

        {/* User Marker */}
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />

        {groupedStations.map((group) => {
          const s = group[0]; // Representative for location
          const isBest = group.some(item => item.id === bestStationId);
          const isSelected = group.some(item => item.id === selectedStationId);
          
          const stationIcon = L.divIcon({
            className: "custom-marker",
            html: `
              <div class="relative flex items-center justify-center">
                <div class="absolute w-12 h-12 rounded-full animate-ping opacity-10 ${isBest ? 'bg-green-500' : isSelected ? 'bg-cyan-500' : 'bg-white'}"></div>
                <div class="w-6 h-6 rounded-full border-4 border-black shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-300 ${isBest ? 'bg-green-500 scale-125' : isSelected ? 'bg-cyan-400 scale-125' : 'bg-slate-400'}"></div>
                <div class="absolute -top-8 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 whitespace-nowrap">
                  <span class="text-[8px] font-black text-white">${s.name} ${group.length > 1 ? `(${group.length})` : ''}</span>
                </div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          return (
            <Marker 
              key={s.id} 
              position={[s.latitude, s.longitude]} 
              icon={stationIcon}
              eventHandlers={{ click: () => onStationSelect(s.id) }}
            >
              <Popup className="cyber-popup">
                <div className="p-3 min-w-[280px]">
                  <h4 className="font-bold text-xl mb-1 text-cyan-400">{s.name}</h4>
                  <p className="text-[10px] text-white/50 mb-4 uppercase tracking-widest">{s.city}, {s.state}</p>
                  
                  <div className="space-y-4">
                    {group.map(item => (
                      <div key={item.id} className="grid grid-cols-2 gap-3 text-xs border-t border-white/5 pt-3 first:border-t-0 first:pt-0">
                        <div className="bg-white/5 p-2 rounded-xl">
                          <p className="text-[8px] opacity-40 uppercase">Hardware</p>
                          <p className="font-bold">{item.chargerKW}kW {item.connectorType}</p>
                        </div>
                        <div className="bg-white/5 p-2 rounded-xl">
                          <p className="text-[8px] opacity-40 uppercase">Avail Ports</p>
                          <p className="font-bold text-green-400">{item.availablePorts}/{item.totalPorts}</p>
                        </div>
                        <div className="bg-white/5 p-2 rounded-xl">
                          <p className="text-[8px] opacity-40 uppercase">Current Queue</p>
                          <p className="font-bold text-amber-400">{item.queueLength} Vehicles</p>
                        </div>
                        <div className="bg-white/5 p-2 rounded-xl">
                          <p className="text-[8px] opacity-40 uppercase">Travel ETA</p>
                          <p className="font-bold text-cyan-400">{item.travelMinutes} Min</p>
                        </div>
                        <div className="bg-white/5 p-2 rounded-xl col-span-2">
                          <p className="text-[8px] opacity-40 uppercase">Coordinates</p>
                          <p className="font-mono text-[9px] text-white/60">{item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}</p>
                        </div>
                      </div>
                    ))}
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
            positions={[
              [userLocation.lat, userLocation.lng], 
              [bestStation.latitude, bestStation.longitude]
            ]}
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
          <p className="text-[10px] text-cyan-400 font-black tracking-[0.2em] uppercase mb-1">Live Grid Uplink</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-white text-sm font-bold">Sector: KA-SOUTH-ZONE</p>
          </div>
        </div>
      </div>
    </div>
  );
}
