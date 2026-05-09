import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Zap, BatteryCharging } from 'lucide-react';
import { StationRanking } from '@/lib/charging';

interface StationCardProps {
  station: StationRanking;
  onSelect: (station: StationRanking) => void;
  isRecommended?: boolean;
}

export const StationCard: React.FC<StationCardProps> = ({ station, onSelect, isRecommended }) => {
  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 bg-black/40 border-white/10 backdrop-blur-xl hover:border-primary/50 hover:shadow-[0_0_20px_rgba(56,126,230,0.2)] ${isRecommended ? 'border-primary/60 ring-1 ring-primary/30' : ''}`}>
      {isRecommended && (
        <div className="absolute top-0 right-0">
          <div className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-widest shadow-lg">
            Optimal
          </div>
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg font-headline text-white group-hover:text-primary transition-colors">
              {station.name}
            </CardTitle>
            <div className="flex items-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              <MapPin className="w-3 h-3 mr-1 text-primary" />
              Downtown District
            </div>
          </div>
          <Badge variant="outline" className={`${station.status === 'Online' ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-amber-500/50 text-amber-400 bg-amber-500/10'} font-bold`}>
            {station.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-[9px] text-muted-foreground uppercase font-black block mb-1">Queue</span>
            <div className="flex items-center text-white">
              <Clock className="w-3.5 h-3.5 mr-2 text-accent" />
              <span className="text-sm font-bold">{station.estimates.waitTime} min</span>
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-[9px] text-muted-foreground uppercase font-black block mb-1">Ports</span>
            <div className="flex items-center text-white">
              <Zap className="w-3.5 h-3.5 mr-2 text-primary" />
              <span className="text-sm font-bold">{station.availablePorts}/{station.totalPorts}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <BatteryCharging className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-white/80">Est. {station.estimates.chargeTime}m charge</span>
          </div>
          <span className="text-xl font-black text-white tracking-tighter">
            {station.estimates.totalTime}<span className="text-[10px] text-primary ml-0.5">MIN</span>
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button 
          onClick={() => onSelect(station)} 
          className="w-full bg-white/10 hover:bg-primary text-white border border-white/10 hover:border-primary font-black uppercase text-xs tracking-widest transition-all"
        >
          Select Route
        </Button>
      </CardFooter>
    </Card>
  );
};
