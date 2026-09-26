import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  AdminUser,
  LandingSection,
  HeroSettings,
  MenuCategory,
  CmsMenuItem,
  BusinessInfo,
  Statistic,
  LocationItem,
  OpeningHour,
  FeatureItem,
  TestimonialItem,
  GalleryItem,
  CtaSection,
  SocialLink,
  NavigationItem,
  FooterContent,
  SeoSettings,
  GlobalSettings,
  FullCmsPayload
} from '../types/cms';
import { RESTAURANT_INFO, RESTAURANT_IMAGES, MENU_ITEMS, REVIEWS_DATA } from '../data/restaurantData';

interface AdminUserRecord extends AdminUser {
  passwordHash: string;
  salt: string;
}

export interface CmsDatabaseSchema {
  admins: AdminUserRecord[];
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

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'cms_database.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Security Helpers
export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): { hash: string; salt: string } {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(testHash, 'hex'));
}

const JWT_SECRET = process.env.JWT_SECRET || 'usk-bar-grill-super-secure-cms-secret-key-2026';

export function createAuthToken(user: AdminUser): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600 // 7 days
    })
  ).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

export function verifyAuthToken(token: string): { id: string; email: string; name: string; role: 'admin' | 'editor' } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
    if (signature !== expectedSig) return null;

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

