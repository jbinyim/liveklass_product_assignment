"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { loadDraft, clearDraft } from "@/lib/storage/enrollmentDraft";
import { useDraftPersistence } from "@/app/(enroll)/_shared/hooks/useDraftPersistence";
import { useBeforeUnloadGuard } from "@/app/(enroll)/_shared/hooks/useBeforeUnloadGuard";
import type { EnrollmentForm } from "@/app/(enroll)/_shared/schema";

export function DraftRestoreGate({ children }: { children: ReactNode }) {
  const { reset } = useFormContext<EnrollmentForm>();
  useDraftPersistence();
  useBeforeUnloadGuard();
  const [phase, setPhase] = useState<"loading" | "prompt" | "ready">(
    "loading",
  );
  const [draft, setDraft] = useState<unknown>(null);

  useEffect(() => {
    const loaded = loadDraft();
    if (loaded) {
      setDraft(loaded);
      setPhase("prompt");
    } else {
      setPhase("ready");
    }
  }, []);

  if (phase === "loading") return null;

  return (
    <>
      {children}
      <Modal
        open={phase === "prompt"}
        onClose={() => {
          clearDraft();
          setPhase("ready");
        }}
        title="이전 입력값이 남아 있어요"
        description="작성하던 신청 정보를 복구하시겠어요? 폐기를 선택하면 처음부터 시작합니다."
        closeOnBackdrop={false}
        closeOnEsc={false}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                clearDraft();
                setPhase("ready");
              }}
            >
              폐기
            </Button>
            <Button
              onClick={() => {
                if (draft && typeof draft === "object") {
                  reset(draft as EnrollmentForm);
                }
                setPhase("ready");
              }}
            >
              복구
            </Button>
          </>
        }
      />
    </>
  );
}
