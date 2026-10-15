import { createFileRoute } from "@tanstack/react-router";
import { NotebookPen } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ToolWorkspace } from "@/components/ToolWorkspace";

export const Route = createFileRoute("/_authenticated/meeting")({
  head: () => ({ meta: [{ title: "Meeting Notes Summarizer — Workwise" }, { name: "description", content: "Summarize meeting notes into decisions, action items, owners and deadlines." }] }),
  component: () => (
    <>
      <PageHeader icon={<NotebookPen className="h-5 w-5" />} title="Meeting Notes Summarizer" description="Paste notes or a transcript — get decisions, owners and deadlines." />
      <ToolWorkspace toolId="meeting" />
    </>
  ),
});
