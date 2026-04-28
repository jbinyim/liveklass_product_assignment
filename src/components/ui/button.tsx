"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import { Spinner } from "./spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",
  secondary:
    "bg-white text-[var(--color-text-primary)] border border-gray-300 hover:bg-gray-50",
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] hover:bg-gray-50",
  danger:
    "bg-[var(--color-error)] text-white hover:bg-red-700",
};

const SIZE_CLASS: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-semibold transition-colors",
        "rounded-[var(--radius-button)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]",
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner size="sm" aria-label="로딩 중" /> : null}
      {children}
    </button>
  );
});
