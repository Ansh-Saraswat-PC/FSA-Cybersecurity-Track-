export interface FraudAnalysisResult {
  riskScore: number;
  verdict: 'Safe' | 'Low Risk' | 'Suspicious' | 'High Risk' | 'Critical';
  redFlags: string[];
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