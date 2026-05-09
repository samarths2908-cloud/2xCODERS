
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { demoStations } from "@/lib/mock-data";
import { rankStationsByFastestOption, RankedStation } from "@/lib/charging";
import { MapView } from "@/components/MapView";
import { RecommendationPanel } from "@/components/RecommendationPanel";
import { fetchNearbyStations } from "@/lib/api";

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
  // State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isRealMode, setIsRealMode] = useState(false);
  const [stations, setStations] = useState(demoStations);
  const [selectedStation, setSelectedStation] = useState<RankedStation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Config
  const currentBattery = 34;
  const targetBattery = 80;
  const userLocation = { latitude: 34.0522, longitude: -118.2437 }; // Mock user location (LA)

  // Real Mode Data Fetching
  useEffect(() => {
    if (isRealMode) {
      setIsLoading(true);
      fetchNearbyStations(userLocation.latitude, userLocation.longitude)
        .then((data) => {
          // Map API data to our Station type
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

  // Calculate ranked stations
  const rankedStations = useMemo(() => {
    return rankStationsByFastestOption(stations, currentBattery, targetBattery);
  }, [stations, currentBattery, targetBattery]);

  const bestStation = rankedStations[0];

  // Sync selected station if not set or if best changes
  useEffect(() => {
    if (!selectedStation && bestStation) {
      setSelectedStation(bestStation);
    }
  }, [bestStation, selectedStation]);

  const handleReroute = () => {
    if (bestStation) {
      setSelectedStation(bestStation);
      setActiveTab("map");
      // Could add a toast notification here
    }
  };

  return (
    <main className="page-shell">
      <div className="bg-particles" aria-hidden="true" style={{ pointerEvents: 'none' }}>
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="bg-orb orb-1" aria-hidden="true" style={{ pointerEvents: 'none' }} />
      <div className="bg-orb orb-2" aria-hidden="true" style={{ pointerEvents: 'none' }} />
      <div className="bg-grid" aria-hidden="true" style={{ pointerEvents: 'none' }} />

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
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-btn ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            Map
          </button>
          <button 
            className={`nav-btn ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            Queue
          </button>
          <button 
            className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
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
        <header className="hero glass">
          <div>
            <p className="eyebrow">EV CHARGING INTELLIGENCE SYSTEM</p>
            <h2>{isLoading ? "Fetching Live Data..." : "Fastest station. Lowest wait."}</h2>
            <p className="hero-sub">
              Compare travel time, queue time, and charging time in real time to guide every vehicle to the best available charger.
            </p>
          </div>

          <div className="hero-stats">
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
          <div className={`panel glass map-panel ${activeTab === 'map' ? 'ring-2 ring-primary/50' : ''}`}>
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

          <div className="panel glass recommendation-panel">
            <div className="panel-head">
              <div>
                <p className="tiny-label">SMART RECOMMENDATION</p>
                <h3>Fastest effective charging option</h3>
              </div>
            </div>

            {bestStation && (
              <div className="recommend-card">
                <div className="recommend-top">
                  <div>
                    <p className="tiny-label">Best match</p>
                    <h4>{bestStation.name}</h4>
                  </div>
                  <span className={statusClass(bestStation.status)}>
                    {bestStation.status === 'Free' ? 'Free Now' : bestStation.status}
                  </span>
                </div>

                <div className="time-row">
                  <div>
                    <span className="tiny-label">Travel</span>
                    <strong>{bestStation.travelTime} min</strong>
                  </div>
                  <div>
                    <span className="tiny-label">Wait</span>
                    <strong>{bestStation.waitTime} min</strong>
                  </div>
                  <div>
                    <span className="tiny-label">Charge</span>
                    <strong>{bestStation.chargeTime} min</strong>
                  </div>
                  <div>
                    <span className="tiny-label">Total</span>
                    <strong>{bestStation.totalEffectiveTime} min</strong>
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
              <div className="log-line"><span>[OK]</span> Ranking engine initialized</div>
              <div className="log-line"><span>[MODE]</span> Switched to {isRealMode ? 'Real-Time' : 'Demo'} mode</div>
              <div className="log-line"><span>[AI]</span> {bestStation?.name} identified as optimal</div>
              <div className="log-line"><span>[LIVE]</span> Queues refreshed in real time</div>
            </div>
          </div>

          <div className="panel glass station-panel">
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
                  <div className="progress-fill" style={{ width: `${currentBattery}%` }} />
                </div>
                <span className="tiny-label mt-2 block">Estimated session: {bestStation?.chargeTime || 0}m</span>
              </div>

              <button className="glow-btn full">Start Booking</button>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
