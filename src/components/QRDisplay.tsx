import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { QrCode, X, Share2, Download, CheckCircle2, MessageCircle, Send } from 'lucide-react';
import { SoloCircle } from '../types/soloCircles';
import { generateQRCode } from '../services/qrCodeService';
import toast from 'react-hot-toast';

interface QRDisplayProps {
  circle: SoloCircle;
  onClose: () => void;
}

export const QRDisplay: React.FC<QRDisplayProps> = ({ circle, onClose }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchQR = async () => {
      const url = await generateQRCode(`nomads-circle:${circle.id}`);
      setQrUrl(url);
    };
    fetchQR();
  }, [circle.id]);

  const handleCopy = () => {
    const link = `${window.location.origin}/join-circle/${circle.id}`;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const link = `${window.location.origin}/join-circle/${circle.id}`;
    const message = `🌍 Join my travel circle "${circle.name}" on TripMaker!\n\nScan the QR code or click this link:\n${link}\n\nLet's explore together! 🚀`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp...');
  };

  const handleMessageShare = () => {
    const link = `${window.location.origin}/join-circle/${circle.id}`;
    const message = `🌍 Join my travel circle "${circle.name}" on TripMaker!\n\nScan the QR code or click this link:\n${link}\n\nLet's explore together! 🚀`;
    
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: `Join ${circle.name} on TripMaker`,
        text: message,
        url: link
      }).then(() => {
        toast.success('Shared successfully!');
      }).catch(() => {
        // Fallback to copying link
        navigator.clipboard.writeText(message);
        toast.success('Message copied to clipboard!');
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(message);
      toast.success('Message copied to clipboard!');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full relative shadow-2xl overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
          title="Close QR code display"
          aria-label="Close QR code display"
        >
          <X size={24} />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <QrCode className="text-indigo-600 w-8 h-8" />
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">
            Join the Circle
          </h3>
          <p className="text-slate-500 text-sm font-medium mb-8">
            Scan this code to instantly join <span className="text-indigo-600 font-bold">{circle.name}</span>
          </p>

          <div className="relative aspect-square w-full max-w-50 mx-auto mb-8 p-4 bg-slate-50 rounded-3xl border border-slate-100">
            {qrUrl ? (
              <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex gap-3">
              <button 
                onClick={handleWhatsAppShare}
                className="flex-1 py-3 bg-green-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-lg shadow-green-200"
              >
                <MessageCircle size={16} />
                WhatsApp
              </button>
              <button 
                onClick={handleMessageShare}
                className="flex-1 py-3 bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200"
              >
                <Send size={16} />
                Message
              </button>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleCopy}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors border border-slate-200"
              >
                {isCopied ? <CheckCircle2 size={16} /> : <Share2 size={16} />}
                {isCopied ? 'Copied' : 'Copy Link'}
              </button>
              <a 
                href={qrUrl}
                download={`circle-qr-${circle.id}.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-slate-100 text-slate-700 rounded-2xl border border-slate-200 hover:bg-slate-200 transition-colors"
                title="Download QR"
              >
                <Download size={18} />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
