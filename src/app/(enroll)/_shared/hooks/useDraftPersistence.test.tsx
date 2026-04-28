import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { useFormContext } from "react-hook-form";
import { useDraftPersistence } from "./useDraftPersistence";
import { createFormWrapper } from "./__test__/formWrapper";
import { DRAFT_KEY } from "@/lib/storage/enrollmentDraft";
import type { EnrollmentForm } from "@/app/(enroll)/_shared/schema";

function Harness() {
  useDraftPersistence();
  const ctx = useFormContext<EnrollmentForm>();
  return (
    <>
      <button
        data-testid="t1"
        onClick={() =>
          ctx.setValue("courseId", "course-001", { shouldDirty: true })
        }
      >
        t1
      </button>
      <button
        data-testid="t2"
        onClick={() =>
          ctx.setValue("courseId", "course-002", { shouldDirty: true })
        }
      >
        t2
      </button>
    </>
  );
}

describe("useDraftPersistence", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("값 변경 후 500ms 경과하면 saveDraft 호출", () => {
    const { Wrapper } = createFormWrapper();
    const { getByTestId } = render(
      <Wrapper>
        <Harness />
      </Wrapper>,
    );
    act(() => {
      getByTestId("t1").click();
    });

    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    const stored = localStorage.getItem(DRAFT_KEY);
    expect(stored).not.toBeNull();
    expect(stored).toContain("course-001");
  });

  it("debounce: 500ms 안에 다시 변경 시 저장 1회만 (마지막 값)", () => {
    const { Wrapper } = createFormWrapper();
    const { getByTestId } = render(
      <Wrapper>
        <Harness />
      </Wrapper>,
    );

    act(() => {
      getByTestId("t1").click();
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    act(() => {
      getByTestId("t2").click();
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();

    act(() => {
      vi.advanceTimersByTime(200);
    });
    const stored = localStorage.getItem(DRAFT_KEY);
    expect(stored).not.toBeNull();
    expect(stored).toContain("course-002");
    expect(stored).not.toContain("course-001");
  });
});
