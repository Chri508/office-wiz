export type ToolId = "email" | "meeting" | "research";

export type FieldDef = {
  name: string;
  label: string;
  type: "input" | "textarea" | "select" | "date";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  rows?: number;
  allowFile?: boolean;
};

export type ToolDef = {
  id: ToolId;
  name: string;
  short: string;
  description: string;
  path: "/email" | "/meeting" | "/research";
  titleField: string;
  fields: FieldDef[];
};

export const TOOLS: Record<ToolId, ToolDef> = {
  email: {
    id: "email",
    name: "Smart Email Generator",
    short: "Email",
    description: "Draft polished, on-tone emails in seconds.",
    path: "/email",
    titleField: "subject",
    fields: [
      { name: "recipient", label: "Recipient", type: "input", placeholder: "e.g. Sarah Chen, Head of Procurement", required: true },
      { name: "subject", label: "Subject", type: "input", placeholder: "e.g. Q4 contract renewal", required: true },
      {
        name: "tone",
        label: "Tone",
        type: "select",
        options: ["Professional", "Friendly", "Formal", "Persuasive", "Apologetic", "Concise"],
        required: true,
      },
      { name: "purpose", label: "Purpose & key points", type: "textarea", rows: 6, placeholder: "What should this email achieve? Include any details to mention.", required: true },
    ],
  },
  meeting: {
    id: "meeting",
    name: "Meeting Notes Summarizer",
    short: "Meetings",
    description: "Turn messy notes into decisions and action items.",
    path: "/meeting",
    titleField: "title",
    fields: [
      { name: "title", label: "Meeting title", type: "input", placeholder: "e.g. Weekly product sync", required: true },
      { name: "date", label: "Date", type: "date" },
      { name: "attendees", label: "Attendees", type: "input", placeholder: "e.g. Alex, Priya, Jordan" },
      { name: "notes", label: "Notes or transcript", type: "textarea", rows: 10, placeholder: "Paste raw notes or a transcript…", required: true, allowFile: true },
    ],
  },
  research: {
    id: "research",
    name: "AI Research Assistant",
    short: "Research",
    description: "Structured reports with findings and recommendations.",
    path: "/research",
    titleField: "topic",
    fields: [
      { name: "topic", label: "Research topic", type: "input", placeholder: "e.g. Four-day work week productivity impact", required: true },
      { name: "questions", label: "Key questions", type: "textarea", rows: 3, placeholder: "What do you want answered?" },
      { name: "objectives", label: "Objectives", type: "textarea", rows: 2, placeholder: "How will you use this research?" },
      { name: "documents", label: "Source documents (optional)", type: "textarea", rows: 6, placeholder: "Paste reference text, or upload a .txt / .md file", allowFile: true },
    ],
  },
};

export const TOOL_LIST = [TOOLS.email, TOOLS.meeting, TOOLS.research];
