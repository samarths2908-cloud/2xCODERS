"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { demoStations } from "@/lib/mock-data";
import { rankStations } from "@/lib/charging";
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
  LayoutDashboard,
  Navigation,
  Loader2,
  BatteryCharging
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const MapView = dynamic(() => import("@/components/MapView"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[430px] rounded-3xl bg-muted/10 animate-pulse border border-white/10 glass flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 mx-auto text-cyan-400/50 mb-4 animate-spin" />
        <p className="text-sm font-bold text-white/40 font-headline uppercase tracking-widest">Calibrating Map Grid...</p>
      </div>
    </div>
  )
});

type Tab = "dashboard" | "map" | "queue" | "admin";
type Mode = "demo" | "real";
type ChargeMode = "full" | "custom";

export default function WattWiseApp() {
  const [mode, setMode] = useState<Mode>("demo");
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [rawStations, setRawStations] = useState<Station[]>(demoStations);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chargeMode, setChargeMode] = useState<ChargeMode>("custom");
  const [startPct, setStartPct] = useState(25);
  const [targetPct, setTargetPct] = useState(80);
  const [tick, setTick] = useState(0);

  const scrollRefs = {
    dashboard: useRef<HTMLDivElement>(null),
    map: useRef<HTMLDivElement>(null),
    queue: useRef<HTMLDivElement>(null),
    admin: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === "demo") {
      interval = setInterval(() => {
        setRawStations(prev => prev.map(s => ({
          ...s,
          availablePorts: Math.max(0, Math.min(s.totalPorts, s.availablePorts + (Math.random() > 0.5 ? 1 : -1))),
          queueLength: Math.max(0, s.queueLength + (Math.random() > 0.7 ? 1 : -1))
        })));
        setTick(t => t + 1);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [mode]);

  const rankedStations = useMemo(() => {
    const finalTarget = chargeMode === "full" ? 100 : targetPct;
    return rankStations(rawStations, startPct, finalTarget);
  }, [rawStations, startPct, targetPct, chargeMode, tick]);

  const bestStation = rankedStations[0];
  const selectedStation = rankedStations.find(s => s.id === selectedId) || bestStation;

  const scrollTo = (tab: Tab) => {
    setActiveTab(tab);
    scrollRefs[tab].current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleReroute = () => {
    if (bestStation) {
      setSelectedId(bestStation.id);
      scrollTo("map");
    }
  };

  return (
    <main className="page-shell">
      {/* Background Particles */}
      <div className="bg-particles">
        {Array.from({ length: 30 }).map((_, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              opacity: Math.random() * 0.5
            }} 
          />
        ))}
      </div>

      {/* Sidebar */}
      <aside className="sidebar glass">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="brand-mark">W</div>
            <div>
              <h1 className="text-xl font-bold tracking-tighter">WATTWISE</h1>
              <p className="text-[9px] uppercase tracking-[0.3em] opacity-40">Command Center</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { id: "map", icon: MapIcon, label: "Live Map" },
              { id: "queue", icon: ListOrdered, label: "Reroute Feed" },
              { id: "admin", icon: Settings, label: "Management" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id as Tab)}
                className={`nav-btn flex items-center gap-3 ${activeTab === item.id ? 'active' : ''}`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="p-4 glass rounded-2xl bg-cyan-500/5">
            <p className="text-[10px] uppercase font-bold text-cyan-400 mb-2">Vehicle Status</p>
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold">{startPct}% Charge</span>
            </div>
          </div>
          
          <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5">
            <button 
              onClick={() => setMode("demo")}
              className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all ${mode === "demo" ? 'bg-cyan-500 text-black' : 'text-white/40'}`}
            >
              SIMULATION
            </button>
            <button 
              onClick={() => setMode("real")}
              className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all ${mode === "real" ? 'bg-green-500 text-black' : 'text-white/40'}`}
            >
              LIVE
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="content">
        <header ref={scrollRefs.dashboard} className="hero glass flex flex-col lg:flex-row justify-between items-start gap-8 p-10 rounded-[2.5rem]">
          <div className="max-w-2xl">
            <p className="text-xs font-bold text-cyan-400 tracking-[0.4em] uppercase mb-3">System Optimized Navigation</p>
            <h2 className="text-6xl font-black font-headline tracking-tighter mb-6 leading-[0.9]">
              INDIA'S FASTEST<br/>
              <span className="text-cyan-400">CHARGING VECTORS.</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              Real-time synchronization with {mode === "demo" ? "simulated" : "live"} grid telemetry 
              at Bangalore sectors. Ranked by minimal wait-time overhead.
            </p>
            
            <div className="flex gap-4">
              <button onClick={handleReroute} className="glow-btn px-8 py-4 flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                Initiate Reroute
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-96">
            <div className="glass p-6 border-white/5 rounded-3xl">
              <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">Best ETA</span>
              <strong className="text-3xl block mt-2 font-headline">{bestStation?.totalEffectiveMinutes}m</strong>
              <small className="text-white/40 font-mono text-[9px] uppercase tracking-tighter">{bestStation?.name}</small>
            </div>
            <div className="glass p-6 border-white/5 rounded-3xl">
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Network Load</span>
              <strong className="text-3xl block mt-2 font-headline">{rankedStations.reduce((a, s) => a + s.queueLength, 0)}</strong>
              <small className="text-white/40 font-mono text-[9px] uppercase tracking-tighter">Vehicles in Queue</small>
            </div>
            <div className="glass p-6 border-white/5 rounded-3xl col-span-2">
              <span className="text-[10px] uppercase tracking-widest text-green-400 font-bold">Active Ports</span>
              <div className="flex items-center justify-between mt-2">
                <strong className="text-3xl font-headline">{rankedStations.reduce((a, s) => a + s.availablePorts, 0)}</strong>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`h-1 w-4 rounded-full ${i < 3 ? 'bg-green-500' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div ref={scrollRefs.map} className="lg:col-span-2 space-y-6">
            <div className="panel glass p-6 rounded-[2.5rem] relative">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold font-headline">Tactical Sector Map</h3>
                  <p className="text-xs text-white/40">Bangalore Metropolitan Area</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                    <span className="text-[10px] font-bold">OPTIMAL</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />
                    <span className="text-[10px] font-bold">SELECTED</span>
                  </div>
                </div>
              </div>
              <MapView 
                stations={rankedStations}
                bestStationId={bestStation?.id}
                selectedStationId={selectedId}
                onStationSelect={(id) => setSelectedId(id)}
              />
            </div>

            <div ref={scrollRefs.queue} className="panel glass p-8 rounded-[2.5rem]">
              <h3 className="text-xl font-bold font-headline mb-6">Nearby Port Telemetry</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rankedStations.map((s) => (
                  <article 
                    key={s.id} 
                    onClick={() => setSelectedId(s.id)}
                    className={`p-5 glass border transition-all cursor-pointer rounded-3xl ${selectedId === s.id ? 'border-cyan-500/50 bg-cyan-500/10 shadow-2xl' : 'border-white/5 hover:border-white/20'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg">{s.name}</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">{s.operator}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${s.status === 'Free' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {s.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-black/20 p-2 rounded-xl">
                        <p className="text-[8px] text-white/30 font-bold uppercase">Wait Time</p>
                        <p className="text-sm font-bold text-amber-400">{s.waitMinutes}m</p>
                      </div>
                      <div className="bg-black/20 p-2 rounded-xl">
                        <p className="text-[8px] text-white/30 font-bold uppercase">Ports Avail</p>
                        <p className="text-sm font-bold text-cyan-400">{s.availablePorts}/{s.totalPorts}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] text-white/40 uppercase">Total ETA</p>
                        <p className="text-2xl font-black text-cyan-400 tracking-tighter">{s.totalEffectiveMinutes}<span className="text-xs ml-0.5">MIN</span></p>
                      </div>
                      <button className="text-[10px] font-black text-white bg-white/10 px-4 py-2 rounded-xl hover:bg-cyan-500 hover:text-black transition-all uppercase tracking-widest">
                        Focus
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="panel glass p-8 rounded-[2.5rem]">
              <h3 className="text-xl font-bold font-headline mb-8 flex items-center gap-3">
                <BatteryCharging className="w-6 h-6 text-cyan-400" />
                Charge Control
              </h3>

              <div className="space-y-10">
                <Tabs value={chargeMode} onValueChange={(v) => setChargeMode(v as ChargeMode)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-black/40 p-1 border border-white/5 rounded-2xl h-12">
                    <TabsTrigger value="full" className="rounded-xl data-[state=active]:bg-cyan-500 data-[state=active]:text-black text-xs font-bold">FULL (100%)</TabsTrigger>
                    <TabsTrigger value="custom" className="rounded-xl data-[state=active]:bg-cyan-500 data-[state=active]:text-black text-xs font-bold">CUSTOM</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Start Level</Label>
                      <span className="text-xl font-headline font-bold text-cyan-400">{startPct}%</span>
                    </div>
                    <Slider 
                      value={[startPct]} 
                      onValueChange={(val) => setStartPct(val[0])}
                      max={95} 
                      step={1} 
                      className="cursor-pointer"
                    />
                  </div>

                  {chargeMode === "custom" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Target Level</Label>
                        <span className="text-xl font-headline font-bold text-amber-400">{targetPct}%</span>
                      </div>
                      <Slider 
                        value={[targetPct]} 
                        onValueChange={(val) => setTargetPct(Math.max(val[0], startPct + 5))}
                        min={startPct + 5}
                        max={100} 
                        step={1} 
                        className="cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-white/5">
                  <RecommendationPanel 
                    station={selectedStation} 
                    isBest={selectedStation.id === bestStation?.id}
                    onReroute={handleReroute}
                  />
                </div>
              </div>
            </div>

            <div ref={scrollRefs.admin} className="panel glass p-8 rounded-[2.5rem]">
              <h3 className="text-xl font-bold font-headline mb-6 flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-amber-500" />
                Network Console
              </h3>
              <div className="space-y-4">
                {rankedStations.map((s) => (
                  <div key={s.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-cyan-500/30 transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${s.status === 'Free' ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
                        <span className="text-xs font-bold">{s.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-white/40">{s.chargerKW}kW</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-500 transition-all duration-1000" 
                        style={{ width: `${(s.availablePorts / s.totalPorts) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-[9px] font-bold uppercase tracking-tighter text-white/30">
                      <span>Occupancy: {Math.round((1 - s.availablePorts / s.totalPorts) * 100)}%</span>
                      <span>{s.usageType}</span>
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
