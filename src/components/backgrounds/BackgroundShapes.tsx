import React from 'react';
import { motion } from 'motion/react';

export const BackgroundShapes: React.FC = () => {
  const shapes = [
    { type: 'circle', size: 150, color: 'bg-indigo-500/10' },
    { type: 'square', size: 120, color: 'bg-purple-500/10' },
    { type: 'triangle', size: 140, color: 'bg-cyan-500/10' },
    { type: 'circle', size: 200, color: 'bg-pink-500/10' },
    { type: 'square', size: 180, color: 'bg-blue-500/10' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden -z-10 bg-slate-950">
      {/* Animated Gradient Mesh */}
      <motion.div 
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(79, 70, 229, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)
          `
        }}
      />

      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
            rotate: 0,
            opacity: 0
          }}
          whileInView={{ opacity: 1 }}
          animate={{
            x: [
              (Math.random() * 100) + "%",
              (Math.random() * 100) + "%",
              (Math.random() * 100) + "%"
            ],
            y: [
              (Math.random() * 100) + "%",
              (Math.random() * 100) + "%",
              (Math.random() * 100) + "%"
            ],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{
            duration: 25 + Math.random() * 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute ${shape.color} blur-[1px] border border-white/10`}
          style={{
            width: shape.size,
            height: shape.size,
            borderRadius: shape.type === 'circle' ? '50%' : shape.type === 'triangle' ? '0' : '32px',
            clipPath: shape.type === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none'
          }}
        />
      ))}
    </div>
  );
};

// export default BackgroundShapes;
