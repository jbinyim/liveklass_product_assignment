"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid = false, disabled, className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      disabled={disabled}
      className={clsx(
        "w-full px-3 py-2.5 text-sm",
        "rounded-[var(--radius-input)] border bg-white",
        "placeholder:text-[var(--color-text-muted)]",
        "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent",
        invalid
          ? "border-[var(--color-error)]"
          : "border-gray-300",
        disabled &&
          "bg-[var(--color-surface-strong)] border-gray-200 text-[var(--color-text-muted)] cursor-not-allowed",
        className,
      )}
      {...rest}
    />
  );
});
