"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { 
  Zap, 
  LayoutDashboard, 
  Map as MapIcon, 
  ListOrdered, 
  History,
  Settings,
  Battery,
  Trophy,
  Activity,
  ChevronRight
} from "lucide-react";
import { demoStations } from "@/lib/mock-data";
import { rankStations } from "@/lib/charging";
import { Location, RankedStation } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

const MapView = dynamic(() => import("@/components/MapView"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-black/40 flex items-center justify-center rounded-[2rem] border border-white/5">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400/70 font-headline">Syncing Tactical Grid...</span>
      </div>
    </div>
  )
});

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Tactical Map", icon: MapIcon },
  { label: "Queue Feed", icon: ListOrdered },
  { label: "Logs", icon: History },
];

export default function Page() {
  const { toast } = useToast();
  const [userLocation] = useState<Location>({ lat: 11.2588, lng: 75.7804 });
  const [currentBat, setCurrentBat] = useState(25);
  const [targetBat, setTargetBat] = useState(80);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  const rankedStations = useMemo(() => {
    return rankStations(demoStations, currentBat, targetBat, userLocation);
  }, [currentBat, targetBat, userLocation]);

  const bestStation = rankedStations[0];
  const activeStation = rankedStations.find(s => s.id === selectedStationId) || bestStation;

  useEffect(() => {
    toast({
      title: "SYSTEM ONLINE",
      description: "Tactical EV Sector Grid fully operational.",
    });
  }, [toast]);

  return (
    <main className="page-shell">
      {/* Sidebar - Left Section */}
      <aside className="w-64 glass rounded-[2rem] p-6 flex flex-col gap-8 border border-white/5">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <span className="font-black text-white text-xl">W</span>
          </div>
          <div>
            <h1 className="text-lg font-black font-headline tracking-tighter leading-none uppercase">WattWise</h1>
            <p className="text-[8px] text-white/40 font-bold tracking-[0.2em] uppercase">Command Center</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button key={item.label} className={`nav-btn ${item.active ? 'active' : ''}`}>
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-6">
          <div className="glass p-4 rounded-2xl border border-white/5">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Vehicle Status</p>
            <div className="flex items-center gap-3">
              <Battery className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-black font-headline">{currentBat}% Charge</span>
            </div>
          </div>
          
          <div className="flex gap-1 bg-black/40 p-1 rounded-xl">
            <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-white/30">Sim</button>
            <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest bg-cyan-500 text-black rounded-lg shadow-[0_0_10px_rgba(6,182,212,0.3)]">Live</button>
          </div>
        </div>
      </aside>

      {/* Main Grid Content */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 min-h-0">
          
          {/* Tactical Sector Map Card */}
          <div className="glass rounded-[2rem] overflow-hidden flex flex-col border-glow-cyan relative">
            <div className="p-6 flex justify-between items-start absolute top-0 left-0 w-full z-10 bg-gradient-to-b from-[#02040a] to-transparent">
              <div>
                <h2 className="text-xl font-black font-headline tracking-tight uppercase">Tactical Sector Map</h2>
                <p className="text-[10px] text-white/40 font-bold">Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="legend-dot bg-cyan-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Best</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="legend-dot bg-purple-500 rotate-45" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">You</span>
                </div>
              </div>
            </div>

            <div className="flex-1 mt-16 m-4 rounded-[1.5rem] overflow-hidden border border-white/5">
              <MapView 
                stations={rankedStations} 
                bestStationId={bestStation?.id}
                selectedStationId={selectedStationId}
                userLocation={userLocation}
                onStationSelect={setSelectedStationId}
              />
            </div>
          </div>

          {/* Charge Control Card */}
          <div className="glass rounded-[2rem] p-6 flex flex-col gap-8 border-glow-purple">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-lg font-black font-headline uppercase tracking-tight">Charge Control</h3>
            </div>

            <div className="flex gap-2 bg-black/40 p-1 rounded-xl">
              <button className="flex-1 py-2 text-[9px] font-black uppercase tracking-widest text-white/30">Full</button>
              <button className="flex-1 py-2 text-[9px] font-black uppercase tracking-widest bg-blue-600 text-white rounded-lg shadow-[0_0_10px_rgba(37,99,235,0.4)]">Custom</button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Current Level</span>
                  <span className="text-sm font-black text-cyan-400 font-headline">{currentBat}%</span>
                </div>
                <Slider value={[currentBat]} onValueChange={(v) => setCurrentBat(v[0])} max={100} step={1} className="py-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Target Level</span>
                  <span className="text-sm font-black text-purple-400 font-headline">{targetBat}%</span>
                </div>
                <Slider value={[targetBat]} onValueChange={(v) => setTargetBat(v[0])} max={100} step={1} className="py-2" />
              </div>
            </div>

            <div className="mt-auto space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Optimal Target</span>
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[8px] font-black uppercase tracking-widest">Elite</Badge>
              </div>
              <div className="space-y-1">
                <h4 className="text-2xl font-black font-headline leading-none tracking-tighter uppercase">{activeStation.name}</h4>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{activeStation.city}, {activeStation.state}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Ranking & Logs */}
        <div className="h-28 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
          <div className="glass rounded-[1.5rem] p-4 flex items-center gap-6 border-glow-purple">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1 flex gap-8 overflow-x-auto no-scrollbar">
              {rankedStations.slice(0, 4).map((s, i) => (
                <div key={s.id} className="min-w-[140px] space-y-1">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Vector {i+1}</p>
                  <p className="text-xs font-black font-headline uppercase truncate">{s.name}</p>
                  <p className="text-[10px] font-bold text-cyan-400">{s.totalEffectiveMinutes}m ETA</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-[1.5rem] p-4 flex items-center justify-between border-glow-orange cursor-pointer hover:bg-orange-500/5 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-sm font-black font-headline uppercase tracking-widest">Network Logs</h3>
            </div>
            <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-orange-400 transition-colors" />
          </div>
        </div>

      </div>
    </main>
  );
}