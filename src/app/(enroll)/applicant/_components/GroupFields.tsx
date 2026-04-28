"use client";

import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  HEADCOUNT_MIN,
  HEADCOUNT_MAX,
} from "@/app/(enroll)/_shared/constants";
import { ParticipantsTable } from "./ParticipantsTable";
import { BulkPasteModal } from "./BulkPasteModal";
import type {
  EnrollmentForm,
  Participant,
} from "@/app/(enroll)/_shared/schema";

const EMPTY_PARTICIPANT: Participant = { name: "", email: "" };

function hasFilledTail(
  participants: Participant[],
  tailCount: number,
): boolean {
  const tail = participants.slice(participants.length - tailCount);
  return tail.some((p) => Boolean(p.name) || Boolean(p.email));
}

export function GroupFields() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<EnrollmentForm>();
  const { fields, replace } = useFieldArray({
    control,
    name: "group.participants",
  });
  const headCount = watch("group.headCount") ?? HEADCOUNT_MIN;
  const groupErrors = errors as { group?: Record<string, { message?: string }> };

  const [bulkOpen, setBulkOpen] = useState(false);
  const [confirmShrink, setConfirmShrink] = useState<{
    open: boolean;
    target: number;
  }>({ open: false, target: HEADCOUNT_MIN });

  const applyHeadCount = (next: number) => {
    setValue("group.headCount", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
    const current = (watch("group.participants") ?? []) as Participant[];
    if (next > current.length) {
      const padding = Array.from(
        { length: next - current.length },
        () => EMPTY_PARTICIPANT,
      );
      replace([...current, ...padding]);
    } else if (next < current.length) {
      replace(current.slice(0, next));
    }
  };

  const handleHeadCountChange = (next: number) => {
    if (next >= fields.length) {
      applyHeadCount(next);
      return;
    }
    const losing = fields.length - next;
    const current = watch("group.participants") ?? [];
    if (hasFilledTail(current, losing)) {
      setConfirmShrink({ open: true, target: next });
      return;
    }
    applyHeadCount(next);
  };

  return (
    <div className="flex flex-col gap-5">
      <Field
        label="단체명"
        required
        error={groupErrors.group?.organizationName?.message}
      >
        <Input
          placeholder="ACME Corp."
          {...register("group.organizationName")}
        />
      </Field>

      <Field
        label="담당자 연락처"
        required
        hint="담당자 이름과 연락처를 자유롭게 입력해주세요"
        error={groupErrors.group?.contactPerson?.message}
      >
        <Input
          placeholder="박과장 010-9999-0000"
          {...register("group.contactPerson")}
        />
      </Field>

      <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-5">
        <div className="flex items-center gap-3">
          <h4 className="text-base font-bold text-[var(--color-text-primary)]">
            참가자 명단
          </h4>
          <Stepper
            value={headCount}
            onChange={handleHeadCountChange}
            min={HEADCOUNT_MIN}
            max={HEADCOUNT_MAX}
            aria-label="참가자 수"
          />
          <span className="text-sm text-[var(--color-text-secondary)]">
            {headCount}명
          </span>
        </div>
        <Button variant="secondary" onClick={() => setBulkOpen(true)}>
          📋 일괄 입력
        </Button>
      </div>

      <ParticipantsTable />
      {groupErrors.group?.headCount?.message && (
        <p role="alert" className="text-xs text-[var(--color-error)]">
          {groupErrors.group.headCount.message}
        </p>
      )}

      <BulkPasteModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onApply={(rows) => {
          replace(rows);
          setValue("group.headCount", rows.length, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
      />

      <Modal
        open={confirmShrink.open}
        onClose={() => setConfirmShrink({ open: false, target: HEADCOUNT_MIN })}
        title="입력한 참가자 정보가 삭제됩니다"
        description="줄어든 인원만큼 마지막 참가자부터 삭제됩니다. 계속하시겠어요?"
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() =>
                setConfirmShrink({ open: false, target: HEADCOUNT_MIN })
              }
            >
              취소
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                applyHeadCount(confirmShrink.target);
                setConfirmShrink({ open: false, target: HEADCOUNT_MIN });
              }}
            >
              삭제하고 변경
            </Button>
          </>
        }
      />
    </div>
  );
}
