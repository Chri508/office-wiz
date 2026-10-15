import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck, Copy, Download, Loader2, Pencil, RefreshCw, Sparkles, Square, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TOOLS, type ToolId } from "@/lib/tools";
import { createResult, downloadText, streamGenerate, updateResult } from "@/lib/results";
import { useQueryClient } from "@tanstack/react-query";

export function ToolWorkspace({ toolId }: { toolId: ToolId }) {
  const tool = TOOLS[toolId];
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>(
    () => Object.fromEntries(tool.fields.map((f) => [f.name, f.type === "select" ? (f.options?.[0] ?? "") : ""])) as Record<string, string>,
  );
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const set = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));
  const missing = tool.fields.filter((f) => f.required && !values[f.name]?.trim());

  async function run() {
    if (missing.length) {
      setError(`Please fill in: ${missing.map((m) => m.label).join(", ")}`);
      return;
    }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    setEditing(false);
    setSaved(false);
    setRecordId(null);
    setOutput("");
    try {
      const full = await streamGenerate(toolId, values, setOutput, ctrl.signal);
      const id = await createResult(toolId, values[tool.titleField] ?? "", values, full);
      setRecordId(id);
      qc.invalidateQueries({ queryKey: ["results"] });
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleSave() {
    if (!recordId) return;
    try {
      await updateResult(recordId, { is_saved: !saved, output });
      setSaved(!saved);
      qc.invalidateQueries({ queryKey: ["results"] });
      toast.success(saved ? "Removed from saved" : "Saved to your library");
    } catch {
      toast.error("Couldn't save. Please try again.");
    }
  }

  async function finishEdit() {
    setEditing(false);
    if (recordId) {
      try {
        await updateResult(recordId, { output });
        qc.invalidateQueries({ queryKey: ["results"] });
        toast.success("Changes saved");
      } catch {
        toast.error("Couldn't save your edits.");
      }
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function onFile(name: string, file?: File) {
    if (!file) return;
    if (file.size > 500_000) {
      toast.error("File too large (max 500KB).");
      return;
    }
    const text = await file.text();
    set(name, (values[name] ? values[name] + "\n\n" : "") + text);
    toast.success(`Added ${file.name}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <form
        className="space-y-4 rounded-2xl border bg-card p-5 shadow-card sm:p-6 lg:sticky lg:top-6 lg:self-start"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        {tool.fields.map((f) => (
          <div key={f.name} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor={f.name}>
                {f.label}
                {f.required && <span className="text-primary"> *</span>}
              </Label>
              {f.allowFile && (
                <label className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-primary hover:underline">
                  <Upload className="h-3 w-3" /> Upload
                  <input type="file" accept=".txt,.md,.csv,.vtt,.srt" className="hidden" onChange={(e) => onFile(f.name, e.target.files?.[0])} />
                </label>
              )}
            </div>
            {f.type === "textarea" ? (
              <Textarea id={f.name} rows={f.rows} placeholder={f.placeholder} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)} />
            ) : f.type === "select" ? (
              <Select value={values[f.name] ?? ""} onValueChange={(v) => set(f.name, v)}>
                <SelectTrigger id={f.name}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {f.options!.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input id={f.name} type={f.type === "date" ? "date" : "text"} placeholder={f.placeholder} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)} />
            )}
          </div>
        ))}
        {loading ? (
          <Button type="button" variant="outline" className="w-full" onClick={() => { abortRef.current?.abort(); setLoading(false); }}>
            <Square className="h-4 w-4" /> Stop
          </Button>
        ) : (
          <Button type="submit" className="w-full" size="lg">
            <Sparkles className="h-4 w-4" /> Generate
          </Button>
        )}
      </form>

      <section className="min-h-[420px] rounded-2xl border bg-card shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold">Result</h2>
          {output && !loading && (
            <div className="flex flex-wrap gap-1">
              <Button size="sm" variant="ghost" onClick={copy}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}<span className="hidden sm:inline">Copy</span></Button>
              <Button size="sm" variant="ghost" onClick={() => (editing ? finishEdit() : setEditing(true))}><Pencil className="h-4 w-4" /><span className="hidden sm:inline">{editing ? "Done" : "Edit"}</span></Button>
              <Button size="sm" variant="ghost" onClick={() => downloadText(values[tool.titleField] || tool.short, output)}><Download className="h-4 w-4" /><span className="hidden sm:inline">Download</span></Button>
              <Button size="sm" variant="ghost" onClick={run}><RefreshCw className="h-4 w-4" /><span className="hidden sm:inline">Regenerate</span></Button>
              <Button size="sm" variant={saved ? "secondary" : "default"} onClick={toggleSave} disabled={!recordId}>
                {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}{saved ? "Saved" : "Save"}
              </Button>
            </div>
          )}
        </div>
        <div className="p-4 sm:p-6">
          {error && (
            <div role="alert" className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>
          )}
          {loading && !output && (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm">Thinking it through…</p>
            </div>
          )}
          {!loading && !output && !error && (
            <div className="flex flex-col items-center justify-center gap-2 py-24 text-center text-muted-foreground">
              <Sparkles className="h-8 w-8 text-primary/40" />
              <p className="text-sm">Fill in the form and hit Generate.</p>
            </div>
          )}
          {output && (editing ? (
            <Textarea className="min-h-[480px] font-mono text-sm" value={output} onChange={(e) => setOutput(e.target.value)} />
          ) : (
            <div className="md-output"><ReactMarkdown>{output}</ReactMarkdown></div>
          ))}
        </div>
      </section>
    </div>
  );
}
