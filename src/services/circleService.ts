import axios from 'axios';
import { SoloCircle as Circle, CircleFilters } from '../types/soloCircles';

export const getCircles = async (filters?: CircleFilters): Promise<Circle[]> => {
  const response = await axios.get('/api/circles');
  return response.data;
};

export const createCircle = async (circle: Omit<Circle, 'id' | 'members'>): Promise<Circle> => {
  const response = await axios.post('/api/circles/create', {
    ...circle,
    creator_id: 'system' // Placeholder for now, should come from auth
  });
  return response.data;
};

export const joinCircle = async (circleId: string): Promise<boolean> => {
  const response = await axios.post('/api/circles/join', {
    circleId,
    userId: 'system' // Placeholder
  });
  return response.data.success;
};

export const getMessages = async (circleId: string) => {
  const response = await axios.get(`/api/circles/${circleId}/messages`);
  return response.data;
};
