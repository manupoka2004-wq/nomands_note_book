import React from 'react';
import { Menu } from 'lucide-react';

interface MobileNavProps {
  activePage: string;
  setActivePage: (page: any) => void;
  navItems: any[];
}

export default function MobileNav({ activePage, setActivePage, navItems }: MobileNavProps) {
  // Filter items for bottom nav (just major travel items)
  const bottomItems = navItems.filter(item => 
    !['admin', 'ai-planner', 'route-planner', 'ai-lens'].includes(item.id)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6 py-3 flex items-center justify-between z-50 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)]">
      {bottomItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActivePage(item.id)}
          className={`flex flex-col items-center space-y-1 transition-all ${
            activePage === item.id ? 'text-indigo-600 scale-110' : 'text-slate-400'
          }`}
        >
          <item.icon size={20} className={activePage === item.id ? 'fill-indigo-50' : ''} />
          <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
        </button>
      ))}
      <button
        onClick={() => setActivePage(activePage)} // Or open a menu
        className="flex flex-col items-center space-y-1 text-slate-400"
      >
        <Menu size={20} />
        <span className="text-[10px] font-black uppercase tracking-widest">More</span>
      </button>
    </nav>
  );
}
