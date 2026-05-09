"use client";

import React from "react";
import type { RankedStation } from "@/lib/charging";
import { Navigation, Zap, Activity, Info } from "lucide-react";

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
  // Use first 4 stations for the visual grid
  const topStations = stations.slice(0, 4);

  // Hardcoded coordinates for the HUD visualization
  const points = [
    { left: "22%", top: "35%", label: "Alpha Sector" },
    { left: "45%", top: "22%", label: "Central Hub" },
    { left: "68%", top: "55%", label: "Delta Ridge" },
    { left: "82%", top: "28%", label: "Neo Core" },
  ];

  const bestStation = stations.find((s) => s.id === bestStationId);

  return (
    <div
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#020408] min-h-[500px] w-full group"
      style={{
        boxShadow: "inset 0 0 60px rgba(0,255,255,0.03), 0 20px 50px rgba(0,0,0,0.5)",
      }}
    >
      {/* City Grid Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,242,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,242,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(circle at 50% 50%, black, transparent 90%)",
        }}
      />

      {/* Atmospheric Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px]" />
      </div>

      {/* HUD Header Labels */}
      <div className="absolute inset-x-8 top-8 flex items-start justify-between z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">
            <Activity className="w-3 h-3" />
            <span>Neural Navigation Feed</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tighter text-white/90">
            Sector <span className="text-cyan-400">07-B</span> Traffic Scan
          </h3>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-[10px] font-bold text-cyan-300 backdrop-blur-md uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,255,0.1)]">
            {mode === "demo" ? "Simulation Active" : "Real-Time Uplink"}
          </div>
          <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest">
            Sync Rate: 98.4%
          </div>
        </div>
      </div>

      {/* SVG Map Layer */}
      <div className="absolute inset-0">
        <svg className="h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(34, 197, 94, 0)" />
              <stop offset="50%" stopColor="rgba(34, 197, 94, 0.6)" />
              <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
            </linearGradient>
            <filter id="neonBlur">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Decorative Paths */}
          <path
            d="M 0 400 Q 250 350 500 450 T 1000 400"
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="1"
          />
          <path
            d="M 0 100 Q 300 150 600 50 T 1000 150"
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="1"
          />

          {/* Active Recommended Route */}
          <path
            d="M 220 175 C 350 175, 450 110, 450 110"
            fill="none"
            stroke="url(#glowGradient)"
            strokeWidth="4"
            strokeDasharray="20 10"
            filter="url(#neonBlur)"
            className="animate-[dash_3s_linear_infinite]"
            style={{ opacity: selectedStationId === stations[0]?.id ? 1 : 0.3 }}
          />
        </svg>

        {/* Station Nodes */}
        {points.map((p, index) => {
          const station = topStations[index];
          if (!station) return null;

          const isBest = station.id === bestStationId;
          const isSelected = station.id === selectedStationId;

          return (
            <div
              key={station.id}
              className="absolute group/node"
              style={{
                left: p.left,
                top: p.top,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Node Core */}
              <div className="relative flex flex-col items-center">
                {/* Ping rings */}
                {(isBest || isSelected) && (
                  <div className={`absolute -inset-4 rounded-full animate-ping opacity-20 ${isBest ? "bg-green-500" : "bg-cyan-500"}`} />
                )}
                
                <div
                  className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all duration-500 cursor-pointer ${
                    isBest
                      ? "border-green-500 bg-green-500/10 text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                      : isSelected
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.3)] scale-110"
                      : "border-white/10 bg-white/5 text-white/40 hover:border-white/30 hover:text-white/80"
                  }`}
                >
                  <Zap className={`w-6 h-6 ${isBest || isSelected ? "animate-pulse" : ""}`} />
                  
                  {/* Status Indicator */}
                  <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${station.status === 'Free' ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>

                {/* Node Label Card */}
                <div className="mt-4 flex flex-col items-center">
                  <div className="px-3 py-1.5 rounded-lg border border-white/5 bg-black/80 backdrop-blur-xl shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/90 whitespace-nowrap">
                      {station.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[8px] font-bold ${isBest ? 'text-green-400' : 'text-cyan-400'}`}>
                        {station.totalEffectiveTime}m ETA
                      </span>
                      <span className="text-[8px] text-white/30">•</span>
                      <span className="text-[8px] text-white/40">
                        {station.availablePorts} Ports
                      </span>
                    </div>
                  </div>
                  <div className="w-[1px] h-4 bg-gradient-to-b from-white/10 to-transparent" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Glass HUD Panel */}
      <div className="absolute inset-x-6 bottom-6 z-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl shadow-2xl overflow-hidden relative">
          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/[0.02] to-transparent h-[200%] animate-[scan_8s_linear_infinite]" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* System Status */}
            <div className="flex items-center gap-4 border-r border-white/5 pr-6">
              <div className="p-3 rounded-2xl bg-white/5 text-cyan-400">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">System Mode</p>
                <p className="text-sm font-bold text-white capitalize">{mode} Integration</p>
              </div>
            </div>

            {/* Optimal Target */}
            <div className="flex items-center gap-4 border-r border-white/5 pr-6">
              <div className={`p-3 rounded-2xl bg-white/5 ${bestStation ? 'text-green-400' : 'text-white/20'}`}>
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Best Station</p>
                <p className="text-sm font-bold text-white">{bestStation?.name || "Initializing..."}</p>
              </div>
            </div>

            {/* Time Metrics */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-white/5 text-purple-400">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Total Effective Time</p>
                <p className="text-xl font-black text-white tracking-tighter">
                  {bestStation?.totalEffectiveTime || "--"} <span className="text-[10px] text-cyan-400 font-bold ml-1">MIN</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -30;
          }
        }
        @keyframes scan {
          from { transform: translateY(-50%); }
          to { transform: translateY(50%); }
        }
      `}</style>
    </div>
  );
}