// Initial Seed Data generator
function generateInitialDatabase(): CmsDatabaseSchema {
  const adminSalt1 = crypto.randomBytes(16).toString('hex');
  const adminHash1 = crypto.scryptSync('AdminPassword123!', adminSalt1, 64).toString('hex');

  const adminSalt2 = crypto.randomBytes(16).toString('hex');
  const adminHash2 = crypto.scryptSync('EditorPassword123!', adminSalt2, 64).toString('hex');

  const initialAdmins: AdminUserRecord[] = [
    {
      id: 'admin-1',
      name: 'Owner Admin',
      email: 'admin@uskbarandgrill.com',
      role: 'admin',
      createdAt: new Date().toISOString(),
      passwordHash: adminHash1,
      salt: adminSalt1
    },
    {
      id: 'editor-1',
      name: 'Content Editor',
      email: 'editor@uskbarandgrill.com',
      role: 'editor',
      createdAt: new Date().toISOString(),
      passwordHash: adminHash2,
      salt: adminSalt2
    }
  ];

  const landingSections: LandingSection[] = [
    {
      id: 'sec-hero',
      sectionKey: 'hero',
      title: 'Hero / Here Section',
      subtitle: 'Main banner with headline, badges, and primary call-to-actions',
      isEnabled: true,
      displayOrder: 1
    },
    {
      id: 'sec-menu',
      sectionKey: 'menu',
      title: 'Menu Section & Pizza Builder',
      subtitle: 'Food categories, signature pizzas, wings, appetizers, and custom pizza builder',
      isEnabled: true,
      displayOrder: 2
    },
    {
      id: 'sec-rec-room',
      sectionKey: 'rec-room',
      title: 'Rec Room & Atmosphere Gallery',
      subtitle: 'Free foosball, pool table, dart board, and tavern vibes',
      isEnabled: true,
      displayOrder: 3
    },
    {
      id: 'sec-reservations',
      sectionKey: 'reservations',
      title: 'Table & Rec Room Reservations',
      subtitle: 'Interactive booking for family room, bar, or back rec room',
      isEnabled: true,
      displayOrder: 4
    },
    {
      id: 'sec-reviews',
      sectionKey: 'reviews',
      title: 'Google Reviews & Gemini Summary',
      subtitle: 'Customer reviews, ratings breakdown, and interactive review form',
      isEnabled: true,
      displayOrder: 5
    },
    {
      id: 'sec-location',
      sectionKey: 'location',
      title: 'Location, Hours & Drive-Through',
      subtitle: 'Directions, map visual, operating schedule, and drive-through pickup',
      isEnabled: true,
      displayOrder: 6
    }
  ];

  const heroSettings: HeroSettings = {
    heading: 'Small-town soul, blistered brick oven pizzas, & cold tap beer.',
    subheading: 'Welcome to Usk Bar and Grill',
    description:
      'Half family-friendly dining, half classic tavern, and a cozy back rec room with free foosball and pool. Famous for our parmesan butter crust, Havarti pickle cigars, and sweet & spicy Thai chicken pizza.',
    badgeText: 'Pend Oreille County Favorite',
    ratingText: '4.6',
    reviewsCountText: '149 Google Reviews',
    hoursStatusText: 'Open Daily · Closes 10 PM',
    locationBadgeText: 'Usk, WA',
    priceRangeText: '$10–$20',
    primaryButtonText: 'Order Online Now',
    primaryButtonUrl: '#menu',
    secondaryButtonText: 'Reserve a Table',
    secondaryButtonUrl: '#reservations',
    thirdButtonText: 'View Full Menu',
    thirdButtonUrl: '#menu',
    backgroundImage: RESTAURANT_IMAGES.heroExterior,
    stripItem1Title: 'Dine-In & Drive-Through',
    stripItem1Desc: 'Convenient drive-up pickup window on 5th Street',
    stripItem2Title: 'Free Rec Room',
    stripItem2Desc: 'Complimentary pool table & foosball in the back room',
    stripItem3Title: 'Fresh Brick Oven',
    stripItem3Desc: '12" signature crusts with house cheese stuffed option'
  };

  const menuCategories: MenuCategory[] = [
    {
      id: 'cat-red-base',
      slug: 'red-base-pizza',
      name: 'Red Base Pizzas',
      description: 'Handcrafted 12" pizzas with our house red pizza sauce and brick oven crust',
      displayOrder: 1,
      isActive: true
    },
    {
      id: 'cat-chicken-pizza',
      slug: 'chicken-pizza',
      name: 'Chicken Pizza Recipes',
      description: 'Signature chicken combinations including Garlic Parm, Thai Chicken, and CBR',
      displayOrder: 2,
      isActive: true
    },
    {
      id: 'cat-specialty-pizza',
      slug: 'specialty-pizza',
      name: 'Specialty Gourmet Pizzas',
      description: 'Chef specials including The Blue Moose, Luau BBQ, and Jalapeno Popper',
      displayOrder: 3,
      isActive: true
    },
    {
      id: 'cat-appetizers',
      slug: 'appetizers',
      name: 'Tavern Appetizers',
      description: 'Havarti pickle cigars, full pounds of loaded fries, onion rings, and sharables',
      displayOrder: 4,
      isActive: true
    },
    {
      id: 'cat-wings',
      slug: 'wings',
      name: 'Signature Wings',
      description: 'Crispy bone-in or boneless wings tossed in 8 signature gourmet sauces',
      displayOrder: 5,
      isActive: true
    },
    {
      id: 'cat-drinks',
      slug: 'drinks',
      name: 'Drafts & Drinks',
      description: 'Pacific Northwest craft drafts, domestic beers, ciders, and sodas',
      displayOrder: 6,
      isActive: true
    }
  ];

  const cmsMenuItems: CmsMenuItem[] = MENU_ITEMS.map((item, index) => ({
    id: item.id,
    categoryId: item.category,
    name: item.name,
    description: item.description,
    price: item.price,
    image: item.image,
    popular: Boolean(item.popular),
    isFeatured: Boolean(item.popular),
    isActive: true,
    displayOrder: index + 1,
    tags: item.tags || [],
    options: item.options
  }));

  const businessInfo: BusinessInfo = {
    name: RESTAURANT_INFO.name,
    tagline: RESTAURANT_INFO.tagline,
    description:
      'Small town tavern and family restaurant in Usk, Washington featuring brick oven fired 12" specialty pizzas, famous Havarti pickle cigars, loaded fries, and a complimentary back rec room with pool and foosball.',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.png',
    phone: RESTAURANT_INFO.phone,
    secondaryPhone: '',
    email: 'info@uskbarandgrill.com',
    website: 'https://uskbarandgrill.com',
    address: '112 5th St',
    city: 'Usk, WA 99180',
    country: 'United States',
    plusCode: RESTAURANT_INFO.plusCode,
    mapsUrl: 'https://www.google.com/maps/place/Usk+Bar+%26+Grill/@48.3129848,-117.2845667,17z',
    latitude: 48.3129848,
    longitude: -117.2845667,
    businessType: 'Bar & Grill / Pizzeria',
    businessStatus: 'Open Daily',
    amenities: RESTAURANT_INFO.amenities,
    geminiSummary: RESTAURANT_INFO.geminiSummary
  };

  const statistics: Statistic[] = [
    {
      id: 'stat-1',
      label: 'Google Review Score',
      value: '4.6',
      prefix: '★',
      suffix: '/5.0',
      icon: 'Star',
      displayOrder: 1,
      isVisible: true
    },
    {
      id: 'stat-2',
      label: 'Verified Diner Reviews',
      value: '149',
      prefix: '',
      suffix: '+',
      icon: 'Users',
      displayOrder: 2,
      isVisible: true
    },
    {
      id: 'stat-3',
      label: 'Brick Oven Pizza Size',
      value: '12',
      prefix: '',
      suffix: ' Inch',
      icon: 'Flame',
      displayOrder: 3,
      isVisible: true
    },
    {
      id: 'stat-4',
      label: 'Free Foosball & Pool',
      value: '100',
      prefix: '',
      suffix: '% Free',
      icon: 'Trophy',
      displayOrder: 4,
      isVisible: true
    }
  ];

  const locations: LocationItem[] = [
    {
      id: 'loc-1',
      name: 'Usk Bar & Grill (Main Tavern & Drive-thru)',
      address: '112 5th St',
      city: 'Usk, WA 99180',
      country: 'United States',
      phone: '+1 509-445-1262',
      email: 'orders@uskbarandgrill.com',
      mapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=112+5th+St,+Usk,+WA+99180',
      latitude: 48.3129848,
      longitude: -117.2845667,
      openingHoursSummary: 'Mon–Sun: 11:00 AM – 10:00 PM',
      isActive: true,
      displayOrder: 1,
      isPrimary: true
    }
  ];

  const openingHours: OpeningHour[] = [
    {
      id: 'hour-mon',
      dayOfWeek: 'Monday',
      isOpen: true,
      openTime: '11:00 AM',
      closeTime: '9:30 PM',
      displayOrder: 1
    },
    {
      id: 'hour-tue',
      dayOfWeek: 'Tuesday',
      isOpen: true,
      openTime: '11:00 AM',
      closeTime: '9:30 PM',
      displayOrder: 2
    },
    {
      id: 'hour-wed',
      dayOfWeek: 'Wednesday',
      isOpen: true,
      openTime: '11:00 AM',
      closeTime: '9:30 PM',
      displayOrder: 3
    },
    {
      id: 'hour-thu',
      dayOfWeek: 'Thursday',
      isOpen: true,
      openTime: '11:00 AM',
      closeTime: '9:30 PM',
      displayOrder: 4
    },
    {
      id: 'hour-fri',
      dayOfWeek: 'Friday',
      isOpen: true,
      openTime: '11:00 AM',
      closeTime: '10:00 PM',
      displayOrder: 5
    },
    {
      id: 'hour-sat',
      dayOfWeek: 'Saturday',
      isOpen: true,
      openTime: '11:00 AM',
      closeTime: '10:00 PM',
      displayOrder: 6
    },
    {
      id: 'hour-sun',
      dayOfWeek: 'Sunday',
      isOpen: true,
      openTime: '11:00 AM',
      closeTime: '9:00 PM',
      displayOrder: 7
    }
  ];

  const features: FeatureItem[] = [
    {
      id: 'feat-1',
      title: 'Artisan Brick Oven Crust',
      description: '12" hand-tossed pizzas fired to golden blistering perfection with our famous parmesan butter crust.',
      icon: 'Flame',
      badge: 'Signature',
      isActive: true,
      displayOrder: 1
    },
    {
      id: 'feat-2',
      title: 'Free Back Rec Room',
      description: 'Classic green felt pool table, tournament foosball, and electronic darts complimentary for dining guests.',
      icon: 'Gamepad2',
      badge: 'Free Play',
      isActive: true,
      displayOrder: 2
    },
    {
      id: 'feat-3',
      title: '5th Street Drive-Through Window',
      description: 'Convenient drive-up window on 5th Street for instant pizza, appetizer, and takeout pickup.',
      icon: 'Car',
      badge: 'Drive-Thru',
      isActive: true,
      displayOrder: 3
    },
    {
      id: 'feat-4',
      title: 'Split Family & Tavern Seating',
      description: 'Half friendly family dining room for all ages, half authentic tavern bar with cold craft draft beers.',
      icon: 'Users',
      badge: 'All Ages',
      isActive: true,
      displayOrder: 4
    }
  ];

  const testimonials: TestimonialItem[] = REVIEWS_DATA.map((rev, idx) => ({
    id: rev.id,
    author: rev.author,
    authorSubtitle: rev.authorSubtitle,
    rating: rev.rating,
    timeAgo: rev.timeAgo,
    comment: rev.comment,
    tags: rev.tags,
    likes: rev.likes || 0,
    isApproved: true,
    isActive: true,
    displayOrder: idx + 1
  }));

  const gallery: GalleryItem[] = [
    {
      id: 'gal-1',
      title: 'Usk Bar & Grill Exterior at Dusk',
      description: 'Welcoming rustic Pacific Northwest tavern on 5th Street in Usk, Washington.',
      imageUrl: RESTAURANT_IMAGES.heroExterior,
      category: 'exterior',
      displayOrder: 1,
      isVisible: true
    },
    {
      id: 'gal-2',
      title: '12" Brick Oven Fired Pizza',
      description: 'Blistered parmesan butter crust, hot honey drizzle, and rich mozzarella.',
      imageUrl: RESTAURANT_IMAGES.brickOvenPizza,
      category: 'food',
      displayOrder: 2,
      isVisible: true
    },
    {
      id: 'gal-3',
      title: 'Famous Rec Room & Pool Table',
      description: 'Free pool table and foosball in our private back recreation room.',
      imageUrl: RESTAURANT_IMAGES.recRoom,
      category: 'atmosphere',
      displayOrder: 3,
      isVisible: true
    },
    {
      id: 'gal-4',
      title: 'Havarti Pickle Cigars & Loaded Fries',
      description: 'Egg roll wrapped crispy pickle spears and full pounds of baked loaded fries.',
      imageUrl: RESTAURANT_IMAGES.appetizersSpread,
      category: 'food',
      displayOrder: 4,
      isVisible: true
    }
  ];

  const ctaSections: CtaSection[] = [
    {
      id: 'cta-order',
      key: 'order-pickup',
      heading: 'Hungry? Fresh Brick Oven Pizza in 20 Minutes',
      description: 'Order online for speedy counter pickup or drive right up to our 5th Street drive-through window!',
      buttonText: 'Order Online Now',
      buttonUrl: '#menu',
      phone: '+1 509-445-1262',
      isVisible: true
    },
    {
      id: 'cta-party',
      key: 'party-rec-room',
      heading: 'Host Your Next Gathering in the Rec Room',
      description: 'Reserve our back rec room for birthdays, team celebrations, or friendly pool tournaments.',
      buttonText: 'Reserve a Table',
      buttonUrl: '#reservations',
      phone: '+1 509-445-1262',
      isVisible: true
    }
  ];

  const socialLinks: SocialLink[] = [
    {
      id: 'soc-fb',
      platform: 'facebook',
      label: 'Facebook',
      url: 'https://facebook.com',
      isActive: true,
      displayOrder: 1
    },
    {
      id: 'soc-maps',
      platform: 'google-maps',
      label: 'Google Maps',
      url: 'https://www.google.com/maps/place/Usk+Bar+%26+Grill/@48.3129848,-117.2845667,17z',
      isActive: true,
      displayOrder: 2
    }
  ];

  const navigationItems: NavigationItem[] = [
    {
      id: 'nav-menu',
      label: 'Menu',
      url: '#menu',
      isExternal: false,
      isNewTab: false,
      displayOrder: 1,
      isVisible: true
    },
    {
      id: 'nav-reservations',
      label: 'Reservations',
      url: '#reservations',
      isExternal: false,
      isNewTab: false,
      displayOrder: 2,
      isVisible: true
    },
    {
      id: 'nav-rec-room',
      label: 'Rec Room & Vibe',
      url: '#rec-room',
      isExternal: false,
      isNewTab: false,
      displayOrder: 3,
      isVisible: true
    },
    {
      id: 'nav-reviews',
      label: 'Google Reviews',
      url: '#reviews',
      isExternal: false,
      isNewTab: false,
      displayOrder: 4,
      isVisible: true
    },
    {
      id: 'nav-location',
      label: 'Hours & Location',
      url: '#location',
      isExternal: false,
      isNewTab: false,
      displayOrder: 5,
      isVisible: true
    }
  ];

  const footerContent: FooterContent = {
    description:
      'Small-town warmth, brick oven pizzas, homemade appetizers, and free rec room games in Usk, Washington.',
    subtext: 'Pend Oreille County, WA',
    copyrightText: `© ${new Date().getFullYear()} Usk Bar and Grill. All rights reserved.`,
    columns: [
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
    ],
    showSocials: true,
    showHours: true,
    showAddress: true
  };

  const seoSettings: SeoSettings = {
    title: 'Usk Bar and Grill | Brick Oven Pizza, Rec Room & Tavern in Usk, WA',
    metaDescription:
      'Small-town bar & grill in Usk, Washington featuring brick oven pizzas, famous Havarti pickle cigars, rec room with free pool and foosball, online ordering, and table reservations.',
    ogTitle: 'Usk Bar and Grill - Brick Oven Pizza & Tavern',
    ogDescription:
      'Visit Usk Bar and Grill on 5th Street in Usk, WA. 12" brick oven pizzas, cold draft beer, drive-thru window, and free rec room.',
    ogImage: '/logo.png',
    canonicalUrl: 'https://uskbarandgrill.com',
    robotsIndex: true,
    faviconUrl: '/favicon.png'
  };

  const globalSettings: GlobalSettings = {
    siteName: 'Usk Bar and Grill',
    tagline: 'Brick Oven Pizza & Small Town Tavern Hospitality',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.png',
    primaryPhone: '+1 509-445-1262',
    email: 'info@uskbarandgrill.com',
    address: '112 5th St, Usk, WA 99180',
    copyrightText: `© ${new Date().getFullYear()} Usk Bar and Grill. All rights reserved.`,
    themeAccentColor: '#f59e0b'
  };

  return {
    admins: initialAdmins,
    globalSettings,
    landingSections,
    heroSettings,
    menuCategories,
    menuItems: cmsMenuItems,
    businessInfo,
    statistics,
    locations,
    openingHours,
    features,
    testimonials,
    gallery,
    ctaSections,
    socialLinks,
    navigationItems,
    footerContent,
    seoSettings
  };
}

