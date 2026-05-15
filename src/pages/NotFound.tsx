import React from 'react';
import { motion } from 'motion/react';
import { Home, Compass } from 'lucide-react';

interface NotFoundProps {
  onBack: () => void;
}

export default function NotFound({ onBack }: NotFoundProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-8 relative"
      >
        <Compass size={64} className="text-indigo-600 animate-spin-slow" />
        <div className="absolute top-0 right-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-black text-xs">
          404
        </div>
      </motion.div>
      
      <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">You've reached an unknown territory</h1>
      <p className="text-slate-500 mb-8 max-w-md font-medium leading-relaxed">
        It seems the path you're looking for doesn't exist in our maps. Our digital nomads are still exploring this area.
      </p>

      <button
        onClick={onBack}
        className="flex items-center space-x-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
      >
        <Home size={20} />
        <span>Return to Dashboard</span>
      </button>
      
      <div className="mt-12 opacity-30 grayscale pointer-events-none">
         <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400" alt="Lost" className="w-64 rounded-3xl" />
      </div>
    </div>
  );
}
