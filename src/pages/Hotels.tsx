import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Hotel, 
  Utensils, 
  Map as MapIcon, 
  List, 
  ChevronLeft, 
  Loader2, 
  AlertCircle,
  X,
  Star,
  MapPin,
  Database
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import LocationSearch from '../components/LocationSearch';
import MapView from '../components/MapView';
import PlacesList from '../components/PlacesList';
import Filters, { SortOption } from '../components/Filters';
import BookingForm from '../components/BookingForm';
import BookingSummary from '../components/BookingSummary';
import { PaymentMethodSelector, PaymentMethod } from '../components/PaymentMethodSelector';
import { fetchNearbyPlaces, Place } from '../services/placesService';
import { createBooking } from '../services/bookingService';
import { Booking, User as UserType, BookingDetails, PlacesBooking } from '../types';
import BookingConfirmation from './BookingConfirmation';
import toast from 'react-hot-toast';

interface HotelsProps {
  user: UserType | null;
  onBookingSuccess: (booking: Booking) => void;
}

const Hotels = ({ user, onBookingSuccess }: HotelsProps) => {
  const [location, setLocation] = useState<{ lat: number; lon: number; name: string } | null>(() => {
    const saved = localStorage.getItem('last_hotel_location');
    return saved ? JSON.parse(saved) : null;
  });
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  // Filters state
  const [typeFilter, setTypeFilter] = useState<'all' | 'hotel' | 'restaurant' | 'tourism' | 'landmark'>('all');
  const [activeTab, setActiveTab] = useState<'stay' | 'eat' | 'explore'>('stay');
  const [radius, setRadius] = useState(5000);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('rating');

  // Booking state
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [bookingStep, setBookingStep] = useState<'none' | 'details' | 'form' | 'summary' | 'confirmation'>('none');
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<PlacesBooking | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('upi');

  useEffect(() => {
    if (location) {
      loadPlaces();
    }
  }, [location, activeTab, radius]);

  useEffect(() => {
    let result = [...places];
    
    if (typeFilter !== 'all') {
      result = result.filter(p => p.type === typeFilter);
    }
    
    result = result.filter(p => p.price <= priceRange[1]);
    result = result.filter(p => p.rating >= minRating);

    // Sorting logic
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'distance':
        // We'll use the distance field if available, or just keep original order for now
        // Assuming fetchNearbyPlaces provides distance-aware results
        break;
    }
    
    setFilteredPlaces(result);
  }, [places, typeFilter, priceRange, minRating, sortBy]);

  const handleClearFilters = () => {
    setTypeFilter('all');
    setPriceRange([0, 10000]);
    setMinRating(0);
    setSortBy('rating');
    toast.success('Filters cleared');
  };

  const loadPlaces = async () => {
    if (!location) {
      setError('Please select a location to search for places');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Map active tab to API type filtering
      const apiType = activeTab === 'stay' ? 'hotel' : activeTab === 'eat' ? 'restaurant' : 'all';
      console.log(`[Hotels] Loading places: tab=${activeTab}, type=${apiType}, coords=${location.lat},${location.lon}`);
      
      const data = await fetchNearbyPlaces(location.lat, location.lon, radius, apiType);
      console.log(`[Hotels] Received ${data.length} places from service`);
      
      if (data.length === 0) {
        setError('No places found. Try expanding your search radius or changing location.');
        toast('No places found in this area. Try expanding your search radius.', {
          icon: '🔍',
          duration: 4000
        });
      } else {
        setPlaces(data);
        toast.success(`Found ${data.length} places near ${location.name}`);
      }
    } catch (err: any) {
      console.error('[Hotels] Error loading places:', err);
      
      let errorMessage = 'Failed to load nearby places';
      
      if (err.message?.includes('network') || err.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (err.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err.message?.includes('401') || err.message?.includes('403')) {
        errorMessage = 'Authentication error. Please refresh the page and try again.';
      } else if (err.message?.includes('500')) {
        errorMessage = 'Server error. Please try again in a few moments.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (lat: number, lon: number, name: string) => {
    const newLoc = { lat, lon, name };
    setLocation(newLoc);
    localStorage.setItem('last_hotel_location', JSON.stringify(newLoc));
  };

  const handleBookNow = (place: Place) => {
    setSelectedPlace(place);
    setBookingStep('form');
  };

  const handleConfirmForm = (details: BookingDetails) => {
    setBookingDetails(details);
    setBookingStep('summary');
  };

  const handleFinalConfirm = async (method: string, totalAmount: number) => {
    if (!selectedPlace || !bookingDetails) return;

    try {
      setIsLoading(true);

      const bookingData = {
        userId: user?.id || 'guest',
        userName: user?.name || 'Guest User',
        userEmail: user?.email || 'guest@example.com',
        item_id: selectedPlace.id,
        item_name: selectedPlace.name,
        item_type: selectedPlace.type,
        amount: totalAmount,
        date: bookingDetails.checkIn || new Date().toISOString().split('T')[0],
        time: '14:00',
        destination: selectedPlace.address
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
      if (!orderResponse.ok) throw new Error(orderData.error || 'Payment initiation failed');

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

      const processCompletion = async (paymentId?: string, _signature?: string) => {
        if (!selectedPlace || !bookingDetails) return;
        
        const confirmation: PlacesBooking = {
          id: orderData.bookingId,
          place: selectedPlace,
          details: bookingDetails,
          amount: totalAmount,
          paymentId: paymentId,
          timestamp: new Date().toISOString()
        };
        setConfirmedBooking(confirmation);
        setBookingStep('confirmation');
        toast.success(`Booking confirmed for ${selectedPlace.name}!`);
      };

      // Handle Mock Flow for Demo - CHECK THIS FIRST
      if (orderData.isMock) {
        toast.success("Demo Mode: Auto-confirming booking...");
        try {
          await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: orderData.order_id,
              bookingDetails: { id: orderData.bookingId }
            })
          });
          await processCompletion();
        } catch (verifyErr) {
          console.error('[Hotels] Mock verification error:', verifyErr);
          toast.error('Local verification failed');
        }
        return;
      }

      // Already declared: const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error('Razorpay Key missing. Set VITE_RAZORPAY_KEY_ID.');
      }

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SOLO CIRCLE",
        description: `Booking for ${selectedPlace.name}`,
        order_id: orderData.order_id,
        prefill: {
          name: user?.name || user?.email?.split('@')[0],
          email: user?.email,
          contact: user?.phone || '',
          method: method === 'upi' ? 'upi' : undefined,
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay using UPI Apps',
                instruments: [
                  {
                    method: 'upi',
                    apps: ['google_pay', 'phonepe', 'paytm']
                  }
                ]
              }
            },
            sequence: method === 'upi' ? ['block.upi'] : ['block.upi', 'block.card', 'block.netbanking'],
            preferences: {
              show_default_blocks: method !== 'upi'
            }
          }
        },
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingDetails: { id: orderData.bookingId }
            })
          });

          if (verifyRes.ok) {
            await processCompletion(response.razorpay_payment_id, response.razorpay_signature);
          } else {
            toast.error('Payment verification failed');
          }
        },
        theme: { color: "#4f46e5" },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      console.error('[Hotels] Payment flow error:', err);
      toast.error(err.message || 'Payment process failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (bookingStep === 'confirmation' && confirmedBooking) {
    return <BookingConfirmation booking={confirmedBooking} onBack={() => setBookingStep('none')} />;
  }

  const featuredLocations = [
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
    { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
    { name: 'New Delhi', lat: 28.6139, lon: 77.2090 },
    { name: 'Goa', lat: 15.2993, lon: 74.1240 },
    { name: 'Paris', lat: 48.8566, lon: 2.3522 },
    { name: 'London', lat: 51.5074, lon: -0.1278 }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
      {/* Search Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 md:px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="shrink-0">
              <h2 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight flex items-center">
                <Hotel className="mr-2 text-indigo-600 w-5 h-5 md:w-6 md:h-6" />
                Discovery
              </h2>
            </div>
            <div className="flex-1 w-full max-w-2xl">
              <LocationSearch onSelect={handleLocationSelect} />
            </div>
            <div className="flex items-center space-x-1 md:space-x-2 bg-slate-100 p-1 rounded-2xl w-full md:w-auto">
              <button 
                onClick={() => setViewMode('list')}
                className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-xl text-[10px] md:text-xs font-black flex items-center justify-center space-x-2 transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >
                <List size={14} className="md:w-4 md:h-4" />
                <span>List</span>
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-xl text-[10px] md:text-xs font-black flex items-center justify-center space-x-2 transition-all ${viewMode === 'map' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >
                <MapIcon size={14} className="md:w-4 md:h-4" />
                <span>Map</span>
              </button>
            </div>
          </div>

          {/* Explore Tabs */}
          <div className="flex items-center space-x-6 border-b border-slate-100">
            {[
              { id: 'stay', label: 'Stay', icon: Hotel },
              { id: 'eat', label: 'Eat', icon: Utensils },
              { id: 'explore', label: 'Explore', icon: MapPin },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 px-2 text-sm font-black flex items-center space-x-2 transition-all relative ${
                  activeTab === tab.id 
                    ? 'text-indigo-600' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTabHeader"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {!location ? (
          <div className="space-y-12">
            <div className="flex flex-col items-center justify-center py-10 md:py-20 space-y-6 md:space-y-8">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 animate-pulse">
                  <MapPin size={32} className="md:w-12 md:h-12" />
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-indigo-400/20 rounded-full -z-10"
                />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl md:text-3xl font-black text-slate-900">Where to next?</h3>
                <p className="text-slate-500 text-sm md:text-base font-medium max-w-md px-4">Search for a city or landmark to find the best hotels and restaurants nearby.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-xl font-black text-slate-900 px-2">Popular Destinations</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {featuredLocations.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => handleLocationSelect(loc.lat, loc.lon, loc.name)}
                    className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all text-center space-y-3 group"
                  >
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <MapPin size={24} />
                    </div>
                    <span className="text-sm font-black text-slate-800 tracking-tight">{loc.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* Filters - Desktop */}
            <div className="hidden lg:block space-y-8">
              <Filters 
                type={typeFilter}
                setType={setTypeFilter}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                minRating={minRating}
                setMinRating={setMinRating}
                sortBy={sortBy}
                setSortBy={setSortBy}
                radius={radius}
                setRadius={setRadius}
              />
              
              <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <h4 className="text-xl font-black leading-tight relative z-10">Exclusive Deals</h4>
                <p className="text-indigo-100 text-xs font-medium leading-relaxed relative z-10">Save up to 40% on selected premium hotels this weekend.</p>
                <button className="w-full py-3 bg-white text-indigo-600 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all relative z-10">
                  View Offers
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {error && (
                <div className="bg-red-50 border border-red-100 p-6 rounded-[2rem] flex items-center space-x-4 text-red-900">
                  <AlertCircle className="text-red-500 shrink-0" size={24} />
                  <p className="font-bold">{error}</p>
                  <button onClick={loadPlaces} className="ml-auto px-4 py-2 bg-red-100 hover:bg-red-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all">Retry</button>
                </div>
              )}

              {viewMode === 'list' ? (
                <PlacesList 
                  places={filteredPlaces} 
                  isLoading={isLoading} 
                  userId={user?.id}
                  onViewDetails={(p) => { setSelectedPlace(p); setBookingStep('details'); }}
                  onBookNow={handleBookNow}
                  onClearFilters={handleClearFilters}
                />
              ) : (
                <div className="h-[70vh] w-full">
                  <MapView 
                    center={[location.lat, location.lon]} 
                    places={filteredPlaces} 
                    onViewDetails={(p) => { setSelectedPlace(p); setBookingStep('details'); }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {bookingStep !== 'none' && bookingStep !== 'confirmation' && selectedPlace && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-60 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white max-w-2xl w-full rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-2xl font-black text-slate-900">
                  {bookingStep === 'details' ? 'Place Details' : bookingStep === 'form' ? 'Booking Details' : 'Review Booking'}
                </h3>
                <button onClick={() => setBookingStep('none')} className="text-slate-400 hover:text-slate-600" title="Close"><X size={24} /></button>
              </div>

              <div className="p-8">
                {bookingStep === 'details' && (
                  <div className="space-y-8">
                    <img src={selectedPlace.image} className="w-full h-64 object-cover rounded-[2rem]" alt={selectedPlace.name} referrerPolicy="no-referrer" />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-3xl font-black text-slate-900">{selectedPlace.name}</h4>
                        <div className="flex items-center bg-amber-50 text-amber-500 px-4 py-2 rounded-2xl border border-amber-100">
                          <Star size={18} className="fill-amber-500 mr-2" />
                          <span className="font-black">{selectedPlace.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-slate-500 font-medium">
                        <MapPin size={18} className="mr-2 text-indigo-500" />
                        <span>{selectedPlace.address}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-medium">
                        Experience the best of {selectedPlace.type === 'hotel' ? 'hospitality' : 'dining'} at {selectedPlace.name}. Located in the heart of the city, we offer exceptional {selectedPlace.type === 'hotel' ? 'rooms and amenities' : 'cuisine and ambiance'} for a memorable experience.
                      </p>
                    </div>
                    <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-black text-slate-900">₹{selectedPlace.price.toLocaleString()}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{selectedPlace.type === 'hotel' ? 'per night' : 'per person'}</p>
                      </div>
                      <button 
                        onClick={() => setBookingStep('form')}
                        className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                )}

                {bookingStep === 'form' && (
                  <BookingForm 
                    place={selectedPlace} 
                    onConfirm={handleConfirmForm} 
                    onCancel={() => setBookingStep('details')} 
                  />
                )}

                {bookingStep === 'summary' && selectedPlace && bookingDetails && (
                  <div className="space-y-6">
                    <PaymentMethodSelector 
                      selected={selectedPaymentMethod}
                      onSelect={setSelectedPaymentMethod}
                    />
                    <BookingSummary 
                      place={selectedPlace} 
                      bookingDetails={bookingDetails} 
                      onConfirm={handleFinalConfirm}
                      isLoading={isLoading}
                      paymentMethod={selectedPaymentMethod}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Hotels;
