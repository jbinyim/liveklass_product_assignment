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
  personal: "개인",
  group: "단체",
};

export function TypeSwitchToggle() {
  const { watch } = useFormContext<EnrollmentForm>();
  const current = watch("type");
  const { modalState, requestSwitch, confirm, cancel } = useTypeSwitchGuard();

  return (
    <>
      <div
        role="tablist"
        aria-label="신청 유형"
        className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-surface-strong)] p-1"
      >
        {ENROLLMENT_TYPES.map((t) => {
          const active = current === t;
          return (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => requestSwitch(t)}
              className={clsx(
                "rounded-md px-4 py-1.5 text-sm font-semibold transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]",
                active
                  ? "bg-white text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
              )}
            >
              {LABEL[t]}
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