// Database Manager Class
class CmsDatabase {
  private db: CmsDatabaseSchema;

  constructor() {
    this.db = this.load();
  }

  private load(): CmsDatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Verify key integrity
        if (parsed.admins && parsed.menuItems && parsed.landingSections) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to load database file, creating fresh initial database:', err);
    }

    const fresh = generateInitialDatabase();
    this.saveToFile(fresh);
    return fresh;
  }

  private saveToFile(data = this.db): void {
    try {
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // Admin Auth Methods
  public getAdminByEmail(email: string): AdminUserRecord | undefined {
    return this.db.admins.find(a => a.email.toLowerCase() === email.toLowerCase());
  }

  public getAdminById(id: string): AdminUserRecord | undefined {
    return this.db.admins.find(a => a.id === id);
  }

  public getAdmins(): AdminUser[] {
    return this.db.admins.map(({ passwordHash, salt, ...safe }) => safe);
  }

  public createAdmin(name: string, email: string, password: string, role: 'admin' | 'editor'): AdminUser {
    const existing = this.getAdminByEmail(email);
    if (existing) {
      throw new Error('An administrator with this email already exists.');
    }
    const { hash, salt } = hashPassword(password);
    const newAdmin: AdminUserRecord = {
      id: `admin-${Date.now()}`,
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
      passwordHash: hash,
      salt
    };
    this.db.admins.push(newAdmin);
    this.saveToFile();
    const { passwordHash: _, salt: __, ...safe } = newAdmin;
    return safe;
  }

  public updateAdmin(id: string, updates: Partial<{ name: string; email: string; role: 'admin' | 'editor'; password?: string }>): AdminUser {
    const index = this.db.admins.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Admin not found.');

    const admin = this.db.admins[index];
    if (updates.name) admin.name = updates.name;
    if (updates.email) admin.email = updates.email;
    if (updates.role) admin.role = updates.role;
    if (updates.password && updates.password.trim()) {
      const { hash, salt } = hashPassword(updates.password);
      admin.passwordHash = hash;
      admin.salt = salt;
    }

    this.saveToFile();
    const { passwordHash: _, salt: __, ...safe } = admin;
    return safe;
  }

  public deleteAdmin(id: string): void {
    if (this.db.admins.length <= 1) {
      throw new Error('Cannot delete the last remaining administrator account.');
    }
    this.db.admins = this.db.admins.filter(a => a.id !== id);
    this.saveToFile();
  }

  public updateLastLogin(id: string): void {
    const admin = this.db.admins.find(a => a.id === id);
    if (admin) {
      admin.lastLoginAt = new Date().toISOString();
      this.saveToFile();
    }
  }

  // Public CMS Payload for Frontend (Enforces section dependency on the backend as well)
  public getPublicCmsPayload(): FullCmsPayload {
    const enabledSectionKeys = new Set(
      this.db.landingSections.filter(s => s.isEnabled).map(s => s.sectionKey.toLowerCase())
    );

    const isTargetSectionEnabled = (targetOrUrl?: string): boolean => {
      if (!targetOrUrl) return true;
      const slug = targetOrUrl.replace(/^#/, '').toLowerCase();
      if (!slug) return true;

      if (['menu', 'pizza-builder', 'order', 'food', 'drinks'].includes(slug)) {
        return enabledSectionKeys.has('menu');
      }
      if (['reservations', 'reservation', 'reserve', 'book', 'table'].includes(slug)) {
        return enabledSectionKeys.has('reservations');
      }
      if (['rec-room', 'gallery', 'atmosphere', 'photos', 'games', 'pool'].includes(slug)) {
        return enabledSectionKeys.has('rec-room');
      }
      if (['reviews', 'review', 'testimonials', 'ratings'].includes(slug)) {
        return enabledSectionKeys.has('reviews');
      }
      if (['location', 'locations', 'hours', 'opening-hours', 'contact', 'map'].includes(slug)) {
        return enabledSectionKeys.has('location');
      }
      if (['hero', 'home', 'top'].includes(slug)) {
        return enabledSectionKeys.has('hero');
      }
      if (['cta', 'call-to-action'].includes(slug)) {
        return enabledSectionKeys.has('cta');
      }
      return true;
    };

    // Filter navigation items so items pointing to disabled sections are not sent as active
    const publicNavItems = this.db.navigationItems
      .filter(n => n.isVisible && isTargetSectionEnabled(n.targetSection || n.url))
      .sort((a, b) => a.displayOrder - b.displayOrder);

    // Filter footer links whose target section is currently disabled
    const publicFooterContent: FooterContent = {
      ...this.db.footerContent,
      columns: this.db.footerContent.columns
        .map(col => ({
          ...col,
          links: col.links.filter(link => isTargetSectionEnabled(link.targetSection || link.url))
        }))
        .filter(col => col.links.length > 0)
    };

    // Filter CTA banners whose primary action targets a disabled section
    const publicCtaSections = this.db.ctaSections
      .filter(c => c.isVisible && isTargetSectionEnabled(c.buttonUrl));

    return {
      globalSettings: this.db.globalSettings,
      landingSections: [...this.db.landingSections].sort((a, b) => a.displayOrder - b.displayOrder),
      heroSettings: this.db.heroSettings,
      menuCategories: this.db.menuCategories.filter(c => c.isActive).sort((a, b) => a.displayOrder - b.displayOrder),
      menuItems: this.db.menuItems.filter(i => i.isActive).sort((a, b) => a.displayOrder - b.displayOrder),
      businessInfo: this.db.businessInfo,
      statistics: this.db.statistics.filter(s => s.isVisible).sort((a, b) => a.displayOrder - b.displayOrder),
      locations: this.db.locations.filter(l => l.isActive).sort((a, b) => a.displayOrder - b.displayOrder),
      openingHours: [...this.db.openingHours].sort((a, b) => a.displayOrder - b.displayOrder),
      features: this.db.features.filter(f => f.isActive).sort((a, b) => a.displayOrder - b.displayOrder),
      testimonials: this.db.testimonials.filter(t => t.isActive && t.isApproved).sort((a, b) => a.displayOrder - b.displayOrder),
      gallery: this.db.gallery.filter(g => g.isVisible).sort((a, b) => a.displayOrder - b.displayOrder),
      ctaSections: publicCtaSections,
      socialLinks: this.db.socialLinks.filter(s => s.isActive).sort((a, b) => a.displayOrder - b.displayOrder),
      navigationItems: publicNavItems,
      footerContent: publicFooterContent,
      seoSettings: this.db.seoSettings
    };
  }

  // Get full section dependency report for the admin center
  public getSectionDependencies(): Record<string, { section: LandingSection; connectedElements: any[] }> {
    const report: Record<string, { section: LandingSection; connectedElements: any[] }> = {};

    this.db.landingSections.forEach(sec => {
      const canonical = sec.sectionKey.toLowerCase();
      const connected: any[] = [];

      // 1. Navigation items
      this.db.navigationItems.forEach(n => {
        const target = (n.targetSection || n.url.replace(/^#/, '')).toLowerCase();
        if (target === canonical || (canonical === 'rec-room' && target === 'gallery') || (canonical === 'reviews' && target === 'testimonials')) {
          connected.push({
            id: `nav-${n.id}`,
            label: `${n.label} Navigation`,
            location: 'Header & Mobile Navigation Menu',
            targetSection: canonical
          });
        }
      });

      // 2. Header quick actions
      if (canonical === 'reservations') {
        connected.push({
          id: 'hdr-reserve',
          label: 'Reserve Table Button',
          location: 'Header Quick Actions',
          targetSection: 'reservations'
        });
      }
      if (canonical === 'menu') {
        connected.push({
          id: 'hdr-order',
          label: 'Online Order Button',
          location: 'Header Quick Actions',
          targetSection: 'menu'
        });
      }

      // 3. Hero buttons
      const hero = this.db.heroSettings;
      const pTarget = (hero.primaryButtonConfig?.targetSection || hero.primaryButtonUrl?.replace(/^#/, '') || '').toLowerCase();
      if (pTarget === canonical) {
        connected.push({
          id: 'hero-primary',
          label: `"${hero.primaryButtonText || 'Order Online Now'}" Button`,
          location: 'Hero Banner Section',
          targetSection: canonical
        });
      }

      const sTarget = (hero.secondaryButtonConfig?.targetSection || hero.secondaryButtonUrl?.replace(/^#/, '') || '').toLowerCase();
      if (sTarget === canonical) {
        connected.push({
          id: 'hero-secondary',
          label: `"${hero.secondaryButtonText || 'Reserve a Table'}" Button`,
          location: 'Hero Banner Section',
          targetSection: canonical
        });
      }

      const tTarget = (hero.thirdButtonConfig?.targetSection || hero.thirdButtonUrl?.replace(/^#/, '') || '').toLowerCase();
      if (tTarget === canonical) {
        connected.push({
          id: 'hero-third',
          label: `"${hero.thirdButtonText || 'View Full Menu'}" Button`,
          location: 'Hero Banner Section',
          targetSection: canonical
        });
      }

      // 4. Footer links
      this.db.footerContent.columns.forEach((col, cIdx) => {
        col.links.forEach((l, lIdx) => {
          const lTarget = (l.targetSection || l.url.replace(/^#/, '')).toLowerCase();
          if (lTarget === canonical || (canonical === 'menu' && lTarget === 'pizza-builder')) {
            connected.push({
              id: `footer-${cIdx}-${lIdx}`,
              label: `"${l.label}" Link`,
              location: `Footer: ${col.title}`,
              targetSection: canonical
            });
          }
        });
      });

      report[sec.sectionKey] = {
        section: sec,
        connectedElements: connected
      };
    });

    return report;
  }

  // Admin Complete Payload (Includes inactive items)
  public getAdminCmsPayload(): FullCmsPayload {
    return {
      globalSettings: this.db.globalSettings,
      landingSections: [...this.db.landingSections].sort((a, b) => a.displayOrder - b.displayOrder),
      heroSettings: this.db.heroSettings,
      menuCategories: [...this.db.menuCategories].sort((a, b) => a.displayOrder - b.displayOrder),
      menuItems: [...this.db.menuItems].sort((a, b) => a.displayOrder - b.displayOrder),
      businessInfo: this.db.businessInfo,
      statistics: [...this.db.statistics].sort((a, b) => a.displayOrder - b.displayOrder),
      locations: [...this.db.locations].sort((a, b) => a.displayOrder - b.displayOrder),
      openingHours: [...this.db.openingHours].sort((a, b) => a.displayOrder - b.displayOrder),
      features: [...this.db.features].sort((a, b) => a.displayOrder - b.displayOrder),
      testimonials: [...this.db.testimonials].sort((a, b) => a.displayOrder - b.displayOrder),
      gallery: [...this.db.gallery].sort((a, b) => a.displayOrder - b.displayOrder),
      ctaSections: [...this.db.ctaSections],
      socialLinks: [...this.db.socialLinks].sort((a, b) => a.displayOrder - b.displayOrder),
      navigationItems: [...this.db.navigationItems].sort((a, b) => a.displayOrder - b.displayOrder),
      footerContent: this.db.footerContent,
      seoSettings: this.db.seoSettings
    };
  }

  // CMS Section Update Methods
  public updateGlobalSettings(settings: Partial<GlobalSettings>): GlobalSettings {
    this.db.globalSettings = { ...this.db.globalSettings, ...settings };
    this.saveToFile();
    return this.db.globalSettings;
  }

  public updateHeroSettings(settings: Partial<HeroSettings>): HeroSettings {
    this.db.heroSettings = { ...this.db.heroSettings, ...settings };
    this.saveToFile();
    return this.db.heroSettings;
  }

  public updateBusinessInfo(info: Partial<BusinessInfo>): BusinessInfo {
    this.db.businessInfo = { ...this.db.businessInfo, ...info };
    this.saveToFile();
    return this.db.businessInfo;
  }

  public updateFooterContent(footer: Partial<FooterContent>): FooterContent {
    this.db.footerContent = { ...this.db.footerContent, ...footer };
    this.saveToFile();
    return this.db.footerContent;
  }

  public updateSeoSettings(seo: Partial<SeoSettings>): SeoSettings {
    this.db.seoSettings = { ...this.db.seoSettings, ...seo };
    this.saveToFile();
    return this.db.seoSettings;
  }

  // Landing Sections
  public getLandingSections(): LandingSection[] {
    return [...this.db.landingSections].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public updateLandingSection(id: string, updates: Partial<LandingSection>): LandingSection {
    const sec = this.db.landingSections.find(s => s.id === id);
    if (!sec) throw new Error('Section not found');
    Object.assign(sec, updates);
    this.saveToFile();
    return sec;
  }

  public reorderLandingSections(orderedIds: string[]): LandingSection[] {
    orderedIds.forEach((id, index) => {
      const sec = this.db.landingSections.find(s => s.id === id);
      if (sec) sec.displayOrder = index + 1;
    });
    this.saveToFile();
    return this.getLandingSections();
  }

  // Menu Categories CRUD
  public getMenuCategories(): MenuCategory[] {
    return [...this.db.menuCategories].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public addMenuCategory(cat: Omit<MenuCategory, 'id'>): MenuCategory {
    const newCat: MenuCategory = {
      id: `cat-${Date.now()}`,
      slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: cat.name,
      description: cat.description || '',
      displayOrder: cat.displayOrder || this.db.menuCategories.length + 1,
      isActive: cat.isActive !== undefined ? cat.isActive : true
    };
    this.db.menuCategories.push(newCat);
    this.saveToFile();
    return newCat;
  }

  public updateMenuCategory(id: string, updates: Partial<MenuCategory>): MenuCategory {
    const cat = this.db.menuCategories.find(c => c.id === id);
    if (!cat) throw new Error('Category not found');
    Object.assign(cat, updates);
    this.saveToFile();
    return cat;
  }

  public deleteMenuCategory(id: string, reassignToId?: string): void {
    const itemsInCat = this.db.menuItems.filter(i => i.categoryId === id || i.categoryId === this.db.menuCategories.find(c => c.id === id)?.slug);
    if (itemsInCat.length > 0 && !reassignToId) {
      throw new Error(`Cannot delete category: Contains ${itemsInCat.length} menu items. Please reassign items first.`);
    }
    if (itemsInCat.length > 0 && reassignToId) {
      itemsInCat.forEach(item => {
        item.categoryId = reassignToId;
      });
    }
    this.db.menuCategories = this.db.menuCategories.filter(c => c.id !== id);
    this.saveToFile();
  }

  // Menu Items CRUD
  public getMenuItems(): CmsMenuItem[] {
    return [...this.db.menuItems].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public addMenuItem(item: Omit<CmsMenuItem, 'id'>): CmsMenuItem {
    const newItem: CmsMenuItem = {
      id: `item-${Date.now()}`,
      categoryId: item.categoryId,
      name: item.name,
      description: item.description || '',
      price: Number(item.price) || 0,
      image: item.image || '',
      popular: Boolean(item.popular),
      isFeatured: Boolean(item.isFeatured),
      isActive: item.isActive !== undefined ? item.isActive : true,
      displayOrder: item.displayOrder || this.db.menuItems.length + 1,
      tags: item.tags || [],
      options: item.options || []
    };
    this.db.menuItems.push(newItem);
    this.saveToFile();
    return newItem;
  }

  public updateMenuItem(id: string, updates: Partial<CmsMenuItem>): CmsMenuItem {
    const item = this.db.menuItems.find(i => i.id === id);
    if (!item) throw new Error('Menu item not found');
    if (updates.price !== undefined) updates.price = Number(updates.price);
    Object.assign(item, updates);
    this.saveToFile();
    return item;
  }

  public deleteMenuItem(id: string): void {
    this.db.menuItems = this.db.menuItems.filter(i => i.id !== id);
    this.saveToFile();
  }

  // Statistics CRUD
  public getStatistics(): Statistic[] {
    return [...this.db.statistics].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public addStatistic(stat: Omit<Statistic, 'id'>): Statistic {
    const newStat: Statistic = {
      id: `stat-${Date.now()}`,
      ...stat,
      displayOrder: stat.displayOrder || this.db.statistics.length + 1
    };
    this.db.statistics.push(newStat);
    this.saveToFile();
    return newStat;
  }

  public updateStatistic(id: string, updates: Partial<Statistic>): Statistic {
    const stat = this.db.statistics.find(s => s.id === id);
    if (!stat) throw new Error('Statistic not found');
    Object.assign(stat, updates);
    this.saveToFile();
    return stat;
  }

  public deleteStatistic(id: string): void {
    this.db.statistics = this.db.statistics.filter(s => s.id !== id);
    this.saveToFile();
  }

  // Locations CRUD
  public getLocations(): LocationItem[] {
    return [...this.db.locations].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public addLocation(loc: Omit<LocationItem, 'id'>): LocationItem {
    const newLoc: LocationItem = {
      id: `loc-${Date.now()}`,
      ...loc,
      displayOrder: loc.displayOrder || this.db.locations.length + 1
    };
    this.db.locations.push(newLoc);
    this.saveToFile();
    return newLoc;
  }

  public updateLocation(id: string, updates: Partial<LocationItem>): LocationItem {
    const loc = this.db.locations.find(l => l.id === id);
    if (!loc) throw new Error('Location not found');
    Object.assign(loc, updates);
    this.saveToFile();
    return loc;
  }

  public deleteLocation(id: string): void {
    if (this.db.locations.length <= 1) {
      throw new Error('Cannot delete the primary location.');
    }
    this.db.locations = this.db.locations.filter(l => l.id !== id);
    this.saveToFile();
  }

  // Opening Hours CRUD
  public getOpeningHours(): OpeningHour[] {
    return [...this.db.openingHours].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public updateOpeningHour(id: string, updates: Partial<OpeningHour>): OpeningHour {
    const hour = this.db.openingHours.find(h => h.id === id);
    if (!hour) throw new Error('Opening hour not found');
    Object.assign(hour, updates);
    this.saveToFile();
    return hour;
  }

  // Features CRUD
  public getFeatures(): FeatureItem[] {
    return [...this.db.features].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public addFeature(feature: Omit<FeatureItem, 'id'>): FeatureItem {
    const newFeature: FeatureItem = {
      id: `feat-${Date.now()}`,
      ...feature,
      displayOrder: feature.displayOrder || this.db.features.length + 1
    };
    this.db.features.push(newFeature);
    this.saveToFile();
    return newFeature;
  }

  public updateFeature(id: string, updates: Partial<FeatureItem>): FeatureItem {
    const feature = this.db.features.find(f => f.id === id);
    if (!feature) throw new Error('Feature not found');
    Object.assign(feature, updates);
    this.saveToFile();
    return feature;
  }

  public deleteFeature(id: string): void {
    this.db.features = this.db.features.filter(f => f.id !== id);
    this.saveToFile();
  }

  // Testimonials CRUD
  public getTestimonials(): TestimonialItem[] {
    return [...this.db.testimonials].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public addTestimonial(test: Omit<TestimonialItem, 'id'>): TestimonialItem {
    const newTest: TestimonialItem = {
      id: `test-${Date.now()}`,
      ...test,
      likes: test.likes || 0,
      isApproved: test.isApproved !== undefined ? test.isApproved : true,
      isActive: test.isActive !== undefined ? test.isActive : true,
      displayOrder: test.displayOrder || this.db.testimonials.length + 1
    };
    this.db.testimonials.unshift(newTest);
    this.saveToFile();
    return newTest;
  }

  public updateTestimonial(id: string, updates: Partial<TestimonialItem>): TestimonialItem {
    const test = this.db.testimonials.find(t => t.id === id);
    if (!test) throw new Error('Testimonial not found');
    Object.assign(test, updates);
    this.saveToFile();
    return test;
  }

  public deleteTestimonial(id: string): void {
    this.db.testimonials = this.db.testimonials.filter(t => t.id !== id);
    this.saveToFile();
  }

  // Gallery CRUD
  public getGallery(): GalleryItem[] {
    return [...this.db.gallery].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public addGalleryItem(item: Omit<GalleryItem, 'id'>): GalleryItem {
    const newItem: GalleryItem = {
      id: `gal-${Date.now()}`,
      ...item,
      displayOrder: item.displayOrder || this.db.gallery.length + 1,
      isVisible: item.isVisible !== undefined ? item.isVisible : true
    };
    this.db.gallery.push(newItem);
    this.saveToFile();
    return newItem;
  }

  public updateGalleryItem(id: string, updates: Partial<GalleryItem>): GalleryItem {
    const item = this.db.gallery.find(g => g.id === id);
    if (!item) throw new Error('Gallery item not found');
    Object.assign(item, updates);
    this.saveToFile();
    return item;
  }

  public deleteGalleryItem(id: string): void {
    this.db.gallery = this.db.gallery.filter(g => g.id !== id);
    this.saveToFile();
  }

  // Social Links CRUD
  public getSocialLinks(): SocialLink[] {
    return [...this.db.socialLinks].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public addSocialLink(soc: Omit<SocialLink, 'id'>): SocialLink {
    const newSoc: SocialLink = {
      id: `soc-${Date.now()}`,
      ...soc,
      displayOrder: soc.displayOrder || this.db.socialLinks.length + 1
    };
    this.db.socialLinks.push(newSoc);
    this.saveToFile();
    return newSoc;
  }

  public updateSocialLink(id: string, updates: Partial<SocialLink>): SocialLink {
    const soc = this.db.socialLinks.find(s => s.id === id);
    if (!soc) throw new Error('Social link not found');
    Object.assign(soc, updates);
    this.saveToFile();
    return soc;
  }

  public deleteSocialLink(id: string): void {
    this.db.socialLinks = this.db.socialLinks.filter(s => s.id !== id);
    this.saveToFile();
  }

  // Navigation Items CRUD
  public getNavigationItems(): NavigationItem[] {
    return [...this.db.navigationItems].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public addNavigationItem(nav: Omit<NavigationItem, 'id'>): NavigationItem {
    const newNav: NavigationItem = {
      id: `nav-${Date.now()}`,
      ...nav,
      displayOrder: nav.displayOrder || this.db.navigationItems.length + 1
    };
    this.db.navigationItems.push(newNav);
    this.saveToFile();
    return newNav;
  }

  public updateNavigationItem(id: string, updates: Partial<NavigationItem>): NavigationItem {
    const nav = this.db.navigationItems.find(n => n.id === id);
    if (!nav) throw new Error('Navigation item not found');
    Object.assign(nav, updates);
    this.saveToFile();
    return nav;
  }

  public deleteNavigationItem(id: string): void {
    this.db.navigationItems = this.db.navigationItems.filter(n => n.id !== id);
    this.saveToFile();
  }

  // CTA Sections CRUD
  public getCtaSections(): CtaSection[] {
    return [...this.db.ctaSections];
  }

  public updateCtaSection(id: string, updates: Partial<CtaSection>): CtaSection {
    const cta = this.db.ctaSections.find(c => c.id === id);
    if (!cta) throw new Error('CTA section not found');
    Object.assign(cta, updates);
    this.saveToFile();
    return cta;
  }

  // Metrics Overview
  public getDashboardOverview() {
    return {
      totalMenuItems: this.db.menuItems.length,
      activeMenuItems: this.db.menuItems.filter(i => i.isActive).length,
      totalCategories: this.db.menuCategories.length,
      activeCategories: this.db.menuCategories.filter(c => c.isActive).length,
      totalLocations: this.db.locations.length,
      totalFeatures: this.db.features.length,
      totalTestimonials: this.db.testimonials.length,
      publishedSections: this.db.landingSections.filter(s => s.isEnabled).length,
      hiddenSections: this.db.landingSections.filter(s => !s.isEnabled).length,
      totalGalleryImages: this.db.gallery.length,
      totalAdmins: this.db.admins.length
    };
  }
}

export const cmsDb = new CmsDatabase();
