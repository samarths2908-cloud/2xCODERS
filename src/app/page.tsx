"use client";

import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { MapView } from '@/components/MapView';
import { StationCard } from '@/components/StationCard';
import { RecommendationPanel } from '@/components/RecommendationPanel';
import { fetchNearbyStations } from '@/lib/api';
import { rankStationsByFastestOption, StationRanking } from '@/lib/charging';
import { CURRENT_USER } from '@/lib/mock-data';
import { Zap, LayoutDashboard, History, Bell, LogOut, Settings, Search, Filter, Loader2, Gauge } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';

export default function WattWiseApp() {
  const [stations, setStations] = useState<StationRanking[]>([]);
  const [selectedStation, setSelectedStation] = useState<StationRanking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [currentBat, setCurrentBat] = useState(22);
  const [targetBat, setTargetBat] = useState(85);

  const userLocation = { latitude: 34.0522, longitude: -118.2437 };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const rawStations = await fetchNearbyStations(isDemoMode);
      const ranked = rankStationsByFastestOption(
        rawStations,
        userLocation,
        currentBat,
        targetBat,
        CURRENT_USER.batteryCapacityKWh
      );
      setStations(ranked);
      setIsLoading(false);
    };
    loadData();
  }, [isDemoMode, currentBat, targetBat]);

  const bestStation = stations[0];

  const handleBooking = (station: StationRanking) => {
    toast({
      title: "Navigation Locked",
      description: `Optimized route to ${station.name} synced to vehicle.`,
    });
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-[#050505] text-white font-body overflow-hidden">
        {/* Futuristic Sidebar */}
        <Sidebar className="border-r border-white/5 bg-black/60 backdrop-blur-3xl" collapsible="icon">
          <SidebarHeader className="p-8">
            <div className="flex items-center space-x-4">
              <div className="bg-primary p-2.5 rounded-2xl shadow-[0_0_20px_rgba(56,126,230,0.5)]">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black font-headline tracking-tighter group-data-[collapsible=icon]:hidden">
                WATT<span className="text-primary">WISE</span>
              </span>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-4 py-8">
            <SidebarMenu className="space-y-4">
              <SidebarMenuItem>
                <SidebarMenuButton isActive className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest px-6 py-6 rounded-2xl">
                  <LayoutDashboard className="w-5 h-5 mr-3 text-primary" />
                  <span>Fleet Explorer</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="hover:bg-white/5 text-muted-foreground hover:text-white font-black uppercase text-[10px] tracking-widest px-6 py-6 rounded-2xl">
                  <History className="w-5 h-5 mr-3" />
                  <span>Activity Logs</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="hover:bg-white/5 text-muted-foreground hover:text-white font-black uppercase text-[10px] tracking-widest px-6 py-6 rounded-2xl">
                  <Bell className="w-5 h-5 mr-3" />
                  <span>Proximity Alerts</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-8 border-t border-white/5">
            <div className="flex items-center justify-between group-data-[collapsible=icon]:hidden">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <span className="font-black text-primary">AD</span>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">{CURRENT_USER.name}</p>
                  <p className="text-[10px] text-muted-foreground font-bold">{CURRENT_USER.carModel}</p>
                </div>
              </div>
              <LogOut className="w-4 h-4 text-muted-foreground hover:text-destructive cursor-pointer" />
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col bg-transparent relative">
          {/* Header */}
          <header className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-40">
            <div className="flex items-center space-x-6">
              <SidebarTrigger className="text-white hover:bg-white/5" />
              <div className="h-6 w-px bg-white/10" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                Network Status: <span className="text-green-400">OPTIMAL</span>
              </h2>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                <Gauge className="w-4 h-4 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest">Real-Time Sync</span>
              </div>
              <Settings className="w-5 h-5 text-muted-foreground hover:text-white cursor-pointer transition-colors" />
            </div>
          </header>

          <main className="flex-1 p-8 flex flex-col lg:flex-row gap-8 overflow-hidden">
            {/* Control Sidebar */}
            <div className="w-full lg:w-[480px] flex flex-col gap-6 order-2 lg:order-1">
              {/* Charge Config Card */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl space-y-8 shadow-xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black font-headline uppercase tracking-widest flex items-center">
                    <Zap className="w-5 h-5 mr-3 text-primary" />
                    Power Sync
                  </h3>
                  <Badge variant="outline" className="border-primary/50 text-primary font-black uppercase text-[10px]">
                    {isDemoMode ? 'SIMULATED DATA' : 'LIVE GRID'}
                  </Badge>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Current Charge</span>
                      <span className="text-2xl font-black text-primary font-headline">{currentBat}%</span>
                    </div>
                    <Slider 
                      value={[currentBat]} 
                      onValueChange={(v) => setCurrentBat(v[0])}
                      max={100}
                      className="py-4"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Target Threshold</span>
                      <span className="text-2xl font-black text-accent font-headline">{targetBat}%</span>
                    </div>
                    <Slider 
                      value={[targetBat]} 
                      onValueChange={(v) => setTargetBat(Math.max(v[0], currentBat + 10))}
                      min={currentBat}
                      max={100}
                      className="py-4"
                    />
                  </div>
                </div>
              </div>

              {/* Station List */}
              <div className="flex-1 flex flex-col min-h-0 space-y-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="SCANNING NEARBY HUBS..." 
                      className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest placeholder:text-muted-foreground/50 focus:ring-primary/50" 
                    />
                  </div>
                  <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10">
                    <Filter className="w-4 h-4 text-white" />
                  </Button>
                </div>

                <ScrollArea className="flex-1">
                  <div className="space-y-4 pb-10">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Decoding grid telemetry...</p>
                      </div>
                    ) : (
                      stations.map((st, idx) => (
                        <StationCard 
                          key={st.id} 
                          station={st} 
                          onSelect={setSelectedStation}
                          isRecommended={idx === 0}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Map & Recommendation Area */}
            <div className="flex-1 flex flex-col gap-8 order-1 lg:order-2">
              <div className="flex-1 relative">
                <MapView 
                  stations={stations}
                  selectedStation={selectedStation || bestStation}
                  onStationClick={setSelectedStation}
                  userLocation={userLocation}
                />
              </div>

              {/* Recommendation HUD */}
              {bestStation && (
                <div className="animate-in slide-in-from-bottom-8 duration-700">
                  <RecommendationPanel 
                    station={selectedStation || bestStation} 
                    onBook={handleBooking} 
                  />
                </div>
              )}
            </div>
          </main>
        </SidebarInset>

        <Toaster />
      </div>
    </SidebarProvider>
  );
}
