import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Clock, 
  ChevronLeft, 
  Menu, 
  User, 
  Bell, 
  AlertCircle,
  Loader2,
  X,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Database
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import TravelMapView from '../components/TravelMapView';
import TravelBookingForm from '../components/TravelBookingForm';
import RideOptions, { RIDE_OPTIONS, RideOption } from '../components/RideOptions';
import RideSummary from '../components/RideSummary';
import RideChat from '../components/RideChat';
import RideRating from '../components/RideRating';
import RideSubscription from '../components/RideSubscription';
import { getRoute, RouteData } from '../services/routeService';
import { TravelBookingProps, Page, RideStop } from '../types';
import { MessageSquare, Zap, Star } from 'lucide-react';
import toast from 'react-hot-toast';

declare var Razorpay: any;

const TravelBooking = ({ user, onBookingSuccess, setActivePage }: TravelBookingProps) => {
  // State for locations
  const [pickup, setPickup] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [stops, setStops] = useState<RideStop[]>([]);
  
  // State for route and fare
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for ride selection
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'options' | 'summary' | 'otp' | 'subscription'>('input');
  
  // State for booking simulation
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState<'none' | 'searching' | 'found' | 'completed'>('none');
  const [otp, setOtp] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [bookingPhone, setBookingPhone] = useState(user?.phone || '');
  const [isSafeRouteMode, setIsSafeRouteMode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Chat & Rating State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showRating, setShowRating] = useState(false);

  // Update bookingPhone when user changes
  useEffect(() => {
    if (user?.phone) {
      setBookingPhone(user.phone);
    }
  }, [user]);

  // Calculate route when both points are selected
  useEffect(() => {
    if (pickup && destination) {
      calculateRoute();
    }
  }, [pickup, destination]);

  const calculateRoute = async () => {
    if (!pickup || !destination) return;
    
    setIsCalculating(true);
    setError(null);
    try {
      // Simulate extra calculation for safe route
      if (isSafeRouteMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      const data = await getRoute(pickup, destination);
      
      // Mock "Safer Route" adjustments
      if (isSafeRouteMode) {
        data.distance *= 1.1; // 10% longer
        data.duration *= 1.2; // 20% slower
      }
      
      setRouteData(data);
      setStep('options');
    } catch (err: any) {
      setError(err.message || 'Failed to calculate route');
      setStep('input');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleLocationSelect = (type: 'pickup' | 'destination' | 'stop', lat: number, lng: number, address: string, stopId?: string) => {
    if (type === 'pickup') {
      setPickup([lat, lng]);
      setPickupAddress(address);
    } else if (type === 'destination') {
      setDestination([lat, lng]);
      setDestinationAddress(address);
    } else if (type === 'stop' && stopId) {
      setStops(prev => prev.map(s => s.id === stopId ? { ...s, lat, lng, address } : s));
    }
    setError(null);
  };

  const handleAddStop = () => {
    if (stops.length >= 3) {
      setError('Maximum 3 stops allowed');
      return;
    }
    const newStop: RideStop = {
      id: Math.random().toString(36).substr(2, 9),
      address: '',
      lat: 0,
      lng: 0
    };
    setStops([...stops, newStop]);
  };

  const handleRemoveStop = (id: string) => {
    setStops(stops.filter(s => s.id !== id));
  };

  const handleRideSelect = (rideId: string) => {
    setSelectedRideId(rideId);
    setStep('summary');
  };

  const handleBookRide = async (method: string, totalAmount: number) => {
    setPaymentMethod(method);
    setIsBooking(true);
    setError(null);

    const selectedRide = RIDE_OPTIONS.find(r => r.id === selectedRideId);
    if (!selectedRide || !routeData) return;

    try {
      if (!bookingPhone) {
        setError('Please provide a phone number for booking confirmation.');
        setIsBooking(false);
        return;
      }

      // Online Payment Flow (Razorpay)
      const bookingData = {
        userId: user?.id || 'guest',
        userName: user?.name || 'Guest User',
        userEmail: user?.email || 'guest@example.com',
        userPhone: bookingPhone,
        pickup: pickupAddress,
        drop: destinationAddress,
        item_name: `Ride from ${pickupAddress.split(',')[0]} to ${destinationAddress.split(',')[0]}`,
        item_type: 'taxi',
        amount: totalAmount,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      };

        const orderResponse = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalAmount,
            currency: 'INR',
            bookingData
          })
        });

        const orderData = await orderResponse.json();

        if (!orderResponse.ok) {
          throw new Error(orderData.error || 'Failed to create payment order');
        }

        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
        
        // Mock Bypass for Demo
        if (orderData.isMock) {
          toast.success("Demo Mode: Autoverifying payment...");
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: orderData.order_id,
                razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substr(2, 9),
                razorpay_signature: 'sig_mock',
                bookingDetails: { id: orderData.bookingId, amount: totalAmount }
              })
            });

            if (verifyRes.ok) {
              setBookingStep('searching');
              setTimeout(() => {
                setBookingStep('found');
                if (onBookingSuccess) {
                  onBookingSuccess({
                    id: orderData.bookingId || orderData.order_id,
                    user_id: user?.id || 'guest',
                    item_id: selectedRideId || 'taxi-1',
                    item_name: `Ride from ${pickupAddress.split(',')[0]} to ${destinationAddress.split(',')[0]}`,
                    item_type: 'taxi',
                    price: totalAmount,
                    status: 'confirmed',
                    created_at: new Date().toISOString(),
                    userName: user?.name || 'Guest User',
                    userEmail: user?.email || 'guest@example.com',
                    userPhone: bookingPhone,
                    pickup: pickupAddress,
                    drop: destinationAddress,
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                    amount: totalAmount
                  });
                }
              }, 2000);
              return;
            }
          } catch (err) {
            console.error('Mock verification error:', err);
          }
          throw new Error('Mock verification failed');
        }

        // Already declared: const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
        if (!razorpayKey) {
          throw new Error('Razorpay Key ID (VITE_RAZORPAY_KEY_ID) is missing.');
        }

        const options = {
          key: razorpayKey,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "TripMaker Go",
          description: `Ride Booking: ${pickupAddress.split(',')[0]} -> ${destinationAddress.split(',')[0]}`,
          order_id: orderData.order_id,
          // Optimization for "Direct Payment Apps"
          modal: {
            ondismiss: function() {
              setIsBooking(false);
            }
          },
          prefill: {
            name: user?.name || "Guest User",
            email: user?.email || "guest@example.com",
            contact: bookingPhone,
            method: method === 'upi' ? 'upi' : undefined,
          },
          config: {
            display: {
              blocks: {
                upi: {
                  name: 'UPI / Google Pay / PhonePe',
                  instruments: [
                    {
                      method: 'upi',
                      apps: ['google_pay', 'phonepe', 'paytm', 'bhim']
                    }
                  ]
                }
              },
              sequence: method === 'upi' ? ['block.upi'] : ['card', 'netbanking', 'wallet'],
              preferences: {
                show_default_blocks: method !== 'upi'
              }
            }
          },
          handler: async function (response: any) {
            // Verify payment
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingDetails: {
                  id: orderData.bookingId,
                  amount: totalAmount
                }
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setBookingStep('searching');
              setTimeout(() => setBookingStep('found'), 2000);
              
              // Notify user
              if (onBookingSuccess) {
                onBookingSuccess({
                  id: orderData.bookingId || orderData.order_id,
                  user_id: user?.id || 'guest',
                  item_id: selectedRideId || 'taxi-1',
                  item_name: `Ride from ${pickupAddress.split(',')[0]} to ${destinationAddress.split(',')[0]}`,
                  item_type: 'taxi',
                  price: totalAmount,
                  status: 'confirmed',
                  created_at: new Date().toISOString(),
                  userName: user?.name || 'Guest User',
                  userEmail: user?.email || 'guest@example.com',
                  userPhone: bookingPhone,
                  pickup: pickupAddress,
                  drop: destinationAddress,
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                  amount: totalAmount
                });
              }
            } else {
              setError(verifyData.message || 'Payment verification failed');
            }
          },
          notes: {
            pickup: pickupAddress,
            destination: destinationAddress
          },
          theme: {
            color: "#4f46e5",
          },
        };

        const rzp = new Razorpay(options);
        
        rzp.on('payment.failed', function (response: any) {
          setError(response.error.description);
        });

        rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred. Please try again.');
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/booking/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, otp })
      });

      const data = await response.json();

      if (response.ok) {
        // Also save to Supabase if configured
        if (isSupabaseConfigured()) {
          try {
            const selectedRide = RIDE_OPTIONS.find(r => r.id === selectedRideId);
            const fare = selectedRide ? Math.round(selectedRide.baseFare + (routeData?.distance || 0) * selectedRide.perKm) : 0;

            await supabase.from('bookings').insert([{
              id: bookingId,
              user_id: user?.id || 'guest',
              item_id: selectedRideId || 'taxi-1',
              item_name: `Ride from ${pickupAddress} to ${destinationAddress}`,
              item_type: 'taxi',
              price: fare,
              status: 'confirmed',
              pickup: pickupAddress,
              drop: destinationAddress,
              date: new Date().toISOString().split('T')[0],
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
            }]);
          } catch (err) {
            console.error('[Supabase] Booking sync failed:', err);
          }
        }

        setBookingStep('searching');
        setTimeout(() => {
          setBookingStep('found');
          // Mock notification
          const notification = {
            id: Date.now().toString(),
            title: 'Driver Assigned',
            message: 'Rajesh Kumar is on his way to your pickup location.',
            type: 'success',
            created_at: new Date().toISOString(),
            read: false
          };
          const existing = JSON.parse(localStorage.getItem('notifications') || '[]');
          localStorage.setItem('notifications', JSON.stringify([notification, ...existing]));
          
          if (onBookingSuccess) {
            const finalPrice = selectedRide ? Math.round(selectedRide.baseFare + (routeData?.distance || 0) * selectedRide.perKm) : 0;
            onBookingSuccess({
              id: bookingId || 'unknown',
              user_id: user?.id || 'guest',
              item_id: selectedRideId || 'taxi-1',
              item_name: `Ride from ${pickupAddress.split(',')[0]} to ${destinationAddress.split(',')[0]}`,
              item_type: 'taxi',
              price: finalPrice,
              status: 'confirmed',
              created_at: new Date().toISOString(),
              userName: user?.name || 'Guest User',
              userEmail: user?.email || 'guest@example.com',
              userPhone: bookingPhone,
              pickup: pickupAddress,
              drop: destinationAddress,
              date: new Date().toISOString().split('T')[0],
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
              amount: finalPrice
            });
          }
        }, 2000);
        setStep('summary');
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsVerifying(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/otp/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, type: 'booking', bookingId })
      });
      const data = await response.json();
      if (response.ok) {
        if (data.otp) setDemoOtp(data.otp);
        setError('New OTP sent to your email and phone!');
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const reset = () => {
    setPickup(null);
    setDestination(null);
    setPickupAddress('');
    setDestinationAddress('');
    setStops([]);
    setRouteData(null);
    setSelectedRideId(null);
    setStep('input');
    setBookingStep('none');
    setError(null);
    setIsChatOpen(false);
    setShowRating(false);
  };

  const selectedRide = RIDE_OPTIONS.find(r => r.id === selectedRideId);

  return (
    <div className="relative h-screen w-full bg-slate-50 overflow-hidden font-sans">
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <TravelMapView 
          pickup={pickup} 
          destination={destination} 
          route={routeData?.geometry || null} 
        />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-2 md:p-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 md:space-x-3 pointer-events-auto">
          <button 
            onClick={reset}
            className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl shadow-xl flex items-center justify-center text-slate-900 hover:bg-slate-50 transition-all"
            title={step === 'input' ? "Menu" : "Back"}
          >
            {step === 'input' ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
          <div className="bg-white px-3 md:px-4 py-2 md:py-3 rounded-xl md:rounded-2xl shadow-xl flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs md:text-sm font-black text-slate-900 tracking-tight">TripMaker Go</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-3 pointer-events-auto">
          <button className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl shadow-xl flex items-center justify-center text-slate-900" title="Notifications">
            <Bell size={18} className="md:w-5 md:h-5" />
          </button>
          <button className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl shadow-xl flex items-center justify-center text-slate-900 overflow-hidden border-2 border-white" title="User Profile">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
          </button>
        </div>
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4"
          >
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center space-x-3 shadow-xl">
              <AlertCircle className="text-red-500 shrink-0" size={20} />
              <p className="text-sm font-bold text-red-900">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600" title="Dismiss error">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Panel (Bottom Sheet Style) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none flex justify-center p-4">
        <motion.div 
          layout
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl pointer-events-auto overflow-hidden border border-slate-100"
        >
          {/* Drag Handle */}
          <div className="w-full flex justify-center py-3">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
          </div>

          <div className="p-6 pt-0 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {step === 'input' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Where are you going?</h2>
                  <p className="text-slate-500 font-medium text-sm">Book a ride in seconds.</p>
                </div>
                
                <TravelBookingForm 
                  onLocationSelect={handleLocationSelect}
                  pickupAddress={pickupAddress}
                  destinationAddress={destinationAddress}
                  stops={stops}
                  onAddStop={handleAddStop}
                  onRemoveStop={handleRemoveStop}
                />

                {/* Safe Route Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSafeRouteMode ? 'bg-emerald-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Safe Route Mode</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Avoids high-risk zones</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsSafeRouteMode(!isSafeRouteMode)}
                    className={`w-12 h-6 rounded-full transition-all relative ${isSafeRouteMode ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    title="Toggle Safe Route Mode"
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isSafeRouteMode ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {isCalculating && (
                  <div className="flex items-center justify-center py-8 space-x-3">
                    <Loader2 className="animate-spin text-indigo-600" size={24} />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Calculating Route...</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <button 
                    onClick={() => setStep('subscription')}
                    className="flex flex-col items-center justify-center p-4 bg-amber-50 rounded-2xl border border-amber-100 hover:bg-amber-100 transition-all group"
                    title="Subscription plans"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-amber-500 group-hover:text-amber-600 transition-colors">
                      <Zap size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 mt-2">Pass</span>
                  </button>
                  <button 
                    className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all group"
                    title="Recent locations"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <Clock size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 mt-2">Recent</span>
                  </button>
                  <button 
                    className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all group"
                    title="Saved locations"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                      <MapPin size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 mt-2">Saved</span>
                  </button>
                </div>
              </div>
            )}

            {step === 'options' && routeData && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setStep('input')}
                    className="text-sm font-black text-indigo-600 flex items-center"
                    title="Back to input"
                  >
                    <ChevronLeft size={16} className="mr-1" />
                    Edit Route
                  </button>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Distance</p>
                    <div className="flex items-center justify-end space-x-2">
                      {isSafeRouteMode && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-md">Safer</span>
                      )}
                      <p className="text-sm font-black text-slate-900">{routeData.distance.toFixed(1)} km</p>
                    </div>
                  </div>
                </div>

                <RideOptions 
                  distance={routeData.distance}
                  duration={routeData.duration}
                  selectedRide={selectedRideId}
                  onSelect={handleRideSelect}
                />
              </div>
            )}

            {step === 'subscription' && (
              <div className="space-y-6">
                <button 
                  onClick={() => setStep('input')}
                  className="text-sm font-black text-indigo-600 flex items-center"
                  title="Back to input"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Back
                </button>
                <RideSubscription />
              </div>
            )}

            {step === 'summary' && routeData && selectedRide && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setStep('options')}
                    className="text-sm font-black text-indigo-600 flex items-center"
                    title="Back to options"
                  >
                    <ChevronLeft size={16} className="mr-1" />
                    Back to Options
                  </button>
                  {bookingStep === 'found' && (
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setIsChatOpen(true)}
                        className="p-3 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 transition-all relative"
                        title="Chat with driver"
                      >
                        <MessageSquare size={20} />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full" />
                      </button>
                      <button 
                        onClick={() => setBookingStep('completed')}
                        className="p-3 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200 transition-all"
                        title="Simulate ride completion"
                      >
                        <CheckCircle2 size={20} />
                      </button>
                    </div>
                  )}
                </div>

                {bookingStep === 'completed' ? (
                  <RideRating 
                    driverName="Rajesh Kumar" 
                    onComplete={() => {
                      reset();
                      setActivePage('dashboard');
                    }} 
                  />
                ) : (
                  <RideSummary 
                    pickup={pickupAddress}
                    destination={destinationAddress}
                    distance={routeData.distance}
                    duration={routeData.duration}
                    ride={selectedRide}
                    onBook={handleBookRide}
                    isBooking={isBooking}
                    bookingStep={bookingStep}
                    phone={bookingPhone}
                    onPhoneChange={setBookingPhone}
                  />
                )}
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-black text-slate-900 mb-2 flex items-center justify-center">
                    <ShieldCheck className="mr-2 text-emerald-600" />
                    Verify Booking
                  </h3>
                  <p className="text-slate-500 mb-6 font-medium text-sm">
                    We sent a verification code to your email and phone to confirm your ride.
                  </p>

                  {demoOtp && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-6">
                      <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">Demo Mode Code</p>
                      <p className="text-3xl font-black text-amber-600 tracking-[0.2em]">{demoOtp}</p>
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtp} className="space-y-6 text-left">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 text-center block">Enter 6-Digit Code</label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          required
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="123456"
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-black text-2xl tracking-[0.5em] text-center"
                        />
                      </div>
                    </div>

                      <div className="flex flex-col space-y-3">
                        <button 
                          type="submit"
                          disabled={isVerifying}
                          className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2"
                        >
                          {isVerifying ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <span>Verify & Book Ride</span>
                              <CheckCircle2 size={18} />
                            </>
                          )}
                        </button>
                        <button 
                          type="button"
                          onClick={handleResendOtp}
                          disabled={isVerifying}
                          className="text-sm text-indigo-600 font-bold hover:underline text-center"
                        >
                          Resend OTP
                        </button>
                        <button 
                          type="button"
                          onClick={() => setStep('summary')}
                          className="text-sm text-slate-500 font-bold hover:text-indigo-600 transition-colors text-center"
                        >
                          Cancel & Edit Details
                        </button>
                      </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <RideChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        driverName="Rajesh Kumar" 
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .leaflet-container {
          font-family: inherit;
        }
        .custom-vehicle-icon {
          background: transparent;
          border: none;
        }
      `}} />
    </div>
  );
};

export default TravelBooking;
