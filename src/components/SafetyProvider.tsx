
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { EmergencyContact, SafetyState } from '@/types/safety';

const SafetyContext = createContext<SafetyState | undefined>(undefined);

export const SafetyProvider: React.FC<{ children: React.ReactNode; user: any }> = ({ children, user }) => {
  const [isEmergency, setIsEmergency] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFakeCallActive, setIsFakeCallActive] = useState(false);
  const [isSafetyTimerActive, setIsSafetyTimerActive] = useState(false);
  const [safetyTimerSeconds, setSafetyTimerSeconds] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [privacyMode, setPrivacyMode] = useState<'exact' | 'blurred'>('exact');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const locationIntervalRef = useRef<any>(null);
  const safetyTimerIntervalRef = useRef<any>(null);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    // Load data from localStorage for offline support
    const savedContacts = localStorage.getItem('emergency_contacts');
    if (savedContacts) setContacts(JSON.parse(savedContacts));

    const savedLocation = localStorage.getItem('last_known_location');
    if (savedLocation) setCurrentLocation(JSON.parse(savedLocation));

    if (user) {
      fetchContacts(user.id);
      trackLogin(user);
    }
  }, [user]);

  // Basic Risk Detection Logic
  useEffect(() => {
    const calculateRisk = () => {
      const hour = new Date().getHours();
      const isNight = hour >= 20 || hour <= 5;
      
      // Mock "unknown area" check - in real app would check against travel plan
      const isUnknownArea = currentLocation === null;

      if (isNight) return 'High';
      if (isUnknownArea) return 'Medium';
      return 'Low';
    };

    setRiskLevel(calculateRisk());
    const interval = setInterval(() => setRiskLevel(calculateRisk()), 60000);
    return () => clearInterval(interval);
  }, [currentLocation]);

  const isUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const fetchContacts = async (userId: string) => {
    if (!isUUID(userId)) {
      if (!userId.startsWith('demo-')) {
        console.info(`[Safety] Using Local storage session: ${userId}`);
      }
      return;
    }
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      if (data) {
        setContacts(data);
        localStorage.setItem('emergency_contacts', JSON.stringify(data));
      }
    } catch (err) {
      console.warn('[Safety] Failed to fetch emergency contacts from Supabase. Using local storage.', err);
    }
  };

  const trackLogin = async (user: any) => {
    if (!navigator.geolocation || !user?.id || !isUUID(user.id)) {
      if (user?.id && !isUUID(user.id) && !user.id.startsWith('demo-')) {
        console.info(`[Safety] Local Session Tracked: ${user.id}`);
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const { error } = await supabase.from('login_history').insert({
          user_id: user.id,
          lat: latitude,
          lng: longitude,
          user_agent: navigator.userAgent
        });
        if (error) throw error;
      } catch (err) {
        console.warn('[Safety] Failed to track login in Supabase.', err);
      }
    });

    // Real-time alert for new logins
    try {
      const channel = supabase
        .channel('login_alerts')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'login_history',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          const { lat, lng, timestamp } = payload.new;
          const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
          alert(`⚠️ New login detected on your account!\nLocation: ${mapsLink}\nTime: ${new Date(timestamp).toLocaleString()}`);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('[Safety] Real-time login alerts disabled (Supabase connection error).');
    }
  };

  const triggerSOS = async () => {
    if (!user) {
      console.warn('[Safety] SOS triggered but no user found');
      // Fallback for unauthenticated users in emergency
      setIsEmergency(true);
      triggerPhysicalAlerts();
      return;
    }
    
    setIsEmergency(true);
    
    // Request Wake Lock to keep screen on
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (err) {
      console.error('Wake Lock failed:', err);
    }

    // Trigger immediate actions (don't wait for GPS)
    startRecording();
    capturePhoto();
    toggleFlashlight(true);
    triggerPhysicalAlerts();
    
    // 1. Capture Location
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const finalLat = privacyMode === 'blurred' ? latitude + (Math.random() - 0.5) * 0.01 : latitude;
        const finalLng = privacyMode === 'blurred' ? longitude + (Math.random() - 0.5) * 0.01 : longitude;
        
        setCurrentLocation({ lat: finalLat, lng: finalLng });
        localStorage.setItem('last_known_location', JSON.stringify({ lat: finalLat, lng: finalLng }));
        
        // Store SOS event
        const { data: event } = await supabase.from('emergency_events').insert({
          user_id: user.id,
          lat: finalLat,
          lng: finalLng,
          event_type: 'sos_triggered'
        }).select().single();

        // 2. Start Live Tracking
        startLiveTracking();

        // 3. Automated Alerts (SMS & Call)
        sendEmergencySMS(latitude, longitude);
        if (contacts.length > 0) {
          window.open(`tel:${contacts[0].phone}`, '_self');
        }

        // 4. Open WhatsApp
        openEmergencyWhatsApp(latitude, longitude, event?.id);
      },
      (error) => {
        console.error('[Safety] Geolocation failed:', error);
        // Still try to send alerts without location if possible
        sendEmergencySMS(0, 0); 
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const stopSOS = () => {
    setIsEmergency(false);
    stopRecording();
    stopLiveTracking();
    toggleFlashlight(false);
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  const triggerFakeCall = () => {
    setIsFakeCallActive(true);
    // Play ringtone
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
    audio.id = 'fake-call-ringtone';
    audio.loop = true;
    audio.play().catch(() => {});
    
    if ('vibrate' in navigator) {
      navigator.vibrate([1000, 500, 1000, 500]);
    }
  };

  const stopFakeCall = () => {
    setIsFakeCallActive(false);
    const audio = document.getElementById('fake-call-ringtone') as HTMLAudioElement;
    if (audio) {
      audio.pause();
      audio.remove();
    }
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
  };

  const startSafetyTimer = (seconds: number) => {
    setSafetyTimerSeconds(seconds);
    setIsSafetyTimerActive(true);
    
    if (safetyTimerIntervalRef.current) clearInterval(safetyTimerIntervalRef.current);
    
    safetyTimerIntervalRef.current = setInterval(() => {
      setSafetyTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(safetyTimerIntervalRef.current);
          setIsSafetyTimerActive(false);
          triggerSOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSafetyTimer = () => {
    if (safetyTimerIntervalRef.current) {
      clearInterval(safetyTimerIntervalRef.current);
      safetyTimerIntervalRef.current = null;
    }
    setIsSafetyTimerActive(false);
    setSafetyTimerSeconds(0);
  };

  const toggleFlashlight = async (on: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: on }]
        } as any);
      }
      if (!on) {
        track.stop();
      }
    } catch (err) {
      console.log('Flashlight not supported or blocked');
    }
  };

  const sendEmergencySMS = (lat: number, lng: number) => {
    const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
    const message = `🚨 EMERGENCY! I feel unsafe. My location: ${googleMapsLink}`;
    
    if (contacts.length > 0) {
      const phones = contacts.map(c => c.phone).join(',');
      window.open(`sms:${phones}?body=${encodeURIComponent(message)}`, '_self');
    }
  };

  const startLiveTracking = () => {
    if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    
    locationIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        
        if (user && isUUID(user.id)) {
          await supabase.from('live_tracking').insert({
            user_id: user.id,
            lat: latitude,
            lng: longitude
          });
        }
      });
    }, 5000); // Every 5 seconds
  };

  const stopLiveTracking = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'video/webm' });
        uploadEvidence(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const uploadEvidence = async (blob: Blob) => {
    if (!user || !isUUID(user.id)) return;
    const fileName = `evidence_${user.id}_${Date.now()}.webm`;
    
    const { data, error } = await supabase.storage
      .from('emergency-evidence')
      .upload(fileName, blob);

    if (data) {
      const { data: { publicUrl } } = supabase.storage
        .from('emergency-evidence')
        .getPublicUrl(fileName);

      await supabase.from('emergency_events').insert({
        user_id: user.id,
        media_url: publicUrl,
        media_type: 'video',
        event_type: 'media_captured'
      });
    }
  };

  const triggerPhysicalAlerts = () => {
    // Vibration
    if ('vibrate' in navigator) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }
    
    // Alarm Sound (Mock)
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
    audio.loop = true;
    audio.play().catch(() => console.log('Audio play blocked by browser'));
  };

  const capturePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg'));
      if (blob && user && isUUID(user.id)) {
        const fileName = `photo_${user.id}_${Date.now()}.jpg`;
        const { data } = await supabase.storage.from('emergency-evidence').upload(fileName, blob);
        if (data) {
          const { data: { publicUrl } } = supabase.storage.from('emergency-evidence').getPublicUrl(fileName);
          await supabase.from('emergency_events').insert({
            user_id: user.id,
            media_url: publicUrl,
            media_type: 'photo',
            event_type: 'media_captured'
          });
        }
      }
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('Photo capture failed:', err);
    }
  };

  // Voice Trigger Logic
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toUpperCase();
      if (transcript.includes('HELP') || transcript.includes('SOS') || transcript.includes('EMERGENCY')) {
        triggerSOS();
      }
    };

    recognition.start();
    return () => recognition.stop();
  }, [user]);

  // Shake Trigger Logic
  useEffect(() => {
    let lastX: number, lastY: number, lastZ: number;
    let threshold = 15;

    const handleMotion = (event: DeviceMotionEvent) => {
      const { x, y, z } = event.accelerationIncludingGravity || {};
      if (x === null || y === null || z === null) return;

      if (lastX !== undefined) {
        const deltaX = Math.abs(lastX - (x || 0));
        const deltaY = Math.abs(lastY - (y || 0));
        const deltaZ = Math.abs(lastZ - (z || 0));

        if ((deltaX > threshold && deltaY > threshold) || (deltaX > threshold && deltaZ > threshold) || (deltaY > threshold && deltaZ > threshold)) {
          triggerSOS();
        }
      }

      lastX = x || 0;
      lastY = y || 0;
      lastZ = z || 0;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [user]);

  const openEmergencyWhatsApp = (lat: number, lng: number, eventId?: string) => {
    const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
    const evidenceLink = `${window.location.origin}/emergency/${eventId || 'live'}`;
    const message = `🚨 EMERGENCY! I feel unsafe.\n\n📍 My Location: ${googleMapsLink}\n\n📂 Evidence Link: ${evidenceLink}`;
    
    contacts.forEach(contact => {
      const whatsappUrl = `https://wa.me/${contact.phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    });
  };

  const addContact = async (name: string, phone: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert({ user_id: user.id, name, phone })
      .select()
      .single();
    
    if (data) {
      setContacts([...contacts, data]);
      localStorage.setItem('emergency_contacts', JSON.stringify([...contacts, data]));
    }
  };

  const removeContact = async (id: string) => {
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', id);
    
    if (!error) {
      const updated = contacts.filter(c => c.id !== id);
      setContacts(updated);
      localStorage.setItem('emergency_contacts', JSON.stringify(updated));
    }
  };

  // Online/Offline Sync Logic
  useEffect(() => {
    const handleOnline = () => {
      console.log('[Safety] Back online. Syncing data...');
      if (user) fetchContacts(user.id);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [user]);

  return (
    <SafetyContext.Provider value={{
      isEmergency,
      isRecording,
      isFakeCallActive,
      isSafetyTimerActive,
      safetyTimerSeconds,
      currentLocation,
      contacts,
      riskLevel,
      privacyMode,
      setPrivacyMode,
      triggerSOS,
      stopSOS,
      triggerFakeCall,
      stopFakeCall,
      startSafetyTimer,
      cancelSafetyTimer,
      addContact,
      removeContact
    }}>
      {children}
    </SafetyContext.Provider>
  );
};

export const useSafety = () => {
  const context = useContext(SafetyContext);
  if (context === undefined) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
};
