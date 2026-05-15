import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Calendar, 
  Newspaper, 
  MapPin, 
  Lightbulb, 
  Loader2, 
  AlertCircle,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { getLiveDestinationInsights } from '../lib/gemini';

interface LiveInsightsProps {
  destination: string;
}

export const LiveInsights: React.FC<LiveInsightsProps> = ({ destination }) => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (destination) {
      fetchInsights();
    }
  }, [destination]);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLiveDestinationInsights(destination);
      setInsights(data);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
      setError('Could not load real-time insights.');
    } finally {
      setLoading(false);
    }
  };

  if (!destination) return null;

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
      <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap size={24} className="text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">Live Insights</h3>
            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">Real-time Search Grounding</p>
          </div>
        </div>
        {loading && <Loader2 className="animate-spin" size={20} />}
      </div>

      <div className="p-6 space-y-8">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <p className="text-slate-500 font-bold animate-pulse">Scanning the web for {destination}...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center space-y-4">
            <AlertCircle className="mx-auto text-red-500" size={40} />
            <p className="text-slate-600 font-medium">{error}</p>
            <button 
              onClick={fetchInsights}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm"
            >
              Try Again
            </button>
          </div>
        ) : insights ? (
          <div className="space-y-8">
            {/* Events */}
            <section className="space-y-4">
              <h4 className="flex items-center text-sm font-black text-slate-900 uppercase tracking-widest">
                <Calendar className="mr-2 text-indigo-600" size={18} />
                Happening Now
              </h4>
              <div className="space-y-3">
                {insights.events?.length > 0 ? (
                  insights.events.map((event: any, i: number) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all group">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{event.name}</p>
                        <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">{event.date}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{event.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 font-medium italic">No major events found for this week.</p>
                )}
              </div>
            </section>

            {/* News & Advisories */}
            <section className="space-y-4">
              <h4 className="flex items-center text-sm font-black text-slate-900 uppercase tracking-widest">
                <Newspaper className="mr-2 text-red-600" size={18} />
                Travel News
              </h4>
              <div className="space-y-3">
                {insights.news?.length > 0 ? (
                  insights.news.map((item: any, i: number) => (
                    <div key={i} className="p-4 bg-red-50/30 rounded-2xl border border-red-100">
                      <p className="font-bold text-slate-900 text-sm mb-1">{item.headline}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{item.source}</span>
                        <p className="text-[10px] text-slate-500 font-medium">{item.summary}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 font-medium italic">No critical travel news found.</p>
                )}
              </div>
            </section>

            {/* Trending Spots */}
            <section className="space-y-4">
              <h4 className="flex items-center text-sm font-black text-slate-900 uppercase tracking-widest">
                <MapPin className="mr-2 text-emerald-600" size={18} />
                Trending Nearby
              </h4>
              <div className="flex flex-wrap gap-2">
                {insights.trending_spots?.map((spot: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black border border-emerald-100 flex items-center">
                    {spot}
                    <ChevronRight size={12} className="ml-1 opacity-50" />
                  </span>
                ))}
              </div>
            </section>

            {/* Local Tips */}
            <section className="space-y-4">
              <h4 className="flex items-center text-sm font-black text-slate-900 uppercase tracking-widest">
                <Lightbulb className="mr-2 text-amber-500" size={18} />
                Pro Traveler Tips
              </h4>
              <ul className="space-y-3">
                {insights.local_tips?.map((tip: string, i: number) => (
                  <li key={i} className="flex items-start space-x-3 text-xs text-slate-600 font-medium">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 font-medium italic">
            Enter a destination to see live insights.
          </div>
        )}
      </div>
      
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
          Powered by Google Search
          <ExternalLink size={10} className="ml-1" />
        </p>
      </div>
    </div>
  );
};
