import { InputHTMLAttributes, ReactNode } from "react";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  action?: ReactNode;
  label: string;
};

export function AuthField({ action, label, ...inputProps }: AuthFieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-4">
        <label
          className="block text-sm font-semibold text-on-surface-variant"
          htmlFor={inputProps.id}
        >
          {label}
        </label>
        {action}
      </div>
      <input
        {...inputProps}
        className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
      />
    </div>
  );
}
