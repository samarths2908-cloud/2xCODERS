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
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pt-8 border-t border-white/10">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] font-headline">
              Optimal Target
            </p>
            {isBest && (
              <span className="bg-purple-500/20 text-purple-400 text-[9px] font-black px-2.5 py-1 rounded border border-purple-500/30 uppercase tracking-widest shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                Elite
              </span>
            )}
          </div>
          <h4 className="text-2xl font-black font-headline tracking-tighter leading-tight uppercase max-w-[240px] break-words">
            {station.name}
          </h4>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
            {station.city}, {station.state}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass p-4 rounded-2xl flex flex-col justify-between h-20 border-white/5">
          <div className="flex items-center gap-2 opacity-60">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[9px] font-black uppercase tracking-widest font-headline">Travel</span>
          </div>
          <strong className="text-xl font-headline font-black">{station.travelMinutes}<span className="text-[10px] ml-1 text-white/30">M</span></strong>
        </div>
        <div className="glass p-4 rounded-2xl flex flex-col justify-between h-20 border-white/5">
          <div className="flex items-center gap-2 opacity-60">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[9px] font-black uppercase tracking-widest font-headline">Wait</span>
          </div>
          <strong className="text-xl font-headline font-black text-amber-400">{station.waitMinutes}<span className="text-[10px] ml-1 opacity-30">M</span></strong>
        </div>
        <div className="glass p-4 rounded-2xl flex flex-col justify-between h-20 border-white/5">
          <div className="flex items-center gap-2 opacity-60">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-widest font-headline">Charge</span>
          </div>
          <strong className="text-xl font-headline font-black text-emerald-400">{station.chargeMinutes}<span className="text-[10px] ml-1 opacity-30">M</span></strong>
        </div>
        <div className="glass p-4 rounded-2xl border-cyan-500/40 bg-cyan-500/5 flex flex-col justify-between h-20 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[9px] font-black uppercase tracking-widest font-headline text-cyan-400">Total</span>
          </div>
          <strong className="text-xl font-headline font-black text-cyan-400">{station.totalEffectiveMinutes}<span className="text-[10px] ml-1 text-cyan-400/40">M</span></strong>
        </div>
      </div>

      <button 
        onClick={onReroute}
        className="glow-btn w-full py-5 text-[11px] font-headline uppercase font-black tracking-[0.4em] transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(6,182,212,0.4)]"
      >
        Initialize Port Sync
      </button>
    </div>
  );
}