import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ToolWorkspace } from "@/components/ToolWorkspace";

export const Route = createFileRoute("/_authenticated/email")({
  head: () => ({ meta: [{ title: "Smart Email Generator — Workwise" }, { name: "description", content: "Generate professional email drafts by purpose, recipient and tone." }] }),
  component: () => (
    <>
      <PageHeader icon={<Mail className="h-5 w-5" />} title="Smart Email Generator" description="Describe what you need — get a polished, ready-to-send draft." />
      <ToolWorkspace toolId="email" />
    </>
  ),
});
