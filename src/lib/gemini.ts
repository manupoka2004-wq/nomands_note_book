
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

// cspell:ignore Geoapify

export const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "undefined") {
    throw new Error("GEMINI_API_KEY is not configured. Please set it in your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Safely parse JSON from a string, attempting to fix common truncation issues.
 */
export const safeJsonParse = (text: string): any => {
  if (!text) return {};
  
  let cleaned = text.trim();
  
  // Remove markdown code blocks if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }
  
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn('[Gemini] Initial JSON parse failed, attempting to fix truncation...', e);
    
    // Attempt to close open structures
    let fixed = cleaned;
    const stack: string[] = [];
    
    for (let i = 0; i < fixed.length; i++) {
      const char = fixed[i];
      if (char === '{') stack.push('}');
      else if (char === '[') stack.push(']');
      else if (char === '}' || char === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === char) {
          stack.pop();
        }
      }
    }
    
    // If we have open structures, try to close them
    if (stack.length > 0) {
      // If we are inside a string, close it first
      // This is a very basic check and might not handle escaped quotes
      const lastQuoteIndex = fixed.lastIndexOf('"');
      const secondLastQuoteIndex = fixed.lastIndexOf('"', lastQuoteIndex - 1);
      
      // If there's an odd number of quotes in the last segment, close the string
      const quotesCount = (fixed.match(/"/g) || []).length;
      if (quotesCount % 2 !== 0) {
        fixed += '"';
      }

      // Close open brackets/braces in reverse order
      while (stack.length > 0) {
        fixed += stack.pop();
      }
      
      try {
        return JSON.parse(fixed);
      } catch (innerError) {
        console.error('[Gemini] Failed to fix truncated JSON:', innerError);
        return {};
      }
    }
    
    return {};
  }
}

export async function getNearbyRoutePlaces(source: string, destination: string) {
  const ai = getAI();
  const prompt = `Find 5-6 interesting places (tourist spots, cafes, scenic views) along the route from ${source} to ${destination}. 
  Provide name, coordinates (lat, lng), and a very short description for each.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          places: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                lat: { type: Type.NUMBER },
                lng: { type: Type.NUMBER },
                description: { type: Type.STRING }
              }
            }
          }
        },
        required: ["places"]
      }
    }
  });
  return safeJsonParse(response.text || '{}');
}

/**
 * Refactored Simple Itinerary Generation
 * Matches the requested lightweight schema.
 */
export async function generateSimpleItinerary(
  destination: string,
  days: number,
  budget: string,
  interests: string,
  source: string
) {
  const ai = getAI();
  const prompt = `Plan a ${days}-day trip to ${destination} starting from ${source}. 
  Budget: ${budget}. Interests: ${interests}.
  Provide a detailed day-by-day plan, hotel recommendations, and travel tips.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          days: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                plan: { type: Type.STRING }
              }
            }
          },
          hotels: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                rating: { type: Type.NUMBER },
                price: { type: Type.STRING }
              }
            }
          },
          tips: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["summary", "days", "hotels", "tips"]
      }
    }
  });
  return safeJsonParse(response.text || '{}');
}

// Service 1: Core Itinerary (The heavy thinking part)
export async function generateCorePlan(
  destination: string, 
  days: number, 
  interests: string, 
  startingPlace: string,
  mode: 'fast' | 'deep' = 'deep',
  mysteryMode: boolean = false,
  soloDNA?: any
) {
  const ai = getAI();
  const model = mode === 'deep' ? "gemini-3-flash-preview" : "gemini-3-flash-preview";

  const prompt = `Act as an Expert Trip Architect. Destination: ${destination}, Days: ${days}, Interests: ${interests}.
  Starting from: ${startingPlace}. Mode: ${mode}. Mystery Mode: ${mysteryMode}.
  Solo DNA Profile: ${JSON.stringify(soloDNA || {})}.
  Generate only the CORE itinerary: summary, day_wise_plan, route coordinates (OSM), and voice_output narrative.`;
  
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: mode === 'deep' ? [{ googleSearch: {} }] : [],
      responseMimeType: "application/json",
      thinkingConfig: mode === 'deep' ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          mystery_reveal: { type: Type.STRING },
          dna_match_explanation: { type: Type.STRING },
          route: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } } } },
          markers: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER }, type: { type: Type.STRING } } } },
          day_wise_plan: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { day: { type: Type.INTEGER }, morning: { type: Type.STRING }, afternoon: { type: Type.STRING }, evening: { type: Type.STRING } } } },
          places: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }, lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER }, cost: { type: Type.STRING } } } },
          route_details: { type: Type.OBJECT, properties: { total_distance: { type: Type.STRING }, travel_time: { type: Type.STRING }, suggested_transport: { type: Type.STRING }, optimized_order: { type: Type.ARRAY, items: { type: Type.STRING } } } },
          voice_output: { type: Type.STRING }
        },
        required: ["summary", "day_wise_plan", "route", "markers", "voice_output", "places", "route_details"]
      }
    }
  });
  return safeJsonParse(response.text || '{}');
}

