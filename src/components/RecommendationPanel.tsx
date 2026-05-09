"use client";

import React from "react";
import { RankedStation } from "@/lib/types";
import { Zap, Clock, Navigation, BatteryCharging } from "lucide-react";

interface Props {
  station: RankedStation;
  isBest: boolean;
  onReroute: () => void;
}

export default function RecommendationPanel({ station, isBest, onReroute }: Props) {
  return (
    <div className={`recommend-card border-2 transition-all duration-500 ${isBest ? 'border-green-500/30' : 'border-white/10'}`}>
      <div className="recommend-top mb-4">
        <div>
          <p className="tiny-label text-cyan-400">{isBest ? "RECOMMENDED OPTION" : "ALTERNATIVE ROUTE"}</p>
          <h4 className="text-2xl font-bold font-headline">{station.name}</h4>
          <p className="text-xs text-white/50">{station.city}, {station.state}</p>
        </div>
        <div className={`status px-3 py-1 rounded-full text-[10px] font-bold ${isBest ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-white/50'}`}>
          {isBest ? "OPTIMAL" : "STABLE"}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="mini-box bg-white/5 p-3 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Navigation className="w-3 h-3 text-cyan-400" />
            <span className="tiny-label">Drive</span>
          </div>
          <strong className="text-lg">{station.travelMinutes}m</strong>
        </div>
        <div className="mini-box bg-white/5 p-3 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span className="tiny-label">Queue</span>
          </div>
          <strong className="text-lg">{station.waitMinutes}m</strong>
        </div>
        <div className="mini-box bg-white/5 p-3 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <BatteryCharging className="w-3 h-3 text-green-400" />
            <span className="tiny-label">Charge</span>
          </div>
          <strong className="text-lg">{station.chargeMinutes}m</strong>
        </div>
        <div className="mini-box bg-white/5 p-3 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span className="tiny-label">Total</span>
          </div>
          <strong className="text-lg text-cyan-400">{station.totalEffectiveMinutes}m</strong>
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 mb-6">
        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] text-white/40 uppercase font-bold">Hardware Specs</p>
          <p className="text-sm font-bold">{station.chargerKW}kW DC Fast • {station.connectorType}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/40 uppercase font-bold">Operator</p>
          <p className="text-sm font-bold">{station.operator}</p>
        </div>
      </div>

      <button 
        onClick={onReroute}
        className="glow-btn full py-4 text-sm font-bold tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        Initiate Reroute Vector
      </button>
    </div>
  );
}
