import { Booking, TaxiRide } from '../types';
import { supabase, isSupabaseConfigured, isValidUUID } from '../lib/supabase';

const BOOKINGS_KEY = 'tripmaker_bookings';

export async function createBooking(booking: Omit<Booking, 'id' | 'created_at'>): Promise<Booking> {
  // 1. Try Supabase if configured and user is authenticated (valid UUID)
  if (isSupabaseConfigured() && isValidUUID(booking.user_id)) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          ...booking,
          id: 'BK-' + Math.random().toString(36).substring(2, 11),
          status: 'confirmed'
        }])
        .select()
        .single();

      if (!error && data) {
        return data as Booking;
      }
      console.warn('[BookingService] Supabase error (createBooking):', error);
    } catch (err) {
      console.warn('[BookingService] Supabase exception (createBooking):', err);
    }
  }

  // 2. Try Backend
  try {
    const response = await fetch('/api/booking/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
    
    const data = await response.json();
    if (response.ok) {
      return data.booking;
    }
    throw new Error(data.error || 'Failed to create booking');
  } catch (err: any) {
    console.warn('[BookingService] Backend error (createBooking), falling back to localStorage:', err);
    const newBooking: Booking = {
      ...booking,
      id: 'LOCAL-' + Math.random().toString(36).substring(2, 11),
      created_at: new Date().toISOString(),
      status: 'confirmed' as const,
      item_name: `Ride from ${(booking as any).pickup || 'Unknown'} to ${(booking as any).drop || 'Unknown'}`,
      item_type: 'taxi' as const
    };
    const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
    bookings.unshift(newBooking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    return newBooking;
  }
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  let localBookings: Booking[] = [];
  try {
    localBookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
    localBookings = localBookings.filter((b: Booking) => b.user_id === userId || b.user_id === 'offline_user');
  } catch (e) {
    console.error('[BookingService] Error reading local bookings:', e);
  }

  let supabaseBookings: Booking[] = [];
  if (isSupabaseConfigured() && isValidUUID(userId)) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        supabaseBookings = data as Booking[];
      }
    } catch (err) {
      console.warn('[BookingService] Supabase error (getUserBookings):', err);
    }
  }

  try {
    const response = await fetch(`/api/bookings?userId=${userId}`);
    let backendBookings: Booking[] = [];
    if (response.ok) {
      backendBookings = await response.json();
    }
    
    // Merge and remove duplicates by ID
    const merged = [...supabaseBookings, ...backendBookings, ...localBookings];
    const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
    return unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (err: any) {
    console.warn('[BookingService] Backend error (getUserBookings), falling back to other sources:', err);
    const merged = [...supabaseBookings, ...localBookings];
    const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
    return unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}

export async function updateTaxiRideStatus(rideId: string, updates: Partial<TaxiRide>): Promise<void> {
  try {
    // For now, just update local storage since we don't have a backend update route yet
    const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
    const index = bookings.findIndex((b: Booking) => b.id === rideId);
    if (index !== -1) {
      bookings[index] = { ...bookings[index], ...updates };
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    }
  } catch (err: any) {
    console.warn('[BookingService] Error updating ride status:', err);
  }
}
