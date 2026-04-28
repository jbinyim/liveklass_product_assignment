import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStepNavigation } from "./useStepNavigation";
import { createFormWrapper } from "./__test__/formWrapper";

const pushMock = vi.fn();
const replaceMock = vi.fn();
let currentPath = "/";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  usePathname: () => currentPath,
}));

const filledApplicant = {
  applicant: {
    name: "김민수",
    email: "user@example.com",
    phone: "010-1234-5678",
    motivation: "",
  },
};

beforeEach(() => {
  pushMock.mockClear();
  replaceMock.mockClear();
  currentPath = "/";
});

describe("useStepNavigation", () => {
  it("초기 상태: current='course', completed=[]", () => {
    const { Wrapper } = createFormWrapper();
    const { result } = renderHook(() => useStepNavigation(), { wrapper: Wrapper });
    expect(result.current.current).toBe("course");
    expect(result.current.completed).toEqual([]);
  });

  it("courseId 채우면 course 단계 완료", () => {
    const { Wrapper } = createFormWrapper({ courseId: "course-001" });
    const { result } = renderHook(() => useStepNavigation(), { wrapper: Wrapper });
    expect(result.current.completed).toContain("course");
  });

  it("isUnlocked: 이전 모두 완료되어야 unlock", () => {
    const { Wrapper } = createFormWrapper();
    const { result } = renderHook(() => useStepNavigation(), { wrapper: Wrapper });
    expect(result.current.isUnlocked("course")).toBe(true);
    expect(result.current.isUnlocked("applicant")).toBe(false);
    expect(result.current.isUnlocked("review")).toBe(false);
  });

  it("미완료 미래 스텝(/applicant) 직접 접근 시 router.replace('/')", () => {
    currentPath = "/applicant";
    const { Wrapper } = createFormWrapper();
    renderHook(() => useStepNavigation(), { wrapper: Wrapper });
    expect(replaceMock).toHaveBeenCalledWith("/");
  });

  it("course 완료 + /applicant 접근은 통과 (replace 호출 안 됨)", () => {
    currentPath = "/applicant";
    const { Wrapper } = createFormWrapper({
      courseId: "course-001",
      ...filledApplicant,
    });
    renderHook(() => useStepNavigation(), { wrapper: Wrapper });
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("goToStep 잠긴 스텝은 push 안 됨", () => {
    const { Wrapper } = createFormWrapper();
    const { result } = renderHook(() => useStepNavigation(), { wrapper: Wrapper });
    act(() => {
      result.current.goToStep("review");
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("goNext: 다음 스텝으로 push", () => {
    const { Wrapper } = createFormWrapper({
      courseId: "course-001",
      ...filledApplicant,
    });
    const { result } = renderHook(() => useStepNavigation(), { wrapper: Wrapper });
    act(() => {
      result.current.goNext();
    });
    expect(pushMock).toHaveBeenCalledWith("/applicant");
  });

  it("goPrev: 잠금 무시하고 이전으로", () => {
    currentPath = "/applicant";
    const { Wrapper } = createFormWrapper({
      courseId: "course-001",
      ...filledApplicant,
    });
    const { result } = renderHook(() => useStepNavigation(), { wrapper: Wrapper });
    act(() => {
      result.current.goPrev();
    });
    expect(pushMock).toHaveBeenCalledWith("/");
  });
});
