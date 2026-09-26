import React, { useState, useMemo } from 'react';
import { X, Check, Sparkles, Plus, Minus } from 'lucide-react';
import { BUILD_YOUR_OWN_CONFIG } from '../data/restaurantData';
import { CartItem } from '../types/restaurant';

interface PizzaBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export const PizzaBuilderModal: React.FC<PizzaBuilderModalProps> = ({
  isOpen,
  onClose,
  onAddToCart
}) => {
  const [crust, setCrust] = useState<string>('traditional');
  const [sauce, setSauce] = useState<string>('House Red Pizza Sauce');
  const [selectedMeats, setSelectedMeats] = useState<string[]>([]);
  const [selectedVeggies, setSelectedVeggies] = useState<string[]>([]);
  const [selectedCheeses, setSelectedCheeses] = useState<string[]>([]);
  const [selectedDrizzles, setSelectedDrizzles] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');

  // First topping is free as stated in menu!
  const { totalPrice, crustExtra, toppingsPrice, freeToppingApplied } = useMemo(() => {
    let extra = 0;
    if (crust === 'stuffed') {
      extra += 1.50;
    }

    // Collect all chosen items
    const allToppings: { name: string; price: number }[] = [];
    selectedMeats.forEach(m => {
      const match = BUILD_YOUR_OWN_CONFIG.meats.find(item => item.name === m);
      if (match) allToppings.push(match);
    });
    selectedVeggies.forEach(v => {
      const match = BUILD_YOUR_OWN_CONFIG.veggies.find(item => item.name === v);
      if (match) allToppings.push(match);
    });
    selectedCheeses.forEach(c => {
      const match = BUILD_YOUR_OWN_CONFIG.cheeses.find(item => item.name === c);
      if (match) allToppings.push(match);
    });
    selectedDrizzles.forEach(d => {
      const match = BUILD_YOUR_OWN_CONFIG.drizzles.find(item => item.name === d);
      if (match) allToppings.push(match);
    });

    let freeApplied = false;
    let toppingSum = 0;

    if (allToppings.length > 0) {
      // First topping is on us (discount the first $1.50 topping)
      freeApplied = true;
      toppingSum = allToppings.slice(1).reduce((acc, curr) => acc + curr.price, 0);
      // If the first topping cost more than $1.50 (e.g. Chicken $2 or Ricotta $2), charge the $0.50 difference
      if (allToppings[0].price > 1.50) {
        toppingSum += (allToppings[0].price - 1.50);
      }
    }

    const singlePizzaPrice = BUILD_YOUR_OWN_CONFIG.basePrice + extra + toppingSum;
    return {
      totalPrice: singlePizzaPrice * quantity,
      crustExtra: extra,
      toppingsPrice: toppingSum,
      freeToppingApplied: freeApplied
    };
  }, [crust, selectedMeats, selectedVeggies, selectedCheeses, selectedDrizzles, quantity]);

  if (!isOpen) return null;

  const toggleItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleAdd = () => {
    const crustObj = BUILD_YOUR_OWN_CONFIG.crusts.find(c => c.id === crust);
    const item: CartItem = {
      cartItemId: `byo-${Date.now()}`,
      menuItemId: 'pizza-build-your-own',
      name: `Custom 12" Brick Oven Pizza (${crustObj?.name})`,
      basePrice: BUILD_YOUR_OWN_CONFIG.basePrice,
      quantity,
      selectedOptions: {
        'Crust': crustObj?.name || 'Traditional',
        'Sauce Base': sauce,
      },
      specialInstructions,
      customPizzaDetails: {
        crust: crustObj?.name || 'Traditional',
        sauce,
        meats: selectedMeats,
        veggies: selectedVeggies,
        cheeses: selectedCheeses,
        drizzles: selectedDrizzles,
      },
      totalItemPrice: totalPrice
    };

    onAddToCart(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-stone-800 flex items-start justify-between bg-stone-950/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Interactive Customizer</span>
              <span className="text-xs text-stone-500">·</span>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> First Topping Free!
              </span>
            </div>
            <h2 className="text-2xl font-black text-white font-display">
              Build Your Own 12" Brick Oven Pizza
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              Choose your brick oven crust, complimentary sauce base, premium meats, fresh garden veggies, artisan cheeses, and gourmet drizzles.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Configuration Body */}
        <div className="p-6 space-y-7 overflow-y-auto flex-1">
          {/* Step 1: Crust Selection */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              1. Choose Crust <span className="text-xs font-normal text-stone-400">(12" Brick Oven Fired)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BUILD_YOUR_OWN_CONFIG.crusts.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCrust(c.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition ${
                    crust === c.id
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-stone-800 bg-stone-950/40 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-sm">{c.name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {c.price === 0 ? 'Included with base price' : `+$${c.price.toFixed(2)}`}
                    </p>
                  </div>
                  {crust === c.id && <Check className="w-4 h-4 text-amber-500 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Sauce Base */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-white">
                2. Select Sauce Base <span className="text-xs font-normal text-emerald-400">(Included $0)</span>
              </label>
              <span className="text-xs text-stone-400">Selected: {sauce}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BUILD_YOUR_OWN_CONFIG.sauceBases.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSauce(s)}
                  className={`p-2.5 rounded-lg border text-xs font-medium text-left transition ${
                    sauce === s
                      ? 'border-amber-500 bg-amber-500/10 text-white font-semibold'
                      : 'border-stone-800 bg-stone-950/40 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Meats */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-white">
                3. Meats <span className="text-xs font-normal text-stone-400">($1.50 ea / Chicken $2.00)</span>
              </label>
              <span className="text-xs text-stone-400">{selectedMeats.length} chosen</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BUILD_YOUR_OWN_CONFIG.meats.map(m => {
                const isSelected = selectedMeats.includes(m.name);
                return (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => toggleItem(selectedMeats, setSelectedMeats, m.name)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 text-white font-semibold'
                        : 'border-stone-800 bg-stone-950/40 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <span>{m.name}</span>
                    <span className="text-[11px] text-stone-400 font-mono">+${m.price.toFixed(2)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Veggies & Fruits */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-white">
                4. Veggies & Fresh Produce <span className="text-xs font-normal text-stone-400">($1.50 ea)</span>
              </label>
              <span className="text-xs text-stone-400">{selectedVeggies.length} chosen</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BUILD_YOUR_OWN_CONFIG.veggies.map(v => {
                const isSelected = selectedVeggies.includes(v.name);
                return (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() => toggleItem(selectedVeggies, setSelectedVeggies, v.name)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 text-white font-semibold'
                        : 'border-stone-800 bg-stone-950/40 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <span>{v.name}</span>
                    <span className="text-[11px] text-stone-400 font-mono">+$1.50</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 5: Cheeses & Drizzles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                5. Cheeses <span className="text-xs font-normal text-stone-400">($1.50 ea / Ricotta $2)</span>
              </label>
              <div className="space-y-1.5">
                {BUILD_YOUR_OWN_CONFIG.cheeses.map(c => {
                  const isSelected = selectedCheeses.includes(c.name);
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => toggleItem(selectedCheeses, setSelectedCheeses, c.name)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs transition ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 text-white font-semibold'
                          : 'border-stone-800 bg-stone-950/40 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-[11px] text-stone-400 font-mono">+${c.price.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">
                6. Finishing Drizzles <span className="text-xs font-normal text-stone-400">($1.50 ea)</span>
              </label>
              <div className="space-y-1.5">
                {BUILD_YOUR_OWN_CONFIG.drizzles.map(d => {
                  const isSelected = selectedDrizzles.includes(d.name);
                  return (
                    <button
                      key={d.name}
                      type="button"
                      onClick={() => toggleItem(selectedDrizzles, setSelectedDrizzles, d.name)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs transition ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 text-white font-semibold'
                          : 'border-stone-800 bg-stone-950/40 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <span>{d.name}</span>
                      <span className="text-[11px] text-stone-400 font-mono">+${d.price.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1.5">
              Special Kitchen Requests (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Well done crust, light cheese, sauce on the side..."
              value={specialInstructions}
              onChange={e => setSpecialInstructions(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-950 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Footer with Price Breakdown and Add Button */}
        <div className="p-6 border-t border-stone-800 bg-stone-950/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-amber-400 font-mono">
                ${totalPrice.toFixed(2)}
              </span>
              {freeToppingApplied && (
                <span className="text-xs text-emerald-400 font-medium">
                  (-$1.50 First Topping Free applied!)
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400">
              Base $16.50 {crustExtra > 0 ? `+ $${crustExtra.toFixed(2)} crust` : ''}{' '}
              {toppingsPrice > 0 ? `+ $${toppingsPrice.toFixed(2)} add-ons` : ''}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center bg-stone-900 border border-stone-800 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1.5 text-stone-400 hover:text-white rounded hover:bg-stone-800"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm font-semibold text-white font-mono">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-1.5 text-stone-400 hover:text-white rounded hover:bg-stone-800"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm rounded-lg transition shadow-md whitespace-nowrap"
            >
              Add Pizza to Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
