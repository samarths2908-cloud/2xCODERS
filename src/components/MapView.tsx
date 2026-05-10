"use client";

import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RankedStation, Location } from "@/lib/types";
import { AlertTriangle, Zap, Clock, Navigation } from "lucide-react";

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
    map.setView(center, map.getZoom(), { animate: true });
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

  // Performance optimization: Grouping is now lightweight
  const groupedStations = useMemo(() => {
    const groups: Record<string, RankedStation[]> = {};
    stations.forEach(s => {
      const key = `${s.latitude.toFixed(4)},${s.longitude.toFixed(4)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return Object.values(groups);
  }, [stations]);

  const bestStation = useMemo(() => stations.find(s => s.id === bestStationId), [stations, bestStationId]);

  const userIcon = L.divIcon({
    className: "user-marker",
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 rounded-full animate-ping opacity-20 bg-cyan-400"></div>
        <div class="w-6 h-6 rounded-full border-2 border-white bg-cyan-500 shadow-[0_0_15px_#06b6d4]"></div>
        <div class="absolute -top-8 bg-black/90 backdrop-blur-md px-2 py-0.5 rounded-lg border border-cyan-500/30 whitespace-nowrap shadow-2xl">
          <span class="text-[8px] font-black text-cyan-400 uppercase tracking-widest">TACTICAL POSITION</span>
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
        zoom={5}
        style={{ height: "100%", width: "100%", background: "#050505" }}
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
          
          // Simplified tactical markers for performance
          const stationIcon = L.divIcon({
            className: "custom-marker",
            html: `
              <div class="relative flex items-center justify-center">
                ${(isBest || isSelected) ? `<div class="absolute w-10 h-10 rounded-full animate-pulse opacity-20 ${isBest ? 'bg-green-500' : 'bg-cyan-500'}"></div>` : ''}
                <div class="w-4 h-4 rounded-full border-2 border-black shadow-lg transition-all duration-300 ${isBest ? 'bg-green-500 scale-125 z-50' : isSelected ? 'bg-cyan-400 scale-125 z-50' : 'bg-blue-600 opacity-80'}"></div>
                ${(isBest || isSelected) ? `
                  <div class="absolute -top-8 bg-black/90 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 whitespace-nowrap z-50">
                    <span class="text-[8px] font-black text-white">${s.name.toUpperCase()}</span>
                  </div>
                ` : ''}
              </div>
            `,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });

          return (
            <Marker 
              key={s.id} 
              position={[s.latitude, s.longitude]} 
              icon={stationIcon}
              eventHandlers={{ click: () => onStationSelect(s.id) }}
            >
              <Popup className="cyber-popup">
                <div className="p-3 min-w-[280px] bg-black/90 text-white font-headline">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-black text-lg tracking-tighter ${isBest ? 'text-green-400' : 'text-cyan-400'}`}>{s.name}</h4>
                    {isBest && <span className="bg-green-500/20 text-green-400 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Optimal</span>}
                  </div>
                  <p className="text-[9px] text-white/40 mb-4 uppercase tracking-widest border-b border-white/5 pb-2">{s.city}, {s.state} • {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}</p>

                  <div className="space-y-3 max-h-[260px] overflow-auto pr-1 scrollbar-hide">
                    {group.map(item => (
                      <div key={item.id} className="space-y-3 border-b border-white/5 pb-3 last:border-0">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white/5 p-2 rounded-xl">
                            <p className="text-[7px] text-white/30 uppercase font-bold mb-0.5">Hardware</p>
                            <p className="font-bold text-[10px]">{item.chargerKW}kW {item.connectorType}</p>
                          </div>
                          <div className="bg-white/5 p-2 rounded-xl">
                            <p className="text-[7px] text-white/30 uppercase font-bold mb-0.5">Availability</p>
                            <p className={`font-bold text-[10px] ${item.availablePorts > 0 ? 'text-green-400' : 'text-amber-400'}`}>
                              {item.availablePorts}/{item.totalPorts} Ports
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center bg-cyan-500/5 p-2 rounded-xl border border-cyan-500/10">
                          <div>
                            <p className="text-[7px] text-cyan-400/50 uppercase font-bold">Effective Time</p>
                            <p className="text-xl font-black text-cyan-400 tracking-tighter">{item.totalEffectiveMinutes}<span className="text-[8px] ml-0.5">MIN</span></p>
                          </div>
                          <button 
                            className="bg-cyan-500 text-black text-[9px] font-black px-3 py-2 rounded-lg hover:bg-white transition-colors uppercase tracking-widest"
                            onClick={(e) => {
                              e.stopPropagation();
                              onStationSelect(item.id);
                            }}
                          >
                            Lock Vector
                          </button>
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
              weight: 2, 
              dashArray: '10, 10', 
              opacity: 0.6,
              className: 'animate-pulse'
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
