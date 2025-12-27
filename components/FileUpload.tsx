import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File | null, base64: string | null) => void;
  selectedFile: File | null;
  previewUrl: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile, previewUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onFileSelect(file, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    onFileSelect(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-400 mb-2">Evidence Image (Optional)</label>
      
      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 cursor-pointer transition-all duration-300
            flex flex-col items-center justify-center text-center group
            ${isDragging 
              ? 'border-cyan-500 bg-cyan-950/20' 
              : 'border-slate-700 hover:border-slate-500 bg-slate-900/50 hover:bg-slate-900'}
          `}
        >
          <div className="p-3 rounded-full bg-slate-800 group-hover:bg-slate-700 transition-colors mb-4">
            <Upload className={`w-6 h-6 ${isDragging ? 'text-cyan-400' : 'text-slate-400'}`} />
          </div>
          <p className="text-sm text-slate-300 font-medium">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-slate-500 mt-1">
            PNG, JPG, WEBP (Max 5MB)
          </p>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-900 group">
            {previewUrl && (
                <div className="h-48 w-full bg-slate-950 flex items-center justify-center relative">
                    <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="h-full w-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-50"></div>
                </div>
            )}
            <div className="p-3 flex items-center justify-between bg-slate-800 border-t border-slate-700">
                <div className="flex items-center space-x-3 overflow-hidden">
                    <ImageIcon className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                    <span className="text-sm text-slate-300 truncate">{selectedFile.name}</span>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); clearFile(); }}
                    className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-red-400 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
    </div>
  );
};

export default FileUpload;
