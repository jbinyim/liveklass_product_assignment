"use client";

import { useEffect } from "react";
import { useFormContext, useFormState } from "react-hook-form";
import type { EnrollmentForm } from "@/app/(enroll)/_shared/schema";

export function useBeforeUnloadGuard(): void {
  const { control } = useFormContext<EnrollmentForm>();
  const { isDirty, isSubmitSuccessful } = useFormState({ control });
  const active = isDirty && !isSubmitSuccessful;

  useEffect(() => {
    if (!active) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [active]);
}
