
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'motion/react';
import { Shield, Clock, MapPin, Camera, Video, Mic, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { EmergencyEvent, TrackingPoint } from '@/types/safety';

// Fix Leaflet icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  map.setView(center, 15);
  return null;
};

export default function EmergencyTracking() {
  const [event, setEvent] = useState<EmergencyEvent | null>(null);
  const [tracking, setTracking] = useState<TrackingPoint[]>([]);
  const [timeline, setTimeline] = useState<EmergencyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const eventId = window.location.pathname.split('/').pop();

  useEffect(() => {
    if (!eventId) return;

    const fetchData = async () => {
      // Fetch initial event
      const { data: eventData } = await supabase
        .from('emergency_events')
        .select('*')
        .eq('id', eventId)
        .single();
      
      if (eventData) {
        setEvent(eventData);
        fetchTracking(eventData.user_id);
        fetchTimeline(eventData.user_id);
      }
      setLoading(false);
    };

    fetchData();

    // Real-time tracking updates
    const channel = supabase
      .channel('live_tracking')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'live_tracking'
      }, (payload) => {
        if (event && payload.new.user_id === event.user_id) {
          setTracking(prev => [...prev, payload.new as TrackingPoint]);
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'emergency_events'
      }, (payload) => {
        if (event && payload.new.user_id === event.user_id) {
          setTimeline(prev => [payload.new as EmergencyEvent, ...prev]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, event?.user_id]);

  const fetchTracking = async (userId: string) => {
    const { data } = await supabase
      .from('live_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });
    if (data) setTracking(data);
  };

  const fetchTimeline = async (userId: string) => {
    const { data } = await supabase
      .from('emergency_events')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    if (data) setTimeline(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={64} className="text-red-600 mb-6" />
        <h1 className="text-3xl font-black text-white mb-2">Event Not Found</h1>
        <p className="text-slate-400">This emergency link may have expired or is invalid.</p>
      </div>
    );
  }

  const currentPos = tracking.length > 0 
    ? [tracking[tracking.length - 1].lat, tracking[tracking.length - 1].lng] as [number, number]
    : [event.lat, event.lng] as [number, number];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Sidebar - Timeline */}
      <div className="w-full lg:w-96 bg-white border-r border-slate-200 flex flex-col h-screen lg:sticky lg:top-0">
        <div className="p-6 bg-red-600 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <Shield size={24} />
            <h1 className="text-xl font-black">Live Tracking</h1>
          </div>
          <p className="text-red-100 text-xs font-bold uppercase tracking-widest">Emergency Evidence Portal</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center">
              <Clock size={14} className="mr-2" />
              Emergency Timeline
            </h3>
            
            {timeline.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative pl-6 pb-6 border-l-2 border-slate-100 last:pb-0"
              >
                <div className="absolute -left-2.25 top-0 w-4 h-4 bg-white border-2 border-red-600 rounded-full"></div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                    {item.media_type === 'photo' && <Camera size={14} className="text-indigo-500" />}
                    {item.media_type === 'video' && <Video size={14} className="text-red-500" />}
                  </div>
                  <p className="text-sm font-bold text-slate-900 mb-2">
                    {item.event_type === 'sos_triggered' ? '🔴 SOS Triggered' : 
                     item.event_type === 'media_captured' ? `Captured ${item.media_type}` : 
                     '📍 Location Updated'}
                  </p>
                  {item.media_url && (
                    <a 
                      href={item.media_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center text-indigo-600 hover:bg-indigo-50 transition-all"
                    >
                      View Evidence
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Map */}
      <div className="flex-1 h-[60vh] lg:h-screen relative">
        <MapContainer 
          center={currentPos} 
          zoom={15} 
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeView center={currentPos} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Tracking Path */}
          <Polyline 
            positions={tracking.map(p => [p.lat, p.lng])} 
            color="#ef4444" 
            weight={4} 
            dashArray="10, 10"
          />

          {/* Current Position Marker */}
          <Marker position={currentPos}>
            <Popup>
              <div className="text-center">
                <p className="font-black text-red-600">Current Location</p>
                <p className="text-xs text-slate-500">{new Date().toLocaleTimeString()}</p>
              </div>
            </Popup>
          </Marker>

          {/* SOS Trigger Point */}
          <Marker position={[event.lat, event.lng]}>
            <Popup>
              <div className="text-center">
                <p className="font-black text-slate-900">SOS Triggered Here</p>
                <p className="text-xs text-slate-500">{new Date(event.timestamp).toLocaleTimeString()}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Floating Status Card */}
        <div className="absolute top-6 right-6 z-1000 bg-white p-4 rounded-2xl shadow-2xl border border-slate-200 flex items-center space-x-4">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white animate-pulse">
            <Radio size={20} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Live Status</p>
            <p className="text-sm font-black text-slate-900">Tracking Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const Radio = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
    <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4" />
    <circle cx="12" cy="12" r="2" />
    <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4" />
    <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" />
  </svg>
);
