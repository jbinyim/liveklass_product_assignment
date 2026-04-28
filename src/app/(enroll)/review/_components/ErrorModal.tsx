"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/ApiError";

interface ErrorModalProps {
  error: ApiError | null;
  onClose: () => void;
  onRetry?: () => void;
}

export function ErrorModal({ error, onClose, onRetry }: ErrorModalProps) {
  const router = useRouter();
  const open = error !== null;

  if (!error) {
    return (
      <Modal open={false} onClose={onClose} title="">
        {null}
      </Modal>
    );
  }

  if (error.kind === "business" && error.code === "COURSE_FULL") {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="정원이 가득 찼습니다"
        description="다른 강의를 선택하시거나 잠시 후 다시 시도해주세요."
        actions={
          <>
            <Button variant="secondary" onClick={onClose}>
              닫기
            </Button>
            <Button
              onClick={() => {
                onClose();
                router.push("/");
              }}
            >
              강의 선택으로
            </Button>
          </>
        }
      />
    );
  }

  if (error.kind === "business" && error.code === "DUPLICATE_ENROLLMENT") {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="이미 신청한 강의예요"
        description="동일한 이메일로 이미 신청이 완료되었습니다. 문의는 고객센터로 연락 주세요."
        actions={<Button onClick={onClose}>확인</Button>}
      />
    );
  }

  if (error.kind === "network") {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="네트워크 오류"
        description="연결이 불안정합니다. 잠시 후 다시 시도해주세요."
        actions={
          <>
            <Button variant="secondary" onClick={onClose}>
              닫기
            </Button>
            {onRetry && (
              <Button
                onClick={() => {
                  onClose();
                  onRetry();
                }}
              >
                재시도
              </Button>
            )}
          </>
        }
      />
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="요청을 처리하지 못했어요"
      description={error.message || "잠시 후 다시 시도해주세요."}
      actions={<Button onClick={onClose}>확인</Button>}
    />
  );
}
