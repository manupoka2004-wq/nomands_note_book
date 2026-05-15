import React, { useState } from 'react';
import { Place } from '../services/placesService';
import { BookingDetails } from '../types';
import { CheckCircle2, Calendar, Users, CreditCard, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { BillingSection } from './PaymentBilling';
import { PaymentMethodSelector, PaymentMethod } from './PaymentMethodSelector';

interface BookingSummaryProps {
  place: Place;
  bookingDetails: BookingDetails;
  onConfirm: (method: PaymentMethod, total: number) => void;
  isLoading?: boolean;
  paymentMethod?: PaymentMethod;
}

const BookingSummary = ({ place, bookingDetails, onConfirm, isLoading, paymentMethod: externalPaymentMethod }: BookingSummaryProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(externalPaymentMethod || 'upi');
  const nights = place.type === 'hotel' 
    ? Math.max(1, Math.ceil((new Date(bookingDetails.checkOut).getTime() - new Date(bookingDetails.checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;
  
  const subtotal = place.type === 'hotel'
    ? place.price * nights
    : place.price * bookingDetails.guests;

  const tax = subtotal * 0.12;
  const serviceFee = subtotal * 0.05;
  const totalAmount = subtotal + tax + serviceFee;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-black text-slate-900">Booking Summary</h3>
        <p className="text-slate-500 font-medium">Please review your details before confirming.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex items-center space-x-4">
          <img src={place.image} className="w-16 h-16 object-cover rounded-xl" alt={place.name} referrerPolicy="no-referrer" />
          <div>
            <h4 className="font-black text-slate-900">{place.name}</h4>
            <p className="text-xs text-slate-500 font-medium line-clamp-1">{place.address}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dates</p>
            <div className="flex items-center text-xs font-bold text-slate-700">
              <Calendar size={14} className="mr-2 text-indigo-500" />
              {bookingDetails.checkIn} - {bookingDetails.checkOut}
            </div>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Guests</p>
            <div className="flex items-center text-xs font-bold text-slate-700">
              <Users size={14} className="mr-2 text-indigo-500" />
              {bookingDetails.guests} {bookingDetails.guests === 1 ? 'Guest' : 'Guests'}
            </div>
          </div>
        </div>

        <BillingSection 
          basePrice={place.price} 
          itemType={place.type as any} 
          nights={nights}
          guests={bookingDetails.guests}
        />
      </div>

      <button
        onClick={() => onConfirm(paymentMethod, totalAmount)}
        disabled={isLoading}
        className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center space-x-3 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <CreditCard size={20} />
            <span>Pay ₹{Math.round(totalAmount).toLocaleString()} & Confirm Booking</span>
          </>
        )}
      </button>
    </div>
  );
};

export default BookingSummary;
