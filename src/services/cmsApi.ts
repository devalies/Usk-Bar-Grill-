import {
  FullCmsPayload,
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
  AdminUser
} from '../types/cms';

const TOKEN_KEY = 'usk_admin_token';
const USER_KEY = 'usk_admin_user';

export const cmsAuth = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  getUser(): AdminUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setAuth(token: string, user: AdminUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = cmsAuth.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Request failed.');
  }

  return data.data;
}

export const cmsApi = {
  // Public
  getPublicContent: () => apiRequest<FullCmsPayload>('/api/cms/content'),
  getSectionDependencies: () =>
    apiRequest<Record<string, { section: LandingSection; connectedElements: any[] }>>(
      '/api/cms/sections/dependencies'
    ),

  // Auth
  login: async (email: string, password: string) => {
    const data = await apiRequest<{ token: string; user: AdminUser }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    cmsAuth.setAuth(data.token, data.user);
    return data;
  },
  logout: () => {
    cmsAuth.clearAuth();
  },
  getCurrentUser: () => apiRequest<AdminUser>('/api/admin/me'),

  // Admin Dashboard
  getAdminContent: () => apiRequest<FullCmsPayload>('/api/admin/cms/content'),
  getOverview: () =>
    apiRequest<{
      totalMenuItems: number;
      activeMenuItems: number;
      totalCategories: number;
      activeCategories: number;
      totalLocations: number;
      totalFeatures: number;
      totalTestimonials: number;
      publishedSections: number;
      hiddenSections: number;
      totalGalleryImages: number;
      totalAdmins: number;
      totalOrders: number;
      pendingOrders: number;
      totalReservations: number;
      confirmedReservations: number;
    }>('/api/admin/dashboard/overview'),

  // Image Upload
  uploadImage: (imageBase64: string, filename?: string) =>
    apiRequest<{ url: string; filename: string; size: number }>('/api/admin/upload', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, filename })
    }),

  // Global & Section Updaters
  updateGlobalSettings: (payload: Partial<GlobalSettings>) =>
    apiRequest<GlobalSettings>('/api/admin/global-settings', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  updateHeroSettings: (payload: Partial<HeroSettings>) =>
    apiRequest<HeroSettings>('/api/admin/hero-settings', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  updateBusinessInfo: (payload: Partial<BusinessInfo>) =>
    apiRequest<BusinessInfo>('/api/admin/business-info', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  updateFooterContent: (payload: Partial<FooterContent>) =>
    apiRequest<FooterContent>('/api/admin/footer-content', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  updateSeoSettings: (payload: Partial<SeoSettings>) =>
    apiRequest<SeoSettings>('/api/admin/seo-settings', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  // Landing Sections
  getLandingSections: () => apiRequest<LandingSection[]>('/api/admin/landing-sections'),
  updateLandingSection: (id: string, updates: Partial<LandingSection>) =>
    apiRequest<LandingSection>(`/api/admin/landing-sections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),
  reorderLandingSections: (orderedIds: string[]) =>
    apiRequest<LandingSection[]>('/api/admin/landing-sections/reorder', {
      method: 'POST',
      body: JSON.stringify({ orderedIds })
    }),

  // Menu Categories
  getCategories: () => apiRequest<MenuCategory[]>('/api/admin/categories'),
  addCategory: (payload: Omit<MenuCategory, 'id'>) =>
    apiRequest<MenuCategory>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateCategory: (id: string, updates: Partial<MenuCategory>) =>
    apiRequest<MenuCategory>(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),
  deleteCategory: (id: string, reassignToId?: string) =>
    apiRequest<void>(`/api/admin/categories/${id}${reassignToId ? `?reassignToId=${reassignToId}` : ''}`, {
      method: 'DELETE'
    }),

  // Menu Items
  getMenuItems: () => apiRequest<CmsMenuItem[]>('/api/admin/menu-items'),
  addMenuItem: (payload: Omit<CmsMenuItem, 'id'>) =>
    apiRequest<CmsMenuItem>('/api/admin/menu-items', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateMenuItem: (id: string, updates: Partial<CmsMenuItem>) =>
    apiRequest<CmsMenuItem>(`/api/admin/menu-items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),
  deleteMenuItem: (id: string) =>
    apiRequest<void>(`/api/admin/menu-items/${id}`, {
      method: 'DELETE'
    }),

  // Statistics
  getStatistics: () => apiRequest<Statistic[]>('/api/admin/statistics'),
  addStatistic: (payload: Omit<Statistic, 'id'>) =>
    apiRequest<Statistic>('/api/admin/statistics', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateStatistic: (id: string, updates: Partial<Statistic>) =>
    apiRequest<Statistic>(`/api/admin/statistics/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),
  deleteStatistic: (id: string) =>
    apiRequest<void>(`/api/admin/statistics/${id}`, {
      method: 'DELETE'
    }),

  // Locations
  getLocations: () => apiRequest<LocationItem[]>('/api/admin/locations'),
  addLocation: (payload: Omit<LocationItem, 'id'>) =>
    apiRequest<LocationItem>('/api/admin/locations', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateLocation: (id: string, updates: Partial<LocationItem>) =>
    apiRequest<LocationItem>(`/api/admin/locations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),
  deleteLocation: (id: string) =>
    apiRequest<void>(`/api/admin/locations/${id}`, {
      method: 'DELETE'
    }),

  // Opening Hours
  getOpeningHours: () => apiRequest<OpeningHour[]>('/api/admin/opening-hours'),
  updateOpeningHour: (id: string, updates: Partial<OpeningHour>) =>
    apiRequest<OpeningHour>(`/api/admin/opening-hours/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),

  // Features
  getFeatures: () => apiRequest<FeatureItem[]>('/api/admin/features'),
  addFeature: (payload: Omit<FeatureItem, 'id'>) =>
    apiRequest<FeatureItem>('/api/admin/features', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateFeature: (id: string, updates: Partial<FeatureItem>) =>
    apiRequest<FeatureItem>(`/api/admin/features/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),
  deleteFeature: (id: string) =>
    apiRequest<void>(`/api/admin/features/${id}`, {
      method: 'DELETE'
    }),

  // Testimonials
  getTestimonials: () => apiRequest<TestimonialItem[]>('/api/admin/testimonials'),
  addTestimonial: (payload: Omit<TestimonialItem, 'id'>) =>
    apiRequest<TestimonialItem>('/api/admin/testimonials', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateTestimonial: (id: string, updates: Partial<TestimonialItem>) =>
    apiRequest<TestimonialItem>(`/api/admin/testimonials/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),
  deleteTestimonial: (id: string) =>
    apiRequest<void>(`/api/admin/testimonials/${id}`, {
      method: 'DELETE'
    }),

  // Gallery
  getGallery: () => apiRequest<GalleryItem[]>('/api/admin/gallery'),
  addGalleryItem: (payload: Omit<GalleryItem, 'id'>) =>
    apiRequest<GalleryItem>('/api/admin/gallery', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateGalleryItem: (id: string, updates: Partial<GalleryItem>) =>
    apiRequest<GalleryItem>(`/api/admin/gallery/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),
  deleteGalleryItem: (id: string) =>
    apiRequest<void>(`/api/admin/gallery/${id}`, {
      method: 'DELETE'
    }),

  // CTA Sections
  getCtaSections: () => apiRequest<CtaSection[]>('/api/admin/cta-sections'),
  updateCtaSection: (id: string, updates: Partial<CtaSection>) =>
    apiRequest<CtaSection>(`/api/admin/cta-sections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),

  // Social Links
  getSocialLinks: () => apiRequest<SocialLink[]>('/api/admin/social-links'),
  addSocialLink: (payload: Omit<SocialLink, 'id'>) =>
    apiRequest<SocialLink>('/api/admin/social-links', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateSocialLink: (id: string, updates: Partial<SocialLink>) =>
    apiRequest<SocialLink>(`/api/admin/social-links/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),
  deleteSocialLink: (id: string) =>
    apiRequest<void>(`/api/admin/social-links/${id}`, {
      method: 'DELETE'
    }),

  // Navigation Items
  getNavigationItems: () => apiRequest<NavigationItem[]>('/api/admin/navigation-items'),
  addNavigationItem: (payload: Omit<NavigationItem, 'id'>) =>
    apiRequest<NavigationItem>('/api/admin/navigation-items', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateNavigationItem: (id: string, updates: Partial<NavigationItem>) =>
    apiRequest<NavigationItem>(`/api/admin/navigation-items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),
  deleteNavigationItem: (id: string) =>
    apiRequest<void>(`/api/admin/navigation-items/${id}`, {
      method: 'DELETE'
    }),

  // Admin Users (Admin role only)
  getAdminUsers: () => apiRequest<AdminUser[]>('/api/admin/users'),
  createAdminUser: (payload: { name: string; email: string; password: string; role: 'admin' | 'editor' }) =>
    apiRequest<AdminUser>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateAdminUser: (id: string, updates: { name?: string; email?: string; role?: 'admin' | 'editor'; password?: string }) =>
    apiRequest<AdminUser>(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),
  deleteAdminUser: (id: string) =>
    apiRequest<void>(`/api/admin/users/${id}`, {
      method: 'DELETE'
    }),

  // Live Orders & Reservations
  getOrders: () => apiRequest<any[]>('/api/orders'),
  updateOrderStatus: (id: string, status: string) =>
    apiRequest<any>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
  getReservations: () => apiRequest<any[]>('/api/reservations')
};
