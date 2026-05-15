
export interface TripPlan {
  id: string;
  userId: string;
  destination: string;
  startDate: string;
  endDate: string;
  duration: number;
  budget: number;
  itinerary: DayPlan[];
  packingList: PackingItem[];
  expenses: Expense[];
  status: 'planned' | 'ongoing' | 'completed';
  createdAt: string;
}

export interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
  weatherForecast?: string;
  safetyNotes?: string;
}

export interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
  location?: string;
  cost?: number;
  isCompleted: boolean;
}

export interface PackingItem {
  id: string;
  name: string;
  category: string;
  isPacked: boolean;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
}
