import React from 'react';
import { Star, Clock, MapPin, ArrowRight, UtensilsCrossed, Calendar } from 'lucide-react';
import { HeroSettings, LandingSection } from '../types/cms';
import { RESTAURANT_INFO, RESTAURANT_IMAGES } from '../data/restaurantData';
import { isElementVisible, normalizeSectionKey } from '../utils/sectionDependency';

interface HeroProps {
  settings?: HeroSettings;
  sections?: LandingSection[];
  onOrderClick: () => void;
  onReserveClick: () => void;
  onExploreMenu: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  sections,
  onOrderClick,
  onReserveClick,
  onExploreMenu
}) => {
  const heading = settings?.heading || 'Small-town soul, blistered brick oven pizzas, & cold tap beer.';
  const description =
    settings?.description ||
    'Half family-friendly dining, half classic tavern, and a cozy back rec room with free foosball and pool. Famous for our parmesan butter crust, Havarti pickle cigars, and sweet & spicy Thai chicken pizza.';
  const bgImage = settings?.backgroundImage || RESTAURANT_IMAGES.heroExterior;
  const badgeText = settings?.badgeText || 'Pend Oreille County Favorite';
  const ratingText = settings?.ratingText || '4.6';
  const reviewsCountText = settings?.reviewsCountText || `(${RESTAURANT_INFO.reviewsCount} Google Reviews)`;
  const hoursStatusText = settings?.hoursStatusText || 'Open Daily · Closes 10 PM';
  const locationBadgeText = settings?.locationBadgeText || 'Usk, WA';
  const priceRangeText = settings?.priceRangeText || '$10–$20';

  const primaryBtnText = settings?.primaryButtonConfig?.label || settings?.primaryButtonText || 'Order Online Now';
  const secondaryBtnText = settings?.secondaryButtonConfig?.label || settings?.secondaryButtonText || 'Reserve a Table';
  const thirdBtnText = settings?.thirdButtonConfig?.label || settings?.thirdButtonText || 'View Full Menu';

  // Section dependency visibility evaluation
  const primaryTarget = settings?.primaryButtonConfig?.targetSection || normalizeSectionKey(settings?.primaryButtonUrl || '#menu') || undefined;
  const isPrimaryVisible = isElementVisible(
    {
      isEnabled: settings?.primaryButtonConfig?.isEnabled !== false,
      type: settings?.primaryButtonConfig?.type || 'section',
      targetSection: primaryTarget,
      targetUrl: settings?.primaryButtonUrl || '#menu'
    },
    sections
  );

  const secondaryTarget = settings?.secondaryButtonConfig?.targetSection || normalizeSectionKey(settings?.secondaryButtonUrl || '#reservations') || undefined;
  const isSecondaryVisible = isElementVisible(
    {
      isEnabled: settings?.secondaryButtonConfig?.isEnabled !== false,
      type: settings?.secondaryButtonConfig?.type || 'section',
      targetSection: secondaryTarget,
      targetUrl: settings?.secondaryButtonUrl || '#reservations'
    },
    sections
  );

  const thirdTarget = settings?.thirdButtonConfig?.targetSection || normalizeSectionKey(settings?.thirdButtonUrl || '#menu') || undefined;
  const isThirdVisible = isElementVisible(
    {
      isEnabled: settings?.thirdButtonConfig?.isEnabled !== false,
      type: settings?.thirdButtonConfig?.type || 'section',
      targetSection: thirdTarget,
      targetUrl: settings?.thirdButtonUrl || '#menu'
    },
    sections
  );

  const hasAnyVisibleButton = isPrimaryVisible || isSecondaryVisible || isThirdVisible;

  const strip1Title = settings?.stripItem1Title || 'Dine-In & Drive-Through';
  const strip1Desc = settings?.stripItem1Desc || 'Convenient drive-up pickup window on 5th Street';
  const strip2Title = settings?.stripItem2Title || 'Free Rec Room';
  const strip2Desc = settings?.stripItem2Desc || 'Complimentary pool table & foosball in the back room';
  const strip3Title = settings?.stripItem3Title || 'Fresh Brick Oven';
  const strip3Desc = settings?.stripItem3Desc || '12" signature crusts with house cheese stuffed option';

  return (
    <section id="hero" className="relative overflow-hidden bg-stone-950 border-b border-stone-800">
      {/* Background with measured scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt="Usk Bar and Grill exterior at dusk in Usk, Washington"
          className="w-full h-full object-cover object-center opacity-30"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-stone-950/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
        <div className="max-w-3xl">
          {/* Authentic Restaurant Crest & Badge */}
          <div className="flex items-center gap-3.5 mb-6">
            <img
              src="/logo.png"
              alt="Usk Bar and Grill Official Seal"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-amber-500/50 shadow-xl bg-stone-900 shadow-amber-950/40 shrink-0"
            />
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-500 block">
                {badgeText || 'Pend Oreille County Favorite'}
              </span>
              <span className="text-sm font-semibold text-stone-200">
                Usk Bar &amp; Grill · Established Local Gathering Place
              </span>
            </div>
          </div>

          {/* Clean unboxed metadata with typographic separators */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-stone-300 mb-6">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{ratingText}</span>
              <span className="text-stone-400 font-normal">{reviewsCountText}</span>
            </span>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <span className="flex items-center gap-1 text-stone-300">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>{hoursStatusText}</span>
            </span>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <span className="flex items-center gap-1 text-stone-300">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>{locationBadgeText}</span>
            </span>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <span className="text-stone-400">{priceRangeText}</span>
          </div>

          {/* Primary headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] font-display text-balance mb-6">
            {heading}
          </h1>

          <p className="text-base sm:text-lg text-stone-300 leading-relaxed max-w-2xl mb-8">
            {description}
          </p>

          {/* Primary CTA Buttons - Only rendered if both button is enabled AND target section is enabled */}
          {hasAnyVisibleButton && (
            <div className="flex flex-wrap items-center gap-4 mb-12">
              {isPrimaryVisible && (
                <button
                  onClick={onOrderClick}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] transition-all rounded-lg shadow-lg shadow-amber-500/10 cursor-pointer"
                >
                  <span>{primaryBtnText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {isSecondaryVisible && (
                <button
                  onClick={onReserveClick}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-stone-100 bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 active:scale-[0.98] transition-all rounded-lg cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>{secondaryBtnText}</span>
                </button>
              )}

              {isThirdVisible && (
                <button
                  onClick={onExploreMenu}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium text-stone-300 hover:text-white transition-colors cursor-pointer"
                >
                  <UtensilsCrossed className="w-4 h-4 text-stone-400" />
                  <span>{thirdBtnText}</span>
                </button>
              )}
            </div>
          )}

          {/* Adjacency Proof Strip */}
          <div className="pt-8 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="font-semibold text-stone-100 mb-0.5">{strip1Title}</p>
              <p className="text-stone-400">{strip1Desc}</p>
            </div>
            <div>
              <p className="font-semibold text-stone-100 mb-0.5">{strip2Title}</p>
              <p className="text-stone-400">{strip2Desc}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="font-semibold text-stone-100 mb-0.5">{strip3Title}</p>
              <p className="text-stone-400">{strip3Desc}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
