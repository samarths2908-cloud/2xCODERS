// src/app/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { demoStations } from "@/lib/mock-data";
import {
  rankStationsByFastestOption,
  type RankedStation,
  type Station,
} from "@/lib/charging";
import { loadRealStations } from "@/lib/api";
import MapView from "@/components/MapView";
import RecommendationPanel from "@/components/RecommendationPanel";

type Mode = "demo" | "real";
type Tab = "dashboard" | "map" | "queue" | "reroute" | "admin";

const CURRENT_BATTERY = 34;
const TARGET_BATTERY = 80;

export default function Page() {
  const [mode, setMode] = useState<Mode>("demo");
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [stations, setStations] = useState<Station[]>(demoStations);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [demoTick, setDemoTick] = useState(0);

  const dashboardRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const queueRef = useRef<HTMLDivElement | null>(null);
  const rerouteRef = useRef<HTMLDivElement | null>(null);
  const adminRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mode !== "demo") return;

    const interval = setInterval(() => {
      setDemoTick((tick) => tick + 1);
    }, 2400);

    return () => clearInterval(interval);
  }, [mode]);

  useEffect(() => {
    let cancelled = false;

    async function loadStations() {
      if (mode === "demo") {
        const animated: Station[] = demoStations.map((station, index) => {
          const bump = (demoTick + index) % 3 === 0 ? 1 : 0;

          const status: Station["status"] =
            (demoTick + index) % 4 === 0
              ? "Free"
              : (demoTick + index) % 4 === 1
                ? "Busy"
                : (demoTick + index) % 4 === 2
                  ? "Charging"
                  : "Delayed";

          return {
            ...station,
            queueLength: Math.max(0, station.queueLength + bump),
            availablePorts: Math.max(0, station.availablePorts - bump),
            status,
          };
        });

        if (!cancelled) {
          setStations(animated);
        }
        return;
      }

      try {
        const realStations = await loadRealStations(12.9716, 77.5946);
        if (!cancelled && realStations.length > 0) {
          setStations(realStations);
        }
      } catch {
        if (!cancelled) {
          setStations(demoStations);
        }
      }
    }

    loadStations();

    return () => {
      cancelled = true;
    };
  }, [mode, demoTick]);

  const rankedStations: RankedStation[] = useMemo(() => {
    return rankStationsByFastestOption(stations, CURRENT_BATTERY, TARGET_BATTERY);
  }, [stations]);

  const bestStation = rankedStations[0] ?? null;

  const selectedStation =
    rankedStations.find((station) => station.id === selectedStationId) ??
    bestStation ??
    null;

  const scrollToSection = (
    ref: React.RefObject<HTMLDivElement | null>,
    tab: Tab
  ) => {
    setActiveTab(tab);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleReroute = (station: RankedStation) => {
    setSelectedStationId(station.id);
    setActiveTab("reroute");
    rerouteRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleStartBooking = () => {
    if (!bestStation) return;
    setSelectedStationId(bestStation.id);
    setActiveTab("reroute");
    rerouteRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="page-shell">
      <div className="bg-particles" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>

      <div className="bg-orb orb-1" aria-hidden="true" />
      <div className="bg-orb orb-2" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />

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
            className={`nav-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => scrollToSection(dashboardRef, "dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`nav-btn ${activeTab === "map" ? "active" : ""}`}
            onClick={() => scrollToSection(mapRef, "map")}
          >
            Map
          </button>
          <button
            className={`nav-btn ${activeTab === "queue" ? "active" : ""}`}
            onClick={() => scrollToSection(queueRef, "queue")}
          >
            Queue
          </button>
          <button
            className={`nav-btn ${activeTab === "reroute" ? "active" : ""}`}
            onClick={() => scrollToSection(rerouteRef, "reroute")}
          >
            Reroute
          </button>
          <button
            className={`nav-btn ${activeTab === "admin" ? "active" : ""}`}
            onClick={() => scrollToSection(adminRef, "admin")}
          >
            Admin
          </button>
        </nav>

        <div className="side-footer">
          <div className="tiny-label">Mode</div>
          <div className="mode-switch">
            <button
              className={`mode ${mode === "demo" ? "active" : ""}`}
              onClick={() => setMode("demo")}
            >
              Demo
            </button>
            <button
              className={`mode ${mode === "real" ? "active" : ""}`}
              onClick={() => setMode("real")}
            >
              Real
            </button>
          </div>
        </div>
      </aside>

      <section className="content">
        <header className="hero glass" ref={dashboardRef}>
          <div>
            <p className="eyebrow">EV CHARGING INTELLIGENCE SYSTEM</p>
            <h2>Fastest station. Lowest wait. Smart reroute.</h2>
            <p className="hero-sub">
              Compare travel time, queue time, and charging time in real time
              to guide every vehicle to the best available charger.
            </p>
          </div>

          <div className="hero-stats">
            <div className="stat-card">
              <span className="tiny-label">Best station</span>
              <strong>{bestStation?.name ?? "No station"}</strong>
              <small>
                {bestStation ? `${bestStation.totalEffectiveTime} min total` : "-"}
              </small>
            </div>

            <div className="stat-card">
              <span className="tiny-label">Current queue</span>
              <strong>
                {rankedStations.reduce((sum, station) => sum + station.queueLength, 0)}{" "}
                Vehicles
              </strong>
              <small>{mode === "demo" ? "Demo live" : "Real live"}</small>
            </div>

            <div className="stat-card">
              <span className="tiny-label">Free ports</span>
              <strong>
                {rankedStations.reduce((sum, station) => sum + station.availablePorts, 0)}{" "}
                Ports
              </strong>
              <small>{mode === "demo" ? "Demo mode" : "Real mode"}</small>
            </div>
          </div>
        </header>

        <section className="grid-layout">
          <div className="panel glass map-panel" ref={mapRef}>
            <div className="panel-head">
              <div>
                <p className="tiny-label">LIVE MAP</p>
                <h3>Station availability and reroute view</h3>
              </div>
              <button
                className="glow-btn"
                onClick={() => scrollToSection(rerouteRef, "reroute")}
              >
                Instant Switch
              </button>
            </div>

            <MapView
              stations={rankedStations}
              bestStationId={bestStation?.id ?? null}
              selectedStationId={selectedStation?.id ?? null}
              mode={mode}
            />
          </div>

          <div className="panel glass recommendation-panel" ref={rerouteRef}>
            <div className="panel-head">
              <div>
                <p className="tiny-label">SMART RECOMMENDATION</p>
                <h3>Fastest effective charging option</h3>
              </div>
            </div>

            {selectedStation && bestStation && (
              <RecommendationPanel
                station={selectedStation}
                bestStation={bestStation}
                onReroute={handleReroute}
              />
            )}

            <div className="terminal">
              <div className="terminal-title">SYSTEM LOG</div>
              <div className="log-line">
                <span>[OK]</span> Ranking engine initialized
              </div>
              <div className="log-line">
                <span>[MODE]</span> Switched to {mode} mode
              </div>
              <div className="log-line">
                <span>[AI]</span> {bestStation?.name ?? "No station"} identified as optimal
              </div>
              <div className="log-line">
                <span>[LIVE]</span> Queues refreshed in real time
              </div>
            </div>

            <button className="glow-btn full" onClick={handleStartBooking}>
              Start Booking
            </button>
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
                <article key={station.id} className="station-card">
                  <div className="station-top">
                    <h4>{station.name}</h4>
                    <span className={`status ${station.status.toLowerCase()}`}>
                      {station.status}
                    </span>
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

                  <button className="glow-btn full" onClick={() => handleReroute(station)}>
                    Reroute to this station
                  </button>
                </article>
              ))}
            </div>
          </div>

          <div className="panel glass control-panel" ref={adminRef}>
            <div className="panel-head">
              <div>
                <p className="tiny-label">CONTROL CONSOLE</p>
                <h3>Charging and reroute operations</h3>
              </div>
            </div>

            <div className="control-box">
              <label>
                Current battery
                <input type="range" min="0" max="100" defaultValue={CURRENT_BATTERY} />
              </label>

              <div className="control-row">
                <div className="mini-box">
                  <span className="tiny-label">Current %</span>
                  <strong>{CURRENT_BATTERY}%</strong>
                </div>
                <div className="mini-box">
                  <span className="tiny-label">Target %</span>
                  <strong>{TARGET_BATTERY}%</strong>
                </div>
              </div>

              <div className="progress-wrap">
                <div className="progress-bar">
                  <div className="progress-fill" />
                </div>
                <span className="tiny-label">
                  Estimated session: {bestStation?.chargeTime ?? 0} min
                </span>
              </div>

              <button className="glow-btn full" onClick={handleStartBooking}>
                Start Booking
              </button>
            </div>
          </div>
        </section>

        <section ref={queueRef} className="panel glass" style={{ marginTop: 20 }}>
          <div className="panel-head">
            <div>
              <p className="tiny-label">QUEUE VIEW</p>
              <h3>Live waiting list</h3>
            </div>
          </div>

          <p className="hero-sub">
            {mode === "demo"
              ? "Demo queue is active and changes automatically."
              : "Real queue mode is active and will refresh from live station data."}
          </p>
        </section>
      </section>
    </main>
  );
}