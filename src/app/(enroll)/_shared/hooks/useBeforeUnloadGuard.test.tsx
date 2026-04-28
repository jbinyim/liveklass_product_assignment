import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { useFormContext } from "react-hook-form";
import { useBeforeUnloadGuard } from "./useBeforeUnloadGuard";
import { createFormWrapper } from "./__test__/formWrapper";
import type { EnrollmentForm } from "@/app/(enroll)/_shared/schema";

function Harness() {
  useBeforeUnloadGuard();
  const ctx = useFormContext<EnrollmentForm>();
  return (
    <button
      data-testid="dirty"
      onClick={() => ctx.setValue("courseId", "c-1", { shouldDirty: true })}
    >
      dirty
    </button>
  );
}

describe("useBeforeUnloadGuard", () => {
  let addSpy: ReturnType<typeof vi.spyOn>;
  let removeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addSpy = vi.spyOn(window, "addEventListener");
    removeSpy = vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("isDirty=false: beforeunload 리스너 등록 안 됨", () => {
    const { Wrapper } = createFormWrapper();
    render(
      <Wrapper>
        <Harness />
      </Wrapper>,
    );
    const beforeUnloadCalls = addSpy.mock.calls.filter(
      ([type]: [string, ...unknown[]]) => type === "beforeunload",
    );
    expect(beforeUnloadCalls).toHaveLength(0);
  });

  it("isDirty=true: beforeunload 리스너 등록", () => {
    const { Wrapper } = createFormWrapper();
    const { getByTestId } = render(
      <Wrapper>
        <Harness />
      </Wrapper>,
    );
    act(() => {
      getByTestId("dirty").click();
    });
    const beforeUnloadCalls = addSpy.mock.calls.filter(
      ([type]: [string, ...unknown[]]) => type === "beforeunload",
    );
    expect(beforeUnloadCalls.length).toBeGreaterThan(0);
  });

  it("언마운트 시 리스너 제거", () => {
    const { Wrapper } = createFormWrapper();
    const { getByTestId, unmount } = render(
      <Wrapper>
        <Harness />
      </Wrapper>,
    );
    act(() => {
      getByTestId("dirty").click();
    });
    unmount();
    const calls = removeSpy.mock.calls.filter(
      ([type]: [string, ...unknown[]]) => type === "beforeunload",
    );
    expect(calls.length).toBeGreaterThan(0);
  });
});
