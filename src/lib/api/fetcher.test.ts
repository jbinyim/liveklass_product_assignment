import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fetcher } from "./fetcher";
import { ApiError } from "./ApiError";

function mockFetch(impl: typeof fetch) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(impl);
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("fetcher", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("2xx JSON 응답 반환", async () => {
    mockFetch(async () => jsonResponse(200, { id: "course-001" }));
    const data = await fetcher<{ id: string }>("/api/courses/1");
    expect(data).toEqual({ id: "course-001" });
  });

  it("204는 undefined 반환", async () => {
    mockFetch(async () => new Response(null, { status: 204 }));
    const data = await fetcher<undefined>("/api/x");
    expect(data).toBeUndefined();
  });

  it("4xx + ErrorResponse → ApiError.business", async () => {
    mockFetch(async () =>
      jsonResponse(409, {
        code: "COURSE_FULL",
        message: "정원이 가득 찼습니다",
      }),
    );
    await expect(fetcher("/api/x")).rejects.toMatchObject({
      kind: "business",
      code: "COURSE_FULL",
      httpStatus: 409,
    });
  });

  it("INVALID_INPUT의 details 보존", async () => {
    mockFetch(async () =>
      jsonResponse(400, {
        code: "INVALID_INPUT",
        message: "입력 오류",
        details: { "applicant.email": "이미 사용 중" },
      }),
    );
    try {
      await fetcher("/api/x");
      throw new Error("should not reach");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).details).toEqual({
        "applicant.email": "이미 사용 중",
      });
    }
  });

  it("4xx인데 형식 불일치 → ApiError.unknown", async () => {
    mockFetch(async () => jsonResponse(500, { foo: "bar" }));
    await expect(fetcher("/api/x")).rejects.toMatchObject({
      kind: "unknown",
      httpStatus: 500,
    });
  });

  it("4xx인데 JSON 파싱 실패 → ApiError.unknown", async () => {
    mockFetch(
      async () =>
        new Response("not-json", {
          status: 503,
          headers: { "Content-Type": "text/plain" },
        }),
    );
    await expect(fetcher("/api/x")).rejects.toMatchObject({
      kind: "unknown",
      httpStatus: 503,
    });
  });

  it("fetch 자체 실패 (네트워크) → ApiError.network", async () => {
    mockFetch(async () => {
      throw new TypeError("Failed to fetch");
    });
    await expect(fetcher("/api/x")).rejects.toMatchObject({
      kind: "network",
    });
  });

  it("POST + body → JSON 직렬화 + Content-Type 헤더", async () => {
    const spy = mockFetch(async () => jsonResponse(200, {}));
    await fetcher("/api/x", { method: "POST", body: { a: 1 } });
    expect(spy).toHaveBeenCalledWith(
      "/api/x",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ a: 1 }),
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
  });
});
