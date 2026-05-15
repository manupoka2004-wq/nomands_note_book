export interface Circle {
  id: string;
  name: string;
  activity: string;
  members: number;
  lat: number;
  lng: number;
  type: 'public' | 'private';
  creator: string;
  description?: string;
  tags?: string[];
}

export interface SoloCircle extends Circle {}

export interface CircleFilters {
  query?: string;
  type?: 'public' | 'private' | 'all';
  activity?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  interests: string[];
  bio?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}
