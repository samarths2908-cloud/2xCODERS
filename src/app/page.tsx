"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { demoStations } from "@/lib/mock-data";
import { rankStations } from "@/lib/charging";
import { RankedStation, Station, Location, Booking } from "@/lib/types";
import RecommendationPanel from "@/components/RecommendationPanel";
import BookingModal from "@/components/BookingModal";
import { 
  Map as MapIcon, 
  ListOrdered, 
  ShieldAlert, 
  Battery,
  LayoutDashboard,
  Navigation,
  Loader2,
  BatteryCharging,
  Activity,
  Cpu,
  Globe
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const MapView = dynamic(() => import("@/components/MapView"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] rounded-[2.5rem] bg-black/40 animate-pulse border border-white/10 glass flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 mx-auto text-cyan-400 mb-4 animate-spin" />
        <p className="text-[10px] font-black text-cyan-400/50 uppercase tracking-[0.5em]">Initializing Tactical Map...</p>
      </div>
    </div>
  )
});

const DEFAULT_LOCATION: Location = {
  lat: 12.846032,
  lng: 74.955173
};

type Tab = "dashboard" | "map" | "queue" | "admin";
type Mode = "demo" | "real";
type ChargeMode = "full" | "custom";

interface Particle {
  left: string;
  top: string;
  delay: string;
}

