"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { 
  Zap, 
  LayoutDashboard, 
  Map as MapIcon, 
  ListOrdered, 
  History,
  Battery,
  Trophy,
  Activity,
  Loader2,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { demoStations } from "@/lib/mock-data";
import { rankStations } from "@/lib/charging";
import { Location, RankedStation, Booking } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecommendationPanel from "@/components/RecommendationPanel";
import BookingModal from "@/components/BookingModal";

const MapView = dynamic(() => import("@/components/MapView"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-black/40 flex items-center justify-center rounded-[2rem] border border-white/5">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400/70 font-headline">Syncing Tactical Grid...</span>
      </div>
    </div>
  )
});

const navItems = [
  { id: 'dash', label: "Dashboard", icon: LayoutDashboard },
  { id: 'map', label: "Tactical Map", icon: MapIcon },
  { id: 'queue', label: "Queue Feed", icon: ListOrdered },
  { id: 'logs', label: "Logs", icon: History },
];

export default function Page() {
  const { toast } = useToast();
  const [userLocation] = useState<Location>({ lat: 12.8460, lng: 74.9552 }); // Matching image coords
  const [currentBat, setCurrentBat] = useState(25);
  const [targetBat, setTargetBat] = useState(80);
  const [syncMode, setSyncMode] = useState('custom');
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dash');
  const [isSimMode, setIsSimMode] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [logs, setLogs] = useState<{id: string, msg: string, time: string, type: 'info' | 'success'}[]>([
    { id: '1', msg: 'Neural Grid Link established.', time: 'INIT', type: 'info' },
  ]);

  const rankedStations = useMemo(() => {
    const target = syncMode === 'full' ? 100 : targetBat;
    return rankStations(demoStations, currentBat, target, userLocation);
  }, [currentBat, targetBat, syncMode, userLocation]);

  const bestStation = rankedStations[0];
  const activeStation = rankedStations.find(s => s.id === selectedStationId) || bestStation;

  useEffect(() => {
    toast({
      title: "SYSTEM ONLINE",
      description: "Tactical EV Sector Grid fully operational.",
    });
  }, [toast]);

  useEffect(() => {
    if (!isSimMode) return;
    const interval = setInterval(() => {
      const randomMsg = [
        "Sector load rebalanced.",
        "New vehicle detected in Vector-7.",
        "Grid capacity optimized.",
        "Port synchronization complete.",
        "Neural sync bypass active."
      ];
      const newLog = {
        id: Math.random().toString(),
        msg: randomMsg[Math.floor(Math.random() * randomMsg.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'info' as const
      };
      setLogs(prev => [newLog, ...prev].slice(0, 10));
    }, 5000);
    return () => clearInterval(interval);
  }, [isSimMode]);

  const handleBooking = (booking: Omit<Booking, 'id'>) => {
    const newLog = {
      id: Math.random().toString(),
      msg: `Reservation locked for ${activeStation.name}.`,
      time: 'NOW',
      type: 'success' as const
    };
    setLogs(prev => [newLog, ...prev]);
    toast({
      title: "RESERVATION SYNCED",
      description: `Node ${activeStation.name} locked for arrival at ${booking.startTime}.`,
    });
  };

  return (
    <main className="page-shell relative">
      <div className="scanline" />
      
      {/* Sidebar - Left Section */}
      <aside className="w-64 glass rounded-[2rem] p-6 flex flex-col gap-8 border-glow-purple border-opacity-30">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            <span className="text-white font-black text-xl">W</span>
          </div>
          <div>
            <h1 className="text-lg font-black font-headline tracking-tighter leading-none uppercase">WattWise</h1>
            <p className="text-[8px] text-white/40 font-bold tracking-[0.2em] uppercase">Command Center</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)}
              className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-cyan-400' : 'text-white/40'}`} />
              <span className="tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-6">
          <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-3">Vehicle Status</p>
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded bg-cyan-500/10">
                <Battery className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-sm font-black font-headline">{currentBat}% Charge</span>
            </div>
          </div>
          
          <div className="flex gap-1 bg-black/60 p-1.5 rounded-xl border border-white/5">
            <button 
              onClick={() => { setIsSimMode(true); toast({ title: "SIM MODE", description: "Grid behavior simulation active." }); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${isSimMode ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-white/30 hover:text-white/60'}`}
            >
              Sim
            </button>
            <button 
              onClick={() => { setIsSimMode(false); toast({ title: "LIVE MODE", description: "Real-time sector tracking locked." }); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${!isSimMode ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-white/30 hover:text-white/60'}`}
            >
              Live
            </button>
          </div>
        </div>
      </aside>

      {/* Main Grid Content */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 min-h-0">
          
          {/* Tactical Sector Map Card */}
          <div className="glass rounded-[2rem] overflow-hidden flex flex-col border-glow-cyan relative">
            <div className="p-8 flex justify-between items-start absolute top-0 left-0 w-full z-10">
              <div>
                <h2 className="text-2xl font-black font-headline tracking-tight uppercase">Tactical Sector Map</h2>
                <p className="text-[11px] text-white/50 font-bold mt-1">Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}</p>
              </div>
              <div className="flex gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="legend-dot bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Best</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-purple-500 rotate-45 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80">You</span>
                </div>
              </div>
            </div>

            <div className="flex-1 mt-20 m-6 rounded-[1.5rem] overflow-hidden border border-white/5">
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
          <div className="glass rounded-[2rem] p-8 flex flex-col gap-8 border-glow-purple border-opacity-40 overflow-y-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-lg font-black font-headline uppercase tracking-tight">Charge Control</h3>
            </div>

            <Tabs value={syncMode} onValueChange={setSyncMode} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/60 p-1.5 h-14 rounded-xl border border-white/5">
                <TabsTrigger value="full" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white font-headline font-black text-[11px] uppercase tracking-widest">Full</TabsTrigger>
                <TabsTrigger value="custom" className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-black font-headline font-black text-[11px] uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.5)]">Custom</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-10">
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Current Level</span>
                  <span className="text-base font-black text-cyan-400 font-headline">{currentBat}%</span>
                </div>
                <Slider 
                  value={[currentBat]} 
                  onValueChange={(v) => setCurrentBat(v[0])} 
                  max={100} 
                  step={1} 
                  className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-[0_0_15px_rgba(6,182,212,0.9)] [&_.bg-primary]:bg-cyan-400" 
                />
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Target Level</span>
                  <span className="text-base font-black text-purple-400 font-headline">{targetBat}%</span>
                </div>
                <Slider 
                  value={[targetBat]} 
                  onValueChange={(v) => setTargetBat(v[0])} 
                  max={100} 
                  step={1} 
                  className="[&_[role=slider]]:bg-purple-500 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-[0_0_15px_rgba(139,92,246,0.9)] [&_.bg-primary]:bg-purple-500" 
                />
              </div>
            </div>

            <RecommendationPanel 
              station={activeStation} 
              isBest={activeStation.id === bestStation.id} 
              onReroute={() => setIsBookingOpen(true)}
            />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="h-32 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
          <div className="glass rounded-[1.8rem] p-6 flex items-center gap-8 border-glow-purple border-opacity-30">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/20">
              <Trophy className="w-7 h-7 text-purple-400" />
            </div>
            <div className="flex-1 flex gap-12 overflow-x-auto no-scrollbar py-2">
              {rankedStations.slice(0, 5).map((s, i) => (
                <div 
                  key={s.id} 
                  className={`min-w-[160px] space-y-1.5 cursor-pointer transition-all ${selectedStationId === s.id ? 'opacity-100 scale-105' : 'opacity-40 hover:opacity-100'}`}
                  onClick={() => setSelectedStationId(s.id)}
                >
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Vector {i+1}</p>
                  <p className="text-sm font-black font-headline uppercase truncate">{s.name}</p>
                  <p className="text-[11px] font-bold text-cyan-400">{s.totalEffectiveMinutes}m ETA</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-[1.8rem] p-6 overflow-hidden border-glow-orange border-opacity-40 group relative cursor-pointer">
             <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-orange-400" />
                  <h3 className="text-xs font-black font-headline uppercase tracking-[0.2em]">Network Logs</h3>
                </div>
                <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-orange-400 transition-colors" />
             </div>
             <div className="space-y-2">
                {logs.slice(0, 3).map((log) => (
                  <div key={log.id} className="flex justify-between items-center gap-4">
                    <p className={`text-[10px] truncate font-bold uppercase tracking-tight ${log.type === 'success' ? 'text-emerald-400' : 'text-white/50'}`}>
                      {log.msg}
                    </p>
                    <span className="text-[8px] font-black text-white/20 shrink-0 uppercase">{log.time}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      <BookingModal 
        station={activeStation} 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        onConfirm={handleBooking}
      />
    </main>
  );
}