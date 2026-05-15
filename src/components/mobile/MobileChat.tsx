import React, { useState } from 'react';
import { Send, Image, Smile, Phone, Video } from 'lucide-react';
import { motion } from 'motion/react';

export default function MobileChat() {
  const [message, setMessage] = useState('');

  const mockMessages = [
    { id: 1, text: "Hey! How's your trip going?", sender: 'other', time: '10:30 AM' },
    { id: 2, text: "It's amazing! Just reached Chiang Mai.", sender: 'me', time: '10:32 AM' },
    { id: 3, text: "Nice! Have you tried the Khao Soi there?", sender: 'other', time: '10:33 AM' },
  ];

  return (
    <div className="flex flex-col h-[70vh] bg-slate-50 rounded-3xl overflow-hidden shadow-xl border border-slate-200">
      {/* Mobile Chat Header */}
      <div className="bg-white p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
            AJ
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 leading-none">Alex Johnson</h4>
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-1">Online</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <button className="p-2 hover:text-indigo-600 transition-colors" title="Call"><Phone size={18} /></button>
          <button className="p-2 hover:text-indigo-600 transition-colors" title="Video"><Video size={18} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {mockMessages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              msg.sender === 'me' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-700 shadow-sm rounded-tl-none border border-slate-100'
            }`}>
              <p>{msg.text}</p>
              <p className={`text-[9px] mt-1 text-right ${msg.sender === 'me' ? 'text-indigo-200' : 'text-slate-400'}`}>
                {msg.time}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 flex items-center space-x-3">
        <button className="text-slate-300 hover:text-indigo-600" title="Attach Image"><Image size={20} /></button>
        <button className="text-slate-300 hover:text-indigo-600" title="Add Emoji"><Smile size={20} /></button>
        <input 
          type="text" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-slate-50 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20"
        />
        <button className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-200" title="Send Message">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
