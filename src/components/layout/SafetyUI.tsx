
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  Phone, 
  X, 
  Camera, 
  Mic, 
  MapPin, 
  Share2, 
  Shield, 
  UserPlus, 
  Trash2,
  PhoneCall,
  Volume2,
  VolumeX,
  Radio,
  Timer,
  ShieldAlert,
  Settings,
  Plus,
  Stethoscope,
  Activity,
  Eye,
  EyeOff,
  Navigation2,
  Heart,
  Building2
} from 'lucide-react';
import { useSafety } from '../SafetyProvider';
import SafetyMap from '../SafetyMap';

export const SafetySOSButton: React.FC = () => {
  const { triggerSOS, isEmergency, isSafetyTimerActive, safetyTimerSeconds, cancelSafetyTimer } = useSafety();

  if (isEmergency) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end space-y-4">
      <AnimatePresence>
        {isSafetyTimerActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-white p-4 rounded-3xl shadow-2xl border-2 border-red-500 flex items-center space-x-3"
          >
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 font-black text-xl">
              {safetyTimerSeconds}
            </div>
            <div>
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">SOS Timer Active</p>
              <button 
                onClick={cancelSafetyTimer}
                className="text-xs font-bold text-slate-500 hover:text-red-600"
              >
                Cancel SOS
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={triggerSOS}
        className="w-16 h-16 bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white animate-pulse"
        title="SOS - Emergency"
      >
        <AlertTriangle size={32} />
      </motion.button>
    </div>
  );
};

