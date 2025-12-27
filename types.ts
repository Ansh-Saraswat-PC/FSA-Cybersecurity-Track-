export interface FraudAnalysisResult {
  id?: string;
  timestamp?: string;
  riskScore: number;
  verdict: 'Safe' | 'Low Risk' | 'Suspicious' | 'High Risk' | 'Critical';
  redFlags: {
    flag: string;
    explanation: string;
  }[];
  analysis: string;
  recommendations: string[];
  transcript?: string;
  ocrText?: string;
  groundingChunks?: {
    web?: {
      uri: string;
      title: string;
    }
  }[];
}

export interface AnalysisRequest {
  text?: string;
  image?: string; // Base64
  mimeType?: string;
}

export interface RiskThresholds {
  low: number;
  medium: number;
  high: number;
}

export type ViewState = 'home' | 'chat' | 'text' | 'image' | 'risk' | 'ocr' | 'settings';

export interface HistoryItem {
  id: string;
  date: string;
  verdict: string;
  riskScore: number;
  type: string;
  result: FraudAnalysisResult;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}