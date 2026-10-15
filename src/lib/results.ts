import { supabase } from "@/integrations/supabase/client";
import type { ToolId } from "./tools";

export type ResultRow = {
  id: string;
  tool: ToolId;
  title: string;
  input: Record<string, string>;
  output: string;
  is_saved: boolean;
  created_at: string;
};

export async function listResults(opts: { savedOnly?: boolean; limit?: number } = {}) {
  let q = supabase.from("saved_results").select("*").order("created_at", { ascending: false });
  if (opts.savedOnly) q = q.eq("is_saved", true);
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as ResultRow[];
}

export async function createResult(tool: ToolId, title: string, input: Record<string, string>, output: string) {
  const { data, error } = await supabase
    .from("saved_results")
    .insert({ tool, title: title || "Untitled", input, output })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateResult(id: string, patch: { output?: string; is_saved?: boolean }) {
  const { error } = await supabase
    .from("saved_results")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteResult(id: string) {
  const { error } = await supabase.from("saved_results").delete().eq("id", id);
  if (error) throw error;
}

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.replace(/[^a-z0-9-_ ]/gi, "").trim().replace(/\s+/g, "-").toLowerCase() + ".md";
  a.click();
  URL.revokeObjectURL(url);
}

export async function streamGenerate(
  tool: ToolId,
  input: Record<string, string>,
  onText: (full: string) => void,
  signal: AbortSignal,
) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ tool, input }),
    signal,
  });
  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({ error: "Request failed." }));
    throw new Error(err.error ?? "Request failed.");
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    full += decoder.decode(value, { stream: true });
    const errIdx = full.indexOf("\u0000ERROR:");
    if (errIdx >= 0) throw new Error(full.slice(errIdx + 7));
    onText(full);
  }
  if (!full.trim()) throw new Error("The AI returned an empty response. Please try again.");
  return full;
}
