// Gemini Search Service - Google Maps Grounding
import { getAI } from "../lib/gemini";
import { PlaceResult } from "../types";

export async function searchNearbyPlaces(query: string, lat?: number, lng?: number): Promise<PlaceResult[]> {
  // Default to a central location (e.g., Mumbai) if no location is provided
  const latitude = lat || 19.0760;
  const longitude = lng || 72.8777;

  console.log(`[GeminiSearch] Searching for: ${query} at ${latitude}, ${longitude}`);
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find real-world ${query} nearby and provide details for 5-6 results. Use the Google Search tool to get accurate, current information including names, ratings, and locations.`,
      config: {
        tools: [{ googleSearch: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude, longitude }
          }
        }
      },
    });

    console.log("[GeminiSearch] Response received:", response);
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const results: PlaceResult[] = [];

    if (groundingChunks && groundingChunks.length > 0) {
      console.log(`[GeminiSearch] Found ${groundingChunks.length} grounding chunks`);
      groundingChunks.forEach((chunk, index) => {
        if (chunk.maps) {
          const title = chunk.maps.title || `Place ${index + 1}`;
          const reviewSnippets = chunk.maps.placeAnswerSources?.reviewSnippets?.map((s: any) => s.text).join(' ') || '';
          
          results.push({
            id: `gemini_${index}_${Date.now()}`,
            name: title,
            location: chunk.maps.uri ? 'View on Maps' : 'Nearby',
            lat: latitude,
            lng: longitude,
            rating: 4.0 + (Math.random() * 1.0),
            reviews: Math.floor(Math.random() * 1000) + 100,
            price: Math.floor(Math.random() * 4000) + 1500,
            image: `https://picsum.photos/seed/${encodeURIComponent(title)}/800/600`,
            type: query.toLowerCase().includes('restaurant') || query.toLowerCase().includes('food') ? 'restaurant' : 
                  query.toLowerCase().includes('shop') || query.toLowerCase().includes('mall') ? 'restaurant' : 'hotel',
            mapsUrl: chunk.maps.uri || '#',
            snippet: reviewSnippets
          });
        }
      });
    } else if (response.text) {
      console.warn("[GeminiSearch] No grounding chunks found. Falling back to text parsing.");
      // Simple fallback: Try to find lines that look like names
      const lines = response.text.split('\n').filter(l => l.trim().length > 5 && !l.startsWith('#'));
      lines.slice(0, 5).forEach((line, index) => {
        const name = line.replace(/^\d+\.\s*/, '').split(':')[0].trim();
        results.push({
          id: `gemini_fallback_${index}_${Date.now()}`,
          name: name,
          location: 'Nearby',
          lat: latitude,
          lng: longitude,
          rating: 4.2 + (Math.random() * 0.5),
          reviews: Math.floor(Math.random() * 500) + 50,
          price: Math.floor(Math.random() * 3000) + 1000,
          image: `https://picsum.photos/seed/${encodeURIComponent(name)}/800/600`,
          type: query.toLowerCase().includes('restaurant') || query.toLowerCase().includes('food') ? 'restaurant' : 
                query.toLowerCase().includes('shop') || query.toLowerCase().includes('mall') ? 'restaurant' : 'hotel',
          mapsUrl: '#',
          snippet: 'Information retrieved via AI search.'
        });
      });
    } else {
      console.warn("[GeminiSearch] No grounding chunks and no text found in response.");
    }

    return results;
  } catch (error) {
    console.error("[GeminiSearch] Error:", error);
    return [];
  }
}
