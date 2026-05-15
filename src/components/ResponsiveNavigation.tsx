import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  MapPin, 
  Hotel, 
  Camera,
  Navigation,
  Menu,
  X,
  User,
  LogOut,
  Sparkles,
  Shield,
  Database,
  Users
} from 'lucide-react';
import { Page } from '../types';

interface ResponsiveNavigationProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  user?: any;
  onLogout?: () => void;
}

const navigationItems = [
  { id: 'dashboard' as Page, label: 'Home', icon: LayoutDashboard, color: 'text-slate-600' },
  { id: 'trip-planner' as Page, label: 'Plan', icon: MapPin, color: 'text-purple-600' },
  { id: 'route-planner' as Page, label: 'Route', icon: Navigation, color: 'text-emerald-600' },
  { id: 'travel' as Page, label: 'Book', icon: Hotel, color: 'text-indigo-600' },
  { id: 'hotels' as Page, label: 'Hotels', icon: Hotel, color: 'text-blue-600' },
  { id: 'solo-circles' as Page, label: 'Circles', icon: Users, color: 'text-pink-600' },
  { id: 'ai-planner' as Page, label: 'AI Plan', icon: Sparkles, color: 'text-violet-600' },
  { id: 'ai-lens' as Page, label: 'Lens', icon: Camera, color: 'text-cyan-600' },
  { id: 'emergency' as Page, label: 'Emergency', icon: Shield, color: 'text-red-600' },
  { id: 'admin' as Page, label: 'Admin', icon: Database, color: 'text-orange-600' },
];

export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  activePage,
  setActivePage,
  user,
  onLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (page: Page) => {
    setActivePage(page);
    setIsMobileMenuOpen(false);
  };

  // Mobile Bottom Navigation
  const MobileBottomNav = () => (
    <div className="mobile-nav safe-area-bottom">
      <div className="overflow-x-auto">
        <div className="flex gap-1 px-2 py-1 min-w-max">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`mobile-nav-item transition-colors flex-shrink-0 ${
                  isActive 
                    ? 'text-indigo-600' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title={item.label}
              >
                <Icon 
                  size={20} 
                  className={`transition-transform ${isActive ? 'scale-110' : ''}`}
                />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-white lg:border-r lg:border-slate-200 lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:z-40">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">NOMADS</h1>
              <p className="text-xs text-slate-500">Travel Assistant</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all touch-target ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        {onLogout && (
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all touch-target"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Mobile Header with Hamburger
  const MobileHeader = () => (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 safe-area-top">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-black text-slate-900">NOMADS</h1>
        </div>
        
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors touch-target"
          title="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X size={24} className="text-slate-600" />
          ) : (
            <Menu size={24} className="text-slate-600" />
          )}
        </button>
      </div>
    </div>
  );

  // Mobile Slide-out Menu
  const MobileMenu = () => (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 lg:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-lg font-black text-slate-900">NOMADS</h1>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors touch-target"
                  >
                    <X size={20} className="text-slate-600" />
                  </button>
                </div>
              </div>

              {/* User Info */}
              {user && (
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all touch-target ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-600 font-medium'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Logout */}
              {onLogout && (
                <div className="p-4 border-t border-slate-200">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all touch-target"
                  >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileHeader />
      <MobileMenu />
      <MobileBottomNav />
    </>
  );
};

export default ResponsiveNavigation;
