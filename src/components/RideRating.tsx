import React, { useState } from 'react';
import { Star, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RideRatingProps {
  onComplete: (rating: number, comment: string) => void;
  driverName: string;
}

const RideRating: React.FC<RideRatingProps> = ({ onComplete, driverName }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    setIsSubmitted(true);
    setTimeout(() => {
      onComplete(rating, comment);
    }, 2000);
  };

  return (
    <div className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="rating-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6 text-center"
          >
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">How was your ride?</h3>
              <p className="text-slate-500 font-medium text-sm">Rate your experience with {driverName}</p>
            </div>

            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                  className="p-2 transition-all transform hover:scale-110"
                  title={`Rate ${star} stars`}
                >
                  <Star
                    size={40}
                    className={`${
                      star <= (hover || rating) 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-slate-200'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>

            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 text-slate-400" size={20} />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Any feedback for the driver?"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium min-h-[120px] resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={rating === 0}
              className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 ${
                rating > 0 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Submit Feedback</span>
              <Send size={18} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-12 text-center space-y-4"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Thank You!</h3>
            <p className="text-slate-500 font-medium">Your feedback helps us improve.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RideRating;
