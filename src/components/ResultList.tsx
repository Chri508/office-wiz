import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck, Copy, Download, FileSearch, Mail, NotebookPen, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteResult, downloadText, updateResult, type ResultRow } from "@/lib/results";
import { TOOLS, type ToolId } from "@/lib/tools";

export const toolIcon: Record<ToolId, typeof Mail> = { email: Mail, meeting: NotebookPen, research: FileSearch };
const toolColor: Record<ToolId, string> = { email: "text-tool-email", meeting: "text-tool-meeting", research: "text-tool-research" };

export function ResultList({ rows, empty }: { rows: ResultRow[]; empty: string }) {
  const [open, setOpen] = useState<ResultRow | null>(null);
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["results"] });
  const toggle = useMutation({
    mutationFn: (r: ResultRow) => updateResult(r.id, { is_saved: !r.is_saved }),
    onSuccess: (_d, r) => { refresh(); if (open?.id === r.id) setOpen({ ...r, is_saved: !r.is_saved }); },
    onError: () => toast.error("Couldn't update."),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteResult(id),
    onSuccess: () => { refresh(); setOpen(null); toast.success("Deleted"); },
    onError: () => toast.error("Couldn't delete."),
  });

  if (!rows.length) return <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">{empty}</div>;

  return (
    <>
      <ul className="divide-y rounded-2xl border bg-card shadow-card">
        {rows.map((r) => {
          const Icon = toolIcon[r.tool];
          return (
            <li key={r.id}>
              <button onClick={() => setOpen(r)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted sm:px-5">
                <Icon className={`h-4 w-4 shrink-0 ${toolColor[r.tool]}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{TOOLS[r.tool].name} · {new Date(r.created_at).toLocaleString()}</p>
                </div>
                {r.is_saved && <BookmarkCheck className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            </li>
          );
        })}
      </ul>
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          {open && (
            <>
              <DialogHeader><DialogTitle className="pr-6">{open.title}</DialogTitle></DialogHeader>
              <div className="flex flex-wrap gap-1">
                <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(open.output); toast.success("Copied"); }}><Copy className="h-4 w-4" /> Copy</Button>
                <Button size="sm" variant="ghost" onClick={() => downloadText(open.title, open.output)}><Download className="h-4 w-4" /> Download</Button>
                <Button size="sm" variant="ghost" onClick={() => toggle.mutate(open)}>{open.is_saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}{open.is_saved ? "Unsave" : "Save"}</Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => del.mutate(open.id)}><Trash2 className="h-4 w-4" /> Delete</Button>
              </div>
              <div className="md-output mt-2"><ReactMarkdown>{open.output}</ReactMarkdown></div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
