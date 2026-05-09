"use client";

import React, { useMemo } from "react";
import { demoStations } from "@/lib/mock-data";
import { rankStationsByFastestOption, RankedStation } from "@/lib/charging";

function statusClass(status: RankedStation["status"]) {
  switch (status) {
    case "Free":
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
  // Config
  const currentBattery = 34;
  const targetBattery = 80;

  // Calculate ranked stations
  const rankedStations = useMemo(() => {
    return rankStationsByFastestOption(demoStations, currentBattery, targetBattery);
  }, [currentBattery, targetBattery]);

  const bestStation = rankedStations[0];

  return (
    <main className="page-shell">
      <div className="bg-particles" aria-hidden="true">
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
          <button className="nav-btn active">Dashboard</button>
          <button className="nav-btn">Map</button>
          <button className="nav-btn">Queue</button>
          <button className="nav-btn">Reroute</button>
          <button className="nav-btn">Admin</button>
        </nav>

        <div className="side-footer">
          <div className="tiny-label">Mode</div>
          <div className="mode-switch">
            <span className="mode active">Demo</span>
            <span className="mode">Real</span>
          </div>
        </div>
      </aside>

      <section className="content">
        <header className="hero glass">
          <div>
            <p className="eyebrow">EV CHARGING INTELLIGENCE SYSTEM</p>
            <h2>Fastest station. Lowest wait. Smart reroute.</h2>
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
          <div className="panel glass map-panel">
            <div className="panel-head">
              <div>
                <p className="tiny-label">LIVE MAP</p>
                <h3>Station availability and reroute view</h3>
              </div>
              <button className="glow-btn">Instant Switch</button>
            </div>

            <div className="map-fake">
              <div className="map-pin pin-1">A</div>
              <div className="map-pin pin-2">B</div>
              <div className="map-pin pin-3">C</div>
              <div className="map-route" />
              <div className="map-route route-2" />
              <div className="map-overlay">
                <div>
                  <span className="tiny-label">Recommended</span>
                  <strong>{bestStation?.name}</strong>
                </div>
                <div>
                  <span className="tiny-label">ETA Total</span>
                  <strong>{bestStation?.totalEffectiveTime} min</strong>
                </div>
              </div>
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
                    <h4>{bestStation.name} · Port 02</h4>
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

                <button className="glow-btn full">Reroute to this station</button>
              </div>
            )}

            <div className="terminal">
              <div className="terminal-title">SYSTEM LOG</div>
              <div className="log-line"><span>[OK]</span> Ranking engine initialized</div>
              <div className="log-line"><span>[AI]</span> {bestStation?.name} identified as optimal</div>
              <div className="log-line"><span>[ROUTE]</span> Travel time: {bestStation?.travelTime}m</div>
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
                <article key={station.id} className="station-card">
                  <div className="station-top">
                    <h4>{station.name}</h4>
                    <span className={statusClass(station.status)}>{station.status}</span>
                  </div>

                  <div className="station-meta">
                    <span>{station.distanceKm} km</span>
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
              <label>
                Current battery
                <input type="range" min="0" max="100" value={currentBattery} readOnly />
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
                  <div className="progress-fill" />
                </div>
                <span className="tiny-label">Predicting charging duration</span>
              </div>

              <button className="glow-btn full">Start Booking</button>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
