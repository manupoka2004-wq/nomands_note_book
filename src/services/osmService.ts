// OpenStreetMap (OSM) Service using Overpass API
import { PlaceResult } from '../types';

export async function searchPlacesOSM(query: string, lat: number, lng: number, searchType?: string): Promise<PlaceResult[]> {
  // Map internal types to OSM tags
  // OSM uses tags like amenity=restaurant, tourism=hotel, shop=*, amenity=hospital, amenity=atm
  let osmQuery = '';
  let type: PlaceResult['type'] = 'hotel';

  if (searchType === 'hotel') {
    osmQuery = 'nwr["tourism"="hotel"](area);nwr["tourism"="guest_house"](area);nwr["tourism"="hostel"](area);';
    type = 'hotel';
  } else if (searchType === 'restaurant') {
    osmQuery = 'nwr["amenity"="restaurant"](area);nwr["amenity"="cafe"](area);nwr["amenity"="fast_food"](area);';
    type = 'restaurant';
  } else if (searchType === 'shop') {
    osmQuery = 'nwr["shop"](area);nwr["commercial"](area);';
    type = 'restaurant'; // Treat as restaurant for UI
  } else if (searchType === 'healthcare.hospital') {
    osmQuery = 'nwr["amenity"="hospital"](area);nwr["amenity"="clinic"](area);';
    type = 'restaurant';
  } else if (searchType === 'amenity.atm') {
    osmQuery = 'nwr["amenity"="atm"](area);nwr["amenity"="bank"]["atm"="yes"](area);';
    type = 'restaurant';
  } else if (searchType === 'tourism') {
    osmQuery = 'nwr["tourism"="attraction"](area);nwr["tourism"="museum"](area);nwr["historic"](area);';
    type = 'restaurant';
  } else {
    // Generic fallback based on query
    const q = query.toLowerCase();
    if (q.includes('hotel')) osmQuery = 'nwr["tourism"="hotel"](area);';
    else if (q.includes('restaurant') || q.includes('food')) osmQuery = 'nwr["amenity"="restaurant"](area);';
    else if (q.includes('atm')) osmQuery = 'nwr["amenity"="atm"](area);';
    else if (q.includes('hospital')) osmQuery = 'nwr["amenity"="hospital"](area);';
    else if (q.includes('shop')) osmQuery = 'nwr["shop"](area);';
    else osmQuery = 'nwr["amenity"](area);nwr["tourism"](area);nwr["shop"](area);';
  }

  // Radius in degrees (approx 5km)
  const radius = 0.05; 
  const south = lat - radius;
  const west = lng - radius;
  const north = lat + radius;
  const east = lng + radius;

  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  const body = `
    [out:json][timeout:25];
    (
      ${osmQuery.replace(/\(area\)/g, `(${south},${west},${north},${east})`)}
    );
    out center 15;
  `;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(overpassUrl, {
      method: 'POST',
      body: body,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        console.warn("[OSMSearch] Rate limit hit. Falling back to custom data.");
      }
      throw new Error(`OSM API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.elements || data.elements.length === 0) return [];

    return data.elements.map((el: any) => {
      const tags = el.tags || {};
      const name = tags.name || tags['name:en'] || tags.brand || tags.operator || 'Unnamed Place';
      const address = tags['addr:street'] ? `${tags['addr:street']} ${tags['addr:housenumber'] || ''}` : tags['addr:city'] || 'Nearby';
      
      // For ways/relations, the center is in 'center' property
      const itemLat = el.lat || el.center?.lat;
      const itemLon = el.lon || el.center?.lon;

      return {
        id: el.id.toString(),
        name: name,
        location: address,
        lat: itemLat || 0,
        lng: itemLon || 0,
        rating: 4.0 + (Math.random() * 1.0),
        reviews: Math.floor(Math.random() * 800) + 20,
        price: type === 'hotel' ? Math.floor(Math.random() * 6000) + 1200 : Math.floor(Math.random() * 1200) + 150,
        image: `https://picsum.photos/seed/${encodeURIComponent(name + el.id)}/800/600`,
        type: type,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${itemLat},${itemLon}`,
        snippet: tags.cuisine || tags.description || tags.amenity || tags.tourism || 'Real-world location from OpenStreetMap'
      };
    });
  } catch (error) {
    console.error("[OSMSearch] Error:", error);
    return [];
  }
}
