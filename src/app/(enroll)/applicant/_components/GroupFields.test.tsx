import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useFormContext } from "react-hook-form";
import { GroupFields } from "./GroupFields";
import { createFormWrapper } from "@/app/(enroll)/_shared/hooks/__test__/formWrapper";
import type { EnrollmentForm } from "@/app/(enroll)/_shared/schema";

function CountSpy() {
  const { watch } = useFormContext<EnrollmentForm>();
  const hc = watch("group.headCount") ?? 0;
  const ps = watch("group.participants") ?? [];
  return (
    <div data-testid="spy">
      hc={hc} len={ps.length}
    </div>
  );
}

describe("GroupFields", () => {
  it("기본 렌더 (단체명/담당자/참가자명단)", () => {
    const { Wrapper } = createFormWrapper({ type: "group" });
    render(
      <Wrapper>
        <GroupFields />
      </Wrapper>,
    );
    expect(screen.getByText("단체명")).toBeInTheDocument();
    expect(screen.getByText("담당자 연락처")).toBeInTheDocument();
    expect(screen.getByText("참가자 명단")).toBeInTheDocument();
  });

  it("Stepper + 클릭 시 headCount/participants 동기화 (증가)", async () => {
    const user = userEvent.setup();
    const { Wrapper } = createFormWrapper({ type: "group" });
    render(
      <Wrapper>
        <GroupFields />
        <CountSpy />
      </Wrapper>,
    );
    // 마운트 시 headCount(default 2) ↔ participants 자동 동기화
    expect(screen.getByTestId("spy").textContent).toBe("hc=2 len=2");
    await user.click(screen.getByLabelText("증가"));
    expect(screen.getByTestId("spy").textContent).toBe("hc=3 len=3");
  });

  it("감소 시 마지막 행 비어 있으면 모달 없이 즉시 적용", async () => {
    const user = userEvent.setup();
    const { Wrapper } = createFormWrapper({
      type: "group",
      group: {
        organizationName: "x",
        headCount: 3,
        participants: [
          { name: "김", email: "a@x.com" },
          { name: "", email: "" },
          { name: "", email: "" },
        ],
        contactPerson: "y",
      },
    });
    render(
      <Wrapper>
        <GroupFields />
        <CountSpy />
      </Wrapper>,
    );
    await user.click(screen.getByLabelText("감소"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("spy").textContent).toBe("hc=2 len=2");
  });

  it("감소 시 마지막 행 채워져 있으면 확인 모달 노출 (D008-b)", async () => {
    const user = userEvent.setup();
    const { Wrapper } = createFormWrapper({
      type: "group",
      group: {
        organizationName: "x",
        headCount: 3,
        participants: [
          { name: "김", email: "a@x.com" },
          { name: "이", email: "b@x.com" },
          { name: "박", email: "c@x.com" },
        ],
        contactPerson: "y",
      },
    });
    render(
      <Wrapper>
        <GroupFields />
        <CountSpy />
      </Wrapper>,
    );
    await user.click(screen.getByLabelText("감소"));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("spy").textContent).toBe("hc=3 len=3");
    await user.click(screen.getByRole("button", { name: "삭제하고 변경" }));
    expect(screen.getByTestId("spy").textContent).toBe("hc=2 len=2");
  });

  it("일괄 입력 적용 시 participants + headCount 갱신", async () => {
    const user = userEvent.setup();
    const { Wrapper } = createFormWrapper({ type: "group" });
    render(
      <Wrapper>
        <GroupFields />
        <CountSpy />
      </Wrapper>,
    );
    await user.click(screen.getByRole("button", { name: /일괄 입력/ }));
    const ta = screen.getByLabelText("참가자 일괄 붙여넣기");
    await user.type(
      ta,
      "김민수,a@x.com{Enter}이지영,b@x.com{Enter}박재현,c@x.com",
    );
    await user.click(screen.getByRole("button", { name: /3명 적용/ }));
    expect(screen.getByTestId("spy").textContent).toBe("hc=3 len=3");
  });
});
