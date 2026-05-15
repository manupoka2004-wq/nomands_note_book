import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Place } from '../services/placesService';
import { Star, MapPin, Hotel, Utensils, Compass, Landmark, Library } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

interface PlaceMarkerProps {
  place: Place;
  onViewDetails: (place: Place) => void;
}

const getMarkerConfig = (type: string) => {
  switch (type) {
    case 'hotel':
      return { icon: Hotel, color: 'bg-indigo-600' };
    case 'restaurant':
      return { icon: Utensils, color: 'bg-emerald-600' };
    case 'museum':
      return { icon: Library, color: 'bg-amber-600' };
    case 'temple':
      return { icon: Landmark, color: 'bg-orange-600' };
    case 'attraction':
    case 'tourism':
    case 'landmark':
      return { icon: Compass, color: 'bg-rose-600' };
    default:
      return { icon: MapPin, color: 'bg-slate-600' };
  }
};

const PlaceMarker: React.FC<PlaceMarkerProps> = ({ place, onViewDetails }) => {
  const { icon: Icon, color: markerColor } = getMarkerConfig(place.type);
  const iconHtml = renderToStaticMarkup(
    <div className={`p-2 rounded-full border-2 border-white shadow-lg ${markerColor}`}>
      <Icon size={16} color="white" />
    </div>
  );

  const customIcon = L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <Marker position={[place.lat, place.lon]} icon={customIcon}>
      <Popup className="custom-popup">
        <div className="p-2 min-w-50 space-y-3">
          <img src={place.image} className="w-full h-24 object-cover rounded-lg" alt={place.name} referrerPolicy="no-referrer" />
          <div>
            <h4 className="font-black text-slate-900 leading-tight">{place.name}</h4>
            <div className="flex items-center text-[10px] text-slate-500 mt-1 font-bold">
              <MapPin size={10} className="mr-1" />
              <span className="truncate">{place.address}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center text-amber-500 font-black text-xs">
              <Star size={12} className="fill-amber-500 mr-1" />
              {place.rating}
            </div>
            <div className="text-indigo-600 font-black text-xs">
              ₹{place.price.toLocaleString()}
            </div>
          </div>
          <button
            onClick={() => onViewDetails(place)}
            className="w-full py-2 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase tracking-widest hover:bg-slate-800 transition-all"
          >
            View Details
          </button>
        </div>
      </Popup>
    </Marker>
  );
};

export default PlaceMarker;
