
"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { demoStations } from "@/lib/mock-data";
import { rankStationsByFastestOption, RankedStation } from "@/lib/charging";
import { MapView } from "@/components/MapView";
import { RecommendationPanel } from "@/components/RecommendationPanel";
import { fetchNearbyStations } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

function statusClass(status: string) {
  switch (status) {
    case "Free":
    case "Online":
      return "status free";
    case "Busy":
      return "status busy";
    case "Charging":
      return "status charging";
    case "Delayed":
      return "status delayed";
    default:
      return "status";
  }
}

export default function Page() {
  const { toast } = useToast();

  // Refs for navigation
  const dashboardRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<HTMLDivElement>(null);
  const rerouteRef = useRef<HTMLDivElement>(null);
  const adminRef = useRef<HTMLDivElement>(null);

  // State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isRealMode, setIsRealMode] = useState(false);
  const [stations, setStations] = useState(demoStations);
  const [selectedStation, setSelectedStation] = useState<RankedStation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "[OK] Ranking engine initialized",
    "[MODE] System standby"
  ]);

  // Config
  const currentBattery = 34;
  const targetBattery = 80;
  const userLocation = { latitude: 34.0522, longitude: -118.2437 };

  // Scroll logic
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>, tab: string) => {
    setActiveTab(tab);
    if (ref.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Demo Simulation Logic
  useEffect(() => {
    if (!isRealMode) {
      const interval = setInterval(() => {
        setStations(prev => prev.map(s => ({
          ...s,
          queueLength: Math.max(0, s.queueLength + (Math.random() > 0.5 ? 1 : -1)),
          availablePorts: Math.max(0, Math.min(6, s.availablePorts + (Math.random() > 0.7 ? 1 : -1)))
        })));
        
        const newLog = `[LIVE] Traffic update for ${demoStations[Math.floor(Math.random() * demoStations.length)].name}`;
        setLogs(prev => [newLog, ...prev.slice(0, 4)]);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isRealMode]);

  // Real Mode Data Fetching
  useEffect(() => {
    if (isRealMode) {
      setIsLoading(true);
      fetchNearbyStations(userLocation.latitude, userLocation.longitude)
        .then((data) => {
          const mappedStations = data.map((item: any) => ({
            id: item.ID.toString(),
            name: item.AddressInfo.Title,
            distanceKm: item.AddressInfo.Distance || 2.5,
            queueLength: Math.floor(Math.random() * 3),
            avgSessionMinutes: 20,
            chargerKW: item.Connections?.[0]?.PowerKW || 120,
            batteryCapacityKWh: 75,
            availablePorts: Math.floor(Math.random() * 4),
            status: Math.random() > 0.3 ? "Free" : "Busy",
            location: {
              latitude: item.AddressInfo.Latitude,
              longitude: item.AddressInfo.Longitude
            }
          }));
          setStations(mappedStations);
        })
        .finally(() => setIsLoading(false));
    } else {
      setStations(demoStations);
    }
  }, [isRealMode]);

  // Ranking
  const rankedStations = useMemo(() => {
    return rankStationsByFastestOption(stations, currentBattery, targetBattery);
  }, [stations, currentBattery, targetBattery]);

  const bestStation = rankedStations[0];

  // Sync selected station
  useEffect(() => {
    if (!selectedStation && bestStation) {
      setSelectedStation(bestStation);
    }
  }, [bestStation, selectedStation]);

  const handleReroute = () => {
    if (bestStation) {
      setSelectedStation(bestStation);
      scrollToSection(mapRef, "map");
      toast({
        title: "Reroute Successful",
        description: `Navigation set to ${bestStation.name}`,
      });
    }
  };

  const handleStartBooking = () => {
    setIsBooking(true);
    setSelectedStation(bestStation);
    scrollToSection(rerouteRef, "reroute");
    toast({
      title: "Reserving Port",
      description: `Connecting to ${bestStation?.name} network...`,
    });
    setTimeout(() => {
        setIsBooking(false);
        toast({
            title: "Booking Confirmed",
            description: "Station Alpha: Port P-4 reserved for 15 minutes.",
        });
    }, 2000);
  };

  return (
    <main className="page-shell">
      {/* Background elements with pointer-events-none */}
      <div className="bg-particles pointer-events-none" aria-hidden="true">
        <span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
      </div>

      <div className="bg-orb orb-1 pointer-events-none" aria-hidden="true" />
      <div className="bg-orb orb-2 pointer-events-none" aria-hidden="true" />
      <div className="bg-grid pointer-events-none" aria-hidden="true" />

      <aside className="sidebar glass">
        <div>
          <div className="brand-mark">W</div>
          <div className="brand-text">
            <h1>WattWise EV</h1>
            <p>Smart charging command center</p>
          </div>
        </div>

        <nav className="side-nav">
          <button 
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => scrollToSection(dashboardRef, 'dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-btn ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => scrollToSection(mapRef, 'map')}
          >
            Map
          </button>
          <button 
            className={`nav-btn ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => scrollToSection(queueRef, 'queue')}
          >
            Queue
          </button>
          <button 
            className={`nav-btn ${activeTab === 'reroute' ? 'active' : ''}`}
            onClick={() => scrollToSection(rerouteRef, 'reroute')}
          >
            Reroute
          </button>
          <button 
            className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => window.location.href = '/admin'}
          >
            Admin
          </button>
        </nav>

        <div className="side-footer">
          <div className="tiny-label">Mode</div>
          <div className="mode-switch">
            <button 
              className={`mode ${!isRealMode ? 'active' : ''}`}
              onClick={() => setIsRealMode(false)}
            >
              Demo
            </button>
            <button 
              className={`mode ${isRealMode ? 'active' : ''}`}
              onClick={() => setIsRealMode(true)}
            >
              Real
            </button>
          </div>
        </div>
      </aside>

      <section className="content">
        <header className="hero glass" ref={dashboardRef}>
          <div className="z-10 relative">
            <p className="eyebrow">EV CHARGING INTELLIGENCE SYSTEM</p>
            <h2>{isLoading ? "Fetching Live Data..." : "Fastest station. Lowest wait."}</h2>
            <p className="hero-sub">
              Compare travel time, queue time, and charging time in real time to guide every vehicle to the best available charger.
            </p>
          </div>

          <div className="hero-stats relative z-10">
            <div className="stat-card">
              <span className="tiny-label">Best station</span>
              <strong>{bestStation?.name || "Searching..."}</strong>
              <small>{bestStation?.totalEffectiveTime || 0} min total</small>
            </div>
            <div className="stat-card">
              <span className="tiny-label">Queue wait</span>
              <strong>{bestStation?.waitTime || 0} Min</strong>
              <small>Live update</small>
            </div>
            <div className="stat-card">
              <span className="tiny-label">Free ports</span>
              <strong>0{bestStation?.availablePorts || 0} Ports</strong>
              <small>Ready now</small>
            </div>
          </div>
        </header>

        <section className="grid-layout">
          <div className={`panel glass map-panel ${activeTab === 'map' ? 'ring-2 ring-primary/50' : ''}`} ref={mapRef}>
            <div className="panel-head">
              <div>
                <p className="tiny-label">LIVE MAP</p>
                <h3>Station availability and reroute view</h3>
              </div>
              <button 
                className="glow-btn"
                onClick={() => setSelectedStation(bestStation)}
              >
                Focus Optimal
              </button>
            </div>

            <div className="map-fake" style={{ minHeight: '430px', position: 'relative' }}>
               <MapView 
                  stations={rankedStations} 
                  selectedStation={selectedStation} 
                  onStationClick={(st) => setSelectedStation(st as RankedStation)}
                  userLocation={userLocation}
               />
            </div>
          </div>

          <div className="panel glass recommendation-panel" ref={rerouteRef}>
            <div className="panel-head">
              <div>
                <p className="tiny-label">SMART RECOMMENDATION</p>
                <h3>Fastest effective charging option</h3>
              </div>
            </div>

            {selectedStation && (
              <div className="recommend-card">
                <div className="recommend-top">
                  <div>
                    <p className="tiny-label">Currently Evaluated</p>
                    <h4>{selectedStation.name}</h4>
                  </div>
                  <span className={statusClass(selectedStation.status)}>
                    {selectedStation.status === 'Free' ? 'Free Now' : selectedStation.status}
                  </span>
                </div>

                <div className="time-row">
                  <div>
                    <span className="tiny-label">Travel</span>
                    <strong>{selectedStation.travelTime} min</strong>
                  </div>
                  <div>
                    <span className="tiny-label">Wait</span>
                    <strong>{selectedStation.waitTime} min</strong>
                  </div>
                  <div>
                    <span className="tiny-label">Charge</span>
                    <strong>{selectedStation.chargeTime} min</strong>
                  </div>
                  <div>
                    <span className="tiny-label">Total</span>
                    <strong>{selectedStation.totalEffectiveTime} min</strong>
                  </div>
                </div>

                <button 
                  className="glow-btn full"
                  onClick={handleReroute}
                >
                  Reroute to this station
                </button>
              </div>
            )}

            <div className="terminal">
              <div className="terminal-title">SYSTEM LOG</div>
              {logs.map((log, i) => (
                <div key={i} className="log-line">
                  <span>[{i === 0 ? "LIVE" : "OK"}]</span> {log}
                </div>
              ))}
            </div>
          </div>

          <div className="panel glass station-panel" ref={queueRef}>
            <div className="panel-head">
              <div>
                <p className="tiny-label">STATION STATUS</p>
                <h3>Nearby port load</h3>
              </div>
            </div>

            <div className="station-list">
              {rankedStations.map((station) => (
                <article 
                  key={station.id} 
                  className={`station-card cursor-pointer ${selectedStation?.id === station.id ? 'ring-1 ring-primary/50 border-primary/30' : ''}`}
                  onClick={() => setSelectedStation(station)}
                >
                  <div className="station-top">
                    <h4>{station.name}</h4>
                    <span className={statusClass(station.status)}>{station.status}</span>
                  </div>

                  <div className="station-meta">
                    <span>{station.distanceKm.toFixed(1)} km</span>
                    <span>Wait {station.waitTime} min</span>
                    <span>Charge {station.chargeTime} min</span>
                  </div>

                  <div className="station-total">
                    <span className="tiny-label">Total effective time</span>
                    <strong>{station.totalEffectiveTime} min</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="panel glass control-panel">
            <div className="panel-head">
              <div>
                <p className="tiny-label">CONTROL CONSOLE</p>
                <h3>Charging and reroute operations</h3>
              </div>
            </div>

            <div className="control-box">
              <label className="text-sm flex flex-col gap-2">
                Current battery
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={currentBattery} 
                  readOnly 
                  className="cursor-not-allowed opacity-50"
                />
              </label>

              <div className="control-row">
                <div className="mini-box">
                  <span className="tiny-label">Current %</span>
                  <strong>{currentBattery}%</strong>
                </div>
                <div className="mini-box">
                  <span className="tiny-label">Target %</span>
                  <strong>{targetBattery}%</strong>
                </div>
              </div>

              <div className="progress-wrap">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${isBooking ? 100 : currentBattery}%`, transition: 'width 2s ease-in-out' }} />
                </div>
                <span className="tiny-label mt-2 block">
                    {isBooking ? "Syncing Port..." : `Estimated session: ${bestStation?.chargeTime || 0}m`}
                </span>
              </div>

              <button 
                className={`glow-btn full ${isBooking ? 'opacity-50 animate-pulse' : ''}`}
                onClick={handleStartBooking}
                disabled={isBooking}
              >
                {isBooking ? "Booking..." : "Start Booking"}
              </button>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
