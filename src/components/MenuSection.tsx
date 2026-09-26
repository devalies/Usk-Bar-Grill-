import React, { useState, useMemo } from 'react';
import { Search, Plus, Sparkles, Flame, Check } from 'lucide-react';
import { MENU_ITEMS } from '../data/restaurantData';
import { MenuItem } from '../types/restaurant';
import { CmsMenuItem, MenuCategory } from '../types/cms';

interface MenuSectionProps {
  cmsItems?: CmsMenuItem[];
  cmsCategories?: MenuCategory[];
  onSelectItem: (item: MenuItem) => void;
  onOpenPizzaBuilder: () => void;
  onDirectAdd: (item: MenuItem) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  cmsItems,
  cmsCategories,
  onSelectItem,
  onOpenPizzaBuilder,
  onDirectAdd
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // Normalize CMS items into MenuItem shape
  const sourceItems: MenuItem[] = useMemo(() => {
    if (cmsItems && cmsItems.length > 0) {
      return cmsItems.map(it => ({
        id: it.id,
        name: it.name,
        category: it.categoryId as any,
        description: it.description,
        price: it.price,
        image: it.image,
        popular: it.popular,
        options: it.options,
        tags: it.tags
      }));
    }
    return MENU_ITEMS;
  }, [cmsItems]);

  const navCategories = useMemo(() => {
    const list = [{ id: 'all', label: 'All Items' }];
    if (cmsCategories && cmsCategories.length > 0) {
      cmsCategories.forEach(c => {
        list.push({ id: c.slug, label: c.name });
      });
    } else {
      list.push(
        { id: 'red-base-pizza', label: 'Red Base Pizzas' },
        { id: 'chicken-pizza', label: 'Chicken Pizzas' },
        { id: 'specialty-pizza', label: 'Specialty Pizzas' },
        { id: 'appetizers', label: 'Appetizers' },
        { id: 'wings', label: 'Wings' },
        { id: 'drinks', label: 'Drafts & Drinks' }
      );
    }
    return list;
  }, [cmsCategories]);

  const filteredItems = useMemo(() => {
    return sourceItems.filter(item => {
      // Category match
      let matchesCategory = true;
      if (selectedCategory !== 'all') {
        matchesCategory = item.category === selectedCategory;
      }

      // Search match
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags?.some(t => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [sourceItems, selectedCategory, searchQuery]);

  const handleItemClick = (item: MenuItem) => {
    if (item.options && item.options.length > 0) {
      onSelectItem(item);
    } else {
      onDirectAdd(item);
      setRecentlyAddedId(item.id);
      setTimeout(() => setRecentlyAddedId(null), 1200);
    }
  };

  return (
    <section id="menu" className="py-16 sm:py-24 bg-stone-950 border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Authentic Tavern Menu</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display text-balance">
            Handcrafted Brick Oven Pizzas & Local Bites
          </h2>
          <p className="text-sm sm:text-base text-stone-400 mt-2 text-balance">
            Fired hot in our brick oven with our famous parmesan butter crust, crispy pickle cigars, and locally loved tavern favorites.
          </p>
        </div>

        {/* Search & Category Filter Navigation */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Segmented Category Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-900 border border-stone-800 rounded-xl overflow-x-auto max-w-full">
            {navCategories.map(cat => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search pizza, wings, appetizers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-stone-900/90 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>

        {/* Dedicated "Build Your Own Pizza" Hero Banner */}
        <div
          id="pizza-builder"
          className="relative mb-12 p-6 sm:p-8 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-stone-900 via-amber-950/20 to-stone-900 overflow-hidden shadow-xl"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" /> 12" Brick Oven Specialty
                </span>
                <span className="text-stone-600">·</span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> First Topping On Us!
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
                Build Your Own 12" Brick Oven Pizza
              </h3>
              <p className="text-stone-300 text-xs sm:text-sm mt-2 leading-relaxed">
                Enjoy your own 12" brick oven fired creation generously topped with your first topping on us! Choose any sauce base or cheese for free and customize with our meats, veggies, cheeses, and hot honey drizzles.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-stone-400">
                <span>Starts at <strong className="text-amber-400 font-mono text-sm">$16.50</strong></span>
                <span>·</span>
                <span>Cheese Stuffed Crust available</span>
              </div>
            </div>

            <button
              onClick={onOpenPizzaBuilder}
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm rounded-xl transition shadow-lg shadow-amber-500/10 flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Custom Pizza Builder</span>
            </button>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => {
            const hasOptions = item.options && item.options.length > 0;
            const isJustAdded = recentlyAddedId === item.id;

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between bg-stone-900/60 hover:bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-2xl p-5 transition-all duration-200"
              >
                <div>
                  {/* Clean unboxed metadata with separators */}
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="capitalize">{item.category.replace(/-/g, ' ')}</span>
                      {item.popular && (
                        <>
                          <span aria-hidden="true" className="text-stone-600">·</span>
                          <span className="text-amber-400 font-medium">Customer Favorite</span>
                        </>
                      )}
                    </div>
                    <span className="text-base font-bold text-amber-400 font-mono tabular-nums">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white font-display group-hover:text-amber-400 transition-colors">
                    {item.name}
                  </h4>

                  <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
                    {item.description}
                  </p>

                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-3 text-[11px] text-stone-500">
                      {item.tags.join(' · ')}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-stone-800/80 flex items-center justify-between">
                  <span className="text-xs text-stone-400">
                    {hasOptions ? 'Customizable' : 'Standard Kitchen Recipe'}
                  </span>

                  <button
                    onClick={() => handleItemClick(item)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      isJustAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-200'
                    }`}
                  >
                    {isJustAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added!</span>
                      </>
                    ) : hasOptions ? (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Customize & Add</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Order</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16 bg-stone-900/30 rounded-2xl border border-stone-800">
            <p className="text-stone-300 font-semibold">No menu items match "{searchQuery}"</p>
            <p className="text-xs text-stone-500 mt-1">Try searching for pizza, wings, fries, or draft beers.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 text-xs font-medium text-amber-400 bg-stone-800 rounded-lg hover:bg-stone-700 transition"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
