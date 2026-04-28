import clsx from "clsx";
import type { ReactNode } from "react";

type Variant = "info" | "low" | "full" | "success";

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

const VARIANT_CLASS: Record<Variant, string> = {
  info: "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
  low: "bg-red-100 text-[var(--color-error)]",
  full: "bg-[var(--color-surface-strong)] text-[var(--color-text-secondary)]",
  success: "bg-green-100 text-[var(--color-success)]",
};

export function Badge({ variant = "info", children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold",
        VARIANT_CLASS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
