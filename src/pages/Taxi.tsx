import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Car, 
  Clock, 
  ShieldCheck, 
  Star,
  ChevronRight,
  AlertCircle,
  IndianRupee,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import socket from '../lib/socket';
import { CalculatorEngine, VehicleType, TaxiFareResult } from '../lib/calculator';
import * as SupabaseLib from '../lib/supabase';

const rideTypes: { id: VehicleType; name: string; icon: any; color: string }[] = [
  { id: 'bike', name: 'Bike', icon: Car, color: 'slate' },
  { id: 'auto', name: 'Auto', icon: Car, color: 'amber' },
  { id: 'sedan', name: 'Sedan', icon: Car, color: 'indigo' },
  { id: 'suv', name: 'SUV', icon: Car, color: 'emerald' },
  { id: 'van', name: 'Van', icon: Car, color: 'violet' },
];

function CheckCircle2({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}

export default function Taxi() {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [distance, setDistance] = useState(10);
  const [waitingTime, setWaitingTime] = useState(0);
  const [selectedType, setSelectedType] = useState<VehicleType>('sedan');
  const [isSearching, setIsSearching] = useState(false);
  const [rideStatus, setRideStatus] = useState<'idle' | 'searching' | 'assigned' | 'arrived' | 'ongoing' | 'completed'>('idle');
  const [driver, setDriver] = useState<any>(null);
  const [fareResult, setFareResult] = useState<TaxiFareResult | null>(null);
  const [surge, setSurge] = useState(1.0);
  const [user, setUser] = useState<any>(null);
  const [carPosition, setCarPosition] = useState(0); // 0 to 100 percentage
  const [showBill, setShowBill] = useState(false);

  useEffect(() => {
    SupabaseLib.supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    setSurge(CalculatorEngine.getDynamicSurge());
    
    socket.on('ride:assigned', (data) => {
      setDriver(data.driver);
      setRideStatus('assigned');
      setIsSearching(false);
    });

    return () => {
      socket.off('ride:assigned');
    };
  }, []);

  // Simulate live tracking
  useEffect(() => {
    let interval: any;
    if (rideStatus === 'ongoing') {
      interval = setInterval(() => {
        setCarPosition(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setRideStatus('completed');
            setShowBill(true);
            return 100;
          }
          return prev + 2; // Move 2% every interval
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [rideStatus]);

  useEffect(() => {
    if (pickup && destination) {
      const result = CalculatorEngine.calculateTaxiFare({
        pickup,
        destination,
        distanceKm: distance,
        travelTimeMins: distance * 2, // Mock time
        vehicleType: selectedType,
        surgeMultiplier: surge,
        waitingTimeMins: waitingTime,
        isNightCharge: new Date().getHours() >= 22 || new Date().getHours() <= 5
      });
      setFareResult(result);
    }
  }, [pickup, destination, distance, selectedType, waitingTime, surge]);

  const handleStartRide = () => {
    setRideStatus('ongoing');
    setCarPosition(0);
  };

  const handleRequestRide = async () => {
    if (!pickup || !destination) return;
    setIsSearching(true);
    setRideStatus('searching');

    // Save to Supabase
    if (user) {
      try {
        const { error } = await SupabaseLib.supabase
          .from('taxi_bookings')
          .insert([
            {
              user_id: user.id,
              pickup_location: pickup,
              destination_location: destination,
              distance_km: distance,
              vehicle_type: selectedType,
              fare_amount: fareResult?.finalFare,
              status: 'searching',
              created_at: new Date().toISOString()
            }
          ]);
        
        if (error) console.error('Error saving booking:', error);
      } catch (err) {
        console.error('Failed to save booking to Supabase:', err);
      }
    }

    socket.emit('ride:request', { 
      pickup, 
      destination, 
      vehicleType: selectedType,
      fare: fareResult?.finalFare 
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-12rem)]">
      {/* Sidebar Controls */}
      <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        {rideStatus === 'idle' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-6">Book a Ride</h3>
            
            <div className="space-y-4 relative">
              <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-slate-100"></div>
              
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-indigo-600 bg-white z-10"></div>
                <input 
                  type="text" 
                  placeholder="Pickup location"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-indigo-600 rounded-sm z-10"></div>
                <input 
                  type="text" 
                  placeholder="Where are you going?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="space-y-1">
                <label htmlFor="distance-input" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Distance (KM)</label>
                <input 
                  id="distance-input"
                  type="number" 
                  value={distance}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDistance(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="wait-input" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Wait (Mins)</label>
                <input 
                  id="wait-input"
                  type="number" 
                  value={waitingTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWaitingTime(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                />
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle Type</p>
              <div className="grid grid-cols-1 gap-2">
                {rideTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${
                      selectedType === type.id 
                        ? 'border-indigo-600 bg-indigo-50/50' 
                        : 'border-slate-50 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 bg-${type.color}-100 text-${type.color}-600 rounded-xl`}>
                        <type.icon size={18} />
                      </div>
                      <span className="font-bold text-slate-900">{type.name}</span>
                    </div>
                    {pickup && destination && (
                      <span className="font-black text-slate-900">
                        ₹{CalculatorEngine.calculateTaxiFare({
                          pickup, destination, distanceKm: distance, travelTimeMins: distance*2, vehicleType: type.id, surgeMultiplier: surge
                        }).finalFare.toFixed(0)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {fareResult && (
              <div className="mt-8 p-5 bg-slate-900 rounded-3xl text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-400 text-xs uppercase tracking-widest">Fare Breakdown</h4>
                  {surge > 1 && (
                    <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                      {surge}x Surge
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {fareResult.breakdown.map((item, i) => (
                    item.value !== 0 && (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-slate-400">{item.label}</span>
                        <span className={item.value < 0 ? 'text-emerald-400' : 'text-white font-medium'}>
                          {item.value < 0 ? '-' : ''}₹{Math.abs(item.value).toFixed(2)}
                        </span>
                      </div>
                    )
                  ))}
                  <div className="pt-3 mt-3 border-t border-white/10 flex justify-between items-center">
                    <span className="font-black text-indigo-400">Total Payable</span>
                    <span className="text-2xl font-black">₹{fareResult.finalFare.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={handleRequestRide}
              disabled={rideStatus !== 'idle' || !pickup || !destination}
              className="w-full mt-6 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
            >
              <Car size={20} />
              <span>Confirm Booking</span>
            </button>
          </div>
        )}

        {rideStatus === 'searching' && (
          <div className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-xl text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-indigo-600/20 rounded-full animate-ping"></div>
              <div className="absolute inset-0 flex items-center justify-center bg-indigo-50 rounded-full text-indigo-600">
                <Search size={32} className="animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Finding a Driver</h3>
              <p className="text-slate-500 text-sm mt-2">Connecting you with the nearest available driver...</p>
            </div>
            <button 
              onClick={() => {
                setRideStatus('idle');
                setIsSearching(false);
              }}
              className="w-full py-3 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all"
            >
              Cancel Request
            </button>
          </div>
        )}

        {/* Trip Progress Section (Sidebar) */}
        {rideStatus === 'ongoing' && (
          <div className="bg-white p-6 rounded-3xl border border-indigo-200 shadow-xl shadow-indigo-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-widest">Trip in Progress</span>
              <span className="text-sm font-bold text-slate-900">{Math.round(distance * (1 - carPosition/100))} km left</span>
            </div>

            <div className="w-full h-48 rounded-2xl overflow-hidden mb-6 border border-slate-100 relative">
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0} 
                title="Ongoing Ride Map"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=72.80,18.90,73.00,19.10&layer=mapnik`}
                className="grayscale-[0.2] contrast-[1.1]"
              ></iframe>
              
              {/* Animated Progress on Sidebar Map */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-3/4 h-1 bg-indigo-600/20 rounded-full relative">
                  <motion.div 
                    animate={{ left: `${carPosition}%` }}
                    className="absolute -top-1.5 -translate-x-1/2 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white shadow-lg"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destination</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{destination}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <img src={driver?.image} className="w-10 h-10 rounded-xl" alt="Driver" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{driver?.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{driver?.car}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">₹{fareResult?.finalFare.toFixed(0)}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fare</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Driver Info Overlay */}
        {rideStatus === 'assigned' && driver && (
          <div className="bg-white p-6 rounded-3xl border border-indigo-200 shadow-xl shadow-indigo-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-widest">Driver Assigned</span>
              <span className="text-sm font-bold text-slate-900">Arriving in 4 min</span>
            </div>

            {/* Live Map in Sidebar */}
            <div className="w-full h-48 rounded-2xl overflow-hidden mb-6 border border-slate-100 relative group">
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0} 
                title="Ride Map"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=72.80,18.90,73.00,19.10&layer=mapnik`}
                className="grayscale-[0.2] contrast-[1.1]"
              ></iframe>
              <div className="absolute inset-0 bg-indigo-600/5 pointer-events-none"></div>
              
              {/* Distance Badge on Map */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white flex items-center space-x-2">
                <Navigation size={14} className="text-indigo-600" />
                <span className="text-xs font-black text-slate-900">{distance} km to destination</span>
              </div>
              
              {/* Route Line Simulation */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-3/4 h-1 bg-indigo-600/30 rounded-full relative">
                  <div className="absolute -left-1 -top-1 w-3 h-3 rounded-full bg-white border-2 border-indigo-600"></div>
                  <div className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <img src={driver.image} className="w-14 h-14 rounded-2xl border-2 border-white shadow-sm" alt="Driver" />
              <div className="flex-1">
                <h4 className="font-bold text-slate-900">{driver.name}</h4>
                <div className="flex items-center text-xs text-slate-500">
                  <Star size={12} className="text-amber-400 fill-amber-400 mr-1" />
                  <span className="font-bold text-slate-700">{driver.rating}</span>
                  <span className="mx-2 text-slate-300">•</span>
                  <span>{driver.car}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-slate-900">{driver.plate}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plate</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              {rideStatus === 'assigned' && (
                <button 
                  onClick={handleStartRide}
                  className="col-span-2 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                >
                  Start Trip
                </button>
              )}
              <button className="py-3 bg-slate-50 text-slate-900 font-bold rounded-xl text-sm hover:bg-slate-100 transition-colors">Message</button>
              <button className="py-3 bg-red-50 text-red-600 font-bold rounded-xl text-sm hover:bg-red-100 transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {/* Bill Section */}
        <AnimatePresence>
          {showBill && fareResult && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-8 rounded-[2.5rem] border-2 border-indigo-100 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 -z-10"></div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Ride Completed!</h3>
                <p className="text-slate-500 font-medium">Thank you for riding with TripMaker</p>
              </div>

              <div className="space-y-4 border-t border-b border-slate-100 py-6 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Transaction ID</span>
                  <span className="text-slate-900 font-mono text-xs">TM-RIDE-{Math.random().toString(36).substring(2, 11).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Date & Time</span>
                  <span className="text-slate-900 text-sm font-bold">{new Date().toLocaleString()}</span>
                </div>
                <div className="space-y-2 pt-4">
                  {fareResult.breakdown.map((item, i) => (
                    item.value !== 0 && (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-slate-500">{item.label}</span>
                        <span className="text-slate-900 font-bold">₹{Math.abs(item.value).toFixed(2)}</span>
                      </div>
                    )
                  ))}
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-lg font-black text-slate-900">Total Paid</span>
                  <span className="text-3xl font-black text-indigo-600">₹{fareResult.finalFare.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                    <IndianRupee size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payment Method</p>
                    <p className="text-sm font-black text-slate-900">TripMaker Wallet</p>
                  </div>
                </div>
                <CheckCircle2 className="text-emerald-500" size={24} />
              </div>

              <button 
                onClick={() => {
                  setShowBill(false);
                  setRideStatus('idle');
                  setPickup('');
                  setDestination('');
                }}
                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all"
              >
                Close Receipt
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map Area */}
      <div className="lg:col-span-8 bg-slate-100 rounded-[2.5rem] relative overflow-hidden shadow-inner border border-slate-200">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/1200/800')] bg-cover bg-center opacity-40 grayscale-[0.5]"></div>
        
        {/* Map UI Elements */}
        <div className="absolute top-6 right-6 flex flex-col space-y-3">
          <button 
            aria-label="Current Location"
            className="p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg text-slate-600 hover:text-indigo-600 transition-colors border border-white"
          >
            <Navigation size={20} />
          </button>
          <button 
            aria-label="Safety Center"
            className="p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg text-slate-600 hover:text-indigo-600 transition-colors border border-white"
          >
            <ShieldCheck size={20} />
          </button>
        </div>

        {/* Route Visualization Placeholder */}
        {pickup && destination && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2/3 h-1.5 bg-indigo-600/20 rounded-full relative">
              <div className="absolute -left-2 -top-1.5 w-5 h-5 rounded-full bg-white border-4 border-indigo-600 shadow-xl"></div>
              <div className="absolute -right-2 -top-1.5 w-5 h-5 rounded-full bg-indigo-600 border-4 border-white shadow-xl"></div>
              
              {/* Live Tracking Car */}
              {(rideStatus === 'ongoing' || rideStatus === 'completed') && (
                <motion.div 
                  animate={{ left: `${carPosition}%` }}
                  transition={{ type: "spring", stiffness: 50, damping: 20 }}
                  className="absolute -top-8 -translate-x-1/2 flex flex-col items-center"
                >
                  <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg mb-1">
                    <Car size={16} />
                  </div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                </motion.div>
              )}

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-2xl border border-white flex items-center space-x-2">
                <Clock size={14} className="text-indigo-600" />
                <span className="text-xs font-black text-slate-900">
                  {rideStatus === 'ongoing' ? `${Math.round(distance * (1 - carPosition/100))} km left` : `${distance} km • ${distance * 2} min`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Searching Animation */}
        {isSearching && (
          <div className="absolute inset-0 bg-indigo-900/5 backdrop-blur-[2px] flex items-center justify-center">
            <div className="relative">
              <div className="w-48 h-48 border-4 border-indigo-600/20 rounded-full animate-ping"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-2xl flex items-center justify-center text-indigo-600 border border-indigo-50">
                  <Search className="animate-pulse" size={32} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
