"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { demoStations } from "@/lib/mock-data";
import { rankStations } from "@/lib/charging";
import { loadRealStations } from "@/lib/api";
import { RankedStation, User, Station } from "@/lib/types";
import RecommendationPanel from "@/components/RecommendationPanel";
import { 
  Zap, 
  Activity, 
  Map as MapIcon, 
  ListOrdered, 
  ShieldAlert, 
  Settings,
  Battery,
  LayoutDashboard
} from "lucide-react";

// Dynamically import MapView with SSR disabled to prevent "window is not defined" error from Leaflet
const MapView = dynamic(() => import("@/components/MapView"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[430px] rounded-3xl bg-muted/10 animate-pulse border border-white/10 glass flex items-center justify-center">
      <div className="text-center">
        <MapIcon className="w-10 h-10 mx-auto text-cyan-400/50 mb-4 animate-bounce" />
        <p className="text-sm font-bold text-white/40 font-headline uppercase tracking-widest">Initializing Tactical Map...</p>
      </div>
    </div>
  )
});

type Tab = "dashboard" | "map" | "queue" | "admin";
type Mode = "demo" | "real";

const CURRENT_USER: User = {
  uid: "usr-001",
  name: "Cyber Rider",
  carModel: "Tesla Model S Plaid",
  batteryCapacityKWh: 100,
  currentBattery: 32,
  targetBattery: 85
};

