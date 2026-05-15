
import { getAI, safeJsonParse } from "../lib/gemini";
import { Type } from "@google/genai";
import { TripPlan, DayPlan } from "../types/trip";

export const generateTripPlan = async (
  destination: string,
  duration: number,
  budget: number,
  tripType: string
): Promise<Partial<TripPlan>> => {
  const prompt = `
    Generate a detailed trip itinerary and packing list for a ${duration}-day trip to ${destination} with a budget of ${budget}.
    Trip type: ${tripType}.
    Include safety notes for each day, especially for rural or unknown areas.
    Focus on practical and safe activities.
    The response should be in JSON format.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itinerary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.NUMBER },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        location: { type: Type.STRING },
                        cost: { type: Type.NUMBER }
                      }
                    }
                  },
                  safetyNotes: { type: Type.STRING }
                }
              }
            },
            packingList: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    return safeJsonParse(response.text || "{}");
  } catch (error) {
    console.error("AI Generation failed:", error);
    throw error;
  }
};

export const saveTripLocally = (trip: TripPlan) => {
  const trips = getLocalTrips();
  const index = trips.findIndex(t => t.id === trip.id);
  if (index >= 0) {
    trips[index] = trip;
  } else {
    trips.push(trip);
  }
  localStorage.setItem('trip_history', JSON.stringify(trips));
};

export const getLocalTrips = (): TripPlan[] => {
  const saved = localStorage.getItem('trip_history');
  return saved ? JSON.parse(saved) : [];
};

export const deleteTripLocally = (id: string) => {
  const trips = getLocalTrips().filter(t => t.id !== id);
  localStorage.setItem('trip_history', JSON.stringify(trips));
};

export const adjustPlanForWeather = (itinerary: DayPlan[], weather: string): DayPlan[] => {
  // Simple logic to adjust plans based on weather
  if (weather.toLowerCase().includes('rain')) {
    return itinerary.map(day => ({
      ...day,
      activities: day.activities.map(act => ({
        ...act,
        description: act.description + " (Note: Indoor alternative recommended due to rain)"
      }))
    }));
  }
  return itinerary;
};
