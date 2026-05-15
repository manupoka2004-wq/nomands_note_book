import React from 'react';
import { Sparkles, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activePage: string;
  setActivePage: (page: any) => void;
  navItems: any[];
  user: any;
  handleLogout: () => void;
}

export default function DesktopSidebar({ 
  isOpen, 
  setIsOpen, 
  activePage, 
  setActivePage, 
  navItems,
  user,
  handleLogout 
}: SidebarProps) {
  return (
    <aside 
      className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-40 relative h-full ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="p-6 flex items-center justify-between">
        {isOpen ? (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200 text-white font-black text-xs">
              TM
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">TripMaker</span>
          </div>
        ) : (
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto shadow-lg shadow-indigo-200 text-white font-black text-xs">
            TM
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
        {navItems.filter(item => !item.adminOnly || user?.role === 'admin').map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center ${
              isOpen ? 'px-4' : 'justify-center'
            } py-3 rounded-xl transition-all ${
              activePage === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title={item.label}
          >
            <item.icon size={20} className={isOpen ? 'mr-3' : ''} />
            {isOpen && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${
            isOpen ? 'px-4' : 'justify-center'
          } py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group`}
          title="Logout"
        >
          <LogOut size={20} className={isOpen ? 'mr-3' : ''} />
          {isOpen && <span className="font-bold text-sm">Logout</span>}
        </button>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="mt-4 w-full h-8 flex items-center justify-center text-slate-300 hover:text-slate-600 transition-colors"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </aside>
  );
}
