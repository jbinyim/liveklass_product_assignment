"use client";

import {
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from "react";
import clsx from "clsx";

interface FieldProps {
  label: ReactNode;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  children: ReactElement<{
    id?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
    invalid?: boolean;
  }>;
  className?: string;
}

export function Field({
  label,
  required = false,
  error,
  hint,
  children,
  className,
}: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  const inputClone = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id ?? id,
        "aria-describedby": describedBy,
        "aria-invalid": Boolean(error) || undefined,
        invalid: Boolean(error),
      })
    : children;

  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={id}
        className="text-sm font-semibold text-[var(--color-text-primary)]"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-[var(--color-error)]">
            *
          </span>
        )}
      </label>
      {inputClone}
      {hint && !error && (
        <p id={hintId} className="text-xs text-[var(--color-text-muted)]">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-[var(--color-error)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
