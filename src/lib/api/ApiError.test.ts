import { describe, it, expect } from "vitest";
import { ApiError } from "./ApiError";

describe("ApiError", () => {
  it("Error의 인스턴스", () => {
    const e = ApiError.network();
    expect(e).toBeInstanceOf(Error);
    expect(e).toBeInstanceOf(ApiError);
  });

  describe("business", () => {
    const e = ApiError.business(
      {
        code: "INVALID_INPUT",
        message: "잘못된 입력",
        details: { "applicant.email": "이미 사용 중" },
      },
      400,
    );

    it("kind/code/message/details/httpStatus 보존", () => {
      expect(e.kind).toBe("business");
      expect(e.code).toBe("INVALID_INPUT");
      expect(e.message).toBe("잘못된 입력");
      expect(e.details).toEqual({ "applicant.email": "이미 사용 중" });
      expect(e.httpStatus).toBe(400);
    });

    it("isBusiness=true / isNetwork=false", () => {
      expect(e.isBusiness).toBe(true);
      expect(e.isNetwork).toBe(false);
    });
  });

  describe("network", () => {
    it("기본 메시지", () => {
      const e = ApiError.network();
      expect(e.kind).toBe("network");
      expect(e.message).toBe("네트워크 오류가 발생했습니다");
      expect(e.code).toBeUndefined();
    });

    it("isNetwork=true / isBusiness=false", () => {
      const e = ApiError.network();
      expect(e.isNetwork).toBe(true);
      expect(e.isBusiness).toBe(false);
    });

    it("커스텀 메시지", () => {
      expect(ApiError.network("연결 끊김").message).toBe("연결 끊김");
    });
  });

  describe("unknown", () => {
    it("kind=unknown, isBusiness/isNetwork 모두 false", () => {
      const e = ApiError.unknown("알 수 없는 응답", 500);
      expect(e.kind).toBe("unknown");
      expect(e.httpStatus).toBe(500);
      expect(e.isBusiness).toBe(false);
      expect(e.isNetwork).toBe(false);
    });
  });
});
