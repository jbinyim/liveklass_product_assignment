"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { saveDraft } from "@/lib/storage/enrollmentDraft";
import type { EnrollmentForm } from "@/app/(enroll)/_shared/schema";

const DEBOUNCE_MS = 500;

export function useDraftPersistence(): void {
  const { watch, getValues } = useFormContext<EnrollmentForm>();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const subscription = watch(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        saveDraft(getValues() as never);
      }, DEBOUNCE_MS);
    });
    return () => {
      if (timer) clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [watch, getValues]);
}
