import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Globe, 
  Zap, 
  Star, 
  MessageSquare,
  Shield,
  BarChart3,
  Mail,
  Github,
  Twitter,
  Linkedin,
  MapPin,
  Hotel,
  Compass,
  Camera,
  Sparkles,
  Plane,
  Car,
  Clock,
  Navigation,
  BrainCircuit,
  Search,
  ShieldCheck
} from 'lucide-react';

// Backgrounds
import { BackgroundAurora } from './backgrounds/BackgroundAurora';
import { BackgroundBlob } from './backgrounds/BackgroundBlob';
import { BackgroundLightBeams } from './backgrounds/BackgroundLightBeams';
import { BackgroundShapes } from './backgrounds/BackgroundShapes';
import { BackgroundNetwork } from './backgrounds/BackgroundNetwork';
import { BackgroundWaves } from './backgrounds/BackgroundWaves';
import { BackgroundSpotlight } from './backgrounds/BackgroundSpotlight';
import { BackgroundStarfield } from './backgrounds/BackgroundStarfield';
import { BackgroundNeonGrid } from './backgrounds/BackgroundNeonGrid';
import { GlassCard } from './glass/GlassCard';
import { Section } from './layout/Section';

export default function LandingPage({ onLaunch }: { onLaunch: () => void }) {
  return (
    <div className="bg-slate-950 text-slate-100 selection:bg-indigo-500/30 font-sans antialiased">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 px-8 py-3 rounded-full flex items-center gap-8 shadow-2xl shadow-black/50"
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <div className="text-xl font-black tracking-tighter text-white">
              TripMaker
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-400">
            <a href="#planner" className="hover:text-white transition-colors">Planner</a>
            <a href="#rides" className="hover:text-white transition-colors">Rides</a>
            <a href="#hotels" className="hover:text-white transition-colors">Hotels</a>
            <a href="#ai-lens" className="hover:text-white transition-colors">AI Lens</a>
            <a href="#dashboard" className="hover:text-white transition-colors">Dashboard</a>
            <a href="#discovery" className="hover:text-white transition-colors">Discovery</a>
            <a href="#safety" className="hover:text-white transition-colors">Safety</a>
          </div>
          <button 
            onClick={onLaunch}
            className="bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20"
          >
            Launch App
          </button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <Section background={<BackgroundAurora />}>
        <div className="text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlassCard className="inline-block mb-8 p-0! rounded-full! overflow-hidden" delay={0.2}>
              <span className="px-6 py-2 text-xs font-black tracking-[0.2em] uppercase bg-white/5 text-indigo-300 block">
                The Future of Intelligent Travel
              </span>
            </GlassCard>
            <h1 className="text-7xl md:text-9xl font-black mb-10 leading-[0.9] tracking-tighter">
              Travel <br />
              <span className="bg-linear-to-r from-indigo-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">Reimagined.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              Your all-in-one AI travel companion. Plan itineraries, book rides, 
              find premium hotels, and explore the world with AI-powered vision.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={onLaunch}
                className="group relative bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl text-lg font-bold flex items-center gap-3 transition-all shadow-2xl shadow-indigo-600/40 overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                Start Your Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={onLaunch}
                className="bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-xl text-white px-10 py-5 rounded-2xl text-lg font-bold transition-all"
              >
                Explore Features
              </button>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Stats Section */}
      <div className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Happy Travelers", value: "2.5M+", icon: Globe },
            { label: "Countries Covered", value: "190+", icon: MapPin },
            { label: "AI Recommendations", value: "500M+", icon: Sparkles },
            { label: "Partner Hotels", value: "850K+", icon: Hotel }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <stat.icon className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="text-3xl md:text-4xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Trip Planner Section */}
      <Section id="planner" background={<BackgroundBlob />}>
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-8">
              <BrainCircuit className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-10 leading-[1.1] tracking-tight">
              AI-Powered <br />
              <span className="text-indigo-400">Trip Planning.</span>
            </h2>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed font-medium">
              Tell us your dreams, and our AI will craft the perfect itinerary. 
              From budget-friendly backpacking to luxury escapes, we optimize 
              every moment of your journey.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { title: "Smart Itineraries", desc: "Optimized routes and schedules based on your preferences." },
                { title: "Budget Control", desc: "Real-time cost estimation and expense tracking." },
                { title: "Local Insights", desc: "Hidden gems and local favorites suggested by AI." },
                { title: "Group Sync", desc: "Collaborate with friends on a single master plan." }
              ].map((item, i) => (
                <GlassCard key={i} delay={i * 0.1} className="p-6!">
                  <h4 className="text-lg font-bold mb-2 text-white">{item.title}</h4>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </GlassCard>
              ))}
            </div>
          </motion.div>
          <div className="relative">
            <GlassCard className="aspect-square flex items-center justify-center p-12!" delay={0.4}>
              <div className="relative w-full h-full flex items-center justify-center">
                <Compass className="w-48 h-48 text-indigo-400 drop-shadow-[0_0_30px_rgba(129,140,248,0.5)] animate-pulse-slow" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dashed border-indigo-500/20 rounded-full"
                />
              </div>
            </GlassCard>
          </div>
        </div>
      </Section>

      {/* Ride Booking Section */}
      <Section id="rides" background={<BackgroundLightBeams />}>
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1 relative">
            <GlassCard className="aspect-video flex items-center justify-center p-0! overflow-hidden" delay={0.2}>
              <div className="w-full h-full bg-slate-900/50 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/1200/800')] bg-cover bg-center opacity-20" />
                <div className="absolute top-8 left-8 bg-cyan-500/20 backdrop-blur-md px-4 py-2 rounded-full border border-cyan-500/30 flex items-center gap-2 z-10">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Live Simulation</span>
                </div>
                <Car className="w-32 h-32 text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] z-10" />
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-10">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Estimated Arrival</div>
                    <div className="text-xl font-black text-white">4 mins</div>
                  </div>
                  <div className="bg-cyan-500 p-4 rounded-xl shadow-lg shadow-cyan-500/20">
                    <Navigation className="text-slate-950 w-6 h-6" />
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="order-1 lg:order-2"
          >
            <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-8">
              <MapPin className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-10 leading-[1.1] tracking-tight">
              Seamless <br />
              <span className="text-cyan-400">Ride Booking.</span>
            </h2>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed font-medium">
              Get where you need to go with ease. Our integrated ride-hailing 
              service connects you with premium drivers in seconds. Track your 
              ride in real-time on our immersive glass map.
            </p>
            <div className="space-y-4">
              {[
                { icon: Clock, title: "Instant Booking", desc: "One-tap ride requests with minimal wait times." },
                { icon: ShieldCheck, title: "Verified Drivers", desc: "Safety first with our rigorous driver screening process." },
                { icon: Navigation, title: "Real-time Tracking", desc: "Watch your driver approach on our high-precision map." }
              ].map((feature, i) => (
                <div key={i} className="flex items-start space-x-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{feature.title}</h4>
                    <p className="text-sm text-slate-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Hotel Booking Section */}
      <Section id="hotels" background={<BackgroundShapes />}>
        <div className="text-center mb-24">
          <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-8 mx-auto">
            <Hotel className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">Curated Stays</h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto font-medium">
            Discover the world's most beautiful hotels, handpicked by our AI 
            to match your unique travel style and preferences.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { img: "https://picsum.photos/seed/hotel1/800/600", title: "Luxury Resorts", price: "From $450" },
            { img: "https://picsum.photos/seed/hotel2/800/600", title: "Boutique Stays", price: "From $180" },
            { img: "https://picsum.photos/seed/hotel3/800/600", title: "Urban Escapes", price: "From $220" }
          ].map((hotel, i) => (
            <GlassCard key={i} delay={i * 0.2} className="p-0! overflow-hidden group">
              <div className="aspect-4/3 overflow-hidden">
                <img 
                  src={hotel.img} 
                  alt={hotel.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2">{hotel.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-purple-400 font-bold">{hotel.price}</span>
                  <button onClick={onLaunch} className="text-sm font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Book Now</button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* AI Lens Section */}
      <Section id="ai-lens" background={<BackgroundNetwork />}>
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-8">
              <Camera className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-10 leading-[1.1] tracking-tight">
              AI Lens: <br />
              <span className="text-emerald-400">Visual Search.</span>
            </h2>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed font-medium">
              Point your camera at any landmark, menu, or sign. Our AI Lens 
              instantly identifies locations, translates text, and provides 
              real-time historical context.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-2xl font-black text-emerald-400 mb-1">99.8%</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recognition Accuracy</div>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-2xl font-black text-emerald-400 mb-1">100+</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Languages Supported</div>
              </div>
            </div>
          </motion.div>
          <div className="relative">
            <GlassCard className="aspect-square flex items-center justify-center p-0! overflow-hidden" delay={0.4}>
              <div className="w-full h-full relative">
                <img 
                  src="https://picsum.photos/seed/travel/1000/1000" 
                  alt="AI Lens View" 
                  className="w-full h-full object-cover opacity-40"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-emerald-400/50 rounded-3xl relative">
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-400/30 animate-scan" />
                  </div>
                </div>
                <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="text-emerald-400 w-5 h-5" />
                    <span className="font-bold text-white">Identifying: Eiffel Tower, Paris</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </Section>

      {/* Smart Dashboard Section */}
      <Section id="dashboard" background={<BackgroundWaves />}>
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1">
            <GlassCard className="p-8! bg-slate-900/40" delay={0.2}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <Star className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-white font-bold">Upcoming Trip</div>
                    <div className="text-xs text-slate-500">Tokyo, Japan • 3 days left</div>
                  </div>
                </div>
                <div className="text-indigo-400 font-black">75% Plan Ready</div>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Flight to NRT", time: "10:30 AM", status: "Confirmed" },
                  { label: "Park Hyatt Tokyo", time: "02:00 PM", status: "Check-in" },
                  { label: "Sushi Dinner", time: "07:30 PM", status: "Reserved" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-white font-medium">{item.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white">{item.time}</div>
                      <div className="text-[10px] text-indigo-400 uppercase font-black">{item.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="order-1 lg:order-2"
          >
            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-8">
              <BarChart3 className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-10 leading-[1.1] tracking-tight">
              Your Personal <br />
              <span className="text-indigo-400">Travel Hub.</span>
            </h2>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed font-medium">
              Manage all your bookings, itineraries, and travel documents in 
              one beautiful, unified dashboard. Get real-time updates and 
              personalized recommendations based on your journey.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-white">Centralized Bookings</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-white">Expense Tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-white">Offline Access</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-white">Smart Notifications</span>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Global Discovery Section */}
      <Section id="discovery" background={<BackgroundStarfield />}>
        <div className="text-center mb-24">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-8 mx-auto">
            <Globe className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">Global Discovery</h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto font-medium">
            Explore unique experiences and hidden gems across the globe. 
            From private tours to local workshops, we bring the world to you.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { title: "Local Tours", icon: MapPin, color: "text-blue-400" },
            { title: "Foodie Walks", icon: Star, color: "text-orange-400" },
            { title: "Hidden Gems", icon: Sparkles, color: "text-purple-400" },
            { title: "Workshops", icon: BrainCircuit, color: "text-emerald-400" }
          ].map((item, i) => (
            <GlassCard key={i} delay={i * 0.1} className="p-8! text-center group hover:bg-white/5 transition-all">
              <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <h4 className="text-lg font-bold text-white">{item.title}</h4>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* Safety & Support Section */}
      <Section id="safety" background={<BackgroundSpotlight />}>
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mb-8">
              <ShieldCheck className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-10 leading-[1.1] tracking-tight">
              Safety First. <br />
              <span className="text-red-400">Always.</span>
            </h2>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed font-medium">
              Your safety is our top priority. From 24/7 emergency support to 
              verified local partners, we ensure every step of your journey is 
              secure and worry-free.
            </p>
            <div className="space-y-6">
              {[
                { title: "24/7 AI Support", desc: "Instant assistance for any travel-related issues, anytime, anywhere." },
                { title: "Emergency SOS", desc: "One-tap connection to local emergency services and our support team." },
                { title: "Travel Insurance", desc: "Seamlessly integrated insurance plans for complete peace of mind." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1">
                    <CheckCircle2 className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{item.title}</h4>
                    <p className="text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          <div className="relative">
            <GlassCard className="aspect-square flex items-center justify-center p-12! relative overflow-hidden" delay={0.4}>
              <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
              <Shield className="w-48 h-48 text-red-400 drop-shadow-[0_0_30px_rgba(248,113,113,0.5)]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-red-500/20 rounded-full animate-ping" />
            </GlassCard>
          </div>
        </div>
      </Section>

      {/* Testimonials Section */}
      <Section background={<BackgroundWaves />}>
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <GlassCard className="p-16! relative">
              <Star className="w-16 h-16 text-indigo-400 mx-auto mb-12 fill-indigo-400/20 drop-shadow-[0_0_20px_rgba(129,140,248,0.5)]" />
              <h2 className="text-4xl md:text-6xl font-black mb-12 italic leading-[1.2] tracking-tight">
                "TripMaker has completely changed how I travel. The AI planner 
                found spots I never would have discovered on my own."
              </h2>
              <div className="flex items-center justify-center gap-6">
                <div className="w-20 h-20 bg-linear-to-br from-indigo-500 to-cyan-500 rounded-full p-1">
                  <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center font-black text-2xl overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-black text-2xl text-white">Alex Rivera</div>
                  <div className="text-indigo-400 font-bold uppercase tracking-widest text-sm">Digital Nomad</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </Section>

      {/* Pricing Section */}
      <Section id="pricing" background={<BackgroundSpotlight />}>
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">Travel Plans</h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto font-medium">
            Choose the level of intelligence for your next adventure.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {[
            { name: "Explorer", price: "$0", features: ["Basic AI Planner", "Ride Booking", "Hotel Search", "Standard Support"] },
            { name: "Voyager", price: "$19", features: ["Advanced AI Planner", "Priority Ride Booking", "Exclusive Hotel Deals", "AI Lens Basic", "Offline Maps"], popular: true },
            { name: "Nomad", price: "$49", features: ["Unlimited AI Planning", "Concierge Support", "VIP Hotel Perks", "Full AI Lens Suite", "Expense Manager Pro"] }
          ].map((plan, i) => (
            <GlassCard 
              key={i} 
              delay={i * 0.1} 
              variant={plan.popular ? 'glowing' : 'default'}
              glowColor={plan.popular ? 'from-indigo-500/30 via-cyan-500/30 to-purple-500/30' : undefined}
              className={`${plan.popular ? 'scale-105 z-10' : ''}`}
            >
              <div className="text-sm font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">{plan.name}</div>
              <div className="flex items-baseline gap-2 mb-10">
                <span className="text-6xl font-black text-white">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-slate-500 font-bold">/mo</span>}
              </div>
              <ul className="space-y-6 mb-12">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-4 text-sm font-semibold text-slate-300">
                    <CheckCircle2 className="w-6 h-6 text-indigo-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button 
                onClick={onLaunch}
                className={`w-full py-5 rounded-2xl font-black text-lg transition-all ${
                plan.popular 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/20' 
                  : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
              }`}>
                Get Started
              </button>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* Contact Section */}
      <Section background={<BackgroundStarfield />}>
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-6xl md:text-8xl font-black mb-10 leading-[0.9] tracking-tighter">
              Ready to <br />
              <span className="bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Explore?</span>
            </h2>
            <p className="text-2xl text-slate-400 mb-12 leading-relaxed font-medium">
              Join thousands of travelers who are already using TripMaker to 
              discover the world in a whole new way.
            </p>
            <div className="flex gap-8">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 hover:scale-110 transition-all duration-500"
                  aria-label={['Twitter', 'GitHub', 'LinkedIn'][i]}
                >
                  <Icon className="w-8 h-8 text-white" />
                </a>
              ))}
            </div>
          </motion.div>
          <GlassCard className="p-12!" delay={0.3}>
            <form className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">First Name</label>
                  <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all text-white font-medium" placeholder="John" />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Last Name</label>
                  <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all text-white font-medium" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                <input type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all text-white font-medium" placeholder="john@tripmaker.ai" />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Message</label>
                <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all text-white font-medium h-40 resize-none" placeholder="Where do you want to go next?"></textarea>
              </div>
              <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/40 group">
                Send Message <Mail className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </GlassCard>
        </div>
      </Section>

      {/* Footer */}
      <footer className="relative py-24 px-6 overflow-hidden">
        <BackgroundNeonGrid />
        <div className="relative z-10 max-w-7xl mx-auto">
          <GlassCard className="p-16! flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="text-center md:text-left">
              <div className="flex items-center space-x-2 mb-4 justify-center md:justify-start">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="text-white w-5 h-5" />
                </div>
                <div className="text-3xl font-black tracking-tighter text-white">
                  TripMaker
                </div>
              </div>
              <p className="text-slate-400 max-w-sm font-medium">
                The world's most intelligent travel companion. 
                Powered by AI, designed for humans.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-12 text-sm font-bold text-slate-400">
              <div className="space-y-4">
                <div className="text-white uppercase tracking-widest text-xs">Product</div>
                <a href="#planner" className="block hover:text-white transition-colors">Planner</a>
                <a href="#rides" className="block hover:text-white transition-colors">Rides</a>
                <a href="#hotels" className="block hover:text-white transition-colors">Hotels</a>
              </div>
              <div className="space-y-4">
                <div className="text-white uppercase tracking-widest text-xs">Company</div>
                <a href="#" className="block hover:text-white transition-colors">About Us</a>
                <a href="#" className="block hover:text-white transition-colors">Careers</a>
                <a href="#" className="block hover:text-white transition-colors">Blog</a>
              </div>
              <div className="space-y-4">
                <div className="text-white uppercase tracking-widest text-xs">Legal</div>
                <a href="#" className="block hover:text-white transition-colors">Privacy</a>
                <a href="#" className="block hover:text-white transition-colors">Terms</a>
                <a href="#" className="block hover:text-white transition-colors">Cookies</a>
              </div>
            </div>
          </GlassCard>
          <div className="mt-16 text-center text-slate-600 text-sm font-bold tracking-widest uppercase">
            © 2026 TripMaker AI. All rights reserved.
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0%, 100% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}} />
    </div>
  );
}

