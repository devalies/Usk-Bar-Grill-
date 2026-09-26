export type AdminRole = 'admin' | 'editor';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: string;
  lastLoginAt?: string;
}

export type ButtonTargetType = 'section' | 'page' | 'external' | 'phone' | 'email' | 'whatsapp';

export interface CmsButtonConfig {
  id?: string;
  label: string;
  type: ButtonTargetType;
  targetSection?: string;
  targetUrl?: string;
  isEnabled: boolean;
  displayOrder?: number;
}

export interface LandingSection {
  id: string;
  sectionKey: 'hero' | 'menu' | 'rec-room' | 'reservations' | 'reviews' | 'location' | 'cta' | string;
  title: string;
  subtitle: string;
  isEnabled: boolean;
  displayOrder: number;
}

export interface HeroButtonConfig {
  label: string;
  type: ButtonTargetType;
  targetSection?: string;
  targetUrl?: string;
  isEnabled: boolean;
}

export interface HeroSettings {
  heading: string;
  subheading: string;
  description: string;
  badgeText: string;
  ratingText: string;
  reviewsCountText: string;
  hoursStatusText: string;
  locationBadgeText: string;
  priceRangeText: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  primaryButtonConfig?: HeroButtonConfig;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  secondaryButtonConfig?: HeroButtonConfig;
  thirdButtonText: string;
  thirdButtonUrl: string;
  thirdButtonConfig?: HeroButtonConfig;
  backgroundImage: string;
  stripItem1Title: string;
  stripItem1Desc: string;
  stripItem2Title: string;
  stripItem2Desc: string;
  stripItem3Title: string;
  stripItem3Desc: string;
}

export interface MenuCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CmsMenuItem {
  id: string;
  categoryId: string; // references MenuCategory.id or slug
  name: string;
  description: string;
  price: number;
  image?: string;
  popular: boolean;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  tags: string[];
  options?: {
    name: string;
    choices: { label: string; extraPrice: number }[];
  }[];
}

export interface BusinessInfo {
  name: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  faviconUrl?: string;
  phone: string;
  secondaryPhone?: string;
  email: string;
  website: string;
  address: string;
  city: string;
  country: string;
  plusCode: string;
  mapsUrl: string;
  latitude: number;
  longitude: number;
  businessType: string;
  businessStatus: string;
  amenities: string[];
  geminiSummary: string;
}

export interface Statistic {
  id: string;
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
  icon?: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface LocationItem {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  mapsUrl: string;
  latitude: number;
  longitude: number;
  openingHoursSummary: string;
  isActive: boolean;
  displayOrder: number;
  isPrimary: boolean;
}

export interface OpeningHour {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  secondPeriodEnabled?: boolean;
  secondOpenTime?: string;
  secondCloseTime?: string;
  notes?: string;
  displayOrder: number;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  image?: string;
  link?: string;
  badge?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface TestimonialItem {
  id: string;
  author: string;
  authorSubtitle: string;
  rating: number;
  timeAgo: string;
  comment: string;
  tags: string[];
  likes: number;
  isApproved: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface CtaSection {
  id: string;
  key: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  phone: string;
  email?: string;
  isVisible: boolean;
}

export interface SocialLink {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'google-maps' | 'other';
  label: string;
  url: string;
  icon?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  type?: ButtonTargetType;
  targetSection?: string;
  isExternal: boolean;
  isNewTab: boolean;
  displayOrder: number;
  isVisible: boolean;
  isEnabled?: boolean; // alias for isVisible for consistency
}

export interface FooterColumnLink {
  label: string;
  url: string;
  type?: ButtonTargetType;
  targetSection?: string;
  isEnabled?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterColumnLink[];
}

export interface FooterContent {
  description: string;
  subtext: string;
  copyrightText: string;
  columns: FooterColumn[];
  showSocials: boolean;
  showHours: boolean;
  showAddress: boolean;
}

export interface SeoSettings {
  title: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  robotsIndex: boolean;
  faviconUrl: string;
}

export interface GlobalSettings {
  siteName: string;
  tagline: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryPhone: string;
  email: string;
  address: string;
  copyrightText: string;
  themeAccentColor?: string;
}

export interface FullCmsPayload {
  globalSettings: GlobalSettings;
  landingSections: LandingSection[];
  heroSettings: HeroSettings;
  menuCategories: MenuCategory[];
  menuItems: CmsMenuItem[];
  businessInfo: BusinessInfo;
  statistics: Statistic[];
  locations: LocationItem[];
  openingHours: OpeningHour[];
  features: FeatureItem[];
  testimonials: TestimonialItem[];
  gallery: GalleryItem[];
  ctaSections: CtaSection[];
  socialLinks: SocialLink[];
  navigationItems: NavigationItem[];
  footerContent: FooterContent;
  seoSettings: SeoSettings;
}
