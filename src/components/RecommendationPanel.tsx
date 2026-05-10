
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
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pt-6 border-t border-white/5">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] font-headline">
              Optimal Target
            </p>
            {isBest && (
              <span className="bg-purple-500/20 text-purple-400 text-[8px] font-black px-2 py-0.5 rounded border border-purple-500/30 uppercase tracking-widest">
                Elite
              </span>
            )}
          </div>
          <h4 className="text-xl font-black font-headline tracking-tighter leading-tight uppercase max-w-[200px] break-words">
            {station.name}
          </h4>
          <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">
            {station.city}, {station.state}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass p-3 rounded-2xl flex flex-col justify-between h-16">
          <div className="flex items-center gap-2 opacity-40">
            <Navigation className="w-3 h-3 text-cyan-400" />
            <span className="text-[8px] font-black uppercase tracking-widest font-headline">Travel</span>
          </div>
          <strong className="text-lg font-headline font-black">{station.travelMinutes}<span className="text-[9px] ml-1 text-white/20">M</span></strong>
        </div>
        <div className="glass p-3 rounded-2xl flex flex-col justify-between h-16">
          <div className="flex items-center gap-2 opacity-40">
            <Clock className="w-3 h-3 text-amber-400" />
            <span className="text-[8px] font-black uppercase tracking-widest font-headline">Wait</span>
          </div>
          <strong className="text-lg font-headline font-black text-amber-400">{station.waitMinutes}<span className="text-[9px] ml-1 opacity-20">M</span></strong>
        </div>
        <div className="glass p-3 rounded-2xl flex flex-col justify-between h-16">
          <div className="flex items-center gap-2 opacity-40">
            <BatteryCharging className="w-3 h-3 text-green-400" />
            <span className="text-[8px] font-black uppercase tracking-widest font-headline">Charge</span>
          </div>
          <strong className="text-lg font-headline font-black text-green-400">{station.chargeMinutes}<span className="text-[9px] ml-1 opacity-20">M</span></strong>
        </div>
        <div className="glass p-3 rounded-2xl border-cyan-500/30 bg-cyan-500/5 flex flex-col justify-between h-16 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span className="text-[8px] font-black uppercase tracking-widest font-headline text-cyan-400">Delta</span>
          </div>
          <strong className="text-lg font-headline font-black text-cyan-400">{station.totalEffectiveMinutes}<span className="text-[9px] ml-1 text-cyan-400/30">M</span></strong>
        </div>
      </div>

      <button 
        onClick={onReroute}
        className="glow-btn w-full py-4 text-[9px] font-headline uppercase font-black tracking-[0.4em] transition-all hover:scale-[1.02]"
      >
        Initialize Port Sync
      </button>
    </div>
  );
}
