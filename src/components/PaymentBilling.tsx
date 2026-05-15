import React from 'react';
import { motion } from 'motion/react';
import { Receipt, Info } from 'lucide-react';

interface BillingSectionProps {
  basePrice: number;
  itemType: 'hotel' | 'ride' | 'restaurant';
  nights?: number;
  guests?: number;
  distance?: number;
}

export const BillingSection: React.FC<BillingSectionProps> = ({ 
  basePrice, 
  itemType, 
  nights = 1, 
  guests = 1,
  distance
}) => {
  const quantityLabel = itemType === 'hotel' ? 'nights' : itemType === 'ride' ? 'ride' : 'guests';
  const quantityValue = itemType === 'hotel' ? nights : itemType === 'ride' ? 1 : guests;
  
  const subtotal = itemType === 'hotel' ? basePrice * nights : itemType === 'ride' ? basePrice : basePrice * guests;
  const tax = subtotal * 0.12; // 12% GST
  const serviceFee = subtotal * 0.05; // 5% Service Fee
  const total = subtotal + tax + serviceFee;

  return (
    <div className="bg-slate-50 rounded-[2rem] p-6 space-y-4 border border-slate-100">
      <div className="flex items-center space-x-2 text-slate-900 mb-2">
        <Receipt size={18} className="text-indigo-600" />
        <h4 className="font-black text-sm uppercase tracking-widest">Billing Summary</h4>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-500 uppercase tracking-widest">
            {itemType === 'hotel' ? `Base Price (${nights} nights)` : itemType === 'ride' ? 'Ride Fare' : `Price for ${guests} guests`}
          </span>
          <span className="text-slate-900">₹{subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-xs font-bold">
          <div className="flex items-center text-slate-500 uppercase tracking-widest">
            <span>GST (12%)</span>
            <Info size={12} className="ml-1 opacity-50 cursor-help" />
          </div>
          <span className="text-slate-900">₹{tax.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-500 uppercase tracking-widest">Service Fee (5%)</span>
          <span className="text-slate-900">₹{serviceFee.toLocaleString()}</span>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
          <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Total Amount</span>
          <span className="text-2xl font-black text-indigo-600">₹{total.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-white/50 rounded-xl p-3 border border-slate-100 flex items-start space-x-2">
        <Info size={14} className="text-indigo-500 mt-0.5 shrink-0" />
        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
          Prices are inclusive of all taxes. Final confirmation will be sent to your registered email.
        </p>
      </div>
    </div>
  );
};
