import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, FileText, FileType2, Loader2, CheckCircle, Video, Music } from 'lucide-react';
import mammoth from 'mammoth';

interface FileUploadProps {
  onFileSelect: (file: File | null, data: string | null, mimeType: string | null) => void;
  selectedFile: File | null;
  previewUrl: string | null;
  fileMimeType?: string | null;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB limit for browser Base64 handling

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile, previewUrl, fileMimeType }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
        alert("File size exceeds 20MB limit. Please upload a smaller file.");
        return;
    }

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    onFileSelect(null, null, null);
    setProcessing(true);

    try {
        if (fileType.startsWith('image/') || fileType.startsWith('audio/') || fileType.startsWith('video/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onFileSelect(file, reader.result as string, fileType);
                setProcessing(false);
            };
            reader.readAsDataURL(file);
        } else if (fileType === 'application/pdf') {
            const reader = new FileReader();
            reader.onloadend = () => {
                onFileSelect(file, reader.result as string, 'application/pdf');
                setProcessing(false);
            };
            reader.readAsDataURL(file);
        } else if (fileName.endsWith('.docx') || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const arrayBuffer = reader.result as ArrayBuffer;
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    onFileSelect(file, result.value, 'text/plain');
                } catch (err) {
                    console.error("DOCX extraction failed", err);
                    alert("Failed to read DOCX file.");
                    onFileSelect(null, null, null);
                } finally {
                    setProcessing(false);
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert('Unsupported file type.');
            setProcessing(false);
        }
    } catch (e) {
        console.error("File processing error", e);
        setProcessing(false);
    }
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
    onFileSelect(null, null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderPreview = () => {
      if (!fileMimeType || !previewUrl) return <div className="w-full h-full bg-indigo-500/20"></div>;

      if (fileMimeType.startsWith('image/')) {
          return <img src={previewUrl} className="w-full h-full object-cover" />;
      }
      if (fileMimeType.startsWith('video/')) {
          return <video src={previewUrl} className="w-full h-full object-cover" autoPlay muted loop />;
      }
      if (fileMimeType.startsWith('audio/')) {
          return (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                <Music className="w-12 h-12 text-indigo-400 animate-pulse" />
            </div>
          );
      }
      return <div className="w-full h-full bg-zinc-800/50"></div>;
  };

  const getIcon = () => {
      if (fileMimeType?.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-indigo-400" />;
      if (fileMimeType?.startsWith('video/')) return <Video className="w-8 h-8 text-indigo-400" />;
      if (fileMimeType?.startsWith('audio/')) return <Music className="w-8 h-8 text-pink-400" />;
      if (fileMimeType === 'application/pdf') return <FileText className="w-8 h-8 text-red-400" />;
      return <FileType2 className="w-8 h-8 text-blue-400" />;
  };

  return (
    <div className="w-full space-y-2">
      <label className="text-sm font-medium text-zinc-300 ml-1">Evidence (Media & Docs)</label>
      
      {!selectedFile && !processing ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative overflow-hidden rounded-xl border border-dashed transition-all duration-300 cursor-pointer p-6
            flex flex-col items-center justify-center text-center gap-2 group h-32
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-500/10' 
              : 'border-white/10 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-white/20'}
          `}
        >
          <div className="bg-zinc-800 p-2 rounded-lg group-hover:scale-110 transition-transform">
             <Upload className="w-5 h-5 text-zinc-400 group-hover:text-white" />
          </div>
          <div>
              <p className="text-sm font-medium text-zinc-300">Drop files or click to upload</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide">IMG, PDF, DOCX, MP3, MP4</p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-zinc-900/50 group h-32 flex items-center justify-center">
            {processing ? (
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                    <span className="text-xs text-zinc-500 font-medium">Processing...</span>
                </div>
            ) : (
                <>
                    {/* Background Preview */}
                    <div className="absolute inset-0 z-0 opacity-20 blur-sm">
                        {renderPreview()}
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center gap-2">
                        {getIcon()}
                        <span className="text-sm font-medium text-white max-w-[200px] truncate px-4">
                            {selectedFile?.name}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 uppercase tracking-widest bg-black/50 px-2 py-0.5 rounded">
                           <CheckCircle className="w-3 h-3 text-emerald-500" />
                           Ready
                        </div>
                    </div>

                    <button 
                        onClick={(e) => { e.stopPropagation(); clearFile(); }}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 rounded-lg text-zinc-400 hover:text-white transition-colors z-20 backdrop-blur-sm"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </>
            )}
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange} 
        className="hidden" 
        accept=".jpg,.jpeg,.png,.webp,.pdf,.docx,.mp3,.wav,.mp4,.webm"
      />
    </div>
  );
};

export default FileUpload;