
"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { 
  Zap, 
  Activity, 
  Shield, 
  Crosshair, 
  Navigation, 
  Signal, 
  Layers,
  Search,
  Settings,
  LogOut,
  Cpu,
  Battery
} from "lucide-react";
import { demoStations } from "@/lib/mock-data";
import { rankStations } from "@/lib/charging";
import { Location, RankedStation } from "@/lib/types";
import RecommendationPanel from "@/components/RecommendationPanel";
import BookingModal from "@/components/BookingModal";
import { useToast } from "@/hooks/use-toast";

const MapView = dynamic(() => import("@/components/MapView"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-black/40 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Activity className="w-10 h-10 text-cyan-500 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400/70 font-headline">Syncing Grid...</span>
      </div>
    </div>
  )
});

const navItems = [
  { label: "Tactical Grid", icon: Layers, active: true },
  { label: "Neural Route", icon: Navigation },
  { label: "Network Feed", icon: Signal },
  { label: "Fleet Status", icon: Shield },
  { label: "System Logs", icon: Activity },
];

const telemetry = [
  { label: "Core Temp", value: "32°C", color: "text-cyan-400" },
  { label: "Energy Flux", value: "48.2 kW", color: "text-violet-400" },
  { label: "Grid Stability", value: "99.9%", color: "text-emerald-400" },
  { label: "Latency", value: "88 ms", color: "text-amber-400" },
];

