import { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-md border border-stone-300 bg-white px-2 text-xs font-medium text-stone-700">
      {children}
    </span>
  );
}
