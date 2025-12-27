import React, { useState } from 'react';
import { analyzeContent } from './services/geminiService';
import { FraudAnalysisResult } from './types';
import FileUpload from './components/FileUpload';
import ResultCard from './components/ResultCard';
import { Shield, Search, Terminal, AlertTriangle, Loader2, Sparkles, Image as ImageIcon, Layers, FileText, ChevronRight, Video, Music, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);

  const [result, setResult] = useState<FraudAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<'text' | 'image' | 'combined'>('combined');
  
  // New State for "Check Source" feature
  const [checkSource, setCheckSource] = useState(false);

  const handleFileSelect = (file: File | null, data: string | null, mimeType: string | null) => {
    setSelectedFile(file);
    setFileData(data);
    setFileMimeType(mimeType);
    if (file) setResult(null);
  };

  const handleAnalyze = async (type: 'text' | 'image' | 'combined') => {
    if (type === 'text' && !textInput) {
        setError("Please provide text to analyze.");
        return;
    }
    if (type === 'image' && !fileData) {
        setError("Please provide a file to analyze.");
        return;
    }
    if (type === 'combined' && (!textInput && !fileData)) {
        setError("Please provide input to analyze.");
        return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setAnalysisType(type);

    try {
      const textArg = (type === 'text' || type === 'combined') ? textInput : '';
      const fileArg = (type === 'image' || type === 'combined') ? (fileData || undefined) : undefined;
      const mimeArg = (type === 'image' || type === 'combined') ? (fileMimeType || undefined) : undefined;

      const data = await analyzeContent(textArg, fileArg, mimeArg, checkSource);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const hasText = !!textInput;
  const hasFile = !!fileData;
  const isImage = fileMimeType?.startsWith('image/');
  const isVideo = fileMimeType?.startsWith('video/');
  const isAudio = fileMimeType?.startsWith('audio/');
  const isDocument = fileMimeType === 'application/pdf' || fileMimeType === 'text/plain';

  const getFileLabel = () => {
      if (isVideo) return 'Video';
      if (isAudio) return 'Audio';
      if (isDocument) return 'Doc';
      return 'Image';
  };

  const getFileIcon = () => {
      if (isVideo) return <Video className="w-4 h-4" />;
      if (isAudio) return <Music className="w-4 h-4" />;
      if (isDocument) return <FileText className="w-4 h-4" />;
      return <ImageIcon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-background text-zinc-200 font-sans relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
        {/* Animated Background Blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-blob mix-blend-screen" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-screen" />
            <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-screen" />
        </div>

        {/* Header */}
        <header className="fixed top-0 w-full z-50 glass border-b-0 border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">
                        FraudShield <span className="text-indigo-400">AI</span>
                    </span>
                </div>
                <div className="flex items-center gap-4">
                     <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-zinc-400">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        Gemini 2.0 Flash
                     </div>
                </div>
            </div>
        </header>

        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                    Detect Fraud with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Precision</span>
                </h1>
                <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                    Advanced AI analysis for text, images, documents, and media.
                    Analyze transcripts and visual cues to secure yourself against scams.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Input Column */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="glass-card rounded-2xl p-6 shadow-2xl">
                        <div className="flex items-center gap-2 mb-6 text-indigo-400 text-sm font-semibold uppercase tracking-wider">
                            <Terminal className="w-4 h-4" />
                            Input Analysis Data
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300 ml-1">Text Content</label>
                                <textarea
                                    className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-4 text-sm text-zinc-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all placeholder:text-zinc-600 resize-none h-32"
                                    placeholder="Paste suspicious messages, emails, or captions..."
                                    value={textInput}
                                    onChange={(e) => {
                                        setTextInput(e.target.value);
                                        if (e.target.value) setResult(null);
                                    }}
                                />
                            </div>

                            <FileUpload 
                                onFileSelect={handleFileSelect} 
                                selectedFile={selectedFile} 
                                previewUrl={fileData}
                                fileMimeType={fileMimeType}
                            />

                            <div className="pt-2 flex flex-col gap-3">
                                {/* Toggle Check Source */}
                                <div 
                                    onClick={() => setCheckSource(!checkSource)}
                                    className={`
                                        flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-300
                                        ${checkSource 
                                            ? 'bg-blue-500/10 border-blue-500/50' 
                                            : 'bg-zinc-900/30 border-white/5 hover:bg-zinc-800/50'}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${checkSource ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                            <Globe className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-medium ${checkSource ? 'text-blue-400' : 'text-zinc-300'}`}>
                                                Verify Source
                                            </span>
                                            <span className="text-xs text-zinc-500">Check via Google Search</span>
                                        </div>
                                    </div>
                                    <div className={`
                                        w-10 h-5 rounded-full relative transition-colors duration-300
                                        ${checkSource ? 'bg-blue-500' : 'bg-zinc-700'}
                                    `}>
                                        <div className={`
                                            absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-300
                                            ${checkSource ? 'left-6' : 'left-1'}
                                        `} />
                                    </div>
                                </div>

                                {/* Primary Action */}
                                {(hasText || hasFile) && (
                                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        {hasText && hasFile && (
                                            <button
                                                onClick={() => handleAnalyze('combined')}
                                                disabled={loading}
                                                className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-900/20 hover:shadow-indigo-900/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading && analysisType === 'combined' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                                                Cross-Reference Analysis
                                            </button>
                                        )}

                                        <div className={`grid gap-3 ${hasText && hasFile ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                            {hasText && (
                                                <button
                                                    onClick={() => handleAnalyze('text')}
                                                    disabled={loading}
                                                    className={`
                                                        py-3 px-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 border
                                                        ${hasText && hasFile 
                                                            ? 'bg-zinc-800/50 border-white/10 hover:bg-zinc-800 text-zinc-300 hover:text-white' 
                                                            : 'bg-white text-zinc-950 border-transparent hover:bg-zinc-200 shadow-lg shadow-white/5'}
                                                        disabled:opacity-50 disabled:cursor-not-allowed
                                                    `}
                                                >
                                                    {loading && analysisType === 'text' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
                                                    {hasText && hasFile ? 'Text Only' : 'Analyze Text'}
                                                </button>
                                            )}

                                            {hasFile && (
                                                <button
                                                    onClick={() => handleAnalyze('image')}
                                                    disabled={loading}
                                                    className={`
                                                        py-3 px-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 border
                                                        ${hasText && hasFile 
                                                            ? 'bg-zinc-800/50 border-white/10 hover:bg-zinc-800 text-zinc-300 hover:text-white' 
                                                            : 'bg-white text-zinc-950 border-transparent hover:bg-zinc-200 shadow-lg shadow-white/5'}
                                                        disabled:opacity-50 disabled:cursor-not-allowed
                                                    `}
                                                >
                                                    {loading && analysisType === 'image' ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : getFileIcon()}
                                                    {hasText && hasFile 
                                                        ? `${getFileLabel()} Only` 
                                                        : `Analyze ${getFileLabel()}`
                                                    }
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Column */}
                <div className="lg:col-span-7 h-full">
                    {error && (
                        <div className="glass-card bg-red-500/10 border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-200 animate-in fade-in slide-in-from-top-2">
                            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {loading && (
                        <div className="h-[500px] glass-card rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent"></div>
                             <div className="relative z-10 flex flex-col items-center">
                                 <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-indigo-500 animate-spin flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                                    <div className="w-12 h-12 bg-indigo-500/20 rounded-full animate-pulse-slow"></div>
                                 </div>
                                 <h3 className="mt-8 text-xl font-semibold text-white">Analyzing Content</h3>
                                 <p className="text-zinc-500 mt-2 text-sm">
                                    {checkSource ? 'Searching web & verifying sources...' : 'Identifying fraud patterns & vectors...'}
                                 </p>
                                 
                                 <div className="mt-8 flex gap-2 text-xs font-mono text-zinc-600 uppercase tracking-widest">
                                     <span>{analysisType}</span>
                                     <span className="text-zinc-700">•</span>
                                     <span>{checkSource ? 'Web Check' : 'Processing'}</span>
                                 </div>
                             </div>
                        </div>
                    )}

                    {!result && !loading && !error && (
                         <div className="h-[500px] glass-card rounded-2xl flex flex-col items-center justify-center text-center p-8 border-dashed border-2 border-white/5">
                            <div className="w-20 h-20 bg-zinc-900/50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/5 rotate-3">
                                <Search className="w-8 h-8 text-zinc-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-zinc-300 mb-2">Ready to Scan</h3>
                            <p className="text-zinc-500 max-w-sm mx-auto mb-8">
                                Upload evidence (Image, PDF, Audio, Video) or paste text to generate a comprehensive threat assessment report.
                            </p>
                            
                            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                                {['Phishing', 'Crypto Scams', 'Identity Theft', 'Social Engineering'].map(tag => (
                                    <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-zinc-500">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                         </div>
                    )}

                    {result && !loading && (
                        <ResultCard result={result} analysisType={analysisType} />
                    )}
                </div>
            </div>
        </main>
    </div>
  );
};

export default App;