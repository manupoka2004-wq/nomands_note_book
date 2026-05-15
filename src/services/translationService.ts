import { getAI } from "../lib/gemini";



export interface TranslationResult {

  originalText: string;

  translatedText: string;

  detectedLanguage: string;

  targetLanguage: string;

  confidence: number;

}



// Language detection patterns

const LANGUAGE_PATTERNS = {

  spanish: /[ñáéíóúü¿¡]/i,

  french: /[àâäéèêëïîôöùûüÿç]/i,

  german: /[äöüß]/i,

  italian: /[àèéìíîòóù]/i,

  portuguese: /[ãâáàçéêíóôõú]/i,

  russian: /[а-яё]/i,

  chinese: /[\u4e00-\u9fff]/,

  japanese: /[\u3040-\u309f\u30a0-\u30ff]/,

  korean: /[\uac00-\ud7af]/,

  arabic: /[\u0600-\u06ff]/,

  hindi: /[\u0900-\u097f]/,

  thai: /[\u0e00-\u0e7f]/,

};



const detectLanguage = (text: string): string => {

  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {

    if (pattern.test(text)) {

      return lang.charAt(0).toUpperCase() + lang.slice(1);

    }

  }

  return 'Unknown';

};



export const translateToEnglish = async (text: string): Promise<TranslationResult> => {

  if (!text.trim()) {

    return {

      originalText: text,

      translatedText: '',

      detectedLanguage: 'Unknown',

      targetLanguage: 'English',

      confidence: 0

    };

  }

  

  try {

    const ai = getAI();

    const model = "gemini-3-flash-preview";

    

    // Detect language first

    const detectedLang = detectLanguage(text);

    

    // If already English, return as-is

    if (detectedLang === 'Unknown' || text.match(/^[a-zA-Z\s\p{P}]+$/u)) {

      return {

        originalText: text,

        translatedText: text,

        detectedLanguage: 'English',

        targetLanguage: 'English',

        confidence: 0.95

      };

    }

    

    const response = await ai.models.generateContent({

      model,

      contents: `Translate the following text to English. If it's already in English, return it as-is. Also detect the original language and provide a confidence score (0-1) for the translation accuracy.



Text: "${text}"



Respond in this JSON format:

{

  "translated_text": "translated text here",

  "detected_language": "Language Name",

  "confidence": 0.95

}`

    });



    let result = {

      translated_text: text,

      detected_language: detectedLang,

      confidence: 0.8

    };



    try {

      result = JSON.parse(response.text || '{}');

    } catch {

      // Fallback: extract translation from plain text

      const translationMatch = response.text?.match(/"([^"]+)"/);

      if (translationMatch) {

        result.translated_text = translationMatch[1];

      }

    }



    return {

      originalText: text,

      translatedText: result.translated_text || text,

      detectedLanguage: result.detected_language || detectedLang,

      targetLanguage: 'English',

      confidence: result.confidence || 0.8

    };

  } catch (error) {

    console.error("Translation Error:", error);

    return {

      originalText: text,

      translatedText: text,

      detectedLanguage: 'Unknown',

      targetLanguage: 'English',

      confidence: 0

    };

  }

};



export const translateText = async (text: string, targetLang = 'Spanish'): Promise<string> => {

  if (!text.trim()) return "";

  

  try {

    const ai = getAI();

    const model = "gemini-3-flash-preview";

    

    const response = await ai.models.generateContent({

      model,

      contents: `Translate the following text to ${targetLang}: "${text}". Only return the translated text.`

    });



    return response.text || text;

  } catch (error) {

    console.error("Translation Error:", error);

    return text;

  }

};

