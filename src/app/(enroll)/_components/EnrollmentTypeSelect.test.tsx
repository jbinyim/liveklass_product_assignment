import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnrollmentTypeSelect } from "./EnrollmentTypeSelect";
import { createFormWrapper } from "@/app/(enroll)/_shared/hooks/__test__/formWrapper";

describe("EnrollmentTypeSelect", () => {
  it("두 라디오 + 기본 personal 체크", () => {
    const { Wrapper } = createFormWrapper();
    render(
      <Wrapper>
        <EnrollmentTypeSelect />
      </Wrapper>,
    );
    const personal = screen.getByRole("radio", { name: "개인 신청" });
    const group = screen.getByRole("radio", { name: "단체 신청" });
    expect(personal).toHaveAttribute("aria-checked", "true");
    expect(group).toHaveAttribute("aria-checked", "false");
  });

  it("개인→단체 클릭 시 잃을 데이터 없으니 즉시 전환", async () => {
    const user = userEvent.setup();
    const { Wrapper } = createFormWrapper();
    render(
      <Wrapper>
        <EnrollmentTypeSelect />
      </Wrapper>,
    );
    await user.click(screen.getByRole("radio", { name: "단체 신청" }));
    expect(
      screen.getByRole("radio", { name: "단체 신청" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("단체→개인 (group 입력 있음) 시 모달 노출 → '취소' 클릭 시 유지", async () => {
    const user = userEvent.setup();
    const { Wrapper } = createFormWrapper({
      type: "group",
      group: {
        organizationName: "데일리",
        headCount: 3,
        participants: [],
        contactPerson: "이대리",
      },
    });
    render(
      <Wrapper>
        <EnrollmentTypeSelect />
      </Wrapper>,
    );
    await user.click(screen.getByRole("radio", { name: "개인 신청" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "취소" }));
    expect(
      screen.getByRole("radio", { name: "단체 신청" }),
    ).toHaveAttribute("aria-checked", "true");
  });

  it("단체→개인 + '전환' 클릭 시 personal로 변경", async () => {
    const user = userEvent.setup();
    const { Wrapper } = createFormWrapper({
      type: "group",
      group: {
        organizationName: "데일리",
        headCount: 3,
        participants: [],
        contactPerson: "이대리",
      },
    });
    render(
      <Wrapper>
        <EnrollmentTypeSelect />
      </Wrapper>,
    );
    await user.click(screen.getByRole("radio", { name: "개인 신청" }));
    await user.click(screen.getByRole("button", { name: "전환" }));
    expect(
      screen.getByRole("radio", { name: "개인 신청" }),
    ).toHaveAttribute("aria-checked", "true");
  });
});
