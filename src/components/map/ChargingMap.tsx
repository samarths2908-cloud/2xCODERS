"use client";

import React, { useEffect, useState } from 'react';
import { Station } from '@/lib/types';
import { MapPin, Navigation } from 'lucide-react';

interface ChargingMapProps {
  stations: Station[];
  selectedStation: Station | null;
  onStationClick: (station: Station) => void;
  userLocation: { lat: number; lng: number };
}

export const ChargingMap: React.FC<ChargingMapProps> = ({ 
  stations, 
  selectedStation, 
  onStationClick,
  userLocation 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate map loading delay
    const timer = setTimeout(() => setIsLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20">
        <div className="text-center">
          <Navigation className="w-10 h-10 mx-auto text-muted-foreground mb-4 animate-bounce" />
          <p className="font-medium text-muted-foreground font-headline">Loading Interactive Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#e5e3df] rounded-xl overflow-hidden shadow-inner border border-border">
      {/* Mock Map Background - In a real app, this would be the Google Maps JS API component */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #888 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* User Marker */}
      <div 
        className="absolute transition-all duration-500 ease-in-out z-20"
        style={{ 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)' 
        }}
      >
        <div className="relative">
          <div className="absolute inset-0 w-8 h-8 bg-primary/30 rounded-full animate-ping" />
          <div className="relative bg-white p-1 rounded-full shadow-lg border-2 border-primary">
            <div className="w-4 h-4 bg-primary rounded-full" />
          </div>
        </div>
      </div>

      {/* Station Markers */}
      {stations.map((station, idx) => {
        const isSelected = selectedStation?.id === station.id;
        // Mock positions relative to center
        const top = 50 + (idx === 0 ? -15 : idx === 1 ? 10 : -5);
        const left = 50 + (idx === 0 ? 20 : idx === 1 ? -15 : -25);

        return (
          <div 
            key={station.id}
            onClick={() => onStationClick(station)}
            className={`absolute cursor-pointer transition-all duration-300 z-10 ${isSelected ? 'scale-125 z-30' : 'hover:scale-110'}`}
            style={{ 
              top: `${top}%`, 
              left: `${left}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className={`flex flex-col items-center group`}>
              <div className={`px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm mb-1 whitespace-nowrap transition-colors ${
                isSelected ? 'bg-primary text-white' : 'bg-white text-foreground'
              }`}>
                {station.name}
              </div>
              <div className={`p-2 rounded-full shadow-lg transition-all ${
                isSelected ? 'bg-accent text-accent-foreground' : station.status === 'Busy' ? 'bg-amber-500 text-white' : 'bg-white text-primary'
              }`}>
                <MapPin className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}

      {/* Map Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col space-y-2">
        <button className="bg-white p-2 rounded-lg shadow-md border border-border hover:bg-muted text-foreground">
          <Navigation className="w-5 h-5" />
        </button>
      </div>

      {/* Route Line Mockup */}
      {selectedStation && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <path 
            d="M50,50 Q60,40 70,35" 
            stroke="hsl(var(--primary))" 
            strokeWidth="3" 
            fill="none" 
            strokeDasharray="8,4"
            className="animate-[dash_2s_linear_infinite]"
          />
        </svg>
      )}

      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -24;
          }
        }
      `}</style>
    </div>
  );
};
