import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { FileSearch, History, LayoutDashboard, LogOut, Mail, NotebookPen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AppShell,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email", icon: Mail },
  { to: "/meeting", label: "Meetings", icon: NotebookPen },
  { to: "/research", label: "Research", icon: FileSearch },
  { to: "/history", label: "History", icon: History },
] as const;

function AppShell() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }
  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar p-4 md:flex md:sticky md:top-0 md:h-screen">
        <div className="px-2 py-2"><Logo /></div>
        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground" activeProps={{ className: "bg-sidebar-accent !text-primary" }}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t pt-3">
          <p className="truncate px-3 text-xs text-muted-foreground">{user.email}</p>
          <Button variant="ghost" size="sm" className="mt-1 w-full justify-start" onClick={signOut}><LogOut className="h-4 w-4" /> Sign out</Button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur md:hidden">
        <Logo />
        <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out"><LogOut className="h-4 w-4" /></Button>
      </header>

      <main className="flex-1 px-4 pb-28 pt-6 sm:px-6 md:px-10 md:pb-10 md:pt-10">
        <div className="mx-auto max-w-6xl"><Outlet /></div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t bg-background md:hidden">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground" activeProps={{ className: "!text-primary" }}>
            <n.icon className="h-5 w-5" /> {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
