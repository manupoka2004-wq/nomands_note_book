import React from 'react';
import { motion } from 'motion/react';
import { Map, Calendar, TrendingUp, Users, ArrowUpRight, Sparkles } from 'lucide-react';

export default function DesktopDashboard() {
  const stats = [
    { label: 'Total Trips', value: '12', icon: Map, color: 'bg-blue-500' },
    { label: 'Upcoming', value: '3', icon: Calendar, color: 'bg-indigo-500' },
    { label: 'Miles Traveled', value: '8.4k', icon: TrendingUp, color: 'bg-emerald-500' },
    { label: 'Connections', value: '154', icon: Users, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200/20`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-end justify-between mt-1">
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
              <ArrowUpRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Active Bookings Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Itineraries</h2>
              <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">View All</button>
            </div>
            <div className="space-y-4">
              {[1, 2].map((id) => (
                <div key={id} className="flex items-center p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all cursor-pointer group">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mr-6">
                    <Map className="text-indigo-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-black text-slate-900">Summer in Bali Expedition</h4>
                    <p className="text-sm text-slate-500 font-medium">Uluwatu • Canggu • Ubud</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-indigo-600">85% Complete</p>
                    <div className="w-32 h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                      <div className="w-[85%] h-full bg-indigo-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="space-y-8">
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
            <Sparkles className="absolute top-4 right-4 text-white/20 w-24 h-24 rotate-12" />
            <h3 className="text-2xl font-black mb-4 relative z-10">Premium Plan</h3>
            <p className="text-indigo-100 mb-8 relative z-10 font-medium">Unlock priority booking & safety monitoring for your next solo adventure.</p>
            <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all relative z-10">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
