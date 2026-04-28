"use client";

import { useFormContext, useFormState } from "react-hook-form";
import clsx from "clsx";
import type { EnrollmentForm } from "@/app/(enroll)/_shared/schema";

export function TermsCheckbox() {
  const { register, watch, control } = useFormContext<EnrollmentForm>();
  const { errors } = useFormState({ control });
  const checked = watch("agreedToTerms") ?? false;
  const error = errors.agreedToTerms?.message as string | undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className={clsx(
          "flex items-center gap-2.5 rounded-md bg-[var(--color-surface)] px-4 py-3.5 cursor-pointer",
          error && "ring-2 ring-[var(--color-error)]",
        )}
      >
        <input
          type="checkbox"
          {...register("agreedToTerms")}
          className="h-[18px] w-[18px] rounded accent-[var(--color-primary)]"
          aria-invalid={Boolean(error) || undefined}
        />
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          이용약관에 동의합니다
        </span>
        <span className="text-xs text-[var(--color-error)]">(필수)</span>
        <span className="ml-auto text-xs text-[var(--color-text-muted)]">
          {checked ? "동의함" : "미동의"}
        </span>
      </label>
      {error && (
        <p role="alert" className="text-xs text-[var(--color-error)]">
          {error}
        </p>
      )}
    </div>
  );
}
