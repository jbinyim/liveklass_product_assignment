"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useCourses } from "@/app/(enroll)/_shared/hooks/useCourses";
import type { EnrollmentForm } from "@/app/(enroll)/_shared/schema";

export function EnrollmentSummary() {
  const router = useRouter();
  const search = useSearchParams();
  const enrollmentId = search?.get("id") ?? "";

  const { getValues } = useFormContext<EnrollmentForm>();
  const { data } = useCourses();
  const values = getValues();
  const course = data?.courses.find((c) => c.id === values.courseId);
  const applicant = values.applicant;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-4 py-12 sm:gap-6 sm:px-6 sm:py-16">
      <div
        aria-hidden="true"
        className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
      >
        <span className="text-4xl font-bold text-[var(--color-success)]">
          ✓
        </span>
      </div>

      <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
        신청이 완료되었습니다
      </h2>
      <p className="text-sm text-[var(--color-text-secondary)]">
        확인 메일을 곧 받아보실 수 있습니다.
      </p>

      {enrollmentId && (
        <div className="flex w-full max-w-sm items-center justify-center gap-2 rounded-md bg-[var(--color-surface)] px-5 py-3">
          <span className="text-sm text-[var(--color-text-muted)]">
            신청 번호
          </span>
          <span className="text-sm font-bold text-[var(--color-text-primary)]">
            {enrollmentId}
          </span>
        </div>
      )}

      {(course || applicant?.name) && (
        <section
          aria-label="신청 요약"
          className="flex w-full max-w-md flex-col gap-2 rounded-[var(--radius-card)] border border-gray-200 bg-white p-5 text-sm"
        >
          {course && (
            <div className="flex justify-between gap-3">
              <span className="text-[var(--color-text-muted)]">강의</span>
              <span className="text-right font-semibold text-[var(--color-text-primary)]">
                {course.title}
              </span>
            </div>
          )}
          {applicant?.name && (
            <div className="flex justify-between gap-3">
              <span className="text-[var(--color-text-muted)]">신청자</span>
              <span className="text-right font-semibold text-[var(--color-text-primary)]">
                {applicant.name}
                {applicant.email ? ` (${applicant.email})` : ""}
              </span>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <span className="text-[var(--color-text-muted)]">신청 유형</span>
            <span className="font-semibold text-[var(--color-text-primary)]">
              {values.type === "group" ? "단체" : "개인"}
            </span>
          </div>
        </section>
      )}

      <div className="pt-4">
        <Button variant="secondary" size="lg" onClick={() => router.push("/")}>
          처음으로
        </Button>
      </div>
    </main>
  );
}
