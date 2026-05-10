import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Clock, Zap } from 'lucide-react';
import { Station, Booking } from '@/lib/types';

interface BookingModalProps {
  station: Station | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (booking: Omit<Booking, 'id'>) => void;
}

export default function BookingModal({ station, isOpen, onClose, onConfirm }: BookingModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('12:00');
  const [duration, setDuration] = useState(30);

  if (!station) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      stationId: station.id,
      date,
      startTime: time,
      duration,
      userEmail: 'pilot@wattwise.ai'
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass border-white/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black font-headline text-cyan-400">RESERVE VECTOR</DialogTitle>
          <DialogDescription className="text-white/60">
            Secure your port at {station.name}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Select Date</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-3 w-4 h-4 text-cyan-400" />
                <Input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-black/40 border-white/10 pl-10 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Arrival Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-cyan-400" />
                <Input 
                  type="time" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-black/40 border-white/10 pl-10 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Duration (Minutes)</Label>
              <div className="relative">
                <Zap className="absolute left-3 top-3 w-4 h-4 text-cyan-400" />
                <Input 
                  type="number" 
                  min="15" 
                  max="240" 
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="bg-black/40 border-white/10 pl-10 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="submit" 
              className="glow-btn w-full h-12 text-sm font-bold uppercase tracking-widest"
            >
              Confirm Reservation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
