import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, X, Loader2, Plus, GripVertical } from 'lucide-react';
import { searchLocations, LocationSuggestion } from '../services/geocodeService';
import { motion, AnimatePresence, Reorder } from 'motion/react';

interface RideStop {
  id: string;
  address: string;
  lat: number;
  lng: number;
}

interface BookingFormProps {
  onLocationSelect: (type: 'pickup' | 'destination' | 'stop', lat: number, lng: number, address: string, stopId?: string) => void;
  pickupAddress: string;
  destinationAddress: string;
  stops: RideStop[];
  onAddStop: () => void;
  onRemoveStop: (id: string) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ 
  onLocationSelect, 
  pickupAddress, 
  destinationAddress, 
  stops,
  onAddStop,
  onRemoveStop
}) => {
  const [pickupSearch, setPickupSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');
  const [stopSearches, setStopSearches] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [activeInput, setActiveInput] = useState<{ type: 'pickup' | 'destination' | 'stop', id?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let query = '';
    if (activeInput?.type === 'pickup') query = pickupSearch;
    else if (activeInput?.type === 'destination') query = destSearch;
    else if (activeInput?.type === 'stop' && activeInput.id) query = stopSearches[activeInput.id] || '';
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchLocations(query);
        setSuggestions(results);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [pickupSearch, destSearch, stopSearches, activeInput]);

  const handleSelect = (suggestion: LocationSuggestion) => {
    if (activeInput) {
      onLocationSelect(
        activeInput.type, 
        parseFloat(suggestion.lat), 
        parseFloat(suggestion.lon), 
        suggestion.display_name,
        activeInput.id
      );
      
      if (activeInput.type === 'pickup') {
        setPickupSearch(suggestion.display_name);
      } else if (activeInput.type === 'destination') {
        setDestSearch(suggestion.display_name);
      } else if (activeInput.type === 'stop' && activeInput.id) {
        setStopSearches(prev => ({ ...prev, [activeInput.id!]: suggestion.display_name }));
      }
      
      setSuggestions([]);
      setActiveInput(null);
    }
  };

  return (
    <div className="space-y-4 relative">
      <div className="flex flex-col space-y-3">
        {/* Pickup Input */}
        <div className="relative flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Pickup location"
              value={activeInput?.type === 'pickup' ? pickupSearch : pickupAddress || pickupSearch}
              onChange={(e) => setPickupSearch(e.target.value)}
              onFocus={() => setActiveInput({ type: 'pickup' })}
              className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
            {pickupSearch && activeInput?.type === 'pickup' && (
              <button 
                onClick={() => setPickupSearch('')}
                title="Clear pickup"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Stops */}
        <AnimatePresence>
          {stops.map((stop, index) => (
            <motion.div 
              key={stop.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="relative flex items-center space-x-3"
            >
              <div className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={`Stop ${index + 1}`}
                  value={activeInput?.id === stop.id ? stopSearches[stop.id] : stop.address || stopSearches[stop.id]}
                  onChange={(e) => setStopSearches(prev => ({ ...prev, [stop.id]: e.target.value }))}
                  onFocus={() => setActiveInput({ type: 'stop', id: stop.id })}
                  className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-400 outline-none transition-all"
                />
                <button 
                  onClick={() => onRemoveStop(stop.id)}
                  title="Remove stop"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Destination Input */}
        <div className="relative flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Where to?"
              value={activeInput?.type === 'destination' ? destSearch : destinationAddress || destSearch}
              onChange={(e) => setDestSearch(e.target.value)}
              onFocus={() => setActiveInput({ type: 'destination' })}
              className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
            />
            {destSearch && activeInput?.type === 'destination' && (
              <button 
                onClick={() => setDestSearch('')}
                title="Clear destination"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Stop Button */}
      <button 
        onClick={onAddStop}
        className="flex items-center space-x-2 text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors ml-5"
        title="Add a stop"
      >
        <Plus size={14} />
        <span>Add Stop</span>
      </button>

      {/* Suggestions List */}
      <AnimatePresence>
        {activeInput && (suggestions.length > 0 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
          >
            {isLoading ? (
              <div className="p-8 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="animate-spin text-indigo-600" size={24} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Searching locations...</p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {suggestions.map((s) => (
                  <button
                    key={s.place_id}
                    onClick={() => handleSelect(s)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-start space-x-3 border-b border-slate-50 last:border-0 transition-colors"
                  >
                    <MapPin className="text-slate-400 mt-0.5 shrink-0" size={18} />
                    <div>
                      <p className="text-sm font-bold text-slate-900 line-clamp-1">{s.display_name.split(',')[0]}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{s.display_name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingForm;
