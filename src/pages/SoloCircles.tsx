
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Compass, 
  MessageCircle, 
  Plus, 
  Search, 
  Info, 
  Globe, 
  Share2,
  TrendingUp,
  Award,
  Zap,
  Shield,
  QrCode,
  X
} from 'lucide-react';
import { GlassCard } from '../components/glass/GlassCard';
import { Section } from '../components/layout/Section';
import { BackgroundAurora } from '../components/backgrounds/BackgroundAurora';
import { SafetyEmergency } from '../components/SafetyEmergency';
import { QRDisplay } from '../components/QRDisplay';
import { QRScanner } from '../components/QRScanner';
import { SoloCircle, EmergencyContact } from '../types/soloCircles';
import { getCircles, createCircle, joinCircle } from '../services/circleService';
import { ChatWindow } from '../components/chat/ChatWindow';
import toast from 'react-hot-toast';

// Mock/Fallback data based on Tabiji & LonelyRoad concepts
const MOCK_DESTINATIONS = [
  { id: '1', name: 'Chiang Mai Old City', vibe: 'Cultural', image: 'https://images.unsplash.com/photo-1590001158193-e4896796c9e8?auto=format&fit=crop&q=80', distance: '1.2 km' },
  { id: '2', name: 'Doi Suthep Nature Trail', vibe: 'Adventure', image: 'https://images.unsplash.com/photo-1528181304800-2f1408198f29?auto=format&fit=crop&q=80', distance: '5.4 km' },
  { id: '3', name: 'Nimman Co-working Cafe', vibe: 'Chill', image: 'https://images.unsplash.com/photo-1521017432531-fbd92d744264?auto=format&fit=crop&q=80', distance: '0.8 km' },
];

const MOCK_ACTIVITIES = [
  { id: '1', title: 'Sunset Photography Walk', time: '17:30 Today', icon: Zap, members: 8 },
  { id: '2', title: 'Rooftop Yoga Session', time: '08:00 Tomorrow', icon: Zap, members: 12 },
  { id: '3', title: 'Digital Nomad Networking', time: '19:00 Friday', icon: Zap, members: 25 },
];

const REDDIT_PICKS = [
  { id: '1', title: 'Best Brunch Spot for meeting people', spot: 'The Larder', tips: 'Try the avocado toast, great community table.', redditSource: 'r/thailand' },
  { id: '2', title: 'Underrated Temple View', spot: 'Wat Umong', tips: 'Go early, the tunnels are magical.', redditSource: 'r/solotravel' },
];

const NEARBY_TRAVELERS = [
  { id: '1', name: 'Alex', interests: ['Hiking', 'Tech', 'Food'], distance: '500m', active: true },
  { id: '2', name: 'Sarah', interests: ['Yoga', 'Photography'], distance: '1.2km', active: false },
  { id: '3', name: 'Marco', interests: ['History', 'Coffee'], distance: '300m', active: true },
];

