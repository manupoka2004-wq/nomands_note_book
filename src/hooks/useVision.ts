import { useState, useCallback } from 'react';
import { DetectionResult, VisionState, LandmarkInfo, AILensInsights } from '../types';
import { detectObjects } from '../services/visionService';
import { performOCR } from '../services/ocrService';
import { translateText } from '../services/translationService';
import { getLandmarkDetails } from '../services/travelService';
import { getSmartLensInsights } from '../services/aiLensService';

export const useVision = () => {
  const [state, setState] = useState<VisionState>({
    isProcessing: false,
    objects: [],
    ocrText: "",
    translation: "",
    landmark: null,
    insights: null,
    error: null
  });

  const processImage = useCallback(async (imageBlob: Blob, identity: string = 'Culture Seeker') => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    
    try {
      // Run detections in parallel
      const [objects, ocrText, insights] = await Promise.all([
        detectObjects(imageBlob),
        performOCR(imageBlob),
        getSmartLensInsights(imageBlob, identity)
      ]);

      // If objects detected, try to get landmark info for the top one
      let landmark: LandmarkInfo | null = null;
      try {
        if (objects.length > 0) {
          landmark = await getLandmarkDetails(objects[0].label);
        }
      } catch (err) {
        console.error("Landmark Fetch Error:", err);
      }

      // If OCR text found, translate it
      let translation = "";
      try {
        if (ocrText) {
          translation = await translateText(ocrText);
        }
      } catch (err) {
        console.error("Translation Error in useVision:", err);
      }

      setState({
        isProcessing: false,
        objects,
        ocrText,
        translation,
        landmark,
        insights,
        error: null
      });
    } catch (err) {
      console.error("Vision Processing Error:", err);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: "Failed to process image. Please try again." 
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      objects: [],
      ocrText: "",
      translation: "",
      landmark: null,
      insights: null,
      error: null
    });
  }, []);

  return { ...state, processImage, reset };
};
