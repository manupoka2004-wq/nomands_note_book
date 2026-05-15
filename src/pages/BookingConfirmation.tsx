import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Calendar, MapPin, User, ArrowLeft, Download, Share2 } from 'lucide-react';
import { PlacesBooking } from '../types';

interface BookingConfirmationProps {
  booking: PlacesBooking;
  onBack: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ booking, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
      >
        {/* Header Section */}
        <div className="bg-emerald-600 p-12 text-white text-center relative overflow-hidden">
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
          
          <h2 className="text-4xl font-black tracking-tight mb-2">Booking Confirmed!</h2>
          <p className="text-emerald-100 font-medium">Your reservation has been successfully placed.</p>
          
          <div className="mt-8 inline-block px-6 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
            <span className="text-xs font-black uppercase tracking-[0.2em]">Booking ID: {booking.id}</span>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-12 space-y-10">
          <div className="flex items-center space-x-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
            <img src={booking.place.image} className="w-24 h-24 object-cover rounded-2xl shadow-md" alt={booking.place.name} referrerPolicy="no-referrer" />
            <div>
              <h3 className="text-2xl font-black text-slate-900">{booking.place.name}</h3>
              <div className="flex items-center text-slate-500 text-sm mt-1 font-medium">
                <MapPin size={16} className="mr-2 text-indigo-500" />
                <span>{booking.place.address}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest Details</p>
                <div className="flex items-center text-slate-900 font-bold">
                  <User size={18} className="mr-3 text-indigo-600" />
                  <div>
                    <p>{booking.details.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{booking.details.email}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dates</p>
                <div className="flex items-center text-slate-900 font-bold">
                  <Calendar size={18} className="mr-3 text-indigo-600" />
                  <span>{booking.details.checkIn} - {booking.details.checkOut}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col justify-center items-center text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Amount Paid</p>
              <p className="text-4xl font-black text-indigo-600">₹{(booking.amount || (booking.place.price * 1.05)).toLocaleString()}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Including Taxes & Fees</p>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onBack}
              className="flex-1 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-slate-200"
            >
              <ArrowLeft size={20} />
              <span>Back to Search</span>
            </button>
            <div className="flex gap-4">
              <button className="w-16 h-16 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-all border border-slate-100" title="Download Receipt">
                <Download size={24} />
              </button>
              <button className="w-16 h-16 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-all border border-slate-100" title="Share Booking">
                <Share2 size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 text-center">
          <p className="text-xs font-bold text-slate-400">A confirmation email has been sent to {booking.details.email}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingConfirmation;
