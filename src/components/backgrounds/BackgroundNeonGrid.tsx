import React from 'react';
import { motion } from 'motion/react';

export const BackgroundNeonGrid: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10 bg-slate-950">
      {/* Perspective Grid */}
      <div 
        className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#6366f1_1px,transparent_1px),linear-gradient(to_bottom,#6366f1_1px,transparent_1px)] bg-size-[60px_60px] mask-[linear-gradient(to_bottom,transparent,black)] transform-[perspective(500px)_rotateX(60deg)_translateY(-100px)_scale(2)] origin-top"
      />

      {/* Moving Neon Lines */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: "100%" }}
            animate={{ y: "-100%" }}
            transition={{
              duration: 4 + i * 1.5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.8
            }}
            className="absolute left-0 right-0 h-0.5 bg-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.6)] transform-[perspective(500px)_rotateX(60deg)_translateY(-100px)_scale(2.5)] origin-top"
          />
        ))}
      </div>

      {/* Soft Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-linear-to-t from-indigo-500/10 to-transparent blur-3xl" />
    </div>
  );
};

// export default BackgroundNeonGrid;
