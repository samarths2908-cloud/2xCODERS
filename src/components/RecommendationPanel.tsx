"use client";

import React from "react";
import type { RankedStation } from "@/lib/charging";

export default function RecommendationPanel({
  station,
  bestStation,
  onReroute,
}: {
  station: RankedStation;
  bestStation: RankedStation;
  onReroute: (station: RankedStation) => void;
}) {
  const isBest = station.id === bestStation.id;

  return (
    <div className="recommend-card">
      <div className="recommend-top">
        <div>
          <p className="tiny-label">Best match</p>
          <h4>{station.name}</h4>
        </div>
        <span className={`status ${isBest ? "free" : "busy"}`}>
          {isBest ? "Best Option" : "Alternative"}
        </span>
      </div>

      <div className="time-row">
        <div>
          <span className="tiny-label">Travel</span>
          <strong>{station.travelTime} min</strong>
        </div>
        <div>
          <span className="tiny-label">Wait</span>
          <strong>{station.waitTime} min</strong>
        </div>
        <div>
          <span className="tiny-label">Charge</span>
          <strong>{station.chargeTime} min</strong>
        </div>
        <div>
          <span className="tiny-label">Total</span>
          <strong>{station.totalEffectiveTime} min</strong>
        </div>
      </div>

      <button className="glow-btn full" onClick={() => onReroute(station)}>
        Reroute to this station
      </button>
    </div>
  );
}