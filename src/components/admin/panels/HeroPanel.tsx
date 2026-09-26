import React, { useState } from 'react';
import { Save, Check, RefreshCw, Link2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { HeroSettings, LandingSection, ButtonTargetType, HeroButtonConfig } from '../../../types/cms';
import { cmsApi } from '../../../services/cmsApi';
import { ImageUploader } from '../ImageUploader';
import { isSectionEnabled, normalizeSectionKey, CANONICAL_SECTIONS } from '../../../utils/sectionDependency';

interface HeroPanelProps {
  initialSettings: HeroSettings;
  sections?: LandingSection[];
  onRefresh: () => void;
  onShowToast: (msg: string) => void;
}

export const HeroPanel: React.FC<HeroPanelProps> = ({
  initialSettings,
  sections,
  onRefresh,
  onShowToast
}) => {
  const [form, setForm] = useState<HeroSettings>(() => ({
    ...initialSettings,
    primaryButtonConfig: initialSettings.primaryButtonConfig || {
      label: initialSettings.primaryButtonText || 'Order Online Now',
      type: 'section',
      targetSection: normalizeSectionKey(initialSettings.primaryButtonUrl) || 'menu',
      targetUrl: initialSettings.primaryButtonUrl || '#menu',
      isEnabled: true
    },
    secondaryButtonConfig: initialSettings.secondaryButtonConfig || {
      label: initialSettings.secondaryButtonText || 'Reserve a Table',
      type: 'section',
      targetSection: normalizeSectionKey(initialSettings.secondaryButtonUrl) || 'reservations',
      targetUrl: initialSettings.secondaryButtonUrl || '#reservations',
      isEnabled: true
    },
    thirdButtonConfig: initialSettings.thirdButtonConfig || {
      label: initialSettings.thirdButtonText || 'View Full Menu',
      type: 'section',
      targetSection: normalizeSectionKey(initialSettings.thirdButtonUrl) || 'menu',
      targetUrl: initialSettings.thirdButtonUrl || '#menu',
      isEnabled: true
    }
  }));

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof HeroSettings, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleButtonConfigChange = (
    btnKey: 'primaryButtonConfig' | 'secondaryButtonConfig' | 'thirdButtonConfig',
    updates: Partial<HeroButtonConfig>
  ) => {
    setForm(prev => {
      const current = prev[btnKey] || {
        label: '',
        type: 'section' as ButtonTargetType,
        targetSection: 'menu',
        targetUrl: '#menu',
        isEnabled: true
      };
      return {
        ...prev,
        [btnKey]: { ...current, ...updates }
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Sync legacy text and URLs with button configs
      const payloadToSave: HeroSettings = {
        ...form,
        primaryButtonText: form.primaryButtonConfig?.label || form.primaryButtonText,
        primaryButtonUrl:
          form.primaryButtonConfig?.type === 'section'
            ? `#${form.primaryButtonConfig.targetSection}`
            : form.primaryButtonConfig?.targetUrl || form.primaryButtonUrl,
        secondaryButtonText: form.secondaryButtonConfig?.label || form.secondaryButtonText,
        secondaryButtonUrl:
          form.secondaryButtonConfig?.type === 'section'
            ? `#${form.secondaryButtonConfig.targetSection}`
            : form.secondaryButtonConfig?.targetUrl || form.secondaryButtonUrl,
        thirdButtonText: form.thirdButtonConfig?.label || form.thirdButtonText,
        thirdButtonUrl:
          form.thirdButtonConfig?.type === 'section'
            ? `#${form.thirdButtonConfig.targetSection}`
            : form.thirdButtonConfig?.targetUrl || form.thirdButtonUrl
      };

      await cmsApi.updateHeroSettings(payloadToSave);
      onShowToast('Hero section & button dependencies saved.');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save hero settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper renderer for each button configuration card
  const renderButtonEditor = (
    btnKey: 'primaryButtonConfig' | 'secondaryButtonConfig' | 'thirdButtonConfig',
    title: string,
    defaultLabel: string
  ) => {
    const config = form[btnKey] || {
      label: defaultLabel,
      type: 'section' as ButtonTargetType,
      targetSection: 'menu',
      targetUrl: '#menu',
      isEnabled: true
    };

    const targetSec = config.targetSection || 'menu';
    const isTargetEnabled = isSectionEnabled(targetSec, sections);

    return (
      <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-amber-500" />
            <span>{title}</span>
          </span>

          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={config.isEnabled}
              onChange={e => handleButtonConfigChange(btnKey, { isEnabled: e.target.checked })}
              className="rounded bg-stone-900 border-stone-700 text-amber-500 focus:ring-0"
            />
            <span className={config.isEnabled ? 'text-stone-300 font-semibold' : 'text-stone-500 line-through'}>
              {config.isEnabled ? 'Button Active' : 'Button Disabled'}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-stone-400 mb-1">Button Text / Label</label>
            <input
              type="text"
              required
              value={config.label}
              onChange={e => handleButtonConfigChange(btnKey, { label: e.target.value })}
              className="w-full px-3 py-1.5 text-xs bg-stone-900 border border-stone-800 rounded-lg text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] text-stone-400 mb-1">Button Target Type</label>
            <select
              value={config.type}
              onChange={e => handleButtonConfigChange(btnKey, { type: e.target.value as ButtonTargetType })}
              className="w-full px-3 py-1.5 text-xs bg-stone-900 border border-stone-800 rounded-lg text-amber-400 font-medium"
            >
              <option value="section">Internal Section (Auto-Dependency)</option>
              <option value="external">External Website URL</option>
              <option value="page">Internal Page</option>
              <option value="phone">Direct Phone Call (tel:)</option>
              <option value="email">Email Link (mailto:)</option>
              <option value="whatsapp">WhatsApp Direct Chat</option>
            </select>
          </div>
        </div>

        {/* Dynamic target input based on button type */}
        {config.type === 'section' ? (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] text-stone-400">Target Section</label>
              {isTargetEnabled ? (
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Section is live (Button will render)
                </span>
              ) : (
                <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Section is hidden (Button automatically hidden)
                </span>
              )}
            </div>
            <select
              value={config.targetSection || 'menu'}
              onChange={e =>
                handleButtonConfigChange(btnKey, {
                  targetSection: e.target.value,
                  targetUrl: `#${e.target.value}`
                })
              }
              className="w-full px-3 py-1.5 text-xs bg-stone-900 border border-stone-800 rounded-lg text-white font-mono"
            >
              <option value="menu">Menu & Pizza Builder (#menu)</option>
              <option value="reservations">Table & Rec Room Reservations (#reservations)</option>
              <option value="rec-room">Rec Room & Atmosphere Gallery (#rec-room)</option>
              <option value="reviews">Google Reviews & Ratings (#reviews)</option>
              <option value="location">Location, Hours & Drive-Through (#location)</option>
              <option value="hero">Hero Banner Top (#hero)</option>
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-[11px] text-stone-400 mb-1">
              {config.type === 'phone'
                ? 'Phone Number (e.g. tel:+15094451262)'
                : config.type === 'email'
                ? 'Email Address (e.g. mailto:info@uskbarandgrill.com)'
                : config.type === 'whatsapp'
                ? 'WhatsApp Number (e.g. https://wa.me/15094451262)'
                : 'Target URL / Link'}
            </label>
            <input
              type="text"
              value={config.targetUrl || ''}
              onChange={e => handleButtonConfigChange(btnKey, { targetUrl: e.target.value })}
              placeholder={
                config.type === 'phone'
                  ? 'tel:+15094451262'
                  : config.type === 'email'
                  ? 'mailto:info@uskbarandgrill.com'
                  : 'https://...'
              }
              className="w-full px-3 py-1.5 text-xs bg-stone-900 border border-stone-800 rounded-lg text-amber-400 font-mono"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Hero / "Here" Section Editor</h2>
          <p className="text-xs text-stone-400 mt-1">
            Manage headlines, badges, background hero photography, and call-to-action button dependencies.
          </p>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black rounded-xl transition shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Changes...' : 'Save Hero Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Headlines & Copy */}
        <div className="p-6 bg-stone-900 border border-stone-800 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
            Headlines & Description
          </h3>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Main Headline (Focal Text)
            </label>
            <textarea
              rows={3}
              required
              value={form.heading}
              onChange={e => handleChange('heading', e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-950 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Subheading / Tagline
            </label>
            <input
              type="text"
              value={form.subheading}
              onChange={e => handleChange('subheading', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Paragraph Description
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-stone-200 focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>

          {/* Badges and metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1">Badge Text</label>
              <input
                type="text"
                value={form.badgeText}
                onChange={e => handleChange('badgeText', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-stone-950 border border-stone-800 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1">Rating Value</label>
              <input
                type="text"
                value={form.ratingText}
                onChange={e => handleChange('ratingText', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-stone-950 border border-stone-800 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1">Review Count Text</label>
              <input
                type="text"
                value={form.reviewsCountText}
                onChange={e => handleChange('reviewsCountText', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-stone-950 border border-stone-800 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1">Hours Status</label>
              <input
                type="text"
                value={form.hoursStatusText}
                onChange={e => handleChange('hoursStatusText', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-stone-950 border border-stone-800 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1">Location Pill</label>
              <input
                type="text"
                value={form.locationBadgeText}
                onChange={e => handleChange('locationBadgeText', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-stone-950 border border-stone-800 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1">Price Range</label>
              <input
                type="text"
                value={form.priceRangeText}
                onChange={e => handleChange('priceRangeText', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-stone-950 border border-stone-800 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Right Column: CTA Buttons & Background */}
        <div className="space-y-6">
          <div className="p-6 bg-stone-900 border border-stone-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
              Background Photography
            </h3>
            <ImageUploader
              label="Hero Background Image"
              value={form.backgroundImage}
              onChange={url => handleChange('backgroundImage', url)}
              helperText="High-resolution exterior or restaurant atmosphere photo"
            />
          </div>

          <div className="p-6 bg-stone-900 border border-stone-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                Call-To-Action Buttons & Section Dependency
              </h3>
              <span className="text-[10px] text-stone-400">
                Auto-connects to section state
              </span>
            </div>

            <div className="space-y-3">
              {renderButtonEditor('primaryButtonConfig', 'Primary Button (e.g. Order Online)', 'Order Online Now')}
              {renderButtonEditor('secondaryButtonConfig', 'Secondary Button (e.g. Reservations)', 'Reserve a Table')}
              {renderButtonEditor('thirdButtonConfig', 'Third Button (e.g. View Menu)', 'View Full Menu')}
            </div>
          </div>

          <div className="p-6 bg-stone-900 border border-stone-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
              Bottom Proof Strip Items
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Item 1 Title"
                  value={form.stripItem1Title}
                  onChange={e => handleChange('stripItem1Title', e.target.value)}
                  className="px-3 py-1.5 text-xs bg-stone-950 border border-stone-800 rounded-lg text-white font-medium"
                />
                <input
                  type="text"
                  placeholder="Item 1 Description"
                  value={form.stripItem1Desc}
                  onChange={e => handleChange('stripItem1Desc', e.target.value)}
                  className="px-3 py-1.5 text-xs bg-stone-950 border border-stone-800 rounded-lg text-stone-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Item 2 Title"
                  value={form.stripItem2Title}
                  onChange={e => handleChange('stripItem2Title', e.target.value)}
                  className="px-3 py-1.5 text-xs bg-stone-950 border border-stone-800 rounded-lg text-white font-medium"
                />
                <input
                  type="text"
                  placeholder="Item 2 Description"
                  value={form.stripItem2Desc}
                  onChange={e => handleChange('stripItem2Desc', e.target.value)}
                  className="px-3 py-1.5 text-xs bg-stone-950 border border-stone-800 rounded-lg text-stone-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Item 3 Title"
                  value={form.stripItem3Title}
                  onChange={e => handleChange('stripItem3Title', e.target.value)}
                  className="px-3 py-1.5 text-xs bg-stone-950 border border-stone-800 rounded-lg text-white font-medium"
                />
                <input
                  type="text"
                  placeholder="Item 3 Description"
                  value={form.stripItem3Desc}
                  onChange={e => handleChange('stripItem3Desc', e.target.value)}
                  className="px-3 py-1.5 text-xs bg-stone-950 border border-stone-800 rounded-lg text-stone-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
