import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, AlertOctagon, CheckCircle2, ChevronRight, Terminal, Image as ImageIcon, Layers, FileText, Video, Music, FileAudio, AlignLeft, ScanText, Activity, Globe } from 'lucide-react';
import { FraudAnalysisResult } from '../types';

interface ResultCardProps {
  result: FraudAnalysisResult;
  analysisType: 'text' | 'image' | 'combined';
}

const ResultCard: React.FC<ResultCardProps> = ({ result, analysisType }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'forensics'>('analysis');
  const [displayScore, setDisplayScore] = useState(0);

  // Calculate Safety Score (inverse of Risk Score)
  const safetyScore = Math.max(0, 100 - result.riskScore);

  useEffect(() => {
    // Animate the score counter
    const duration = 1500;
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        
        const current = Math.floor(startValue + (safetyScore - startValue) * ease);
        setDisplayScore(current);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };

    requestAnimationFrame(animate);
  }, [safetyScore]);


  const getRiskColor = (risk: number) => {
    // Risk < 20 (Safety > 80) -> Green
    if (risk < 20) return { text: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20', stroke: 'text-emerald-500' };
    // Risk < 50 (Safety > 50) -> Yellow
    if (risk < 50) return { text: 'text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-500/30', glow: 'shadow-yellow-500/20', stroke: 'text-yellow-500' };
    // Risk < 80 (Safety > 20) -> Orange
    if (risk < 80) return { text: 'text-orange-400', bg: 'bg-orange-500', border: 'border-orange-500/30', glow: 'shadow-orange-500/20', stroke: 'text-orange-500' };
    // Risk >= 80 (Safety < 20) -> Red
    return { text: 'text-red-500', bg: 'bg-red-500', border: 'border-red-500/30', glow: 'shadow-red-500/20', stroke: 'text-red-500' };
  };

  const getAnalysisTypeIcon = () => {
      switch(analysisType) {
          case 'text': return <Terminal className="w-3.5 h-3.5" />;
          case 'image': return <Layers className="w-3.5 h-3.5" />;
          case 'combined': return <Layers className="w-3.5 h-3.5" />;
      }
  };

  const colors = getRiskColor(result.riskScore);
  
  // SVG Config
  const radius = 36; // Increased size slightly
  const circumference = 2 * Math.PI * radius;
  // Calculate offset based on Safety Score (0 to 100)
  // 100 safety = full circle (offset 0)
  // 0 safety = empty circle (offset circumference)
  // We want to animate this too, but CSS transition handles it well if we pass the target
  const strokeDashoffset = circumference - (safetyScore / 100) * circumference;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      {/* Top Summary Card (Always Visible) */}
      <div className={`glass-card rounded-2xl p-8 relative overflow-hidden group`}>
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-16 -mt-16 transition-opacity opacity-50`}></div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex-1">
             <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/5 border border-white/5 text-zinc-400 flex items-center gap-1.5`}>
                   {getAnalysisTypeIcon()}
                   {analysisType} Analysis
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                    ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                </span>
             </div>
             <h2 className={`text-4xl font-bold tracking-tight ${colors.text} mb-1 drop-shadow-sm`}>
                 {result.verdict}
             </h2>
             <p className="text-zinc-400 text-sm max-w-md leading-relaxed">
                 Based on the analysis of provided evidence, this content has been flagged as 
                 <span className={`font-semibold ml-1 ${colors.text}`}>{result.verdict.toLowerCase()}</span>.
             </p>
          </div>

          <div className="relative flex items-center justify-center shrink-0 p-2">
             {/* Circular Progress Meter */}
             <div className="relative w-32 h-32">
                {/* Glow effect behind the meter */}
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 ${colors.bg}`}></div>
                
                <svg className="w-full h-full transform -rotate-90">
                    {/* Background Circle */}
                    <circle 
                        cx="64" cy="64" r={radius} 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        className="text-zinc-800/50" 
                    />
                    {/* Progress Circle */}
                    <circle 
                        cx="64" cy="64" r={radius} 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={strokeDashoffset} 
                        strokeLinecap="round"
                        className={`${colors.stroke} transition-all duration-1000 ease-out`} 
                    />
                </svg>
                
                {/* Centered Metric */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pb-2">
                    <div className="relative flex items-center justify-center">
                        <span className={`text-4xl font-bold tracking-tighter ${colors.text}`}>
                            {displayScore}
                        </span>
                        <span className={`absolute left-full top-1 text-lg font-bold ml-0.5 ${colors.text}`}>
                            %
                        </span>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex gap-2 p-1 bg-zinc-900/40 rounded-xl border border-white/5 backdrop-blur-sm">
        <button
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'analysis' 
                ? 'bg-zinc-800 text-white shadow-lg' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
        >
            <Activity className="w-4 h-4" />
            Analysis Report
        </button>
        <button
            onClick={() => setActiveTab('forensics')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'forensics' 
                ? 'bg-zinc-800 text-white shadow-lg' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
        >
            <ScanText className="w-4 h-4" />
            Forensics & Evidence
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'analysis' ? (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Red Flags Panel */}
                    <div className="glass-card rounded-2xl p-6 border-l-4 border-l-red-500/50">
                    <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                        <AlertOctagon className="w-4 h-4 text-red-400" />
                        Threat Indicators
                    </h3>
                    {result.redFlags.length > 0 ? (
                        <ul className="space-y-3">
                        {result.redFlags.map((flag, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                            <span className="leading-relaxed">{flag}</span>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-zinc-500 italic text-sm">No critical red flags identified.</p>
                    )}
                    </div>

                    {/* Recommendations Panel */}
                    <div className="glass-card rounded-2xl p-6 border-l-4 border-l-indigo-500/50">
                    <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                        Safety Protocols
                    </h3>
                    <ul className="space-y-3">
                        {result.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300 group">
                            <ChevronRight className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                            <span className="leading-relaxed">{rec}</span>
                            </li>
                        ))}
                    </ul>
                    </div>
                </div>

                 {/* Full Analysis Text */}
                <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">Comprehensive Analysis</h3>
                    <p className="text-zinc-400 text-sm leading-7 whitespace-pre-wrap">
                        {result.analysis}
                    </p>
                </div>
                
                {/* Verified Sources / Grounding */}
                {result.groundingChunks && result.groundingChunks.length > 0 && (
                    <div className="glass-card rounded-2xl p-6 border border-blue-500/20">
                         <h3 className="text-sm font-semibold text-blue-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <Globe className="w-4 h-4" />
                            Verified Sources (Google Search)
                        </h3>
                        <div className="grid gap-2">
                            {result.groundingChunks.map((chunk, idx) => (
                                chunk.web?.uri ? (
                                    <a 
                                        key={idx} 
                                        href={chunk.web.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-white/5 hover:bg-zinc-800 transition-colors group"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-zinc-300 group-hover:text-blue-400 transition-colors truncate max-w-[250px] sm:max-w-md">
                                                {chunk.web.title}
                                            </span>
                                            <span className="text-xs text-zinc-500 truncate max-w-[250px] sm:max-w-md">
                                                {chunk.web.uri}
                                            </span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-blue-400" />
                                    </a>
                                ) : null
                            ))}
                        </div>
                    </div>
                )}
             </div>
        ) : (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* OCR Section */}
                {result.ocrText && (
                    <div className="glass-card rounded-2xl p-6 border border-indigo-500/20">
                        <h3 className="text-sm font-semibold text-indigo-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <ScanText className="w-4 h-4" />
                            OCR Extraction (Image/Doc)
                        </h3>
                        <div className="bg-zinc-950/50 rounded-lg p-4 max-h-[400px] overflow-y-auto border border-white/5 scrollbar-thin font-mono text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                            {result.ocrText}
                        </div>
                    </div>
                )}

                {/* Transcript Section */}
                {result.transcript && (
                    <div className="glass-card rounded-2xl p-6 border border-pink-500/20">
                    <h3 className="text-sm font-semibold text-pink-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <AlignLeft className="w-4 h-4" />
                        Audio/Video Transcript
                    </h3>
                    <div className="bg-zinc-950/50 rounded-lg p-4 max-h-[400px] overflow-y-auto border border-white/5 scrollbar-thin font-mono text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                            {result.transcript}
                    </div>
                    </div>
                )}

                {!result.ocrText && !result.transcript && (
                    <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                            <ScanText className="w-8 h-8 text-zinc-600" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-400">No Raw Evidence Extracted</h3>
                        <p className="text-zinc-500 text-sm mt-2 max-w-xs">
                            No readable text, audio, or video content was identified for extraction in this analysis.
                        </p>
                    </div>
                )}
             </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;