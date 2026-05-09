"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_STATIONS } from '@/lib/mock-data';
import { Activity, Users, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

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
  return (
    <div className="min-h-screen bg-background p-8 font-body">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black font-headline tracking-tighter">OPERATOR <span className="text-primary">DASHBOARD</span></h1>
            <p className="text-muted-foreground mt-2">Real-time network load and port monitoring system.</p>
          </div>
          <Badge className="bg-primary text-white px-4 py-1.5 rounded-full text-sm">System Healthy</Badge>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white shadow-sm border-none">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Active Users</p>
                  <h3 className="text-3xl font-headline font-bold mt-1">1,284</h3>
                </div>
                <div className="bg-primary/10 p-3 rounded-xl">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-green-500 font-bold">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+12.5% from last hour</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border-none">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Port Utilization</p>
                  <h3 className="text-3xl font-headline font-bold mt-1">78.2%</h3>
                </div>
                <div className="bg-accent/10 p-3 rounded-xl">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-amber-500 font-bold">
                <AlertTriangle className="w-3 h-3 mr-1" />
                <span>High load at 2 stations</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-none md:col-span-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-muted-foreground uppercase font-bold">Network Load Prediction</p>
                <div className="flex space-x-2">
                  <Badge variant="outline" className="text-[10px]">Today</Badge>
                  <Badge variant="outline" className="text-[10px]">Tomorrow</Badge>
                </div>
              </div>
              <div className="h-16 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="load" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorLoad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-white shadow-sm border-none overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/20">
              <CardTitle className="text-lg font-headline">Station Health & Queues</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted/50 text-xs font-bold text-muted-foreground border-b border-border uppercase">
                      <th className="px-6 py-4">Station Name</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Occupancy</th>
                      <th className="px-6 py-4">Avg Wait</th>
                      <th className="px-6 py-4">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {MOCK_STATIONS.map((st) => (
                      <tr key={st.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-bold">{st.name}</td>
                        <td className="px-6 py-4">
                          <Badge className={st.status === 'Online' ? 'bg-green-500' : 'bg-amber-500'}>
                            {st.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold">{Math.round((st.availablePorts/st.totalPorts)*100)}%</span>
                            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${(st.availablePorts/st.totalPorts)*100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-headline font-bold text-primary">{st.avgSessionMinutes}m</td>
                        <td className="px-6 py-4 font-bold">${(Math.random() * 5000 + 2000).toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-none">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-lg font-headline flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary" />
                System Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="p-6 space-y-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex space-x-4">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      <div>
                        <p className="text-sm font-bold">Port P-{i}1 Status Change</p>
                        <p className="text-xs text-muted-foreground mt-1">Charging started for Tesla Model Y at VoltHub Downtown.</p>
                        <span className="text-[10px] text-muted-foreground font-mono mt-2 block">{new Date().toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Minimal placeholder scroll area if original not enough
function ScrollArea({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`overflow-auto ${className}`}>{children}</div>;
}
