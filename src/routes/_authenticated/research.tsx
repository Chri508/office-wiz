import { createFileRoute } from "@tanstack/react-router";
import { FileSearch } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ToolWorkspace } from "@/components/ToolWorkspace";

export const Route = createFileRoute("/_authenticated/research")({
  head: () => ({ meta: [{ title: "AI Research Assistant — Workwise" }, { name: "description", content: "Research reports with key findings, insights, recommendations and citations." }] }),
  component: () => (
    <>
      <PageHeader icon={<FileSearch className="h-5 w-5" />} title="AI Research Assistant" description="Structured reports from your topic, questions and source documents." />
      <ToolWorkspace toolId="research" />
    </>
  ),
});
