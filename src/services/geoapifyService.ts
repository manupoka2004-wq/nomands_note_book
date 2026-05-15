// Geoapify Places API Service
import { PlaceResult } from '../types';

const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || '';

export async function searchPlacesGeoapify(query: string, lat: number, lng: number, searchType?: string): Promise<PlaceResult[]> {
  if (!GEOAPIFY_API_KEY) {
    console.warn("Geoapify API Key is missing. Please set VITE_GEOAPIFY_API_KEY.");
    return [];
  }

  let category = '';
  let type: 'hotel' | 'restaurant' = 'hotel';

  if (searchType) {
    // Map internal types to Geoapify categories if needed
    if (searchType === 'hotel') category = 'accommodation.hotel';
    else if (searchType === 'restaurant') category = 'catering.restaurant';
    else if (searchType === 'shop') category = 'commercial.shopping_mall,commercial.department_store,commercial.supermarket';
    else category = searchType;

    if (category.includes('restaurant') || category.includes('catering')) {
      type = 'restaurant';
    } else if (category.includes('hotel') || category.includes('accommodation')) {
      type = 'hotel';
    } else if (category.includes('commercial')) {
      type = 'restaurant'; // We'll treat shops like restaurants for UI purposes (no "Book Now" button)
    }
  } else {
    const isFood = query.toLowerCase().includes('restaurant') || query.toLowerCase().includes('food');
    type = isFood ? 'restaurant' : 'hotel';
    category = type === 'hotel' ? 'accommodation.hotel' : 'catering.restaurant';
  }
  
  // Radius in meters (5km)
  const radius = 5000;
  const url = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${lng},${lat},${radius}&bias=proximity:${lng},${lat}&limit=10&apiKey=${GEOAPIFY_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    const results: PlaceResult[] = data.features.map((feature: any) => {
      const props = feature.properties;
      return {
        id: props.place_id || `geo_${Math.random().toString(36).substring(2, 11)}`,
        name: props.name || props.street || 'Unnamed Place',
        location: props.address_line2 || props.city || 'Nearby',
        lat: props.lat || lat,
        lng: props.lon || lng,
        rating: 4.0 + (Math.random() * 1.0), // Geoapify free doesn't always provide ratings
        reviews: Math.floor(Math.random() * 500) + 50,
        price: type === 'hotel' ? Math.floor(Math.random() * 5000) + 1500 : Math.floor(Math.random() * 1000) + 200,
        image: `https://picsum.photos/seed/${encodeURIComponent(props.name || props.place_id)}/800/600`,
        type: type,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${props.place_id}`,
        snippet: props.categories?.join(', ') || 'Great place to visit'
      };
    });

    return results;
  } catch (error) {
    console.error("[GeoapifySearch] Error:", error);
    return [];
  }
}
