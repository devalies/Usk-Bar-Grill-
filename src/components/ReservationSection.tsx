import React, { useState } from 'react';
import { Calendar as CalendarIcon, Users, Clock, CheckCircle2, Sparkles, MapPin, AlertCircle } from 'lucide-react';
import { Reservation } from '../types/restaurant';

interface ReservationSectionProps {
  onReservationComplete?: (res: Reservation) => void;
}

export const ReservationSection: React.FC<ReservationSectionProps> = ({
  onReservationComplete
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('6:00 PM');
  const [guests, setGuests] = useState(4);
  const [seatingArea, setSeatingArea] = useState<'family-dining' | 'tavern-bar' | 'rec-room'>('family-dining');
  const [specialRequests, setSpecialRequests] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const timeSlots = [
    '12:00 PM', '1:00 PM', '2:30 PM', '4:30 PM', '5:30 PM',
    '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM'
  ];

  const isValidEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Home', 'End'].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, '').slice(0, 15);
    setCustomerPhone(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Please provide your name.');
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMessage('Please provide your phone number.');
      return;
    }

    if (!/^\d{7,15}$/.test(customerPhone.trim())) {
      setErrorMessage('Phone number must contain only numbers (between 7 and 15 digits, no letters).');
      return;
    }

    if (customerEmail.trim() && !isValidEmail(customerEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
          date,
          time,
          guests,
          seatingArea,
          specialRequests: specialRequests.trim()
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to book reservation.');
      }

      setConfirmedReservation(data.data);
      if (onReservationComplete) {
        onReservationComplete(data.data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reservations" className="py-16 sm:py-24 bg-stone-900/40 border-b border-stone-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Reserve Your Table</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display text-balance">
            Seamless Table & Rec Room Reservations
          </h2>
          <p className="text-sm sm:text-base text-stone-400 mt-2 text-balance">
            Whether bringing the whole family for brick oven pizza, grabbing cold pints at the bar, or reserving time for pool and foosball in the back rec room.
          </p>
        </div>

        {confirmedReservation ? (
          /* Confirmation Ticket Card */
          <div className="max-w-xl mx-auto bg-stone-900 border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="Usk Bar and Grill Logo"
                className="w-16 h-16 rounded-full object-cover ring-2 ring-amber-500/50 shadow-lg bg-stone-950"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Reservation Confirmed</span>
            </div>
            <h3 className="text-2xl font-black text-white font-display mt-1">
              We Can't Wait to Host You!
            </h3>
            <p className="text-sm text-stone-300 mt-2">
              Confirmation Code: <span className="font-mono font-bold text-amber-400">{confirmedReservation.confirmationCode}</span>
            </p>

            <div className="my-6 p-4 bg-stone-950/60 rounded-xl border border-stone-800 text-left text-xs sm:text-sm space-y-2">
              <div className="flex justify-between text-stone-400">
                <span>Guest Name:</span>
                <span className="text-white font-medium">{confirmedReservation.customerName}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Party Size:</span>
                <span className="text-white font-medium">{confirmedReservation.guests} Guests</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Date & Time:</span>
                <span className="text-white font-medium">{confirmedReservation.date} at {confirmedReservation.time}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Reserved Area:</span>
                <span className="text-amber-400 font-semibold capitalize">
                  {confirmedReservation.seatingArea.replace(/-/g, ' ')}
                </span>
              </div>
              {confirmedReservation.specialRequests && (
                <div className="pt-2 border-t border-stone-800 text-stone-400">
                  <span>Note: "{confirmedReservation.specialRequests}"</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setConfirmedReservation(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg transition"
              >
                Book Another Table
              </button>
              <a
                href="tel:+15094451262"
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg transition"
              >
                Call with Changes: (509) 445-1262
              </a>
            </div>
          </div>
        ) : (
          /* Interactive Reservation Booking Form */
          <form
            onSubmit={handleSubmit}
            className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xl"
          >
            {errorMessage && (
              <div className="mb-6 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-6">
              {/* Seating Area Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                  1. Select Seating Preference
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSeatingArea('family-dining')}
                    className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                      seatingArea === 'family-dining'
                        ? 'border-amber-500 bg-amber-500/10 text-white'
                        : 'border-stone-800 bg-stone-950/40 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <p className="font-bold text-sm text-white">Family Dining Room</p>
                    <p className="text-xs text-stone-400 mt-1">
                      Spacious booth & table seating. Ideal for families and all ages.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSeatingArea('tavern-bar')}
                    className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                      seatingArea === 'tavern-bar'
                        ? 'border-amber-500 bg-amber-500/10 text-white'
                        : 'border-stone-800 bg-stone-950/40 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <p className="font-bold text-sm text-white">Tavern & Bar Area</p>
                    <p className="text-xs text-stone-400 mt-1">
                      Right by draft taps, sports TVs, and vibrant tavern atmosphere. (21+)
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSeatingArea('rec-room')}
                    className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                      seatingArea === 'rec-room'
                        ? 'border-amber-500 bg-amber-500/10 text-white'
                        : 'border-stone-800 bg-stone-950/40 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-white">Back Rec Room</p>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      Table directly adjacent to free foosball, pool table, and darts!
                    </p>
                  </button>
                </div>
              </div>

              {/* Date, Time & Guests Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                    2. Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-950 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                    3. Guests
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={guests}
                      onChange={e => setGuests(parseInt(e.target.value, 10))}
                      className="flex-1 accent-amber-500 cursor-pointer"
                    />
                    <span className="font-mono text-sm font-bold text-amber-400 bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800 shrink-0">
                      {guests} {guests === 1 ? 'Guest' : 'Guests'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                    4. Time
                  </label>
                  <select
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-950 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="pt-2 border-t border-stone-800/80">
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                  5. Contact Details
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Full Name *"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={15}
                      required
                      placeholder="Phone (numbers only) *"
                      value={customerPhone}
                      onKeyDown={handlePhoneKeyDown}
                      onChange={handlePhoneChange}
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                    <p className="text-[10px] text-amber-400/80 mt-1 pl-1">Numbers only, no alphabet</p>
                  </div>

                  <div>
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="Email Address (optional)"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      className={`w-full px-3.5 py-2.5 text-xs bg-stone-950 border rounded-xl text-white placeholder-stone-500 focus:outline-none transition ${
                        customerEmail && !isValidEmail(customerEmail)
                          ? 'border-amber-500/80 focus:border-amber-400'
                          : 'border-stone-800 focus:border-amber-500'
                      }`}
                    />
                    {customerEmail && (
                      <p className={`text-[10px] mt-1 pl-1 ${isValidEmail(customerEmail) ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {isValidEmail(customerEmail) ? '✓ Valid email' : 'Requires valid email (name@domain.com)'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Special requests (e.g. Birthday celebration, high chair, pool game preference)..."
                  value={specialRequests}
                  onChange={e => setSpecialRequests(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-black text-sm rounded-xl transition shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                {isSubmitting ? 'Confirming Reservation...' : 'Confirm Table Reservation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
