import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { MenuItem, CartItem } from '../types/restaurant';

interface ItemCustomizerModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export const ItemCustomizerModal: React.FC<ItemCustomizerModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart
}) => {
  if (!isOpen || !item) return null;

  // Initialize selected options with defaults
  const initialOptions: { [key: string]: string } = {};
  item.options?.forEach(opt => {
    if (opt.choices.length > 0) {
      initialOptions[opt.name] = opt.choices[0].label;
    }
  });

  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>(initialOptions);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Calculate price with options
  let extraCost = 0;
  item.options?.forEach(opt => {
    const chosenLabel = selectedOptions[opt.name];
    const match = opt.choices.find(c => c.label === chosenLabel);
    if (match) {
      extraCost += match.extraPrice;
    }
  });

  const singlePrice = Math.max(0, item.price + extraCost);
  const totalPrice = singlePrice * quantity;

  const handleSelectOption = (groupName: string, choiceLabel: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [groupName]: choiceLabel
    }));
  };

  const handleAdd = () => {
    const cartItem: CartItem = {
      cartItemId: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      menuItemId: item.id,
      name: item.name,
      basePrice: item.price,
      quantity,
      selectedOptions,
      specialInstructions,
      totalItemPrice: totalPrice
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-stone-800 flex items-start justify-between bg-stone-950/40">
          <div>
            <h3 className="text-xl font-bold text-white font-display">{item.name}</h3>
            <p className="text-xs text-stone-400 mt-1 leading-relaxed">{item.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {item.options && item.options.length > 0 ? (
            item.options.map(opt => (
              <div key={opt.name}>
                <label className="block text-sm font-semibold text-stone-200 mb-2">
                  {opt.name}
                </label>
                <div className="space-y-2">
                  {opt.choices.map(choice => {
                    const isSelected = selectedOptions[opt.name] === choice.label;
                    return (
                      <button
                        key={choice.label}
                        type="button"
                        onClick={() => handleSelectOption(opt.name, choice.label)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs sm:text-sm transition text-left ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10 text-white font-medium'
                            : 'border-stone-800 bg-stone-950/30 text-stone-300 hover:border-stone-700'
                        }`}
                      >
                        <span>{choice.label}</span>
                        <span className="font-mono text-xs text-stone-400">
                          {choice.extraPrice > 0
                            ? `+$${choice.extraPrice.toFixed(2)}`
                            : choice.extraPrice < 0
                            ? `-$${Math.abs(choice.extraPrice).toFixed(2)}`
                            : 'Included'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-stone-400 italic">No customizable options for this item. Standard kitchen preparation.</p>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              Special Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Extra crispy, sauce on side..."
              value={specialInstructions}
              onChange={e => setSpecialInstructions(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-stone-800 bg-stone-950/70 flex items-center justify-between gap-4">
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
            className="flex-1 py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm rounded-lg transition shadow-md flex items-center justify-between"
          >
            <span>Add to Order</span>
            <span className="font-mono font-black">${totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
