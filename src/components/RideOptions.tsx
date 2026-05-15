import React from 'react';
import { Bike, Car, Navigation, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export interface RideOption {
  id: string;
  name: string;
  type: 'bike' | 'auto' | 'car';
  baseFare: number;
  baseKm: number;
  perKm: number;
  perMin: number;
  icon: React.ElementType;
  color: string;
}

export const calculateFare = (ride: RideOption, distance: number, duration: number) => {
  const distanceFare = Math.max(0, distance - ride.baseKm) * ride.perKm;
  const timeFare = duration * ride.perMin;
  const total = ride.baseFare + distanceFare + timeFare;
  return Math.round(total);
};

export const RIDE_OPTIONS: RideOption[] = [
  { id: 'bike', name: 'Bike Ride', type: 'bike', baseFare: 25, baseKm: 2, perKm: 7, perMin: 1, icon: Bike, color: 'emerald' },
  { id: 'auto', name: 'Auto Ride', type: 'auto', baseFare: 35, baseKm: 2, perKm: 9, perMin: 1.5, icon: Navigation, color: 'amber' },
  { id: 'car', name: 'Car Ride', type: 'car', baseFare: 50, baseKm: 2, perKm: 14, perMin: 2, icon: Car, color: 'indigo' },
];

interface RideOptionsProps {
  distance: number;
  duration: number;
  selectedRide: string | null;
  onSelect: (rideId: string) => void;
}

const RideOptions: React.FC<RideOptionsProps> = ({ distance, duration, selectedRide, onSelect }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Available Rides</h3>
      <div className="space-y-2">
        {RIDE_OPTIONS.map((ride) => {
          const fare = calculateFare(ride, distance, duration);
          const isSelected = selectedRide === ride.id;
          const isRecommended = (ride.type === 'car' && distance > 10) || (ride.type === 'bike' && distance < 5);
          
          return (
            <motion.button
              key={ride.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(ride.id)}
              className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between relative ${
                isSelected 
                  ? `border-${ride.color}-500 bg-${ride.color}-50/50` 
                  : 'border-slate-100 hover:border-slate-200 bg-white'
              }`}
            >
              {isRecommended && (
                <div className="absolute -top-2 right-4 bg-amber-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                  AI Recommended
                </div>
              )}
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl bg-${ride.color}-100 text-${ride.color}-600`}>
                  <ride.icon size={24} className={ride.type === 'auto' ? 'rotate-45' : ''} />
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-900">{ride.name}</p>
                  <div className="flex items-center text-xs font-bold text-slate-500 space-x-2">
                    <span className="flex items-center">
                      <Clock size={12} className="mr-1" />
                      {Math.round(distance * 2 + 3)} min away
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-black text-slate-900">₹{Math.round(fare)}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estimated</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default RideOptions;
