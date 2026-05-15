import React from 'react';
import { Place } from '../services/placesService';
import PlaceCard from './PlaceCard';
import { Search } from 'lucide-react';

interface PlacesListProps {
  places: Place[];
  isLoading: boolean;
  userId?: string;
  onViewDetails: (place: Place) => void;
  onBookNow: (place: Place) => void;
  onClearFilters: () => void;
}

const PlacesList = ({ places, isLoading, userId, onViewDetails, onBookNow, onClearFilters }: PlacesListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-[2.5rem] h-96 animate-pulse border border-slate-100">
            <div className="h-56 bg-slate-100 rounded-t-[2.5rem]" />
            <div className="p-6 space-y-4">
              <div className="h-6 bg-slate-100 rounded-lg w-3/4" />
              <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
              <div className="pt-4 flex justify-between">
                <div className="h-8 bg-slate-100 rounded-lg w-1/3" />
                <div className="h-10 bg-slate-100 rounded-lg w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="py-20 text-center space-y-6 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
          <Search size={40} />
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="text-2xl font-black text-slate-900">No places found</h4>
            <p className="text-slate-500 mt-2 font-medium">Try expanding your search radius or adjusting filters.</p>
          </div>
          <button 
            onClick={onClearFilters || (() => window.location.reload())}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Clear Filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {places.map((place) => (
        <PlaceCard
          key={place.id}
          place={place}
          userId={userId}
          onViewDetails={onViewDetails}
          onBookNow={onBookNow}
        />
      ))}
    </div>
  );
};

export default PlacesList;
