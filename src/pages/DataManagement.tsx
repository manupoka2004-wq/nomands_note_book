import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Trash2, 
  Hotel, 
  Car, 
  Plane, 
  Archive,
  Plus
} from 'lucide-react';
import { Booking } from '../types';

export default function DataManagement() {
  const [offlineBookings, setOfflineBookings] = useState<Booking[]>([]);
  const [newOfflineBooking, setNewOfflineBooking] = useState({
    item_name: '',
    item_type: 'hotel' as any,
    price: '',
    user_email: ''
  });

  useEffect(() => {
    loadOfflineBookings();
  }, []);

  const loadOfflineBookings = () => {
    const bookings = JSON.parse(localStorage.getItem('tripmaker_bookings') || '[]');
    setOfflineBookings(bookings);
  };

  const handleAddOfflineBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const newBooking: Booking = {
      id: `offline_${Date.now()}`,
      user_id: 'offline_user',
      item_id: `manual_${Date.now()}`,
      item_name: newOfflineBooking.item_name,
      item_type: newOfflineBooking.item_type,
      price: Number(newOfflineBooking.price) || 0,
      status: 'confirmed',
      created_at: new Date().toISOString(),
      booking_details: { manual: true, user_email: newOfflineBooking.user_email }
    };

    const bookings = JSON.parse(localStorage.getItem('tripmaker_bookings') || '[]');
    bookings.push(newBooking);
    localStorage.setItem('tripmaker_bookings', JSON.stringify(bookings));
    
    setNewOfflineBooking({ item_name: '', item_type: 'hotel', price: '', user_email: '' });
    loadOfflineBookings();
    alert('Offline booking record inserted successfully!');
  };

  const handleClearOfflineBookings = () => {
    if (window.confirm('Clear all offline booking records?')) {
      localStorage.removeItem('tripmaker_bookings');
      setOfflineBookings([]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center">
            <Database className="mr-3 text-indigo-600" size={36} />
            Offline Bookings
          </h2>
          <p className="text-slate-500 mt-1 font-medium">Manage your offline travel booking records.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
            <div className="flex items-center space-x-3 text-indigo-600">
              <Plus size={24} />
              <h3 className="text-xl font-black">Insert Offline Booking</h3>
            </div>
            <form onSubmit={handleAddOfflineBooking} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="hotel-name-input" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Hotel/Item Name</label>
                <input 
                  id="hotel-name-input"
                  type="text" 
                  placeholder="e.g. Grand Plaza" 
                  title="Hotel Name"
                  required
                  value={newOfflineBooking.item_name}
                  onChange={e => setNewOfflineBooking({...newOfflineBooking, item_name: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="user-email-input" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">User Email</label>
                <input 
                  id="user-email-input"
                  type="email" 
                  placeholder="user@example.com" 
                  title="User Email"
                  required
                  value={newOfflineBooking.user_email}
                  onChange={e => setNewOfflineBooking({...newOfflineBooking, user_email: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="price-input" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Price</label>
                  <input 
                    id="price-input"
                    type="number" 
                    placeholder="₹" 
                    title="Price"
                    required
                    value={newOfflineBooking.price}
                    onChange={e => setNewOfflineBooking({...newOfflineBooking, price: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="booking-type-select" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Type</label>
                  <select 
                    id="booking-type-select"
                    value={newOfflineBooking.item_type}
                    title="Booking Type"
                    onChange={e => setNewOfflineBooking({...newOfflineBooking, item_type: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none"
                  >
                    <option value="hotel">Hotel</option>
                    <option value="taxi">Taxi</option>
                    <option value="flight">Flight</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                Insert Record
              </button>
            </form>
          </div>
          
          <button 
            onClick={handleClearOfflineBookings}
            className="w-full p-6 bg-red-50 text-red-600 rounded-[2rem] font-black flex items-center justify-center space-x-3 border border-red-100 hover:bg-red-100 transition-all"
          >
            <Trash2 size={24} />
            <span>Clear Offline Bookings</span>
          </button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Offline Booking Records ({offlineBookings.length})</h4>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Local Storage</span>
              </div>
            </div>
            
            <div className="divide-y divide-slate-50 max-h-150 overflow-y-auto">
              {offlineBookings.length > 0 ? (
                offlineBookings.map((booking) => (
                  <div key={booking.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        {booking.item_type === 'hotel' ? <Hotel size={24} /> : booking.item_type === 'taxi' ? <Car size={24} /> : <Plane size={24} />}
                      </div>
                      <div>
                        <h5 className="font-black text-slate-900 tracking-tight">{booking.item_name}</h5>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {new Date(booking.created_at).toLocaleString()} • {booking.booking_details?.user_email || 'No email'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">₹{booking.price.toLocaleString()}</p>
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase">Offline</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <Archive size={40} />
                  </div>
                  <p className="text-slate-400 font-bold">No offline booking records found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
