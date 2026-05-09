"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Battery, Info, AlertCircle, RefreshCw } from 'lucide-react';
import { Station, User } from '@/lib/types';
import { calculateChargingTime, estimateTravelTime } from '@/lib/utils/charging-calculator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BookingPanelProps {
  user: User;
  stations: Station[];
  onBook: (station: Station, estimates: any) => void;
  onSuggestionClick?: (explanation: string) => void;
}

export const BookingPanel: React.FC<BookingPanelProps> = ({ user, stations, onBook }) => {
  const [currentBat, setCurrentBat] = useState(25);
  const [targetBat, setTargetBat] = useState(80);
  const [chargingMode, setChargingMode] = useState<'full' | 'custom'>('custom');

  const recommendations = useMemo(() => {
    return stations.map(station => {
      const travelTime = estimateTravelTime(34.05, -118.24, station.location.latitude, station.location.longitude);
      const waitTime = station.averageWaitMinutes;
      const chargeTime = calculateChargingTime(
        currentBat, 
        chargingMode === 'full' ? 100 : targetBat, 
        user.batteryCapacityKWh, 
        station.id === 'st-3' ? 250 : 150 // Mocking different power levels
      );
      const totalTime = travelTime + waitTime + chargeTime;

      return {
        ...station,
        estimates: {
          travelTime,
          waitTime,
          chargeTime,
          totalTime
        }
      };
    }).sort((a, b) => a.estimates.totalTime - b.estimates.totalTime);
  }, [stations, currentBat, targetBat, chargingMode, user]);

  const bestStation = recommendations[0];

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline">
            <Battery className="w-6 h-6 mr-2 text-primary" />
            Charge Configuration
          </CardTitle>
          <CardDescription>Enter your current state to find the fastest station.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Current Battery</Label>
              <span className="text-lg font-bold text-primary">{currentBat}%</span>
            </div>
            <Slider 
              value={[currentBat]} 
              onValueChange={(val) => setCurrentBat(val[0])}
              max={100} 
              step={1} 
              className="py-4"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-medium">Target Charge Level</Label>
            <Tabs value={chargingMode} onValueChange={(v) => setChargingMode(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="full" className="data-[state=active]:bg-primary data-[state=active]:text-white">Full (100%)</TabsTrigger>
                <TabsTrigger value="custom" className="data-[state=active]:bg-primary data-[state=active]:text-white">Custom Range</TabsTrigger>
              </TabsList>
              <TabsContent value="custom" className="space-y-4 mt-0">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Up to</span>
                  <span className="text-lg font-bold text-accent">{targetBat}%</span>
                </div>
                <Slider 
                  value={[targetBat]} 
                  onValueChange={(val) => setTargetBat(Math.max(val[0], currentBat + 5))}
                  min={currentBat}
                  max={100} 
                  step={1} 
                  className="py-4"
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {bestStation && (
        <Card className="border-2 border-primary ring-4 ring-primary/10 overflow-hidden bg-white shadow-xl">
          <div className="bg-primary px-4 py-2 flex justify-between items-center">
            <span className="text-white text-xs font-bold uppercase tracking-widest">Recommended Fastest Route</span>
            <div className="flex items-center text-white/90 text-xs">
              <Info className="w-3 h-3 mr-1" />
              <span>Saves ~12 min vs others</span>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold font-headline text-foreground">{bestStation.name}</h3>
                <p className="text-sm text-muted-foreground">Premium Charging Partner</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-primary font-headline tracking-tighter">
                  {bestStation.estimates.totalTime} <span className="text-sm font-medium">MIN</span>
                </div>
                <p className="text-xs text-muted-foreground uppercase">Total Effective Time</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-muted/50 p-3 rounded-xl border border-border">
                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Travel</p>
                <p className="text-lg font-headline font-bold">{bestStation.estimates.travelTime}m</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-xl border border-border">
                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Queue</p>
                <p className="text-lg font-headline font-bold text-amber-600">{bestStation.estimates.waitTime}m</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-xl border border-border">
                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Charge</p>
                <p className="text-lg font-headline font-bold text-accent">{bestStation.estimates.chargeTime}m</p>
              </div>
            </div>

            <Alert className="bg-accent/10 border-accent/20 mb-6">
              <AlertCircle className="h-4 w-4 text-accent" />
              <AlertTitle className="text-accent font-bold">Instant Switch Available</AlertTitle>
              <AlertDescription className="text-xs text-accent-foreground/80">
                If congestion increases while driving, we'll reroute you automatically.
              </AlertDescription>
            </Alert>

            <Button onClick={() => onBook(bestStation, bestStation.estimates)} size="lg" className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-primary/30">
              Reserve Port Now
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