// Service 2: Safety & Atmosphere (Identity and Risk)
export async function generateSafetyPlan(destination: string) {
  const ai = getAI();
  const prompt = `Explore safety and culture for ${destination}. 
  Focus on Scams, Neighborhood safety scores, and Cultural etiquette.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          safety_score: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, description: { type: Type.STRING } } },
          scam_warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
          neighborhood_safety: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { area: { type: Type.STRING }, rating: { type: Type.NUMBER }, comment: { type: Type.STRING } } } },
          cultural_lens: { type: Type.OBJECT, properties: { do: { type: Type.ARRAY, items: { type: Type.STRING } }, donts: { type: Type.ARRAY, items: { type: Type.STRING } }, etiquette: { type: Type.STRING } } }
        },
        required: ["safety_score", "scam_warnings", "neighborhood_safety", "cultural_lens"]
      }
    }
  });
  return safeJsonParse(response.text || '{}');
}

// Service 3: Logistics & Utils (Weather, Budget, Packing)
export async function generateLogisticsPlan(destination: string, days: number, budget: string | number) {
  const ai = getAI();
  const prompt = `Identify logistics for a ${days}-day trip to ${destination} with a ${budget} budget.
  Include Weather, Flights (mock), Packing list, and Translation (English to Local).`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          weather: { type: Type.OBJECT, properties: { temp: { type: Type.STRING }, condition: { type: Type.STRING }, forecast: { type: Type.STRING } } },
          flights: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { airline: { type: Type.STRING }, price: { type: Type.STRING }, duration: { type: Type.STRING } } } },
          packing_list: { type: Type.ARRAY, items: { type: Type.STRING } },
          budget_breakdown: { type: Type.OBJECT, properties: { user_currency: { type: Type.STRING }, total_cost_user: { type: Type.STRING }, budget_tips: { type: Type.ARRAY, items: { type: Type.STRING } } } },
          translation: { type: Type.OBJECT, properties: { english: { type: Type.STRING }, local: { type: Type.STRING } } },
          local_events: { type: Type.STRING }
        },
        required: ["weather", "flights", "packing_list", "budget_breakdown", "translation"]
      }
    }
  });
  return safeJsonParse(response.text || '{}');
}

export async function generateTripPlan(
  destination: string, 
  days: number, 
  budget: string | number, 
  interests: string, 
  travelStyle: string,
  startingPlace: string,
  mode: 'fast' | 'deep' = 'deep',
  mysteryMode: boolean = false,
  soloDNA?: any
) {
  try {
    // RUN ALL SERVICES IN PARALLEL
    const [core, safety, logistics] = await Promise.all([
      generateCorePlan(destination, days, interests, startingPlace, mode, mysteryMode, soloDNA),
      generateSafetyPlan(destination),
      generateLogisticsPlan(destination, days, budget)
    ]);

    // Merge results into a single plan object compatible with UI
    return {
      ...core,
      ...safety,
      ...logistics
    };
  } catch (error: any) {
    console.error("[TripPlanner] Split Generation Error:", error);
    if (error.message?.includes('429')) {
      throw new Error("AI Capacity reached. Please try again in 1 minute.");
    }
    throw error;
  }
}

export async function adjustTripPlan(
  currentPlan: any,
  reason: string,
  weather?: string
) {
  const ai = getAI();
  const prompt = `You are an AI Travel Assistant. Adjust the following trip plan based on the reason: "${reason}".
  ${weather ? `Current weather: ${weather}.` : ''}
  
  Current Plan Summary: ${currentPlan.summary}
  
  Modify the itinerary to be safer and more practical given the situation.
  If it's raining, suggest indoor activities.
  If there are delays, prioritize essential activities.
  
  Return the updated JSON object with the same structure as the original plan.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  return safeJsonParse(response.text || '{}');
}

