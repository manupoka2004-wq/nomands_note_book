import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  background: React.ReactNode;
  id?: string;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ children, background, id, className = "" }) => (
  <section id={id} className={`relative min-h-screen flex items-center justify-center py-32 px-6 overflow-hidden ${className}`}>
    {/* Background Layer */}
    <div className="absolute inset-0 z-0">
      {background}
    </div>
    
    {/* Premium Overlays */}
    <div className="absolute inset-0 z-1 bg-grain pointer-events-none" />
    <div className="absolute inset-0 z-2 vignette pointer-events-none" />
    
    {/* Content Layer */}
    <div className="relative z-10 max-w-7xl mx-auto w-full">
      {children}
    </div>
  </section>
);

// export default Section;