export default function WattWiseApp() {
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("real");
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [rawStations, setRawStations] = useState<Station[]>(demoStations);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chargeMode, setChargeMode] = useState<ChargeMode>("custom");
  const [startPct, setStartPct] = useState(25);
  const [targetPct, setTargetPct] = useState(80);
  const [tick, setTick] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isLocating, setIsLocating] = useState(true);
  const [userLocation, setUserLocation] = useState<Location>(DEFAULT_LOCATION);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const scrollRefs = {
    dashboard: useRef<HTMLDivElement>(null),
    map: useRef<HTMLDivElement>(null),
    queue: useRef<HTMLDivElement>(null),
    admin: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    const generated = Array.from({ length: 50 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`
    }));
    setParticles(generated);

    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsLocating(false);
          toast({ title: "SATELLITE SYNC", description: "GPS uplink established successfully." });
        },
        () => {
          setIsLocating(false); 
          toast({ variant: "destructive", title: "GPS OFFLINE", description: "Reverting to fallback sector coordinates." });
        }
      );
    } else {
      setIsLocating(false);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === "demo") {
      interval = setInterval(() => {
        setRawStations(prev => prev.map(s => ({
          ...s,
          availablePorts: Math.max(0, Math.min(s.totalPorts, s.availablePorts + (Math.random() > 0.6 ? 1 : -1))),
          queueLength: Math.max(0, s.queueLength + (Math.random() > 0.8 ? 1 : -1))
        })));
        setTick(t => t + 1);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [mode]);

  const rankedStations = useMemo(() => {
    const finalTarget = chargeMode === "full" ? 100 : targetPct;
    return rankStations(rawStations, startPct, finalTarget, userLocation);
  }, [rawStations, startPct, targetPct, chargeMode, userLocation, tick]);

  const bestStation = rankedStations[0];
  const selectedStation = rankedStations.find(s => s.id === selectedId) || bestStation;

  const displayStations = useMemo(() => rankedStations.slice(0, 50), [rankedStations]);

  useEffect(() => {
    if (bestStation && !selectedId) {
      setSelectedId(bestStation.id);
    }
  }, [bestStation, selectedId]);

  const scrollTo = (tab: Tab) => {
    setActiveTab(tab);
    scrollRefs[tab].current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleReroute = () => {
    if (bestStation) {
      setSelectedId(bestStation.id);
      scrollTo("map");
      toast({ title: "VECTOR LOCKED", description: `Optimized path set to ${bestStation.name}` });
    }
  };

  const handleBookConfirm = (bookingData: Omit<Booking, 'id'>) => {
    const newBooking = { ...bookingData, id: Math.random().toString(36).substr(2, 9) };
    setBookings([...bookings, newBooking]);
    toast({
      title: "NODE RESERVED",
      description: `Charging port locked at ${selectedStation.name}`
    });
  };

  return (
    <main className="page-shell">
      <div className="bg-particles">
        {particles.map((p, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{ 
              left: p.left, 
              top: p.top,
              animationDelay: p.delay
            }} 
          />
        ))}
      </div>

      <aside className="sidebar glass">
        <div>
          <div className="flex items-center gap-4 mb-12">
            <div className="brand-mark">W</div>
            <div>
              <h1 className="text-2xl font-black font-headline tracking-tighter">WATTWISE</h1>
              <p className="text-[9px] uppercase tracking-[0.5em] text-cyan-500 font-bold">Tactical Command</p>
            </div>
          </div>

          <nav className="space-y-3">
            {[
              { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { id: "map", icon: MapIcon, label: "Tactical Map" },
              { id: "queue", icon: ListOrdered, label: "Sector Feed" },
              { id: "admin", icon: ShieldAlert, label: "Network Logs" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id as Tab)}
                className={`nav-btn flex items-center gap-4 ${activeTab === item.id ? 'active' : ''}`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-6">
          <div className="p-5 glass rounded-[1.5rem] bg-cyan-500/5 border-cyan-500/20">
            <p className="text-[9px] uppercase font-black text-cyan-400 mb-3 tracking-widest">System Status</p>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-tight uppercase">Core Link: Stable</span>
            </div>
          </div>
          
          <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5">
            <button 
              onClick={() => setMode("demo")}
              className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${mode === "demo" ? 'bg-cyan-500 text-black' : 'text-white/40 hover:text-white/60'}`}
            >
              Sim
            </button>
            <button 
              onClick={() => setMode("real")}
              className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${mode === "real" ? 'bg-primary text-black' : 'text-white/40 hover:text-white/60'}`}
            >
              Live
            </button>
          </div>
        </div>
      </aside>

      <div className="content">
        <header ref={scrollRefs.dashboard} className="glass p-10 rounded-[2.5rem] flex flex-col lg:flex-row justify-between items-start gap-12 mt-4">
          <div className="max-w-2xl">
            <p className="text-[11px] font-black text-cyan-400 tracking-[0.6em] uppercase mb-4 flex items-center gap-3">
              <Globe className="w-4 h-4" /> Grid Sector Alpha-9
            </p>
            <h2 className="text-7xl font-black font-headline tracking-tighter mb-6 leading-[0.9]">
              OPTIMAL<br/>
              <span className="text-cyan-400">VECTOR LOCKED.</span>
            </h2>
            <p className="text-white/40 text-lg leading-relaxed mb-8 font-medium">
              Network scan complete. {rawStations.length} nodes active across the tactical grid. Deep-learning algorithm has isolated the most efficient charging vector for your current telemetry.
            </p>
            
            <button onClick={handleReroute} className="glow-btn px-10 py-5 flex items-center gap-3">
              <Navigation className="w-5 h-5" />
              Initiate Reroute
            </button>
          </div>

          <div className="grid grid-cols-2 gap-5 w-full lg:w-[450px]">
            <div className="glass p-8 rounded-[2rem] bg-black/30">
              <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-black">Optimal Distance</span>
              <strong className="text-5xl block mt-3 font-black font-headline tracking-tighter">{bestStation?.distanceKm.toFixed(1)}<span className="text-sm ml-1 opacity-30">KM</span></strong>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                <span className="text-[10px] text-white/40 uppercase font-black">{bestStation?.city}</span>
              </div>
            </div>
            <div className="glass p-8 rounded-[2rem] bg-black/30">
              <span className="text-[10px] uppercase tracking-widest text-purple-400 font-black">Active Nodes</span>
              <strong className="text-5xl block mt-3 font-black font-headline tracking-tighter">{rankedStations.length}</strong>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span className="text-[10px] text-white/40 uppercase font-black">Scanning...</span>
              </div>
            </div>
            <div className="glass p-8 rounded-[2rem] col-span-2 bg-cyan-500/5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] uppercase tracking-widest text-green-400 font-black">Active Reservations</span>
                <Cpu className="w-4 h-4 text-green-500/50" />
              </div>
              <div className="flex items-center justify-between">
                <strong className="text-5xl font-black font-headline tracking-tighter">{bookings.length}</strong>
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`h-1.5 w-6 rounded-full ${i < bookings.length ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 space-y-6">
            <div ref={scrollRefs.map} className="glass p-8 rounded-[2.5rem] relative">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black font-headline uppercase tracking-tight">Tactical Grid Overlay</h3>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-black mt-1">Sector: {userLocation.lat.toFixed(3)}N / {userLocation.lng.toFixed(3)}E</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Optimal Target</span>
                  </div>
                  <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Your Position</span>
                  </div>
                </div>
              </div>
              <MapView 
                stations={rankedStations}
                bestStationId={bestStation?.id}
                selectedStationId={selectedId}
                userLocation={userLocation}
                onStationSelect={(id) => setSelectedId(id)}
              />
            </div>

            <div ref={scrollRefs.queue} className="glass p-10 rounded-[2.5rem]">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black font-headline uppercase tracking-tight">Sector Node Feed</h3>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-4 py-2 rounded-full font-black uppercase tracking-widest">Displaying Primary Nodes</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {displayStations.map((s) => (
                  <article 
                    key={s.id} 
                    onClick={() => setSelectedId(s.id)}
                    className={`p-8 glass border transition-all cursor-pointer rounded-[2rem] ${selectedId === s.id ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_40px_rgba(6,182,212,0.15)]' : 'border-white/5 hover:border-white/20 bg-black/30'}`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="font-black text-xl tracking-tight uppercase">{s.name}</h4>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-black mt-1">{s.operator} • {s.city}</p>
                      </div>
                      <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${s.availablePorts > 0 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {s.availablePorts > 0 ? 'Free' : 'Busy'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                        <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mb-1">Range Delta</p>
                        <p className="text-lg font-black">{s.distanceKm.toFixed(1)}km</p>
                      </div>
                      <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                        <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mb-1">Grid Lag</p>
                        <p className="text-lg font-black text-amber-400">{s.waitMinutes}m</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] text-white/40 uppercase tracking-widest font-black">Effective ETA</p>
                        <p className="text-4xl font-black text-cyan-400 tracking-tighter">{s.totalEffectiveMinutes}<span className="text-sm ml-1 opacity-50">MIN</span></p>
                      </div>
                      <button className="text-[10px] font-black bg-white/5 border border-white/10 px-6 py-3 rounded-xl hover:bg-cyan-500 hover:text-black transition-all uppercase tracking-widest">
                        Focus Node
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="glass p-10 rounded-[2.5rem]">
              <h3 className="text-2xl font-black font-headline mb-10 flex items-center gap-4 uppercase tracking-tight">
                <BatteryCharging className="w-8 h-8 text-cyan-400" />
                Telemetry Console
              </h3>

              <div className="space-y-12">
                <Tabs value={chargeMode} onValueChange={(v) => setChargeMode(v as ChargeMode)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-black/60 p-1 border border-white/10 rounded-2xl h-14">
                    <TabsTrigger value="full" className="rounded-xl data-[state=active]:bg-cyan-500 data-[state=active]:text-black text-[11px] font-black uppercase tracking-widest">Standard</TabsTrigger>
                    <TabsTrigger value="custom" className="rounded-xl data-[state=active]:bg-cyan-500 data-[state=active]:text-black text-[11px] font-black uppercase tracking-widest">Advanced</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="space-y-10">
                  <div className="space-y-5">
                    <div className="flex justify-between items-end">
                      <Label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Current Storage</Label>
                      <span className="text-3xl font-headline font-black text-cyan-400 tracking-tighter">{startPct}%</span>
                    </div>
                    <Slider 
                      value={[startPct]} 
                      onValueChange={(val) => setStartPct(val[0])}
                      max={95} 
                      step={1} 
                    />
                  </div>

                  {chargeMode === "custom" && (
                    <div className="space-y-5">
                      <div className="flex justify-between items-end">
                        <Label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Target Threshold</Label>
                        <span className="text-3xl font-headline font-black text-amber-400 tracking-tighter">{targetPct}%</span>
                      </div>
                      <Slider 
                        value={[targetPct]} 
                        onValueChange={(val) => setTargetPct(Math.max(val[0], startPct + 5))}
                        min={startPct + 5}
                        max={100} 
                        step={1} 
                      />
                    </div>
                  )}
                </div>

                <div className="pt-10 border-t border-white/10">
                  <RecommendationPanel 
                    station={selectedStation} 
                    isBest={selectedStation.id === bestStation?.id}
                    onReroute={handleReroute}
                  />
                  <button 
                    onClick={() => setIsBookingOpen(true)}
                    className="w-full mt-8 py-6 rounded-2xl border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3"
                  >
                    <Activity className="w-5 h-5 text-cyan-400" />
                    Reserve Tactical Slot
                  </button>
                </div>
              </div>
            </div>

            <div ref={scrollRefs.admin} className="glass p-10 rounded-[2.5rem]">
              <h3 className="text-2xl font-black font-headline mb-8 flex items-center gap-4 text-amber-500 uppercase tracking-tight">
                <ShieldAlert className="w-7 h-7" />
                Network Log
              </h3>
              <div className="space-y-5">
                {bookings.map((b) => (
                  <div key={b.id} className="p-6 rounded-[2rem] bg-cyan-500/5 border border-cyan-500/20">
                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-3">Reservation Locked</p>
                    <p className="text-sm font-black uppercase text-white/80">{rawStations.find(s => s.id === b.stationId)?.name}</p>
                    <div className="flex justify-between mt-5 text-[10px] font-mono text-white/30 uppercase tracking-tighter">
                      <span>{b.date} • {b.startTime}</span>
                      <span className="text-cyan-400/50">{b.duration} Min</span>
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-[11px] text-white/20 uppercase font-black tracking-[0.3em] italic">No active sessions.</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </section>
      </div>

      <BookingModal 
        station={selectedStation}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onConfirm={handleBookConfirm}
      />
    </main>
  );
}