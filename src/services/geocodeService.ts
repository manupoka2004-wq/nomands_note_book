import axios from 'axios';

export interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

export const searchLocations = async (query: string): Promise<LocationSuggestion[]> => {
  if (!query || query.length < 3) return [];
  
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 5,
      },
      headers: {
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to fetch location suggestions');
  }
};
