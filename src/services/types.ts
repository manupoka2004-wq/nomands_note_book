import { Place } from './services/placesService';

export interface PlaceResult {
  id: string;
  name: string;
  location: string;
  price: number;
  type: 'hotel' | 'restaurant' | 'tourism' | 'taxi' | 'flight';
  lat: number;
  lng: number;
  rating: number;
  reviews: number;
  image: string;
  mapsUrl: string;
  amenities?: string[];
  snippet?: string;
}

export interface CustomPlace extends PlaceResult {
  isOffline?: boolean;
}

export interface Booking {
  id: string;
  user_id: string;
  item_id: string;
  item_name: string;
  item_type: 'hotel' | 'taxi' | 'tourism' | 'flight' | 'restaurant';
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  booking_details?: any;
  pickup?: string;
  drop?: string;
  date?: string;
  time?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  isDemo?: boolean;
}

export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  item_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  item_id: string;
  item_data: PlaceResult;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export interface TaxiRide extends Booking {
  driver_name?: string;
  driver_lat?: number;
  driver_lng?: number;
  estimated_arrival?: string;
}

export interface RideStop {
  id: string;
  address: string;
  lat: number;
  lng: number;
}

export interface ChatMessage {
  id: string;
  sender: 'rider' | 'driver';
  text: string;
  timestamp: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  benefits: string[];
  discount: number;
}

export interface AILensInsights {
  cultural?: {
    etiquette: string[];
    customs: string;
    traditions: string;
  };
  food?: {
    dishName: string;
    ingredients: string[];
    allergens: string[];
    calories: string;
    history: string;
    recommender: string;
  };
  safety?: {
    rating: number;
    crowdLevel: 'low' | 'medium' | 'high';
    advice: string;
    areasToAvoid: string[];
  };
  emotion?: {
    mood: string;
    tone: string;
    suggestedPhrases: string[];
  };
  sustainability?: {
    isEcoFriendly: boolean;
    isLocal: boolean;
    impact: string;
    refillStationsNearby: string[];
  };
  history?: {
    pastViewDescription: string;
    timeline: { period: string; description: string }[];
  };
  transport?: {
    type: string;
    schedules: string[];
    ticketOptions: string[];
    directions: string;
    travelerTips: string[];
  };
  gestures?: {
    meaning: string;
    context: string;
    warning?: string;
  };
  story?: {
    title: string;
    journalEntry: string;
    captions: string[];
    funFacts: string[];
  };
}

export interface BookingDetails {
  name: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface PlacesBooking {
  id: string;
  place: Place;
  details: BookingDetails;
  amount: number;
  paymentId?: string;
  timestamp: string;
}

export interface LandmarkInfo {
  title: string;
  extract: string;
  thumbnail?: string;
  pageid: number;
}

export interface DetectionResult {
  label: string;
  score: number;
}

export interface VisionState {
  isProcessing: boolean;
  objects: DetectionResult[];
  ocrText: string;
  translation: string;
  landmark: LandmarkInfo | null;
  insights: AILensInsights | null;
  error: string | null;
}

export type Page = 'dashboard' | 'travel' | 'hotels' | 'ai-planner' | 'route-planner' | 'ai-lens' | 'solo-circles' | 'admin' | 'auth' | 'booking-confirmation' | 'emergency';

export interface TravelBookingProps {
  user: User | null;
  onBookingSuccess: (booking: Booking) => void;
  setActivePage: (page: Page) => void;
}
