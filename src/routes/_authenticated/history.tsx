import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { History } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { ResultList } from "@/components/ResultList";
import { listResults } from "@/lib/results";
import type { ToolId } from "@/lib/tools";

export const Route = createFileRoute("/_authenticated/history")({
  validateSearch: (s: Record<string, unknown>) => ({ tab: s["tab"] === "saved" ? ("saved" as const) : ("all" as const) }),
  head: () => ({ meta: [{ title: "History & Saved — Workwise" }, { name: "description", content: "Browse your saved results and full activity history." }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate({ from: "/history" });
  const [tool, setTool] = useState<ToolId | "all">("all");
  const [q, setQ] = useState("");
  const res = useQuery({ queryKey: ["results", "all"], queryFn: () => listResults() });
  const rows = (res.data ?? []).filter(
    (r) => (tab === "all" || r.is_saved) && (tool === "all" || r.tool === tool) && r.title.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader icon={<History className="h-5 w-5" />} title="History & saved" description="Everything you've generated, in one place." />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => navigate({ search: { tab: v as "all" | "saved" } })}>
          <TabsList><TabsTrigger value="all">All activity</TabsTrigger><TabsTrigger value="saved">Saved</TabsTrigger></TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Tabs value={tool} onValueChange={(v) => setTool(v as ToolId | "all")}>
            <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="email">Email</TabsTrigger><TabsTrigger value="meeting">Meetings</TabsTrigger><TabsTrigger value="research">Research</TabsTrigger></TabsList>
          </Tabs>
        </div>
      </div>
      <Input className="mb-4" placeholder="Search by title…" value={q} onChange={(e) => setQ(e.target.value)} />
      {res.isLoading ? <Skeleton className="h-64 rounded-2xl" /> : res.isError ? <p className="text-sm text-destructive">Couldn't load your history.</p> : <ResultList rows={rows} empty={tab === "saved" ? "No saved results yet." : "No activity yet."} />}
    </>
  );
}
