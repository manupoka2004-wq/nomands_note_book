import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, X, CheckCircle2 } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import jsQR from 'jsqr';
import toast from 'react-hot-toast';

interface QRScannerProps {
  onScan: (circleId: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const { videoRef, startCamera, stopCamera, isStreaming, error } = useCamera();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [startCamera, stopCamera]);

  useEffect(() => {
    const scan = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        if (!canvas) {
          const newCanvas = document.createElement('canvas');
          canvasRef.current = newCanvas;
        }
        
        const currentCanvas = canvasRef.current!;
        const video = videoRef.current;
        currentCanvas.width = video.videoWidth;
        currentCanvas.height = video.videoHeight;
        
        const ctx = currentCanvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, currentCanvas.width, currentCanvas.height);
          const imageData = ctx.getImageData(0, 0, currentCanvas.width, currentCanvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code && code.data.startsWith('nomads-circle:')) {
            const circleId = code.data.replace('nomads-circle:', '');
            setScanResult(circleId);
            toast.success('Circle found!');
            setTimeout(() => onScan(circleId), 1500);
            return; // Stop scanning after success
          }
        }
      }
      requestRef.current = requestAnimationFrame(scan);
    };

    if (isStreaming && !scanResult) {
      requestRef.current = requestAnimationFrame(scan);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isStreaming, scanResult, onScan, videoRef]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 bg-slate-950 flex flex-col"
    >
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        {scanResult ? (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center z-10"
          >
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20">
              <CheckCircle2 size={48} className="text-white" />
            </div>
            <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Joined!</h3>
          </motion.div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover opacity-60"
          />
        )}
        
        {/* Scan Frame */}
        {!scanResult && (
          <div className="absolute inset-x-8 aspect-square max-w-sm mx-auto border-2 border-white/20 rounded-[3rem] flex items-center justify-center">
            <div className="absolute top-0 left-0 w-16 h-16 border-t-8 border-l-8 border-indigo-500 rounded-tl-[2rem]" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-8 border-r-8 border-indigo-500 rounded-tr-[2rem]" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-8 border-l-8 border-indigo-500 rounded-bl-[2rem]" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-8 border-r-8 border-indigo-500 rounded-br-[2rem]" />
            
            <motion.div 
              initial={{ y: -100 }}
              animate={{ y: 300 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-x-0 h-1 bg-linear-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_rgba(99,102,241,1)]"
            />
          </div>
        )}

        {/* Controls */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
          <button 
            onClick={onClose}
            title="Close Scanner"
            className="p-4 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-white/20 transition-all"
          >
            <X size={24} />
          </button>
          <div className="px-6 py-2 bg-indigo-500/20 backdrop-blur-xl border border-indigo-500/30 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
            QR Scanner Active
          </div>
        </div>

        <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center gap-8 z-10">
          <p className="text-white/60 font-medium text-sm tracking-wide">
            Align QR code within the frame to join
          </p>
          {error && <p className="text-rose-500 text-xs font-bold uppercase tracking-widest">{error}</p>}
        </div>
      </div>
    </motion.div>
  );
};
