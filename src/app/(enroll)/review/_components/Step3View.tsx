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
  const { handleSubmit, setError } = useFormContext<EnrollmentForm>();
  const nav = useStepNavigation();
  const router = useRouter();
  const { mutateAsync, isPending } = useSubmitEnrollment();
  const [error, setError2] = useState<ApiError | null>(null);
  const [pending, setPending] = useState<EnrollmentForm | null>(null);

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
        // 필드별 setError + 첫 에러 스텝으로 점프 (D005-c)
        let firstStep: Step | null = null;
        for (const [path, message] of Object.entries(e.details)) {
          setError(path as never, { type: "server", message });
          if (!firstStep) firstStep = pickStep(path);
        }
        if (firstStep && firstStep !== nav.current) nav.goToStep(firstStep);
        return;
      }
      setError2(e);
    }
  };

  const retry = () => {
    if (pending) submit(pending);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10 flex flex-col gap-6">
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
