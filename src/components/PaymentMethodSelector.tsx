import React from 'react';
import { Smartphone, CreditCard, Landmark, Wallet, Check } from 'lucide-react';

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

const METHODS = [
  { id: 'upi', name: 'UPI', icon: Smartphone, description: 'Pay via GPay, PhonePe, PayTM' },
  { id: 'card', name: 'Card', icon: CreditCard, description: 'Debit / Credit Cards' },
  { id: 'netbanking', name: 'Net Banking', icon: Landmark, description: 'Direct from Bank' },
  { id: 'wallet', name: 'Wallet', icon: Wallet, description: 'Amazon Pay, Ola Money etc' },
] as const;

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Choose Payment Method</h3>
      <div className="grid grid-cols-1 gap-3">
        {METHODS.map((method) => (
          <button
            key={method.id}
            onClick={() => onSelect(method.id as PaymentMethod)}
            className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
              selected === method.id 
                ? 'border-indigo-500 bg-indigo-50/30 text-indigo-600' 
                : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl transition-all ${
                selected === method.id ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
              }`}>
                <method.icon size={20} />
              </div>
              <div className="text-left">
                <p className="font-black text-sm text-slate-900">{method.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{method.description}</p>
              </div>
            </div>
            {selected === method.id && (
              <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                <Check size={14} strokeWidth={3} />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
