import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useFormContext } from "react-hook-form";
import { ParticipantsTable } from "./ParticipantsTable";
import { createFormWrapper } from "@/app/(enroll)/_shared/hooks/__test__/formWrapper";
import type { EnrollmentForm } from "@/app/(enroll)/_shared/schema";

function TriggerHelper() {
  const { trigger } = useFormContext<EnrollmentForm>();
  return (
    <button data-testid="trigger" onClick={() => trigger()}>
      trigger
    </button>
  );
}

describe("ParticipantsTable", () => {
  it("participants 비어 있으면 placeholder 노출", () => {
    const { Wrapper } = createFormWrapper();
    render(
      <Wrapper>
        <ParticipantsTable />
      </Wrapper>,
    );
    expect(screen.getByText(/참가자 입력란이 표시/)).toBeInTheDocument();
  });

  it("participants 2개 → 2 행 + 인덱스 라벨", () => {
    const { Wrapper } = createFormWrapper({
      type: "group",
      group: {
        organizationName: "테스트",
        headCount: 2,
        participants: [
          { name: "김민수", email: "min@example.com" },
          { name: "이지영", email: "j@example.com" },
        ],
        contactPerson: "박과장",
      },
    });
    render(
      <Wrapper>
        <ParticipantsTable />
      </Wrapper>,
    );
    expect(screen.getByLabelText("참가자 1 이름")).toBeInTheDocument();
    expect(screen.getByLabelText("참가자 2 이메일")).toBeInTheDocument();
  });

  it("trigger 후 참가자 간 이메일 중복 시 인라인 에러 노출", async () => {
    const user = userEvent.setup();
    const { Wrapper } = createFormWrapper({
      type: "group",
      courseId: "course-001",
      applicant: {
        name: "신청자",
        email: "applicant@example.com",
        phone: "010-1111-2222",
        motivation: "",
      },
      group: {
        organizationName: "테스트",
        headCount: 2,
        participants: [
          { name: "김민수", email: "dup@example.com" },
          { name: "이지영", email: "dup@example.com" },
        ],
        contactPerson: "박과장",
      },
      agreedToTerms: true,
    });
    render(
      <Wrapper>
        <ParticipantsTable />
        <TriggerHelper />
      </Wrapper>,
    );
    await user.click(screen.getByTestId("trigger"));
    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some((a) => /중복/.test(a.textContent ?? ""))).toBe(true);
    });
  });
});
