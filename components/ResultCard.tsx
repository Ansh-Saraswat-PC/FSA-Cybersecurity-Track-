import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, AlertOctagon, CheckCircle2, ChevronRight, Terminal, Image as ImageIcon, Layers } from 'lucide-react';
import { FraudAnalysisResult } from '../types';

interface ResultCardProps {
  result: FraudAnalysisResult;
  analysisType: 'text' | 'image' | 'combined';
}

const ResultCard: React.FC<ResultCardProps> = ({ result, analysisType }) => {
  const getRiskColor = (score: number) => {
    if (score < 20) return 'text-emerald-400 border-emerald-500/50 bg-emerald-950/20';
    if (score < 50) return 'text-yellow-400 border-yellow-500/50 bg-yellow-950/20';
    if (score < 80) return 'text-orange-400 border-orange-500/50 bg-orange-950/20';
    return 'text-red-500 border-red-500/50 bg-red-950/20';
  };

  const getRiskIcon = (verdict: string) => {
    switch (verdict) {
      case 'Safe': return <ShieldCheck className="w-12 h-12 text-emerald-400" />;
      case 'Low Risk': return <CheckCircle2 className="w-12 h-12 text-emerald-400" />;
      case 'Suspicious': return <AlertTriangle className="w-12 h-12 text-yellow-400" />;
      case 'High Risk': return <ShieldAlert className="w-12 h-12 text-orange-400" />;
      case 'Critical': return <AlertOctagon className="w-12 h-12 text-red-500" />;
      default: return <ShieldCheck className="w-12 h-12 text-slate-400" />;
    }
  };
  
  const getAnalysisTypeBadge = () => {
    switch(analysisType) {
        case 'text':
            return <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-900 border border-slate-700 px-2 py-1 rounded text-slate-400"><Terminal className="w-3 h-3" /> TEXT ANALYSIS</div>;
        case 'image':
            return <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-900 border border-slate-700 px-2 py-1 rounded text-slate-400"><ImageIcon className="w-3 h-3" /> IMAGE ANALYSIS</div>;
        case 'combined':
            return <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-900 border border-slate-700 px-2 py-1 rounded text-slate-400"><Layers className="w-3 h-3" /> COMBINED ANALYSIS</div>;
    }
  };

  const riskColorClass = getRiskColor(result.riskScore);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Summary Card */}
      <div className={`rounded-xl border p-6 flex items-center justify-between ${riskColorClass} backdrop-blur-sm relative overflow-hidden`}>
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-slate-950/50 rounded-full border border-white/10">
            {getRiskIcon(result.verdict)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
                <h2 className="text-3xl font-bold tracking-tight">{result.verdict}</h2>
            </div>
            <p className="text-sm opacity-80 uppercase tracking-widest font-mono">
              Risk Score: {result.riskScore}/100
            </p>
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-2 relative z-10">
             {getAnalysisTypeBadge()}
             <div className="flex items-center gap-2 text-sm font-medium opacity-80">
                <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                Gemini 2.0 Flash
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Red Flags Panel */}
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6 backdrop-blur-sm hover:border-red-900/50 transition-colors">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-500" />
            Detected Red Flags
          </h3>
          {result.redFlags.length > 0 ? (
            <ul className="space-y-3">
              {result.redFlags.map((flag, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-red-950/10 border border-red-900/20">
                   <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                   <span className="text-red-200 text-sm leading-relaxed">{flag}</span>
                </li>
              ))}
            </ul>
          ) : (
             <p className="text-slate-500 italic">No specific red flags detected.</p>
          )}
        </div>

        {/* Analysis Panel */}
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
             <ShieldCheck className="w-5 h-5 text-cyan-500" />
             AI Analysis
          </h3>
          <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
            {result.analysis}
          </p>
          
          <div className="mt-6 pt-6 border-t border-slate-800">
            <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Recommendations</h4>
            <ul className="space-y-2">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-cyan-100/80">
                  <ChevronRight className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;