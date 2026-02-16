import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

dotenv.config();

const app = express();
// allow the Vite dev origin
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

//Schema for questions with difficulty
const QuestionSchema = z.object({
  position: z.string(),
  questions: z.array(
    z.object({
      text: z.string(),
      difficulty: z.enum(["Easy", "Intermediate", "Advanced"]),
    })
  ).length(5), // enforce exactly 5 questions
});

//Prompt
const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are an interview assistant. Generate exactly 5 distinct interview questions for the given job position. " +
    "Each question must include a difficulty: Easy, Intermediate, or Advanced. " +
    "Questions should be tailored to the role — technical for engineers, behavioral for managers, clinical for healthcare, etc. " +
    "Return only structured JSON with two fields: `position` (string) and `questions` (array of objects with keys `text` and `difficulty`)."
  ],
  [
    "human",
    "Position: {position}"
  ],
]);

// Choose model by provider
function getModel() {
  const provider = process.env.AI_PROVIDER;
  if (provider === "openai") {
    // Uses OPENAI_API_KEY
    return new ChatOpenAI({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.7,
    });
  }
  throw new Error(`Unsupported AI provider: ${provider}`);
}

const baseModel = getModel();

app.all("/api/generate-question", async (req, res) => {
  try {
    const position =
      req.method === "GET" ? req.query.position : req.body?.position;

    if (!position || typeof position !== "string") {
      return res.status(400).json({ error: "Position is required" });
    }

    // Ask the model to emit exactly the schema
    const modelWithSchema = baseModel.withStructuredOutput(QuestionSchema, {
      name: "question",
      strict: true,
    });

    const chain = prompt.pipe(modelWithSchema);
    const result = await chain.invoke({ position });

    // Defense-in-depth: validate again
    const parsed = QuestionSchema.safeParse(result);
    if (!parsed.success) {
      return res.status(502).json({
        error: "Model returned invalid schema",
        details: parsed.error.flatten(),
      });
    }

    res.json(parsed.data);
  } catch (err) {
  console.error("Error generating question:", err);
  res.status(500).json({ error: err.message || "Failed to generate question" });
}

});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
