import { createWorker } from 'tesseract.js';

export const performOCR = async (imageSource: string | Blob): Promise<string> => {
  try {
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(imageSource);
    await worker.terminate();
    return text;
  } catch (error) {
    console.error("OCR Error:", error);
    return "";
  }
};
