import { z } from "zod";

//Schema for AI questions with difficulty
const questionSchema = z.object({
  position: z.string(),
  questions: z
    .array(
      z.object({
        text: z.string(),
        difficulty: z.enum(["Easy", "Intermediate", "Advanced"]),
      })
    )
    .length(5),
});

const questionPromiseCache = new Map();

//Fetch interview questions from backend
async function fetchQuestions(position) {
  const res = await fetch("http://localhost:3001/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position }),
    });
    if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Failed to generate questions");
    }
    const data = await res.json();
    const parsed = questionSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error("Response did not match expected schema");
    }
    return parsed.data;
}

//Promise wrapper with caching
export function getQuestionPromise(position) {
  if (!questionPromiseCache.has(position)) {
    questionPromiseCache.set(position, fetchQuestions(position));
  }
  return questionPromiseCache.get(position);
}

//Simpler helper (used directly in QuestionForm)
export async function generateQuestions(position) {
  const result = await fetchQuestions(position);
  return result; // { position: "...", questions: [{ text, difficulty }, ...] }
}
