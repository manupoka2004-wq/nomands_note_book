import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, RefreshCw, AlertTriangle, ShieldAlert, Zap, Eye, Focus, Maximize2, Volume2 } from 'lucide-react';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onCapture: () => void;
  onClose: () => void;
  isStreamActive: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({ videoRef, onCapture, onClose, isStreamActive }) => {
  const [showSOS, setShowSOS] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const lastTap = useRef<number>(0);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setShowSOS(true);
      // In a real app, this would trigger emergency services
      console.log("SOS TRIGGERED!");
    }
    lastTap.current = now;
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }
    focusTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
    }, 2000);
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
    // In a real implementation, this would control camera flash
  };

  return (
    <div className="fixed inset-0 z-100 bg-black flex flex-col" onClick={handleDoubleTap}>
      <div className="relative flex-1 bg-slate-900 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* SOS Overlay */}
        <AnimatePresence>
          {showSOS && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-red-600/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-12 text-center"
            >
              <ShieldAlert size={120} className="text-white mb-8 animate-pulse" />
              <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">EMERGENCY SOS</h2>
              <p className="text-white/80 text-xl font-medium mb-12 max-w-md">
                Alerting local authorities and nearest embassy with your GPS coordinates.
              </p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSOS(false);
                }}
                className="px-12 py-4 bg-white text-red-600 font-black rounded-full uppercase tracking-widest hover:bg-red-50 transition-colors"
              >
                Cancel Alert
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay Controls */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <button 
            onClick={onClose}
            className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
            aria-label="Close camera"
            title="Close camera"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3 h-3 animate-pulse" />
              Live AI Lens
            </div>
            {isStreamActive && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-medium">Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Camera Controls */}
        <div className="absolute top-24 right-6 flex flex-col gap-3">
          <button 
            onClick={handleFocus}
            className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all hover:scale-110"
            title="Auto Focus"
            aria-label="Auto Focus"
          >
            <Focus className="w-5 h-5" />
          </button>
          <button 
            onClick={toggleFlash}
            className={`p-3 backdrop-blur-md rounded-full transition-all hover:scale-110 ${
              flashEnabled 
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title="Toggle Flash"
            aria-label="Toggle Flash"
          >
            <Zap className="w-5 h-5" />
          </button>
          <button 
            className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all hover:scale-110"
            title="Camera Settings"
            aria-label="Camera Settings"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Capture Button */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-8">
          <div className="flex items-center gap-4 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <Eye className="w-4 h-4 text-white/70" />
            <span className="text-xs text-white/90 font-medium">AI Detection Active</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onCapture}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-white/20 group relative"
            aria-label="Capture image"
            title="Capture image"
          >
            <div className="w-16 h-16 border-4 border-slate-900 rounded-full flex items-center justify-center group-hover:scale-95 transition-transform">
              <Camera className="w-8 h-8 text-slate-900" />
            </div>
            {/* Capture ring animation */}
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-white opacity-0"
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
          </motion.button>
          <div className="text-center">
            <div className="text-xs text-white/70 font-medium">Tap for capture</div>
            <div className="text-[10px] text-white/50">Double-tap for SOS</div>
          </div>
        </div>

        {/* Viewfinder corners */}
        <div className="absolute inset-12 pointer-events-none border-2 border-white/20 rounded-3xl">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />
          
          {/* Focus indicator */}
          <AnimatePresence>
            {isFocused && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                className="absolute inset-0 border-2 border-green-400 rounded-3xl"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-green-400 rounded-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Flash overlay */}
        {flashEnabled && (
          <div className="absolute inset-0 bg-white/20 pointer-events-none animate-pulse" />
        )}
      </div>
    </div>
  );
};

export default CameraView;
