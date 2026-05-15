import { GoogleGenAI, Type } from "@google/genai";
import { getAI, safeJsonParse } from "../lib/gemini";
import { AILensInsights } from "../types";

export const getSmartLensInsights = async (imageBlob: Blob, identity: string = 'Culture Seeker'): Promise<AILensInsights> => {
  try {
    const ai = getAI();
    const model = "gemini-3-flash-preview";
    
    const base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageBlob);
    });
    
    const prompt = `
      You are a highly observant travel expert. Analyze this travel-related image from the perspective of a "${identity}". 
      
      CRITICAL: If the image is blurry, too dark, or doesn't contain recognizable travel elements, focus your response on identifying what MIGHT be there and provide general travel safety/culture tips for a traveler in that kind of environment.
      
      Provide comprehensive insights including:
      1. Cultural etiquette and traditions (if people/buildings visible).
      2. Food details (dish, ingredients, allergens) if food is shown.
      3. Safety assessment (crowd level, areas to avoid).
      4. Emotional mood of the scene.
      5. Sustainability and local impact.
      6. Historical context or story behind the scene.
      7. Transportation options visible.
      8. Hand gestures or social cues if people are present.
      9. A creative 'Travel Journal' entry summarizing the vibe.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: imageBlob.type,
                data: base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cultural: {
              type: Type.OBJECT,
              properties: {
                etiquette: { type: Type.ARRAY, items: { type: Type.STRING } },
                customs: { type: Type.STRING },
                traditions: { type: Type.STRING }
              }
            },
            food: {
              type: Type.OBJECT,
              properties: {
                dishName: { type: Type.STRING },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                allergens: { type: Type.ARRAY, items: { type: Type.STRING } },
                calories: { type: Type.STRING },
                history: { type: Type.STRING },
                recommender: { type: Type.STRING }
              }
            },
            safety: {
              type: Type.OBJECT,
              properties: {
                rating: { type: Type.NUMBER },
                crowdLevel: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                advice: { type: Type.STRING },
                areasToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            emotion: {
              type: Type.OBJECT,
              properties: {
                mood: { type: Type.STRING },
                tone: { type: Type.STRING },
                suggestedPhrases: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            sustainability: {
              type: Type.OBJECT,
              properties: {
                isEcoFriendly: { type: Type.BOOLEAN },
                isLocal: { type: Type.BOOLEAN },
                impact: { type: Type.STRING },
                refillStationsNearby: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            history: {
              type: Type.OBJECT,
              properties: {
                pastViewDescription: { type: Type.STRING },
                timeline: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      period: { type: Type.STRING },
                      description: { type: Type.STRING }
                    }
                  }
                }
              }
            },
            transport: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                schedules: { type: Type.ARRAY, items: { type: Type.STRING } },
                ticketOptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                directions: { type: Type.STRING },
                travelerTips: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            gestures: {
              type: Type.OBJECT,
              properties: {
                meaning: { type: Type.STRING },
                context: { type: Type.STRING },
                warning: { type: Type.STRING }
              }
            },
            story: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                journalEntry: { type: Type.STRING },
                captions: { type: Type.ARRAY, items: { type: Type.STRING } },
                funFacts: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "journalEntry"]
            }
          },
          required: ["story"]
        }
      }
    });

    const text = response.text;
    return safeJsonParse(text || '{}');
  } catch (error) {
    console.error("AI Lens Service Error:", error);
    return {};
  }
};
