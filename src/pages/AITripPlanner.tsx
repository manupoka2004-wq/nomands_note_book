import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  BrainCircuit, 
  Loader2, 
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Map as MapIcon,
  Hotel,
  Lightbulb,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateSimpleItinerary } from '../lib/gemini';
import toast from 'react-hot-toast';
import { Page } from '../types';

export default function AITripPlanner({ setActivePage }: { setActivePage: (page: Page) => void }) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState('₹50000');
  const [interests, setInterests] = useState('food, temples, historical sites');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const handleGenerate = async () => {
    if (!destination) {
      toast.error("Please enter a destination");
      return;
    }
    setLoading(true);
    try {
      const result = await generateSimpleItinerary(destination, days, budget, interests, source);
      setPlan(result);
      toast.success("Itinerary generated successfully!");
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('429')) {
        toast.error("AI capacity reached (429). Please wait a minute and try again.");
      } else {
        toast.error("Failed to generate itinerary. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const viewOnMap = () => {
    // Navigate to route planner with params
    const params = new URLSearchParams({
      source: source || 'current location',
      destination: destination
    });
    window.history.pushState({}, '', `?${params.toString()}`);
    setActivePage('route-planner');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">AI Trip Planner</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intelligent Itinerary Generator</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center">
              <BrainCircuit className="text-indigo-600 mr-2" size={20} />
              Customize Your Trip
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Starting Point</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="e.g. Mumbai"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" size={16} />
                  <input 
                    type="text" 
                    placeholder="e.g. Goa"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="duration-input" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration (Days)</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="number" 
                      min="1"
                      max="30"
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      placeholder="Enter duration"
                      aria-label="Duration in days"
                      id="duration-input"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Budget</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="₹50,000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Interests</label>
                <textarea 
                  placeholder="What do you love? (e.g. food, trekking, local history)"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm min-h-25"
                />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Analyzing Vibes...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Create Itinerary</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {plan && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl"
            >
              <h4 className="text-xl font-black mb-4 flex items-center">
                <MapIcon className="text-amber-400 mr-2" size={24} />
                Map Integration
              </h4>
              <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">
                Want to see the shortest driving path and interesting spots along the way?
              </p>
              <button 
                onClick={viewOnMap}
                className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black flex items-center justify-center space-x-2 hover:bg-slate-100 transition-all"
              >
                <span>View Route on Map</span>
                <ArrowRight size={18} />
              </button>
            </motion.div>
          )}
        </div>

        {/* Results Section */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!plan && !loading ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center space-y-6"
              >
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner">
                  <BrainCircuit className="text-slate-200" size={48} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Your AI Planner is Ready</h3>
                  <p className="text-slate-500 font-medium max-w-sm mt-2">Enter your destination and preferences to generate a personalized, day-by-day travel plan.</p>
                </div>
              </motion.div>
            ) : plan ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Summary Card */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                  <div className="relative z-10">
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">Plan Summary</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 capitalize">{destination} Journey</h2>
                    <p className="text-slate-600 font-medium leading-relaxed italic border-l-4 border-indigo-500 pl-4">
                      "{plan.summary || 'A customized adventure designed for your specific interests and budget.'}"
                    </p>
                  </div>
                </div>

                {/* Days Grid */}
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center">
                    <Clock size={16} className="mr-2" />
                    Day-by-Day Itinerary
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    {plan.days?.map((day: any, idx: number) => (
                      <motion.div 
                        key={idx}
                        whileHover={{ y: -5 }}
                        className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-100">
                              {day.day}
                            </div>
                            <h4 className="text-lg font-black text-slate-900">Day {day.day} Plan</h4>
                          </div>
                          <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            Optimized
                          </div>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                            {day.plan}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Additional Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Hotels */}
                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-black text-slate-900 mb-6 flex items-center">
                      <Hotel className="text-indigo-600 mr-2" size={18} />
                      Curated Stays
                    </h4>
                    <div className="space-y-4">
                      {plan.hotels?.map((hotel: any, i: number) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <h5 className="font-black text-slate-900 text-sm mb-1">{hotel.name}</h5>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{hotel.area || 'Top Rated'}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-indigo-600">{hotel.price || '₹3500'}/night</span>
                            <div className="flex items-center space-x-1">
                              <CheckCircle2 size={12} className="text-emerald-500" />
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{hotel.rating ? `${hotel.rating} Stars` : 'Safe Pick'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Smart Tips */}
                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-black text-slate-900 mb-6 flex items-center">
                      <Lightbulb className="text-amber-500 mr-2" size={18} />
                      Insider Insights
                    </h4>
                    <div className="space-y-3">
                      {plan.tips?.map((tip: string, i: number) => (
                        <div key={i} className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                          <TrendingUp size={16} className="text-slate-300 mt-0.5" />
                          <p className="text-xs font-bold text-slate-600 leading-relaxed">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                <p className="font-black text-slate-900">Crafting your unique adventure...</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
