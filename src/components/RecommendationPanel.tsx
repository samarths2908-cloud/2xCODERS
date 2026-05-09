import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StationRanking } from '@/lib/charging';
import { Sparkles, Navigation, Clock, Battery, Route } from 'lucide-react';

interface RecommendationPanelProps {
  station: StationRanking;
  onBook: (station: StationRanking) => void;
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({ station, onBook }) => {
  return (
    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary/20 via-black/40 to-accent/10 backdrop-blur-3xl shadow-2xl">
      {/* Decorative background pulse */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/20 blur-[100px] rounded-full animate-pulse" />
      
      <CardContent className="p-8 space-y-8 relative z-10">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">AI Recommendation</span>
            </div>
            <h3 className="text-4xl font-black font-headline text-white tracking-tighter">
              {station.name}
            </h3>
            <p className="text-muted-foreground text-sm font-medium">Fastest total session time calculated.</p>
          </div>
          
          <div className="text-right">
            <div className="text-6xl font-black font-headline text-white tracking-tighter drop-shadow-[0_0_10px_rgba(56,126,230,0.5)]">
              {station.estimates.totalTime}
            </div>
            <div className="text-xs font-black text-primary uppercase tracking-widest">Minutes Total</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
              <Route className="w-3 h-3 text-primary" />
              <span>Travel</span>
            </div>
            <div className="text-xl font-bold text-white">{station.estimates.travelTime}m</div>
          </div>
          <div className="space-y-1 border-x border-white/10 px-4">
            <div className="flex items-center space-x-2 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
              <Clock className="w-3 h-3 text-accent" />
              <span>Wait</span>
            </div>
            <div className="text-xl font-bold text-white">{station.estimates.waitTime}m</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
              <Battery className="w-3 h-3 text-green-400" />
              <span>Charge</span>
            </div>
            <div className="text-xl font-bold text-white">{station.estimates.chargeTime}m</div>
          </div>
        </div>

        <div className="flex space-x-4">
          <Button 
            onClick={() => onBook(station)}
            size="lg" 
            className="flex-1 h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase text-sm tracking-[0.1em] rounded-xl shadow-[0_10px_30px_rgba(56,126,230,0.3)] transition-all transform hover:-translate-y-1 active:translate-y-0"
          >
            <Navigation className="w-5 h-5 mr-3" />
            Start Smart Navigation
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-14 h-14 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white group"
          >
            <Route className="w-5 h-5 transition-transform group-hover:scale-110" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
