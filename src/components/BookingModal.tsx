"use client";

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
      <DialogContent className="glass border-white/10 text-white sm:max-w-[450px] rounded-[2.5rem] p-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-50" />
        
        <DialogHeader>
          <DialogTitle className="text-3xl font-black font-headline text-cyan-400 tracking-tighter">RESERVE NODE</DialogTitle>
          <DialogDescription className="text-white/40 font-medium">
            Securing tactical port at {station.name}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8 mt-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Arrival Date</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-3.5 w-4 h-4 text-cyan-400" />
                <Input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-black/60 border-white/10 pl-12 h-12 rounded-xl focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Sector Arrival Time</Label>
              <div className="relative">
                <Clock className="absolute left-4 top-3.5 w-4 h-4 text-cyan-400" />
                <Input 
                  type="time" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-black/60 border-white/10 pl-12 h-12 rounded-xl focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Occupancy Duration (m)</Label>
              <div className="relative">
                <Zap className="absolute left-4 top-3.5 w-4 h-4 text-cyan-400" />
                <Input 
                  type="number" 
                  min="15" 
                  max="240" 
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="bg-black/60 border-white/10 pl-12 h-12 rounded-xl focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="submit" 
              className="glow-btn w-full h-14 text-[12px] font-black uppercase tracking-[0.3em]"
            >
              Confirm Reservation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
