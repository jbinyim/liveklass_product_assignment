import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/lib/mocks/server";
import { useSubmitEnrollment } from "./useSubmitEnrollment";
import { createQueryWrapper } from "./__test__/queryWrapper";
import { ApiError } from "@/lib/api/ApiError";
import type { EnrollmentRequest } from "@/app/(enroll)/_shared/api/types";

const validReq: EnrollmentRequest = {
  type: "personal",
  courseId: "course-001",
  applicant: {
    name: "김민수",
    email: "user@example.com",
    phone: "010-1234-5678",
    motivation: "",
  },
  agreedToTerms: true,
};

describe("useSubmitEnrollment", () => {
  it("성공 시 enrollmentId 반환", async () => {
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useSubmitEnrollment(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync(validReq);
    });

    expect(result.current.data?.enrollmentId).toMatch(/^enr-/);
  });

  it("COURSE_FULL → ApiError business 잡힘", async () => {
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useSubmitEnrollment(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.mutate({ ...validReq, courseId: "course-003" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(result.current.error?.code).toBe("COURSE_FULL");
  });

  it("네트워크 에러 → ApiError network 잡힘", async () => {
    server.use(http.post("/api/enrollments", () => HttpResponse.error()));
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useSubmitEnrollment(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.mutate(validReq);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.kind).toBe("network");
  });
});
