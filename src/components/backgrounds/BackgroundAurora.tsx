import React from 'react';
import { motion } from 'motion/react';

export const BackgroundAurora: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10 bg-slate-950">
      {/* Aurora Layers */}
      <motion.div
        animate={{
          x: [-100, 100, -100],
          y: [-50, 50, -50],
          scale: [1, 1.2, 1],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -top-[20%] -left-[10%] w-[120%] h-[60%] bg-linear-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 blur-[120px] opacity-50"
        style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}
      />
      
      <motion.div
        animate={{
          x: [100, -100, 100],
          y: [50, -50, 50],
          scale: [1.2, 1, 1.2],
          rotate: [0, -10, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -bottom-[20%] -right-[10%] w-[120%] h-[60%] bg-linear-to-l from-purple-500/20 via-pink-500/20 to-indigo-500/20 blur-[120px] opacity-50"
        style={{ borderRadius: '60% 40% 30% 70% / 50% 40% 50% 60%' }}
      />

      {/* Floating Blobs */}
      <motion.div
        animate={{
          y: [0, -100, 0],
          x: [0, 50, 0],
          scale: [1, 1.5, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/3 w-64 h-64 bg-cyan-400/10 rounded-full blur-[80px]"
      />
      
      <motion.div
        animate={{
          y: [0, 100, 0],
          x: [0, -80, 0],
          scale: [1.5, 1, 1.5],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-purple-400/10 rounded-full blur-[100px]"
      />

      {/* Subtle Particles */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5 + 0.2
            }}
            animate={{
              y: [null, "-20%"],
              opacity: [null, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10
            }}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
          />
        ))}
      </div>
    </div>
  );
};

// export default BackgroundAurora;
