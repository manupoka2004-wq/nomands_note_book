import React from 'react';
import { motion } from 'motion/react';
import { Section } from './layout/Section';
import { ObjectCard } from './ObjectCard';
import { TranslationCard } from './TranslationCard';
import { LandmarkCard } from './LandmarkCard';
import { VisionState } from '../hooks/useVision';
import { Loader2, AlertCircle } from 'lucide-react';

// Backgrounds for results
import { BackgroundLightBeams } from './backgrounds/BackgroundLightBeams';
import { BackgroundWaves } from './backgrounds/BackgroundWaves';
import { BackgroundSpotlight } from './backgrounds/BackgroundSpotlight';
import { BackgroundShapes } from './backgrounds/BackgroundShapes';

interface DetectionResultsProps {
  state: VisionState;
  image: string | null;
}

export const DetectionResults: React.FC<DetectionResultsProps> = ({ state, image }) => {
  if (state.isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <div className="text-xl font-bold text-white">AI is analyzing your image...</div>
        <div className="text-slate-500 text-sm">Detecting objects, OCR, and landmarks</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-red-400">
        <AlertCircle className="w-12 h-12" />
        <div className="text-xl font-bold">{state.error}</div>
      </div>
    );
  }

  const hasResults = state.objects.length > 0 || state.ocrText || state.landmark;

  if (!hasResults && !image) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      {/* Captured Image Preview Section */}
      {image && (
        <Section background={<BackgroundShapes />}>
          <div className="max-w-3xl mx-auto">
            <div className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 text-center">Captured Input</div>
            <div className="aspect-video rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl shadow-indigo-500/10">
              <img src={image} alt="Captured" className="w-full h-full object-cover" />
            </div>
          </div>
        </Section>
      )}

      {/* Object Detection Section */}
      {state.objects.length > 0 && (
        <Section background={<BackgroundLightBeams />}>
          <div className="max-w-4xl mx-auto">
            <ObjectCard objects={state.objects} />
          </div>
        </Section>
      )}

      {/* OCR & Translation Section */}
      {state.ocrText && (
        <Section background={<BackgroundWaves />}>
          <div className="max-w-4xl mx-auto">
            <TranslationCard ocrText={state.ocrText} translation={state.translation} />
          </div>
        </Section>
      )}

      {/* Landmark Section */}
      {state.landmark && (
        <Section background={<BackgroundSpotlight />}>
          <div className="max-w-4xl mx-auto">
            <LandmarkCard landmark={state.landmark} />
          </div>
        </Section>
      )}
    </motion.div>
  );
};

export default DetectionResults;
