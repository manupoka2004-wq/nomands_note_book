import React, { useState, useEffect } from 'react';
import { Star, Send, User as UserIcon, MessageSquare } from 'lucide-react';
import { Review } from '../types';
import { submitReview, getItemReviews } from '../services/reviewService';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

interface ReviewSectionProps {
  itemId: string;
}

export default function ReviewSection({ itemId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
    fetchReviews();
  }, [itemId]);

  const fetchReviews = async () => {
    const data = await getItemReviews(itemId);
    setReviews(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to submit a review');
      return;
    }
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      await submitReview({
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email.split('@')[0],
        item_id: itemId,
        rating,
        comment
      });
      setComment('');
      setRating(5);
      fetchReviews();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-900 flex items-center">
          <MessageSquare className="mr-2 text-indigo-600" size={24} />
          Reviews ({reviews.length})
        </h3>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button 
                key={s} 
                type="button"
                onClick={() => setRating(s)}
                title={`Rate ${s} stars`}
                className="transition-transform hover:scale-110"
              >
                <Star 
                  size={24} 
                  className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} 
                />
              </button>
            ))}
            <span className="ml-2 text-sm font-black text-slate-500">{rating}/5</span>
          </div>
          <div className="relative">
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all h-24 resize-none"
            />
            <button 
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              title="Submit review"
              className="absolute bottom-3 right-3 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-slate-50 p-6 rounded-[2rem] text-center">
          <p className="text-sm font-bold text-slate-500">Please login to leave a review.</p>
        </div>
      )}

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {reviews.length > 0 ? (
            reviews.map((r, idx) => (
              <motion.div 
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{r.user_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center bg-amber-50 px-2 py-1 rounded-lg">
                    <Star size={12} className="text-amber-500 fill-amber-500 mr-1" />
                    <span className="text-xs font-black text-amber-600">{r.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{r.comment}</p>
              </motion.div>
            ))
          ) : (
            <div className="py-10 text-center text-slate-400 italic text-sm">
              No reviews yet. Be the first to review!
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
