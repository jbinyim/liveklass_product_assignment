"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CategoryFilter, type CategoryFilterValue } from "./CategoryFilter";
import { CourseList } from "./CourseList";
import { EnrollmentTypeSelect } from "./EnrollmentTypeSelect";
import { useStepNavigation } from "@/app/(enroll)/_shared/hooks/useStepNavigation";
import { STEP_FIELDS } from "@/app/(enroll)/_shared/schema";
import type { EnrollmentForm } from "@/app/(enroll)/_shared/schema";

export function Step1View() {
  const [category, setCategory] = useState<CategoryFilterValue>("all");
  const { trigger, formState } = useFormContext<EnrollmentForm>();
  const nav = useStepNavigation();

  const handleNext = async () => {
    const ok = await trigger(STEP_FIELDS.course);
    if (ok) nav.goNext();
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-10">
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          강의 선택
        </h2>
        <CategoryFilter value={category} onChange={setCategory} />
        <CourseList category={category} />
        {formState.errors.courseId && (
          <p role="alert" className="text-xs text-[var(--color-error)]">
            {formState.errors.courseId.message as string}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          신청 유형
        </h2>
        <EnrollmentTypeSelect />
      </section>

      <footer className="flex justify-end pt-2">
        <Button size="lg" onClick={handleNext}>
          다음 →
        </Button>
      </footer>
    </main>
  );
}
