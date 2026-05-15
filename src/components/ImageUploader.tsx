import React, { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { GlassCard } from './glass/GlassCard';

interface ImageUploaderProps {
  onUpload: (blob: Blob) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <GlassCard className="flex flex-col items-center justify-center p-12 border-dashed border-2 border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer group" delay={0.1}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        aria-label="Upload image for analysis"
        id="image-upload-input"
      />
      <div 
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className="flex flex-col items-center gap-4 outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-3xl p-4"
        role="button"
        tabIndex={0}
        aria-labelledby="upload-title"
        title="Upload image for analysis"
      >
        <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <Upload className="w-12 h-12 text-indigo-400" />
        </div>
        <div className="text-center">
          <h3 id="upload-title" className="text-3xl font-black mb-2 tracking-tight">Upload Image</h3>
          <p className="text-slate-400 font-medium">Drag and drop or click to browse</p>
        </div>
      </div>
    </GlassCard>
  );
};

export default ImageUploader;
