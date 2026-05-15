
export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  created_at: string;
}

export interface LoginRecord {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  user_agent: string;
  timestamp: string;
}

export interface TrackingPoint {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  timestamp: string;
}

export interface EmergencyEvent {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  media_url?: string;
  media_type?: 'photo' | 'video' | 'audio';
  event_type: 'sos_triggered' | 'location_update' | 'media_captured';
  timestamp: string;
}

export interface SafetyState {
  isEmergency: boolean;
  isRecording: boolean;
  isFakeCallActive: boolean;
  isSafetyTimerActive: boolean;
  safetyTimerSeconds: number;
  currentLocation: { lat: number; lng: number } | null;
  contacts: EmergencyContact[];
  riskLevel: 'Low' | 'Medium' | 'High';
  privacyMode: 'exact' | 'blurred';
  setPrivacyMode: (mode: 'exact' | 'blurred') => void;
  triggerSOS: () => Promise<void>;
  stopSOS: () => void;
  triggerFakeCall: () => void;
  stopFakeCall: () => void;
  startSafetyTimer: (seconds: number) => void;
  cancelSafetyTimer: () => void;
  addContact: (name: string, phone: string) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
}
