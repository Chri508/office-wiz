<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- AI generation runs through the `/api/generate` server route (bearer-verified, streams plain text); prompts live server-side in `src/lib/prompts.server.ts`. Why: keeps the AI key and prompts off the client.
- All generated outputs are stored per-user in `saved_results` (RLS by `user_id`); `is_saved` distinguishes saved items from plain history. Why: one table serves both history and library.
