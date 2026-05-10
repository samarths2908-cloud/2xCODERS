"use client";

import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RankedStation, Location } from "@/lib/types";

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

  const userIcon = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return L.divIcon({
      className: "user-marker",
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 bg-purple-500/30 animate-ping rounded-full"></div>
          <div class="w-4 h-4 bg-purple-500 rotate-45 border-2 border-white shadow-[0_0_15px_#8b5cf6]"></div>
          <div class="absolute -top-12 whitespace-nowrap bg-black/80 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border border-purple-500/50 text-white">You Are Here</div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }, []);

  const routeLine = useMemo(() => {
    const targetId = selectedStationId || bestStationId;
    if (!targetId) return null;
    const targetStation = stations.find(s => s.id === targetId);
    if (!targetStation) return null;

    return [
      [userLocation.lat, userLocation.lng] as [number, number],
      [targetStation.latitude, targetStation.longitude] as [number, number]
    ];
  }, [stations, selectedStationId, bestStationId, userLocation]);

  if (typeof window === 'undefined') return null;

  return (
    <div className="relative w-full h-full z-0">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%", background: "#02040a" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />
        
        <RecenterMap center={[userLocation.lat, userLocation.lng]} />

        {/* Tactical Route Line */}
        {routeLine && (
          <Polyline 
            positions={routeLine}
            pathOptions={{
              color: "#06b6d4",
              dashArray: "6, 10",
              weight: 3,
              opacity: 0.8,
              lineCap: "round"
            }}
          />
        )}

        {userIcon && <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />}

        {stations.map((s) => {
          if (s.isSuspicious) return null;

          const isBest = s.id === bestStationId;
          const isSelected = s.id === selectedStationId;
          const isActive = isBest || isSelected;
          
          return (
            <CircleMarker
              key={s.id}
              center={[s.latitude, s.longitude]}
              radius={isActive ? 8 : 4.5}
              pathOptions={{
                fillColor: isBest ? "#06b6d4" : isSelected ? "#3b82f6" : "#1e40af",
                color: isActive ? "#ffffff" : "transparent",
                weight: isActive ? 2.5 : 0,
                fillOpacity: isActive ? 1 : 0.5,
              }}
              eventHandlers={{
                click: () => onStationSelect(s.id)
              }}
            >
              <Popup className="cyber-popup">
                <div className="p-4 min-w-[200px] font-headline">
                  <h4 className="font-black text-lg tracking-tight uppercase mb-2 text-cyan-400">
                    {s.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-bold text-white/60">
                    <div>POWER: {s.chargerKW}kW</div>
                    <div>AVAIL: {s.availablePorts}/{s.totalPorts}</div>
                    <div>DIST: {s.distanceKm.toFixed(1)}Km</div>
                    <div>ETA: {s.totalEffectiveMinutes}min</div>
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