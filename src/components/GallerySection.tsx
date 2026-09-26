import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Images,
  Maximize2,
  X,
  Play,
  Pause
} from 'lucide-react';
import { RESTAURANT_IMAGES } from '../data/restaurantData';
import { GalleryItem } from '../types/cms';

interface GallerySectionProps {
  gallery?: GalleryItem[];
}

interface SlideItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ gallery }) => {
  // Built-in high-fidelity gallery items
  const defaultSlides: SlideItem[] = [
    {
      id: 'slide-pizza',
      title: 'Artisanal Brick Oven Fired Pizza',
      category: 'Kitchen Specialty',
      description: '12" handcrafted pizza with our famous parmesan butter crust, hot honey drizzle, and fresh melted mozzarella.',
      imageUrl: RESTAURANT_IMAGES.brickOvenPizza
    },
    {
      id: 'slide-rec-room',
      title: 'The Famous Back Rec Room',
      category: 'Atmosphere & Games',
      description: 'Free foosball table, classic green-felt pool table, and electronic darts. Complimentary for all dining and tavern guests.',
      imageUrl: RESTAURANT_IMAGES.recRoom
    },
    {
      id: 'slide-appetizers',
      title: 'Havarti Pickle Cigars & Loaded Tavern Fries',
      category: 'Locally Famous Bites',
      description: 'Golden fried egg-roll wrapped dill spears served with homemade garlic honey ranch and loaded crispy baked fries.',
      imageUrl: RESTAURANT_IMAGES.appetizersSpread
    },
    {
      id: 'slide-exterior',
      title: 'Usk Bar & Grill Historic Tavern',
      category: 'Tavern Exterior & Drive-Thru',
      description: 'Our welcoming landmark tavern on 5th Street in Usk, WA featuring dining room, full bar, and drive-through pickup window.',
      imageUrl: RESTAURANT_IMAGES.heroExterior
    }
  ];

