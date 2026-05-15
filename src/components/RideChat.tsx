import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Phone, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from '../types';

interface RideChatProps {
  isOpen: boolean;
  onClose: () => void;
  driverName: string;
}

const RideChat: React.FC<RideChatProps> = ({ isOpen, onClose, driverName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'driver', text: "I've arrived at the pickup location.", timestamp: new Date().toISOString() }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'rider',
      text: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages([...messages, newMessage]);
    setInput('');

    // Mock driver response
    setTimeout(() => {
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'driver',
        text: 'Okay, I am waiting near the gate.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, response]);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-[2.5rem] shadow-2xl border-t border-slate-100 flex flex-col h-[80vh] md:h-[60vh] max-w-lg mx-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <User size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-900">{driverName}</h3>
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Online • Driver</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all" title="Call Driver">
                <Phone size={20} />
              </button>
              <button onClick={onClose} className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all" title="Close Chat">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'rider' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.sender === 'rider' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-900 rounded-tl-none'
                }`}>
                  <p className="text-sm font-medium">{msg.text}</p>
                  <p className={`text-[10px] mt-1 font-bold uppercase tracking-widest ${
                    msg.sender === 'rider' ? 'text-indigo-200' : 'text-slate-400'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
              <button
                onClick={handleSend}
                className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                title="Send Message"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RideChat;
