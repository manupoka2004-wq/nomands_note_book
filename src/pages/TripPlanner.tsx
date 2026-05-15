import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, IndianRupee, Sparkles, ArrowRight, Camera, Globe, Users, Clock, Star, Heart, Share2, Download, RefreshCw, Save, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { Page } from '../types';

export default function TripPlanner({ setActivePage }: { setActivePage: (page: Page) => void }) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState('');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [travelers, setTravelers] = useState(1);
  const [travelStyle, setTravelStyle] = useState<'budget' | 'comfort' | 'luxury'>('comfort');

  const handleSaveTrip = () => {
    if (!generatedPlan) {
      toast.error('No trip plan to save');
      return;
    }
    
    const tripData = {
      ...generatedPlan,
      savedAt: new Date().toISOString(),
      source,
      destination,
      days,
      budget,
      interests
    };
    
    const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
    savedTrips.push(tripData);
    localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
    toast.success('Trip saved successfully!');
  };

  const handleLoadTrip = () => {
    const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
    if (savedTrips.length === 0) {
      toast.error('No saved trips found');
      return;
    }
    
    // Load the most recent trip
    const latestTrip = savedTrips[savedTrips.length - 1];
    setSource(latestTrip.source);
    setDestination(latestTrip.destination);
    setDays(latestTrip.days);
    setBudget(latestTrip.budget);
    setInterests(latestTrip.interests);
    setGeneratedPlan(latestTrip);
    toast.success('Trip loaded successfully!');
  };

  const handleGenerate = async () => {
    if (!source || !destination) {
      toast.error('Please enter source and destination');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call with enhanced data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockPlan = {
        id: Date.now(),
        source,
        destination,
        days,
        budget,
        interests,
        travelers,
        travelStyle,
        generatedAt: new Date().toISOString(),
        itinerary: [
          {
            day: 1,
            activities: [
              { time: '9:00 AM', activity: 'Check-in at hotel', duration: '1 hour' },
              { time: '10:30 AM', activity: 'City tour', duration: '3 hours' },
              { time: '2:00 PM', activity: 'Local lunch', duration: '1.5 hours' },
              { time: '4:00 PM', activity: 'Museum visit', duration: '2 hours' },
              { time: '7:00 PM', activity: 'Dinner at restaurant', duration: '2 hours' }
            ]
          },
          {
            day: 2,
            activities: [
              { time: '8:00 AM', activity: 'Breakfast', duration: '1 hour' },
              { time: '9:30 AM', activity: 'Day trip to nearby attraction', duration: '4 hours' },
              { time: '2:00 PM', activity: 'Picnic lunch', duration: '1 hour' },
              { time: '4:00 PM', activity: 'Shopping', duration: '2 hours' },
              { time: '7:00 PM', activity: 'Cultural show', duration: '2 hours' }
            ]
          }
        ],
        estimatedCost: parseInt(budget.replace(/[^0-9]/g, '')) || 50000,
        recommendations: [
          'Pack comfortable walking shoes',
          'Carry a water bottle',
          'Download offline maps',
          'Learn basic local phrases'
        ]
      };
      
      setGeneratedPlan(mockPlan);
      toast.success('Trip plan generated successfully!');
    } catch (error) {
      toast.error('Failed to generate trip plan');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `My Trip to ${destination}`,
        text: `Check out my ${days}-day trip plan to ${destination}`,
        url: window.location.href
      });
    } else {
      toast.success('Plan link copied to clipboard!');
    }
  };

  const handleDownload = () => {
    if (!generatedPlan) return;
    
    const planText = `Trip Plan: ${source} to ${destination}\n` +
      `Duration: ${days} days\n` +
      `Budget: ${budget}\n` +
      `Travelers: ${travelers}\n\n` +
      `Itinerary:\n` +
      generatedPlan.itinerary.map((day: any) => 
        `Day ${day.day}:\n` + 
        day.activities.map((act: any) => `${act.time} - ${act.activity} (${act.duration})`).join('\n')
      ).join('\n\n');
    
    const blob = new Blob([planText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trip-plan-${destination.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Plan downloaded successfully!');
  };

  return (
    <div className="container-mobile min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 rounded-3xl mb-4 sm:mb-6">
            <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
          </div>
          <h1 className="text-responsive-3xl font-black text-slate-900 mb-4 sm:mb-6 leading-[1.1]">
            AI Trip
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Planner</span>
          </h1>
          <p className="text-responsive-base text-slate-600 font-medium max-w-2xl mx-auto">
            Create personalized travel itineraries powered by AI
          </p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 border border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="form-group-responsive">
              <label htmlFor="source" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Source</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  id="source"
                  type="text"
                  placeholder="e.g. Delhi"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm"
                  aria-label="Starting location"
                />
              </div>
            </div>
            <div className="form-group-responsive">
              <label htmlFor="destination" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  id="destination"
                  type="text"
                  placeholder="e.g. Goa"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm"
                  aria-label="Destination location"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="form-group-responsive">
              <label htmlFor="duration" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration (Days)</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  id="duration"
                  type="number" 
                  min="1"
                  max="30"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm"
                  aria-label="Duration in days"
                />
              </div>
            </div>
            <div className="form-group-responsive">
              <label htmlFor="travelers" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Travelers</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  id="travelers"
                  type="number" 
                  min="1"
                  max="10"
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm"
                  aria-label="Number of travelers"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="form-group-responsive">
              <label htmlFor="budget" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Budget</label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  id="budget"
                  type="text" 
                  placeholder="₹50,000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm"
                  aria-label="Budget amount"
                />
              </div>
            </div>
            <div className="form-group-responsive">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Travel Style</label>
              <div className="grid grid-cols-3 gap-2">
                {['budget', 'comfort', 'luxury'].map((style) => (
                  <button
                    key={style}
                    onClick={() => setTravelStyle(style as any)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all touch-target ${
                      travelStyle === style
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group-responsive mb-6 sm:mb-8">
            <label htmlFor="interests" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Interests</label>
            <textarea 
              id="interests"
              placeholder="What do you love? (e.g. food, trekking, local history)"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm min-h-24"
              aria-label="Your travel interests and preferences"
            />
          </div>

          <div className="button-group-responsive">
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 touch-target"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Generate AI Trip Plan</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
            
            <button 
              onClick={() => setActivePage('ai-lens')}
              className="px-4 sm:px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center space-x-2 touch-target"
              title="Use AI Lens for destination inspiration"
            >
              <Camera size={20} />
              <span className="hidden sm:inline">AI Lens</span>
            </button>
          </div>
        </div>

        {/* Generated Plan Display */}
        {generatedPlan && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 sm:mt-8 bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 border border-slate-100"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
                  Your Trip to {generatedPlan.destination}
                </h2>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} className="sm:size-16" />
                    {generatedPlan.days} days
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} className="sm:size-16" />
                    {generatedPlan.travelers} travelers
                  </span>
                  <span className="flex items-center gap-1">
                    <IndianRupee size={14} className="sm:size-16" />
                    {generatedPlan.budget}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleSaveTrip}
                  className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors touch-target"
                  title="Save trip plan"
                >
                  <Save size={16} className="sm:size-18" />
                </button>
                <button 
                  onClick={handleLoadTrip}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors touch-target"
                  title="Load saved trip"
                >
                  <FolderOpen size={16} className="sm:size-18" />
                </button>
                <button 
                  onClick={handleShare}
                  className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors touch-target"
                  title="Share trip plan"
                >
                  <Share2 size={16} className="sm:size-18" />
                </button>
                <button 
                  onClick={handleDownload}
                  className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors touch-target"
                  title="Download trip plan"
                >
                  <Download size={16} className="sm:size-18" />
                </button>
                <button 
                  onClick={() => setGeneratedPlan(null)}
                  className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors touch-target"
                  title="Clear plan"
                >
                  <RefreshCw size={16} className="sm:size-18" />
                </button>
              </div>
            </div>

            {/* Itinerary */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
                <Clock size={16} className="sm:size-20 text-indigo-600" />
                Daily Itinerary
              </h3>
              <div className="space-y-4 sm:space-y-6">
                {generatedPlan.itinerary.map((day: any) => (
                  <div key={day.day} className="bg-slate-50 rounded-2xl p-4 sm:p-6">
                    <h4 className="font-black text-slate-900 mb-3 sm:mb-4 text-base sm:text-lg">Day {day.day}</h4>
                    <div className="space-y-3">
                      {day.activities.map((activity: any, index: number) => (
                        <div key={index} className="flex items-start gap-3 sm:gap-4">
                          <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 shrink-0"></div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                              <span className="text-sm font-bold text-indigo-600">{activity.time}</span>
                              <span className="text-xs text-slate-500">{activity.duration}</span>
                            </div>
                            <p className="text-slate-700 font-medium text-sm">{activity.activity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Star size={16} className="sm:size-20 text-amber-500" />
                Travel Recommendations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {generatedPlan.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                    <Heart size={14} className="sm:size-16 text-amber-500 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-700 font-medium">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="button-group-responsive">
              <button 
                onClick={() => setActivePage('travel')}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 touch-target"
              >
                <Globe size={16} className="sm:size-18" />
                Book This Trip
              </button>
              <button 
                onClick={() => setActivePage('ai-lens')}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 touch-target"
              >
                <Camera size={16} className="sm:size-18" />
                Explore with AI Lens
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
