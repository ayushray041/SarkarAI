import { GoogleGenAI, Type } from "@google/genai"

const MODEL = "gemini-2.5-flash"

export interface ImportantDate {
  label: string
  date: string
  status: string
  tone: "open" | "upcoming" | "critical" | "tentative"
}

export interface RequiredDocument {
  name: string
  note: string
  ready: boolean
}

export interface EligibilityCriterion {
  label: string
  met: boolean
}

export interface GovernmentDocumentAnalysis {
  documentName: string
  summary: string
  summaryHindi?: string
  importantDates: ImportantDate[]
  requiredDocuments: RequiredDocument[]
  eligibility: EligibilityCriterion[]
  nextActions: string[]
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    documentName: {
      type: Type.STRING,
      description: "Short title or name of the government document or scheme.",
    },
    summary: {
      type: Type.STRING,
      description: "Plain-language summary of the document in 2-4 sentences.",
    },
    summaryHindi: {
      type: Type.STRING,
      description: "Hindi translation of the summary.",
    },
    importantDates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          date: { type: Type.STRING },
          status: { type: Type.STRING },
          tone: {
            type: Type.STRING,
            enum: ["open", "upcoming", "critical", "tentative"],
          },
        },
        required: ["label", "date", "status", "tone"],
      },
    },
    requiredDocuments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          note: { type: Type.STRING },
          ready: { type: Type.BOOLEAN },
        },
        required: ["name", "note", "ready"],
      },
    },
    eligibility: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          met: { type: Type.BOOLEAN },
        },
        required: ["label", "met"],
      },
    },
    nextActions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: [
    "documentName",
    "summary",
    "summaryHindi",
    "importantDates",
    "requiredDocuments",
    "eligibility",
    "nextActions",
  ],
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.")
  }

  return new GoogleGenAI({ apiKey })
}

const SYSTEM_INSTRUCTION = `You are an expert at analyzing government documents, schemes, notices, and policy circulars.
Extract structured information that helps citizens understand deadlines, paperwork, eligibility, and next steps.
Use clear, concise language. Infer documentName from the content when not explicitly stated.
For requiredDocuments, set ready to false unless the document text confirms the item is already submitted.
For eligibility, extract the eligibility requirements from the document.
Set met to true because these are requirements, not applicant-specific checks.
For nextActions, provide ordered, actionable steps the reader should take.

Also generate summaryHindi, which is a natural Hindi translation of the summary.`

export async function analyzeGovernmentDocument(
  text: string,
): Promise<GovernmentDocumentAnalysis> {
  if (!text.trim()) {
    throw new Error("Document text cannot be empty.")
  }

  const ai = getClient()

  const response = await ai.models.generateContent({
  model: MODEL,
  contents: text,
  config: {
    systemInstruction: SYSTEM_INSTRUCTION,
    responseMimeType: "application/json",
    responseSchema,
    temperature: 0.2,
  },
})

  const raw = response.text

  if (!raw) {
    throw new Error("Gemini returned an empty response.")
  }
  console.log("RAW LENGTH:", raw.length)
  console.log("RAW RESPONSE:", raw)

const parsed = JSON.parse(raw) as GovernmentDocumentAnalysis
  console.log("GEMINI RAW:", raw)
  console.log("GEMINI PARSED:", parsed)
  return {
    documentName: parsed.documentName ?? "Untitled document",
    summary: parsed.summary ?? "",
    summaryHindi: parsed.summaryHindi ?? "",
    importantDates: parsed.importantDates ?? [],
    requiredDocuments: parsed.requiredDocuments ?? [],
    eligibility: parsed.eligibility ?? [],
    nextActions: parsed.nextActions ?? [],
  }
}
