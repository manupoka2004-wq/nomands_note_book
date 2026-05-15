import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  LayoutDashboard, 
  MapPin, 
  Hotel, 
  Navigation,
  ShieldCheck, 
  Users,
  Sparkles
} from 'lucide-react';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import TravelBooking from './pages/TravelBooking';
import HotelPage from './pages/Hotels';
import AITripPlanner from './pages/AITripPlanner';
import RoutePlanner from './pages/RoutePlanner';
import Admin from './pages/Admin';
import EmergencyTracking from './pages/EmergencyTracking';
import SoloCircles from './pages/SoloCircles';
import NotFound from './pages/NotFound';
import { AILens } from './components/AILens';
import LandingPage from './components/LandingPage';
import RideBookingConfirmation from './components/RideBookingConfirmation';
import { ErrorBoundary } from './components/ErrorBoundary';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Page, User as UserType } from './types';
import { Toaster } from 'react-hot-toast';

import { SafetyProvider } from './components/SafetyProvider';
import { SafetySOSButton, SafetyDashboard } from './components/layout/SafetyUI';

// New Imports for Device Separation
import { useDeviceType } from './hooks/useDeviceType';
import MobileLayout from './components/MobileLayout';
import DesktopLayout from './components/DesktopLayout';

const DemoBanner = () => (
  <div className="bg-amber-500 text-white px-4 py-2 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest z-100 sticky top-0 flex items-center justify-center space-x-2">
    <Sparkles size={14} className="animate-pulse" />
    <span>Demo Mode Active</span>
    <Sparkles size={14} className="animate-pulse" />
  </div>
);

export default function App() {
  const { isMobile } = useDeviceType();
  const [user, setUser] = useState<UserType | null>(null);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [showApp, setShowApp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastBooking, setLastBooking] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      if (window.location.pathname.startsWith('/emergency/')) {
        setActivePage('emergency');
        setShowApp(true);
        return;
      }

      if (isSupabaseConfigured()) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userData: UserType = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            phone: session.user.user_metadata?.phone,
            role: session.user.user_metadata?.role || 'user',
            isDemo: false
          };
          setUser(userData);
          setShowApp(true);
          return;
        }
      }

      const savedDemoUser = localStorage.getItem('demo_user');
      if (savedDemoUser) {
        try {
          const userData = JSON.parse(savedDemoUser);
          if (userData && userData.id) {
            setUser(userData);
            setShowApp(true);
            return;
          }
        } catch (e) {
          localStorage.removeItem('demo_user');
        }
      }
    };

    checkSession().finally(() => setIsLoading(false));
    
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const userData: UserType = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            phone: session.user.user_metadata?.phone,
            role: session.user.user_metadata?.role || 'user',
            isDemo: false
          };
          setUser(userData);
          setShowApp(true);
        } else if (_event === 'SIGNED_OUT') {
          setUser((prev: any) => prev?.isDemo ? prev : null);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    if (userData.isDemo) {
      localStorage.setItem('demo_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('demo_user');
    }
    setActivePage('dashboard');
    setShowApp(true);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('demo_user');
    setShowApp(false);
    setActivePage('dashboard');
  };

  const handleBookingSuccess = (booking: any) => {
    setLastBooking(booking);
    setActivePage('booking-confirmation');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'travel', label: 'Book Ride', icon: MapPin },
    { id: 'hotels', label: 'Hotels', icon: Hotel },
    { id: 'solo-circles', label: 'Circles', icon: Users },
    { id: 'ai-planner', label: 'AI Planner', icon: Sparkles },
    { id: 'route-planner', label: 'Route Planner', icon: Navigation },
    { id: 'ai-lens', label: 'AI Lens', icon: Camera },
    { id: 'admin', label: 'Admin', icon: ShieldCheck, adminOnly: true },
  ];

  const renderPage = () => {
    if (!user && activePage !== 'auth') return <Auth onLogin={handleLogin} />;

    switch (activePage) {
      case 'dashboard': return <Dashboard setActivePage={setActivePage} user={user} onBookingSuccess={handleBookingSuccess} />;
      case 'travel': return <TravelBooking setActivePage={setActivePage} user={user} onBookingSuccess={handleBookingSuccess} />;
      case 'hotels': return <HotelPage user={user} onBookingSuccess={handleBookingSuccess} />;
      case 'ai-planner': return <AITripPlanner setActivePage={setActivePage} />;
      case 'route-planner': return <RoutePlanner setActivePage={setActivePage} />;
      case 'ai-lens': return <AILens />;
      case 'solo-circles': return <SoloCircles />;
      case 'admin': return <Admin />;
      case 'auth': return <Auth onLogin={handleLogin} />;
      case 'emergency': return <EmergencyTracking />;
      case 'booking-confirmation': return <RideBookingConfirmation booking={lastBooking} onBack={() => setActivePage('dashboard')} />;
      default: return <NotFound onBack={() => setActivePage('dashboard')} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!showApp) {
    return <LandingPage onLaunch={() => setShowApp(true)} />;
  }

  if (!user && activePage !== 'auth') {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <SafetyProvider user={user}>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-slate-50 relative">
        <DemoBanner />
        
        {isMobile ? (
          <MobileLayout 
            activePage={activePage} 
            setActivePage={setActivePage} 
            navItems={navItems}
          >
            <ErrorBoundary>
              {renderPage()}
            </ErrorBoundary>
          </MobileLayout>
        ) : (
          <DesktopLayout
            activePage={activePage}
            setActivePage={setActivePage}
            navItems={navItems}
            user={user}
            handleLogout={handleLogout}
          >
            <ErrorBoundary>
              {renderPage()}
            </ErrorBoundary>
          </DesktopLayout>
        )}

        <SafetySOSButton />
        <SafetyDashboard />

        <style dangerouslySetInnerHTML={{ __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}} />
      </div>
    </SafetyProvider>
  );
}
