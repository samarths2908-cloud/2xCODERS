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
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-2">
            {isBest ? "OPTIMAL TARGET" : "SELECTED ALTERNATIVE"}
          </p>
          <h4 className="text-3xl font-black font-headline tracking-tighter leading-tight">{station.name}</h4>
          <p className="text-xs text-white/40 font-medium">{station.city}, {station.state}</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border uppercase ${isBest ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/5 text-white/40 border-white/10'}`}>
          {isBest ? "ELITE" : "STABLE"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col justify-between h-24">
          <div className="flex items-center gap-2 opacity-50">
            <Navigation className="w-3 h-3 text-cyan-400" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Travel</span>
          </div>
          <strong className="text-2xl font-headline">{station.travelMinutes}<span className="text-[10px] ml-1">MIN</span></strong>
        </div>
        <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col justify-between h-24">
          <div className="flex items-center gap-2 opacity-50">
            <Clock className="w-3 h-3 text-amber-400" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Wait</span>
          </div>
          <strong className="text-2xl font-headline text-amber-400">{station.waitMinutes}<span className="text-[10px] ml-1">MIN</span></strong>
        </div>
        <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col justify-between h-24">
          <div className="flex items-center gap-2 opacity-50">
            <BatteryCharging className="w-3 h-3 text-green-400" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Charge</span>
          </div>
          <strong className="text-2xl font-headline text-green-400">{station.chargeMinutes}<span className="text-[10px] ml-1">MIN</span></strong>
        </div>
        <div className="bg-cyan-500/10 p-4 rounded-3xl border border-cyan-500/20 flex flex-col justify-between h-24">
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">Total</span>
          </div>
          <strong className="text-2xl font-headline text-cyan-400">{station.totalEffectiveMinutes}<span className="text-[10px] ml-1">MIN</span></strong>
        </div>
      </div>

      <div className="p-5 rounded-3xl bg-black/40 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-[9px] text-white/40 uppercase font-black">DC Fast Load</p>
            <p className="text-sm font-bold">{station.chargerKW}kW • {station.connectorType}</p>
          </div>
        </div>
      </div>

      <button 
        onClick={onReroute}
        className="glow-btn w-full py-5 text-sm font-black tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        Lock Vector & Reroute
      </button>
    </div>
  );
}
