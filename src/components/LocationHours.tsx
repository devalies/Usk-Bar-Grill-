import React from 'react';
import { MapPin, Clock, Phone, Car, Compass, ExternalLink } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';
import { BusinessInfo, LocationItem, OpeningHour } from '../types/cms';

interface LocationHoursProps {
  businessInfo?: BusinessInfo;
  openingHours?: OpeningHour[];
  locations?: LocationItem[];
}

export const LocationHours: React.FC<LocationHoursProps> = ({
  businessInfo,
  openingHours,
  locations
}) => {
  const address = businessInfo?.address
    ? `${businessInfo.address}, ${businessInfo.city}`
    : RESTAURANT_INFO.address;
  const phone = businessInfo?.phone || RESTAURANT_INFO.phone;
  const plusCode = businessInfo?.plusCode || RESTAURANT_INFO.plusCode;
  const mapsUrl =
    businessInfo?.mapsUrl ||
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('112 5th St, Usk, WA 99180')}`;

  const schedule =
    openingHours && openingHours.length > 0
      ? openingHours.map(h => ({
          days: h.dayOfWeek,
          time: h.isOpen ? `${h.openTime} – ${h.closeTime}` : 'Closed'
        }))
      : RESTAURANT_INFO.hours.regular;

  return (
    <section id="location" className="py-16 sm:py-24 bg-stone-950 border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Details Column */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">
                <MapPin className="w-4 h-4" />
                <span>Visit Us in Usk, Washington</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display text-balance">
                Location, Hours & Drive-Through
              </h2>
              <p className="text-sm text-stone-300 mt-2 leading-relaxed">
                Nestled in picturesque Pend Oreille County right on 5th Street in Usk. Easily accessible with plentiful parking and a dedicated drive-through window for quick pizza and takeout pickup.
              </p>
            </div>

            {/* Hours Grid */}
            <div className="p-6 bg-stone-900 border border-stone-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Operating Hours</span>
                </div>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Open Daily
                </span>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm">
                {schedule.map(h => (
                  <div key={h.days} className="flex justify-between items-center text-stone-300">
                    <span className="text-stone-400">{h.days}</span>
                    <span className="font-mono font-medium text-white">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Address & Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-stone-900/60 border border-stone-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>Address</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-200">{address}</p>
                <p className="text-[11px] text-stone-400 font-mono">
                  Plus Code: {plusCode}
                </p>
                <div className="pt-2">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    <span>Get Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="p-5 bg-stone-900/60 border border-stone-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                  <Phone className="w-4 h-4 text-amber-500" />
                  <span>Call & Pickup</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-200">{phone}</p>
                <p className="text-[11px] text-stone-400">
                  Direct kitchen & pickup line for call-ahead orders.
                </p>
                <div className="pt-2">
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    <span>Tap to Call</span>
                    <Phone className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Drive-Through Highlight */}
            <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-xl flex items-start gap-3">
              <Car className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Drive-Through & Pickup Window</h4>
                <p className="text-xs text-stone-300 mt-0.5">
                  Ordering from the car or heading back from camping at the Pend Oreille River? Pull right up to our drive-through window for hot pizza boxes and crisp appetizers without parking!
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Map Visual Column */}
          <div className="lg:col-span-6">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative h-80 sm:h-96 w-full bg-stone-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="relative z-10 max-w-sm space-y-3">
                  <div className="relative mx-auto w-16 h-16">
                    <img
                      src={businessInfo?.logoUrl || '/logo.png'}
                      alt={businessInfo?.name || 'Usk Bar and Grill'}
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-amber-500/60 shadow-xl bg-stone-900"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-md">
                      <MapPin className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white font-display">
                    {businessInfo?.name || 'Usk Bar and Grill'}
                  </h3>
                  <p className="text-xs text-stone-400">{address}</p>

                  <div className="pt-2">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition shadow-lg shadow-amber-500/10 cursor-pointer"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  </div>
                </div>

                <div className="absolute bottom-3 right-3 text-[10px] text-stone-500 font-mono">
                  {plusCode}
                </div>
              </div>

              <div className="p-4 bg-stone-950 border-t border-stone-800 grid grid-cols-2 text-xs text-stone-400">
                <div>
                  <span className="text-stone-300 font-medium">Pend Oreille River:</span> 3 mins
                </div>
                <div>
                  <span className="text-stone-300 font-medium">Cusick, WA:</span> 5 mins
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
