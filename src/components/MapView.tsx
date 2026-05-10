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
        <div class="w-4 h-4 rounded-full border-2 border-white bg-cyan-500 shadow-[0_0_20px_#06b6d4]"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return (
    <div className="relative w-full h-[450px] rounded-[2rem] overflow-hidden border border-white/5 glass shadow-2xl z-0">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={6}
        style={{ height: "100%", width: "100%", background: "#050505" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />
        
        <RecenterMap center={[userLocation.lat, userLocation.lng]} />

        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />

        {stations.map((s) => {
          if (s.isSuspicious) return null;

          const isBest = s.id === bestStationId;
          const isSelected = s.id === selectedStationId;
          
          return (
            <CircleMarker
              key={s.id}
              center={[s.latitude, s.longitude]}
              radius={isBest || isSelected ? 6 : 3.5}
              pathOptions={{
                fillColor: isBest ? "#22c55e" : isSelected ? "#06b6d4" : "#1e40af",
                color: isBest || isSelected ? "#ffffff" : "transparent",
                weight: isBest || isSelected ? 2 : 0,
                fillOpacity: isBest || isSelected ? 1 : 0.6,
              }}
              eventHandlers={{
                click: () => onStationSelect(s.id)
              }}
            >
              <Popup className="cyber-popup">
                <div className="p-5 min-w-[280px] bg-black/90 font-headline">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className={`font-black text-xl tracking-tighter ${isBest ? 'text-green-400' : 'text-cyan-400'}`}>
                      {s.name}
                    </h4>
                  </div>
                  
                  <div className="text-[10px] text-white/30 mb-5 uppercase tracking-widest border-b border-white/10 pb-3 font-bold">
                    SEC: {s.latitude.toFixed(3)}N / {s.longitude.toFixed(3)}E
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <p className="text-[8px] text-white/30 uppercase font-black mb-1 tracking-widest">Loadout</p>
                        <p className="font-black text-[11px]">{s.chargerKW}kW</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <p className="text-[8px] text-white/30 uppercase font-black mb-1 tracking-widest">Ports</p>
                        <p className={`font-black text-[11px] ${s.availablePorts > 0 ? 'text-green-400' : 'text-amber-400'}`}>
                          {s.availablePorts}/{s.totalPorts}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20">
                      <div>
                        <p className="text-[9px] text-cyan-400/50 uppercase font-black tracking-widest">Delta Time</p>
                        <p className="text-2xl font-black text-cyan-400 tracking-tighter">{s.totalEffectiveMinutes}<span className="text-[10px] ml-1">MIN</span></p>
                      </div>
                      <button 
                        className="bg-cyan-500 text-black text-[10px] font-black px-4 py-2 rounded-xl hover:bg-white transition-all uppercase tracking-widest"
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