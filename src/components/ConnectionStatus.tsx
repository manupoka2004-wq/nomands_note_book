import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {(showStatus || !isOnline) && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100]"
        >
          <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border ${
            isOnline 
              ? 'bg-emerald-500 text-white border-emerald-400' 
              : 'bg-amber-500 text-white border-amber-400'
          }`}>
            {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
            <div className="flex flex-col">
              <span className="font-black text-xs uppercase tracking-widest">
                {isOnline ? 'Online Mode' : 'Offline Mode'}
              </span>
              <span className="text-[10px] font-medium opacity-90">
                {isOnline 
                  ? 'Connected to travel APIs' 
                  : 'Using local project dataset'}
              </span>
            </div>
            {!isOnline && (
              <div className="ml-2 p-1 bg-white/20 rounded-lg">
                <AlertCircle size={14} />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
