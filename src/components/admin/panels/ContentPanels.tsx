import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Save,
  Star,
  Eye,
  EyeOff,
  Flame,
  MessageSquare,
  Images,
  BarChart3,
  Share2,
  Navigation,
  FileText,
  Search,
  Settings,
  Users,
  ShoppingBag,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import {
  FeatureItem,
  TestimonialItem,
  GalleryItem,
  Statistic,
  SocialLink,
  NavigationItem,
  FooterContent,
  SeoSettings,
  GlobalSettings,
  AdminUser,
  CtaSection
} from '../../../types/cms';
import { cmsApi } from '../../../services/cmsApi';
import { ImageUploader } from '../ImageUploader';
import { ConfirmationModal } from '../ConfirmationModal';

// ----------------- FEATURES PANEL -----------------
export const FeaturesPanel: React.FC<{
  features: FeatureItem[];
  onRefresh: () => void;
  onShowToast: (msg: string) => void;
}> = ({ features, onRefresh, onShowToast }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newBadge, setNewBadge] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<FeatureItem | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await cmsApi.addFeature({
        title: newTitle.trim(),
        description: newDesc.trim(),
        badge: newBadge.trim(),
        icon: 'Flame',
        isActive: true,
        displayOrder: features.length + 1
      });
      setNewTitle('');
      setNewDesc('');
      setNewBadge('');
      onShowToast('New feature added.');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggle = async (f: FeatureItem) => {
    try {
      await cmsApi.updateFeature(f.id, { isActive: !f.isActive });
      onShowToast(`Feature ${!f.isActive ? 'enabled' : 'disabled'}.`);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await cmsApi.deleteFeature(deleteTarget.id);
      onShowToast('Feature removed.');
      setDeleteTarget(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white font-display">Features & Tavern Amenities</h2>
        <p className="text-xs text-stone-400 mt-1">Manage highlight features like the brick oven, rec room, and drive-through.</p>
      </div>

      <form onSubmit={handleAdd} className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Add New Feature</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            required
            placeholder="Feature Title (e.g. Free Foosball)"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="px-3 py-1.5 text-xs bg-stone-950 border border-stone-800 rounded-lg text-white"
          />
          <input
            type="text"
            placeholder="Badge / Pill (e.g. Free Play)"
            value={newBadge}
            onChange={e => setNewBadge(e.target.value)}
            className="px-3 py-1.5 text-xs bg-stone-950 border border-stone-800 rounded-lg text-white"
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg transition"
          >
            Add Feature
          </button>
        </div>
        <textarea
          rows={2}
          placeholder="Feature Description..."
          value={newDesc}
          onChange={e => setNewDesc(e.target.value)}
          className="w-full px-3 py-1.5 text-xs bg-stone-950 border border-stone-800 rounded-lg text-white"
        />
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map(f => (
          <div
            key={f.id}
            className={`p-4 rounded-xl border flex flex-col justify-between ${
              f.isActive ? 'bg-stone-900/60 border-stone-800' : 'bg-stone-950 border-stone-800/50 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-white">{f.title}</span>
                {f.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/10 text-amber-400">
                    {f.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">{f.description}</p>
            </div>
            <div className="mt-4 pt-2 border-t border-stone-800 flex justify-between items-center">
              <button
                onClick={() => handleToggle(f)}
                className={`text-xs px-2 py-1 rounded ${
                  f.isActive ? 'text-emerald-400' : 'text-stone-500'
                }`}
              >
                {f.isActive ? 'Active' : 'Inactive'}
              </button>
              <button
                onClick={() => setDeleteTarget(f)}
                className="p-1 text-stone-500 hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Feature"
        message={`Delete "${deleteTarget?.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

// ----------------- TESTIMONIALS PANEL -----------------
export const TestimonialsPanel: React.FC<{
  testimonials: TestimonialItem[];
  onRefresh: () => void;
  onShowToast: (msg: string) => void;
}> = ({ testimonials, onRefresh, onShowToast }) => {
  const [deleteTarget, setDeleteTarget] = useState<TestimonialItem | null>(null);

  const handleToggle = async (t: TestimonialItem) => {
    try {
      await cmsApi.updateTestimonial(t.id, { isActive: !t.isActive });
      onShowToast(`Review status updated.`);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await cmsApi.deleteTestimonial(deleteTarget.id);
      onShowToast('Review deleted.');
      setDeleteTarget(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white font-display">Testimonials & Reviews</h2>
        <p className="text-xs text-stone-400 mt-1">Manage verified diner feedback and ratings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map(t => (
          <div
            key={t.id}
            className={`p-4 rounded-xl border flex flex-col justify-between ${
              t.isActive ? 'bg-stone-900/60 border-stone-800' : 'bg-stone-950 border-stone-800/50 opacity-50'
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-sm font-bold text-white">{t.author}</h4>
                  <p className="text-[10px] text-stone-500">{t.authorSubtitle} · {t.timeAgo}</p>
                </div>
                <div className="text-amber-400 text-xs font-mono">
                  {'★'.repeat(t.rating)}
                </div>
              </div>
              <p className="text-xs text-stone-300 italic leading-relaxed">"{t.comment}"</p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-800 flex justify-between items-center text-xs">
              <button
                onClick={() => handleToggle(t)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  t.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-stone-800 text-stone-500'
                }`}
              >
                {t.isActive ? 'Published' : 'Hidden'}
              </button>
              <button
                onClick={() => setDeleteTarget(t)}
                className="p-1 text-stone-500 hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Review"
        message="Delete this customer review?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

// ----------------- GALLERY PANEL -----------------
export const GalleryPanel: React.FC<{
  gallery: GalleryItem[];
  onRefresh: () => void;
  onShowToast: (msg: string) => void;
}> = ({ gallery, onRefresh, onShowToast }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('food');
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    try {
      await cmsApi.addGalleryItem({
        title: newTitle || 'Tavern Photo',
        description: '',
        imageUrl: newUrl,
        category: newCategory,
        displayOrder: gallery.length + 1,
        isVisible: true
      });
      setNewTitle('');
      setNewUrl('');
      onShowToast('New photo added to gallery.');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await cmsApi.deleteGalleryItem(deleteTarget.id);
      onShowToast('Photo removed.');
      setDeleteTarget(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white font-display">Gallery & Image Library</h2>
        <p className="text-xs text-stone-400 mt-1">Upload and manage atmosphere, pizza, and rec room photos.</p>
      </div>

      <form onSubmit={handleAdd} className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Add Image</h3>
        <ImageUploader
          label="Select or Upload Image"
          value={newUrl}
          onChange={url => setNewUrl(url)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Image Caption / Title"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="px-3 py-1.5 text-xs bg-stone-950 border border-stone-800 rounded-lg text-white"
          />
          <button
            type="submit"
            disabled={!newUrl}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 text-xs font-bold rounded-lg transition"
          >
            Add to Gallery
          </button>
        </div>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {gallery.map(img => (
          <div key={img.id} className="group relative rounded-xl overflow-hidden border border-stone-800 bg-stone-900">
            <img src={img.imageUrl} alt={img.title} className="w-full h-36 object-cover" />
            <div className="p-2.5">
              <p className="text-xs font-bold text-white truncate">{img.title}</p>
            </div>
            <button
              onClick={() => setDeleteTarget(img)}
              className="absolute top-2 right-2 p-1.5 bg-stone-950/80 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Remove Photo"
        message="Remove this image from the gallery?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

// ----------------- GLOBAL SETTINGS & SEO PANEL -----------------
export const GlobalAndSeoPanel: React.FC<{
  globalSettings: GlobalSettings;
  seoSettings: SeoSettings;
  onRefresh: () => void;
  onShowToast: (msg: string) => void;
}> = ({ globalSettings, seoSettings, onRefresh, onShowToast }) => {
  const [globalForm, setGlobalForm] = useState(globalSettings);
  const [seoForm, setSeoForm] = useState(seoSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await cmsApi.updateGlobalSettings(globalForm);
      await cmsApi.updateSeoSettings(seoForm);
      onShowToast('Global & SEO settings saved.');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Global Settings & SEO</h2>
          <p className="text-xs text-stone-400 mt-1">Configure brand names, copyright, and search engine metadata.</p>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl transition"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="p-6 bg-stone-900 border border-stone-800 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Site Brand Identity &amp; Logo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Site Title</label>
            <input
              type="text"
              value={globalForm.siteName}
              onChange={e => setGlobalForm({ ...globalForm, siteName: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Copyright Text</label>
            <input
              type="text"
              value={globalForm.copyrightText}
              onChange={e => setGlobalForm({ ...globalForm, copyrightText: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white"
            />
          </div>
        </div>

        {/* Restaurant Logo Asset */}
        <div className="p-4 bg-stone-950/70 border border-stone-800 rounded-xl flex flex-col sm:flex-row items-center gap-4">
          <img
            src={globalForm.logoUrl || '/logo.png'}
            alt="Restaurant Logo"
            className="w-16 h-16 rounded-full object-cover ring-2 ring-amber-500/50 shadow-md bg-stone-900 shrink-0"
          />
          <div className="flex-1 w-full space-y-2">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Official Restaurant Logo URL
              </label>
              <input
                type="text"
                value={globalForm.logoUrl || '/logo.png'}
                onChange={e => setGlobalForm({ ...globalForm, logoUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-stone-900 border border-stone-800 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Favicon URL (.ico / .png)
              </label>
              <input
                type="text"
                value={seoForm.faviconUrl || '/favicon.png'}
                onChange={e => {
                  setSeoForm({ ...seoForm, faviconUrl: e.target.value });
                  setGlobalForm({ ...globalForm, faviconUrl: e.target.value });
                }}
                className="w-full px-3 py-2 text-xs bg-stone-900 border border-stone-800 rounded-xl text-white font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-stone-900 border border-stone-800 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Search Engine Optimization (SEO)</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Meta Title</label>
            <input
              type="text"
              value={seoForm.title}
              onChange={e => setSeoForm({ ...seoForm, title: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Meta Description</label>
            <textarea
              rows={3}
              value={seoForm.metaDescription}
              onChange={e => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white"
            />
          </div>
        </div>
      </div>
    </form>
  );
};

// ----------------- ORDERS & RESERVATIONS PANEL -----------------
export const OrdersAndReservationsPanel: React.FC<{
  onShowToast: (msg: string) => void;
}> = ({ onShowToast }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [o, r] = await Promise.all([cmsApi.getOrders(), cmsApi.getReservations()]);
      setOrders(o);
      setReservations(r);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await cmsApi.updateOrderStatus(orderId, status);
      onShowToast(`Order updated to "${status}".`);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white font-display">Live Orders & Table Bookings</h2>
        <p className="text-xs text-stone-400 mt-1">Manage kitchen orders and dining room reservations.</p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-amber-500" />
          <span>Customer Orders ({orders.length})</span>
        </h3>

        <div className="space-y-3">
          {orders.map(ord => (
            <div key={ord.id} className="p-4 bg-stone-900 border border-stone-800 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">#{ord.orderNumber}</span>
                  <span className="text-xs text-amber-400 font-mono">${ord.total.toFixed(2)}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-800 text-stone-300 capitalize">
                    {ord.fulfillmentType}
                  </span>
                </div>
                <p className="text-xs text-stone-300 mt-1">
                  Customer: <strong>{ord.customerName}</strong> ({ord.customerPhone})
                </p>
                <div className="text-[11px] text-stone-400 mt-1">
                  {ord.items.map((it: any, i: number) => (
                    <span key={i} className="mr-2">
                      {it.quantity}x {it.name};
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <select
                  value={ord.status}
                  onChange={e => handleUpdateStatus(ord.id, e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-stone-950 border border-stone-700 rounded-lg text-white font-medium"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="prep">Prep</option>
                  <option value="baking">Baking in Oven</option>
                  <option value="ready">Ready for Pickup</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reservations List */}
      <div className="space-y-4 pt-4 border-t border-stone-800">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span>Table & Rec Room Bookings ({reservations.length})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reservations.map(res => (
            <div key={res.id} className="p-4 bg-stone-900 border border-stone-800 rounded-2xl">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-sm font-bold text-white">{res.customerName}</h4>
                  <p className="text-xs text-amber-400 font-mono">{res.confirmationCode}</p>
                </div>
                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                  {res.guests} Guests
                </span>
              </div>
              <p className="text-xs text-stone-300">
                {res.date} at {res.time} · <span className="capitalize">{res.seatingArea.replace(/-/g, ' ')}</span>
              </p>
              {res.specialRequests && (
                <p className="text-[11px] text-stone-400 italic mt-1">"{res.specialRequests}"</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
