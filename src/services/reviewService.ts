import { supabase } from '../lib/supabase';
import { Review } from '../types';

const REVIEWS_KEY = 'tripmaker_reviews';

export async function submitReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
  const newReview = {
    ...review,
    id: Math.random().toString(36).substring(2, 11),
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([newReview])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err: any) {
    if (err.message?.includes('relation "reviews" does not exist')) {
      console.error('[ReviewService] Supabase table "reviews" is missing. Please run the setup SQL script.');
    }
    console.warn('[ReviewService] Supabase error (submitReview), falling back to localStorage:', err);
    const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
    reviews.push(newReview);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    return newReview;
  }
}

export async function getItemReviews(itemId: string): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (err: any) {
    if (err.message?.includes('relation "reviews" does not exist')) {
      console.error('[ReviewService] Supabase table "reviews" is missing. Please run the setup SQL script.');
    }
    console.warn('[ReviewService] Supabase error (getItemReviews), falling back to localStorage:', err);
    const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
    return reviews.filter((r: Review) => r.item_id === itemId);
  }
}
