"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { demoStations } from "@/lib/mock-data";
import { rankStations } from "@/lib/charging";
import { RankedStation, Station, Location, Booking } from "@/lib/types";
import RecommendationPanel from "@/components/RecommendationPanel";
import BookingModal from "@/components/BookingModal";
import { 
  Zap, 
  Map as MapIcon, 
  ListOrdered, 
  ShieldAlert, 
  Settings,
  Battery,
  LayoutDashboard,
  Navigation,
  Loader2,
  BatteryCharging,
  LocateFixed,
  AlertTriangle,
  Activity
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const MapView = dynamic(() => import("@/components/MapView"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[430px] rounded-3xl bg-muted/10 animate-pulse border border-white/10 glass flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 mx-auto text-cyan-400/50 mb-4 animate-spin" />
        <p className="text-sm font-bold text-white/40 font-headline uppercase tracking-widest">Syncing Tactical Grid...</p>
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
  opacity: number;
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
    const generated = Array.from({ length: 40 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 15}s`,
      opacity: Math.random() * 0.4
    }));
    setParticles(generated);

    // Geolocation Tracking
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsLocating(false);
          toast({ title: "LOCATION SYNCED", description: "Tactical map centered on your position." });
        },
        () => {
          setIsLocating(false); 
          toast({ variant: "destructive", title: "GPS OFFLINE", description: "Using fallback coordinates in Mangalore." });
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
          availablePorts: Math.max(0, Math.min(s.totalPorts, s.availablePorts + (Math.random() > 0.5 ? 1 : -1))),
          queueLength: Math.max(0, s.queueLength + (Math.random() > 0.8 ? 1 : -1))
        })));
        setTick(t => t + 1);
      }, 8000);
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
      toast({ title: "VECTOR LOCKED", description: `Rerouting to ${bestStation.name}` });
    }
  };

  const handleBookConfirm = (bookingData: Omit<Booking, 'id'>) => {
    const hasOverlap = bookings.some(b => 
      b.stationId === bookingData.stationId && 
      b.date === bookingData.date && 
      b.startTime === bookingData.startTime
    );

    if (hasOverlap) {
      toast({
        variant: "destructive",
        title: "SLOT CONFLICT",
        description: "This time window is reserved. Select a different slot."
      });
      return;
    }

    const newBooking = { ...bookingData, id: Math.random().toString(36).substr(2, 9) };
    setBookings([...bookings, newBooking]);
    toast({
      title: "RESERVATION ACTIVE",
      description: `Target node: ${selectedStation.name}`
    });
  };

  return (
    <main className="page-shell">
      {isLocating && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-cyan-500 text-black py-2 px-4 text-center font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3">
          <Loader2 className="w-3 h-3 animate-spin" />
          Accessing Satellite Uplink...
        </div>
      )}

      <div className="bg-particles">
        {particles.map((p, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{ 
              left: p.left, 
              top: p.top,
              animationDelay: p.delay,
              opacity: p.opacity
            }} 
          />
        ))}
      </div>

      <aside className="sidebar glass">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="brand-mark">W</div>
            <div>
              <h1 className="text-xl font-black tracking-tighter">WATTWISE</h1>
              <p className="text-[9px] uppercase tracking-[0.4em] text-cyan-500/60 font-black">Tactical Hub</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: "dashboard", icon: LayoutDashboard, label: "Command" },
              { id: "map", icon: MapIcon, label: "Live Grid" },
              { id: "queue", icon: ListOrdered, label: "Sector Feed" },
              { id: "admin", icon: ShieldAlert, label: "Network Logs" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id as Tab)}
                className={`nav-btn flex items-center gap-3 ${activeTab === item.id ? 'active' : ''}`}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-black uppercase tracking-widest text-[10px]">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="p-4 glass rounded-2xl bg-cyan-500/5 border-cyan-500/20">
            <p className="text-[9px] uppercase font-black text-cyan-400 mb-2 tracking-[0.2em]">Vehicle Telemetry</p>
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-black tracking-tighter">{startPct}% ENERGY</span>
            </div>
          </div>
          
          <div className="flex p-1 bg-black/60 rounded-2xl border border-white/10">
            <button 
              onClick={() => setMode("demo")}
              className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${mode === "demo" ? 'bg-cyan-500 text-black' : 'text-white/40 hover:text-white/60'}`}
            >
              Sim
            </button>
            <button 
              onClick={() => setMode("real")}
              className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${mode === "real" ? 'bg-green-500 text-black' : 'text-white/40 hover:text-white/60'}`}
            >
              Live
            </button>
          </div>
        </div>
      </aside>

      <div className="content">
        <header ref={scrollRefs.dashboard} className="hero glass flex flex-col lg:flex-row justify-between items-start gap-8 p-10 rounded-[2.5rem] mt-4 border-white/5 shadow-2xl">
          <div className="max-w-2xl">
            <p className="text-xs font-black text-cyan-400 tracking-[0.5em] uppercase mb-4">India Tactical Grid v4.2</p>
            <h2 className="text-7xl font-black font-headline tracking-tighter mb-6 leading-[0.85]">
              FASTEST<br/>
              <span className="text-cyan-400">VECTOR FOUND.</span>
            </h2>
            <p className="text-white/50 text-lg leading-relaxed mb-8 font-medium">
              Scanning 420 tactical nodes across the Indian landmass. Automatic rerouting enabled based on real-time port occupancy.
            </p>
            
            <div className="flex gap-4">
              <button onClick={handleReroute} className="glow-btn px-10 py-5 flex items-center gap-3">
                <Navigation className="w-5 h-5" />
                Reroute Optimal
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-[420px]">
            <div className="glass p-6 border-white/10 rounded-3xl bg-black/20">
              <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-black">Closest Node</span>
              <strong className="text-4xl block mt-2 font-black font-headline tracking-tighter">{bestStation?.distanceKm.toFixed(1)}<span className="text-xs ml-1 opacity-40">KM</span></strong>
              <small className="text-white/40 font-mono text-[9px] uppercase tracking-tighter font-black">{bestStation?.city}</small>
            </div>
            <div className="glass p-6 border-white/10 rounded-3xl bg-black/20">
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-black">Active Grid</span>
              <strong className="text-4xl block mt-2 font-black font-headline tracking-tighter">{rankedStations.length}</strong>
              <small className="text-white/40 font-mono text-[9px] uppercase tracking-tighter font-black">Nodes Online</small>
            </div>
            <div className="glass p-6 border-white/10 rounded-3xl col-span-2 bg-green-500/5">
              <span className="text-[10px] uppercase tracking-widest text-green-400 font-black">Reserved Ports</span>
              <div className="flex items-center justify-between mt-2">
                <strong className="text-4xl font-black font-headline tracking-tighter">{bookings.length}</strong>
                <div className="flex gap-1.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={`h-1.5 w-5 rounded-full ${i < bookings.length ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div ref={scrollRefs.map} className="panel glass p-6 rounded-[2.5rem] relative border-white/5 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black font-headline uppercase tracking-tighter">Live Sector Grid</h3>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black mt-1">Lat: {userLocation.lat.toFixed(4)} • Lng: {userLocation.lng.toFixed(4)}</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Target</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Node</span>
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

            <div ref={scrollRefs.queue} className="panel glass p-8 rounded-[2.5rem] border-white/5 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black font-headline uppercase tracking-tighter">Sector Feed (Priority Nodes)</h3>
                <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full font-black uppercase tracking-widest">Showing Top 50</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayStations.map((s) => (
                  <article 
                    key={s.id} 
                    onClick={() => setSelectedId(s.id)}
                    className={`p-6 glass border transition-all cursor-pointer rounded-3xl ${selectedId === s.id ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : 'border-white/5 hover:border-white/20 bg-black/20'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-black text-lg tracking-tight uppercase">{s.name}</h4>
                        <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-black">{s.operator} • {s.city}</p>
                      </div>
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${s.status === 'Free' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {s.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-black/30 p-3 rounded-2xl border border-white/5">
                        <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">Distance</p>
                        <p className="text-sm font-black text-white">{s.distanceKm.toFixed(1)}KM</p>
                      </div>
                      <div className="bg-black/30 p-3 rounded-2xl border border-white/5">
                        <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">Wait Time</p>
                        <p className="text-sm font-black text-amber-400">{s.waitMinutes}MIN</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[8px] text-white/40 uppercase tracking-widest font-black">Effective ETA</p>
                        <p className="text-3xl font-black text-cyan-400 tracking-tighter">{s.totalEffectiveMinutes}<span className="text-xs ml-0.5 opacity-60">MIN</span></p>
                      </div>
                      <button className="text-[9px] font-black text-white bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition-all uppercase tracking-widest">
                        Focus
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="panel glass p-8 rounded-[2.5rem] border-white/5 shadow-2xl">
              <h3 className="text-xl font-black font-headline mb-8 flex items-center gap-3 uppercase tracking-tighter">
                <BatteryCharging className="w-6 h-6 text-cyan-400" />
                Target Control
              </h3>

              <div className="space-y-10">
                <Tabs value={chargeMode} onValueChange={(v) => setChargeMode(v as ChargeMode)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-black/60 p-1 border border-white/10 rounded-2xl h-12">
                    <TabsTrigger value="full" className="rounded-xl data-[state=active]:bg-cyan-500 data-[state=active]:text-black text-[10px] font-black uppercase tracking-widest transition-all">Full</TabsTrigger>
                    <TabsTrigger value="custom" className="rounded-xl data-[state=active]:bg-cyan-500 data-[state=active]:text-black text-[10px] font-black uppercase tracking-widest transition-all">Custom</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Current State</Label>
                      <span className="text-2xl font-headline font-black text-cyan-400 tracking-tighter">{startPct}%</span>
                    </div>
                    <Slider 
                      value={[startPct]} 
                      onValueChange={(val) => setStartPct(val[0])}
                      max={95} 
                      step={1} 
                    />
                  </div>

                  {chargeMode === "custom" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Target Delta</Label>
                        <span className="text-2xl font-headline font-black text-amber-400 tracking-tighter">{targetPct}%</span>
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

                <div className="pt-8 border-t border-white/5">
                  <RecommendationPanel 
                    station={selectedStation} 
                    isBest={selectedStation.id === bestStation?.id}
                    onReroute={handleReroute}
                  />
                  <button 
                    onClick={() => setIsBookingOpen(true)}
                    className="w-full mt-6 py-5 rounded-2xl border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2"
                  >
                    <Activity className="w-4 h-4" />
                    Schedule Tactical Slot
                  </button>
                </div>
              </div>
            </div>

            <div ref={scrollRefs.admin} className="panel glass p-8 rounded-[2.5rem] border-white/5 shadow-2xl">
              <h3 className="text-xl font-black font-headline mb-6 flex items-center gap-3 text-amber-500 uppercase tracking-tighter">
                <ShieldAlert className="w-6 h-6" />
                System Logs
              </h3>
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div key={b.id} className="p-5 rounded-3xl bg-cyan-500/5 border border-cyan-500/20 shadow-inner">
                    <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Reservation Locked</p>
                    <p className="text-xs font-black uppercase mt-2 text-white/80">{rawStations.find(s => s.id === b.stationId)?.name}</p>
                    <div className="flex justify-between mt-4 text-[10px] font-mono text-white/40 uppercase">
                      <span>{b.date} • {b.startTime}</span>
                      <span className="text-cyan-400/60">{b.duration} Min</span>
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-[10px] text-white/20 uppercase font-black tracking-widest italic">No active vectors found.</p>
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
