import { Booking } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export async function fetchAdminStats() {
  let supabaseBookings: Booking[] = [];
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        supabaseBookings = data as Booking[];
      }
    } catch (err) {
      console.warn('[AdminService] Supabase error:', err);
    }
  }

  try {
    const response = await fetch('/api/bookings?userId=all'); // Placeholder for admin fetch
    let backendBookings: Booking[] = [];
    if (response.ok) {
      backendBookings = await response.json();
    }
    
    const localBookings: Booking[] = JSON.parse(localStorage.getItem('tripmaker_bookings') || '[]');
    
    // Merge all sources
    const merged = [...supabaseBookings, ...backendBookings, ...localBookings];
    const bookings = Array.from(new Map(merged.map(item => [item.id, item])).values());

    const totalRevenue = (bookings || []).reduce((acc, b) => acc + (b.price || 0), 0);
    const totalBookings = (bookings || []).length;
    const hotelBookings = (bookings || []).filter(b => b.item_type === 'hotel').length;
    const taxiBookings = (bookings || []).filter(b => b.item_type === 'taxi').length;
    const tourismBookings = (bookings || []).filter(b => b.item_type === 'tourism').length;

    return {
      totalRevenue,
      totalBookings,
      hotelBookings,
      taxiBookings,
      tourismBookings,
      recentBookings: (bookings || []).slice(0, 5)
    };
  } catch (err) {
    console.warn('Admin stats fetch failed, using available sources', err);
    const localBookings: Booking[] = JSON.parse(localStorage.getItem('tripmaker_bookings') || '[]');
    const merged = [...supabaseBookings, ...localBookings];
    const bookings = Array.from(new Map(merged.map(item => [item.id, item])).values());
    
    const totalRevenue = bookings.reduce((acc, b) => acc + (b.price || 0), 0);
    const totalBookings = bookings.length;
    const hotelBookings = bookings.filter(b => b.item_type === 'hotel').length;
    const taxiBookings = bookings.filter(b => b.item_type === 'taxi').length;
    const tourismBookings = bookings.filter(b => b.item_type === 'tourism').length;

    return {
      totalRevenue,
      totalBookings,
      hotelBookings,
      taxiBookings,
      tourismBookings,
      recentBookings: bookings.slice(0, 5)
    };
  }
}
