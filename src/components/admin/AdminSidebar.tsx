import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Sparkles,
  UtensilsCrossed,
  FolderTree,
  Building2,
  BarChart3,
  MapPin,
  Clock,
  Flame,
  MessageSquare,
  Images,
  PhoneCall,
  Share2,
  Navigation,
  FileText,
  Search,
  Settings,
  Users,
  ShoppingBag,
  X
} from 'lucide-react';
import { AdminRole } from '../../types/cms';

export type AdminTab =
  | 'overview'
  | 'landing-sections'
  | 'hero'
  | 'menu-items'
  | 'menu-categories'
  | 'business-info'
  | 'statistics'
  | 'locations'
  | 'opening-hours'
  | 'features'
  | 'testimonials'
  | 'gallery'
  | 'cta-sections'
  | 'social-links'
  | 'navigation'
  | 'footer'
  | 'seo'
  | 'global-settings'
  | 'orders-reservations'
  | 'admin-users';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  userRole: AdminRole;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  isOpen,
  onClose
}) => {
  const navGroups: {
    groupTitle: string;
    items: { id: AdminTab; label: string; icon: React.ElementType; adminOnly?: boolean }[];
  }[] = [
    {
      groupTitle: 'Dashboard',
      items: [
        { id: 'overview', label: 'Overview & Metrics', icon: LayoutDashboard },
        { id: 'orders-reservations', label: 'Orders & Tables', icon: ShoppingBag }
      ]
    },
    {
      groupTitle: 'Page Content',
      items: [
        { id: 'landing-sections', label: 'Landing Sections', icon: Layers },
        { id: 'hero', label: 'Hero / Banner', icon: Sparkles },
        { id: 'features', label: 'Features & Amenities', icon: Flame },
        { id: 'cta-sections', label: 'Contact / CTAs', icon: PhoneCall }
      ]
    },
    {
      groupTitle: 'Menu & Food',
      items: [
        { id: 'menu-items', label: 'Menu Items', icon: UtensilsCrossed },
        { id: 'menu-categories', label: 'Categories', icon: FolderTree }
      ]
    },
    {
      groupTitle: 'Business Details',
      items: [
        { id: 'business-info', label: 'Business Profile', icon: Building2 },
        { id: 'opening-hours', label: 'Opening Hours', icon: Clock },
        { id: 'locations', label: 'Locations', icon: MapPin },
        { id: 'statistics', label: 'Numbers & Stats', icon: BarChart3 }
      ]
    },
    {
      groupTitle: 'Media & Social',
      items: [
        { id: 'testimonials', label: 'Reviews & Feedback', icon: MessageSquare },
        { id: 'gallery', label: 'Gallery & Photos', icon: Images },
        { id: 'social-links', label: 'Social Media', icon: Share2 }
      ]
    },
    {
      groupTitle: 'Layout & System',
      items: [
        { id: 'navigation', label: 'Navigation Menu', icon: Navigation },
        { id: 'footer', label: 'Footer Content', icon: FileText },
        { id: 'seo', label: 'SEO & Metadata', icon: Search },
        { id: 'global-settings', label: 'Global Settings', icon: Settings },
        { id: 'admin-users', label: 'Admin Accounts', icon: Users, adminOnly: true }
      ]
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-stone-950/80 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 z-40 h-full lg:h-[calc(100vh-4rem)] w-64 bg-stone-950 border-r border-stone-800 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-3.5 border-b border-stone-850 flex items-center justify-between bg-stone-900/40">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Usk Bar and Grill Logo"
              className="w-7 h-7 rounded-full object-cover ring-1 ring-amber-500/40 shrink-0"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-xs font-display leading-tight">Usk Bar &amp; Grill</span>
              <span className="text-[9px] text-amber-500/80 font-bold uppercase tracking-wider">CMS Workspace</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-white lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {navGroups.map(group => {
            const filteredItems = group.items.filter(
              item => !item.adminOnly || userRole === 'admin'
            );
            if (filteredItems.length === 0) return null;

            return (
              <div key={group.groupTitle} className="space-y-1">
                <p className="px-3 text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                  {group.groupTitle}
                </p>
                {filteredItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                        isActive
                          ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                          : 'text-stone-300 hover:text-white hover:bg-stone-900/80'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};
