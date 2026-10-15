import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileSearch, Mail, NotebookPen, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Workwise — Emails, meeting notes & research, done by AI" },
      { name: "description", content: "One AI workspace to write emails, summarize meetings into action items, and produce research reports." },
      { property: "og:title", content: "Workwise — Emails, meeting notes & research, done by AI" },
      { property: "og:description", content: "One AI workspace to write emails, summarize meetings into action items, and produce research reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Mail, title: "Smart Email Generator", text: "Purpose, recipient and tone in — a polished draft out. Edit, copy, save or regenerate.", color: "text-tool-email" },
  { icon: NotebookPen, title: "Meeting Notes Summarizer", text: "Raw notes or transcripts become summaries, decisions, owners and deadlines.", color: "text-tool-meeting" },
  { icon: FileSearch, title: "AI Research Assistant", text: "Structured reports with findings, insights, recommendations and citations.", color: "text-tool-research" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
      </header>
      <main>
        <section className="relative overflow-hidden">
          <div className="hero-grid absolute inset-0 -z-10" />
          <div className="mx-auto max-w-4xl px-5 pb-16 pt-16 text-center sm:pt-24">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-primary-soft px-3 py-1 text-xs font-semibold text-accent-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Private by default — your results are only visible to you
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-navy sm:text-6xl">
              Less busywork.<br /><span className="text-primary">More real work.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              Write emails, organize meetings and research any topic — three AI tools in one calm workspace.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="shadow-lift"><Link to="/auth">Get started free <ArrowRight className="h-4 w-4" /></Link></Button>
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-24 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6 shadow-card">
              <f.icon className={`h-6 w-6 ${f.color}`} />
              <h3 className="mt-4 text-lg font-semibold text-navy">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
