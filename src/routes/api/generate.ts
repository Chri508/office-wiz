import { createFileRoute } from "@tanstack/react-router";
import { streamGeneration } from "@/lib/ai-gateway.server";
import { buildPrompt } from "@/lib/prompts.server";
import type { ToolId } from "@/lib/tools";

async function verifyUser(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return false;
  const res = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

function friendlyError(err: unknown): string {
  const e = err as { statusCode?: number; message?: string };
  if (e?.statusCode === 429) return "Too many requests right now. Please wait a moment and try again.";
  if (e?.statusCode === 402) return "AI credits are used up for this workspace. Please add credits to continue.";
  if (e?.statusCode === 403) return "AI access is currently blocked for this workspace.";
  return "The AI couldn't complete this request. Please try again.";
}

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!(await verifyUser(request))) {
          return Response.json({ error: "Please sign in again." }, { status: 401 });
        }
        let body: { tool?: ToolId; input?: Record<string, string> };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid request." }, { status: 400 });
        }
        if (!body.tool || !["email", "meeting", "research"].includes(body.tool)) {
          return Response.json({ error: "Unknown tool." }, { status: 400 });
        }
        const { system, prompt } = buildPrompt(body.tool, body.input ?? {});
        const result = streamGeneration(request, system, prompt);
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const part of result.fullStream) {
                if (part.type === "text-delta") controller.enqueue(encoder.encode(part.text));
                else if (part.type === "error") {
                  controller.enqueue(encoder.encode(`\u0000ERROR:${friendlyError(part.error)}`));
                  break;
                }
              }
            } catch (err) {
              if (!request.signal.aborted) controller.enqueue(encoder.encode(`\u0000ERROR:${friendlyError(err)}`));
            }
            controller.close();
          },
        });
        return new Response(stream, {
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache, no-transform" },
        });
      },
    },
  },
});
