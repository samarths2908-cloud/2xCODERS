
"use client";

import React from "react";
import type { RankedStation } from "@/lib/charging";
import { Activity, Radio, Target, Zap } from "lucide-react";

type Props = {
  stations: RankedStation[];
  bestStationId: string | null;
  selectedStationId: string | null;
  mode: "demo" | "real";
};

export default function MapView({
  stations,
  bestStationId,
  selectedStationId,
  mode,
}: Props) {
  const bestStation = stations.find((s) => s.id === bestStationId);
  const selectedStation = stations.find((s) => s.id === selectedStationId);

  return (
    <div className="map-fake glass relative overflow-hidden group">
      {/* Neural Grid Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="h-full w-full bg-[linear-gradient(rgba(73,217,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(73,217,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      </div>

      {/* Pulsing Radar Ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-cyan-500/10 rounded-full animate-ping opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-cyan-500/20 rounded-full animate-pulse opacity-30" />

      {/* Animated Route Vectors */}
      {bestStation && (
        <div className="map-route" />
      )}
      <div className="map-route route-2" />

      {/* Simulated HUD Pins */}
      {stations.map((station, index) => {
        const isBest = station.id === bestStationId;
        const isSelected = station.id === selectedStationId;
        
        // Deterministic decorative positions based on station ID
        const top = 20 + (parseInt(station.id.length.toString()) * index * 7) % 60;
        const left = 15 + (parseInt(station.id.length.toString()) * index * 9) % 70;

        return (
          <div
            key={station.id}
            className={`map-pin flex flex-col items-center justify-center transition-all duration-500 ${
              isBest ? "bg-green-500/20 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.4)]" : 
              isSelected ? "bg-purple-500/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.4)]" : 
              "bg-cyan-500/10 border-cyan-500/20"
            }`}
            style={{ 
              top: `${top}%`, 
              left: `${left}%`,
              animationDelay: `${index * 0.2}s`
            }}
          >
            <Zap className={`w-5 h-5 ${isBest ? "text-green-400" : isSelected ? "text-purple-400" : "text-cyan-400"}`} />
            <div className="absolute -bottom-8 whitespace-nowrap">
              <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded border ${
                isBest ? "bg-green-500/20 border-green-500/40 text-green-300" : 
                isSelected ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : 
                "bg-black/40 border-white/10 text-white/40"
              }`}>
                {station.name}
              </span>
            </div>
          </div>
        );
      })}

      {/* HUD System Overlay */}
      <div className="absolute inset-x-6 bottom-6 flex justify-between items-end pointer-events-none">
        <div className="glass p-4 rounded-2xl border-white/5 bg-black/40 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/60">Neural Network Active</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="w-3 h-3 text-green-400" />
              <p className="text-xs font-bold text-white tracking-tight">Optimal Target: {bestStation?.name || "Searching..."}</p>
            </div>
            <div className="flex items-center gap-2 opacity-60">
              <Activity className="w-3 h-3 text-purple-400" />
              <p className="text-[10px] font-medium text-white/60 uppercase">Mode: {mode} Uplink Status 100%</p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="glass p-3 rounded-2xl border-white/5 bg-black/40 mb-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">System Latency</p>
            <p className="text-sm font-bold text-green-400 font-mono">14ms</p>
          </div>
          <div className="glass p-3 rounded-2xl border-white/5 bg-black/40">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Est. Arrival</p>
            <p className="text-xl font-black text-white tracking-tighter">
              {bestStation?.travelTime || "--"} <span className="text-[10px] text-cyan-400 font-bold ml-1 uppercase">Min</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
