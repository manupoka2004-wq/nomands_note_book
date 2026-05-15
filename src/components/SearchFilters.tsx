import React from 'react';
import { Filter, SlidersHorizontal, ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';

interface SearchFiltersProps {
  filters: {
    minPrice: number;
    maxPrice: number;
    minRating: number;
    sortBy: 'price-asc' | 'price-desc' | 'rating-desc';
  };
  setFilters: (filters: any) => void;
}

export default function SearchFilters({ filters, setFilters }: SearchFiltersProps) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center space-x-2 text-slate-900 mb-2">
        <SlidersHorizontal size={18} />
        <h3 className="font-black text-sm uppercase tracking-widest">Advanced Filters</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price Range (₹)</label>
          <div className="flex items-center space-x-3">
            <input 
              type="number" 
              placeholder="Min" 
              value={filters.minPrice || ''} 
              onChange={(e) => setFilters({...filters, minPrice: Number(e.target.value)})}
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none"
            />
            <span className="text-slate-300">-</span>
            <input 
              type="number" 
              placeholder="Max" 
              value={filters.maxPrice || ''} 
              onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})}
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Minimum Rating</label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button 
                key={r}
                onClick={() => setFilters({...filters, minRating: r})}
                title={`Filter by ${r} stars and above`}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                  filters.minRating === r 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                {r}+ ★
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="sort-by-select" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sort By</label>
          <select 
            id="sort-by-select"
            value={filters.sortBy}
            onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
            title="Sort options"
            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none appearance-none cursor-pointer"
          >
            <option value="rating-desc">Highest Rating</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <button 
        onClick={() => setFilters({ minPrice: 0, maxPrice: 100000, minRating: 0, sortBy: 'rating-desc' })}
        className="w-full py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
        title="Reset all filters to default"
      >
        Reset Filters
      </button>
    </div>
  );
}
