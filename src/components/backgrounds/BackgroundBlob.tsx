import React from 'react';
import { motion } from 'motion/react';

export const BackgroundBlob: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10 bg-slate-950">
      <motion.div
        animate={{
          x: [0, 150, -100, 0],
          y: [0, 100, 150, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-125 h-125 bg-indigo-600/10 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          x: [0, -150, 100, 0],
          y: [0, 150, -100, 0],
          scale: [1, 0.9, 1.3, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-1/4 right-1/4 w-150 h-150 bg-purple-600/10 rounded-full blur-[120px]"
      />
      
      {/* Smooth Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-slate-950 via-transparent to-slate-950 opacity-80" />
    </div>
  );
};

// export default BackgroundBlob;
