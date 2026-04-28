"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ApplicantFields } from "./ApplicantFields";
import { GroupFields } from "./GroupFields";
import { TypeSwitchToggle } from "./TypeSwitchToggle";
import { useStepNavigation } from "@/app/(enroll)/_shared/hooks/useStepNavigation";
import { STEP_FIELDS } from "@/app/(enroll)/_shared/schema";
import type { EnrollmentForm } from "@/app/(enroll)/_shared/schema";

export function Step2View() {
  const { trigger, watch } = useFormContext<EnrollmentForm>();
  const type = watch("type");
  const nav = useStepNavigation();

  const handleNext = async () => {
    const ok = await trigger(STEP_FIELDS.applicant);
    if (ok) nav.goNext();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10 flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          신청자 정보
        </h2>
        <TypeSwitchToggle />
      </div>

      <section aria-label="신청자 정보" className="flex flex-col gap-5">
        <ApplicantFields />
      </section>

      {type === "group" && (
        <section
          aria-label="단체 정보"
          className="flex flex-col gap-5 border-t border-gray-200 pt-8"
        >
          <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
            단체 정보
          </h3>
          <GroupFields />
        </section>
      )}

      <footer className="flex items-center justify-between pt-2">
        <Button variant="secondary" size="lg" onClick={() => nav.goPrev()}>
          ← 이전
        </Button>
        <Button size="lg" onClick={handleNext}>
          다음 →
        </Button>
      </footer>
    </main>
  );
}
