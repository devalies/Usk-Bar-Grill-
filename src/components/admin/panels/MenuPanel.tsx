import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Flame,
  Star,
  Eye,
  EyeOff,
  FolderTree
} from 'lucide-react';
import { CmsMenuItem, MenuCategory } from '../../../types/cms';
import { cmsApi } from '../../../services/cmsApi';
import { ImageUploader } from '../ImageUploader';
import { ConfirmationModal } from '../ConfirmationModal';

interface MenuPanelProps {
  items: CmsMenuItem[];
  categories: MenuCategory[];
  onRefresh: () => void;
  onShowToast: (msg: string) => void;
}

export const MenuPanel: React.FC<MenuPanelProps> = ({
  items,
  categories,
  onRefresh,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Edit / Add Item state
  const [editingItem, setEditingItem] = useState<Partial<CmsMenuItem> | null>(null);
  const [isEditingItemModalOpen, setIsEditingItemModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CmsMenuItem | null>(null);

  // Category Edit / Add state
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [editingCat, setEditingCat] = useState<Partial<MenuCategory> | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<MenuCategory | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const filteredItems = items.filter(it => {
    const matchCat =
      selectedCategory === 'all' ||
      it.categoryId === selectedCategory ||
      it.categoryId === categories.find(c => c.id === selectedCategory)?.slug;
    const matchQ =
      !searchQuery ||
      it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQ;
  });

  const handleToggleItemActive = async (item: CmsMenuItem) => {
    try {
      await cmsApi.updateMenuItem(item.id, { isActive: !item.isActive });
      onShowToast(`"${item.name}" is now ${!item.isActive ? 'available' : 'hidden'}.`);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleItemPopular = async (item: CmsMenuItem) => {
    try {
      await cmsApi.updateMenuItem(item.id, { popular: !item.popular, isFeatured: !item.popular });
      onShowToast(`Updated featured status for "${item.name}".`);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name || !editingItem.categoryId) {
      alert('Item name and category are required.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem.id) {
        await cmsApi.updateMenuItem(editingItem.id, editingItem);
        onShowToast(`Updated "${editingItem.name}".`);
      } else {
        await cmsApi.addMenuItem({
          name: editingItem.name,
          categoryId: editingItem.categoryId,
          description: editingItem.description || '',
          price: Number(editingItem.price) || 0,
          image: editingItem.image || '',
          popular: Boolean(editingItem.popular),
          isFeatured: Boolean(editingItem.isFeatured),
          isActive: editingItem.isActive !== undefined ? editingItem.isActive : true,
          displayOrder: items.length + 1,
          tags: editingItem.tags || [],
          options: editingItem.options || []
        });
        onShowToast(`Created new menu item "${editingItem.name}".`);
      }
      setIsEditingItemModalOpen(false);
      setEditingItem(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      await cmsApi.deleteMenuItem(itemToDelete.id);
      onShowToast(`Deleted "${itemToDelete.name}".`);
      setItemToDelete(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !editingCat.name) return;

    setIsSaving(true);
    try {
      if (editingCat.id) {
        await cmsApi.updateCategory(editingCat.id, editingCat);
        onShowToast(`Updated category "${editingCat.name}".`);
      } else {
        await cmsApi.addCategory({
          name: editingCat.name,
          slug: editingCat.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          description: editingCat.description || '',
          displayOrder: categories.length + 1,
          isActive: true
        });
        onShowToast(`Created category "${editingCat.name}".`);
      }
      setEditingCat(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await cmsApi.deleteCategory(categoryToDelete.id);
      onShowToast(`Deleted category "${categoryToDelete.name}".`);
      setCategoryToDelete(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Menu & Food Management</h2>
          <p className="text-xs text-stone-400 mt-1">
            Create, edit, price, and categorize your brick oven pizzas, appetizers, wings, and drinks.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsManagingCategories(!isManagingCategories)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition ${
              isManagingCategories
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-stone-900 text-stone-300 border-stone-800 hover:text-white'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => {
              setEditingItem({
                name: '',
                categoryId: categories[0]?.slug || 'red-base-pizza',
                description: '',
                price: 15.0,
                popular: false,
                isActive: true
              });
              setIsEditingItemModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black rounded-xl transition shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Category Manager Drawer / Box */}
      {isManagingCategories && (
        <div className="p-5 bg-stone-900/90 border border-amber-500/30 rounded-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-amber-400" />
              <span>Manage Menu Categories</span>
            </h3>
            <button
              onClick={() => setEditingCat({ name: '', description: '', isActive: true })}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New Category
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map(cat => {
              const count = items.filter(
                i => i.categoryId === cat.id || i.categoryId === cat.slug
              ).length;
              return (
                <div
                  key={cat.id}
                  className="p-3 bg-stone-950 border border-stone-800 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-white">{cat.name}</p>
                    <p className="text-[10px] text-stone-500 font-mono">
                      slug: {cat.slug} · {count} items
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingCat(cat)}
                      className="p-1 text-stone-400 hover:text-white"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setCategoryToDelete(cat)}
                      className="p-1 text-stone-400 hover:text-red-400"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {editingCat && (
            <form
              onSubmit={handleSaveCategory}
              className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-3"
            >
              <h4 className="text-xs font-bold text-amber-400">
                {editingCat.id ? 'Edit Category' : 'Add New Category'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Category Name (e.g. Desserts)"
                  value={editingCat.name || ''}
                  onChange={e => setEditingCat({ ...editingCat, name: e.target.value })}
                  className="px-3 py-1.5 text-xs bg-stone-900 border border-stone-800 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Category Description"
                  value={editingCat.description || ''}
                  onChange={e => setEditingCat({ ...editingCat, description: e.target.value })}
                  className="px-3 py-1.5 text-xs bg-stone-900 border border-stone-800 rounded-lg text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="px-3 py-1 text-xs text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1 text-xs font-bold bg-amber-500 text-stone-950 rounded-lg"
                >
                  Save Category
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-stone-900 border border-stone-800 rounded-xl overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-stone-950'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            All Items ({items.length})
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.slug)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                selectedCategory === c.slug
                  ? 'bg-amber-500 text-stone-950'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-900 border border-stone-800 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Items List Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              item.isActive
                ? 'bg-stone-900/60 border-stone-800 hover:border-stone-700'
                : 'bg-stone-950/80 border-stone-800/40 opacity-50'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400 capitalize">
                    <span>{item.categoryId.replace(/-/g, ' ')}</span>
                    {item.popular && (
                      <span className="text-amber-400 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400" /> Featured
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5 font-display">{item.name}</h4>
                </div>
                <span className="font-mono text-base font-black text-amber-400">
                  ${item.price.toFixed(2)}
                </span>
              </div>

              <p className="text-xs text-stone-400 leading-relaxed line-clamp-2">
                {item.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleItemActive(item)}
                  className={`p-1.5 rounded-lg border text-xs transition ${
                    item.isActive
                      ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                      : 'border-stone-800 text-stone-500'
                  }`}
                  title={item.isActive ? 'Active on menu' : 'Hidden from menu'}
                >
                  {item.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => handleToggleItemPopular(item)}
                  className={`p-1.5 rounded-lg border text-xs transition ${
                    item.popular
                      ? 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                      : 'border-stone-800 text-stone-500'
                  }`}
                  title="Toggle Popular/Featured Badge"
                >
                  <Star className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setEditingItem(item);
                    setIsEditingItemModalOpen(true);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg transition"
                >
                  Edit
                </button>

                <button
                  onClick={() => setItemToDelete(item)}
                  className="p-1 text-stone-500 hover:text-red-400 transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Item Edit/Create Modal */}
      {isEditingItemModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-8 p-6">
            <div className="flex items-start justify-between pb-4 border-b border-stone-800 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-display">
                  {editingItem.id ? 'Edit Menu Item' : 'New Menu Item'}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Update item details, pricing, photos, and options.
                </p>
              </div>
              <button
                onClick={() => setIsEditingItemModalOpen(false)}
                className="p-1 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Blue Moose Pizza"
                  value={editingItem.name || ''}
                  onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Category</label>
                  <select
                    value={editingItem.categoryId || ''}
                    onChange={e => setEditingItem({ ...editingItem, categoryId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    required
                    value={editingItem.price !== undefined ? editingItem.price : ''}
                    onChange={e =>
                      setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-amber-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Ingredients, toppings, crust details..."
                  value={editingItem.description || ''}
                  onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white"
                />
              </div>

              <ImageUploader
                label="Food Photography"
                value={editingItem.image || ''}
                onChange={url => setEditingItem({ ...editingItem, image: url })}
                helperText="Upload or provide image URL"
              />

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem.popular)}
                    onChange={e =>
                      setEditingItem({
                        ...editingItem,
                        popular: e.target.checked,
                        isFeatured: e.target.checked
                      })
                    }
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-xs text-stone-300 font-medium">Customer Favorite Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isActive !== false}
                    onChange={e => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-xs text-stone-300 font-medium">Active (Visible on Menu)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsEditingItemModalOpen(false)}
                  className="px-4 py-2 text-xs text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl transition cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Menu Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(itemToDelete)}
        title="Delete Menu Item"
        message={`Are you sure you want to permanently remove "${itemToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteItem}
        onCancel={() => setItemToDelete(null)}
      />

      {/* Delete Category Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(categoryToDelete)}
        title="Delete Category"
        message={`Are you sure you want to delete category "${categoryToDelete?.name}"?`}
        onConfirm={handleDeleteCategory}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
};
