import React from 'react';
import { Phone, MapPin, ExternalLink, Flame, Shield } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';
import { BusinessInfo, FooterContent, LandingSection } from '../types/cms';
import { isElementVisible } from '../utils/sectionDependency';

interface FooterProps {
  businessInfo?: BusinessInfo;
  footerContent?: FooterContent;
  sections?: LandingSection[];
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  businessInfo,
  footerContent,
  sections,
  onOpenAdmin
}) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id.replace('#', ''));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const brandName = businessInfo?.name || 'Usk Bar & Grill';
  const desc =
    footerContent?.description ||
    'Small-town warmth, brick oven pizzas, homemade appetizers, and free rec room games in Usk, Washington.';
  const subtext = footerContent?.subtext || 'Pend Oreille County, WA';
  const phone = businessInfo?.phone || RESTAURANT_INFO.phone;
  const address = businessInfo?.address ? `${businessInfo.address}, ${businessInfo.city}` : RESTAURANT_INFO.address;
  const copyright = footerContent?.copyrightText || `© ${new Date().getFullYear()} Usk Bar and Grill. All rights reserved.`;

  const rawColumns = footerContent?.columns || [
    {
      title: 'Quick Navigation',
      links: [
        { label: 'Full Food & Drink Menu', url: '#menu' },
        { label: 'Custom 12" Pizza Builder', url: '#pizza-builder' },
        { label: 'Table Reservations', url: '#reservations' },
        { label: 'Free Rec Room (Pool & Foosball)', url: '#rec-room' },
        { label: 'Verified Google Reviews (4.6★)', url: '#reviews' }
      ]
    },
    {
      title: 'Ordering Options',
      links: [
        { label: 'Walk-In Dine-In Seating', url: '#reservations' },
        { label: '5th Street Drive-Through Window', url: '#location' },
        { label: 'Advance Table Booking', url: '#reservations' },
        { label: 'Streamlined Online Ordering', url: '#menu' }
      ]
    }
  ];

  // Filter links dynamically: if a target section is disabled in the CMS,
  // all corresponding footer links automatically disappear without leaving broken anchors.
  const filteredColumns = rawColumns
    .map(col => ({
      ...col,
      links: col.links.filter(link =>
        isElementVisible(
          {
            isEnabled: link.isEnabled !== false,
            type: link.type,
            targetSection: link.targetSection,
            url: link.url
          },
          sections
        )
      )
    }))
    .filter(col => col.links.length > 0);

  return (
    <footer className="bg-stone-950 text-stone-400 border-t border-stone-800 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={businessInfo?.logoUrl || '/logo.png'}
                alt={`${brandName} Logo`}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/40 shadow-lg bg-stone-900 shrink-0"
              />
              <div>
                <span className="text-xl font-extrabold text-white font-display tracking-tight block">
                  {brandName}
                </span>
                <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
                  Brick Oven Pizza &amp; Tavern
                </span>
              </div>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed">
              {desc}
            </p>
            <div className="text-[11px] text-stone-500">
              {subtext}
            </div>
          </div>

          {/* Dynamic Columns from CMS - with section dependency filtering */}
          {filteredColumns.map((col, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="text-stone-200 font-bold text-xs uppercase tracking-wider">{col.title}</h4>
              <ul className="space-y-1.5">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <button
                      onClick={() => scrollTo(link.url)}
                      className="hover:text-amber-400 transition cursor-pointer text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact & Admin Portal */}
          <div className="space-y-3">
            <h4 className="text-stone-200 font-bold text-xs uppercase tracking-wider">Contact & Location</h4>
            <div className="space-y-1.5 text-stone-300">
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{address}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-white transition">
                  {phone}
                </a>
              </p>
              <p className="text-stone-400 pt-1">
                Open Daily · Closes 10:00 PM
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-400 border border-stone-800 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin CMS Dashboard</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500 text-[11px]">
          <p>{copyright}</p>
          <p className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Brick oven fired pizzas, craft appetizers & tavern games.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
