
"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { 
  Zap, 
  Activity, 
  Shield, 
  Crosshair, 
  Cpu, 
  Navigation, 
  Signal, 
  Menu,
  ChevronRight,
  Battery,
  Layers,
  Search,
  Settings
} from "lucide-react";
import { demoStations } from "@/lib/mock-data";
import { rankStations } from "@/lib/charging";
import { Location, RankedStation } from "@/lib/types";
import RecommendationPanel from "@/components/RecommendationPanel";
import BookingModal from "@/components/BookingModal";
import { useToast } from "@/hooks/use-toast";

// Dynamically import MapView with SSR disabled to prevent "window is not defined" errors
const MapView = dynamic(() => import("@/components/MapView"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-black/40 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Activity className="w-10 h-10 text-cyan-500 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400/70">Syncing Grid...</span>
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
  { label: "Core Temperature", value: "32°C", color: "text-cyan-400" },
  { label: "Energy Flux", value: "48.2 kW", color: "text-violet-400" },
  { label: "Grid Stability", value: "99.9%", color: "text-emerald-400" },
  { label: "Signal Integrity", value: "88 ms", color: "text-amber-400" },
];

function GlowPill({ children, tone = "cyan" }: { children: React.ReactNode, tone?: "cyan" | "green" | "purple" | "amber" }) {
  const tones = {
    cyan: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.2)]",
    green: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 shadow-[0_0_15px_rgba(34,197,94,0.2)]",
    purple: "border-violet-400/30 bg-violet-400/10 text-violet-200 shadow-[0_0_15px_rgba(139,92,246,0.2)]",
    amber: "border-amber-400/30 bg-amber-400/10 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] ${tones[tone]}`}>
      {children}
    </span>
  );
}

