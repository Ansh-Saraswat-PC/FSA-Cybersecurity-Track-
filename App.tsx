import React, { useState } from 'react';
import { analyzeContent } from './services/geminiService';
import { FraudAnalysisResult } from './types';
import FileUpload from './components/FileUpload';
import ResultCard from './components/ResultCard';
import { Shield, Search, Terminal, AlertTriangle, Loader2, Sparkles, Image as ImageIcon, Layers } from 'lucide-react';

const App: React.FC = () => {
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [result, setResult] = useState<FraudAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<'text' | 'image' | 'combined'>('combined');

  const handleFileSelect = (file: File | null, base64: string | null) => {
    setSelectedFile(file);
    setFileBase64(base64);
    // Reset result when input changes
    if (file) setResult(null);
  };

  const handleAnalyze = async (type: 'text' | 'image' | 'combined') => {
    if (type === 'text' && !textInput) {
        setError("Please provide text to analyze.");
        return;
    }
    if (type === 'image' && !fileBase64) {
        setError("Please provide an image to analyze.");
        return;
    }
    if (type === 'combined' && (!textInput && !fileBase64)) {
        setError("Please provide input to analyze.");
        return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setAnalysisType(type);

    try {
      const textArg = (type === 'text' || type === 'combined') ? textInput : '';
      const imageArg = (type === 'image' || type === 'combined') ? (fileBase64 || undefined) : undefined;

      const data = await analyzeContent(textArg, imageArg);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const hasText = !!textInput;
  const hasImage = !!fileBase64;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500/30 font-sans relative overflow-x-hidden">
        {/* Background Gradients */}
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
        </div>

        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2 group cursor-default">
                    <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        FraudShield<span className="text-cyan-500"> AI</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                    <span className="hidden sm:flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        SYSTEM ONLINE
                    </span>
                    <span className="border px-2 py-1 rounded border-slate-800 bg-slate-900">v2.0.1</span>
                </div>
            </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
            <div className="space-y-2 mb-10 text-center">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                    Fraud Detection Dashboard
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                    Analyze social media posts, messages, and screenshots for potential scam patterns using <span className="text-cyan-400 font-semibold">Gemini 2.0 Flash</span>.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Input Section */}
                <div className="md:col-span-5 space-y-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-4 text-cyan-400 font-medium">
                            <Terminal className="w-4 h-4" />
                            <span>Input Data</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Social Media Post / Text
                                </label>
                                <textarea
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-600 resize-none h-40"
                                    placeholder="Paste suspicious text, emails, or messages here..."
                                    value={textInput}
                                    onChange={(e) => {
                                        setTextInput(e.target.value);
                                        if (e.target.value) setResult(null); // Reset result on edit
                                    }}
                                />
                            </div>

                            <FileUpload 
                                onFileSelect={handleFileSelect} 
                                selectedFile={selectedFile} 
                                previewUrl={fileBase64}
                            />

                            <div className="pt-2 flex flex-col gap-3">
                                {/* Primary Action: Analyze Combined or Single if only one present */}
                                {(hasText || hasImage) && (
                                    <div className="flex flex-col gap-3">
                                        {/* Combined Button - Only if both present */}
                                        {hasText && hasImage && (
                                            <button
                                                onClick={() => handleAnalyze('combined')}
                                                disabled={loading}
                                                className={`
                                                    w-full py-3 px-4 rounded-lg font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300
                                                    ${loading ? 'bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/20 transform hover:-translate-y-0.5'}
                                                `}
                                            >
                                                {loading && analysisType === 'combined' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                                                Analyze Combined Evidence
                                            </button>
                                        )}

                                        {/* Separate Buttons */}
                                        <div className={`grid gap-3 ${hasText && hasImage ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                            {hasText && (
                                                <button
                                                    onClick={() => handleAnalyze('text')}
                                                    disabled={loading}
                                                    className={`
                                                        py-2.5 px-3 rounded-lg font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 border
                                                        ${hasText && hasImage 
                                                            ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400' 
                                                            : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-transparent hover:-translate-y-0.5 py-3 text-sm font-bold'}
                                                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                                                    `}
                                                >
                                                    {loading && analysisType === 'text' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Terminal className="w-3 h-3" />}
                                                    {hasText && hasImage ? 'Analyze Text Only' : 'Analyze Text'}
                                                </button>
                                            )}

                                            {hasImage && (
                                                <button
                                                    onClick={() => handleAnalyze('image')}
                                                    disabled={loading}
                                                    className={`
                                                        py-2.5 px-3 rounded-lg font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 border
                                                        ${hasText && hasImage 
                                                            ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400' 
                                                            : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-transparent hover:-translate-y-0.5 py-3 text-sm font-bold'}
                                                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                                                    `}
                                                >
                                                    {loading && analysisType === 'image' ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                                                    {hasText && hasImage ? 'Analyze Image Only' : 'Analyze Image'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Empty State for buttons area */}
                                {!hasText && !hasImage && (
                                     <button
                                        disabled={true}
                                        className="w-full py-3 px-4 rounded-lg font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
                                     >
                                         <Search className="w-4 h-4" />
                                         Add Content to Analyze
                                     </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Tips / Placeholder */}
                    {!result && !loading && (
                        <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-5">
                            <h3 className="text-slate-300 font-semibold mb-3 flex items-center gap-2 text-sm">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                Supported Detection Types
                            </h3>
                            <ul className="grid grid-cols-2 gap-2">
                                {['Phishing Links', 'Crypto Scams', 'Fake Giveaways', 'Impersonation', 'Urgency Tactics', 'Job Scams'].map((item) => (
                                    <li key={item} className="text-xs text-slate-500 bg-slate-950/50 px-2 py-1.5 rounded border border-slate-800/50 flex items-center gap-2">
                                        <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Results Section */}
                <div className="md:col-span-7">
                    {error && (
                        <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-6 text-red-200 flex items-start gap-4 mb-6">
                            <AlertTriangle className="w-6 h-6 flex-shrink-0 text-red-500" />
                            <div>
                                <h3 className="font-bold text-red-400">Analysis Error</h3>
                                <p className="text-sm mt-1 opacity-80">{error}</p>
                            </div>
                        </div>
                    )}

                    {loading && (
                         <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-900/30 border border-slate-800/30 rounded-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-10" />
                            <div className="z-20 flex flex-col items-center">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-cyan-500 animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                                <h3 className="mt-6 text-lg font-semibold text-white animate-pulse">Scanning Content...</h3>
                                <p className="text-slate-500 text-sm mt-2">Checking against fraud patterns</p>
                                <div className="mt-8 space-y-2 w-64">
                                     <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-500 w-[60%] animate-[shimmer_2s_infinite]"></div>
                                     </div>
                                     <div className="flex justify-between text-xs text-slate-600 font-mono">
                                         <span>ANALYZING {analysisType?.toUpperCase() || 'DATA'}</span>
                                         <span>{analysisType === 'combined' ? 'CROSS-REFERENCING' : 'PROCESSING'}</span>
                                     </div>
                                </div>
                            </div>
                         </div>
                    )}

                    {result && !loading && (
                        <ResultCard result={result} analysisType={analysisType} />
                    )}

                    {!result && !loading && !error && (
                         <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-600 bg-slate-900/20">
                            <div className="p-4 bg-slate-900 rounded-full mb-4">
                                <Shield className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="text-lg font-medium text-slate-500">Ready to Analyze</p>
                            <p className="text-sm max-w-xs mx-auto mt-2 opacity-60">
                                Upload a screenshot or paste text on the left to generate a comprehensive risk assessment.
                            </p>
                         </div>
                    )}
                </div>
            </div>
        </main>
    </div>
  );
};

export default App;