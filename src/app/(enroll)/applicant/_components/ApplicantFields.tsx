"use client";

import { useFormContext } from "react-hook-form";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MOTIVATION_MAX } from "@/app/(enroll)/_shared/constants";
import type { EnrollmentForm } from "@/app/(enroll)/_shared/schema";

export function ApplicantFields() {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext<EnrollmentForm>();
  const motivation = watch("applicant.motivation") ?? "";

  return (
    <div className="flex flex-col gap-5">
      <Field
        label="이름"
        required
        error={errors.applicant?.name?.message as string | undefined}
      >
        <Input
          placeholder="홍길동"
          autoComplete="name"
          {...register("applicant.name")}
        />
      </Field>

      <Field
        label="이메일"
        required
        error={errors.applicant?.email?.message as string | undefined}
      >
        <Input
          type="email"
          placeholder="example@domain.com"
          autoComplete="email"
          {...register("applicant.email")}
        />
      </Field>

      <Field
        label="전화번호"
        required
        hint="예: 010-1234-5678"
        error={errors.applicant?.phone?.message as string | undefined}
      >
        <Input
          type="tel"
          placeholder="010-0000-0000"
          autoComplete="tel"
          {...register("applicant.phone")}
        />
      </Field>

      <Field
        label="수강 동기"
        hint={`${motivation.length}/${MOTIVATION_MAX}자 (선택)`}
        error={errors.applicant?.motivation?.message as string | undefined}
      >
        <Input
          placeholder="수강 동기를 자유롭게 입력해주세요"
          maxLength={MOTIVATION_MAX}
          {...register("applicant.motivation")}
        />
      </Field>
    </div>
  );
}
