import React, { useState } from 'react';
import { Building2, Save, MapPin, Clock, Plus, Trash2 } from 'lucide-react';
import { BusinessInfo, LocationItem, OpeningHour } from '../../../types/cms';
import { cmsApi } from '../../../services/cmsApi';
import { ConfirmationModal } from '../ConfirmationModal';

interface BusinessInfoPanelProps {
  businessInfo: BusinessInfo;
  locations: LocationItem[];
  openingHours: OpeningHour[];
  onRefresh: () => void;
  onShowToast: (msg: string) => void;
}

export const BusinessInfoPanel: React.FC<BusinessInfoPanelProps> = ({
  businessInfo,
  locations,
  openingHours,
  onRefresh,
  onShowToast
}) => {
  const [infoForm, setInfoForm] = useState<BusinessInfo>(businessInfo);
  const [localHours, setLocalHours] = useState<OpeningHour[]>(openingHours);
  const [localLocations, setLocalLocations] = useState<LocationItem[]>(locations);
  const [isSaving, setIsSaving] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<LocationItem | null>(null);

  const handleInfoChange = (field: keyof BusinessInfo, val: any) => {
    setInfoForm(prev => ({ ...prev, [field]: val }));
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await cmsApi.updateBusinessInfo(infoForm);
      onShowToast('Business information updated.');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleHourChange = async (hour: OpeningHour, updates: Partial<OpeningHour>) => {
    const updated = { ...hour, ...updates };
    setLocalHours(prev => prev.map(h => (h.id === hour.id ? updated : h)));
    try {
      await cmsApi.updateOpeningHour(hour.id, updates);
      onShowToast(`Updated schedule for ${hour.dayOfWeek}.`);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLocationDelete = async () => {
    if (!locationToDelete) return;
    try {
      await cmsApi.deleteLocation(locationToDelete.id);
      setLocalLocations(prev => prev.filter(l => l.id !== locationToDelete.id));
      onShowToast(`Location "${locationToDelete.name}" deleted.`);
      setLocationToDelete(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Main Business Profile */}
      <form onSubmit={handleSaveInfo} className="p-6 bg-stone-900 border border-stone-800 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              <span>Business Profile & Contact</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Primary business name, address, contact numbers, and Google Maps location.
            </p>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl transition cursor-pointer self-start sm:self-auto"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Business Name</label>
            <input
              type="text"
              required
              value={infoForm.name}
              onChange={e => handleInfoChange('name', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Tagline</label>
            <input
              type="text"
              value={infoForm.tagline}
              onChange={e => handleInfoChange('tagline', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white"
            />
          </div>

          <div className="sm:col-span-2 p-3.5 bg-stone-950/70 border border-stone-800 rounded-xl flex flex-col sm:flex-row items-center gap-4">
            <img
              src={infoForm.logoUrl || '/logo.png'}
              alt="Restaurant Logo Preview"
              className="w-14 h-14 rounded-full object-cover ring-2 ring-amber-500/50 shadow-md bg-stone-900 shrink-0"
            />
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Official Restaurant Logo &amp; Favicon Asset
              </label>
              <input
                type="text"
                value={infoForm.logoUrl || '/logo.png'}
                onChange={e => handleInfoChange('logoUrl', e.target.value)}
                placeholder="/logo.png"
                className="w-full px-3 py-2 text-xs bg-stone-900 border border-stone-800 rounded-xl text-white font-mono"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Active restaurant logo used for website favicon, header navbar emblem, hero crest badge, footer brand card, and receipts.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Primary Phone</label>
            <input
              type="text"
              required
              value={infoForm.phone}
              onChange={e => handleInfoChange('phone', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Email</label>
            <input
              type="email"
              value={infoForm.email}
              onChange={e => handleInfoChange('email', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Street Address</label>
            <input
              type="text"
              required
              value={infoForm.address}
              onChange={e => handleInfoChange('address', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">City & Postal Code</label>
            <input
              type="text"
              required
              value={infoForm.city}
              onChange={e => handleInfoChange('city', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Plus Code</label>
            <input
              type="text"
              value={infoForm.plusCode}
              onChange={e => handleInfoChange('plusCode', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Google Maps Direct URL</label>
            <input
              type="text"
              value={infoForm.mapsUrl}
              onChange={e => handleInfoChange('mapsUrl', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-amber-400 font-mono text-[11px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1">About / Business Description</label>
          <textarea
            rows={3}
            value={infoForm.description}
            onChange={e => handleInfoChange('description', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white leading-relaxed"
          />
        </div>
      </form>

      {/* 2. Opening Hours Management */}
      <div className="p-6 bg-stone-900 border border-stone-800 rounded-2xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Weekly Operating Hours Schedule</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Configure opening times, closing times, and open/closed toggles for each day of the week.
          </p>
        </div>

        <div className="space-y-2">
          {localHours.map(hour => (
            <div
              key={hour.id}
              className="p-3 bg-stone-950 border border-stone-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="w-32">
                <span className="text-xs font-bold text-white">{hour.dayOfWeek}</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hour.isOpen}
                    onChange={e => handleHourChange(hour, { isOpen: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span className={`text-xs font-semibold ${hour.isOpen ? 'text-emerald-400' : 'text-stone-500'}`}>
                    {hour.isOpen ? 'Open' : 'Closed'}
                  </span>
                </label>

                {hour.isOpen && (
                  <div className="flex items-center gap-2 text-xs">
                    <input
                      type="text"
                      value={hour.openTime}
                      onChange={e =>
                        setLocalHours(prev =>
                          prev.map(h => (h.id === hour.id ? { ...h, openTime: e.target.value } : h))
                        )
                      }
                      onBlur={e => handleHourChange(hour, { openTime: e.target.value })}
                      placeholder="11:00 AM"
                      className="w-24 px-2 py-1 bg-stone-900 border border-stone-800 rounded text-center text-white font-mono"
                    />
                    <span className="text-stone-500">to</span>
                    <input
                      type="text"
                      value={hour.closeTime}
                      onChange={e =>
                        setLocalHours(prev =>
                          prev.map(h => (h.id === hour.id ? { ...h, closeTime: e.target.value } : h))
                        )
                      }
                      onBlur={e => handleHourChange(hour, { closeTime: e.target.value })}
                      placeholder="10:00 PM"
                      className="w-24 px-2 py-1 bg-stone-900 border border-stone-800 rounded text-center text-white font-mono"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Locations List */}
      <div className="p-6 bg-stone-900 border border-stone-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>Multi-Location Management</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Manage all company branches and taverns from this single dashboard.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {localLocations.map(loc => (
            <div
              key={loc.id}
              className="p-4 bg-stone-950 border border-stone-800 rounded-xl flex items-start justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{loc.name}</h4>
                  {loc.isPrimary && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-300 mt-1">{loc.address}, {loc.city}</p>
                <p className="text-[11px] text-stone-500 mt-0.5 font-mono">
                  {loc.phone} · {loc.openingHoursSummary}
                </p>
              </div>

              {!loc.isPrimary && (
                <button
                  onClick={() => setLocationToDelete(loc)}
                  className="p-1.5 text-stone-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <ConfirmationModal
        isOpen={Boolean(locationToDelete)}
        title="Delete Location"
        message={`Are you sure you want to delete "${locationToDelete?.name}"?`}
        onConfirm={handleLocationDelete}
        onCancel={() => setLocationToDelete(null)}
      />
    </div>
  );
};
