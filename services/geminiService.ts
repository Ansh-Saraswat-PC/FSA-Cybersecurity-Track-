import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FraudAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    riskScore: {
      type: Type.INTEGER,
      description: "A score from 0 to 100 indicating the likelihood of fraud. 0 is safe, 100 is definite scam.",
    },
    verdict: {
      type: Type.STRING,
      enum: ["Safe", "Low Risk", "Suspicious", "High Risk", "Critical"],
      description: "The overall verdict of the content.",
    },
    redFlags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of specific red flags found in the content (e.g., 'Urgency', 'Too good to be true').",
    },
    analysis: {
      type: Type.STRING,
      description: "A detailed explanation of why the content was flagged or marked safe. Max 200 words.",
    },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Actionable advice for the user (e.g., 'Do not click the link', 'Verify the sender').",
    },
  },
  required: ["riskScore", "verdict", "redFlags", "analysis", "recommendations"],
};

export const analyzeContent = async (
  text: string,
  base64Image?: string,
  mimeType: string = "image/png"
): Promise<FraudAnalysisResult> => {
  try {
    const parts: any[] = [];

    if (text) {
      parts.push({ text: `Analyze this content for fraud, scams, or malicious intent. Text content: "${text}"` });
    }

    if (base64Image) {
      // Remove data URL prefix if present
      const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType,
        },
      });
      
      const imagePrompt = text 
        ? "Also analyze the provided image for visual indicators of scams (fake screenshots, manipulated branding, phishing layouts) and check for consistency with the text." 
        : "Analyze the provided image for visual indicators of scams (fake screenshots, manipulated branding, phishing layouts, suspicious text in image).";
      
      parts.push({ text: imagePrompt });
    }

    if (parts.length === 0) {
      throw new Error("No content provided for analysis.");
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        role: "user",
        parts: parts,
      },
      config: {
        systemInstruction: `You are an elite cybersecurity and fraud detection expert. 
        Your job is to analyze social media posts, messages, and images for scam patterns.
        Look for:
        - Urgency or fear tactics
        - Promises of unrealistic returns (crypto, giveaways)
        - Suspicious links or domains
        - Grammar and spelling errors in official-looking communications
        - Requests for personal info or money
        - Fake engagement metrics or manipulated screenshots
        
        Provide a strict, no-nonsense assessment.`,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini.");
    }

    return JSON.parse(resultText) as FraudAnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};