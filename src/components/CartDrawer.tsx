import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Car, Store, Utensils, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { CartItem, Order } from '../types/restaurant';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onOrderPlaced: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderPlaced
}) => {
  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'drive-through' | 'dine-in'>('pickup');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [vehicleDescription, setVehicleDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.totalItemPrice, 0);
  const tax = Math.round(subtotal * 0.081 * 100) / 100; // 8.1% WA state tax
  const total = Math.round((subtotal + tax) * 100) / 100;

  const isValidEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow control and navigation keys
    if (
      ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Home', 'End'].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    // Block alphabet letters and any non-numeric character
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strictly retain numbers only, strip any alphabetic or special characters
    const numericValue = e.target.value.replace(/[^0-9]/g, '').slice(0, 15);
    setCustomerPhone(numericValue);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Please provide your name.');
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMessage('Please provide your contact phone number.');
      return;
    }

    if (!/^\d{7,15}$/.test(customerPhone.trim())) {
      setErrorMessage('Phone number must contain only numbers (between 7 and 15 digits, no alphabet letters).');
      return;
    }

    if (!customerEmail.trim()) {
      setErrorMessage('Please provide your email address for order confirmation.');
      return;
    }

    if (!isValidEmail(customerEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    if (fulfillmentType === 'dine-in' && !tableNumber.trim()) {
      setErrorMessage('Please provide your table number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
          fulfillmentType,
          tableNumber: tableNumber.trim(),
          vehicleDescription: vehicleDescription.trim(),
          items: cartItems,
          notes: notes.trim()
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to place order.');
      }

      onClearCart();
      onClose();
      onOrderPlaced(data.data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong while placing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-stone-900 border-l border-stone-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Usk Bar and Grill Logo"
              className="w-10 h-10 rounded-full object-cover ring-1 ring-amber-500/40 shadow-sm shrink-0"
            />
            <div>
              <h3 className="text-lg font-bold text-white font-display">Your Order</h3>
              <p className="text-xs text-stone-400">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in basket · Usk Bar &amp; Grill
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Fulfillment Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
              Fulfillment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFulfillmentType('pickup')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                  fulfillmentType === 'pickup'
                    ? 'border-amber-500 bg-amber-500/15 text-white font-semibold'
                    : 'border-stone-800 bg-stone-950/40 text-stone-400 hover:text-white'
                }`}
              >
                <Store className="w-4 h-4 mb-1 text-amber-400" />
                <span>Pick-up</span>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentType('drive-through')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                  fulfillmentType === 'drive-through'
                    ? 'border-amber-500 bg-amber-500/15 text-white font-semibold'
                    : 'border-stone-800 bg-stone-950/40 text-stone-400 hover:text-white'
                }`}
              >
                <Car className="w-4 h-4 mb-1 text-amber-400" />
                <span>Drive-thru</span>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentType('dine-in')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                  fulfillmentType === 'dine-in'
                    ? 'border-amber-500 bg-amber-500/15 text-white font-semibold'
                    : 'border-stone-800 bg-stone-950/40 text-stone-400 hover:text-white'
                }`}
              >
                <Utensils className="w-4 h-4 mb-1 text-amber-400" />
                <span>Dine-In</span>
              </button>
            </div>
            <p className="text-[11px] text-stone-400 mt-1.5">
              {fulfillmentType === 'drive-through' && 'Drive up to our pickup window on 5th Street when notified.'}
              {fulfillmentType === 'pickup' && 'Pick up directly at the front counter inside.'}
              {fulfillmentType === 'dine-in' && 'Order directly to your table inside the dining or tavern area.'}
            </p>
          </div>

          {/* Cart Items List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Order Items
              </label>
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-[11px] text-stone-400 hover:text-red-400 transition"
                >
                  Clear all
                </button>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div className="p-8 text-center bg-stone-950/40 border border-stone-800/80 rounded-xl">
                <Utensils className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-stone-300">Your basket is empty</p>
                <p className="text-xs text-stone-500 mt-1">Browse the menu to add delicious brick oven pizza and appetizers.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map(item => (
                  <div
                    key={item.cartItemId}
                    className="p-3 bg-stone-950/50 border border-stone-800/90 rounded-xl flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white font-display leading-tight">{item.name}</h4>
                        {/* Options & Details */}
                        {item.selectedOptions && Object.entries(item.selectedOptions).length > 0 && (
                          <div className="text-[11px] text-stone-400 mt-1 space-y-0.5">
                            {Object.entries(item.selectedOptions).map(([key, val]) => (
                              <p key={key}>
                                <span className="text-stone-500">{key}:</span> {val}
                              </p>
                            ))}
                          </div>
                        )}
                        {item.customPizzaDetails && (
                          <div className="text-[11px] text-stone-400 mt-1">
                            {item.customPizzaDetails.meats.length > 0 && (
                              <p><span className="text-stone-500">Meats:</span> {item.customPizzaDetails.meats.join(', ')}</p>
                            )}
                            {item.customPizzaDetails.veggies.length > 0 && (
                              <p><span className="text-stone-500">Veggies:</span> {item.customPizzaDetails.veggies.join(', ')}</p>
                            )}
                            {item.customPizzaDetails.cheeses.length > 0 && (
                              <p><span className="text-stone-500">Cheeses:</span> {item.customPizzaDetails.cheeses.join(', ')}</p>
                            )}
                            {item.customPizzaDetails.drizzles.length > 0 && (
                              <p><span className="text-stone-500">Drizzles:</span> {item.customPizzaDetails.drizzles.join(', ')}</p>
                            )}
                          </div>
                        )}
                        {item.specialInstructions && (
                          <p className="text-[11px] text-amber-400/90 italic mt-0.5">Note: "{item.specialInstructions}"</p>
                        )}
                      </div>

                      <span className="font-mono text-xs font-bold text-amber-400 tabular-nums">
                        ${item.totalItemPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-stone-800/60">
                      <div className="flex items-center bg-stone-900 border border-stone-800 rounded-md p-0.5">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                          className="p-1 text-stone-400 hover:text-white rounded"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-white">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                          className="p-1 text-stone-400 hover:text-white rounded"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.cartItemId)}
                        className="p-1.5 text-stone-500 hover:text-red-400 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Information Form */}
          {cartItems.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-stone-800">
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Contact & Details
              </label>

              <div>
                <input
                  type="text"
                  required
                  placeholder="Your Name *"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-stone-400">Phone Number *</span>
                  <span className="text-[10px] text-amber-400/80 font-mono">Numbers only (no alphabets)</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={15}
                  required
                  placeholder="Enter phone number (e.g. 5094451262)"
                  value={customerPhone}
                  onKeyDown={handlePhoneKeyDown}
                  onChange={handlePhoneChange}
                  className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-stone-400">Email Address *</span>
                  {customerEmail && (
                    <span className={`text-[10px] ${isValidEmail(customerEmail) ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isValidEmail(customerEmail) ? '✓ Valid format' : 'Requires valid email'}
                    </span>
                  )}
                </div>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  placeholder="yourname@example.com *"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className={`w-full px-3 py-2 text-xs bg-stone-950 border rounded-lg text-white placeholder-stone-500 focus:outline-none transition ${
                    customerEmail && !isValidEmail(customerEmail)
                      ? 'border-amber-500/80 focus:border-amber-400'
                      : 'border-stone-800 focus:border-amber-500'
                  }`}
                />
              </div>

              {fulfillmentType === 'dine-in' && (
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Table Number inside (e.g. Table 4) *"
                    value={tableNumber}
                    onChange={e => setTableNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {fulfillmentType === 'drive-through' && (
                <div>
                  <input
                    type="text"
                    placeholder="Vehicle description (e.g. Silver Ford F-150)"
                    value={vehicleDescription}
                    onChange={e => setVehicleDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div>
                <input
                  type="text"
                  placeholder="Kitchen Notes / Utensils request..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer with Calculations */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-stone-800 bg-stone-950/90 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>WA State Tax (8.1%)</span>
                <span className="font-mono tabular-nums text-white">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-1.5 border-t border-stone-800">
                <span>Total Due</span>
                <span className="font-mono text-amber-400 text-lg tabular-nums">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-stone-400 justify-center">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Estimated Kitchen Prep Time: <strong>20–25 minutes</strong></span>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitOrder}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-extrabold text-sm rounded-xl transition shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Submitting to Brick Oven...</span>
              ) : (
                <>
                  <span>Place Order (${total.toFixed(2)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-stone-500">Pay at counter or drive-up window upon collection</p>
          </div>
        )}
      </div>
    </div>
  );
};
