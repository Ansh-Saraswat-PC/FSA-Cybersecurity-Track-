import React, { useState, useEffect, useRef } from 'react';
import { analyzeContent, createChatSession } from './services/geminiService';
import { FraudAnalysisResult, RiskThresholds, ViewState, HistoryItem } from './types';
import FileUpload from './components/FileUpload';
import ResultCard from './components/ResultCard';
import Sidebar from './components/Sidebar';
import SettingsView from './components/SettingsView';
import ChatView from './components/ChatView';
import { Terminal, AlertTriangle, Loader2, Image as ImageIcon, Layers, Video, Music, Globe, FileText, ArrowRight, ShieldCheck, MessageSquareText } from 'lucide-react';
import { Chat } from "@google/genai";

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Input State
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);
  const [checkSource, setCheckSource] = useState(false);

  // Analysis State
  const [result, setResult] = useState<FraudAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<'text' | 'image' | 'combined'>('combined');

  // Config State
  const [thresholds, setThresholds] = useState<RiskThresholds>({ low: 20, medium: 50, high: 80 });
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Chat Session Ref
  const chatSessionRef = useRef<Chat | null>(null);

  useEffect(() => {
    // Initialize chat session once
    if (!chatSessionRef.current) {
        chatSessionRef.current = createChatSession();
    }
  }, []);

  // Theme Handling
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
        root.classList.add('light');
    } else {
        root.classList.remove('light');
    }
  }, [theme]);

  const handleFileSelect = (file: File | null, data: string | null, mimeType: string | null) => {
    setSelectedFile(file);
    setFileData(data);
    setFileMimeType(mimeType);
  };

  const saveToHistory = (res: FraudAnalysisResult, type: string) => {
      const newItem: HistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toLocaleString(),
          verdict: res.verdict,
          riskScore: res.riskScore,
          type: type,
          result: res
      };
      setHistory(prev => [newItem, ...prev]);
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

    setLoading(true);
    setError(null);
    setResult(null);
    setAnalysisType(type);

    try {
      const textArg = (type === 'text' || type === 'combined') ? textInput : '';
      const fileArg = (type === 'image' || type === 'combined') ? (fileData || undefined) : undefined;
      const mimeArg = (type === 'image' || type === 'combined') ? (fileMimeType || undefined) : undefined;

      const data = await analyzeContent(textArg, fileArg, mimeArg, checkSource);
      data.id = Math.random().toString(36).substr(2, 9).toUpperCase();
      data.timestamp = new Date().toLocaleString();
      
      setResult(data);
      saveToHistory(data, type);
      
      // Auto-navigate to result view
      setCurrentView('risk');

    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryLoad = (item: HistoryItem) => {
      setResult(item.result);
      setCurrentView('risk');
  };

  // Render Views
  const renderContent = () => {
      switch (currentView) {
          case 'home':
              return (
                <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-500 py-12">
                     <div className="text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20">
                            <ShieldCheck className="w-3 h-3" />
                            <span>AI-Powered Fraud Detection</span>
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tight text-textMain">
                            Verify Before You Trust
                        </h1>
                        <p className="text-lg text-textMuted max-w-2xl mx-auto leading-relaxed">
                            Analyze suspicious messages, social media posts, and documents instantly using Gemini 2.0 Flash.
                            Detect phishing, scams, and manipulation with forensic precision.
                        </p>
                        <div className="flex justify-center gap-4 pt-4">
                            <button onClick={() => setCurrentView('text')} className="px-6 py-3 rounded-xl bg-surfaceHighlight hover:bg-surface border border-border text-textMain font-medium transition-all">
                                Analyze Text
                            </button>
                            <button onClick={() => setCurrentView('image')} className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 font-medium transition-all flex items-center gap-2">
                                Scan Media <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                     </div>
                     
                     <div className="grid md:grid-cols-3 gap-6">
                        <div className="glass-card p-6 rounded-2xl group hover:border-indigo-500/30 transition-colors cursor-pointer" onClick={() => setCurrentView('chat')}>
                            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-3 rounded-xl w-fit mb-4">
                                <MessageSquareText className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-textMain mb-2">Ask Cyberfriend</h3>
                            <p className="text-sm text-textMuted">Chat with our AI assistant for general advice, tips, and security questions.</p>
                        </div>
                        <div className="glass-card p-6 rounded-2xl">
                            <Layers className="w-8 h-8 text-blue-400 mb-4" />
                            <h3 className="text-lg font-semibold text-textMain mb-2">Image Forensics</h3>
                            <p className="text-sm text-textMuted">Analyze screenshots, manipulated logos, and visual fraud indicators.</p>
                        </div>
                        <div className="glass-card p-6 rounded-2xl">
                            <Globe className="w-8 h-8 text-purple-400 mb-4" />
                            <h3 className="text-lg font-semibold text-textMain mb-2">Web Grounding</h3>
                            <p className="text-sm text-textMuted">Verify claims against live Google Search results to debunk fake offers.</p>
                        </div>
                     </div>
                </div>
              );

          case 'chat':
              return <ChatView chatSession={chatSessionRef} />;

          case 'text':
              return (
                  <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
                      <h2 className="text-3xl font-bold text-textMain mb-6 flex items-center gap-3">
                          <Terminal className="w-8 h-8 text-emerald-400" />
                          Text Analysis
                      </h2>
                      <div className="glass-card rounded-2xl p-6 shadow-2xl">
                          <textarea
                                className="w-full bg-surface/50 border border-border rounded-xl p-4 text-sm text-textMain focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all placeholder:text-textMuted/50 resize-none h-48 mb-6"
                                placeholder="Paste suspicious message content here..."
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                            />
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={checkSource} 
                                        onChange={(e) => setCheckSource(e.target.checked)}
                                        className="w-4 h-4 rounded border-border bg-surface text-indigo-600 focus:ring-indigo-500/50" 
                                    />
                                    <span className="text-sm text-textMuted group-hover:text-textMain transition-colors">Enable Google Search Verification</span>
                                </label>
                                <button
                                    onClick={() => handleAnalyze('text')}
                                    disabled={loading || !textInput}
                                    className="px-8 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg disabled:opacity-50 transition-all"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze Text"}
                                </button>
                            </div>
                      </div>
                  </div>
              );

          case 'image':
              return (
                <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-3xl font-bold text-textMain mb-6 flex items-center gap-3">
                        <ImageIcon className="w-8 h-8 text-blue-400" />
                        Media Analysis
                    </h2>
                    <div className="glass-card rounded-2xl p-6 shadow-2xl space-y-6">
                        <FileUpload 
                            onFileSelect={handleFileSelect} 
                            selectedFile={selectedFile} 
                            previewUrl={fileData}
                            fileMimeType={fileMimeType}
                        />
                        <div className="flex items-center justify-between">
                             <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    checked={checkSource} 
                                    onChange={(e) => setCheckSource(e.target.checked)}
                                    className="w-4 h-4 rounded border-border bg-surface text-indigo-600 focus:ring-indigo-500/50" 
                                />
                                <span className="text-sm text-textMuted group-hover:text-textMain transition-colors">Enable Google Search Verification</span>
                            </label>
                            <button
                                onClick={() => handleAnalyze('image')}
                                disabled={loading || !fileData}
                                className="px-8 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg disabled:opacity-50 transition-all"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze Media"}
                            </button>
                        </div>
                    </div>
                </div>
              );

          case 'risk':
              return result ? (
                  <div className="max-w-5xl mx-auto">
                      <ResultCard result={result} analysisType={analysisType} thresholds={thresholds} />
                  </div>
              ) : null;

          case 'ocr':
              return result ? (
                  <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                      <div className="flex items-center gap-3 mb-6">
                          <div className="bg-pink-500/20 p-2 rounded-lg text-pink-400">
                              <FileText className="w-6 h-6" />
                          </div>
                          <h2 className="text-2xl font-bold text-textMain">Forensics & Extraction</h2>
                      </div>
                      
                      <div className="grid gap-6">
                        {/* OCR */}
                        <div className="glass-card rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-indigo-400 mb-4 uppercase tracking-wider">Raw Text Extraction</h3>
                            {result.ocrText ? (
                                <div className="bg-surface/50 rounded-lg p-4 max-h-[500px] overflow-y-auto border border-border font-mono text-xs text-textMuted leading-relaxed whitespace-pre-wrap">
                                    {result.ocrText}
                                </div>
                            ) : (
                                <p className="text-textMuted italic text-sm">No text extracted from image/document.</p>
                            )}
                        </div>

                         {/* Transcript */}
                         <div className="glass-card rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-pink-400 mb-4 uppercase tracking-wider">Audio/Video Transcript</h3>
                            {result.transcript ? (
                                <div className="bg-surface/50 rounded-lg p-4 max-h-[500px] overflow-y-auto border border-border font-mono text-xs text-textMuted leading-relaxed whitespace-pre-wrap">
                                    {result.transcript}
                                </div>
                            ) : (
                                <p className="text-textMuted italic text-sm">No transcript available.</p>
                            )}
                        </div>
                      </div>
                  </div>
              ) : null;

          case 'settings':
              return (
                  <SettingsView 
                    thresholds={thresholds}
                    onSaveThresholds={setThresholds}
                    theme={theme}
                    onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                    history={history}
                    onClearHistory={() => setHistory([])}
                    onLoadHistoryItem={handleHistoryLoad}
                  />
              );
          
          default:
              return null;
      }
  };

  return (
    <div className="min-h-screen bg-background text-textMain font-sans relative flex overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-blob mix-blend-screen" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-screen" />
            <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-screen" />
        </div>

        <Sidebar 
            currentView={currentView} 
            onChangeView={setCurrentView} 
            hasResult={!!result} 
        />

        <main className="flex-1 ml-64 overflow-y-auto h-screen relative z-10 p-8">
            {/* Global Error Display */}
            {error && (
                <div className="max-w-4xl mx-auto glass-card bg-red-500/10 border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-200 animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-xs hover:text-white underline">Dismiss</button>
                </div>
            )}
            
            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full border-4 border-surfaceHighlight border-t-indigo-500 animate-spin mb-4 shadow-2xl"></div>
                        <h3 className="text-xl font-semibold text-textMain animate-pulse">Analyzing content...</h3>
                        <p className="text-textMuted text-sm mt-2">Running forensic checks</p>
                    </div>
                </div>
            )}

            {renderContent()}
        </main>
    </div>
  );
};

export default App;