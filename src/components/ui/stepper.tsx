"use client";

import { type ChangeEvent } from "react";
import clsx from "clsx";

interface StepperProps {
  value: number;
  onChange: (next: number) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  "aria-label"?: string;
  id?: string;
  className?: string;
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export function Stepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  "aria-label": ariaLabel,
  id,
  className,
}: StepperProps) {
  const decDisabled = disabled || value <= min;
  const incDisabled = disabled || value >= max;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") return;
    const parsed = parseInt(raw, 10);
    onChange(clamp(parsed, min, max));
  };

  const buttonClass =
    "h-8 w-8 inline-flex items-center justify-center rounded-[var(--radius-input)] border border-gray-300 bg-white font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]";

  return (
    <div className={clsx("inline-flex items-center gap-2", className)}>
      <button
        type="button"
        aria-label="감소"
        disabled={decDisabled}
        onClick={() => onChange(clamp(value - step, min, max))}
        className={buttonClass}
      >
        −
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        aria-label={ariaLabel}
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={handleInputChange}
        className="h-8 w-12 text-center text-base font-semibold text-[var(--color-text-primary)] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label="증가"
        disabled={incDisabled}
        onClick={() => onChange(clamp(value + step, min, max))}
        className={buttonClass}
      >
        +
      </button>
    </div>
  );
}
