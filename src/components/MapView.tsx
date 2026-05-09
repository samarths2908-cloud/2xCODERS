import React, { useEffect, useState } from 'react';
import { StationRanking } from '@/lib/charging';
import { MapPin, Navigation, Crosshair } from 'lucide-react';

interface MapViewProps {
  stations: StationRanking[];
  selectedStation: StationRanking | null;
  onStationClick: (station: StationRanking) => void;
  userLocation: { latitude: number; longitude: number };
}

export const MapView: React.FC<MapViewProps> = ({ 
  stations, 
  selectedStation, 
  onStationClick,
  userLocation 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-zinc-900 animate-pulse flex items-center justify-center rounded-2xl border border-white/5">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto border border-primary/30">
            <Navigation className="w-6 h-6 text-primary animate-bounce" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Initializing Systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#050505] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      />
      
      {/* HUD Elements */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none">
        <div className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-lg flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/70">GPS LINK ACTIVE</span>
        </div>
      </div>

      {/* User Location Marker */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <div className="relative">
          <div className="absolute inset-0 w-12 h-12 bg-primary/20 rounded-full animate-ping" />
          <div className="relative bg-black p-2 rounded-full border border-primary/50 shadow-[0_0_15px_rgba(56,126,230,0.5)]">
            <Crosshair className="w-6 h-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Station Pins */}
      {stations.map((station, idx) => {
        const isSelected = selectedStation?.id === station.id;
        // Mocking positions for the visual demo
        const top = 50 + (idx === 0 ? -20 : idx === 1 ? 15 : -10);
        const left = 50 + (idx === 0 ? 25 : idx === 1 ? -20 : -30);

        return (
          <div 
            key={station.id}
            onClick={() => onStationClick(station)}
            className={`absolute cursor-pointer transition-all duration-500 group/pin ${isSelected ? 'scale-125 z-30' : 'hover:scale-110'}`}
            style={{ top: `${top}%`, left: `${left}%` }}
          >
            <div className="flex flex-col items-center">
              <div className={`mb-2 px-3 py-1 rounded-full border backdrop-blur-md transition-all ${
                isSelected ? 'bg-primary border-primary text-white shadow-[0_0_20px_rgba(56,126,230,0.4)]' : 'bg-black/60 border-white/20 text-white/70'
              }`}>
                <span className="text-[9px] font-black uppercase tracking-widest">{station.name}</span>
              </div>
              <div className={`p-2 rounded-full transition-all border ${
                isSelected ? 'bg-white text-primary border-primary' : 'bg-black/80 text-white border-white/20'
              }`}>
                <MapPin className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}

      {/* Reroute Path Line */}
      {selectedStation && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <path 
            d="M50,50 Q60,40 75,30" 
            stroke="hsl(var(--primary))" 
            strokeWidth="3" 
            fill="none" 
            strokeDasharray="10,5"
            className="animate-[dash_2s_linear_infinite] opacity-50"
          />
        </svg>
      )}

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col space-y-2 z-20">
        <button className="bg-black/80 hover:bg-primary border border-white/10 text-white p-3 rounded-xl backdrop-blur-md transition-colors shadow-xl">
          <Navigation className="w-5 h-5" />
        </button>
      </div>

      <style jsx>{`
        @keyframes dash {
          to { stroke-dashoffset: -30; }
        }
      `}</style>
    </div>
  );
};
