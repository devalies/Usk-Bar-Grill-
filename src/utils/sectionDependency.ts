import { FullCmsPayload, LandingSection, HeroSettings, NavigationItem, FooterColumnLink, CtaSection } from '../types/cms';

export interface CanonicalSectionDef {
  key: string;
  title: string;
  defaultAnchor: string;
  aliases: string[];
}

export const CANONICAL_SECTIONS: CanonicalSectionDef[] = [
  {
    key: 'hero',
    title: 'Hero / Banner Section',
    defaultAnchor: '#hero',
    aliases: ['hero', 'home', 'top', 'banner']
  },
  {
    key: 'menu',
    title: 'Food & Drink Menu & Pizza Builder',
    defaultAnchor: '#menu',
    aliases: ['menu', 'pizza-builder', 'order', 'food', 'drinks', 'pizzas', 'appetizers']
  },
  {
    key: 'rec-room',
    title: 'Rec Room & Atmosphere Gallery',
    defaultAnchor: '#rec-room',
    aliases: ['rec-room', 'recroom', 'gallery', 'atmosphere', 'photos', 'games', 'pool', 'foosball']
  },
  {
    key: 'reservations',
    title: 'Table & Rec Room Reservations',
    defaultAnchor: '#reservations',
    aliases: ['reservations', 'reservation', 'reserve', 'book', 'booking', 'table', 'dine-in']
  },
  {
    key: 'reviews',
    title: 'Google Reviews & Gemini Summary',
    defaultAnchor: '#reviews',
    aliases: ['reviews', 'review', 'testimonials', 'ratings', 'feedback']
  },
  {
    key: 'location',
    title: 'Location, Hours & Drive-Through',
    defaultAnchor: '#location',
    aliases: ['location', 'locations', 'hours', 'opening-hours', 'contact', 'map', 'directions', 'drive-thru', 'drive-through']
  },
  {
    key: 'cta',
    title: 'Call to Action Section',
    defaultAnchor: '#cta',
    aliases: ['cta', 'call-to-action']
  }
];

/**
 * Normalizes any section identifier, anchor, or URL to a canonical section key.
 * e.g., '#menu' -> 'menu', '#pizza-builder' -> 'menu', '#reservations' -> 'reservations',
 * 'gallery' -> 'rec-room', 'opening-hours' -> 'location'.
 */
