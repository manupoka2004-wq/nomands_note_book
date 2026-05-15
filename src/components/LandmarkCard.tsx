import React from 'react';
import { Landmark, Info, ExternalLink } from 'lucide-react';
import { GlassCard } from './glass/GlassCard';
import { LandmarkInfo } from '../services/travelService';

interface LandmarkCardProps {
  landmark: LandmarkInfo | null;
}

export const LandmarkCard: React.FC<LandmarkCardProps> = ({ landmark }) => {
  if (!landmark) return null;

  return (
    <GlassCard className="h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Landmark className="w-5 h-5 text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Landmark Info</h3>
      </div>

      <div className="space-y-6">
        {landmark.thumbnail && (
          <div className="aspect-video rounded-2xl overflow-hidden border border-white/10">
            <img 
              src={landmark.thumbnail} 
              alt={landmark.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        
        <div>
          <h4 className="text-2xl font-black text-white mb-3">{landmark.title}</h4>
          <p className="text-slate-400 leading-relaxed text-sm">
            {landmark.extract}
          </p>
        </div>

        <a 
          href={`https://en.wikipedia.org/?curid=${landmark.pageid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all"
          title={`Read more about ${landmark.title} on Wikipedia`}
        >
          Read more on Wikipedia <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </GlassCard>
  );
};

// export default LandmarkCard;
