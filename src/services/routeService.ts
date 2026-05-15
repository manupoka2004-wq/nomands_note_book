import axios from 'axios';

export interface RouteData {
  geometry: [number, number][];
  distance: number; // in km
  duration: number; // in minutes
}

export const getRoute = async (start: [number, number], end: [number, number]): Promise<RouteData> => {
  try {
    // Using OSRM as a reliable free alternative to OpenRouteService for demo purposes
    // OSRM format: lon,lat;lon,lat
    const response = await axios.get(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}`, {
      params: {
        overview: 'full',
        geometries: 'geojson',
      }
    });

    if (!response.data.routes || response.data.routes.length === 0) {
      throw new Error('No route found');
    }

    const route = response.data.routes[0];
    
    // OSRM returns coordinates as [lon, lat], Leaflet needs [lat, lon]
    const geometry = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
    const distance = route.distance / 1000; // convert to km
    const duration = route.duration / 60; // convert to minutes

    return {
      geometry,
      distance,
      duration
    };
  } catch (error) {
    console.error('Routing error:', error);
    throw new Error('Failed to calculate route. Please try again.');
  }
};
