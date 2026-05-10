
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_STATIONS } from '@/lib/mock-data';
import { Activity, Users, Zap, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const chartData = [
  { time: '08:00', load: 30 },
  { time: '10:00', load: 45 },
  { time: '12:00', load: 85 },
  { time: '14:00', load: 65 },
  { time: '16:00', load: 90 },
  { time: '18:00', load: 75 },
  { time: '20:00', load: 40 },
];

export default function AdminDashboard() {
  const [stationRevenues, setStationRevenues] = useState<Record<string, string>>({});

  useEffect(() => {
    const revenues: Record<string, string> = {};
    MOCK_STATIONS.slice(0, 10).forEach(st => {
      revenues[st.id] = (Math.random() * 5000 + 2000).toFixed(0);
    });
    setStationRevenues(revenues);
  }, []);

  return (
    <div className="page-shell">
      <div className="scanline" />
      <div className="max-w-7xl mx-auto w-full space-y-8 p-4">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black font-headline tracking-tighter uppercase">Operator <span className="text-cyan-400">Terminal</span></h1>
            <p className="text-white/40 mt-2 font-bold uppercase tracking-widest text-[10px]">Neural Grid Maintenance & Sector Revenue Systems</p>
          </div>
          <div className="glass px-6 py-2 rounded-full border-cyan-500/30 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,1)]" />
             <span className="text-[10px] font-black font-headline uppercase tracking-widest text-emerald-400">Core Stable</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass p-6 rounded-[2rem] flex items-center justify-between">
            <div>
              <p className="text-[9px] text-white/40 uppercase font-black tracking-widest font-headline">Active Pilots</p>
              <h3 className="text-3xl font-headline font-black mt-1">1,284</h3>
            </div>
            <div className="bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          
          <div className="glass p-6 rounded-[2rem] flex items-center justify-between">
            <div>
              <p className="text-[9px] text-white/40 uppercase font-black tracking-widest font-headline">Grid Load</p>
              <h3 className="text-3xl font-headline font-black mt-1">78.2%</h3>
            </div>
            <div className="bg-violet-500/10 p-3 rounded-xl border border-violet-500/20">
              <Zap className="w-6 h-6 text-violet-400" />
            </div>
          </div>

          <div className="glass p-6 rounded-[2rem] md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] text-white/40 uppercase font-black tracking-widest font-headline">Sector Performance Forecast</p>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="h-12 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="load" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorLoad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <h3 className="text-sm font-black font-headline uppercase tracking-[0.3em]">Sector Hub Operations</h3>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.03] text-[9px] font-black text-white/30 border-b border-white/5 uppercase tracking-widest">
                    <th className="px-8 py-5">Node Identity</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Grid Capacity</th>
                    <th className="px-8 py-5">Avg Sync</th>
                    <th className="px-8 py-5">Revenue (CR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {MOCK_STATIONS.slice(0, 8).map((st) => (
                    <tr key={st.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-5 font-black font-headline text-xs group-hover:text-cyan-400 transition-colors">{st.name}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${st.status === 'Free' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                          {st.status === 'Free' ? 'Standby' : 'Engaged'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black font-headline">{Math.round((st.availablePorts/st.totalPorts)*100)}%</span>
                          <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-cyan-500" 
                              style={{ width: `${(st.availablePorts/st.totalPorts)*100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-headline font-black text-xs text-white/60">{st.avgSessionMinutes}m</td>
                      <td className="px-8 py-5 font-black font-headline text-xs text-cyan-400">${stationRevenues[st.id] || '...'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass rounded-[2.5rem] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <h3 className="text-sm font-black font-headline uppercase tracking-[0.3em]">Grid Events</h3>
              <Activity className="w-4 h-4 text-violet-400" />
            </div>
            <div className="p-8 space-y-6 overflow-y-auto max-h-[500px]">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl glass border-white/5">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1 shrink-0 shadow-[0_0_8px_rgba(6,182,212,1)]" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black font-headline uppercase">Neural Link Sync</p>
                    <p className="text-[10px] text-white/40 leading-relaxed font-bold">Vector-P{i} initialized sector bypass for heavy load optimization.</p>
                    <span className="text-[8px] text-white/20 font-black uppercase block pt-1">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
