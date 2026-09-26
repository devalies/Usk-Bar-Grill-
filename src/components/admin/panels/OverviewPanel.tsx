import React, { useEffect, useState } from 'react';
import {
  UtensilsCrossed,
  Layers,
  FolderTree,
  MessageSquare,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  EyeOff,
  Flame,
  ArrowRight
} from 'lucide-react';
import { cmsApi } from '../../../services/cmsApi';
import { AdminTab } from '../AdminSidebar';

interface OverviewPanelProps {
  onNavigateTab: (tab: AdminTab) => void;
}

export const OverviewPanel: React.FC<OverviewPanelProps> = ({ onNavigateTab }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const data = await cmsApi.getOverview();
      setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !metrics) {
    return (
      <div className="p-8 text-center text-stone-400">
        <p className="text-sm">Loading dynamic dashboard metrics...</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Menu Items',
      value: `${metrics.activeMenuItems} / ${metrics.totalMenuItems}`,
      subtext: `${metrics.activeMenuItems} active on frontend`,
      icon: UtensilsCrossed,
      color: 'text-amber-400',
      tab: 'menu-items' as AdminTab
    },
    {
      label: 'Categories',
      value: `${metrics.activeCategories} / ${metrics.totalCategories}`,
      subtext: 'Active menu categories',
      icon: FolderTree,
      color: 'text-blue-400',
      tab: 'menu-categories' as AdminTab
    },
    {
      label: 'Homepage Sections',
      value: `${metrics.publishedSections} Live`,
      subtext: `${metrics.hiddenSections} currently hidden`,
      icon: Layers,
      color: 'text-emerald-400',
      tab: 'landing-sections' as AdminTab
    },
    {
      label: 'Customer Orders',
      value: metrics.totalOrders,
      subtext: `${metrics.pendingOrders} active orders`,
      icon: ShoppingBag,
      color: 'text-orange-400',
      tab: 'orders-reservations' as AdminTab
    },
    {
      label: 'Table Reservations',
      value: metrics.totalReservations,
      subtext: `${metrics.confirmedReservations} confirmed reservations`,
      icon: Calendar,
      color: 'text-purple-400',
      tab: 'orders-reservations' as AdminTab
    },
    {
      label: 'Verified Reviews',
      value: metrics.totalTestimonials,
      subtext: 'Google Maps verified ratings',
      icon: MessageSquare,
      color: 'text-yellow-400',
      tab: 'testimonials' as AdminTab
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-stone-900 via-amber-950/20 to-stone-900 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1 text-xs font-bold text-amber-500 uppercase tracking-wider">
              <Flame className="w-4 h-4 fill-amber-500" /> CMS Engine Active
            </span>
          </div>
          <h2 className="text-2xl font-black text-white font-display">
            Usk Bar and Grill Control Center
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-xl">
            Manage your brick oven menu, opening schedule, business profile, photos, and homepage sections with zero code edits.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('menu-items')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold rounded-xl transition cursor-pointer self-start sm:self-auto"
        >
          <span>Manage Menu</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dynamic Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              onClick={() => onNavigateTab(card.tab)}
              className="p-5 bg-stone-900/60 hover:bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-2xl transition cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl bg-stone-950 border border-stone-800 ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  {card.value}
                </p>
                <p className="text-xs text-stone-500 mt-1 flex items-center justify-between">
                  <span>{card.subtext}</span>
                  <span className="text-amber-400 text-[11px] group-hover:translate-x-1 transition-transform inline-block">
                    Edit →
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-stone-900/40 border border-stone-800 rounded-2xl space-y-3">
          <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
            Quick Section Controls
          </h3>
          <p className="text-xs text-stone-400">
            Show or hide whole sections on the frontend with a single toggle:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => onNavigateTab('landing-sections')}
              className="px-3 py-1.5 bg-stone-950 border border-stone-800 hover:border-amber-500 text-xs font-semibold rounded-lg text-stone-200 transition"
            >
              Manage 6 Landing Sections
            </button>
            <button
              onClick={() => onNavigateTab('hero')}
              className="px-3 py-1.5 bg-stone-950 border border-stone-800 hover:border-amber-500 text-xs font-semibold rounded-lg text-stone-200 transition"
            >
              Edit Hero Content
            </button>
            <button
              onClick={() => onNavigateTab('opening-hours')}
              className="px-3 py-1.5 bg-stone-950 border border-stone-800 hover:border-amber-500 text-xs font-semibold rounded-lg text-stone-200 transition"
            >
              Update Operating Hours
            </button>
          </div>
        </div>

        <div className="p-5 bg-stone-900/40 border border-stone-800 rounded-2xl space-y-3">
          <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
            Live Database Persistence
          </h3>
          <div className="text-xs text-stone-400 space-y-1.5">
            <p className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full file-backed JSON database engine active</span>
            </p>
            <p className="flex items-center gap-2 text-stone-300">
              <span>All changes publish immediately to the live public frontend</span>
            </p>
            <p className="flex items-center gap-2 text-stone-400">
              <span>Automatic thumbnail & 10MB media upload pipeline ready</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
