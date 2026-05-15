import { GoogleGenAI, Type } from "@google/genai";
import { getAI, safeJsonParse } from "../lib/gemini";
import { DetectionResult } from "../types";

export const detectObjects = async (imageBlob: Blob): Promise<DetectionResult[]> => {
  try {
    const ai = getAI();
    const model = "gemini-3-flash-preview";
    
    // Convert Blob to base64
    const base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageBlob);
    });
    
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: "Identify the main objects and landmarks in this image for a travel application. Return a list of detected items with labels and confidence scores." },
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
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING, description: "The name of the object or landmark" },
              score: { type: Type.NUMBER, description: "Confidence score between 0 and 1" }
            },
            required: ["label", "score"]
          }
        }
      }
    });

    const text = response.text;
    const results = safeJsonParse(text || '[]');
    return Array.isArray(results) ? results : [];
  } catch (error) {
    console.error("Vision Service Error:", error);
    return [];
  }
};
