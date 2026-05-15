import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, User, Bell } from 'lucide-react';
import DesktopSidebar from '../components/desktop/Sidebar';

interface DesktopLayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: any) => void;
  navItems: any[];
  user: any;
  handleLogout: () => void;
}

export default function DesktopLayout({ 
  children, 
  activePage, 
  setActivePage, 
  navItems, 
  user,
  handleLogout 
}: DesktopLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="hidden md:flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <DesktopSidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        activePage={activePage}
        setActivePage={setActivePage}
        navItems={navItems}
        user={user}
        handleLogout={handleLogout}
      />

      {/* Desktop Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {/* Desktop Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-30">
          <div className="flex items-center gap-4">
             <h1 className="text-xl font-black text-slate-900 capitalize tracking-tight">
               {activePage.replace('-', ' ')}
             </h1>
          </div>

          <div className="flex items-center space-x-6">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors" title="Notifications">
              <Bell size={20} />
            </button>
            <div className="flex items-center space-x-3 pl-6 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 leading-none mb-1">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                  {user?.role || 'Traveler'}
                </p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-100">
                <User size={20} className="text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Desktop Page Container */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
