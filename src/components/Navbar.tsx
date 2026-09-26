import React, { useState } from 'react';
import { Phone, ShoppingBag, Calendar, Menu as MenuIcon, X, MapPin, Shield } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';
import { BusinessInfo, NavigationItem, LandingSection } from '../types/cms';
import { isElementVisible, isSectionEnabled } from '../utils/sectionDependency';

interface NavbarProps {
  cartItemCount: number;
  onOpenCart: () => void;
  onOpenReservation: () => void;
  onOpenAdmin: () => void;
  activeSection: string;
  businessInfo?: BusinessInfo;
  navigationItems?: NavigationItem[];
  sections?: LandingSection[];
}

export const Navbar: React.FC<NavbarProps> = ({
  cartItemCount,
  onOpenCart,
  onOpenReservation,
  onOpenAdmin,
  activeSection,
  businessInfo,
  navigationItems,
  sections
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const phone = businessInfo?.phone || RESTAURANT_INFO.phone;
  const phoneFormatted = businessInfo?.phone || RESTAURANT_INFO.phoneFormatted;
  const brandName = businessInfo?.name || 'Usk Bar & Grill';

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id.replace('#', ''));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const rawNavLinks =
    navigationItems && navigationItems.length > 0
      ? navigationItems
      : [
          { id: '1', label: 'Menu', url: '#menu', isExternal: false, isNewTab: false, displayOrder: 1, isVisible: true },
          { id: '2', label: 'Reservations', url: '#reservations', isExternal: false, isNewTab: false, displayOrder: 2, isVisible: true },
          { id: '3', label: 'Rec Room & Vibe', url: '#rec-room', isExternal: false, isNewTab: false, displayOrder: 3, isVisible: true },
          { id: '4', label: 'Google Reviews', url: '#reviews', isExternal: false, isNewTab: false, displayOrder: 4, isVisible: true },
          { id: '5', label: 'Hours & Location', url: '#location', isExternal: false, isNewTab: false, displayOrder: 5, isVisible: true }
        ];

  // Filter navigation links based on both link.isVisible AND targetSection.isEnabled
  const visibleNavLinks = rawNavLinks.filter(link => isElementVisible(link, sections));

  // Determine visibility of header action buttons
  const isReservationsVisible = isSectionEnabled('reservations', sections);
  const isMenuVisible = isSectionEnabled('menu', sections);

  return (
    <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Zone 1: Restaurant logo and brand name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollTo('hero')}
              className="flex items-center gap-3 text-left group transition cursor-pointer"
            >
              <img
                src={businessInfo?.logoUrl || '/logo.png'}
                alt={`${brandName} official logo`}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-amber-500/50 group-hover:ring-amber-400 group-hover:scale-105 transition-all shadow-md bg-stone-900 shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-amber-400 font-display transition-colors leading-tight">
                  {brandName}
                </span>
                <span className="text-[10px] tracking-wider uppercase text-amber-500/90 font-bold hidden sm:block">
                  Brick Oven Pizza &amp; Tavern
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: dynamic text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-300">
            {visibleNavLinks.map(link => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.url)}
                className={`hover:text-amber-400 transition-colors whitespace-nowrap cursor-pointer ${
                  activeSection === link.url.replace('#', '') ? 'text-amber-400 font-semibold' : ''
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-3">
            <a
              href={`tel:${phone}`}
              className="hidden lg:flex items-center gap-2 text-xs font-semibold text-stone-300 hover:text-white px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 transition"
              title="Call restaurant"
            >
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              <span>{phoneFormatted}</span>
            </a>

            {/* Reserve Table button - automatically hidden if reservations section is disabled */}
            {isReservationsVisible && (
              <button
                onClick={onOpenReservation}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-200 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-lg transition whitespace-nowrap cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Reserve Table</span>
              </button>
            )}

            {/* Order button - automatically hidden if menu section is disabled */}
            {isMenuVisible && (
              <button
                onClick={onOpenCart}
                className="relative inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition shadow-sm whitespace-nowrap cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Order</span>
                {cartItemCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[11px] font-black bg-stone-950 text-amber-400 rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {/* Discreet Admin Login Trigger in header */}
            <button
              onClick={onOpenAdmin}
              className="hidden xl:inline-flex items-center gap-1 px-2.5 py-2 text-[11px] font-semibold text-stone-400 hover:text-amber-400 rounded-lg border border-stone-800/80 hover:border-stone-700 transition"
              title="Admin CMS Portal"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>CMS</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-900 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stone-800 bg-stone-950 px-4 pt-3 pb-5 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2.5 border-b border-stone-900">
            <div className="flex items-center gap-2.5">
              <img
                src={businessInfo?.logoUrl || '/logo.png'}
                alt={brandName}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-amber-500/40"
              />
              <span className="text-sm font-bold text-white font-display">{brandName}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-400">
              <MapPin className="w-3 h-3" />
              <span>Usk, WA</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm font-medium">
            {visibleNavLinks.map(link => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.url)}
                className="text-left px-3 py-2 rounded-md hover:bg-stone-900 text-stone-200"
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="pt-2 flex flex-col gap-2">
            {isReservationsVisible && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenReservation();
                }}
                className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-stone-200 bg-stone-900 rounded-lg border border-stone-800"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Reserve a Table</span>
              </button>
            )}

            {isMenuVisible && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCart();
                }}
                className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-stone-950 bg-amber-500 rounded-lg"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Open Cart & Ordering ({cartItemCount})</span>
              </button>
            )}

            <a
              href={`tel:${phone}`}
              className="flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-stone-200 bg-stone-900 rounded-lg border border-stone-800"
            >
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              <span>Call {phoneFormatted}</span>
            </a>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-amber-400 bg-stone-900/60 rounded-lg border border-stone-800"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin CMS Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
