import React, { useState, useRef, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  MapPin, 
  ArrowUpRight, 
  Clock,
  CheckCircle2,
  Camera,
  Sparkles,
  X,
  BrainCircuit,
  Database,
  FileArchive,
  Hotel,
  Plane,
  Car,
  Utensils,
  ArrowLeft
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { recognizeLandmark } from '../lib/gemini';
import { getUserBookings } from '../services/bookingService';
import { Booking, Page } from '../types';
import { formatDistanceToNow } from 'date-fns';
import RideBookingForm from '../components/RideBookingForm';

const data = [
  { name: 'Mon', rides: 40, bookings: 24 },
  { name: 'Tue', rides: 30, bookings: 13 },
  { name: 'Wed', rides: 20, bookings: 98 },
  { name: 'Thu', rides: 27, bookings: 39 },
  { name: 'Fri', rides: 18, bookings: 48 },
  { name: 'Sat', rides: 23, bookings: 38 },
  { name: 'Sun', rides: 34, bookings: 43 },
];

export default function Dashboard({ 
  setActivePage, 
  user, 
  onBookingSuccess 
}: { 
  setActivePage: (page: Page) => void;
  user?: any;
  onBookingSuccess?: (booking: any) => void;
}) {
  const [isLensOpen, setIsLensOpen] = useState(false);
  const [lensResult, setLensResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 1500);
    const fetchBookings = async () => {
      if (user) {
        const userBookings = await getUserBookings(user.id || 'offline_user');
        setBookings(userBookings.slice(0, 5)); // Show only 5 recent
      } else {
        const offlineBookings = await getUserBookings('offline_user');
        setBookings(offlineBookings.slice(0, 5));
      }
      setIsLoadingBookings(false);
    };

    fetchBookings();
    return () => clearTimeout(timer);
  }, [user]);

  const handleBookingSuccess = (booking: any) => {
    if (onBookingSuccess) {
      onBookingSuccess(booking);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'hotel': return Hotel;
      case 'flight': return Plane;
      case 'taxi': return Car;
      case 'restaurant': return Utensils;
      default: return CheckCircle2;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'hotel': return 'indigo';
      case 'flight': return 'violet';
      case 'taxi': return 'emerald';
      case 'restaurant': return 'amber';
      default: return 'slate';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setLensResult(null);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const result = await recognizeLandmark(base64);
        setLensResult(result || 'Could not identify landmark.');
      } catch (error) {
        setLensResult('Error analyzing image.');
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Traveler'}!
          </h2>
          <p className="text-sm md:text-base text-slate-500 mt-1">Here's what's happening with your travel plans today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setActivePage('ai-lens')}
            title="Open AI Lens"
            className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all flex items-center"
          >
            <Camera size={18} className="mr-2" />
            AI Lens
          </button>
          <button 
            onClick={() => setActivePage('travel')}
            title="Create a new booking"
            className="px-4 py-2 bg-indigo-600 rounded-xl text-sm font-medium text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
          >
            New Booking
          </button>
        </div>
      </div>

      {showBookingForm ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setShowBookingForm(false)}
              className="flex items-center text-slate-500 hover:text-indigo-600 font-bold transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Dashboard
            </button>
          </div>
          <RideBookingForm 
            user={user} 
            onSuccess={handleBookingSuccess} 
          />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Spent', value: '₹3,40,250', change: '+12.5%', icon: TrendingUp, color: 'indigo' },
              { label: 'Active Trips', value: '3', change: 'Ongoing', icon: MapPin, color: 'emerald' },
              { label: 'Upcoming', value: '12', change: 'Next 30 days', icon: Calendar, color: 'amber' },
              { label: 'Travel Points', value: '2,840', change: '+450 today', icon: Users, color: 'violet' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 bg-${stat.color}-50 text-${stat.color}-600 rounded-lg`}>
                    <stat.icon size={20} />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Section */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-900">Activity Overview</h3>
                <div className="flex items-center space-x-2">
                  <label htmlFor="dashboard-time-range" className="sr-only">Select time range</label>
                  <select id="dashboard-time-range" className="bg-slate-50 border-none text-sm font-medium text-slate-600 rounded-lg px-3 py-1.5 outline-none" title="Select time range">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                  </select>
                </div>
              </div>
              <div className="h-80 w-full relative min-h-80 overflow-hidden">
                {isReady && (
                  <ResponsiveContainer width="100%" height="100%" debounce={100} minWidth={0} minHeight={320}>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRides" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="rides" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRides)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h3>
              <div className="space-y-6">
                {isLoadingBookings ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : bookings.length > 0 ? (
                  bookings.map((booking) => {
                    const Icon = getIcon(booking.item_type);
                    const color = getColor(booking.item_type);
                    return (
                      <div key={booking.id} className="flex items-start space-x-4">
                        <div className={`mt-1 p-2 bg-${color}-50 text-${color}-600 rounded-lg`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900 line-clamp-1">{booking.item_name}</p>
                          <p className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${booking.status === 'confirmed' ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {booking.status}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10">
                    <p className="text-sm font-medium text-slate-400">No recent activity</p>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setShowBookingForm(true)}
                className="w-full mt-8 py-3 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors" 
                title="View all your recent activity"
              >
                New Booking
              </button>
            </div>
          </div>
        </>
      )}

      {/* New Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Featured Destinations */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg md:text-xl font-bold text-slate-900">Featured Destinations</h3>
            <Sparkles className="text-indigo-600" size={20} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Paris', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80', price: '₹45k' },
              { name: 'Tokyo', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80', price: '₹62k' },
              { name: 'Bali', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80', price: '₹28k' },
              { name: 'Dubai', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80', price: '₹35k' },
            ].map((dest, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden cursor-pointer">
                <img 
                  src={dest.img} 
                  alt={dest.name} 
                  className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
                  <p className="text-white font-bold text-sm">{dest.name}</p>
                  <p className="text-white/80 text-[10px]">Starting from {dest.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Travel Assistant */}
        <div className="bg-indigo-900 p-6 md:p-8 rounded-[2rem] md:rounded-3xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/10">
              <BrainCircuit size={24} className="text-indigo-300" />
            </div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight mb-2">AI Travel Assistant</h3>
            <p className="text-indigo-200 text-sm font-medium mb-8">
              Get personalized recommendations for your next trip based on your interests and budget.
            </p>
            <button 
              onClick={() => setActivePage('ai-planner')}
              className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-all flex items-center text-sm md:text-base"
            >
              Plan with AI
              <ArrowUpRight size={18} className="ml-2" />
            </button>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -right-5 -top-5 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}
