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
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-3">
            {isBest ? "Optimal Node" : "Auxiliary Node"}
          </p>
          <h4 className="text-4xl font-black font-headline tracking-tighter leading-none">{station.name}</h4>
          <p className="text-sm text-white/30 font-medium mt-2">{station.city}, Sector {station.state}</p>
        </div>
        <div className={`px-5 py-2 rounded-full text-[10px] font-black tracking-[0.2em] border uppercase ${isBest ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/5 text-white/30 border-white/10'}`}>
          {isBest ? "Optimal" : "Stable"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex flex-col justify-between h-28">
          <div className="flex items-center gap-3 opacity-40">
            <Navigation className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Travel</span>
          </div>
          <strong className="text-3xl font-headline font-black">{station.travelMinutes}<span className="text-xs ml-1 opacity-40">MIN</span></strong>
        </div>
        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex flex-col justify-between h-28">
          <div className="flex items-center gap-3 opacity-40">
            <Clock className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Queue</span>
          </div>
          <strong className="text-3xl font-headline font-black text-amber-400">{station.waitMinutes}<span className="text-xs ml-1 opacity-40">MIN</span></strong>
        </div>
        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex flex-col justify-between h-28">
          <div className="flex items-center gap-3 opacity-40">
            <BatteryCharging className="w-3 h-3 text-green-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Charge</span>
          </div>
          <strong className="text-3xl font-headline font-black text-green-400">{station.chargeMinutes}<span className="text-xs ml-1 opacity-40">MIN</span></strong>
        </div>
        <div className="bg-cyan-500/10 p-6 rounded-[2rem] border border-cyan-500/20 flex flex-col justify-between h-28">
          <div className="flex items-center gap-3">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Total</span>
          </div>
          <strong className="text-3xl font-headline font-black text-cyan-400">{station.totalEffectiveMinutes}<span className="text-xs ml-1 opacity-40">MIN</span></strong>
        </div>
      </div>

      <div className="p-6 rounded-[2rem] bg-black/40 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-[1rem] bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
            <Zap className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Grid Interface</p>
            <p className="text-md font-black">{station.chargerKW}kW • {station.connectorType}</p>
          </div>
        </div>
      </div>

      <button 
        onClick={onReroute}
        className="glow-btn w-full py-6 text-[12px] font-black tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        Lock Vector & Reroute
      </button>
    </div>
  );
}
