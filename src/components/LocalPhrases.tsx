import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Languages, 
  Volume2, 
  MessageSquare, 
  Sparkles,
  Loader2,
  X
} from 'lucide-react';
import { getAI } from '../lib/gemini';

interface LocalPhrasesProps {
  destination: string;
}

export const LocalPhrases: React.FC<LocalPhrasesProps> = ({ destination }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [phrases, setPhrases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPhrases = async () => {
    setLoading(true);
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide 5 essential local language phrases for a traveler visiting ${destination}. 
        Include the English phrase, the local language translation, and a phonetic pronunciation guide.
        Format as a JSON array of objects with keys: english, local, pronunciation.`,
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const data = JSON.parse(response.text || '[]');
      setPhrases(data);
    } catch (err) {
      console.error('Failed to fetch phrases:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOpen = () => {
    if (!isOpen && phrases.length === 0) {
      fetchPhrases();
    }
    setIsOpen(!isOpen);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      <button 
        onClick={toggleOpen}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all text-slate-700 font-bold text-sm"
      >
        <Languages size={18} className="text-indigo-600" />
        <span>Local Phrases</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare size={24} />
                  <h3 className="text-xl font-black tracking-tight">Local Phrasebook</h3>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 hover:bg-white/20 rounded-xl transition-all"
                  title="Close Phrasebook"
                  aria-label="Close Phrasebook"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {loading ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                    <p className="text-slate-500 font-bold">Learning local dialects...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {phrases.map((phrase, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{phrase.english}</p>
                          <button 
                            onClick={() => speak(phrase.local)}
                            className="p-2 bg-white rounded-lg shadow-sm text-indigo-600 hover:text-indigo-700"
                            title={`Listen to "${phrase.local}"`}
                            aria-label={`Listen to "${phrase.local}"`}
                          >
                            <Volume2 size={16} />
                          </button>
                        </div>
                        <p className="text-xl font-black text-slate-900">{phrase.local}</p>
                        <p className="text-xs font-bold text-indigo-600 italic">Pronunciation: {phrase.pronunciation}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="pt-4 flex items-center justify-center space-x-2 text-slate-400">
                  <Sparkles size={14} />
                  <p className="text-[10px] font-black uppercase tracking-widest">AI Generated Phrasebook</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
