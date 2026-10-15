import type { ToolId } from "./tools";

type Input = Record<string, string>;

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");

export function buildPrompt(tool: ToolId, raw: Input): { system: string; prompt: string } {
  const i: Input = {};
  for (const [k, v] of Object.entries(raw ?? {})) i[k] = clip(v, k === "notes" || k === "documents" ? 60000 : 4000);
  const g = (k: string) => i[k] ?? "";

  if (tool === "email") {
    return {
      system:
        "You are an expert business communication writer. Write clear, natural, professional emails. Output only the email in Markdown: first line 'Subject: ...', then a blank line, greeting, body, and sign-off with a placeholder [Your Name]. No commentary.",
      prompt: `Recipient: ${g("recipient")}\nSubject: ${g("subject")}\nTone: ${g("tone")}\nPurpose and key points:\n${g("purpose")}`,
    };
  }
  if (tool === "meeting") {
    return {
      system:
        "You are an executive assistant who summarizes meetings precisely. Never invent facts that are not in the notes; write 'Not specified' when owners or deadlines are missing. Output Markdown with these sections: ## Summary, ## Key Points, ## Decisions, ## Action Items (a table with columns Task | Owner | Deadline), ## Open Questions.",
      prompt: `Meeting: ${g("title")}\nDate: ${g("date") || "Not specified"}\nAttendees: ${g("attendees") || "Not specified"}\n\nNotes / transcript:\n${g("notes")}`,
    };
  }
  return {
    system:
      "You are a rigorous research analyst. Produce a structured report in Markdown with: ## Executive Summary, ## Key Findings, ## Insights, ## Recommendations, ## Sources. Base findings on the provided documents when given and cite them as [Doc]. For outside knowledge, cite only well-established, real sources (publication, organization, year) you are confident exist; never fabricate URLs or citations. If unsure, say a claim should be verified. Note that you cannot browse the live web.",
    prompt: `Topic: ${g("topic")}\nQuestions: ${g("questions") || "—"}\nObjectives: ${g("objectives") || "—"}\n\nProvided documents:\n${g("documents") || "None provided."}`,
  };
}
