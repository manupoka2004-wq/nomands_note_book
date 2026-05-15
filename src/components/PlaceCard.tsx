import React from 'react';
import { Star, MapPin, ChevronRight, Utensils, Hotel, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Place } from '../services/placesService';
import { addToWishlist, removeFromWishlist, getWishlist } from '../services/wishlistService';
import toast from 'react-hot-toast';

interface PlaceCardProps {
  place: Place;
  onViewDetails: (place: Place) => void;
  onBookNow: (place: Place) => void;
  userId?: string;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onViewDetails, onBookNow, userId }) => {
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  React.useEffect(() => {
    if (userId && userId !== 'guest') {
      getWishlist(userId).then(list => {
        setIsWishlisted(list.some(item => item.item_id === place.id));
      });
    }
  }, [userId, place.id]);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || userId === 'guest') {
      toast.error('Please login to use wishlist');
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(userId, place.id);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(userId, {
          id: place.id,
          name: place.name,
          location: place.address,
          price: place.price,
          type: place.type as any,
          lat: place.lat,
          lng: place.lon,
          rating: place.rating,
          reviews: Math.floor(Math.random() * 100),
          image: place.image,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`
        });
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error('Wishlist action failed');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 w-full"
    >
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <img
          src={place.image}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <div className={`px-3 py-1.5 rounded-full flex items-center space-x-2 backdrop-blur-md border border-white/20 shadow-lg ${
            place.type === 'hotel' ? 'bg-indigo-600/90 text-white' : 'bg-emerald-600/90 text-white'
          }`}>
            {place.type === 'hotel' ? <Hotel size={14} /> : <Utensils size={14} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{place.type}</span>
          </div>
        </div>
        <div className="absolute top-4 right-4 flex flex-col items-end space-y-2">
          <button 
            onClick={handleWishlist}
            className={`p-2 rounded-full backdrop-blur-md border border-white/20 shadow-lg transition-all ${
              isWishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-400 hover:text-red-500'
            }`}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart size={16} className={isWishlisted ? 'fill-white' : ''} />
          </button>
          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center shadow-lg border border-white">
            <Star size={14} className="text-amber-400 fill-amber-400 mr-1" />
            <span className="text-sm font-black text-slate-900">{place.rating}</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 line-clamp-1">{place.name}</h3>
          <div className="flex items-center text-slate-500 text-sm mt-1 font-medium">
            <MapPin size={14} className="mr-1 shrink-0 text-indigo-500" />
            <span className="truncate">{place.address}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              ₹{place.price.toLocaleString()}
              <span className="text-xs font-medium text-slate-400 ml-1">
                {place.type === 'hotel' ? '/night' : '/person'}
              </span>
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onViewDetails(place)}
              className="flex-1 sm:flex-none p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center"
              title="View Details"
            >
              <ChevronRight size={20} className="sm:hidden mr-2" />
              <span className="text-sm font-bold sm:hidden">Details</span>
              <ChevronRight size={20} className="hidden sm:block" />
            </button>
            <button
              onClick={() => onBookNow(place)}
              className="flex-3 sm:flex-none px-6 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 text-sm sm:text-base"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlaceCard;
