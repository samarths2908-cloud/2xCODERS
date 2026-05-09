"use client";

import React from "react";
import type { RankedStation } from "@/lib/charging";

export default function MapView({
  stations,
  bestStationId,
  selectedStationId,
  mode,
}: {
  stations: RankedStation[];
  bestStationId: string | null;
  selectedStationId: string | null;
  mode: "demo" | "real";
}) {
  const topStations = stations.slice(0, 4);

  return (
    <div className="map-fake">
      <div className="map-grid" aria-hidden="true" />
      <div className="map-radar" aria-hidden="true" />

      {topStations.map((station, index) => {
        const left = `${18 + index * 18}%`;
        const top = `${22 + (index % 2) * 22}%`;
        const isBest = station.id === bestStationId;
        const isSelected = station.id === selectedStationId;

        return (
          <div
            key={station.id}
            className={`map-pin pin-${index + 1} ${isBest ? "best" : ""} ${
              isSelected ? "selected" : ""
            }`}
            style={{ left, top }}
            title={station.name}
          >
            <span>{station.name.replace("Station ", "").slice(0, 2)}</span>
          </div>
        );
      })}

      <div className="map-route" />
      <div className="map-route route-2" />

      <div className="map-overlay">
        <div>
          <span className="tiny-label">Mode</span>
          <strong>{mode === "demo" ? "Demo" : "Real"}</strong>
        </div>
        <div>
          <span className="tiny-label">Best</span>
          <strong>{stations[0]?.name ?? "—"}</strong>
        </div>
        <div>
          <span className="tiny-label">ETA</span>
          <strong>{stations[0]?.totalEffectiveTime ?? "—"} min</strong>
        </div>
      </div>
    </div>
  );
}