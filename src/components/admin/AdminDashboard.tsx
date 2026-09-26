import React, { useState, useEffect } from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { OverviewPanel } from './panels/OverviewPanel';
import { LandingSectionsPanel } from './panels/LandingSectionsPanel';
import { HeroPanel } from './panels/HeroPanel';
import { MenuPanel } from './panels/MenuPanel';
import { BusinessInfoPanel } from './panels/BusinessInfoPanel';
import {
  FeaturesPanel,
  TestimonialsPanel,
  GalleryPanel,
  GlobalAndSeoPanel,
  OrdersAndReservationsPanel
} from './panels/ContentPanels';
import { AdminUser, FullCmsPayload } from '../../types/cms';
import { cmsApi } from '../../services/cmsApi';
import { Loader2 } from 'lucide-react';

interface AdminDashboardProps {
  user: AdminUser;
  onLogout: () => void;
  onViewLiveSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onLogout,
  onViewLiveSite
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cmsData, setCmsData] = useState<FullCmsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const loadData = async () => {
    try {
      const data = await cmsApi.getAdminContent();
      setCmsData(data);
    } catch (err) {
      console.error('Failed to load admin content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-stone-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 text-xs">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <AdminHeader
        user={user}
        onLogout={onLogout}
        onViewLiveSite={onViewLiveSite}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex">
        {/* Responsive Left Sidebar */}
        <AdminSidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          userRole={user.role}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {isLoading || !cmsData ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-stone-400">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
              <p className="text-sm">Connecting to CMS Database Engine...</p>
            </div>
          ) : (
            <>
              {currentTab === 'overview' && (
                <OverviewPanel onNavigateTab={tab => setCurrentTab(tab)} />
              )}

              {currentTab === 'landing-sections' && (
                <LandingSectionsPanel
                  sections={cmsData.landingSections}
                  cmsPayload={cmsData}
                  onRefresh={loadData}
                  onShowToast={showToast}
                />
              )}

              {currentTab === 'hero' && (
                <HeroPanel
                  initialSettings={cmsData.heroSettings}
                  sections={cmsData.landingSections}
                  onRefresh={loadData}
                  onShowToast={showToast}
                />
              )}

              {(currentTab === 'menu-items' || currentTab === 'menu-categories') && (
                <MenuPanel
                  items={cmsData.menuItems}
                  categories={cmsData.menuCategories}
                  onRefresh={loadData}
                  onShowToast={showToast}
                />
              )}

              {(currentTab === 'business-info' ||
                currentTab === 'opening-hours' ||
                currentTab === 'locations') && (
                <BusinessInfoPanel
                  businessInfo={cmsData.businessInfo}
                  locations={cmsData.locations}
                  openingHours={cmsData.openingHours}
                  onRefresh={loadData}
                  onShowToast={showToast}
                />
              )}

              {currentTab === 'features' && (
                <FeaturesPanel
                  features={cmsData.features}
                  onRefresh={loadData}
                  onShowToast={showToast}
                />
              )}

              {currentTab === 'testimonials' && (
                <TestimonialsPanel
                  testimonials={cmsData.testimonials}
                  onRefresh={loadData}
                  onShowToast={showToast}
                />
              )}

              {currentTab === 'gallery' && (
                <GalleryPanel
                  gallery={cmsData.gallery}
                  onRefresh={loadData}
                  onShowToast={showToast}
                />
              )}

              {(currentTab === 'global-settings' ||
                currentTab === 'seo' ||
                currentTab === 'footer' ||
                currentTab === 'social-links' ||
                currentTab === 'navigation') && (
                <GlobalAndSeoPanel
                  globalSettings={cmsData.globalSettings}
                  seoSettings={cmsData.seoSettings}
                  onRefresh={loadData}
                  onShowToast={showToast}
                />
              )}

              {currentTab === 'orders-reservations' && (
                <OrdersAndReservationsPanel onShowToast={showToast} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
