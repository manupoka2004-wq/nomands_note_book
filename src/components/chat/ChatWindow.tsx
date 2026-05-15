
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Smile, 
  Paperclip, 
  MoreVertical, 
  X, 
  User, 
  Info,
  Circle as StatusCircle
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { SoloCircle } from '../../types/soloCircles';
import { getMessages } from '../../services/circleService';
import { format } from 'date-fns';

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  type: 'text' | 'image' | 'system';
  created_at: string;
  user_avatar?: string;
  reactions?: { [emoji: string]: number };
}

interface ChatWindowProps {
  circle: SoloCircle;
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ circle, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mock current user - In real app, this comes from an Auth context
  const currentUser = { id: 'system', name: 'You' };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...(msg.reactions || {}) };
        reactions[emoji] = (reactions[emoji] || 0) + 1;
        return { ...msg, reactions };
      }
      return msg;
    }));
    socketRef.current?.emit('add_reaction', { messageId, emoji, circleId: circle.id });
  };

  useEffect(() => {
    // Fetch history
    const loadHistory = async () => {
      try {
        const history = await getMessages(circle.id);
        const transformedHistory = history.map((msg: any) => ({
          ...msg,
          userName: msg.user_name,
          userId: msg.user_id
        }));
        setMessages(transformedHistory);
      } catch (err) {
        console.error('Failed to load history');
      }
    };
    loadHistory();

    // Setup Socket
    socketRef.current = io();
    const socket = socketRef.current;

    socket.emit('join_circle', circle.id);

    socket.on('new_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('display_typing', (data: { userName: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUser(data.userName);
      } else {
        setTypingUser(null);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [circle.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;

    const data = {
      circleId: circle.id,
      userId: currentUser.id,
      userName: currentUser.name,
      content: newMessage,
      type: 'text'
    };

    socketRef.current.emit('send_message', data);
    setNewMessage('');
    handleTyping(false);
  };

  const handleTyping = (typing: boolean) => {
    setIsTyping(typing);
    socketRef.current?.emit('typing', {
      circleId: circle.id,
      userName: currentUser.name,
      isTyping: typing
    });
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-y-0 right-0 w-full md:w-112.5 bg-slate-900 border-l border-white/10 z-100 flex flex-col shadow-2xl"
    >
      {/* Header */}
      <div className="p-6 bg-slate-950/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
            <StatusCircle className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-black text-white uppercase tracking-tighter leading-none">{circle.name}</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
              {circle.members} Members Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            title="Info"
            className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
          >
            <Info size={20} />
          </button>
          <button 
            onClick={onClose}
            title="Close"
            className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((msg, i) => {
          const isOwn = msg.userId === currentUser.id;
          return (
            <motion.div 
              key={msg.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
            >
              {!isOwn && (
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-4">
                  {msg.userName}
                </span>
              )}
              <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium leading-relaxed group relative ${
                isOwn 
                  ? 'bg-indigo-500 text-white rounded-tr-none' 
                  : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'
              }`}>
                {msg.content}
                
                {/* Reaction Picker (Simple Overlay) */}
                <div className={`absolute top-full mt-1 ${isOwn ? 'right-0' : 'left-0'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10`}>
                  {['👍', '❤️', '🔥', '😂'].map(emoji => (
                    <button 
                      key={emoji}
                      onClick={() => addReaction(msg.id, emoji)}
                      title={`React with ${emoji}`}
                      className="w-6 h-6 flex items-center justify-center bg-slate-800 rounded-full text-[10px] hover:scale-125 transition-transform border border-white/10"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Displayed Reactions */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="absolute -bottom-3 right-0 flex gap-1">
                    {Object.entries(msg.reactions).map(([emoji, count]) => (
                      <div key={emoji} className="px-1.5 py-0.5 bg-slate-800 border border-white/10 rounded-full text-[10px] flex items-center gap-1 shadow-lg">
                        <span>{emoji}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-tighter">
                {format(new Date(msg.created_at), 'HH:mm')}
              </span>
            </motion.div>
          );
        })}
        {typingUser && (
          <div className="flex items-center gap-2 text-slate-500 italic text-xs">
            <div className="flex gap-1">
              {[0, 0.2, 0.4].map((delay, i) => (
                <motion.span 
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay }}
                  className="w-1 h-1 bg-slate-500 rounded-full" 
                />
              ))}
            </div>
            {typingUser} is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 pt-0">
        <form 
          onSubmit={handleSendMessage}
          className="bg-white/5 border border-white/10 rounded-[2.5rem] p-2 flex items-center gap-2"
        >
          <button 
            type="button"
            title="Attach File"
            className="p-3 text-slate-500 hover:text-white transition-colors"
          >
            <Paperclip size={20} />
          </button>
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              if (!isTyping) handleTyping(true);
              if (e.target.value === '') handleTyping(false);
            }}
            onBlur={() => handleTyping(false)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-600 text-sm font-medium py-3"
          />
          <button 
            type="button"
            title="Emoji Picker"
            className="p-3 text-slate-500 hover:text-white transition-colors"
          >
            <Smile size={20} />
          </button>
          <button 
            disabled={!newMessage.trim()}
            title="Send Message"
            className="w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </motion.div>
  );
};