export default function SoloCircles() {
  const [activeTab, setActiveTab] = useState<'discover' | 'social' | 'circles' | 'safety'>('discover');
  const [isLoading, setIsLoading] = useState(true);
  const [circles, setCircles] = useState<SoloCircle[]>([]);
  const [showCreateCircle, setShowCreateCircle] = useState(false);
  const [selectedCircleForQR, setSelectedCircleForQR] = useState<SoloCircle | null>(null);
  const [activeChatCircle, setActiveChatCircle] = useState<SoloCircle | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [newCircle, setNewCircle] = useState<{ name: string; activity: string; type: 'public' | 'private' }>({ name: '', activity: '', type: 'public' });
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { name: 'Home Base', phone: '+1234567890', relation: 'Family' },
    { name: 'Local Support', phone: '+9876543210', relation: 'Embassy' }
  ]);

  useEffect(() => {
    const fetchCircles = async () => {
      setIsLoading(true);
      try {
        const data = await getCircles();
        // If data is empty, we keep empty or use mock if preferred, 
        // but for now let's just use what service gives (which is currently empty)
        setCircles(data);
      } catch (error) {
        toast.error('Failed to load circles');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCircles();
  }, []);

  const handleCreateCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCircle.name || !newCircle.activity) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const circle = await createCircle({
        name: newCircle.name,
        activity: newCircle.activity,
        type: newCircle.type,
        creator: 'You',
        lat: 18.7883, // Mock Chiang Mai
        lng: 98.9853,
      });

      setCircles([circle, ...circles]);
      setShowCreateCircle(false);
      setNewCircle({ name: '', activity: '', type: 'public' });
      toast.success('Your SoloCircle has been created!');
    } catch (error) {
      toast.error('Failed to create circle');
    }
  };

  const handleJoinCircle = async (circleId: string) => {
    try {
      const success = await joinCircle(circleId);
      if (success) {
        toast.success('Joined circle!');
        const circle = circles.find(c => c.id === circleId);
        if (circle) setActiveChatCircle(circle);
      }
    } catch (error) {
      toast.error('Failed to join circle');
    }
  };

  const addContact = (contact: EmergencyContact) => {
    setContacts([...contacts, contact]);
    toast.success('Emergency contact added');
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <Section background={<BackgroundAurora />}>
        <div className="max-w-6xl mx-auto pt-10 px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs mb-3 md:mb-4"
              >
                <Compass className="w-3 h-3 md:w-4 md:h-4" /> Built for Explorers
              </motion.div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-none text-white">
                Solo<span className="bg-linear-to-r from-indigo-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">Circles.</span>
              </h1>
              <p className="text-slate-400 mt-2 md:mt-4 text-base md:text-xl max-w-xl font-medium">
                Discover destinations, join spontaneous mini-groups, and connect with fellow solo travelers nearby.
              </p>
            </div>
            
              <div className="flex bg-white/5 backdrop-blur-xl border border-white/10 p-1 rounded-2xl overflow-x-auto no-scrollbar">
                {(['discover', 'social', 'circles', 'safety'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    title={`Switch to ${tab} tab`}
                    className={`px-4 md:px-6 py-2 md:py-3 rounded-xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      activeTab === tab 
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                        : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'discover' && (
              <motion.div
                key="discover"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid gap-12"
              >
                {/* Nearby Destinations Section */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                      <MapPin className="text-indigo-400" /> Nearby Destinations
                    </h2>
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Globe className="w-3 h-3" /> Powered by Tabiji.ai
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {MOCK_DESTINATIONS.map((dest) => (
                      <motion.div 
                        key={dest.id}
                        whileHover={{ y: -10 }}
                        className="group"
                      >
                        <GlassCard className="p-0 overflow-hidden border-white/5" variant="glowing">
                          <div className="aspect-video relative overflow-hidden">
                            <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute top-4 left-4">
                              <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/20">
                                {dest.vibe}
                              </span>
                            </div>
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors">{dest.name}</h3>
                            <div className="flex items-center justify-between mt-4">
                              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                <Compass className="w-3 h-3" /> {dest.distance} away
                              </span>
                              <button 
                                className="text-indigo-400 p-2 hover:bg-indigo-500/10 rounded-full transition-colors"
                                title="Share destination"
                                aria-label="Share destination"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Reddit Curated Picks */}
                <div className="grid md:grid-cols-2 gap-8">
                  <GlassCard variant="default" className="p-8">
                    <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-tighter">
                      <TrendingUp className="text-orange-500" /> Reddit Curated Picks
                    </h2>
                    <div className="space-y-6">
                      {REDDIT_PICKS.map(pick => (
                        <div key={pick.id} className="bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">{pick.redditSource}</span>
                          </div>
                          <h4 className="text-lg font-black text-white mb-2">{pick.spot}</h4>
                          <p className="text-sm text-slate-400 mb-4">{pick.title}</p>
                          <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 italic text-xs text-orange-200/70 leading-relaxed">
                            "{pick.tips}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>

                  <GlassCard variant="default" className="p-8">
                    <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-tighter">
                      <Zap className="text-cyan-400" /> Local Activities
                    </h2>
                    <div className="space-y-6">
                      {MOCK_ACTIVITIES.map(act => (
                        <div key={act.id} className="flex items-center gap-6 p-4 rounded-3xl hover:bg-white/5 transition-all cursor-pointer">
                          <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 shrink-0">
                            <act.icon className="w-8 h-8 text-cyan-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-black text-white">{act.title}</h4>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{act.time}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex -space-x-2">
                              {[1,2,3].map(i => (
                                <div key={i} className="w-6 h-6 border-2 border-slate-900 rounded-full bg-slate-800" />
                              ))}
                            </div>
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mt-2">+{act.members} joined</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>

                {/* Country Insights */}
                <GlassCard className="p-12 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-12 opacity-5">
                    <Info size={180} />
                  </div>
                  <div className="relative z-10 grid md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                      <h2 className="text-5xl font-black text-white tracking-tighter leading-none mb-4">Thailand</h2>
                      <div className="flex items-center gap-2 text-indigo-400">
                        <Globe className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Country Insights</span>
                      </div>
                    </div>
                    <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { label: 'Currency', value: 'THB (Baht)' },
                        { label: 'Language', value: 'Thai' },
                        { label: 'Driving', value: 'Left Side' },
                        { label: 'TimeZone', value: 'GMT+7' },
                      ].map((item, i) => (
                        <div key={i}>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
                          <p className="text-lg font-black text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>

                {/* GetOutTrip Embed Placeholder */}
                <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-[3rem]">
                   <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">AI Trip Ideas</h3>
                   <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">Explore auto-generated nature getaways and city breaks from Chiang Mai.</p>
                   <button className="px-8 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-indigo-300 transition-all flex items-center gap-2 mx-auto">
                     Explore on GetOutTrip <Zap className="w-4 h-4" />
                   </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'social' && (
              <motion.div
                key="social"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div className="text-center mb-12">
                   <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-4">Travelers Around You</h2>
                   <p className="text-slate-400">LonelyRoad helps you find like-minded explorers in your immediate vicinity.</p>
                </div>

                <div className="grid gap-6">
                  {NEARBY_TRAVELERS.map(traveler => (
                    <GlassCard key={traveler.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className={`relative w-16 h-16 rounded-full overflow-hidden border-2 ${traveler.active ? 'border-emerald-500' : 'border-white/10'}`}>
                             <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white font-black text-xl">
                               {traveler.name[0]}
                             </div>
                             {traveler.active && (
                               <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950" />
                             )}
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-white">{traveler.name}</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">{traveler.distance} away</p>
                            <div className="flex flex-wrap gap-2">
                              {traveler.interests.map(interest => (
                                <span key={interest} className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/5">
                                  {interest}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button 
                          className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-white/10 border border-white/5"
                          title="Message traveler"
                          aria-label="Message traveler"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </GlassCard>
                  ))}
                </div>

                <div className="mt-12 p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[3rem] text-center">
                   <Award className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                   <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Social Discovery Badge</h4>
                   <p className="text-sm text-slate-400 max-w-sm mx-auto">Connect with 5 travelers this week to earn the "Early Nomads" enthusiast badge!</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'circles' && (
              <motion.div
                key="circles"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                  <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Spontaneous Circles</h2>
                    <p className="text-slate-400">The lightweight social layer for immediate meetups.</p>
                  </div>
                  <div className="flex bg-white/5 backdrop-blur-xl border border-white/10 p-1 rounded-2xl shrink-0">
                    <button 
                      onClick={() => setShowScanner(true)}
                      className="px-4 py-3 rounded-xl bg-white/10 text-white transition-all flex items-center gap-2"
                      title="Scan QR to join"
                    >
                      <QrCode className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Scan to Join</span>
                    </button>
                  </div>
                  <button 
                    onClick={() => setShowCreateCircle(true)}
                    className="px-8 py-4 bg-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-2xl shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Start a Circle
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {circles.length === 0 && (
                    <div className="md:col-span-3 py-20 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-[3.5rem]">
                       <Users className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                       <h3 className="text-2xl font-black text-slate-500 uppercase tracking-tighter">No active circles</h3>
                       <p className="text-slate-600 mt-2">Be the first to start a movement in this area.</p>
                    </div>
                  )}
                  {circles.map(circle => (
                    <GlassCard key={circle.id} className="p-8 group relative" variant="glowing">
                      <div className="absolute top-4 right-4 flex gap-2">
                         <button 
                           onClick={() => setSelectedCircleForQR(circle)}
                           className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                           title="Show QR Code"
                         >
                           <QrCode size={14} />
                         </button>
                         <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${circle.type === 'private' ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-black'}`}>
                           {circle.type}
                         </span>
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2 leading-none">{circle.name}</h3>
                      <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-6">{circle.activity}</p>
                      
                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2">
                           <Users className="w-4 h-4 text-slate-500" />
                           <span className="text-sm font-black text-white">{circle.members} Traveling</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <button 
                            onClick={() => setActiveChatCircle(circle)}
                            className="text-white/40 hover:text-white transition-colors"
                            title="Open Chat"
                           >
                            <MessageCircle size={18} />
                           </button>
                           <button 
                            onClick={() => handleJoinCircle(circle.id)}
                            className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors"
                           >
                            Join Now
                           </button>
                         </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </motion.div>
            )}
            {activeTab === 'safety' && (
              <motion.div
                key="safety"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-xl mx-auto"
              >
                <SafetyEmergency 
                  contacts={contacts} 
                  onAddContact={addContact} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Section>

      {/* Create Circle Modal */}
      <AnimatePresence>
        {selectedCircleForQR && (
          <QRDisplay 
            circle={selectedCircleForQR} 
            onClose={() => setSelectedCircleForQR(null)} 
          />
        )}
        
        {showScanner && (
          <QRScanner 
            onScan={(id) => {
              handleJoinCircle(id);
              setShowScanner(false);
            }} 
            onClose={() => setShowScanner(false)} 
          />
        )}

        {showCreateCircle && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6 backdrop-blur-2xl bg-slate-950/80">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg"
            >
              <GlassCard className="p-10 border-white/10 shadow-3xl shadow-indigo-500/20">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Start your Circle</h2>
                  <button 
                    onClick={() => setShowCreateCircle(false)} 
                    className="text-slate-500 hover:text-white p-2 hover:bg-white/5 rounded-full transition-all"
                    title="Close"
                    aria-label="Close"
                  >
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleCreateCircle} className="grid gap-6">
                  <div>
                    <label htmlFor="circle-name-input" className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Circle Name</label>
                    <input 
                      id="circle-name-input"
                      type="text" 
                      value={newCircle.name}
                      onChange={(e) => setNewCircle({ ...newCircle, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                      placeholder="e.g. NightWalk Lisbon"
                    />
                  </div>
                  <div>
                    <label htmlFor="circle-activity-input" className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Activity</label>
                    <input 
                      id="circle-activity-input"
                      type="text" 
                      value={newCircle.activity}
                      onChange={(e) => setNewCircle({ ...newCircle, activity: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                      placeholder="e.g. Photography / Coffee / Hiking"
                    />
                  </div>
                  <div className="flex gap-4">
                    {(['public', 'private'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewCircle({ ...newCircle, type: type as 'public' | 'private' })}
                        className={`flex-1 py-3 rounded-xl border transition-all text-xs font-black uppercase tracking-widest ${
                          newCircle.type === type ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-slate-500'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <button className="w-full py-5 bg-indigo-500 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-400 mt-4 transition-all">
                    Launch Circle
                  </button>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeChatCircle && (
          <ChatWindow 
            circle={activeChatCircle} 
            onClose={() => setActiveChatCircle(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

