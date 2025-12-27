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
      items: { 
        type: Type.OBJECT,
        properties: {
          flag: { type: Type.STRING, description: "The name of the red flag (e.g., 'Urgency')" },
          explanation: { type: Type.STRING, description: "A concise explanation of why this is a flag (max 15 words)." }
        },
        required: ["flag", "explanation"]
      },
      description: "A list of specific red flags found in the content with brief explanations.",
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
    transcript: {
      type: Type.STRING,
      description: "If audio/video was provided, provide the verbatim transcript.",
    },
    ocrText: {
      type: Type.STRING,
      description: "If an image or document was provided, provide the raw text extracted via OCR.",
    }
  },
  required: ["riskScore", "verdict", "redFlags", "analysis", "recommendations"],
};

export const createChatSession = () => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are Cyberfriend, a knowledgeable and friendly cybersecurity assistant. Your goal is to help users understand online risks, identify potential scams, and provide best practices for digital safety. Be concise, encouraging, and easy to understand. If a user asks about a specific suspicious message, advise them to use the 'Text Analysis' or 'Image Analysis' tools in this app for a detailed forensic check.",
    }
  });
};

export const analyzeContent = async (
  text: string,
  fileData?: string,
  mimeType: string = "image/png",
  checkSource: boolean = false
): Promise<FraudAnalysisResult> => {
  try {
    const parts: any[] = [];

    // Add primary text input if exists
    if (text) {
      parts.push({ text: `Analyze this content for fraud, scams, or malicious intent. Text content: "${text}"` });
    }

    if (fileData) {
      if (mimeType.startsWith("image/")) {
          // Handle Image
          const cleanBase64 = fileData.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
          parts.push({
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          });
          parts.push({ 
            text: text 
                ? "Also analyze the provided image for visual indicators of scams and consistency with the text." 
                : "Analyze the provided image for visual indicators of scams (fake screenshots, manipulated branding)." 
          });

      } else if (mimeType === "application/pdf") {
          // Handle PDF
          const cleanBase64 = fileData.replace(/^data:application\/pdf;base64,/, "");
          parts.push({
            inlineData: {
              data: cleanBase64,
              mimeType: "application/pdf",
            },
          });
          parts.push({ 
            text: text
                ? "Also analyze the provided PDF document context and consistency with the user text."
                : "Analyze the provided PDF document for fraud indicators, suspicious contract terms, or fake formatting."
          });

      } else if (mimeType.startsWith("audio/") || mimeType.startsWith("video/")) {
           // Handle Audio and Video
           const base64Data = fileData.split(',')[1];
           parts.push({
               inlineData: {
                   data: base64Data,
                   mimeType: mimeType
               }
           });
           parts.push({
               text: "Analyze the audio/video content. 1) Transcribe the speech. 2) Analyze the spoken content and visual cues (if video) for fraud indicators like urgency, voice cloning artifacts, or scam scripts."
           });
           
      } else if (mimeType === "text/plain") {
          // Handle extracted text (e.g. from DOCX)
          parts.push({
              text: `\n--- ATTACHED DOCUMENT CONTENT START ---\n${fileData}\n--- ATTACHED DOCUMENT CONTENT END ---\n`
          });
          parts.push({
              text: text
                ? "Analyze the user provided text and the attached document content above for fraud."
                : "Analyze the attached document content above for potential fraud or scam indicators."
          });
      }
    }

    if (parts.length === 0) {
      throw new Error("No content provided for analysis.");
    }

    // Configure the request based on whether we are using search grounding
    let model = "gemini-3-flash-preview";
    let tools = checkSource ? [{ googleSearch: {} }] : undefined;
    
    // If using Search, we cannot use JSON mode reliably for the strict schema, 
    // so we prompt for a structured text format and parse it.
    let systemInstruction = `You are an elite cybersecurity and fraud detection expert. 
        Your job is to analyze social media posts, messages, documents (PDF/Word), audio, and video for scam patterns.
        
        ${checkSource ? `
        CRITICAL: YOU HAVE ACCESS TO GOOGLE SEARCH. 
        1. Use Google Search to verify the claims, images, products, or entities in the content.
        2. Check if the product images are stolen from legitimate sites (e.g. Amazon, eBay) but the user is linking to a different/suspicious site.
        3. Verify if the text is a known copypasta or scam script.
        4. If the content is found on legitimate sites but the context implies a scam (price too low, wrong domain), FLAG IT AS HIGH RISK.
        ` : ''}

        For Images/Docs:
        - Extract ALL visible text (OCR).
        - Look for visual red flags (fake logos, bad formatting).

        For Audio/Video:
        - Listen carefully to the speech and provide a transcript.
        - Identify robotic/AI-generated voices vs natural speech.
        
        General Red Flags:
        - Urgency or fear tactics
        - Promises of unrealistic returns
        - Suspicious links or domains
        - Grammar and spelling errors
        
        ${checkSource ? `
        OUTPUT FORMAT (Strictly follow this text format for parsing):
        RISK_SCORE: <0-100>
        VERDICT: <Safe|Low Risk|Suspicious|High Risk|Critical>
        RED_FLAGS: <flag1> - <explanation1> | <flag2> - <explanation2>
        RECOMMENDATIONS: <rec1>|<rec2>|<rec3>
        TRANSCRIPT: <text or "N/A">
        OCR_TEXT: <text or "N/A">
        ANALYSIS: <Full detailed analysis here...>
        ` : `Provide a strict, no-nonsense assessment. Always populate 'ocrText' for images/docs and 'transcript' for audio/video if applicable.`}`;

    const config: any = {
      systemInstruction: systemInstruction,
    };

    if (!checkSource) {
        config.responseMimeType = "application/json";
        config.responseSchema = responseSchema;
    } else {
        config.tools = tools;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        role: "user",
        parts: parts,
      },
      config: config,
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini.");
    }

    // Get grounding metadata (source links) if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (checkSource) {
        // Parse the text format
        return parseTextResponse(resultText, groundingChunks);
    } else {
        // Parse JSON
        return JSON.parse(resultText) as FraudAnalysisResult;
    }

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

