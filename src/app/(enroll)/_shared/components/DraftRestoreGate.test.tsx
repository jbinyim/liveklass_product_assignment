import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useFormContext } from "react-hook-form";
import { DraftRestoreGate } from "./DraftRestoreGate";
import { createFormWrapper } from "@/app/(enroll)/_shared/hooks/__test__/formWrapper";
import { DRAFT_KEY } from "@/lib/storage/enrollmentDraft";
import type { EnrollmentForm } from "@/app/(enroll)/_shared/schema";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
}));

function ChildPeek() {
  const { getValues } = useFormContext<EnrollmentForm>();
  return <span data-testid="cid">{getValues("courseId") ?? ""}</span>;
}

function preloadDraft(courseId: string) {
  localStorage.setItem(
    DRAFT_KEY,
    JSON.stringify({
      savedAt: Date.now(),
      data: {
        type: "personal",
        courseId,
        applicant: { name: "", email: "", phone: "", motivation: "" },
        group: {
          organizationName: "",
          headCount: 2,
          participants: [],
          contactPerson: "",
        },
      },
    }),
  );
}

describe("DraftRestoreGate", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("draft 없으면 모달 안 뜨고 children 즉시 렌더", async () => {
    const { Wrapper } = createFormWrapper();
    render(
      <Wrapper>
        <DraftRestoreGate>
          <span data-testid="child">page</span>
        </DraftRestoreGate>
      </Wrapper>,
    );
    await waitFor(() => expect(screen.getByTestId("child")).toBeInTheDocument());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("draft 있으면 모달 노출 (제목·설명)", async () => {
    preloadDraft("course-001");
    const { Wrapper } = createFormWrapper();
    render(
      <Wrapper>
        <DraftRestoreGate>
          <ChildPeek />
        </DraftRestoreGate>
      </Wrapper>,
    );
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("이전 입력값이 남아 있어요")).toBeInTheDocument();
  });

  it("복구 클릭 → 폼이 draft 값으로 reset + 모달 닫힘", async () => {
    preloadDraft("course-001");
    const user = userEvent.setup();
    const { Wrapper } = createFormWrapper();
    render(
      <Wrapper>
        <DraftRestoreGate>
          <ChildPeek />
        </DraftRestoreGate>
      </Wrapper>,
    );
    await screen.findByRole("dialog");
    await user.click(screen.getByRole("button", { name: "복구" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("cid").textContent).toBe("course-001");
  });

  it("폐기 클릭 → localStorage clear + 모달 닫힘 + 폼 그대로", async () => {
    preloadDraft("course-001");
    const user = userEvent.setup();
    const { Wrapper } = createFormWrapper();
    render(
      <Wrapper>
        <DraftRestoreGate>
          <ChildPeek />
        </DraftRestoreGate>
      </Wrapper>,
    );
    await screen.findByRole("dialog");
    await user.click(screen.getByRole("button", { name: "폐기" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
    expect(screen.getByTestId("cid").textContent).toBe("");
  });
});
