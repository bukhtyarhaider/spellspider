import { GoogleGenAI, Type } from "@google/genai";
import { SpellingError } from "../types";

const initGenAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeTextForErrors = async (
  text: string
): Promise<{ errors: SpellingError[]; score: number; summary: string }> => {
    const ai = initGenAI();

    // Truncate text to avoid token limits.
    // Increased buffer slightly as Flash handles large context well.
    const truncatedText = text.slice(0, 25000);

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a world-class Senior Copy Editor with 20 years of experience. Your task is to audit website content with extreme precision.

      Analyze the text provided below.
      
      ### 1. Detection Categories
      
      *   **Spelling & Grammar (High Severity)**:
          *   Strictly flag actual typos (e.g., "teh" -> "the").
          *   Flag subject-verb disagreement (e.g., "The team are" -> "The team is" if referencing the unit).
          *   Flag homophone misuse (e.g., "their" vs "there").
          *   *Constraint*: Do NOT flag British vs American English differences (e.g., "colour" vs "color") as errors unless inconsistent within the text.
          
      *   **Style & Flow (Medium Severity)**:
          *   Identify passive voice ONLY if it weakens the sentence significantly.
          *   Flag repetitive sentence structures.
          *   Flag awkward phrasing that disrupts reading rhythm.

      *   **Clarity (Medium/High Severity)**:
          *   Flag undefined acronyms on first use.
          *   Flag confusing, convoluted, or run-on sentences.
          *   Flag ambiguity where the meaning is unclear.

      *   **Conciseness (Low Severity)**:
          *   Flag pleonasms (e.g., "free gift", "added bonus").
          *   Flag wordy constructions (e.g., "in order to" -> "to").

      *   **Tone (Low/Medium Severity)**:
          *   Ensure professional consistency. Flag slang or overly casual language if the surrounding text is formal.

      ### 2. Scoring & Summary
      *   **Score (0-100)**: Rate the content. 90-100 is publish-ready. < 60 requires major rewrite.
      *   **Summary**: Provide a professional 2-sentence executive summary of the writing quality.

      ### 3. Exclusions (Do NOT Flag)
      *   Brand names, proper nouns, or technical jargon.
      *   Navigation items (e.g., "Login", "Sign Up", "Footer", "Copyright").
      *   Incomplete sentence fragments that are clearly headlines or buttons.

      ### Input Text:
      """
      ${truncatedText}
      """`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.INTEGER,
              description: "Quality score from 0-100",
            },
            summary: {
              type: Type.STRING,
              description: "Professional editorial summary",
            },
            errors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: {
                    type: Type.STRING,
                    description: "The incorrect snippet",
                  },
                  suggestion: {
                    type: Type.STRING,
                    description: "The correction",
                  },
                  context: {
                    type: Type.STRING,
                    description: "Surrounding text",
                  },
                  type: {
                    type: Type.STRING,
                    enum: ["Spelling", "Grammar", "Style", "Clarity", "Tone"],
                  },
                  severity: {
                    type: Type.STRING,
                    enum: ["Low", "Medium", "High"],
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "Precise reason for the flag",
                  },
                },
                required: [
                  "original",
                  "suggestion",
                  "context",
                  "type",
                  "severity",
                ],
              },
            },
          },
          required: ["score", "summary", "errors"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No content analyzed.");
    }

    try {
      const parsed = JSON.parse(resultText);
      return {
        errors: parsed.errors || [],
        score: parsed.score || 100,
        summary: parsed.summary || "No summary provided.",
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      throw new Error("Failed to parse AI response");
    }
};
