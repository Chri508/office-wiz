import type { ReactNode } from "react";

export function PageHeader({ title, description, icon }: { title: string; description: string; icon?: ReactNode }) {
  return (
    <div className="mb-6 flex items-start gap-3 sm:mb-8">
      {icon && <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">{icon}</div>}
      <div>
        <h1 className="text-2xl font-bold text-navy sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">{description}</p>
      </div>
    </div>
  );
}
