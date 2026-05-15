
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shield, Stethoscope, Navigation2, X } from 'lucide-react';

// Fix for default leaflet icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface SafetyMapProps {
  center: { lat: number; lng: number };
  onClose: () => void;
}

const SafetyMap: React.FC<SafetyMapProps> = ({ center, onClose }) => {
  // Mock nearby safe places
  const safePlaces = [
    { id: 1, name: 'Police Station', type: 'police', lat: center.lat + 0.005, lng: center.lng + 0.005 },
    { id: 2, name: 'City Hospital', type: 'hospital', lat: center.lat - 0.004, lng: center.lng + 0.003 },
    { id: 3, name: 'Safe Haven Community Center', type: 'safe', lat: center.lat + 0.002, lng: center.lng - 0.006 },
  ];

  const policeIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #4f46e5; color: white; padding: 8px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  const hospitalIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #ef4444; color: white; padding: 8px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="m3.34 19 1.4-1.4"/><path d="D19.07 4.93 17.66 6.34"/><path d="m14.19 19.07-1.41-1.41"/><path d="m19.07 14.19-1.41-1.41"/><path d="m9.81 19.07 1.41-1.41"/><path d="m4.93 4.93 1.41 1.41"/><path d="m4.93 9.81 1.41 1.41"/><circle cx="12" cy="12" r="10"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  const safeIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #10b981; color: white; padding: 8px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  return (
    <div className="fixed inset-0 z-200 bg-white flex flex-col">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Safety Map</h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Nearby Safe Locations</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-all"
          title="Close safety map"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 relative">
        <MapContainer 
          center={[center.lat, center.lng]} 
          zoom={15} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <Marker position={[center.lat, center.lng]}>
            <Popup>You are here</Popup>
          </Marker>

          {safePlaces.map(place => (
            <Marker 
              key={place.id} 
              position={[place.lat, place.lng]}
              icon={place.type === 'police' ? policeIcon : place.type === 'hospital' ? hospitalIcon : safeIcon}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-black text-slate-900 mb-1">{place.name}</p>
                  <button 
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
                      window.open(url, '_blank');
                    }}
                    className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-2"
                    title={`Navigate to ${place.name}`}
                  >
                    <Navigation2 size={12} />
                    <span>Navigate</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="absolute bottom-6 left-6 right-6 z-1000 space-y-3">
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-900 text-sm">Legend</h3>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <span className="text-[10px] font-bold text-slate-600">Police</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-[10px] font-bold text-slate-600">Hospital</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  <span className="text-[10px] font-bold text-slate-600">Safe Zone</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => {
                const nearest = safePlaces[0]; // Simple mock logic
                const url = `https://www.google.com/maps/dir/?api=1&destination=${nearest.lat},${nearest.lng}`;
                window.open(url, '_blank');
              }}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm flex items-center justify-center space-x-3 shadow-xl shadow-indigo-200"
              title="Navigate to nearest safe place"
            >
              <Navigation2 size={20} />
              <span>Navigate to Nearest Safe Place</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyMap;
