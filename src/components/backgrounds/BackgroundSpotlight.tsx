import React from 'react';
import { motion } from 'motion/react';

export const BackgroundSpotlight: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10 bg-slate-950">
      {/* Moving Spotlight Beams */}
      <motion.div
        animate={{
          x: ['-100%', '200%'],
          rotate: [-15, -25, -15],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 bottom-0 w-[60%] bg-linear-to-r from-transparent via-indigo-500/20 to-transparent -skew-x-12 blur-[120px]"
      />
      
      <motion.div
        animate={{
          x: ['200%', '-100%'],
          rotate: [15, 25, 15],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 bottom-0 w-[40%] bg-linear-to-r from-transparent via-cyan-500/10 to-transparent skew-x-12 blur-[100px]"
      />

      {/* Static Glows */}
      <div className="absolute top-1/4 left-1/4 w-125 h-125 bg-indigo-500/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-125 h-125 bg-purple-500/5 rounded-full blur-[150px]" />
    </div>
  );
};

// export default BackgroundSpotlight;
