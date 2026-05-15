import React from 'react';
import { Shield, Phone, AlertTriangle, X, Home, MapPin, User, Activity, HelpCircle } from 'lucide-react';
import { EmergencyContact } from '../types/soloCircles';

interface SafetyEmergencyProps {
  contacts: EmergencyContact[];
  onAddContact: (contact: EmergencyContact) => void;
}

export const SafetyEmergency: React.FC<SafetyEmergencyProps> = ({ contacts, onAddContact }) => {
  const handleExit = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const message = `🚨 Emergency Location: https://maps.google.com/?q=${latitude},${longitude}`;
        if (navigator.share) {
          navigator.share({
            title: 'Emergency Location',
            text: message
          });
        } else {
          navigator.clipboard.writeText(message);
          alert('Location copied to clipboard!');
        }
      });
    }
  };

  const emergencyServices = [
    { name: 'Police', number: '100', icon: Shield, color: 'blue' },
    { name: 'Ambulance', number: '108', icon: Activity, color: 'red' },
    { name: 'Fire Brigade', number: '101', icon: AlertTriangle, color: 'orange' }
  ];

  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-[2rem] p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500 rounded-2xl text-white">
            <Shield size={24} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Safety & Emergency</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleGoHome}
            className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all"
            title="Go to Home"
          >
            <Home size={18} />
          </button>
          <button 
            onClick={handleExit}
            className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all"
            title="Exit Safety"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {contacts.map((contact, i) => (
          <div key={i} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
            <div>
              <p className="text-white font-bold">{contact.name}</p>
              <p className="text-xs text-slate-500 uppercase tracking-widest">{contact.relation}</p>
            </div>
            <a href={`tel:${contact.phone}`} title={`Call ${contact.name}`} className="p-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all">
              <Phone size={18} />
            </a>
          </div>
        ))}
      </div>

      {/* Emergency Services */}
      <div className="mt-6">
        <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-4">Emergency Services</h3>
        <div className="grid grid-cols-3 gap-3">
          {emergencyServices.map((service, i) => (
            <a 
              key={i}
              href={`tel:${service.number}`}
              className={`bg-${service.color}-500/20 border border-${service.color}-500/30 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-${service.color}-500/30 transition-all`}
              title={`Call ${service.name} (${service.number})`}
            >
              <service.icon size={24} className="text-white" />
              <span className="text-xs font-black text-white uppercase tracking-widest">{service.name}</span>
              <span className="text-[10px] text-slate-400">{service.number}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Additional Safety Actions */}
      <div className="mt-6">
        <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleShareLocation}
            className="bg-blue-500/20 border border-blue-500/30 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-blue-500/30 transition-all"
            title="Share your current location"
          >
            <MapPin size={24} className="text-white" />
            <span className="text-xs font-black text-white uppercase tracking-widest">Share Location</span>
          </button>
          <button 
            className="bg-purple-500/20 border border-purple-500/30 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-purple-500/30 transition-all"
            title="View safety tips"
          >
            <HelpCircle size={24} className="text-white" />
            <span className="text-xs font-black text-white uppercase tracking-widest">Safety Tips</span>
          </button>
        </div>
      </div>

      <button className="w-full mt-6 py-4 bg-red-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-red-500 transition-all shadow-lg shadow-red-600/20">
        <AlertTriangle size={18} /> SOS EMERGENCY
      </button>
    </div>
  );
};