function parseTextResponse(text: string, groundingChunks?: any[]): FraudAnalysisResult {
    const riskScoreMatch = text.match(/RISK_SCORE:\s*(\d+)/i);
    const verdictMatch = text.match(/VERDICT:\s*(Safe|Low Risk|Suspicious|High Risk|Critical)/i);
    const redFlagsMatch = text.match(/RED_FLAGS:\s*(.*)/i);
    const recommendationsMatch = text.match(/RECOMMENDATIONS:\s*(.*)/i);
    const transcriptMatch = text.match(/TRANSCRIPT:\s*(.*)/i);
    const ocrMatch = text.match(/OCR_TEXT:\s*(.*)/i);
    
    // Extract Analysis (everything after ANALYSIS:)
    const analysisStart = text.indexOf("ANALYSIS:");
    const analysis = analysisStart !== -1 ? text.substring(analysisStart + 9).trim() : text;

    let redFlagsObj: { flag: string, explanation: string }[] = [];
    if (redFlagsMatch) {
        redFlagsObj = redFlagsMatch[1].split('|').map(s => {
            const parts = s.split(' - ');
            // If we have a hyphen separator, assume first part is flag, second is explanation
            // If not, use the whole string as flag
            if (parts.length >= 2) {
                return { 
                    flag: parts[0].trim(), 
                    explanation: parts.slice(1).join(' - ').trim() 
                };
            }
            return { 
                flag: s.trim(), 
                explanation: "Potential fraud indicator." 
            };
        }).filter(f => f.flag);
    } else {
        redFlagsObj = [{ flag: "Potential Unknown Risk", explanation: "Manual review recommended." }];
    }

    return {
        riskScore: riskScoreMatch ? parseInt(riskScoreMatch[1]) : 50,
        verdict: (verdictMatch ? verdictMatch[1] : 'Suspicious') as any,
        redFlags: redFlagsObj,
        recommendations: recommendationsMatch ? recommendationsMatch[1].split('|').map(s => s.trim()).filter(s => s) : ["Verify independently"],
        transcript: transcriptMatch && transcriptMatch[1] !== "N/A" ? transcriptMatch[1].trim() : undefined,
        ocrText: ocrMatch && ocrMatch[1] !== "N/A" ? ocrMatch[1].trim() : undefined,
        analysis: analysis,
        groundingChunks: groundingChunks
    };
}