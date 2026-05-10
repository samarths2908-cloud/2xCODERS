"use client";

import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RankedStation, Location } from "@/lib/types";
import { AlertTriangle } from "lucide-react";

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

  // Group stations by identical coordinates
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
          attribution='&copy; CARTO'
        />
        
        <RecenterMap center={[userLocation.lat, userLocation.lng]} />

        {/* User Marker */}
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />

        {groupedStations.map((group) => {
          const s = group[0];
          const isBest = group.some(item => item.id === bestStationId);
          const isSelected = group.some(item => item.id === selectedStationId);
          const isSuspicious = group.some(item => item.isSuspicious);
          
          const stationIcon = L.divIcon({
            className: "custom-marker",
            html: `
              <div class="relative flex items-center justify-center">
                <div class="absolute w-12 h-12 rounded-full animate-ping opacity-10 ${isBest ? 'bg-green-500' : isSelected ? 'bg-cyan-500' : 'bg-white'}"></div>
                <div class="w-6 h-6 rounded-full border-4 border-black shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-300 ${isBest ? 'bg-green-500 scale-125' : isSelected ? 'bg-cyan-400 scale-125' : 'bg-slate-400'}"></div>
                <div class="absolute -top-8 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 whitespace-nowrap">
                  <span class="text-[8px] font-black text-white">${s.name} ${group.length > 1 ? `(${group.length})` : ''}</span>
                </div>
                ${isSuspicious ? `
                  <div class="absolute -bottom-6 flex items-center gap-1 bg-amber-500/90 px-1 py-0.5 rounded border border-white/20">
                    <span class="text-[6px] font-bold text-black">GPS WARNING</span>
                  </div>
                ` : ''}
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
                  
                  {isSuspicious && (
                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl mb-4 text-amber-500">
                      <AlertTriangle className="w-3 h-3" />
                      <p className="text-[9px] font-bold">WARNING: Coordinates outside standard India bounds. Swapped or malformed data likely.</p>
                    </div>
                  )}

                  <div className="space-y-4 max-h-[300px] overflow-auto pr-2">
                    {group.map(item => (
                      <div key={item.id} className="grid grid-cols-2 gap-3 text-xs border-t border-white/5 pt-3 first:border-t-0 first:pt-0">
                        <div className="bg-white/5 p-2 rounded-xl">
                          <p className="text-[8px] opacity-40 uppercase">Hardware</p>
                          <p className="font-bold">{item.chargerKW}kW {item.connectorType}</p>
                        </div>
                        <div className="bg-white/5 p-2 rounded-xl">
                          <p className="text-[8px] opacity-40 uppercase">Operator</p>
                          <p className="font-bold text-white/80">{item.operator}</p>
                        </div>
                        <div className="bg-white/5 p-2 rounded-xl">
                          <p className="text-[8px] opacity-40 uppercase">Ports</p>
                          <p className="font-bold text-green-400">{item.availablePorts}/{item.totalPorts}</p>
                        </div>
                        <div className="bg-white/5 p-2 rounded-xl">
                          <p className="text-[8px] opacity-40 uppercase">Distance</p>
                          <p className="font-bold text-cyan-400">{item.distanceKm.toFixed(1)} km</p>
                        </div>
                        <div className="bg-white/5 p-2 rounded-xl col-span-2">
                          <p className="text-[8px] opacity-40 uppercase">GPS</p>
                          <p className="font-mono text-[9px] text-white/60">{item.latitude}, {item.longitude}</p>
                        </div>
                      </div>
                    ))}
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
              className: 'animate-pulse'
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
