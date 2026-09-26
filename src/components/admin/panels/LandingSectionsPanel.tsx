import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Check,
  Layers,
  AlertTriangle,
  X,
  Link2,
  ChevronDown,
  ChevronUp,
  ShieldAlert
} from 'lucide-react';
import { LandingSection, FullCmsPayload } from '../../../types/cms';
import { cmsApi } from '../../../services/cmsApi';
import { getConnectedElementsForSection, ConnectedElement } from '../../../utils/sectionDependency';

interface LandingSectionsPanelProps {
  sections: LandingSection[];
  cmsPayload?: Partial<FullCmsPayload> | null;
  onRefresh: () => void;
  onShowToast: (msg: string) => void;
}

export const LandingSectionsPanel: React.FC<LandingSectionsPanelProps> = ({
  sections,
  cmsPayload,
  onRefresh,
  onShowToast
}) => {
  const [localSections, setLocalSections] = useState<LandingSection[]>(sections);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Expanded dependencies view map
  const [expandedDeps, setExpandedDeps] = useState<Record<string, boolean>>({
    'sec-menu': true,
    'sec-reservations': true
  });

  // Modal state for confirmation before disabling a section
  const [sectionToDisable, setSectionToDisable] = useState<{
    section: LandingSection;
    connected: ConnectedElement[];
  } | null>(null);

  // Sync with prop updates
  React.useEffect(() => {
    setLocalSections(sections);
  }, [sections]);

  const toggleExpandDeps = (secId: string) => {
    setExpandedDeps(prev => ({ ...prev, [secId]: !prev[secId] }));
  };

  /**
   * Handle section enable/disable button click.
   * If disabling and section is currently enabled, open confirmation warning modal.
   * If enabling, proceed immediately and restore all dependent elements.
   */
  const handleToggleClick = (section: LandingSection) => {
    const connected = getConnectedElementsForSection(section.sectionKey, cmsPayload);

    if (section.isEnabled) {
      // Prompt warning dialog before disabling
      setSectionToDisable({ section, connected });
    } else {
      // Re-enable immediately
      executeToggle(section, true);
    }
  };

  const executeToggle = async (section: LandingSection, enable: boolean) => {
    try {
      const updated = await cmsApi.updateLandingSection(section.id, {
        isEnabled: enable
      });
      setLocalSections(prev =>
        prev.map(s => (s.id === section.id ? updated : s))
      );
      const connectedCount = getConnectedElementsForSection(section.sectionKey, cmsPayload).length;
      if (enable) {
        onShowToast(
          `Section "${section.title}" is now LIVE. ${connectedCount} connected frontend elements restored.`
        );
      } else {
        onShowToast(
          `Section "${section.title}" is now HIDDEN. ${connectedCount} connected elements were automatically hidden.`
        );
      }
      setSectionToDisable(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update section visibility.');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localSections.length) return;

    const list = [...localSections];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setLocalSections(list);
    try {
      await cmsApi.reorderLandingSections(list.map(s => s.id));
      onShowToast('Landing sections reordered.');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const startEdit = (s: LandingSection) => {
    setEditingId(s.id);
    setEditTitle(s.title);
    setEditSubtitle(s.subtitle);
  };

  const saveEdit = async (id: string) => {
    setIsSaving(true);
    try {
      const updated = await cmsApi.updateLandingSection(id, {
        title: editTitle.trim(),
        subtitle: editSubtitle.trim()
      });
      setLocalSections(prev => prev.map(s => (s.id === id ? updated : s)));
      setEditingId(null);
      onShowToast('Section metadata saved.');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white font-display">Landing Page Sections & Automatic Visibility</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Dependency System Active
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1 max-w-3xl">
            Section visibility is the single source of truth. When a section is disabled, all connected navigation items,
            buttons, CTAs, and footer links automatically hide. Re-enabling the section restores them instantly.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {localSections.map((sec, index) => {
          const isEditing = editingId === sec.id;
          const connectedElements = getConnectedElementsForSection(sec.sectionKey, cmsPayload);
          const isExpanded = expandedDeps[sec.id] ?? false;

          return (
            <div
              key={sec.id}
              className={`p-5 rounded-2xl border transition-all ${
                sec.isEnabled
                  ? 'bg-stone-900/90 border-stone-800 shadow-sm'
                  : 'bg-stone-950 border-stone-800/60 opacity-80'
              }`}
            >
              {/* Header Row: Controls, Title, Status & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  {/* Reorder Arrows */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      className="p-1 text-stone-400 hover:text-white disabled:opacity-20 rounded"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === localSections.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className="p-1 text-stone-400 hover:text-white disabled:opacity-20 rounded"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Section Title & Subtitle */}
                  <div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          className="px-2 py-1 text-xs bg-stone-950 border border-stone-700 rounded text-white font-bold w-64"
                        />
                        <input
                          type="text"
                          value={editSubtitle}
                          onChange={e => setEditSubtitle(e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-stone-950 border border-stone-700 rounded text-stone-300"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-white uppercase tracking-wide">
                            {sec.title}
                          </span>
                          <span className="text-[10px] font-mono text-stone-400 px-1.5 py-0.5 rounded bg-stone-950 border border-stone-800">
                            #{sec.sectionKey}
                          </span>

                          {/* Status Pill */}
                          {sec.isEnabled ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Enabled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-800 text-stone-400 border border-stone-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                              Disabled
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5">{sec.subtitle}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Actions: Edit, Enable / Disable */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {isEditing ? (
                    <button
                      onClick={() => saveEdit(sec.id)}
                      disabled={isSaving}
                      className="px-3 py-1.5 bg-amber-500 text-stone-950 text-xs font-bold rounded-lg transition"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(sec)}
                      className="px-3 py-1 text-xs text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg transition"
                    >
                      Edit
                    </button>
                  )}

                  {/* Primary Section Visibility Switch */}
                  <button
                    onClick={() => handleToggleClick(sec)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                      sec.isEnabled
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-red-500/15 hover:text-red-300 hover:border-red-500/30'
                        : 'bg-amber-500 text-stone-950 hover:bg-amber-400 font-black shadow-sm'
                    }`}
                  >
                    {sec.isEnabled ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Enabled (Click to Hide)</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Enable Section</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Connected Frontend Elements Dependency Display (Requirements 7 & 12) */}
              <div className="mt-4 pt-3 border-t border-stone-800/80">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleExpandDeps(sec.id)}
                    className="flex items-center gap-2 text-xs font-semibold text-stone-300 hover:text-white cursor-pointer"
                  >
                    <Link2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Connected Elements ({connectedElements.length})</span>
                    {sec.isEnabled ? (
                      <span className="text-[10px] text-emerald-400 font-normal">
                        · All {connectedElements.length} currently active on website
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-normal">
                        · {connectedElements.length} automatically hidden
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-stone-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                    )}
                  </button>

                  <span className="text-[11px] text-stone-500">
                    Target slug: <code className="text-amber-400 font-mono">#{sec.sectionKey}</code>
                  </span>
                </div>

                {/* Expanded dependency element details */}
                {isExpanded && (
                  <div className="mt-3 space-y-2">
                    {connectedElements.length === 0 ? (
                      <p className="text-xs text-stone-500 italic py-1">
                        No external frontend buttons or links are currently tied to this section.
                      </p>
                    ) : sec.isEnabled ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {connectedElements.map(el => (
                          <div
                            key={el.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-950/70 border border-stone-800/90 text-xs"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-stone-200 truncate">{el.label}</p>
                              <p className="text-[10px] text-stone-500 truncate">{el.location}</p>
                            </div>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Active
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* When disabled: clearly warn which elements are hidden */
                      <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>
                            {connectedElements.length} frontend elements are automatically hidden because #{sec.sectionKey} is disabled:
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {connectedElements.map(el => (
                            <div
                              key={el.id}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-stone-950/60 border border-stone-800/80 text-xs text-stone-400"
                            >
                              <span className="text-amber-500/70 text-xs">○</span>
                              <div className="min-w-0 flex-1 line-through">
                                <span className="font-medium text-stone-400 truncate block">{el.label}</span>
                                <span className="text-[10px] text-stone-600 block truncate">{el.location}</span>
                              </div>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-900 text-stone-500 border border-stone-800">
                                Hidden
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Warning Confirmation Modal Before Disabling (Requirement 15) */}
      {sectionToDisable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-stone-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Hide {sectionToDisable.section.title}?
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    This section currently has{' '}
                    <strong className="text-amber-400">{sectionToDisable.connected.length}</strong> connected frontend elements.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSectionToDisable(null)}
                className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning Message & Affected Elements List */}
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 space-y-3">
              <p className="text-xs text-stone-300 font-semibold">
                The following elements will automatically be hidden to prevent broken links:
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {sectionToDisable.connected.map(el => (
                  <div
                    key={el.id}
                    className="flex items-center gap-2 text-xs text-stone-300 py-1 px-2 rounded bg-stone-900/60"
                  >
                    <span className="text-amber-500 font-bold">•</span>
                    <span className="font-semibold text-white">{el.label}</span>
                    <span className="text-stone-500 text-[11px] ml-auto">({el.location})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Non-destructive guarantee notice (Requirement 16) */}
            <div className="p-3 bg-stone-950 border border-stone-800/80 rounded-xl text-xs text-stone-400 flex items-start gap-2">
              <span className="text-emerald-400 font-bold">ℹ</span>
              <p>
                <strong>No content will be deleted.</strong> All menu items, descriptions, and settings will remain safe in the database.
                Re-enabling this section will restore all connected buttons and links automatically.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSectionToDisable(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeToggle(sectionToDisable.section, false)}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition shadow-md shadow-red-950 cursor-pointer"
              >
                Hide Section & Connected Elements
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
