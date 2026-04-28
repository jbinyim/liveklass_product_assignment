"use client";

import {
  useFieldArray,
  useFormContext,
  useFormState,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { EnrollmentForm } from "@/app/(enroll)/_shared/schema";

export function ParticipantsTable() {
  const { register, control } = useFormContext<EnrollmentForm>();
  const { errors } = useFormState({ control });
  const { fields } = useFieldArray({ control, name: "group.participants" });

  if (fields.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-gray-300 bg-[var(--color-surface)] py-6 text-center text-sm text-[var(--color-text-secondary)]">
        인원수를 정하면 참가자 입력란이 표시됩니다.
      </p>
    );
  }

  const groupErrors = (errors as { group?: { participants?: unknown } }).group;
  const participantErrors = (groupErrors?.participants ?? []) as Array<{
    name?: { message?: string };
    email?: { message?: string };
  }>;

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-[24px_200px_1fr] gap-2 px-3 text-xs font-semibold text-[var(--color-text-muted)]">
        <span>#</span>
        <span>이름</span>
        <span>이메일</span>
      </div>
      {fields.map((field, idx) => {
        const nameErr = participantErrors[idx]?.name?.message;
        const emailErr = participantErrors[idx]?.email?.message;
        return (
          <div key={field.id} className="flex flex-col gap-1">
            <div className="grid grid-cols-[24px_200px_1fr] items-center gap-2">
              <span className="text-sm text-[var(--color-text-muted)]">
                {idx + 1}
              </span>
              <Input
                placeholder="이름"
                aria-label={`참가자 ${idx + 1} 이름`}
                invalid={Boolean(nameErr)}
                {...register(`group.participants.${idx}.name`)}
              />
              <Input
                placeholder="email@example.com"
                aria-label={`참가자 ${idx + 1} 이메일`}
                invalid={Boolean(emailErr)}
                {...register(`group.participants.${idx}.email`)}
              />
            </div>
            {(nameErr || emailErr) && (
              <p
                role="alert"
                className="pl-8 text-xs text-[var(--color-error)]"
              >
                {nameErr ?? emailErr}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
