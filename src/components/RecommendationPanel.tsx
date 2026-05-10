
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
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-2 font-headline">
            {isBest ? "Optimal Node Detected" : "Alternative Node Syncing"}
          </p>
          <h4 className="text-3xl font-black font-headline tracking-tighter leading-none">{station.name}</h4>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-3">{station.city} • Sector {station.state}</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[8px] font-black tracking-[0.2em] border uppercase font-headline ${isBest ? 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'bg-white/5 text-white/30 border-white/10'}`}>
          {isBest ? "Priority" : "Available"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass p-5 rounded-2xl flex flex-col justify-between h-24">
          <div className="flex items-center gap-2 opacity-40">
            <Navigation className="w-3 h-3 text-cyan-400" />
            <span className="text-[8px] font-black uppercase tracking-widest font-headline">Travel</span>
          </div>
          <strong className="text-2xl font-headline font-black">{station.travelMinutes}<span className="text-[10px] ml-1 text-white/20">M</span></strong>
        </div>
        <div className="glass p-5 rounded-2xl flex flex-col justify-between h-24">
          <div className="flex items-center gap-2 opacity-40">
            <Clock className="w-3 h-3 text-amber-400" />
            <span className="text-[8px] font-black uppercase tracking-widest font-headline">Wait</span>
          </div>
          <strong className="text-2xl font-headline font-black text-amber-400">{station.waitMinutes}<span className="text-[10px] ml-1 opacity-20">M</span></strong>
        </div>
        <div className="glass p-5 rounded-2xl flex flex-col justify-between h-24">
          <div className="flex items-center gap-2 opacity-40">
            <BatteryCharging className="w-3 h-3 text-green-400" />
            <span className="text-[8px] font-black uppercase tracking-widest font-headline">Charge</span>
          </div>
          <strong className="text-2xl font-headline font-black text-green-400">{station.chargeMinutes}<span className="text-[10px] ml-1 opacity-20">M</span></strong>
        </div>
        <div className="glass p-5 rounded-2xl border-cyan-500/30 bg-cyan-500/5 flex flex-col justify-between h-24 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span className="text-[8px] font-black uppercase tracking-widest font-headline text-cyan-400">Total Delta</span>
          </div>
          <strong className="text-2xl font-headline font-black text-cyan-400">{station.totalEffectiveMinutes}<span className="text-[10px] ml-1 text-cyan-400/30">M</span></strong>
        </div>
      </div>

      <div className="glass p-5 rounded-2xl flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
          <Zap className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <p className="text-[8px] text-white/30 uppercase font-black tracking-widest font-headline">Hardware Specs</p>
          <p className="text-xs font-black font-headline tracking-tighter uppercase">{station.chargerKW}kW • {station.connectorType}</p>
        </div>
      </div>

      <button 
        onClick={onReroute}
        className="glow-btn w-full py-5 text-[10px] font-headline uppercase font-black tracking-[0.4em] transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        Lock Vector & Ignite
      </button>
    </div>
  );
}