function TacticalCard({ title, children, className = "", tone = "cyan" }: { title?: string, children: React.ReactNode, className?: string, tone?: "cyan" | "purple" }) {
  const borderTone = tone === "cyan" ? "neon-border-cyan" : "neon-border-purple";
  return (
    <div className={`glass rounded-[2rem] overflow-hidden ${borderTone} ${className}`}>
      {title && (
        <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between bg-white/[0.02]">
          <h3 className="text-[11px] font-black uppercase tracking-[0.35em] text-white/60">{title}</h3>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-cyan-400" />
            <div className="w-1 h-1 rounded-full bg-white/20" />
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function Page() {
  const { toast } = useToast();
  const [userLocation] = useState<Location>({ lat: 11.2588, lng: 75.7804 }); // Anchored in Kozhikode
  const [currentBat, setCurrentBat] = useState(25);
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
      description: `Tactical Port at ${activeStation?.name} secured for ${bookingData.startTime}.`,
    });
    setIsBookingOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-[#02040a] text-white selection:bg-cyan-500/30 overflow-hidden cyber-grid">
      <div className="scanline" />
      
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 flex h-screen p-4 lg:p-6 gap-6">
        
        <aside className="hidden xl:flex flex-col w-[280px] shrink-0 gap-6 h-full">
          <TacticalCard className="h-full flex flex-col p-0">
            <div className="p-6 flex items-center gap-4 bg-white/[0.03] border-b border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-black font-headline tracking-tighter neon-text-cyan">WATTWISE</h1>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">Command Center</p>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-4">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${
                    item.active 
                      ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-300" 
                      : "text-white/40 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon className={`w-4 h-4 ${item.active ? "text-cyan-400" : "group-hover:text-cyan-400"}`} />
                    <span className="text-[12px] font-bold uppercase tracking-widest">{item.label}</span>
                  </div>
                  {item.active && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,1)]" />}
                </button>
              ))}
            </nav>

            <div className="p-6 border-t border-white/5 bg-white/[0.01]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">User Profile</span>
                <GlowPill tone="cyan">PILOT-01</GlowPill>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center font-black">P</div>
                <div>
                  <div className="text-xs font-bold">Kozhikode Sector</div>
                  <div className="text-[9px] text-white/30 uppercase font-black">Grid Sync: OK</div>
                </div>
              </div>
            </div>
          </TacticalCard>
        </aside>

        <section className="flex-1 flex flex-col gap-6 overflow-hidden">
          
          <header className="flex flex-col md:flex-row gap-6">
            <TacticalCard className="flex-1" tone="cyan">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,1)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400/70">Tactical Vector Locked</span>
                  </div>
                  <h2 className="text-5xl font-black font-headline tracking-tighter leading-none">
                    FASTEST NODE <span className="text-cyan-400">FOUND.</span>
                  </h2>
                  <p className="text-sm text-white/40 font-medium max-w-xl">
                    Coordinate synchronization complete. Optimized route to <span className="text-white font-bold">{bestStation?.name}</span> available for immediate engagement.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="h-14 px-8 rounded-2xl bg-cyan-500 text-black font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-105 transition-all">
                    Reroute Now
                  </button>
                  <button className="h-14 w-14 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all">
                    <Settings className="w-5 h-5 text-white/50" />
                  </button>
                </div>
              </div>
            </TacticalCard>

            <TacticalCard className="w-full md:w-[320px]" tone="purple">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Energy Core</span>
                  <GlowPill tone="purple">Active</GlowPill>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-5xl font-black font-headline tracking-tighter text-violet-400">{currentBat}%</div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-white/40 uppercase font-black">Target</span>
                    <span className="text-xl font-black">{targetBat}%</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all duration-1000" 
                    style={{ width: `${currentBat}%` }} 
                  />
                </div>
              </div>
            </TacticalCard>
          </header>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 overflow-hidden">
            
            <div className="relative group rounded-[2.5rem] border border-cyan-500/20 bg-black/40 overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.1)]">
              <div className="absolute top-6 left-6 z-10 flex gap-2">
                <div className="glass px-4 py-2 rounded-xl border-white/10 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,1)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Sector Grid Live</span>
                </div>
                <div className="glass px-4 py-2 rounded-xl border-white/10 flex items-center gap-3">
                  <Crosshair className="w-3 h-3 text-white/40" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Lat: {userLocation.lat.toFixed(4)}</span>
                </div>
              </div>
              <div className="w-full h-full">
                <MapView 
                  stations={rankedStations} 
                  bestStationId={bestStation?.id}
                  selectedStationId={selectedStationId}
                  userLocation={userLocation}
                  onStationSelect={setSelectedStationId}
                />
              </div>
              <div className="absolute bottom-6 right-6 z-10">
                <button className="w-14 h-14 rounded-2xl glass border-white/10 flex items-center justify-center hover:bg-cyan-500/20 transition-all hover:border-cyan-500/40">
                  <Search className="w-5 h-5 text-white/60" />
                </button>
              </div>
            </div>

            <TacticalCard className="flex flex-col h-full overflow-y-auto" tone="cyan" title="Node Analysis">
              <div className="space-y-8">
                <RecommendationPanel 
                  station={activeStation} 
                  isBest={activeStation.id === bestStation.id}
                  onReroute={() => setIsBookingOpen(true)}
                />

                <div className="pt-8 border-t border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">System Telemetry</h4>
                    <Activity className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {telemetry.map(t => (
                      <div key={t.label} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-[8px] uppercase tracking-widest text-white/30 font-black mb-1">{t.label}</p>
                        <p className={`text-xl font-headline font-black ${t.color}`}>{t.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Network Logs</h4>
                    <button className="text-[9px] uppercase font-black text-cyan-400 hover:underline">Clear</button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 text-[11px] leading-relaxed">
                      <span className="text-cyan-400 font-black">[09:42]</span>
                      <span className="text-white/60">Vector optimization complete for <span className="text-white">Sector South</span>.</span>
                    </div>
                    <div className="flex gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 text-[11px] leading-relaxed">
                      <span className="text-violet-400 font-black">[09:40]</span>
                      <span className="text-white/60">Neural link established with vehicle MCU.</span>
                    </div>
                  </div>
                </div>
              </div>
            </TacticalCard>
          </div>
        </section>
      </main>

      <BookingModal 
        station={activeStation} 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        onConfirm={handleBooking}
      />
    </div>
  );
}
