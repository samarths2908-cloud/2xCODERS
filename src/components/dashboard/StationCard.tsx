import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Zap, Users } from 'lucide-react';
import { Station } from '@/lib/types';

interface StationCardProps {
  station: Station;
  onSelect: (station: Station) => void;
  isRecommended?: boolean;
}

export const StationCard: React.FC<StationCardProps> = ({ station, onSelect, isRecommended }) => {
  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md border-2 ${isRecommended ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            {isRecommended && (
              <Badge className="bg-primary text-white mb-2">Fastest Choice</Badge>
            )}
            <CardTitle className="text-lg font-headline">{station.name}</CardTitle>
          </div>
          <Badge variant={station.status === 'Online' ? 'default' : 'secondary'} className={station.status === 'Online' ? 'bg-green-500' : ''}>
            {station.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-2 text-primary" />
          <span>Nearby • {(Math.random() * 5).toFixed(1)} miles</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Wait Time</span>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-accent" />
              <span className="font-semibold">{station.averageWaitMinutes} min</span>
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Available</span>
            <div className="flex items-center">
              <Zap className="w-4 h-4 mr-1.5 text-primary" />
              <span className="font-semibold">{station.availablePorts}/{station.totalPorts} ports</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button onClick={() => onSelect(station)} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">
          Select Station
        </Button>
      </CardFooter>
    </Card>
  );
};
