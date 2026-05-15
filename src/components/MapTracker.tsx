// Map Tracker Component - Real-time Location Tracking
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io, Socket } from 'socket.io-client';
import { Navigation, MapPin, User, Info, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Fix Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for different roles
const driverIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
    iconSize: [35, 35],
    iconAnchor: [17, 17],
});

const userIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    iconSize: [35, 35],
    iconAnchor: [17, 17],
});

interface LocationData {
    id: string;
    lat: number;
    lng: number;
    name: string;
    role: 'user' | 'driver';
    timestamp: number;
}

// Component to handle map centering
function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

export default function MapTracker({ user }: { user: any }) {
    const [locations, setLocations] = useState<Map<string, LocationData>>(new Map());
    const [center, setCenter] = useState<[number, number]>([12.9716, 77.5946]); // Default to Bangalore
    const [isTracking, setIsTracking] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');
    const watchId = useRef<number | null>(null);

    useEffect(() => {
        const newSocket = io(window.location.origin);
        setSocket(newSocket);

        newSocket.on('driver:location_changed', (data: any) => {
            setLocations(prev => {
                const next = new Map(prev);
                next.set(data.driverId || data.id, {
                    id: data.driverId || data.id,
                    lat: data.lat,
                    lng: data.lng,
                    name: data.name || 'Driver',
                    role: 'driver',
                    timestamp: Date.now()
                });
                return next;
            });
        });

        // Cleanup stale locations every 30 seconds
        const interval = setInterval(() => {
            setLocations(prev => {
                const next = new Map(prev);
                const now = Date.now();
                for (const [id, data] of next.entries()) {
                    const locData = data as LocationData;
                    if (now - locData.timestamp > 60000 && id !== user?.email) {
                        next.delete(id);
                    }
                }
                return next;
            });
        }, 30000);

        return () => {
            newSocket.disconnect();
            clearInterval(interval);
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
            }
        };
    }, [user?.email]);

    const startTracking = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsTracking(true);
        watchId.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const newPos: [number, number] = [latitude, longitude];
                setCenter(newPos);
                
                // Update local state for self
                setLocations(prev => {
                    const next = new Map(prev);
                    next.set(user?.email || 'me', {
                        id: user?.email || 'me',
                        lat: latitude,
                        lng: longitude,
                        name: user?.name || 'Me',
                        role: user?.role === 'driver' ? 'driver' : 'user',
                        timestamp: Date.now()
                    });
                    return next;
                });

                // Emit to server if driver
                if (socket && user?.role === 'driver') {
                    socket.emit('driver:update_location', {
                        driverId: user.email,
                        lat: latitude,
                        lng: longitude,
                        name: user.name
                    });
                }
            },
            (error) => {
                console.error("Error tracking location:", error);
                setIsTracking(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const stopTracking = () => {
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
        setIsTracking(false);
    };

    return (
        <div className="h-[calc(100vh-12rem)] flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center">
                        <MapPin className="mr-3 text-indigo-600" size={32} />
                        Live Map Tracker
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">
                        Track active drivers and your own location in real-time.
                    </p>
                </div>
                
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setMapType(prev => prev === 'streets' ? 'satellite' : 'streets')}
                        className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all text-slate-600 flex items-center space-x-2"
                    >
                        <Layers size={20} />
                        <span className="font-bold text-sm uppercase tracking-wider">
                            {mapType === 'streets' ? 'Satellite' : 'Streets'}
                        </span>
                    </button>
                    
                    <button
                        onClick={isTracking ? stopTracking : startTracking}
                        className={`px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center space-x-2 shadow-lg ${
                            isTracking 
                                ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-200' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                        }`}
                    >
                        {isTracking ? <RefreshCw className="animate-spin" size={18} /> : <Navigation size={18} />}
                        <span>{isTracking ? 'Stop Tracking' : 'Start Tracking'}</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-slate-200">
                <MapContainer 
                    center={center} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <ChangeView center={center} />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url={mapType === 'streets' 
                            ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        }
                    />
                    
                    {Array.from(locations.values()).map((loc: LocationData) => (
                        <Marker 
                            key={loc.id} 
                            position={[loc.lat, loc.lng]}
                            icon={loc.role === 'driver' ? driverIcon : userIcon}
                        >
                            <Popup>
                                <div className="p-2 min-w-37.5">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className={`w-2 h-2 rounded-full animate-pulse ${loc.role === 'driver' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                                        <span className="font-black text-slate-900 uppercase tracking-wider text-xs">
                                            {loc.role}
                                        </span>
                                    </div>
                                    <p className="font-bold text-slate-700 text-sm">{loc.name}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        Last updated: {new Date(loc.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {isTracking && (
                        <Circle 
                            center={center} 
                            radius={500} 
                            pathOptions={{ color: '#4f46e5', fillColor: '#4f46e5', fillOpacity: 0.1 }} 
                        />
                    )}
                </MapContainer>

                {/* Overlay Info */}
                <div className="absolute bottom-6 left-6 z-1000 flex flex-col space-y-2">
                    <div className="glass-panel p-4 rounded-2xl border border-white/40 flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <img src="https://cdn-icons-png.flaticon.com/512/3063/3063822.png" className="w-6 h-6" alt="Driver" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Drivers: {Array.from(locations.values()).filter((l: any) => l.role === 'driver').length}</span>
                        </div>
                        <div className="w-px h-4 bg-slate-200" />
                        <div className="flex items-center space-x-2">
                            <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" className="w-6 h-6" alt="User" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Users: {Array.from(locations.values()).filter((l: any) => l.role === 'user').length}</span>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {!isTracking && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-1001 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center"
                        >
                            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm text-center">
                                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Navigation size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">Location Tracking Off</h3>
                                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                    Enable tracking to see your position on the map and share your location with others.
                                </p>
                                <button 
                                    onClick={startTracking}
                                    className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                                >
                                    Enable Tracking
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
