
import { GoogleGenAI, Type } from "@google/genai";
import { Lesson } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-3-pro-preview for complex extraction and reasoning (conflict detection)
export async function parseScheduleFromPDF(base64PDF: string): Promise<Lesson[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: base64PDF,
          },
        },
        {
          text: `Extract the class schedule from this document. 
          Identify the subject name, day of the week, start time, end time, and location.
          If multiple sections exist, extract them all.
          Check for overlapping times (conflicts) and set "isConflict" to true if they overlap.
          Format the output as a JSON array of objects.`
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            dayOfWeek: { type: Type.STRING, description: "Monday, Tuesday, etc." },
            startTime: { type: Type.STRING, description: "HH:mm format" },
            endTime: { type: Type.STRING, description: "HH:mm format" },
            location: { type: Type.STRING },
            instructor: { type: Type.STRING },
            isConflict: { type: Type.BOOLEAN }
          },
          required: ["subject", "dayOfWeek", "startTime", "endTime"]
        }
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '[]');
    return data.map((item: any, index: number) => ({
      ...item,
      id: `lesson-${Date.now()}-${index}`
    }));
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
}

// Using gemini-3-flash-preview for basic text task (summarization)
export async function summarizeMaterial(base64File: string, fileName: string, mimeType: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64File,
          },
        },
        {
          text: `You are an academic assistant. Analyze the uploaded document "${fileName}".
          Generate an "Executive Summary" covering:
          1. Core Objectives: What is this lesson/document about?
          2. Key Results: Major findings, formulas, or takeaways.
          3. Brief Explanation: A simplified version of complex concepts.
          Return the response in structured JSON.`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          objectives: { type: Type.STRING },
          results: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["objectives", "results", "explanation"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

// Using gemini-3-pro-preview for academic chatbot (complex text task)
export async function chatWithMaterial(
  history: { role: 'user' | 'model', text: string }[], 
  question: string, 
  materialBase64: string, 
  materialMimeType: string
) {
  // Fix: Explicitly type currentParts as any[] to allow adding multiple part types (text and inlineData)
  const currentParts: any[] = [{ text: question }];
  
  // Fix: Explicitly type parts in history as any[] to allow prepending inlineData context without TypeScript errors
  const geminiHistory = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }] as any[]
  }));

  // If this is the start of the conversation, or we want to ensure context,
  // we add the PDF to the first user turn. 
  // If history is empty, the current message IS the first turn.
  if (geminiHistory.length === 0) {
    currentParts.unshift({
      inlineData: {
        mimeType: materialMimeType,
        data: materialBase64,
      },
    });
  } else {
    // Prepend the PDF context to the very first history item if it was a user turn
    // This is more robust for stateless generateContent calls
    if (geminiHistory[0].role === 'user') {
      geminiHistory[0].parts.unshift({
        inlineData: {
          mimeType: materialMimeType,
          data: materialBase64,
        }
      });
    }
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      ...geminiHistory,
      { role: 'user', parts: currentParts }
    ],
    config: {
      systemInstruction: "You are an intelligent academic chatbot. Your task is to answer user questions ONLY based on the provided document (PDF/Image). If the answer isn't in the material, politely state that you can't find that information in the current document. Be precise, helpful, and concise."
    }
  });

  return response.text || "I'm sorry, I couldn't generate a response.";
}
