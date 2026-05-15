import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X, Navigation } from 'lucide-react';
import { searchLocations, LocationSuggestion } from '../services/geocodeService';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

interface LocationSearchProps {
  onSelect: (lat: number, lon: number, name: string) => void;
  placeholder?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onSelect, placeholder = "Search city, area or landmark..." }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
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
        setIsOpen(true);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  const handleSelect = (s: LocationSuggestion) => {
    onSelect(parseFloat(s.lat), parseFloat(s.lon), s.display_name);
    setQuery(s.display_name.split(',')[0]);
    setIsOpen(false);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode to get a name
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const name = data.display_name || `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          onSelect(latitude, longitude, name);
          setQuery(name.split(',')[0]);
          setIsOpen(false);
          toast.success("Location updated");
        } catch (err) {
          onSelect(latitude, longitude, "Current Location");
          setQuery("Current Location");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        toast.error("Unable to retrieve your location");
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-24 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 font-medium"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          {query && (
            <button 
              onClick={() => setQuery('')}
              title="Clear search"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <X size={18} />
            </button>
          )}
          <button
            onClick={useCurrentLocation}
            disabled={isLocating}
            title="Use current location"
            className={`p-1.5 rounded-lg transition-colors ${isLocating ? 'text-indigo-400 animate-pulse' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'}`}
          >
            <Navigation size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (suggestions.length > 0 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
          >
            {isLoading ? (
              <div className="p-8 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="animate-spin text-indigo-600" size={24} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Finding locations...</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {suggestions.map((s) => (
                  <button
                    key={s.place_id}
                    onClick={() => handleSelect(s)}
                    className="w-full px-4 py-4 text-left hover:bg-slate-50 flex items-start space-x-3 border-b border-slate-50 last:border-0 transition-colors"
                  >
                    <MapPin className="text-slate-400 mt-1 shrink-0" size={18} />
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

export default LocationSearch;
