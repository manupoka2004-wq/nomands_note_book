import axios from 'axios';



export interface Place {

  id: string;

  name: string;

  lat: number;

  lon: number;

  type: 'hotel' | 'restaurant' | 'tourism' | 'attraction' | 'museum' | 'temple' | 'landmark';

  address: string;

  rating: number;

  price: number;

  image: string;

  tags?: string[];

}



interface APIPlace {

  id: number | string;

  lat: number;

  lon: number;

  tags: {

    name: string;

    tourism?: string;

    amenity?: string;

    'addr:street'?: string;

    rating?: number;

    price?: number;

    tags?: string[];

    type?: string;

    address?: string;

    image?: string;

  };

}



export const fetchNearbyPlaces = async (lat: number, lon: number, radius: number = 5000, typeFilter: string = 'all'): Promise<Place[]> => {

  try {

    const response = await axios.post('/api/places/nearby', { lat, lon, radius, type: typeFilter });

    const elements: APIPlace[] = response.data.elements || [];



    return elements.map((el: APIPlace) => {

      // Use the explicit type from server

      const type = (el.tags.type || 'attraction') as Place['type'];

      

      const image = el.tags.image || `https://images.unsplash.com/photo-${

        type === 'hotel' ? '1566073771259-6a8506099945' : 

        type === 'restaurant' ? '1517248135467-4c7edcad34c4' : 

        '1467269204594-9661b134dd2b'

      }?auto=format&fit=crop&w=800&q=80&sig=${el.id}`;



      return {

        id: el.id.toString(),

        name: el.tags.name,

        lat: el.lat,

        lon: el.lon,

        type,

        address: el.tags.address || el.tags['addr:street'] || 'Nearby Location',

        rating: el.tags.rating || 4.0,

        price: el.tags.price || 1000,

        image,

        tags: el.tags.tags

      };

    });

  } catch (error) {

    console.error('Error fetching places:', error);

    return [];

  }

};

