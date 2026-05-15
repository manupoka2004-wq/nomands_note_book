import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Calendar, MapPin, User, ArrowLeft, Smartphone, Mail } from 'lucide-react';

interface RideBookingConfirmationProps {
  booking: {
    id: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    pickup: string;
    drop: string;
    date: string;
    time: string;
  };
  onBack: () => void;
}

export default function RideBookingConfirmation({ booking, onBack }: RideBookingConfirmationProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
      >
        <div className="bg-indigo-600 p-12 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, delay: 0.2 }}
            className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 border border-white/30"
          >
            <CheckCircle2 size={48} className="text-white" />
          </motion.div>
          
          <h2 className="text-4xl font-black tracking-tight mb-2">Ride Confirmed!</h2>
          <p className="text-indigo-100 font-medium">Your booking has been successfully placed.</p>
          
          <div className="mt-8 inline-block px-6 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
            <span className="text-xs font-black uppercase tracking-[0.2em]">Booking ID: {booking.id}</span>
          </div>
        </div>

        <div className="p-12 space-y-8">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <User size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Passenger</p>
                <p className="text-lg font-bold text-slate-900">{booking.userName}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="flex items-center text-xs text-slate-500 font-medium">
                    <Mail size={12} className="mr-1" /> {booking.userEmail}
                  </span>
                  <span className="flex items-center text-xs text-slate-500 font-medium">
                    <Smartphone size={12} className="mr-1" /> {booking.userPhone}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pickup</p>
                  <p className="text-sm font-bold text-slate-900">{booking.pickup}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Drop</p>
                  <p className="text-sm font-bold text-slate-900">{booking.drop}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</p>
                <p className="text-lg font-bold text-slate-900">{booking.date} at {booking.time}</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100">
            <button 
              onClick={onBack}
              className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-slate-200"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        <div className="p-6 bg-slate-50 text-center space-y-2">
          <p className="text-xs font-bold text-slate-400 flex items-center justify-center">
            <Mail size={12} className="mr-2" /> Confirmation email sent to {booking.userEmail}
          </p>
          <p className="text-xs font-bold text-slate-400 flex items-center justify-center">
            <Smartphone size={12} className="mr-2" /> Confirmation SMS sent to {booking.userPhone}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
