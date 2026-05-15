import { CustomPlace } from '../types';

/**
 * Large Static Dataset
 * You can add thousands of entries here.
 * This will be bundled with your application.
 */
export const STATIC_DATASET: Omit<CustomPlace, 'id'>[] = [
  {
    name: 'The Oberoi Amarvilas',
    location: 'Agra, India',
    type: 'hotel',
    price: 45000,
    rating: 5.0,
    reviews: 2400,
    lat: 27.1683,
    lng: 78.0412,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=27.1683,78.0412',
    image: 'https://picsum.photos/seed/oberoi/800/600',
    amenities: ['Wifi', 'Coffee', 'Wind', 'Tv', 'Pool', 'Spa']
  },
  {
    name: 'Taj Lake Palace',
    location: 'Udaipur, India',
    type: 'hotel',
    price: 55000,
    rating: 4.9,
    reviews: 1800,
    lat: 24.5753,
    lng: 73.6800,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=24.5753,73.6800',
    image: 'https://picsum.photos/seed/tajlake/800/600',
    amenities: ['Wifi', 'Coffee', 'Wind', 'Tv', 'Pool']
  },
  {
    name: 'ITC Grand Chola',
    location: 'Chennai, India',
    type: 'hotel',
    price: 18000,
    rating: 4.8,
    reviews: 3200,
    lat: 13.0102,
    lng: 80.2206,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=13.0102,80.2206',
    image: 'https://picsum.photos/seed/itcgrand/800/600',
    amenities: ['Wifi', 'Coffee', 'Tv', 'Pool', 'Gym']
  },
  {
    name: 'Bukhara',
    location: 'New Delhi, India',
    type: 'restaurant',
    price: 8000,
    rating: 4.9,
    reviews: 4500,
    lat: 28.5971,
    lng: 77.1738,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=28.5971,77.1738',
    image: 'https://picsum.photos/seed/bukhara/800/600',
    amenities: ['Wifi', 'Coffee']
  },
  {
    name: 'Indian Accent',
    location: 'New Delhi, India',
    type: 'restaurant',
    price: 12000,
    rating: 4.8,
    reviews: 2100,
    lat: 28.5847,
    lng: 77.2326,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=28.5847,77.2326',
    image: 'https://picsum.photos/seed/indianaccent/800/600',
    amenities: ['Wifi', 'Coffee']
  },
  {
    name: 'Uber Premium - Mumbai',
    location: 'Mumbai, India',
    type: 'taxi',
    price: 1200,
    rating: 4.7,
    reviews: 15000,
    lat: 19.0760,
    lng: 72.8777,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=19.0760,72.8777',
    image: 'https://picsum.photos/seed/taxi1/800/600',
    amenities: ['AC', 'Music', 'GPS']
  },
  {
    name: 'Yellow Cab - Delhi',
    location: 'New Delhi, India',
    type: 'taxi',
    price: 800,
    rating: 4.5,
    reviews: 8000,
    lat: 28.6139,
    lng: 77.2090,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=28.6139,77.2090',
    image: 'https://picsum.photos/seed/taxi2/800/600',
    amenities: ['AC', 'GPS']
  },
  {
    name: 'Gateway of India',
    location: 'Mumbai, India',
    type: 'tourism',
    price: 0,
    rating: 4.8,
    reviews: 120000,
    lat: 18.9220,
    lng: 72.8347,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=18.9220,72.8347',
    image: 'https://picsum.photos/seed/gateway/800/600',
    amenities: ['Photography', 'History', 'Sea View']
  },
  {
    name: 'Qutub Minar',
    location: 'New Delhi, India',
    type: 'tourism',
    price: 600,
    rating: 4.7,
    reviews: 85000,
    lat: 28.5244,
    lng: 77.1855,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=28.5244,77.1855',
    image: 'https://picsum.photos/seed/qutub/800/600',
    amenities: ['History', 'Architecture', 'Park']
  }
  // Add more entries here...
];
