
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async analyzeFuelVariance(data: any) {
    const prompt = `Analyze the following fuel reconciliation data and provide a brief executive summary focusing on variances. 
    Data: ${JSON.stringify(data)}
    Explain possible causes if variance exceeds 5%. Use a professional tone for an FMU Manager.`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return "Unable to generate smart analysis at this time.";
    }
  }

  async predictFuelExhaustion(tankHistory: any) {
    const prompt = `Based on these tank level logs: ${JSON.stringify(tankHistory)}, 
    predict when the fuel might reach dead stock levels given the current consumption rate. 
    Return as a short prediction text.`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      return "Data insufficient for prediction.";
    }
  }
}

export const geminiService = new GeminiService();
