import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Car, 
  IndianRupee, 
  TrendingUp, 
  ShieldAlert, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Search,
  Filter,
  Hotel,
  Camera
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { fetchAdminStats } from '../services/adminService';

const revenueData = [
  { name: 'Jan', gross: 4000, platform: 800 },
  { name: 'Feb', gross: 3000, platform: 600 },
  { name: 'Mar', gross: 2000, platform: 400 },
  { name: 'Apr', gross: 2780, platform: 556 },
  { name: 'May', gross: 1890, platform: 378 },
  { name: 'Jun', gross: 2390, platform: 478 },
  { name: 'Jul', gross: 3490, platform: 698 },
];

export default function Admin() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
    fetchAdminStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Admin Command Center</h2>
          <p className="text-sm md:text-base text-slate-500">System-wide monitoring and management.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold">Live View</button>
          <button className="flex-1 md:flex-none px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-bold">Analytics</button>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, change: '+14.2%', icon: IndianRupee, color: 'emerald' },
          { label: 'Hotel Bookings', value: stats.hotelBookings.toString(), change: 'Hotels', icon: Hotel, color: 'indigo' },
          { label: 'Taxi Rides', value: stats.taxiBookings.toString(), change: 'Taxis', icon: Car, color: 'indigo' },
          { label: 'Tourist Visits', value: stats.tourismBookings.toString(), change: 'Tourism', icon: Camera, color: 'emerald' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 bg-${stat.color}-50 text-${stat.color}-600 rounded-lg`}>
                <stat.icon size={20} />
              </div>
              <span className="text-xs font-bold text-slate-400">Real-time</span>
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <div className="flex items-end space-x-2 mt-1">
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
              <span className={`text-xs font-bold mb-1 ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-slate-500'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Revenue Stream</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                <span className="text-xs font-bold text-slate-500 uppercase">Gross</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-xs font-bold text-slate-500 uppercase">Net</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full min-h-80 min-w-0">
            {isReady && (
              <ResponsiveContainer width="100%" height="100%" debounce={100} minWidth={0} minHeight={320}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="gross" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="platform" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Driver Management */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Top Drivers</h3>
            <button className="text-indigo-600 text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-6">
            {[
              { name: 'Alex Rivera', rating: 4.9, earnings: '₹1,02,400', status: 'Online', color: 'emerald' },
              { name: 'Sarah Chen', rating: 4.8, earnings: '₹78,400', status: 'Busy', color: 'amber' },
              { name: 'Marcus Bell', rating: 4.7, earnings: '₹68,000', status: 'Offline', color: 'slate' },
              { name: 'Elena Kostic', rating: 4.9, earnings: '₹88,000', status: 'Online', color: 'emerald' },
            ].map((driver, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                    {driver.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{driver.name}</p>
                    <div className="flex items-center text-[10px] text-slate-500">
                      <TrendingUp size={10} className="mr-1" />
                      <span>{driver.rating} Rating</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{driver.earnings}</p>
                  <span className={`text-[10px] font-black uppercase text-${driver.color}-600`}>{driver.status}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="flex items-center space-x-2 text-red-600 mb-2">
              <ShieldAlert size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">System Alerts</span>
            </div>
            <p className="text-xs text-red-700 leading-relaxed">
              3 drivers have been reported for unusual activity in the last 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Recent Bookings</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search bookings..."
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100" title="Filter bookings">
              <Filter size={18} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recentBookings.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                        {row.user_id.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-slate-900">User {row.user_id.substring(0, 5)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 capitalize">{row.item_type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{row.item_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900">₹{row.price.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                      row.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1 text-slate-400 hover:text-slate-900" title="More options">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
