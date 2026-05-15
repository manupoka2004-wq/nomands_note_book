import React from 'react';
import { Hotel, Utensils, Star, Clock, MapPin, ArrowUpDown, Compass, Landmark, Gauge } from 'lucide-react';

export type SortOption = 'rating' | 'price-low' | 'price-high' | 'distance';

interface FiltersProps {
  type: 'all' | 'hotel' | 'restaurant' | 'tourism' | 'landmark';
  setType: (type: 'all' | 'hotel' | 'restaurant' | 'tourism' | 'landmark') => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  radius: number;
  setRadius: (radius: number) => void;
}

const Filters: React.FC<FiltersProps> = ({ 
  type, setType, priceRange, setPriceRange, minRating, setMinRating, sortBy, setSortBy, radius, setRadius 
}) => {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-8">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
            <Gauge size={14} className="mr-2" />
            Search Radius
          </h4>
          <span className="text-xs font-bold text-indigo-600">{(radius / 1000).toFixed(1)} km</span>
        </div>
        <input
          type="range"
          min="1000"
          max="20000"
          step="1000"
          title="Search Radius"
          value={radius}
          onChange={(e) => setRadius(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between mt-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
          <span>1km</span>
          <span>10km</span>
          <span>20km</span>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Sort By</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'rating', label: 'Top Rated' },
            { id: 'price-low', label: 'Price: Low' },
            { id: 'price-high', label: 'Price: High' },
            { id: 'distance', label: 'Nearest' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id as SortOption)}
              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center ${
                sortBy === opt.id 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Category</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All', icon: MapPin },
            { id: 'hotel', label: 'Hotels', icon: Hotel },
            { id: 'restaurant', label: 'Restaurants', icon: Utensils },
            { id: 'tourism', label: 'Tourism', icon: Compass },
            { id: 'landmark', label: 'Landmarks', icon: Landmark },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setType(cat.id as any)}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all ${
                type === cat.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <cat.icon size={16} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Price Range</h4>
          <span className="text-xs font-bold text-indigo-600">₹{priceRange[0]} - ₹{priceRange[1]}</span>
        </div>
        <input
          type="range"
          min="0"
          max="10000"
          step="500"
          title="Price Range"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
      </div>

      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Minimum Rating</h4>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setMinRating(star)}
              title={`Minimum ${star} stars`}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                minRating >= star 
                  ? 'bg-amber-50 text-amber-500 border border-amber-100' 
                  : 'bg-slate-50 text-slate-400'
              }`}
            >
              <Star size={18} className={minRating >= star ? 'fill-amber-500' : ''} />
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <label className="flex items-center space-x-3 cursor-pointer group">
          <div className="w-10 h-6 bg-slate-100 rounded-full relative transition-colors group-hover:bg-slate-200">
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
          </div>
          <span className="text-sm font-bold text-slate-600">Open Now</span>
        </label>
      </div>
    </div>
  );
};

export default Filters;
