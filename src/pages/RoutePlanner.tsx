import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  ArrowRight, 
  Clock, 
  Route as RouteIcon, 
  Loader2, 
  TrendingUp, 
  Map as MapIcon, 
  Sparkles,
  ChevronRight,
  Zap,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getNearbyRoutePlaces } from '../lib/gemini';
import toast from 'react-hot-toast';
import { Page } from '../types';

// Fix Leaflet icon issue
const icons = {
  start: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
  }),
  end: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
  }),
  waypoint: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    iconSize: [20, 32],
    iconAnchor: [10, 32],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [32, 32]
  })
};

function ChangeView({ center, zoom, bounds }: { center: [number, number], zoom: number, bounds?: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView(center, zoom);
    }
  }, [center, zoom, bounds, map]);
  return null;
}

export default function RoutePlanner({ setActivePage }: { setActivePage: (page: Page) => void }) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);
  const [waypoints, setWaypoints] = useState<any[]>([]);
  const [visiblePlacesCount, setVisiblePlacesCount] = useState(6);
  const [coords, setCoords] = useState<{start: [number, number], end: [number, number]} | null>(null);

  const routeData = routes[activeRouteIndex] || null;

  // Parse query params on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const src = params.get('source');
    const dest = params.get('destination');
    if (src) setSource(src);
    if (dest) setDestination(dest);
    
    if (src && dest) {
      handleCalculate(src, dest);
    }
  }, []);

  const geocode = async (query: string): Promise<[number, number] | null> => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await res.json();
      if (data && data[0]) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const fetchPlacesAlongRoute = async (geometry: [number, number][]) => {
    setLoadingPlaces(true);
    try {
      // Sample 25 points for better coverage while staying within performance limits
      const pointsCount = 25;
      const sampled = [];
      if (geometry.length <= pointsCount) {
        sampled.push(...geometry);
      } else {
        const step = Math.floor(geometry.length / (pointsCount - 1));
        for (let i = 0; i < pointsCount - 1; i++) {
          sampled.push(geometry[i * step]);
        }
        sampled.push(geometry[geometry.length - 1]);
      }

      const categories = 'tourism.attraction,tourism.sights,entertainment.museum,beach,religion.place_of_worship,natural.water,natural.mountain';
      
      const requests = sampled.map(pt => 
        fetch('/api/places/nearby', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: pt[0], lon: pt[1], radius: 5000, categories })
        }).then(r => r.json()).catch(() => [])
      );

      const allResults = await Promise.all(requests);
      const flatResults = allResults.flatMap((r: any) => r.elements || []);
      
      // Map to consistent structure
      const mappedResults = flatResults.map((p: any) => ({
        id: p.id,
        name: p.tags?.name || 'Unknown Place',
        lat: p.lat,
        lon: p.lon,
        type: p.tags?.type || p.tags?.tourism || p.tags?.amenity || (p.tags?.historic ? 'landmark' : 'attraction'),
        address: p.tags?.address || p.tags?.['addr:street'] || 'Nearby',
        rating: p.tags?.rating || 0
      }));

      // Deduplicate by name and ID
      const seen = new Set();
      const uniquePlaces = mappedResults.filter((p: any) => {
        if (!p.name || seen.has(p.name.toLowerCase())) return false;
        seen.add(p.name.toLowerCase());
        return true;
      });

      // Filter by rating OR specific "famous" categories
      const highQuality = uniquePlaces.filter((p: any) => 
        p.rating >= 4.0 || 
        ['attraction', 'landmark', 'museum', 'temple', 'sights', 'monument'].some(cat => 
          p.type?.toLowerCase().includes(cat) || p.name?.toLowerCase().includes(cat)
        )
      );

      setWaypoints(highQuality.sort((a, b) => b.rating - a.rating));
    } catch (error) {
      console.error("Place fetching failed", error);
    } finally {
      setLoadingPlaces(false);
    }
  };

  const handleCalculate = async (src?: string, dest?: string) => {
    const s = src || source;
    const d = dest || destination;
    
    if (!s || !d) {
      toast.error("Enter both source and destination");
      return;
    }

    setLoading(true);
    setWaypoints([]);
    setVisiblePlacesCount(6);
    try {
      const startCoord = await geocode(s);
      const endCoord = await geocode(d);

      if (!startCoord || !endCoord) {
        throw new Error("Could not find locations on map");
      }

      // OSRM Routing with alternatives
      const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${startCoord[1]},${startCoord[0]};${endCoord[1]},${endCoord[0]}?overview=full&geometries=geojson&alternatives=true`);
      const osrmData = await osrmRes.json();

      if (osrmData.routes && osrmData.routes.length > 0) {
        setCoords({ start: startCoord, end: endCoord });
        
        const processedRoutes = osrmData.routes.map((r: any, idx: number) => ({
          id: idx,
          distance: (r.distance / 1000).toFixed(1) + " km",
          time: Math.floor(r.duration / 3600) + "h " + Math.floor((r.duration % 3600) / 60) + "m",
          geometry: r.geometry.coordinates.map((c: any) => [c[1], c[0]]),
          summary: r.legs[0].summary || `Route ${idx + 1}`
        }));

        setRoutes(processedRoutes);
        setActiveRouteIndex(0);
        
        // Initial fetch for the first route
        fetchPlacesAlongRoute(processedRoutes[0].geometry);
        
        toast.success(`Found ${osrmData.routes.length} possible paths!`);
      }
    } catch (error: any) {
      toast.error(error.message || "Routing failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routes[activeRouteIndex]) {
      fetchPlacesAlongRoute(routes[activeRouteIndex].geometry);
    }
  }, [activeRouteIndex]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Navigation className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Map & Route Planner</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OSRM Optimized Navigation</p>
            </div>
          </div>
          <button 
            onClick={() => setActivePage('ai-planner')}
            className="flex items-center space-x-2 text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors"
          >
            <ArrowRight className="rotate-180" size={16} />
            <span>Back to AI Planner</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Control Sidebar */}
        <div className="lg:col-span-4 p-6 lg:p-8 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto custom-scrollbar">
          <div className="space-y-8">
            <section className="space-y-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                <RouteIcon className="text-emerald-600 mr-2" size={18} />
                Routing Controls
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Point</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="Source location"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-center -my-2">
                  <div className="w-8 h-8 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center border border-white">
                    <Zap size={14} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="Target location"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-sm"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => handleCalculate()}
                  disabled={loading}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center space-x-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Optimizing...</span>
                    </>
                  ) : (
                    <>
                      <Navigation size={18} />
                      <span>Calculate All Routes</span>
                    </>
                  )}
                </button>
              </div>
            </section>

            <AnimatePresence>
              {routes.length > 0 && (
                <motion.section 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 pt-6 border-t border-slate-100"
                >
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Route Alternatives</p>
                    <div className="grid grid-cols-1 gap-2">
                      {routes.map((r, idx) => (
                        <button
                          key={r.id}
                          onClick={() => setActiveRouteIndex(idx)}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            activeRouteIndex === idx 
                              ? 'bg-emerald-50 border-emerald-500/50 shadow-sm' 
                              : 'bg-white border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-sm text-slate-900">{r.summary}</span>
                            {activeRouteIndex === idx && <Sparkles size={14} className="text-emerald-500" />}
                          </div>
                          <div className="flex items-center space-x-4 text-xs font-bold text-slate-500">
                            <span className="flex items-center"><MapIcon size={12} className="mr-1" /> {r.distance}</span>
                            <span className="flex items-center"><Clock size={12} className="mr-1" /> {r.time}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16" />
                    <h4 className="text-sm font-black mb-4 flex items-center relative z-10">
                      <Sparkles size={16} className="mr-2 text-emerald-400" />
                      On-Way Famous Places
                    </h4>
                    
                    {loadingPlaces ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-3">
                        <Loader2 className="animate-spin text-emerald-400" size={24} />
                        <p className="text-xs font-bold text-slate-400">Scanning route segments...</p>
                      </div>
                    ) : waypoints.length > 0 ? (
                      <div className="space-y-3 relative z-10">
                        {waypoints.slice(0, visiblePlacesCount).map((p, idx) => (
                          <div key={idx} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 font-black text-xs">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-black truncate">{p.name}</h5>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate">{p.type} • {p.rating.toFixed(1)} ★</p>
                            </div>
                          </div>
                        ))}
                        {visiblePlacesCount < waypoints.length && (
                          <button 
                            onClick={() => setVisiblePlacesCount(prev => prev + 6)}
                            className="w-full py-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors"
                          >
                            Show More Places (+{waypoints.length - visiblePlacesCount})
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-slate-500 italic py-4">No top-rated places found nearby.</p>
                    )}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {!routeData && !loading && (
              <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl">
                <div className="flex items-start space-x-3 text-amber-700">
                  <Info size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight">How it works</h4>
                    <p className="text-xs font-bold mt-1 opacity-80 leading-relaxed">
                      Enter your locations to find the mathematically shortest driving path. We use OpenStreetMap data to compute distances instantly.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map View Section */}
        <div className="lg:col-span-8 bg-slate-200 relative h-125 lg:h-auto">
          {!coords ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/50 backdrop-blur-sm z-10 p-12 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner mb-6">
                <MapIcon className="text-slate-300" size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Map Navigator</h3>
              <p className="text-slate-500 font-medium max-w-sm mt-3">
                Calculated routes will appear here in real-time.
              </p>
            </div>
          ) : (
            <MapContainer 
              center={coords.start} 
              zoom={7} 
              className="h-full w-full z-0"
              zoomControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <ChangeView 
                center={coords.start} 
                zoom={7} 
                bounds={L.latLngBounds([
                  coords.start, 
                  coords.end, 
                  ...(waypoints?.map((w: any) => [w.lat, w.lon] as [number, number]) || [])
                ])} 
              />
              
              <Marker position={coords.start} icon={icons.start}>
                <Popup><span className="font-black text-xs">Start: {source}</span></Popup>
              </Marker>
              
              <Marker position={coords.end} icon={icons.end}>
                <Popup><span className="font-black text-xs">Destination: {destination}</span></Popup>
              </Marker>

              {waypoints?.map((wp: any, i: number) => (
                <Marker key={i} position={[wp.lat, wp.lon]} icon={icons.waypoint}>
                  <Popup>
                    <div className="p-1 min-w-37.5">
                      <span className="font-black text-base text-indigo-600 block">{wp.name}</span>
                      <div className="flex items-center space-x-2 mt-1 mb-2">
                        <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full uppercase">{wp.type}</span>
                        <span className="text-[10px] font-black text-amber-500">{wp.rating.toFixed(1)} ★</span>
                      </div>
                      <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic border-l-2 border-slate-200 pl-2">{wp.address}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {routeData?.geometry && (
                <Polyline 
                  positions={routeData.geometry} 
                  color="#10b981" 
                  weight={6} 
                  opacity={0.8}
                />
              )}
            </MapContainer>
          )}

          {/* Map Controls */}
          <div className="absolute top-6 right-6 flex flex-col space-y-2 z-10">
            <button className="w-10 h-10 bg-white text-slate-900 rounded-xl shadow-lg border border-slate-100 flex items-center justify-center font-black hover:bg-slate-50 transition-all">+</button>
            <button className="w-10 h-10 bg-white text-slate-900 rounded-xl shadow-lg border border-slate-100 flex items-center justify-center font-black hover:bg-slate-50 transition-all">-</button>
          </div>
        </div>
      </div>
    </div>
  );
}
