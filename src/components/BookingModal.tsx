
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Clock, Zap, ShieldCheck } from 'lucide-react';
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
      <DialogContent className="glass border-white/10 text-white sm:max-w-[480px] rounded-[2.5rem] p-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
        
        <DialogHeader className="relative">
          <div className="absolute -top-4 -right-4">
             <ShieldCheck className="w-12 h-12 text-cyan-500/20" />
          </div>
          <DialogTitle className="text-3xl font-black font-headline text-cyan-400 tracking-tighter uppercase">Reserve Tactical Node</DialogTitle>
          <DialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[9px] mt-2">
            Node Identity: {station.name} // Sector Access Required
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8 mt-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 font-headline">Synchronization Date</Label>
              <div className="relative group">
                <CalendarIcon className="absolute left-4 top-3.5 w-4 h-4 text-cyan-400 transition-transform group-hover:scale-110" />
                <Input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-black/40 border-white/10 pl-12 h-12 rounded-xl focus:ring-cyan-500 font-headline font-bold text-xs"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 font-headline">Arrival Timeframe (UTC)</Label>
              <div className="relative group">
                <Clock className="absolute left-4 top-3.5 w-4 h-4 text-cyan-400 transition-transform group-hover:scale-110" />
                <Input 
                  type="time" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-black/40 border-white/10 pl-12 h-12 rounded-xl focus:ring-cyan-500 font-headline font-bold text-xs"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 font-headline">Occupancy Limit (Minutes)</Label>
              <div className="relative group">
                <Zap className="absolute left-4 top-3.5 w-4 h-4 text-cyan-400 transition-transform group-hover:scale-110" />
                <Input 
                  type="number" 
                  min="15" 
                  max="240" 
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="bg-black/40 border-white/10 pl-12 h-12 rounded-xl focus:ring-cyan-500 font-headline font-bold text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button 
              type="submit" 
              className="glow-btn w-full h-14 text-[11px] font-black uppercase tracking-[0.4em] font-headline"
            >
              Initialize Reservation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