export const SafetyDashboard: React.FC = () => {
  const { 
    isEmergency, 
    isRecording, 
    currentLocation, 
    stopSOS, 
    contacts, 
    addContact, 
    removeContact,
    isFakeCallActive,
    triggerFakeCall,
    stopFakeCall,
    isSafetyTimerActive,
    startSafetyTimer,
    cancelSafetyTimer,
    safetyTimerSeconds,
    riskLevel,
    privacyMode,
    setPrivacyMode
  } = useSafety();
  
  const [showContacts, setShowContacts] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [isMuted, setIsMuted] = useState(false);
  const [showSafetyHub, setShowSafetyHub] = useState(false);
  const [showSafetyMap, setShowSafetyMap] = useState(false);

  useEffect(() => {
    if (isEmergency) {
      const interval = setInterval(() => {
        document.body.style.backgroundColor = document.body.style.backgroundColor === 'red' ? 'white' : 'red';
      }, 500);
      return () => {
        document.body.style.backgroundColor = '';
        clearInterval(interval);
      };
    }
  }, [isEmergency]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newContact.name && newContact.phone) {
      await addContact(newContact.name, newContact.phone);
      setNewContact({ name: '', phone: '' });
    }
  };

  return (
    <>
      {/* Safety Hub Button */}
      {!isEmergency && (
        <button 
          onClick={() => setShowSafetyHub(true)}
          className="fixed bottom-24 left-6 z-50 w-16 h-16 bg-white text-slate-900 rounded-full shadow-2xl flex items-center justify-center border-4 border-slate-100 hover:bg-slate-50 transition-all"
          title="Safety Hub"
        >
          <ShieldAlert size={32} className="text-indigo-600" />
        </button>
      )}

      {/* Safety Hub Modal */}
      <AnimatePresence>
        {showSafetyHub && (
          <div className="fixed inset-0 z-100 flex items-end justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full max-w-md bg-white rounded-t-[3rem] p-8 space-y-8"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                    <Shield size={24} />
                  </div>
                  <h2 className="text-2xl font-black">Safety Hub</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-1 ${
                    riskLevel === 'High' ? 'bg-red-100 text-red-600' : 
                    riskLevel === 'Medium' ? 'bg-amber-100 text-amber-600' : 
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    <Activity size={10} />
                    <span>{riskLevel} Risk</span>
                  </div>
                  <button 
                    onClick={() => setShowSafetyHub(false)} 
                    className="p-2 bg-slate-100 rounded-xl"
                    title="Close Safety Hub"
                    aria-label="Close Safety Hub"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Privacy Control */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-600 border border-slate-200">
                    {privacyMode === 'exact' ? <Eye size={16} /> : <EyeOff size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Privacy Mode</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{privacyMode} Location</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                    <button 
                      onClick={() => setPrivacyMode('exact')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${privacyMode === 'exact' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500'}`}
                    >
                      Exact
                    </button>
                    <button 
                      onClick={() => setPrivacyMode('blurred')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${privacyMode === 'blurred' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500'}`}
                    >
                      Blurred
                    </button>
                  </div>
                  <button 
                    onClick={() => setShowSafetyHub(false)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                    title="Exit Privacy Mode"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => {
                    setShowSafetyMap(true);
                    setShowSafetyHub(false);
                  }}
                  className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center space-y-3 hover:border-indigo-200 transition-all"
                  title="Open Safety Map"
                  aria-label="Open Safety Map"
                >
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <MapPin size={24} />
                  </div>
                  <span className="font-black text-sm">Safety Map</span>
                </button>

                <button 
                  onClick={() => {
                    triggerFakeCall();
                    setShowSafetyHub(false);
                  }}
                  className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center space-y-3 hover:border-indigo-200 transition-all"
                  title="Trigger Fake Call"
                  aria-label="Trigger Fake Call"
                >
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center">
                    <PhoneCall size={24} />
                  </div>
                  <span className="font-black text-sm">Fake Call</span>
                </button>

                <button 
                  onClick={() => {
                    startSafetyTimer(30);
                    setShowSafetyHub(false);
                  }}
                  className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center space-y-3 hover:border-red-200 transition-all"
                  title="Start 30s SOS Timer"
                  aria-label="Start 30s SOS Timer"
                >
                  <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center">
                    <Timer size={24} />
                  </div>
                  <span className="font-black text-sm">30s SOS Timer</span>
                </button>
              </div>

              {/* Smart Check-in Presets */}
              <div className="space-y-3">
                <h3 className="font-black text-slate-900 text-sm flex items-center">
                  <Timer size={16} className="mr-2 text-indigo-600" />
                  Smart Check-in
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[15, 30, 60].map(mins => (
                    <button
                      key={mins}
                      onClick={() => {
                        startSafetyTimer(mins * 60);
                        setShowSafetyHub(false);
                      }}
                      className="py-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-black hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Emergency Info Panel */}
              <div className="space-y-3">
                <h3 className="font-black text-slate-900 text-sm flex items-center">
                  <Heart size={16} className="mr-2 text-red-600" />
                  Emergency Services
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => window.open('tel:100', '_self')}
                    className="flex flex-col items-center p-3 bg-red-50 rounded-2xl border border-red-100 text-red-600 hover:bg-red-100 transition-all"
                  >
                    <Shield size={20} />
                    <span className="text-[10px] font-black mt-1">Police</span>
                  </button>
                  <button 
                    onClick={() => window.open('tel:102', '_self')}
                    className="flex flex-col items-center p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600 hover:bg-emerald-100 transition-all"
                  >
                    <Stethoscope size={20} />
                    <span className="text-[10px] font-black mt-1">Ambulance</span>
                  </button>
                  <button 
                    onClick={() => {
                      const url = `https://www.google.com/maps/search/hospital/@${currentLocation?.lat},${currentLocation?.lng}`;
                      window.open(url, '_blank');
                    }}
                    className="flex flex-col items-center p-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-600 hover:bg-indigo-100 transition-all"
                  >
                    <Building2 size={20} />
                    <span className="text-[10px] font-black mt-1">Hospital</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-slate-900">Emergency Contacts</h3>
                  <button 
                    onClick={() => setShowContacts(!showContacts)} 
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"
                    title={showContacts ? "Hide Add Contact Form" : "Show Add Contact Form"}
                    aria-label={showContacts ? "Hide Add Contact Form" : "Show Add Contact Form"}
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {showContacts && (
                  <form onSubmit={handleAddContact} className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <input 
                      type="text" 
                      placeholder="Name" 
                      value={newContact.name}
                      onChange={e => setNewContact({...newContact, name: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <input 
                      type="text" 
                      placeholder="Phone" 
                      value={newContact.phone}
                      onChange={e => setNewContact({...newContact, phone: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold">
                      Add Contact
                    </button>
                  </form>
                )}

                <div className="space-y-2">
                  {contacts.map((contact: any) => (
                    <div key={contact.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-900">{contact.name}</p>
                        <p className="text-xs text-slate-500">{contact.phone}</p>
                      </div>
                      <button 
                        onClick={() => removeContact(contact.id)} 
                        className="text-red-500 p-2 hover:bg-red-50 rounded-lg"
                        title={`Remove ${contact.name} from emergency contacts`}
                        aria-label={`Remove ${contact.name} from emergency contacts`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEmergency && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-red-600 flex flex-col p-6 text-white overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600">
                  <Shield size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black">EMERGENCY MODE</h2>
                  <p className="text-red-100 text-xs font-bold uppercase tracking-widest">Live Evidence Capture Active</p>
                </div>
              </div>
              <button 
                onClick={stopSOS}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                title="Stop SOS"
              >
                <X size={24} />
              </button>
            </div>

            {/* Status Indicators */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/10 p-4 rounded-3xl border border-white/20 flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-400 animate-ping' : 'bg-slate-400'}`}></div>
                <span className="font-bold text-sm">Recording {isRecording ? '🔴' : '⚪'}</span>
              </div>
              <div className="bg-white/10 p-4 rounded-3xl border border-white/20 flex items-center space-x-3">
                <MapPin size={18} className={currentLocation ? 'text-emerald-400' : 'text-white'} />
                <span className="font-bold text-sm">GPS: {currentLocation ? 'Active' : 'Searching...'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              <button 
                onClick={triggerFakeCall}
                className="w-full py-6 bg-white text-red-600 rounded-[2rem] font-black text-xl flex items-center justify-center space-x-3 shadow-xl"
                title="Trigger Fake Call"
                aria-label="Trigger Fake Call"
              >
                <PhoneCall size={28} />
                <span>Trigger Fake Call</span>
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="py-4 bg-white/20 rounded-2xl font-bold flex items-center justify-center space-x-2"
                  title={isMuted ? "Unmute Alarm" : "Mute Alarm"}
                  aria-label={isMuted ? "Unmute Alarm" : "Mute Alarm"}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  <span>{isMuted ? 'Unmute' : 'Mute Alarm'}</span>
                </button>
                <button 
                  onClick={() => {
                    const message = `🚨 EMERGENCY! I feel unsafe. Location: https://www.google.com/maps?q=${currentLocation?.lat},${currentLocation?.lng}`;
                    const smsUrl = `sms:${contacts.map((c: any) => c.phone).join(',')}?body=${encodeURIComponent(message)}`;
                    window.open(smsUrl, '_blank');
                  }}
                  className="py-4 bg-white/20 rounded-2xl font-bold flex items-center justify-center space-x-2"
                  title="SMS Fallback"
                >
                  <Share2 size={20} />
                  <span>SMS Fallback</span>
                </button>
              </div>
            </div>

            {/* Contacts Section */}
            <div className="bg-white/10 p-6 rounded-[2.5rem] border border-white/20 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-lg">Trusted Contacts</h3>
                <button 
                  onClick={() => setShowContacts(!showContacts)}
                  className="p-2 bg-white/20 rounded-lg"
                  title="Add Contact"
                >
                  <UserPlus size={20} />
                </button>
              </div>
              
              <div className="space-y-3">
                {contacts.map((contact: any) => (
                  <div key={contact.id} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div>
                      <p className="font-bold">{contact.name}</p>
                      <p className="text-xs text-red-100">{contact.phone}</p>
                    </div>
                    <div className="flex space-x-2">
                      <a href={`tel:${contact.phone}`} className="p-2 bg-emerald-500 rounded-lg" title={`Call ${contact.name}`}>
                        <Phone size={16} />
                      </a>
                      <button onClick={() => removeContact(contact.id)} className="p-2 bg-red-500/50 rounded-lg" title="Remove Contact">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {showContacts && (
                <form onSubmit={handleAddContact} className="mt-4 space-y-3 p-4 bg-white/10 rounded-2xl border border-white/10">
                  <input 
                    type="text" 
                    placeholder="Name" 
                    value={newContact.name}
                    onChange={e => setNewContact({...newContact, name: e.target.value})}
                    className="w-full bg-white/20 border border-white/20 rounded-xl px-4 py-2 text-white placeholder:text-white/50 outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Phone (e.g. +91...)" 
                    value={newContact.phone}
                    onChange={e => setNewContact({...newContact, phone: e.target.value})}
                    className="w-full bg-white/20 border border-white/20 rounded-xl px-4 py-2 text-white placeholder:text-white/50 outline-none"
                  />
                  <button type="submit" className="w-full py-2 bg-white text-red-600 rounded-xl font-bold">
                    Add Contact
                  </button>
                </form>
              )}
            </div>

            {/* Camera Preview (Mock) */}
            <div className="mt-auto">
              <div className="aspect-video bg-black rounded-3xl border-4 border-white/20 overflow-hidden relative">
                <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full">
                  <Radio size={14} className="animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Live Feed</span>
                </div>
                <div className="w-full h-full flex items-center justify-center text-white/20">
                  <Camera size={64} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fake Call Overlay */}
      <AnimatePresence>
        {isFakeCallActive && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed inset-0 z-200 bg-slate-900 flex flex-col items-center justify-between py-20 text-white"
          >
            <div className="text-center">
              <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-slate-700">
                <Phone size={64} className="text-emerald-400 animate-pulse" />
              </div>
              <h2 className="text-3xl font-black mb-2">Police Dispatch</h2>
              <p className="text-emerald-400 font-bold uppercase tracking-widest animate-pulse">Incoming Emergency Call...</p>
            </div>

            <div className="flex space-x-20">
              <button 
                onClick={stopFakeCall}
                className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/20"
                title="Decline Fake Call"
              >
                <X size={32} />
              </button>
              <button 
                onClick={stopFakeCall}
                className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/20 animate-bounce"
                title="Accept Fake Call"
              >
                <Phone size={32} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showSafetyMap && currentLocation && (
        <SafetyMap 
          center={currentLocation} 
          onClose={() => setShowSafetyMap(false)} 
        />
      )}
    </>
  );
};
