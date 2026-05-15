import React from 'react';
import { motion } from 'motion/react';

export const BackgroundLightBeams: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10 bg-slate-950">
      {/* Moving Light Beams */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: "-100%", y: (i * 20) + "%" }}
          animate={{ x: "200%" }}
          transition={{
            duration: 15 + (i * 2),
            repeat: Infinity,
            ease: "linear",
            delay: i * 3
          }}
          className="absolute h-32 w-full bg-linear-to-r from-transparent via-cyan-500/5 to-transparent blur-3xl"
        />
      ))}

      {/* Small Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{
              y: [null, (Math.random() > 0.5 ? "-10%" : "110%")],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full blur-[1px]"
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-radial-gradient from-transparent to-slate-950 opacity-60" />
    </div>
  );
};

// export default BackgroundLightBeams;
