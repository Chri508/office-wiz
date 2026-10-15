import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { listResults } from "@/lib/results";
import { TOOL_LIST } from "@/lib/tools";
import { ResultList, toolIcon } from "@/components/ResultList";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Workwise" }, { name: "description", content: "Your AI productivity tools, saved results and recent activity." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const all = useQuery({ queryKey: ["results", "all"], queryFn: () => listResults() });
  const rows = all.data ?? [];
  const saved = rows.filter((r) => r.is_saved);
  const name = user.email?.split("@")[0];

  const stats = [
    { label: "Generated", value: rows.length },
    { label: "Saved", value: saved.length },
    { label: "This week", value: rows.filter((r) => Date.now() - +new Date(r.created_at) < 7 * 864e5).length },
  ];

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm font-medium text-primary">Welcome back{name ? `, ${name}` : ""}</p>
        <h1 className="mt-1 text-3xl font-bold text-navy sm:text-4xl">What are we working on?</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {TOOL_LIST.map((t) => {
          const Icon = toolIcon[t.id];
          return (
            <Link key={t.id} to={t.path} className="group rounded-2xl border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><Icon className="h-5 w-5" /></div>
              <h2 className="mt-4 font-semibold text-navy">{t.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-secondary p-4">
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-navy">{all.isLoading ? "–" : s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-navy">Saved results</h2><Link to="/history" search={{ tab: "saved" }} className="text-sm font-medium text-primary">View all</Link></div>
          {all.isLoading ? <Skeleton className="h-40 rounded-2xl" /> : all.isError ? <p className="text-sm text-destructive">Couldn't load results.</p> : <ResultList rows={saved.slice(0, 5)} empty="Nothing saved yet. Hit Save on any result to keep it here." />}
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-navy">Recent activity</h2><Link to="/history" search={{ tab: "all" }} className="text-sm font-medium text-primary">View all</Link></div>
          {all.isLoading ? <Skeleton className="h-40 rounded-2xl" /> : all.isError ? <p className="text-sm text-destructive">Couldn't load activity.</p> : <ResultList rows={rows.slice(0, 5)} empty="No activity yet. Try one of the tools above." />}
        </section>
      </div>
    </div>
  );
}
