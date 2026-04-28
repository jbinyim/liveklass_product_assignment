"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

export function EnrollmentSummary() {
  const router = useRouter();
  const search = useSearchParams();
  const enrollmentId = search?.get("id") ?? "";

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-16">
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
        <div className="flex items-center justify-center gap-2 rounded-md bg-[var(--color-surface)] px-5 py-3 w-full max-w-sm">
          <span className="text-sm text-[var(--color-text-muted)]">
            신청 번호
          </span>
          <span className="text-sm font-bold text-[var(--color-text-primary)]">
            {enrollmentId}
          </span>
        </div>
      )}

      <div className="pt-4">
        <Button variant="secondary" size="lg" onClick={() => router.push("/")}>
          처음으로
        </Button>
      </div>
    </main>
  );
}
