"use client";

import clsx from "clsx";
import { STEPS, type Step } from "@/app/(enroll)/_shared/schema";
import { useStepNavigation } from "@/app/(enroll)/_shared/hooks/useStepNavigation";

const STEP_LABEL: Record<Step, string> = {
  course: "강의 선택",
  applicant: "정보 입력",
  review: "확인",
};

export function StepIndicator() {
  const nav = useStepNavigation();

  return (
    <ol className="flex w-full items-center gap-2" aria-label="신청 진행 단계">
      {STEPS.map((step, idx) => {
        const isCurrent = nav.current === step;
        const isCompleted = nav.completed.includes(step) && !isCurrent;
        const isUnlocked = nav.isUnlocked(step);

        const circleClass = clsx(
          "h-7 w-7 inline-flex items-center justify-center rounded-full text-xs font-bold",
          isCurrent && "bg-[var(--color-primary)] text-white",
          !isCurrent &&
            isCompleted &&
            "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
          !isCurrent &&
            !isCompleted &&
            "bg-[var(--color-surface-strong)] text-[var(--color-text-muted)]",
        );

        const labelClass = clsx(
          "text-sm font-semibold",
          isCurrent && "text-[var(--color-text-primary)]",
          !isCurrent && isUnlocked && "text-[var(--color-text-secondary)]",
          !isCurrent && !isUnlocked && "text-[var(--color-text-muted)]",
        );

        const content = (
          <>
            <span className={circleClass}>{idx + 1}</span>
            <span className={labelClass}>{STEP_LABEL[step]}</span>
          </>
        );

        return (
          <li
            key={step}
            className="flex items-center gap-3"
            aria-current={isCurrent ? "step" : undefined}
          >
            {isUnlocked && !isCurrent ? (
              <button
                type="button"
                onClick={() => nav.goToStep(step)}
                className="flex items-center gap-2 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] rounded"
              >
                {content}
              </button>
            ) : (
              <div
                className="flex items-center gap-2"
                aria-disabled={!isUnlocked || undefined}
                title={
                  !isUnlocked ? "이전 단계 완료 후 이용 가능합니다" : undefined
                }
              >
                {content}
              </div>
            )}
            {idx < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className="h-px w-3 bg-[var(--color-text-muted)] opacity-50 sm:w-8"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
