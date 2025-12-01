
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { EPaperConfig } from '../types';

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export class GeminiService {
  private getAIInstance(): GoogleGenAI {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY is not defined. Please ensure it's set in your environment.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  public async generateText(prompt: string, config: EPaperConfig): Promise<GenerateContentResponse> {
    const ai = this.getAIInstance();
    const model = config.modelName;

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: { parts: [{ text: prompt }] },
        config: {
          temperature: config.temperature,
          topK: config.topK,
          topP: config.topP,
        },
      });
      console.log('Gemini Text Response:', response.text);
      return response;
    } catch (error) {
      console.error('Error generating text with Gemini:', error);
      throw new Error(`Gemini Text Generation failed: ${error}`);
    }
  }

  public async generateImage(prompt: string, config: EPaperConfig): Promise<string | null> {
    const ai = this.getAIInstance();
    const model = config.imageModelName;

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              text: prompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1", // Default to 1:1, could be configurable
            imageSize: model === 'gemini-3-pro-image-preview' ? '1K' : undefined, // Only for Pro version
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          const imageUrl = `data:image/png;base64,${base64EncodeString}`;
          console.log('Gemini Image Response:', imageUrl);
          return imageUrl;
        }
      }
      return null;
    } catch (error) {
      console.error('Error generating image with Gemini:', error);
      throw new Error(`Gemini Image Generation failed: ${error}`);
    }
  }
}