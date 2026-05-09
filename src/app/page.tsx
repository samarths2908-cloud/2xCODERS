"use client";

import React, { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { ChargingMap } from '@/components/map/ChargingMap';
import { StationCard } from '@/components/dashboard/StationCard';
import { BookingPanel } from '@/components/booking/BookingPanel';
import { MOCK_STATIONS, CURRENT_USER } from '@/lib/mock-data';
import { Station, User } from '@/lib/types';
import { Zap, Map as MapIcon, Settings, LayoutDashboard, History, Bell, LogOut, Search, Filter, Sparkles, BrainCircuit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { explainOptimalStationChoice } from '@/ai/flows/explain-optimal-station-choice';
import { predictCongestionInsight } from '@/ai/flows/predict-congestion-insight';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function WattWiseApp() {
  const [stations, setStations] = useState<Station[]>(MOCK_STATIONS);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [user, setUser] = useState<User>(CURRENT_USER);
  const [activeTab, setActiveTab] = useState('stations');
  const [isDemoMode, setIsDemoMode] = useState(true);
  
  // AI State
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [congestionInsight, setCongestionInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isInsightDialogOpen, setIsInsightDialogOpen] = useState(false);

  const handleStationSelect = (station: Station) => {
    setSelectedStation(station);
    setActiveTab('plan');
    toast({
      title: "Station Selected",
      description: `Optimizing route for ${station.name}...`,
    });
  };

  const handleGetAiExplanation = async (currentBat: number, targetBat: number) => {
    if (!selectedStation) return;
    setIsAiLoading(true);
    try {
      const result = await explainOptimalStationChoice({
        userLocation: { latitude: 34.0522, longitude: -118.2437 },
        currentBatteryPercentage: currentBat,
        targetBatteryPercentage: targetBat,
        recommendedStation: {
          id: selectedStation.id,
          name: selectedStation.name,
          location: selectedStation.location,
          totalEstimatedMinutes: selectedStation.averageWaitMinutes + 15 + 30, // Mocked totals
          travelMinutes: 15,
          waitMinutes: selectedStation.averageWaitMinutes,
          chargeMinutes: 30,
          reason: selectedStation.congestionLevel < 0.3 ? "Low congestion detected." : undefined,
        },
        otherStationsConsidered: stations
          .filter(s => s.id !== selectedStation.id)
          .map(s => ({
            id: s.id,
            name: s.name,
            location: s.location,
            totalEstimatedMinutes: s.averageWaitMinutes + 45
          }))
      });
      setAiExplanation(result.explanation);
      setIsInsightDialogOpen(true);
    } catch (error) {
      toast({
        title: "AI Analysis Failed",
        description: "Could not generate explanation. Check your API key.",
        variant: "destructive"
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGetCongestionInsight = async () => {
    if (!selectedStation) return;
    setIsAiLoading(true);
    try {
      const result = await predictCongestionInsight({
        stationName: selectedStation.name,
        currentDateTime: new Date().toISOString(),
        historicalDemandSummary: "Usually busy during weekday evenings, quiet mornings.",
        currentQueueLength: selectedStation.totalPorts - selectedStation.availablePorts,
        averageChargingTime: 35,
        upcomingEvents: ["City Marathon nearby", "Tech Conference downtown"]
      });
      setCongestionInsight(result.insight);
      setIsInsightDialogOpen(true);
    } catch (error) {
      toast({
        title: "AI Prediction Failed",
        description: "Could not predict congestion. Check your API key.",
        variant: "destructive"
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleBooking = (station: Station, estimates: any) => {
    toast({
      title: "Booking Confirmed!",
      description: `Port reserved at ${station.name}. ETA: ${estimates.totalTime} mins.`,
    });
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <Sidebar className="border-r border-border bg-white" collapsible="icon">
          <SidebarHeader className="p-6 border-b border-border">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black font-headline tracking-tighter group-data-[collapsible=icon]:hidden">WATTWISE <span className="text-accent">EV</span></span>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === 'stations'} onClick={() => setActiveTab('stations')} tooltip="Dashboard">
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Explorer</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === 'plan'} onClick={() => setActiveTab('plan')} tooltip="Plan Route">
                    <MapIcon className="w-5 h-5" />
                    <span>Smart Planner</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Activity History">
                    <History className="w-5 h-5" />
                    <span>My Charging</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Notifications">
                    <Bell className="w-5 h-5" />
                    <span>Alerts</span>
                    <Badge className="ml-auto bg-accent text-accent-foreground text-[10px] px-1 group-data-[collapsible=icon]:hidden">3</Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-6 border-t border-border">
            <div className="flex items-center space-x-3 group-data-[collapsible=icon]:hidden">
              <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                <img src="https://picsum.photos/seed/user/100/100" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.carModel}</p>
              </div>
              <LogOut className="w-4 h-4 text-muted-foreground hover:text-destructive cursor-pointer" />
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-background">
          <header className="h-16 border-b border-border bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center space-x-4">
              <SidebarTrigger />
              <div className="h-4 w-px bg-border mx-2" />
              <h2 className="text-sm font-black font-headline uppercase tracking-widest text-muted-foreground">
                {activeTab === 'stations' ? 'Live Station Feed' : 'Route Optimization'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary cursor-pointer hover:bg-primary hover:text-white transition-colors">
                {isDemoMode ? 'Demo Mode Active' : 'Real-time Feed'}
              </Badge>
              <div className="p-2 bg-muted rounded-full hover:bg-muted/80 cursor-pointer">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-hidden flex flex-col md:flex-row p-4 gap-4">
            <div className="w-full md:w-[450px] flex flex-col gap-4 order-2 md:order-1">
              {activeTab === 'stations' ? (
                <>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Search stations..." className="pl-9 bg-white border-border" />
                    </div>
                    <Button variant="outline" size="icon" className="bg-white">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <ScrollArea className="flex-1">
                    <div className="space-y-4 pb-4">
                      {stations.map((st) => (
                        <StationCard 
                          key={st.id} 
                          station={st} 
                          onSelect={handleStationSelect}
                          isRecommended={st.id === 'st-3'}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <ScrollArea className="flex-1">
                  <BookingPanel 
                    user={user} 
                    stations={stations} 
                    onBook={handleBooking}
                    onExplain={handleGetAiExplanation}
                    onPredict={handleGetCongestionInsight}
                    isAiLoading={isAiLoading}
                  />
                </ScrollArea>
              )}
            </div>

            <div className="flex-1 min-h-[400px] order-1 md:order-2">
              <ChargingMap 
                stations={stations} 
                selectedStation={selectedStation} 
                onStationClick={handleStationSelect}
                userLocation={{ lat: 34.0522, lng: -118.2437 }}
              />
            </div>
          </main>
        </SidebarInset>

        <Dialog open={isInsightDialogOpen} onOpenChange={(open) => {
          setIsInsightDialogOpen(open);
          if (!open) {
            setAiExplanation(null);
            setCongestionInsight(null);
          }
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center text-xl font-headline">
                <BrainCircuit className="w-6 h-6 mr-2 text-primary" />
                AI Smart Insight
              </DialogTitle>
              <DialogDescription>
                Generating insights based on real-time data and historical patterns.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border">
              {aiExplanation && (
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-primary flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Recommendation Logic
                  </h4>
                  <p className="text-sm leading-relaxed text-foreground/90">{aiExplanation}</p>
                </div>
              )}
              {congestionInsight && (
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-accent flex items-center">
                    <History className="w-3 h-3 mr-1" />
                    Congestion Forecast
                  </h4>
                  <p className="text-sm leading-relaxed text-foreground/90">{congestionInsight}</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setIsInsightDialogOpen(false)}>Close Insight</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Toaster />
      </div>
    </SidebarProvider>
  );
}
