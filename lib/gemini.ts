// @/lib/ai.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface GenerateQuizInput {
  context: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  totalQuestions: number;
  model : string;
}

interface AIQuizOption {
  text: string;
  isCorrect: boolean;
}

interface AIQuizQuestion {
  question: string;
  options: AIQuizOption[];
}

/**
 * Generates MCQ quiz questions using Gemini
 */
export async function generateQuizWithAI({
  context,
  difficulty,
  totalQuestions,
  model,
}: GenerateQuizInput): Promise<AIQuizQuestion[]> {
  const modelInstance = genAI.getGenerativeModel({
    model, 
  });

  const prompt = `
You are an expert exam question setter.

Generate ${totalQuestions} multiple-choice questions.

Context:
${context}

Difficulty: ${difficulty}

Rules:
- Each question must have exactly 4 options
- Exactly ONE option must be correct
- Options must be realistic and non-trivial
- Avoid ambiguous wording
- Do NOT repeat questions
- Do NOT include explanations
- Return ONLY valid JSON
- Do NOT wrap the response in markdown
- Do NOT include commentary or extra text

Return JSON strictly in this format:

[
  {
    "question": "string",
    "options": [
      { "text": "string", "isCorrect": false },
      { "text": "string", "isCorrect": true },
      { "text": "string", "isCorrect": false },
      { "text": "string", "isCorrect": false }
    ]
  }
]
`;

  const result = await modelInstance.generateContent(prompt);
  const response = result.response.text();

  let parsed: AIQuizQuestion[];

  try {
    parsed = JSON.parse(response);
  } catch (err) {
    console.error("Gemini raw response:", response);
    throw new Error("Failed to parse AI response as JSON");
  }

  // --- Validation guard (VERY IMPORTANT) ---
  if (!Array.isArray(parsed) || parsed.length !== totalQuestions) {
    throw new Error("AI returned invalid question structure");
  }

  parsed.forEach((q, idx) => {
    if (
      !q.question ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      q.options.filter(o => o.isCorrect).length !== 1
    ) {
      throw new Error(`Invalid question format at index ${idx}`);
    }
  });

  return parsed;
}
