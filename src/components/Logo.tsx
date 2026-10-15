import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">W</span>
      <span className="font-display text-lg font-bold text-navy">Workwise</span>
    </Link>
  );
}
