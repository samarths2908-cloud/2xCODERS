"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RankedStation, Location } from "@/lib/types";

// Fix Leaflet icon issue
const fixLeafletIcons = () => {
  if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }
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

  const userIcon = L.divIcon({
    className: "user-marker",
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 rounded-full animate-ping opacity-20 bg-cyan-400"></div>
        <div class="w-6 h-6 rounded-full border-2 border-white bg-cyan-500 shadow-[0_0_15px_#06b6d4]"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return (
    <div className="relative w-full h-[450px] rounded-[2.5rem] overflow-hidden border border-white/5 glass shadow-2xl z-0">
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

        {/* User Tactical Position */}
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />

        {/* Tactical Station Grid */}
        {stations.map((s) => {
          // Skip suspicious stations (potential ocean markers) to keep map clean
          if (s.isSuspicious) return null;

          const isBest = s.id === bestStationId;
          const isSelected = s.id === selectedStationId;
          
          return (
            <CircleMarker
              key={s.id}
              center={[s.latitude, s.longitude]}
              radius={isBest || isSelected ? 6 : 4}
              pathOptions={{
                fillColor: isBest ? "#22c55e" : isSelected ? "#06b6d4" : "#3b82f6",
                color: isBest || isSelected ? "#ffffff" : "#1e3a8a",
                weight: isBest || isSelected ? 2 : 1,
                fillOpacity: isBest || isSelected ? 1 : 0.6,
              }}
              eventHandlers={{
                click: () => onStationSelect(s.id)
              }}
            >
              <Popup className="cyber-popup">
                <div className="p-3 min-w-[240px] bg-black/90 text-white font-headline">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-black text-lg tracking-tighter ${isBest ? 'text-green-400' : 'text-cyan-400'}`}>
                      {s.name}
                    </h4>
                    {isBest && <span className="bg-green-500/20 text-green-400 text-[8px] font-black px-2 py-0.5 rounded uppercase">Optimal</span>}
                  </div>
                  
                  <div className="text-[9px] text-white/40 mb-4 uppercase tracking-widest border-b border-white/5 pb-2">
                    {s.city}, {s.state} • {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/5 p-2 rounded-xl">
                        <p className="text-[7px] text-white/30 uppercase font-bold mb-0.5">Hardware</p>
                        <p className="font-bold text-[10px]">{s.chargerKW}kW {s.connectorType}</p>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl">
                        <p className="text-[7px] text-white/30 uppercase font-bold mb-0.5">Availability</p>
                        <p className={`font-bold text-[10px] ${s.availablePorts > 0 ? 'text-green-400' : 'text-amber-400'}`}>
                          {s.availablePorts}/{s.totalPorts} Ports
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center bg-cyan-500/5 p-2 rounded-xl border border-cyan-500/10">
                      <div>
                        <p className="text-[7px] text-cyan-400/50 uppercase font-bold">Effective ETA</p>
                        <p className="text-xl font-black text-cyan-400 tracking-tighter">{s.totalEffectiveMinutes}<span className="text-[8px] ml-0.5">MIN</span></p>
                      </div>
                      <button 
                        className="bg-cyan-500 text-black text-[9px] font-black px-3 py-2 rounded-lg hover:bg-white transition-colors uppercase tracking-widest"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStationSelect(s.id);
                        }}
                      >
                        Lock
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}