import React, { useState } from 'react';
import { MapPin, Navigation, CreditCard, User, Loader2, ShieldCheck, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RideOption, calculateFare } from './RideOptions';
import { BillingSection } from './PaymentBilling';
import { PaymentMethodSelector, PaymentMethod } from './PaymentMethodSelector';

interface RideSummaryProps {
  pickup: string;
  destination: string;
  distance: number;
  duration: number;
  ride: RideOption;
  onBook: (paymentMethod: string, totalAmount: number) => void | Promise<void>;
  isBooking: boolean;
  bookingStep: 'searching' | 'found' | 'none' | 'completed';
  phone: string;
  onPhoneChange: (phone: string) => void;
}

const RideSummary: React.FC<RideSummaryProps> = ({ 
  pickup, 
  destination, 
  distance, 
  duration, 
  ride, 
  onBook,
  isBooking,
  bookingStep,
  phone,
  onPhoneChange
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const baseFare = calculateFare(ride, distance, duration);
  
  // New Calculation logic as per prompt
  const tax = baseFare * 0.12;
  const serviceFee = baseFare * 0.05;
  const totalAmount = baseFare + tax + serviceFee;

  if (bookingStep === 'searching') {
    return (
      <div className="p-8 flex flex-col items-center justify-center space-y-6 text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-100 rounded-full" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Navigation size={32} className="text-indigo-600 animate-pulse" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900">Searching for Driver</h3>
          <p className="text-slate-500 font-medium mt-1">Connecting you with the nearest {ride.name}...</p>
        </div>
      </div>
    );
  }

  if (bookingStep === 'found') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500 text-white rounded-lg">
              <ShieldCheck size={20} />
            </div>
            <p className="text-sm font-black text-emerald-900">Driver Found!</p>
          </div>
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Arriving in 3 mins</p>
        </div>

        <div className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ride.id}`} 
                  alt="Driver"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-lg shadow-sm border border-slate-50">
                <Star size={12} className="fill-amber-400 text-amber-400" />
              </div>
            </div>
            <div>
              <p className="text-lg font-black text-slate-900">Rajesh Kumar</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">MH 12 AB 1234</p>
              <div className="flex items-center mt-1 text-xs font-bold text-amber-500">
                <Star size={12} className="fill-amber-500 mr-1" />
                4.9 (2.4k rides)
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`p-3 rounded-xl bg-${ride.color}-100 text-${ride.color}-600 inline-block`}>
              <ride.icon size={24} className={ride.type === 'auto' ? 'rotate-45' : ''} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{ride.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="py-4 bg-slate-100 text-slate-900 font-black rounded-2xl">Call Driver</button>
          <button className="py-4 bg-slate-900 text-white font-black rounded-2xl">Cancel Ride</button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Ride Details</h3>
        
        <div className="p-6 bg-slate-50 rounded-[2rem] space-y-4">
          <div className="flex items-start space-x-3">
            <MapPin size={18} className="text-emerald-500 mt-1 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pickup</p>
              <p className="text-sm font-bold text-slate-900 line-clamp-1">{pickup}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Navigation size={18} className="text-indigo-600 mt-1 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destination</p>
              <p className="text-sm font-bold text-slate-900 line-clamp-1">{destination}</p>
            </div>
          </div>
        </div>
      </div>

      <BillingSection 
        basePrice={baseFare} 
        itemType="ride" 
        distance={distance} 
      />

      <PaymentMethodSelector 
        selected={paymentMethod} 
        onSelect={setPaymentMethod} 
      />

      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Confirmation Details</h3>
        <div className="p-6 bg-slate-50 rounded-[2rem] space-y-4 text-slate-900">
          <div className="flex items-start space-x-3">
            <User size={18} className="text-slate-400 mt-1 shrink-0" />
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Confirm Phone Number</label>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                placeholder="+91 1234567890"
                className="w-full bg-transparent border-b border-slate-200 py-1 text-sm font-bold outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={() => onBook(paymentMethod, totalAmount)}
        disabled={isBooking}
        className="w-full py-5 bg-slate-900 text-white font-black rounded-[2rem] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
      >
        {isBooking ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <CreditCard size={20} />
            <span>Pay ₹{Math.round(totalAmount).toLocaleString()} & Book Ride</span>
          </>
        )}
      </button>
    </div>
  );
};

export default RideSummary;
