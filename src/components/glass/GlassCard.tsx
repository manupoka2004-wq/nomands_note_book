import React from 'react';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  glowColor?: string;
  variant?: 'default' | 'glowing';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = "", 
  delay = 0,
  glowColor = "from-indigo-500/20 via-purple-500/20 to-cyan-500/20",
  variant = 'default'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className={`relative group ${className}`}
    >
      {/* Glow Effect */}
      <div className={`absolute -inset-px bg-linear-to-r ${glowColor} rounded-[2rem] blur-xl transition-opacity duration-500 ${variant === 'glowing' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
      
      {/* Main Card */}
      <div className={`relative h-full bg-white/5 backdrop-blur-[20px] border rounded-[2rem] p-8 shadow-2xl overflow-hidden transition-all duration-500 ${variant === 'glowing' ? 'border-indigo-500/50 shadow-indigo-500/20' : 'border-white/10 group-hover:border-white/20'}`}>
        {/* Subtle Shine */}
        <div className="absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
        {children}
      </div>
    </motion.div>
  );
};

// export default GlassCard;
