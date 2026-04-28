import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFormContext } from "react-hook-form";
import { useTypeSwitchGuard } from "./useTypeSwitchGuard";
import { createFormWrapper } from "./__test__/formWrapper";
import type { EnrollmentForm } from "@/app/(enroll)/_shared/schema";

function useGuardWithValues() {
  const guard = useTypeSwitchGuard();
  const ctx = useFormContext<EnrollmentForm>();
  return { guard, getType: () => ctx.getValues("type"), getGroup: () => ctx.getValues("group" as never) };
}

describe("useTypeSwitchGuard", () => {
  it("동일 타입 요청은 no-op", () => {
    const { Wrapper } = createFormWrapper();
    const { result } = renderHook(useGuardWithValues, { wrapper: Wrapper });
    act(() => {
      result.current.guard.requestSwitch("personal");
    });
    expect(result.current.guard.modalState.open).toBe(false);
  });

  it("개인 → 단체: 모달 없이 즉시 전환", () => {
    const { Wrapper } = createFormWrapper();
    const { result } = renderHook(useGuardWithValues, { wrapper: Wrapper });
    act(() => {
      result.current.guard.requestSwitch("group");
    });
    expect(result.current.guard.modalState.open).toBe(false);
    expect(result.current.getType()).toBe("group");
  });

  it("단체 → 개인 (group 비어 있음): 즉시 전환", () => {
    const { Wrapper } = createFormWrapper({ type: "group" });
    const { result } = renderHook(useGuardWithValues, { wrapper: Wrapper });
    act(() => {
      result.current.guard.requestSwitch("personal");
    });
    expect(result.current.guard.modalState.open).toBe(false);
    expect(result.current.getType()).toBe("personal");
  });

  it("단체 → 개인 (group 입력 있음): 모달 노출, 즉시 전환 안 됨", () => {
    const { Wrapper } = createFormWrapper({
      type: "group",
      group: {
        organizationName: "데일리 컴퍼니",
        headCount: 3,
        participants: [],
        contactPerson: "이대리",
      },
    });
    const { result } = renderHook(useGuardWithValues, { wrapper: Wrapper });
    act(() => {
      result.current.guard.requestSwitch("personal");
    });
    expect(result.current.guard.modalState.open).toBe(true);
    expect(result.current.guard.modalState.pendingType).toBe("personal");
    expect(result.current.getType()).toBe("group");
  });

  it("confirm → 전환 + group 빈값화", () => {
    const { Wrapper } = createFormWrapper({
      type: "group",
      group: {
        organizationName: "데일리",
        headCount: 3,
        participants: [],
        contactPerson: "이대리",
      },
    });
    const { result } = renderHook(useGuardWithValues, { wrapper: Wrapper });
    act(() => {
      result.current.guard.requestSwitch("personal");
    });
    act(() => {
      result.current.guard.confirm();
    });
    expect(result.current.guard.modalState.open).toBe(false);
    expect(result.current.getType()).toBe("personal");
    const g = result.current.getGroup() as { organizationName: string; contactPerson: string };
    expect(g.organizationName).toBe("");
    expect(g.contactPerson).toBe("");
  });

  it("cancel → 전환 안 됨, 모달 닫힘", () => {
    const { Wrapper } = createFormWrapper({
      type: "group",
      group: {
        organizationName: "데일리",
        headCount: 3,
        participants: [],
        contactPerson: "이대리",
      },
    });
    const { result } = renderHook(useGuardWithValues, { wrapper: Wrapper });
    act(() => {
      result.current.guard.requestSwitch("personal");
    });
    act(() => {
      result.current.guard.cancel();
    });
    expect(result.current.guard.modalState.open).toBe(false);
    expect(result.current.getType()).toBe("group");
    const g = result.current.getGroup() as { organizationName: string };
    expect(g.organizationName).toBe("데일리");
  });

  it("참가자 입력 있어도 모달 노출", () => {
    const { Wrapper } = createFormWrapper({
      type: "group",
      group: {
        organizationName: "",
        headCount: 2,
        participants: [{ name: "김민수", email: "x@x.com" }],
        contactPerson: "",
      },
    });
    const { result } = renderHook(useGuardWithValues, { wrapper: Wrapper });
    act(() => {
      result.current.guard.requestSwitch("personal");
    });
    expect(result.current.guard.modalState.open).toBe(true);
  });
});
