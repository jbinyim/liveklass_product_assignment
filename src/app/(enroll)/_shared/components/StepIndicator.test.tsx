import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StepIndicator } from "./StepIndicator";
import { createFormWrapper } from "@/app/(enroll)/_shared/hooks/__test__/formWrapper";

const pushMock = vi.fn();
const replaceMock = vi.fn();
let currentPath = "/";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  usePathname: () => currentPath,
}));

beforeEach(() => {
  pushMock.mockClear();
  replaceMock.mockClear();
  currentPath = "/";
});

describe("StepIndicator", () => {
  it("3 스텝 모두 렌더 + 라벨", () => {
    const { Wrapper } = createFormWrapper();
    render(
      <Wrapper>
        <StepIndicator />
      </Wrapper>,
    );
    expect(screen.getByText("강의 선택")).toBeInTheDocument();
    expect(screen.getByText("정보 입력")).toBeInTheDocument();
    expect(screen.getByText("확인")).toBeInTheDocument();
  });

  it("현재 스텝에 aria-current='step'", () => {
    const { Wrapper } = createFormWrapper();
    render(
      <Wrapper>
        <StepIndicator />
      </Wrapper>,
    );
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveAttribute("aria-current", "step");
    expect(items[1]).not.toHaveAttribute("aria-current");
  });

  it("잠긴 스텝은 aria-disabled + 툴팁", () => {
    const { Wrapper } = createFormWrapper();
    render(
      <Wrapper>
        <StepIndicator />
      </Wrapper>,
    );
    const lockedDiv = screen
      .getByText("정보 입력")
      .closest('[aria-disabled="true"]');
    expect(lockedDiv).toBeInTheDocument();
    expect(lockedDiv).toHaveAttribute("title", "이전 단계 완료 후 이용 가능합니다");
  });

  it("완료 스텝(unlocked + not current) 클릭 → goToStep 동작", async () => {
    currentPath = "/applicant";
    const user = userEvent.setup();
    const { Wrapper } = createFormWrapper({
      courseId: "course-001",
      applicant: {
        name: "김민수",
        email: "user@example.com",
        phone: "010-1234-5678",
        motivation: "",
      },
    });
    render(
      <Wrapper>
        <StepIndicator />
      </Wrapper>,
    );
    await user.click(screen.getByText("강의 선택"));
    expect(pushMock).toHaveBeenCalledWith("/");
  });
});
