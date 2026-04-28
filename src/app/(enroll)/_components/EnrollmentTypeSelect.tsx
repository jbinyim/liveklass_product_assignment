"use client";

import clsx from "clsx";
import { useFormContext } from "react-hook-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useTypeSwitchGuard } from "@/app/(enroll)/_shared/hooks/useTypeSwitchGuard";
import {
  ENROLLMENT_TYPES,
  type EnrollmentType,
} from "@/app/(enroll)/_shared/constants";
import type { EnrollmentForm } from "@/app/(enroll)/_shared/schema";

const LABEL: Record<EnrollmentType, string> = {
  personal: "개인 신청",
  group: "단체 신청",
};

export function EnrollmentTypeSelect() {
  const { watch } = useFormContext<EnrollmentForm>();
  const current = watch("type");
  const { modalState, requestSwitch, confirm, cancel } = useTypeSwitchGuard();

  return (
    <>
      <div
        role="radiogroup"
        aria-label="신청 유형"
        className="flex flex-col gap-3"
      >
        {ENROLLMENT_TYPES.map((t) => {
          const active = current === t;
          return (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => requestSwitch(t)}
              className={clsx(
                "flex items-center gap-3 rounded-[var(--radius-card)] border bg-white px-5 py-4 text-left",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]",
                active
                  ? "border-2 border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                  : "border-gray-300 hover:bg-gray-50",
              )}
            >
              <span
                className={clsx(
                  "h-[18px] w-[18px] rounded-full border-2 flex items-center justify-center",
                  active
                    ? "border-[var(--color-primary)]"
                    : "border-gray-300",
                )}
                aria-hidden="true"
              >
                {active && (
                  <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                )}
              </span>
              <span
                className={clsx(
                  "text-base font-semibold",
                  active
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-primary)]",
                )}
              >
                {LABEL[t]}
              </span>
            </button>
          );
        })}
      </div>

      <Modal
        open={modalState.open}
        onClose={cancel}
        title="단체 정보가 사라집니다"
        description="개인 신청으로 전환하면 입력한 단체 정보가 모두 삭제됩니다. 계속하시겠어요?"
        actions={
          <>
            <Button variant="secondary" onClick={cancel}>
              취소
            </Button>
            <Button variant="danger" onClick={confirm}>
              전환
            </Button>
          </>
        }
      />
    </>
  );
}
