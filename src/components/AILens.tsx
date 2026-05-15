import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, RefreshCw, ArrowLeft, Sparkles, User, Briefcase, Map, Compass, Heart, Zap, Eye, Clock, Globe, Languages, Scan } from 'lucide-react';
import CameraView from './CameraView';
import ImageUploader from './ImageUploader';
import DetectionResults from './DetectionResults';
import { useCamera } from '../hooks/useCamera';
import { useVision } from '../hooks/useVision';
import { BackgroundAurora } from './backgrounds/BackgroundAurora';
import { Section } from './layout/Section';

type TravelerIdentity = 'Backpacker' | 'Luxury' | 'Adventure' | 'Culture Seeker' | 'Foodie';

const IDENTITIES: { type: TravelerIdentity, icon: any, color: string }[] = [
  { type: 'Backpacker', icon: Map, color: 'text-emerald-400' },
  { type: 'Luxury', icon: Briefcase, color: 'text-amber-400' },
  { type: 'Adventure', icon: Compass, color: 'text-blue-400' },
  { type: 'Culture Seeker', icon: Heart, color: 'text-purple-400' },
  { type: 'Foodie', icon: Sparkles, color: 'text-orange-400' },
];

export const AILens: React.FC = () => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<Blob | null>(null);
  const [identity, setIdentity] = useState<TravelerIdentity>('Culture Seeker');
  const [showTips, setShowTips] = useState(true);
  const [captureCount, setCaptureCount] = useState(0);
  
  const { videoRef, startCamera, stopCamera, captureImage, isStreaming, error: cameraError } = useCamera();
  const vision = useVision();

  const imageUrl = useMemo(() => {
    if (!capturedImage) return null;
    return URL.createObjectURL(capturedImage);
  }, [capturedImage]);

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const handleCapture = async () => {
    const blob = await captureImage();
    if (blob) {
      setCapturedImage(blob);
      setCaptureCount(prev => prev + 1);
      setIsCameraOpen(false);
      stopCamera();
      vision.processImage(blob);
    }
  };

  const handleUpload = (blob: Blob) => {
    setCapturedImage(blob);
    vision.processImage(blob);
  };

  const handleReset = () => {
    setCapturedImage(null);
    vision.reset();
  };

  useEffect(() => {
    if (isCameraOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isCameraOpen, startCamera, stopCamera]);

  return (
    <div className="container-mobile min-h-screen bg-slate-900 text-white relative overflow-hidden">
      <BackgroundAurora />
      
      <div className="relative z-10">
        <Section background={false}>
          {!isCameraOpen && !capturedImage && (
            <div className="text-center space-responsive-6">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-3 text-indigo-400 font-black uppercase tracking-[0.3em] text-xs mb-4 sm:mb-6"
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" /> The Future of Vision
              </motion.div>
              <h1 className="text-responsive-3xl font-black tracking-tighter leading-none mb-4 sm:mb-8">
                AI <span className="bg-linear-to-r from-indigo-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">Lens.</span>
              </h1>
              <p className="text-responsive-base text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                Point your camera at the world to identify objects, translate text to English, and discover landmarks in real-time.
              </p>

              {/* Feature Pills */}
              <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-3">
                {[
                  { name: 'Object Detection', icon: Scan, color: 'indigo' },
                  { name: 'English Translation', icon: Languages, color: 'cyan' },
                  { name: 'Landmark Recognition', icon: Globe, color: 'emerald' },
                  { name: 'Real-time AI', icon: Zap, color: 'purple' },
                ].map((feature, i) => (
                  <div key={i} className={`flex items-center gap-2 px-3 sm:px-4 py-2 bg-${feature.color}-500/10 rounded-full border border-${feature.color}-500/20`}>
                    <feature.icon className="w-3 h-3 sm:w-4 sm:h-4 text-${feature.color}-400" />
                    <span className="text-xs font-bold text-${feature.color}-300">{feature.name}</span>
                  </div>
                ))}
              </div>

              {/* Tips Card */}
              {showTips && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 sm:mt-8 max-w-2xl mx-auto p-3 sm:p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center shrink-0">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
                      </div>
                      <div className="text-xs sm:text-sm">
                        <p className="text-indigo-300 font-bold mb-1">Pro Tips for Best Results</p>
                        <ul className="text-indigo-200/80 text-xs space-y-1">
                          <li>• Ensure good lighting for accurate detection</li>
                          <li>• Hold camera steady for 2-3 seconds</li>
                          <li>• Capture text at a readable distance</li>
                          <li>• Double-tap camera view for emergency SOS</li>
                        </ul>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowTips(false)}
                      className="text-indigo-400 hover:text-indigo-300 transition-colors touch-target p-1"
                      title="Dismiss tips"
                      aria-label="Dismiss tips"
                    >
                      <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 rotate-45" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Identity Selector */}
              <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-3 sm:gap-4">
                {IDENTITIES.map((id) => (
                  <button
                    key={id.type}
                    onClick={() => setIdentity(id.type)}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full border transition-all flex items-center gap-2 touch-target ${
                      identity === id.type 
                        ? 'bg-white/10 border-white/20 text-white shadow-xl shadow-white/5' 
                        : 'bg-transparent border-white/5 text-slate-500 hover:border-white/10'
                    }`}
                  >
                    <id.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm font-bold">{id.type}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mt-8 sm:mt-12">
                <motion.button 
                  whileHover={{ y: -5 }}
                  onClick={() => setIsCameraOpen(true)}
                  className="relative group cursor-pointer w-full text-left"
                  title="Open live camera"
                  aria-label="Open live camera"
                >
                  <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-600 rounded-[2rem] sm:rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative aspect-square sm:aspect-auto sm:h-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2rem] sm:rounded-3xl flex flex-col items-center justify-center gap-4 sm:gap-6 p-8 sm:p-12 transition-all group-hover:border-indigo-500/50">
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-indigo-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="w-8 h-8 sm:w-12 sm:h-12 text-indigo-400" />
                      </div>
                      <motion.div 
                        className="absolute inset-0 rounded-full border-2 border-indigo-400 opacity-0"
                        animate={{ 
                          scale: [1, 1.2, 1.4], 
                          opacity: [0, 0.5, 0] 
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          ease: "easeOut" 
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight flex items-center justify-center gap-2">
                        Live Camera 
                        <div className="flex items-center justify-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-xs sm:text-sm text-green-400 font-normal">AI Ready</span>
                        </div>
                      </h2>
                      <p className="text-slate-400 font-medium text-sm sm:text-base">Point and identify in real-time</p>
                      {captureCount > 0 && (
                        <p className="text-xs text-slate-500 mt-2">{captureCount} photos analyzed</p>
                      )}
                    </div>
                  </div>
                </motion.button>

                <ImageUploader onUpload={handleUpload} />
              </div>
            </div>
          )}
        </Section>
      </div>

      <AnimatePresence mode="wait">
        {!isCameraOpen && capturedImage && (
          <DetectionResults key="results" state={vision} image={imageUrl} />
        )}
      </AnimatePresence>

      {/* Camera Modal */}
      <AnimatePresence>
        {isCameraOpen && (
          <CameraView
            videoRef={videoRef}
            onCapture={handleCapture}
            onClose={() => setIsCameraOpen(false)}
            isStreamActive={isStreaming}
          />
        )}
      </AnimatePresence>

      {/* Error Display */}
      {cameraError && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-full text-red-200 text-sm font-bold max-w-[90%] text-center">
          {cameraError}
        </div>
      )}
    </div>
  );
};

export default AILens;
