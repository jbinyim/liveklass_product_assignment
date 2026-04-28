import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/lib/mocks/server";
import { useCourses } from "./useCourses";
import { createQueryWrapper } from "./__test__/queryWrapper";

describe("useCourses", () => {
  it("성공 시 강의 배열 반환", async () => {
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useCourses(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
  });

  it("서버 에러 시 isError true", async () => {
    server.use(
      http.get("/api/courses", () => HttpResponse.json({}, { status: 500 })),
    );
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useCourses(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