export async function chatWithAI(message: string, history?: any[]) {
  const ai = getAI();
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are an expert travel assistant. Help users plan their trips, suggest destinations, and answer travel-related questions. Use Google Search to provide real-time information about weather, events, and news. Be concise and helpful.",
      tools: [{ googleSearch: {} }]
    },
    history: history || []
  });

  const response = await chat.sendMessage({ message });
  return { text: response.text };
}

export async function getLiveDestinationInsights(destination: string) {
  const ai = getAI();
  const prompt = `Provide real-time travel insights for ${destination} based on current data.
  Include:
  1. Current Events: Any festivals, fairs, or local events happening this week.
  2. Travel News: Any recent news, road closures, or travel advisories for this area.
  3. Trending Spots: Places that are currently popular or "hidden gems" being talked about.
  4. Local Tips: Practical advice for travelers visiting right now (e.g., specific seasonal food, weather-specific advice).
  
  Use Google Search to ensure the information is up-to-date.
  Format the response as a structured JSON object.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          events: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                date: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          },
          news: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                source: { type: Type.STRING },
                summary: { type: Type.STRING }
              }
            }
          },
          trending_spots: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            }
          },
          local_tips: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            }
          }
        },
        required: ["events", "news", "trending_spots", "local_tips"]
      }
    }
  });

  return safeJsonParse(response.text || '{}');
}

export async function getDestinationGuide(destination: string, distance: number) {
  const ai = getAI();
  const prompt = `Provide a comprehensive destination guide for ${destination}. 
  Include:
  1. Top 5 famous tourist attractions with descriptions and ratings.
  2. Nearby hotels within ${distance}km of the center, including name, rating, approximate price per night in USD, and a mock booking link.
  3. Popular restaurants nearby with cuisine type and rating.
  4. Available transportation options (public transport, taxis, etc.) with brief descriptions and estimated costs.
  5. An estimated travel budget for a 3-day stay for one person.
  
  Ensure all ratings are out of 5. Use real-world data where possible via Google Search.
  Format the response as a structured JSON object.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          attractions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                rating: { type: Type.NUMBER }
              },
              required: ["name", "description", "rating"]
            }
          },
          hotels: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                rating: { type: Type.NUMBER },
                price_per_night: { type: Type.NUMBER },
                booking_link: { type: Type.STRING }
              },
              required: ["name", "rating", "price_per_night", "booking_link"]
            }
          },
          restaurants: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                cuisine: { type: Type.STRING },
                rating: { type: Type.NUMBER }
              },
              required: ["name", "cuisine", "rating"]
            }
          },
          transportation: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                mode: { type: Type.STRING },
                description: { type: Type.STRING },
                estimated_cost: { type: Type.STRING }
              },
              required: ["mode", "description", "estimated_cost"]
            }
          },
          estimated_budget: {
            type: Type.OBJECT,
            properties: {
              total: { type: Type.NUMBER },
              currency: { type: Type.STRING },
              breakdown: {
                type: Type.OBJECT,
                properties: {
                  accommodation: { type: Type.NUMBER },
                  food: { type: Type.NUMBER },
                  transport: { type: Type.NUMBER },
                  activities: { type: Type.NUMBER }
                }
              }
            },
            required: ["total", "currency", "breakdown"]
          }
        },
        required: ["attractions", "hotels", "restaurants", "transportation", "estimated_budget"]
      }
    }
  });

  return safeJsonParse(response.text || '{}');
}

export async function recognizeLandmark(imageBase64: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: "Identify this landmark. Provide its name, location, and a brief historical summary. If it's not a landmark, describe what is in the image." },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64
            }
          }
        ]
      }
    ]
  });

  return response.text;
}
