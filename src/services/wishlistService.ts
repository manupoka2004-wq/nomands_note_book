import { supabase, isSupabaseConfigured, isValidUUID } from '../lib/supabase';
import { WishlistItem, PlaceResult } from '../types';

const WISHLIST_KEY = 'tripmaker_wishlist';

export async function addToWishlist(userId: string, item: PlaceResult): Promise<WishlistItem> {
  const newItem: WishlistItem = {
    id: Math.random().toString(36).substring(2, 11),
    user_id: userId,
    item_id: item.id,
    item_data: item,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured() && isValidUUID(userId)) {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .insert([newItem])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      if (err.message?.includes('relation "wishlist" does not exist')) {
        console.error('[WishlistService] Supabase table "wishlist" is missing. Please run the setup SQL script.');
      }
      console.warn('[WishlistService] Supabase error (addToWishlist), falling back to localStorage:', err);
    }
  }

  const wishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
  wishlist.push(newItem);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  return newItem;
}

export async function removeFromWishlist(userId: string, itemId: string): Promise<void> {
  if (isSupabaseConfigured() && isValidUUID(userId)) {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('item_id', itemId);

      if (error) throw error;
      return;
    } catch (err: any) {
      if (err.message?.includes('relation "wishlist" does not exist')) {
        console.error('[WishlistService] Supabase table "wishlist" is missing. Please run the setup SQL script.');
      }
      console.warn('[WishlistService] Supabase error (removeFromWishlist), falling back to localStorage:', err);
    }
  }

  const wishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
  const filtered = wishlist.filter((w: WishlistItem) => !(w.user_id === userId && w.item_id === itemId));
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(filtered));
}

export async function getWishlist(userId: string): Promise<WishlistItem[]> {
  if (!userId || userId === 'guest') return [];
  
  if (isSupabaseConfigured() && isValidUUID(userId)) {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    } catch (err: any) {
      if (err.message?.includes('relation "wishlist" does not exist')) {
        console.error('[WishlistService] Supabase table "wishlist" is missing. Please run the setup SQL script.');
      }
      console.warn('[WishlistService] Supabase error (getWishlist), falling back to localStorage:', err);
    }
  }

  const wishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
  return wishlist.filter((w: WishlistItem) => w.user_id === userId);
}
