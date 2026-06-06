import OpenAI from "openai";

const client = new OpenAI({
  baseURL: process.env.LLM_BASE_URL ?? "http://localhost:1234/v1",
  apiKey:  process.env.LLM_API_KEY  ?? "lm-studio",
});

const MODEL = process.env.LLM_MODEL ?? "local-model";

export interface Task {
  title?: string;
  description?: string;
  content: string;
  rubric?: Record<string, string>;
}

export async function scoreTask(task: Task): Promise<number> {
  const rubricLines = task.rubric
    ? Object.entries(task.rubric)
        .map(([range, desc]) => `  ${range}: ${desc}`)
        .join("\n")
    : "";

  const completion = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 16,
    messages: [
      {
        role: "user",
        content: `You are evaluating content for quality. Return ONLY a single integer from 0 to 100. Nothing else.

${task.title ? `Task: ${task.title}\n` : ""}${task.description ? `Description: ${task.description}\n` : ""}${rubricLines ? `\nRubric:\n${rubricLines}\n` : ""}
Content to evaluate:
---
${task.content}
---

Score (0-100):`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim() ?? "";
  const score = parseInt(text, 10);
  return isNaN(score) ? 50 : Math.max(0, Math.min(100, score));
}
