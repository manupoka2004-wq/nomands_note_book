import React from 'react';
import { motion } from 'motion/react';
import { Box, Tag, Sparkles } from 'lucide-react';
import { GlassCard } from './glass/GlassCard';
import { DetectionResult } from '../services/visionService';

interface ObjectCardProps {
  objects: DetectionResult[];
}

export const ObjectCard: React.FC<ObjectCardProps> = ({ objects }) => {
  if (objects.length === 0) return null;

  return (
    <GlassCard className="h-full overflow-hidden relative group" variant="glowing" glowColor="indigo">
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles className="w-24 h-24 text-indigo-400" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
            <Box className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">Visual Intelligence</h3>
            <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Object Recognition</p>
          </div>
        </div>

        <div className="grid gap-4">
          {objects.map((obj, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group/item"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform">
                  <Tag className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="font-black text-lg text-slate-100 tracking-tight">{obj.label}</span>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-xs font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  {Math.round(obj.score * 100)}% Match
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

// export default ObjectCard;
