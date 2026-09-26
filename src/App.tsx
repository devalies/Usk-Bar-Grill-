import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MenuSection } from './components/MenuSection';
import { PizzaBuilderModal } from './components/PizzaBuilderModal';
import { ItemCustomizerModal } from './components/ItemCustomizerModal';
import { CartDrawer } from './components/CartDrawer';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { ReservationSection } from './components/ReservationSection';
import { GallerySection } from './components/GallerySection';
import { GoogleMapsReviews } from './components/GoogleMapsReviews';
import { LocationHours } from './components/LocationHours';
import { Footer } from './components/Footer';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MenuItem, CartItem, Order, Reservation } from './types/restaurant';
import { FullCmsPayload, AdminUser } from './types/cms';
import { cmsApi, cmsAuth } from './services/cmsApi';
import { isSectionEnabled } from './utils/sectionDependency';

export default function App() {
  const [cmsPayload, setCmsPayload] = useState<FullCmsPayload | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => cmsAuth.getUser());

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('usk_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPizzaBuilderOpen, setIsPizzaBuilderOpen] = useState(false);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Load public CMS content
  const loadCmsContent = async () => {
    try {
      const data = await cmsApi.getPublicContent();
      setCmsPayload(data);
    } catch (err) {
      console.error('Failed to fetch CMS content:', err);
    }
  };

  useEffect(() => {
    loadCmsContent();
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('usk_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleOpenAdmin = () => {
    if (adminUser) {
      setIsAdminView(true);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setShowLoginModal(false);
    setIsAdminView(true);
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    cmsApi.logout();
    setAdminUser(null);
    setIsAdminView(false);
    showToast('Signed out of admin dashboard.');
    loadCmsContent();
  };

  const handleAddToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(
        i =>
          i.menuItemId === item.menuItemId &&
          JSON.stringify(i.selectedOptions) === JSON.stringify(item.selectedOptions) &&
          JSON.stringify(i.customPizzaDetails) === JSON.stringify(item.customPizzaDetails)
      );

      if (existingIdx >= 0) {
        const copy = [...prev];
        const updatedQty = copy[existingIdx].quantity + item.quantity;
        const unitPrice = copy[existingIdx].totalItemPrice / copy[existingIdx].quantity;
        copy[existingIdx] = {
          ...copy[existingIdx],
          quantity: updatedQty,
          totalItemPrice: unitPrice * updatedQty
        };
        return copy;
      }

      return [...prev, item];
    });

    showToast(`Added ${item.name} to order!`);
  };

  const handleDirectAdd = (menuItem: MenuItem) => {
    const item: CartItem = {
      cartItemId: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      menuItemId: menuItem.id,
      name: menuItem.name,
      basePrice: menuItem.price,
      quantity: 1,
      selectedOptions: {},
      totalItemPrice: menuItem.price
    };
    handleAddToCart(item);
  };

  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => {
        if (item.cartItemId === cartItemId) {
          const unitPrice = item.totalItemPrice / item.quantity;
          return {
            ...item,
            quantity: newQuantity,
            totalItemPrice: unitPrice * newQuantity
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id.replace('#', ''));
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // If in Admin Dashboard view, render the CMS control center
  if (isAdminView && adminUser) {
    return (
      <AdminDashboard
        user={adminUser}
        onLogout={handleLogout}
        onViewLiveSite={() => {
          setIsAdminView(false);
          loadCmsContent();
        }}
      />
    );
  }

  // Section visibility checks according to CMS landingSections
  const sections = cmsPayload?.landingSections || [];
  const checkSectionEnabled = (key: string) => isSectionEnabled(key, sections);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-stone-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 text-xs">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        cartItemCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenReservation={() => scrollTo('reservations')}
        onOpenAdmin={handleOpenAdmin}
        activeSection={activeSection}
        businessInfo={cmsPayload?.businessInfo}
        navigationItems={cmsPayload?.navigationItems}
        sections={sections}
      />

      {/* Main Content Areas conditionally rendered per CMS configuration */}
      <main className="flex-1">
        {checkSectionEnabled('hero') && (
          <Hero
            settings={cmsPayload?.heroSettings}
            sections={sections}
            onOrderClick={() => scrollTo('menu')}
            onReserveClick={() => scrollTo('reservations')}
            onExploreMenu={() => scrollTo('menu')}
          />
        )}

        {checkSectionEnabled('menu') && (
          <MenuSection
            cmsItems={cmsPayload?.menuItems}
            cmsCategories={cmsPayload?.menuCategories}
            onSelectItem={item => setCustomizingItem(item)}
            onOpenPizzaBuilder={() => setIsPizzaBuilderOpen(true)}
            onDirectAdd={handleDirectAdd}
          />
        )}

        {checkSectionEnabled('rec-room') && (
          <GallerySection gallery={cmsPayload?.gallery} />
        )}

        {checkSectionEnabled('reservations') && (
          <ReservationSection
            onReservationComplete={(res: Reservation) => {
              showToast(`Table reserved! Code: ${res.confirmationCode}`);
            }}
          />
        )}

        {checkSectionEnabled('reviews') && (
          <GoogleMapsReviews
            cmsTestimonials={cmsPayload?.testimonials}
            businessInfo={cmsPayload?.businessInfo}
          />
        )}

        {checkSectionEnabled('location') && (
          <LocationHours
            businessInfo={cmsPayload?.businessInfo}
            openingHours={cmsPayload?.openingHours}
            locations={cmsPayload?.locations}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        businessInfo={cmsPayload?.businessInfo}
        footerContent={cmsPayload?.footerContent}
        sections={sections}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Admin Login Modal */}
      {showLoginModal && (
        <AdminLogin
          onSuccess={handleLoginSuccess}
          onCancel={() => setShowLoginModal(false)}
        />
      )}

      {/* Interactive Custom 12" Pizza Builder Modal */}
      <PizzaBuilderModal
        isOpen={isPizzaBuilderOpen}
        onClose={() => setIsPizzaBuilderOpen(false)}
        onAddToCart={handleAddToCart}
      />

      {/* Regular Menu Item Customizer Modal */}
      <ItemCustomizerModal
        item={customizingItem}
        isOpen={Boolean(customizingItem)}
        onClose={() => setCustomizingItem(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Slide-Over Cart & Online Ordering Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOrderPlaced={(order: Order) => {
          setConfirmedOrder(order);
          showToast(`Order #${order.orderNumber} placed!`);
        }}
      />

      {/* Live Order Confirmation & Brick Oven Tracker Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        isOpen={Boolean(confirmedOrder)}
        onClose={() => setConfirmedOrder(null)}
      />
    </div>
  );
}
