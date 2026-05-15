import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

async function testKeys() {
  console.log("--- API Key Verification ---");

  // 1. Test Gemini API Key
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    console.error("❌ GEMINI_API_KEY is missing in .env");
  } else {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const model = "gemini-3-flash-preview";
      const response = await ai.models.generateContent({
        model,
        contents: "Hello, are you working?",
      });
      if (response.text) {
        console.log("✅ Gemini API Key: WORKING");
      } else {
        console.error("❌ Gemini API Key: FAILED (Empty response)");
      }
    } catch (error: any) {
      console.error("❌ Gemini API Key: FAILED", error.message);
    }
  }

  // 2. Test Supabase Keys
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase URL or Anon Key is missing in .env");
  } else {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error("❌ Supabase Connection: FAILED", error.message);
      } else {
        console.log("✅ Supabase Connection: WORKING");
      }
    } catch (error: any) {
      console.error("❌ Supabase Connection: FAILED", error.message);
    }
  }

  console.log("--- Verification Complete ---");
}

testKeys();