export function normalizeSectionKey(input?: string | null): string | null {
  if (!input) return null;
  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/^#/, '')
    .replace(/^\//, '');

  if (!cleaned) return null;

  for (const sec of CANONICAL_SECTIONS) {
    if (sec.key === cleaned || sec.aliases.includes(cleaned)) {
      return sec.key;
    }
  }

  return cleaned;
}

/**
 * Checks whether a given section is enabled in the CMS landingSections list.
 */
export function isSectionEnabled(
  targetSection: string | null | undefined,
  sections?: LandingSection[] | Record<string, boolean>
): boolean {
  if (!targetSection) return true;
  const canonical = normalizeSectionKey(targetSection);
  if (!canonical) return true;

  if (!sections) return true;

  if (Array.isArray(sections)) {
    const match = sections.find(s => {
      const sKey = normalizeSectionKey(s.sectionKey);
      return sKey === canonical;
    });
    return match ? Boolean(match.isEnabled) : true;
  } else {
    // Record<string, boolean>
    if (canonical in sections) {
      return Boolean(sections[canonical]);
    }
    // Check aliases
    for (const [key, val] of Object.entries(sections)) {
      if (normalizeSectionKey(key) === canonical) {
        return Boolean(val);
      }
    }
    return true;
  }
}

/**
 * Universal evaluator for any UI element (button, nav item, footer link, CTA).
 * An element is visible ONLY when:
 * 1. Its own enabled state is true (or undefined/not explicitly false).
 * 2. If it targets an internal section, THAT section is also enabled.
 */
export function isElementVisible(
  element: {
    isEnabled?: boolean;
    isVisible?: boolean;
    type?: string;
    targetSection?: string;
    url?: string;
    targetUrl?: string;
  },
  sections?: LandingSection[] | Record<string, boolean>
): boolean {
  // Check element's own state
  if (element.isEnabled === false || element.isVisible === false) {
    return false;
  }

  // Determine target section
  let target: string | null = null;
  if (element.targetSection) {
    target = element.targetSection;
  } else {
    const candidateUrl = element.targetUrl || element.url;
    if (candidateUrl && candidateUrl.startsWith('#')) {
      target = candidateUrl;
    }
  }

  if (target) {
    const canonical = normalizeSectionKey(target);
    // If it targets a recognized section, enforce section dependency
    if (canonical && CANONICAL_SECTIONS.some(s => s.key === canonical)) {
      return isSectionEnabled(canonical, sections);
    }
  }

  return true;
}

export interface ConnectedElement {
  id: string;
  label: string;
  category: 'Navigation' | 'Hero Button' | 'Header Action' | 'Footer Link' | 'CTA Button' | 'Section Link';
  location: string;
  targetSection: string;
  targetUrl?: string;
  isEnabled: boolean;
}

/**
 * Automatically inspects the full CMS configuration and discovers every frontend element
 * that depends on a specific section.
 */
export function getConnectedElementsForSection(
  sectionKey: string,
  cmsPayload?: Partial<FullCmsPayload> | null
): ConnectedElement[] {
  const canonical = normalizeSectionKey(sectionKey);
  if (!canonical) return [];

  const results: ConnectedElement[] = [];

  // 1. Navigation items (Header & Mobile menu)
  const navItems = cmsPayload?.navigationItems || [
    { id: 'nav-menu', label: 'Menu', url: '#menu', isVisible: true, displayOrder: 1, isExternal: false, isNewTab: false },
    { id: 'nav-reservations', label: 'Reservations', url: '#reservations', isVisible: true, displayOrder: 2, isExternal: false, isNewTab: false },
    { id: 'nav-rec-room', label: 'Rec Room & Vibe', url: '#rec-room', isVisible: true, displayOrder: 3, isExternal: false, isNewTab: false },
    { id: 'nav-reviews', label: 'Google Reviews', url: '#reviews', isVisible: true, displayOrder: 4, isExternal: false, isNewTab: false },
    { id: 'nav-location', label: 'Hours & Location', url: '#location', isVisible: true, displayOrder: 5, isExternal: false, isNewTab: false }
  ];

  navItems.forEach(item => {
    const target = item.targetSection || normalizeSectionKey(item.url);
    if (target === canonical) {
      results.push({
        id: `nav-${item.id}`,
        label: `${item.label} Navigation`,
        category: 'Navigation',
        location: 'Header & Mobile Navigation Menu',
        targetSection: canonical,
        targetUrl: item.url,
        isEnabled: item.isVisible !== false && item.isEnabled !== false
      });
    }
  });

  // 2. Header quick action buttons
  if (canonical === 'reservations') {
    results.push({
      id: 'hdr-reserve-btn',
      label: 'Reserve Table Button',
      category: 'Header Action',
      location: 'Header Quick Actions',
      targetSection: 'reservations',
      targetUrl: '#reservations',
      isEnabled: true
    });
  }

  if (canonical === 'menu') {
    results.push({
      id: 'hdr-order-btn',
      label: 'Online Order Button',
      category: 'Header Action',
      location: 'Header Quick Actions',
      targetSection: 'menu',
      targetUrl: '#menu',
      isEnabled: true
    });
  }

  // 3. Hero call-to-action buttons
  const hero = cmsPayload?.heroSettings;
  const heroPrimaryTarget =
    hero?.primaryButtonConfig?.targetSection || normalizeSectionKey(hero?.primaryButtonUrl || '#menu');
  if (heroPrimaryTarget === canonical) {
    results.push({
      id: 'hero-btn-primary',
      label: `"${hero?.primaryButtonText || 'Order Online Now'}" Button`,
      category: 'Hero Button',
      location: 'Hero Banner Section',
      targetSection: canonical,
      targetUrl: hero?.primaryButtonUrl || '#menu',
      isEnabled: hero?.primaryButtonConfig?.isEnabled !== false
    });
  }

  const heroSecondaryTarget =
    hero?.secondaryButtonConfig?.targetSection || normalizeSectionKey(hero?.secondaryButtonUrl || '#reservations');
  if (heroSecondaryTarget === canonical) {
    results.push({
      id: 'hero-btn-secondary',
      label: `"${hero?.secondaryButtonText || 'Reserve a Table'}" Button`,
      category: 'Hero Button',
      location: 'Hero Banner Section',
      targetSection: canonical,
      targetUrl: hero?.secondaryButtonUrl || '#reservations',
      isEnabled: hero?.secondaryButtonConfig?.isEnabled !== false
    });
  }

  const heroThirdTarget =
    hero?.thirdButtonConfig?.targetSection || normalizeSectionKey(hero?.thirdButtonUrl || '#menu');
  if (heroThirdTarget === canonical) {
    results.push({
      id: 'hero-btn-third',
      label: `"${hero?.thirdButtonText || 'View Full Menu'}" Button`,
      category: 'Hero Button',
      location: 'Hero Banner Section',
      targetSection: canonical,
      targetUrl: hero?.thirdButtonUrl || '#menu',
      isEnabled: hero?.thirdButtonConfig?.isEnabled !== false
    });
  }

  // 4. Footer Column Links
  const footerColumns = cmsPayload?.footerContent?.columns || [
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

  footerColumns.forEach((col, colIdx) => {
    col.links.forEach((link, linkIdx) => {
      const target = link.targetSection || normalizeSectionKey(link.url);
      if (target === canonical) {
        results.push({
          id: `footer-${colIdx}-${linkIdx}`,
          label: `"${link.label}" Link`,
          category: 'Footer Link',
          location: `Footer: ${col.title}`,
          targetSection: canonical,
          targetUrl: link.url,
          isEnabled: link.isEnabled !== false
        });
      }
    });
  });

  // 5. CTA Sections
  const ctaSections = cmsPayload?.ctaSections || [];
  ctaSections.forEach(cta => {
    const target = normalizeSectionKey(cta.buttonUrl);
    if (target === canonical) {
      results.push({
        id: `cta-${cta.id}`,
        label: `"${cta.buttonText}" CTA Button`,
        category: 'CTA Button',
        location: `CTA Banner: ${cta.heading}`,
        targetSection: canonical,
        targetUrl: cta.buttonUrl,
        isEnabled: cta.isVisible !== false
      });
    }
  });

  return results;
}