  // If gallery prop provided and has visible items, use those; otherwise use defaultSlides
  const visibleCmsSlides = gallery?.filter(item => item.isVisible !== false) || [];
  const slides: SlideItem[] = visibleCmsSlides.length > 0
    ? visibleCmsSlides.map((g, idx) => ({
        id: g.id || `gallery-${idx}`,
        title: g.title || 'Usk Bar & Grill Gallery',
        category: g.category ? g.category.charAt(0).toUpperCase() + g.category.slice(1) : 'Atmosphere',
        description: g.description || '',
        imageUrl: g.imageUrl || RESTAURANT_IMAGES.brickOvenPizza
      }))
    : defaultSlides;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Touch gesture state
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const totalSlides = slides.length;

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goToPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Autoplay timer
  useEffect(() => {
    if (!isPlaying || isHovered || lightboxOpen || totalSlides <= 1) return;

    const timer = setInterval(() => {
      goToNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, lightboxOpen, totalSlides, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === 'Escape') setLightboxOpen(false);
        if (e.key === 'ArrowRight') goToNext();
        if (e.key === 'ArrowLeft') goToPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, goToNext, goToPrev]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      goToNext();
    } else if (distance < -minSwipeDistance) {
      goToPrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <section id="rec-room" className="py-16 sm:py-24 bg-stone-950 border-b border-stone-800 scroll-mt-20">
      <span id="gallery" className="sr-only">Photo Gallery</span>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-2 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              <Images className="w-4 h-4" />
              <span>Photo Gallery</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
              Atmosphere, Food & Rec Room
            </h2>
            <p className="text-sm text-stone-400 mt-2 max-w-2xl">
              Take a peek inside Usk Bar & Grill — our blistered brick oven pizzas, locally famous pickle cigars, cozy tavern dining, and free back rec room.
            </p>
          </div>

          {/* Slider controls & Autoplay status */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => setIsPlaying(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-900 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800 transition cursor-pointer"
              title={isPlaying ? 'Pause slideshow' : 'Start autoplay slideshow'}
              aria-label={isPlaying ? 'Pause slideshow' : 'Start autoplay slideshow'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isPlaying ? 'Autoplay On' : 'Paused'}</span>
            </button>

            <span className="text-xs font-mono text-stone-400 bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800">
              {String(currentIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Main Image Slider Viewport */}
        <div
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-800 bg-stone-900 shadow-2xl group select-none"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Slide Image Display */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[560px] overflow-hidden bg-stone-950">
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover transform duration-1000 ease-out group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              </div>
            ))}

            {/* Dark gradient for text legibility */}
            <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
            <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-stone-950/40 via-transparent to-transparent" />

            {/* Top Bar inside image: Fullscreen Button & Category Badge */}
            <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-auto">
              <span className="bg-stone-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-amber-400 border border-stone-800/80 shadow-lg">
                {currentSlide.category}
              </span>

              <button
                onClick={() => setLightboxOpen(true)}
                className="bg-stone-950/80 hover:bg-stone-900 text-stone-200 hover:text-white p-2 sm:px-3 sm:py-1.5 rounded-full sm:rounded-lg text-xs font-medium border border-stone-800/80 backdrop-blur-md shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                title="View full screen"
                aria-label="View full screen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Expand</span>
              </button>
            </div>

            {/* Previous & Next Arrow Buttons */}
            {totalSlides > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-full bg-stone-950/70 hover:bg-amber-500 text-stone-200 hover:text-stone-950 border border-stone-800/80 hover:border-amber-400 backdrop-blur-md shadow-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                <button
                  onClick={goToNext}
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-full bg-stone-950/70 hover:bg-amber-500 text-stone-200 hover:text-stone-950 border border-stone-800/80 hover:border-amber-400 backdrop-blur-md shadow-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}

            {/* Bottom Caption & Pagination Bar inside slider */}
            <div className="absolute bottom-0 inset-x-0 z-30 p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pointer-events-auto">
              <div className="max-w-2xl">
                <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight font-display drop-shadow-md">
                  {currentSlide.title}
                </h3>
                {currentSlide.description && (
                  <p className="text-xs sm:text-sm text-stone-300 mt-1 line-clamp-2 drop-shadow">
                    {currentSlide.description}
                  </p>
                )}
              </div>

              {/* Dot Indicators */}
              {totalSlides > 1 && (
                <div className="flex items-center gap-1.5 self-center sm:self-auto shrink-0 bg-stone-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-800/80">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToSlide(idx)}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        idx === currentIndex
                          ? 'w-6 h-2 bg-amber-500'
                          : 'w-2 h-2 bg-stone-600 hover:bg-stone-400'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Thumbnail Strip */}
        {totalSlides > 1 && (
          <div className="mt-4 sm:mt-6 grid grid-cols-4 gap-2 sm:gap-4">
            {slides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(idx)}
                  className={`relative rounded-xl overflow-hidden aspect-[16/9] border transition-all duration-200 text-left group cursor-pointer ${
                    isActive
                      ? 'border-amber-500 ring-2 ring-amber-500/50 scale-[1.02] shadow-lg'
                      : 'border-stone-800/80 opacity-60 hover:opacity-100 hover:border-stone-700'
                  }`}
                  aria-label={`Select photo: ${slide.title}`}
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-transparent" />
                  <div className="absolute bottom-1.5 left-2 right-2 truncate">
                    <span className="text-[11px] font-semibold text-white truncate block">
                      {slide.title}
                    </span>
                  </div>
                  {isActive && (
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 shadow" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox / Fullscreen Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top modal bar */}
          <div
            className="flex items-center justify-between text-white max-w-6xl mx-auto w-full z-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="bg-amber-500 text-stone-950 font-bold px-2.5 py-0.5 rounded text-xs">
                {currentSlide.category}
              </span>
              <span className="text-sm font-mono text-stone-400">
                {currentIndex + 1} of {totalSlides}
              </span>
            </div>

            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 transition cursor-pointer"
              aria-label="Close fullscreen modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Central image display with navigation buttons */}
          <div
            className="relative flex-1 flex items-center justify-center max-w-6xl mx-auto w-full my-4"
            onClick={e => e.stopPropagation()}
          >
            {totalSlides > 1 && (
              <button
                onClick={goToPrev}
                className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-stone-950/80 hover:bg-amber-500 text-white hover:text-stone-950 border border-stone-800 transition cursor-pointer"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={currentSlide.imageUrl}
              alt={currentSlide.title}
              className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl border border-stone-800/80"
              referrerPolicy="no-referrer"
            />

            {totalSlides > 1 && (
              <button
                onClick={goToNext}
                className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-stone-950/80 hover:bg-amber-500 text-white hover:text-stone-950 border border-stone-800 transition cursor-pointer"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom caption in lightbox */}
          <div
            className="max-w-2xl mx-auto text-center w-full z-10"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {currentSlide.title}
            </h3>
            {currentSlide.description && (
              <p className="text-xs sm:text-sm text-stone-400 mt-1">
                {currentSlide.description}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
