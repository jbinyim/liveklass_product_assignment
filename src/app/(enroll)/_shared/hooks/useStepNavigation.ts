"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useFormContext, useWatch } from "react-hook-form";
import {
  STEPS,
  type Step,
  type EnrollmentForm,
} from "@/app/(enroll)/_shared/schema";

const STEP_TO_PATH: Record<Step, string> = {
  course: "/",
  applicant: "/applicant",
  review: "/review",
};

const PATH_TO_STEP: Record<string, Step> = {
  "/": "course",
  "/applicant": "applicant",
  "/review": "review",
};

function isStepCompleted(step: Step, values: EnrollmentForm): boolean {
  if (step === "course") {
    return Boolean(values.courseId);
  }
  if (step === "applicant") {
    const a = values.applicant;
    const baseFilled = Boolean(a?.name && a?.email && a?.phone);
    if (!baseFilled) return false;
    if (values.type === "group") {
      const g = values.group;
      return Boolean(
        g?.organizationName &&
          g?.contactPerson &&
          (g?.participants?.length ?? 0) > 0,
      );
    }
    return true;
  }
  return values.agreedToTerms === true;
}

export interface StepNavigation {
  current: Step;
  completed: Step[];
  isUnlocked: (step: Step) => boolean;
  goToStep: (step: Step) => void;
  goNext: () => void;
  goPrev: () => void;
  pathFor: (step: Step) => string;
}

export function useStepNavigation(): StepNavigation {
  const pathname = usePathname();
  const router = useRouter();
  const { control } = useFormContext<EnrollmentForm>();
  const values = useWatch({ control }) as EnrollmentForm;

  const current: Step = PATH_TO_STEP[pathname ?? "/"] ?? "course";

  const completed = useMemo<Step[]>(() => {
    const out: Step[] = [];
    for (const s of STEPS) {
      if (isStepCompleted(s, values)) out.push(s);
      else break;
    }
    return out;
  }, [values]);

  const isUnlocked = useMemo(
    () =>
      (step: Step): boolean => {
        if (step === "course") return true;
        const idx = STEPS.indexOf(step);
        return STEPS.slice(0, idx).every((s) => completed.includes(s));
      },
    [completed],
  );

  // 미완료 미래 스텝 직접 접근 시 직전 미완료 스텝으로 redirect
  useEffect(() => {
    if (!isUnlocked(current)) {
      const target =
        STEPS.find((s) => !completed.includes(s)) ?? "course";
      router.replace(STEP_TO_PATH[target]);
    }
  }, [current, completed, isUnlocked, router]);

  const goToStep = (step: Step) => {
    if (!isUnlocked(step)) return;
    router.push(STEP_TO_PATH[step]);
  };

  const goNext = () => {
    const idx = STEPS.indexOf(current);
    const next = STEPS[idx + 1];
    if (next) goToStep(next);
  };

  const goPrev = () => {
    const idx = STEPS.indexOf(current);
    const prev = STEPS[idx - 1];
    if (prev) router.push(STEP_TO_PATH[prev]);
  };

  return {
    current,
    completed,
    isUnlocked,
    goToStep,
    goNext,
    goPrev,
    pathFor: (s) => STEP_TO_PATH[s],
  };
}