export default function Page() {
  const { toast } = useToast();
  const [userLocation] = useState<Location>({ lat: 11.2588, lng: 75.7804 });
  const [currentBat] = useState(25);
  const [targetBat] = useState(80);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const rankedStations = useMemo(() => {
    return rankStations(demoStations, currentBat, targetBat, userLocation);
  }, [currentBat, targetBat, userLocation]);

  const bestStation = rankedStations[0];
  const activeStation = rankedStations.find(s => s.id === selectedStationId) || bestStation;

  useEffect(() => {
    const timer = setTimeout(() => {
      toast({
        title: "NEURAL LINK ESTABLISHED",
        description: "Tactical EV Grid synced with current coordinates.",
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleBooking = (bookingData: any) => {
    toast({
      title: "RESERVATION LOCKED",
      description: `Tactical Port at ${activeStation?.name} secured.`,
    });
    setIsBookingOpen(false);
  };

  return (
    <main className="page-shell">
      <div className="scanline" />
      
      {/* Sidebar Navigation */}
      <aside className="sidebar flex flex-col gap-8 shrink-0">
        <div className="flex items-center gap-4 px-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <h1 className="text-xl font-black font-headline tracking-tighter">WATT<span className="text-cyan-400">WISE</span></h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`nav-btn font-headline text-[11px] uppercase tracking-widest flex items-center gap-4 ${item.active ? 'active' : ''}`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="glass p-4 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-[10px] font-black">P</div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black font-headline uppercase truncate">Pilot Sector-01</p>
              <p className="text-[8px] text-white/30 uppercase font-black">Online</p>
            </div>
          </div>
          <button className="nav-btn flex items-center gap-4 text-white/40 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="text-[10px] font-headline uppercase font-bold tracking-widest">Disconnect</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        {/* Compact Status Header */}
        <header className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 glass p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-400/70 font-headline">Sector Optimization Active</span>
              </div>
              <h2 className="text-3xl font-black font-headline tracking-tighter leading-none">
                OPTIMAL VECTOR <span className="text-cyan-400">FOUND.</span>
              </h2>
              <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">
                Targeting <span className="text-white font-bold">{bestStation?.name}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button className="glow-btn px-6 h-10 text-[9px] uppercase tracking-widest font-headline">
                Execute Reroute
              </button>
              <button className="glass w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/5 transition-all">
                <Settings className="w-3.5 h-3.5 text-white/50" />
              </button>
            </div>
          </div>

          <div className="w-full md:w-80 glass p-6 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest font-headline">Energy Level</span>
              <Battery className="w-4 h-4 text-violet-400" />
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-black font-headline text-violet-400 leading-none">{currentBat}%</span>
              <span className="text-[8px] font-black text-white/20 uppercase">Target: {targetBat}%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-violet-500" 
                style={{ width: `${currentBat}%` }} 
              />
            </div>
          </div>
        </header>

        {/* Tactical Map & Analysis Panel */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 overflow-hidden">
          
          <div className="relative glass rounded-[2.5rem] overflow-hidden flex flex-col">
            <div className="absolute top-6 left-6 z-10 flex gap-3">
              <div className="glass px-4 py-2 rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,1)]" />
                <span className="text-[9px] font-black font-headline uppercase tracking-widest">Live Sector Grid</span>
              </div>
              <div className="glass px-4 py-2 rounded-xl flex items-center gap-3">
                <Crosshair className="w-3 h-3 text-white/40" />
                <span className="text-[9px] font-black font-headline uppercase tracking-widest text-white/40">Lat: {userLocation.lat.toFixed(4)}</span>
              </div>
            </div>
            
            <div className="flex-1 w-full relative">
              <MapView 
                stations={rankedStations} 
                bestStationId={bestStation?.id}
                selectedStationId={selectedStationId}
                userLocation={userLocation}
                onStationSelect={setSelectedStationId}
              />
            </div>

            {/* Bottom Ranked List Overlay */}
            <div className="p-6 border-t border-white/5 bg-black/20 flex gap-4 overflow-x-auto">
              {rankedStations.slice(0, 5).map((s, idx) => (
                <button 
                  key={s.id}
                  onClick={() => setSelectedStationId(s.id)}
                  className={`glass min-w-[200px] p-4 rounded-2xl flex flex-col gap-2 transition-all hover:scale-[1.02] ${selectedStationId === s.id ? 'border-cyan-500/50 bg-cyan-500/5' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[8px] font-black text-white/20 uppercase font-headline">Vector 0{idx+1}</span>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${idx === 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-white/40 bg-white/5'}`}>
                      {idx === 0 ? 'Optimal' : 'Active'}
                    </span>
                  </div>
                  <h4 className="text-[11px] font-black font-headline uppercase truncate">{s.name}</h4>
                  <div className="flex justify-between items-end mt-1">
                    <span className="text-[14px] font-black font-headline text-cyan-400">{s.totalEffectiveMinutes}m</span>
                    <span className="text-[8px] font-black text-white/30 uppercase">{s.chargerKW}kW</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <aside className="glass p-8 flex flex-col gap-8 overflow-y-auto">
            <h3 className="text-[11px] font-black font-headline uppercase tracking-[0.4em] text-white/40 border-b border-white/5 pb-4">Target Analysis</h3>
            
            <RecommendationPanel 
              station={activeStation} 
              isBest={activeStation.id === bestStation.id}
              onReroute={() => setIsBookingOpen(true)}
            />

            <div className="space-y-6 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black font-headline uppercase tracking-widest text-white/30">System Telemetry</span>
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {telemetry.map(t => (
                  <div key={t.label} className="glass p-4 rounded-2xl">
                    <p className="text-[8px] uppercase tracking-widest text-white/30 font-black mb-1 font-headline">{t.label}</p>
                    <p className={`text-sm font-headline font-black ${t.color}`}>{t.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5 mt-auto">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black font-headline uppercase tracking-widest text-white/30">Neural Logs</span>
                <span className="text-[8px] font-black text-cyan-400/50 uppercase font-headline">Live</span>
              </div>
              <div className="space-y-2">
                <div className="glass p-3 rounded-xl text-[9px] leading-relaxed border-l-2 border-l-cyan-400">
                  <span className="text-cyan-400 font-bold font-headline">[09:42]</span> <span className="text-white/60">Vector optimization complete.</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <BookingModal 
        station={activeStation} 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        onConfirm={handleBooking}
      />
    </main>
  );
}
