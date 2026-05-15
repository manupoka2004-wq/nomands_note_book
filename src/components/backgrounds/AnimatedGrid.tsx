import React from 'react';
import { motion } from 'motion/react';

const AnimatedGrid: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10 bg-slate-900">
      {/* Base Grid */}
      <div 
        className="absolute inset-0 opacity-[0.15] grid-pattern"
      />
      
      {/* Animated Glowing Lines */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`h-${i}`}
            initial={{ x: "-100%", y: (i + 1) * 15 + "%" }}
            animate={{ x: "200%" }}
            transition={{
              duration: 8 + Math.random() * 5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2
            }}
            className="absolute h-px w-1/2 bg-linear-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.5)]"
          />
        ))}
        
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`v-${i}`}
            initial={{ y: "-100%", x: (i + 1) * 15 + "%" }}
            animate={{ y: "200%" }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2.5
            }}
            className="absolute w-px h-1/2 bg-linear-to-b from-transparent via-purple-500 to-transparent shadow-[0_0_15px_rgba(168,85,247,0.5)]"
          />
        ))}
      </div>

      {/* Radial Mask */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-900/50 to-slate-900" />
    </div>
  );
};

export default AnimatedGrid;
