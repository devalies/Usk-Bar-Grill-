import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, MapPin, Phone, Car, Store, Utensils, X, Flame } from 'lucide-react';
import { Order } from '../types/restaurant';
import { RESTAURANT_INFO } from '../data/restaurantData';

interface OrderConfirmationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  isOpen,
  onClose
}) => {
  const [currentStatus, setCurrentStatus] = useState<Order['status']>('confirmed');

  useEffect(() => {
    if (order) {
      setCurrentStatus(order.status);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const statuses = [
    { key: 'confirmed', label: 'Order Received', desc: 'Sent straight to the kitchen' },
    { key: 'prep', label: 'Dough & Prep', desc: 'Hand-tossing 12" crust & fresh toppings' },
    { key: 'baking', label: 'Brick Oven Baking', desc: 'Baking to blistered parmesan crust perfection' },
    { key: 'ready', label: 'Ready for You!', desc: 'Hot and packaged at 112 5th St' }
  ];

  const currentIdx = statuses.findIndex(s => s.key === currentStatus);

  const simulateNextStep = async () => {
    const nextStatuses: Order['status'][] = ['confirmed', 'prep', 'baking', 'ready'];
    const idx = nextStatuses.indexOf(currentStatus);
    if (idx < nextStatuses.length - 1) {
      const next = nextStatuses[idx + 1];
      setCurrentStatus(next);
      try {
        await fetch(`/api/orders/${order.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: next })
        });
      } catch (err) {
        // quiet fallback
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Top Celebration Banner */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-6 text-stone-950 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <img
              src="/logo.png"
              alt="Usk Bar and Grill Logo"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-stone-950/30 shadow-md bg-stone-950 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <CheckCircle2 className="w-4 h-4 text-stone-950" />
                <span className="text-[11px] font-black tracking-widest uppercase">Order Confirmed</span>
              </div>
              <h2 className="text-2xl font-black font-display text-stone-950 leading-tight">
                Order #{order.orderNumber}
              </h2>
              <p className="text-xs text-stone-950/90 font-medium mt-0.5">
                Thank you, {order.customerName}! We've fired up the brick oven.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-950/70 hover:text-stone-950 rounded-lg hover:bg-black/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Tracker */}
        <div className="p-6 border-b border-stone-800 bg-stone-950/40">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
              Live Brick Oven Tracker
            </span>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>Est: ~{order.estimatedReadyTime}</span>
            </div>
          </div>

          {/* Timeline steps */}
          <div className="space-y-3">
            {statuses.map((step, idx) => {
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <div key={step.key} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isCurrent
                          ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-500/20'
                          : isPast
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-800 text-stone-500'
                      }`}
                    >
                      {isPast ? '✓' : idx + 1}
                    </div>
                    {idx < statuses.length - 1 && (
                      <div
                        className={`w-0.5 h-6 my-0.5 ${
                          isPast ? 'bg-emerald-600' : 'bg-stone-800'
                        }`}
                      />
                    )}
                  </div>
                  <div className="pt-0.5">
                    <p
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-amber-400 font-display text-sm'
                          : isPast
                          ? 'text-stone-200'
                          : 'text-stone-500'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-[11px] text-stone-400">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {currentIdx < statuses.length - 1 && (
            <button
              onClick={simulateNextStep}
              className="mt-4 w-full py-1.5 px-3 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-medium rounded-lg transition text-center"
            >
              Advance Tracker (Kitchen Simulation)
            </button>
          )}
        </div>

        {/* Fulfillment Details */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-stone-950/60 border border-stone-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-200">
              {order.fulfillmentType === 'drive-through' && <Car className="w-4 h-4 text-amber-500" />}
              {order.fulfillmentType === 'pickup' && <Store className="w-4 h-4 text-amber-500" />}
              {order.fulfillmentType === 'dine-in' && <Utensils className="w-4 h-4 text-amber-500" />}
              <span className="capitalize">{order.fulfillmentType.replace(/-/g, ' ')} Order</span>
            </div>

            <div className="text-xs text-stone-400 space-y-1">
              <p>
                <strong className="text-stone-300">Name:</strong> {order.customerName} · {order.customerPhone}
              </p>
              {order.vehicleDescription && (
                <p>
                  <strong className="text-stone-300">Vehicle:</strong> {order.vehicleDescription}
                </p>
              )}
              {order.tableNumber && (
                <p>
                  <strong className="text-stone-300">Table:</strong> {order.tableNumber}
                </p>
              )}
              <div className="flex items-center gap-1.5 pt-1 text-stone-300">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{RESTAURANT_INFO.address}</span>
              </div>
            </div>
          </div>

          {/* Receipt Items */}
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
              Itemized Receipt
            </span>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
              {order.items.map((it, i) => (
                <div key={i} className="flex justify-between text-xs text-stone-300">
                  <span className="truncate pr-2">
                    {it.quantity}x {it.name}
                  </span>
                  <span className="font-mono text-stone-400 shrink-0 tabular-nums">
                    ${it.totalItemPrice.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 mt-3 border-t border-stone-800 space-y-1 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Tax (8.1%)</span>
                <span className="font-mono tabular-nums">${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-white text-sm pt-1 border-t border-stone-800">
                <span>Total</span>
                <span className="font-mono text-amber-400 tabular-nums">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between gap-3">
          <a
            href={`tel:${RESTAURANT_INFO.phone}`}
            className="flex items-center gap-2 text-xs font-semibold text-stone-300 hover:text-white px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg transition"
          >
            <Phone className="w-3.5 h-3.5 text-amber-500" />
            <span>Call Kitchen (509) 445-1262</span>
          </a>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
