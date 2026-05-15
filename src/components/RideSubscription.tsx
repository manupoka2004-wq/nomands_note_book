import React from 'react';
import { motion } from 'motion/react';
import { Zap, CheckCircle2, Star, ShieldCheck } from 'lucide-react';
import { SubscriptionPlan } from '../types';

const PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'TripMaker Pass',
    price: 199,
    discount: 10,
    benefits: ['10% off on all rides', 'Priority booking', 'Free cancellation']
  },
  {
    id: 'pro',
    name: 'TripMaker Elite',
    price: 499,
    discount: 25,
    benefits: ['25% off on all rides', 'Zero surge pricing', 'Premium support', 'Airport lounge access']
  }
];

const RideSubscription: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Subscription Plans</h2>
          <p className="text-slate-500 font-medium text-sm">Save more with monthly passes.</p>
        </div>
        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
          <Zap size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {PLANS.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ y: -4 }}
            className={`p-6 rounded-[2rem] border-2 relative overflow-hidden transition-all ${
              plan.id === 'pro' 
                ? 'border-indigo-500 bg-indigo-50/30' 
                : 'border-slate-100 bg-white'
            }`}
          >
            {plan.id === 'pro' && (
              <div className="absolute top-0 right-0 bg-indigo-500 text-white px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest">
                Best Value
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">{plan.name}</h3>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-slate-900">₹{plan.price}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">/ month</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${plan.id === 'pro' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                {plan.id === 'pro' ? <Star size={20} /> : <ShieldCheck size={20} />}
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-center text-sm font-medium text-slate-600">
                  <CheckCircle2 size={16} className="mr-2 text-emerald-500 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            <button className={`w-full py-4 rounded-2xl font-bold transition-all ${
              plan.id === 'pro'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}>
              Get {plan.name}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RideSubscription;
