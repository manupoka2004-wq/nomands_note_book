import React from 'react';
import { motion } from 'motion/react';
import { Languages, Type, Sparkles, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { GlassCard } from './glass/GlassCard';
import { TranslationResult } from '../services/translationService';

interface TranslationCardProps {
  ocrText: string;
  translation: TranslationResult | null;
}

export const TranslationCard: React.FC<TranslationCardProps> = ({ ocrText, translation }) => {
  if (!ocrText) return null;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <GlassCard className="h-full overflow-hidden relative group" variant="glowing" glowColor="cyan">
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
        <Languages className="w-24 h-24 text-cyan-400" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-500/30">
            <Languages className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">Linguistic AI</h3>
            <p className="text-xs font-black text-cyan-400 uppercase tracking-widest">OCR & Translation</p>
          </div>
        </div>
        
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <Type className="w-3 h-3" /> Detected Source
            </div>
            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 text-slate-200 font-medium leading-relaxed italic text-lg shadow-inner">
              "{ocrText}"
            </div>
          </motion.div>

          {translation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">
                    English Translation
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${getConfidenceColor(translation.confidence)}`}>
                      {getConfidenceIcon(translation.confidence)}
                      {Math.round(translation.confidence * 100)}%
                    </span>
                  </div>
                </div>
                <div className="h-px flex-1 bg-linear-to-r from-cyan-500/30 to-transparent" />
              </div>
              
              <div className="space-y-4">
                {translation.detectedLanguage !== 'English' && translation.detectedLanguage !== 'Unknown' && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20 w-fit">
                    <Languages className="w-3 h-3 text-cyan-400" />
                    <span className="text-xs font-bold text-cyan-300">
                      {translation.detectedLanguage} → English
                    </span>
                  </div>
                )}
                
                <div className="p-6 bg-cyan-500/5 rounded-[2rem] border border-cyan-500/20 text-cyan-50 font-black leading-relaxed text-xl shadow-lg shadow-cyan-500/5">
                  {translation.translatedText}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

// export default TranslationCard;
