import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquarePlus, Sparkles, Filter } from 'lucide-react';
import { RESTAURANT_INFO, REVIEWS_DATA } from '../data/restaurantData';
import { Review } from '../types/restaurant';
import { BusinessInfo, TestimonialItem } from '../types/cms';

interface GoogleMapsReviewsProps {
  cmsTestimonials?: TestimonialItem[];
  businessInfo?: BusinessInfo;
}

export const GoogleMapsReviews: React.FC<GoogleMapsReviewsProps> = ({
  cmsTestimonials,
  businessInfo
}) => {
  const [reviews, setReviews] = useState<Review[]>(REVIEWS_DATA);
  const [activeTag, setActiveTag] = useState<string>('all');
  const [showWriteModal, setShowWriteModal] = useState<boolean>(false);
  const [newAuthor, setNewAuthor] = useState<string>('');
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [newTags, setNewTags] = useState<string>('pizza, service');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (cmsTestimonials && cmsTestimonials.length > 0) {
      setReviews(
        cmsTestimonials.map(t => ({
          id: t.id,
          author: t.author,
          authorSubtitle: t.authorSubtitle,
          rating: t.rating,
          timeAgo: t.timeAgo,
          comment: t.comment,
          tags: t.tags,
          likes: t.likes
        }))
      );
    }
  }, [cmsTestimonials]);

  const summary = businessInfo?.geminiSummary || RESTAURANT_INFO.geminiSummary;

  const filterTags = [
    { id: 'all', label: 'All Reviews' },
    { id: 'foosball', label: 'foosball' },
    { id: 'pool', label: 'pool' },
    { id: 'pizza', label: 'pizza' },
    { id: 'onion rings', label: 'onion rings' },
    { id: 'pickle cigars', label: 'pickle cigars' },
    { id: 'local bar and grill', label: 'local bar and grill' }
  ];

  const filteredReviews = reviews.filter(r => {
    if (activeTag === 'all') return true;
    return r.tags.some(t => t.toLowerCase() === activeTag.toLowerCase());
  });

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const tagList = newTags
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: newAuthor.trim(),
          rating: newRating,
          comment: newComment.trim(),
          tags: tagList
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setReviews([data.data, ...reviews]);
        setNewAuthor('');
        setNewComment('');
        setShowWriteModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="py-16 sm:py-24 bg-stone-900/30 border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Google Maps Verified Customer Reviews</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display text-balance">
              4.6 Stars from Over 149 Diners
            </h2>
            <p className="text-sm text-stone-400 mt-1">
              Read authentic feedback from locals, travelers, and food lovers in Usk, WA.
            </p>
          </div>

          <button
            onClick={() => setShowWriteModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition shadow-md self-start md:self-auto cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Gemini AI Summary Card from Google Maps */}
        <div className="mb-10 p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-lg">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-800">
            <div className="flex items-center gap-3">
              <img
                src={businessInfo?.logoUrl || '/logo.png'}
                alt="Usk Bar and Grill Logo"
                className="w-9 h-9 rounded-full object-cover ring-1 ring-amber-500/40"
              />
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Google Maps Review Summary</span>
                </div>
                <span className="text-[11px] text-stone-400">AI consensus summarized from 149 diner experiences</span>
              </div>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-stone-800 text-stone-300 border border-stone-700">
              Verified Atmosphere
            </span>
          </div>
          <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-sans">
            "{summary}"
          </p>

          <div className="mt-4 pt-4 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-amber-400 font-bold text-lg font-mono">
                <span>4.6</span>
                <div className="flex text-amber-400">
                  {'★'.repeat(5)}
                </div>
              </div>
              <span className="text-stone-400">Based on verified customer visits</span>
            </div>
            <span className="text-stone-400">Average spend: <strong>$10–20 per person</strong></span>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-stone-500 shrink-0 ml-1" />
          {filterTags.map(tag => (
            <button
              key={tag.id}
              onClick={() => setActiveTag(tag.id)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition whitespace-nowrap cursor-pointer ${
                activeTag === tag.id
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-900 border border-stone-800 text-stone-300 hover:text-white'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map(review => (
            <div
              key={review.id}
              className="p-5 bg-stone-900/60 border border-stone-800 rounded-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-white">{review.author}</h4>
                    <p className="text-[11px] text-stone-400">{review.authorSubtitle}</p>
                  </div>
                  <span className="text-xs text-stone-500 font-mono">{review.timeAgo}</span>
                </div>

                <div className="flex text-amber-400 text-sm mb-3">
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </div>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  "{review.comment}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800/60 flex items-center justify-between text-xs text-stone-500">
                <div className="text-[11px] text-stone-400">
                  {review.tags.map(t => `#${t}`).join(' ')}
                </div>
                {review.likes !== undefined && review.likes > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-stone-400">
                    <ThumbsUp className="w-3 h-3 text-amber-500" />
                    <span>{review.likes}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Write a Review Modal */}
      {showWriteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-display mb-1">Share Your Experience</h3>
            <p className="text-xs text-stone-400 mb-4">
              Help your fellow diners learn about the pizzas, wings, and rec room at Usk Bar and Grill.
            </p>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex M."
                  value={newAuthor}
                  onChange={e => setNewAuthor(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Star Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className={`text-xl p-1 transition ${
                        newRating >= star ? 'text-amber-400' : 'text-stone-600'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Review</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tell us about the pizza crust, games, wings, or friendly service..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="pizza, foosball, onion rings, service"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWriteModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg transition"
                >
                  {isSubmitting ? 'Posting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