export default function WattWiseApp() {
  const [mode, setMode] = useState<Mode>("demo");
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [rawStations, setRawStations] = useState<Station[]>(demoStations);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const scrollRefs = {
    dashboard: useRef<HTMLDivElement>(null),
    map: useRef<HTMLDivElement>(null),
    queue: useRef<HTMLDivElement>(null),
    admin: useRef<HTMLDivElement>(null),
  };

  // Data Sync
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === "demo") {
      interval = setInterval(() => setTick(t => t + 1), 3000);
    } else {
      loadRealStations(37.7749, -122.4194).then(data => {
        if (data && data.length > 0) setRawStations(data);
      });
    }
    return () => clearInterval(interval);
  }, [mode]);

  // Ranking Logic
  const rankedStations = useMemo(() => {
    return rankStations(rawStations, CURRENT_USER.currentBattery, CURRENT_USER.targetBattery);
  }, [rawStations, tick]);

  const bestStation = rankedStations[0];
  const selectedStation = rankedStations.find(s => s.id === selectedId) || bestStation;

  const scrollTo = (tab: Tab) => {
    setActiveTab(tab);
    scrollRefs[tab].current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleReroute = () => {
    if (selectedStation) {
      setSelectedId(selectedStation.id);
      scrollTo("map");
    }
  };

  return (
    <main className="page-shell">
      {/* Background Decor */}
      <div className="bg-particles fixed inset-0 pointer-events-none opacity-20">
        {Array.from({ length: 15 }).map((_, i) => <span key={i} />)}
      </div>
      <div className="bg-grid opacity-10" />

      {/* Sidebar */}
      <aside className="sidebar glass">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="brand-mark">W</div>
            <div className="brand-text">
              <h1 className="text-xl font-bold tracking-tighter">WATTWISE</h1>
              <p className="text-[9px] uppercase tracking-[0.3em] opacity-40">Command Center</p>
            </div>
          </div>

          <nav className="side-nav space-y-2">
            {[
              { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { id: "map", icon: MapIcon, label: "Live Map" },
              { id: "queue", icon: ListOrdered, label: "Queue Feed" },
              { id: "admin", icon: Settings, label: "Console" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id as Tab)}
                className={`nav-btn flex items-center gap-3 w-full transition-all ${activeTab === item.id ? 'active' : ''}`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="side-footer">
          <div className="tiny-label mb-3">System Mode</div>
          <div className="mode-switch flex p-1 bg-black/40 rounded-2xl border border-white/5">
            <button 
              onClick={() => setMode("demo")}
              className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all ${mode === "demo" ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-white/40'}`}
            >
              DEMO
            </button>
            <button 
              onClick={() => setMode("real")}
              className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all ${mode === "real" ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'text-white/40'}`}
            >
              REAL
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="content">
        <header ref={scrollRefs.dashboard} className="hero glass flex flex-col md:flex-row justify-between items-start gap-8 p-8">
          <div className="max-w-xl">
            <p className="eyebrow text-cyan-400 mb-2">NEURAL NAVIGATION ACTIVE</p>
            <h2 className="text-5xl font-black font-headline tracking-tighter mb-4">
              FASTEST STOP.<br/>
              <span className="text-cyan-400">SMART REROUTE.</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Analyzing travel vectors, queue telemetry, and grid capacity to 
              minimize total charging overhead in real-time.
            </p>
          </div>

          <div className="hero-stats grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="stat-card glass p-6 border-white/5 flex flex-col justify-center">
              <span className="tiny-label text-cyan-400">OPTIMAL TARGET</span>
              <strong className="text-2xl block mt-1">{bestStation?.name}</strong>
              <small className="text-white/40">{bestStation?.totalEffectiveMinutes}m Effective Time</small>
            </div>
            <div className="stat-card glass p-6 border-white/5 flex flex-col justify-center">
              <span className="tiny-label text-amber-400">NETWORK LOAD</span>
              <strong className="text-2xl block mt-1">{rankedStations.reduce((a, s) => a + s.queueLength, 0)}</strong>
              <small className="text-white/40">Vehicles in Queue</small>
            </div>
          </div>
        </header>

        <section className="grid-layout grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div ref={scrollRefs.map} className="lg:col-span-2 space-y-6">
            <div className="panel glass p-6 relative min-h-[500px]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold font-headline">Live Tactical Map</h3>
                  <p className="text-xs text-white/40">Global grid synchronization: OK</p>
                </div>
                <button onClick={() => setSelectedId(null)} className="text-[10px] text-cyan-400 font-bold border border-cyan-400/20 px-3 py-1 rounded-lg hover:bg-cyan-400/10">
                  RECENTER VIEW
                </button>
              </div>
              <MapView 
                stations={rankedStations}
                bestStationId={bestStation?.id}
                selectedStationId={selectedId}
                mode={mode}
                onStationSelect={(id) => setSelectedId(id)}
              />
            </div>

            <div ref={scrollRefs.queue} className="panel glass p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-headline">Nearby Port Load</h3>
                <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rankedStations.map((s) => (
                  <article 
                    key={s.id} 
                    onClick={() => setSelectedId(s.id)}
                    className={`station-card p-4 glass border transition-all cursor-pointer ${selectedId === s.id ? 'border-cyan-500/50 bg-cyan-500/5 shadow-xl' : 'border-white/5 hover:border-white/10'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold">{s.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.status === 'Free' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {s.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-white/40 font-bold uppercase mb-4">
                      <div>ETA: <span className="text-white">{s.travelMinutes}m</span></div>
                      <div>Queue: <span className="text-white">{s.waitMinutes}m</span></div>
                      <div>Ports: <span className="text-white">{s.availablePorts}</span></div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] text-white/40 uppercase">Total Efficiency</p>
                        <p className="text-lg font-bold text-cyan-400">{s.totalEffectiveMinutes} min</p>
                      </div>
                      <button className="text-[10px] font-bold text-white bg-white/10 px-3 py-1.5 rounded-lg hover:bg-cyan-500 hover:text-black transition-all">
                        SELECT
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="panel glass p-6">
              <h3 className="text-xl font-bold font-headline mb-6 flex items-center gap-2">
                <Battery className="w-5 h-5 text-cyan-400" />
                Quick Recommendation
              </h3>
              {selectedStation && (
                <RecommendationPanel 
                  station={selectedStation} 
                  isBest={selectedStation.id === bestStation?.id}
                  onReroute={handleReroute}
                />
              )}
              
              <div className="terminal mt-6 p-4 bg-black/40 rounded-2xl border border-white/5 font-mono text-[10px] text-cyan-400/80">
                <p className="text-white/40 mb-2">// SYSTEM LOGS</p>
                <p>[OK] Ranking engine synced with {mode} api</p>
                <p>[OK] Best option identified: {bestStation?.name}</p>
                <p>[OK] Neural grid pathing complete</p>
                <p className="animate-pulse">_Waiting for user vector confirmation...</p>
              </div>
            </div>

            <div ref={scrollRefs.admin} className="panel glass p-6 overflow-hidden">
              <h3 className="text-xl font-bold font-headline mb-6 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                Operator Dashboard
              </h3>
              <div className="space-y-4">
                {rankedStations.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${s.status === 'Free' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-amber-500'}`} />
                      <div>
                        <p className="text-xs font-bold">{s.name}</p>
                        <p className="text-[9px] text-white/40">{s.operator}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold">{Math.round((s.availablePorts / s.totalPorts) * 100)}% Load</p>
                      <div className="w-16 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500" 
                          style={{ width: `${(s.availablePorts / s.totalPorts) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
