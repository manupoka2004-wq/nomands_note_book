import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { PlaceResult } from '../types';
import { addToWishlist, removeFromWishlist, getWishlist } from '../services/wishlistService';
import { supabase } from '../lib/supabase';

interface WishlistButtonProps {
  item: PlaceResult;
}

export default function WishlistButton({ item }: WishlistButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        checkIfFavorite(user.id);
      }
    });
  }, [item.id]);

  const checkIfFavorite = async (userId: string) => {
    const wishlist = await getWishlist(userId);
    setIsFavorite(wishlist.some(w => w.item_id === item.id));
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('Please login to save favorites');
      return;
    }

    if (isFavorite) {
      await removeFromWishlist(user.id, item.id);
      setIsFavorite(false);
    } else {
      await addToWishlist(user.id, item);
      setIsFavorite(true);
    }
  };

  return (
    <button 
      onClick={toggleFavorite}
      title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
      className={`p-2 rounded-full backdrop-blur-md transition-all ${
        isFavorite 
          ? 'bg-red-500 text-white shadow-lg shadow-red-200' 
          : 'bg-white/80 text-slate-400 hover:text-red-500 hover:bg-white'
      }`}
    >
      <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
    </button>
  );
}
