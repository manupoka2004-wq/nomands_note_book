import React from 'react';
import { motion } from 'motion/react';

const LightBeams: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10 bg-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1),rgba(17,24,39,0.8))]" />
      
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ rotate: i * 45, opacity: 0.3 }}
          animate={{ 
            rotate: [i * 45, i * 45 + 360],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 30 + i * 10,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-32 bg-linear-to-r from-transparent via-indigo-500/10 to-transparent blur-3xl"
        />
      ))}

      <motion.div
        animate={{
          x: ['-20%', '120%'],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 bottom-0 w-64 bg-linear-to-r from-transparent via-white/5 to-transparent -skew-x-12 blur-2xl"
      />
    </div>
  );
};

export default LightBeams;
