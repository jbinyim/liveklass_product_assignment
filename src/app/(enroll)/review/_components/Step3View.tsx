"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { SummarySection } from "./SummarySection";
import { TermsCheckbox } from "./TermsCheckbox";
import { ErrorModal } from "./ErrorModal";
import { useStepNavigation } from "@/app/(enroll)/_shared/hooks/useStepNavigation";
import { useSubmitEnrollment } from "@/app/(enroll)/_shared/hooks/useSubmitEnrollment";
import { clearDraft } from "@/lib/storage/enrollmentDraft";
import { ApiError } from "@/lib/api/ApiError";
import type {
  EnrollmentForm,
  Step,
} from "@/app/(enroll)/_shared/schema";
import type { EnrollmentRequest } from "@/app/(enroll)/_shared/api/types";

const FIELD_TO_STEP: Record<string, Step> = {
  courseId: "course",
  type: "course",
  applicant: "applicant",
  group: "applicant",
  agreedToTerms: "review",
};

function pickStep(path: string): Step {
  const head = path.split(".")[0] ?? "";
  return FIELD_TO_STEP[head] ?? "review";
}

export function Step3View() {
  const { handleSubmit, setError, setFocus } = useFormContext<EnrollmentForm>();
  const nav = useStepNavigation();
  const router = useRouter();
  const { mutateAsync, isPending } = useSubmitEnrollment();
  const [error, setError2] = useState<ApiError | null>(null);
  const [pending, setPending] = useState<EnrollmentForm | null>(null);

  const focusFirstError = (path: string) => {
    // 라우트 전환 후 input이 마운트될 때까지 한 tick 기다림
    setTimeout(() => {
      try {
        setFocus(path as never);
      } catch {
        // path가 마운트 안 된 경우 무시
      }
      const el = document.querySelector<HTMLElement>(`[name="${path}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const submit = async (data: EnrollmentForm) => {
    setPending(data);
    try {
      const res = await mutateAsync(data as EnrollmentRequest);
      clearDraft();
      router.push(`/success?id=${encodeURIComponent(res.enrollmentId)}`);
    } catch (e) {
      if (!(e instanceof ApiError)) {
        setError2(ApiError.unknown("알 수 없는 오류가 발생했습니다"));
        return;
      }
      if (e.kind === "business" && e.code === "INVALID_INPUT" && e.details) {
        // 필드별 setError + 첫 에러 스텝으로 점프 + 첫 에러 필드 포커스/스크롤 (D005-c)
        let firstStep: Step | null = null;
        let firstPath: string | null = null;
        for (const [path, message] of Object.entries(e.details)) {
          setError(path as never, { type: "server", message });
          if (!firstStep) {
            firstStep = pickStep(path);
            firstPath = path;
          }
        }
        if (firstStep && firstStep !== nav.current) nav.goToStep(firstStep);
        if (firstPath) focusFirstError(firstPath);
        return;
      }
      setError2(e);
    }
  };

  const retry = () => {
    if (pending) submit(pending);
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-8 sm:gap-6 sm:px-6 sm:py-10">
      <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
        확인 및 제출
      </h2>

      <SummarySection />
      <TermsCheckbox />

      <footer className="flex items-center justify-between pt-2">
        <Button variant="secondary" size="lg" onClick={() => nav.goPrev()}>
          ← 이전
        </Button>
        <Button
          size="lg"
          loading={isPending}
          onClick={handleSubmit(submit)}
        >
          제출하기
        </Button>
      </footer>

      <ErrorModal
        error={error}
        onClose={() => setError2(null)}
        onRetry={error?.kind === "network" ? retry : undefined}
      />
    </main>
  );
}
