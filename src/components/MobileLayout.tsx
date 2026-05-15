import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDeviceType } from '../hooks/useDeviceType';
import MobileNav from '../components/mobile/MobileNav';

interface MobileLayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: any) => void;
  navItems: any[];
}

export default function MobileLayout({ children, activePage, setActivePage, navItems }: MobileLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden md:hidden">
      {/* Mobile Top Bar */}
      <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
            <span className="text-white font-black text-xs">TM</span>
          </div>
          <span className="font-black text-lg tracking-tight text-slate-900">TripMaker</span>
        </div>
      </header>

      {/* Mobile Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav 
        activePage={activePage} 
        setActivePage={setActivePage} 
        navItems={navItems} 
      />
    </div>
  );
}
