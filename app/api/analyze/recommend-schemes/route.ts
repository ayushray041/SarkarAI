import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

export async function POST(request: Request) {
  try {
    const { profile } = await request.json()

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
User Profile:
${profile}

Recommend 4 Indian government schemes.

Return ONLY valid JSON.

Example:

{
  "schemes": [
    {
      "name": "UP Scholarship",
      "reason": "Supports students in Uttar Pradesh"
    }
  ]
}
`,
    })


console.log("RAW GEMINI RESPONSE:")
console.log(response.text)
    
    return NextResponse.json({
  answer: response.text,
})
  } catch (error) {
  console.error("RECOMMEND ERROR:", error)

  return NextResponse.json({
    answer:
      "AI recommendation service is currently busy. Please try again in a few moments.",
  })
}
}