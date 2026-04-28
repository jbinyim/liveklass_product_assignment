import type {
  ErrorCode,
  ErrorResponse,
} from "@/app/(enroll)/_shared/api/types";

export type ApiErrorKind = "business" | "network" | "unknown";

interface ApiErrorInit {
  kind: ApiErrorKind;
  code?: ErrorCode;
  message: string;
  details?: Record<string, string>;
  httpStatus?: number;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly code?: ErrorCode;
  readonly details?: Record<string, string>;
  readonly httpStatus?: number;

  constructor(init: ApiErrorInit) {
    super(init.message);
    this.name = "ApiError";
    this.kind = init.kind;
    this.code = init.code;
    this.details = init.details;
    this.httpStatus = init.httpStatus;
  }

  get isBusiness(): boolean {
    return this.kind === "business";
  }

  get isNetwork(): boolean {
    return this.kind === "network";
  }

  static business(
    body: ErrorResponse,
    httpStatus: number,
  ): ApiError {
    return new ApiError({
      kind: "business",
      code: body.code,
      message: body.message,
      details: body.details,
      httpStatus,
    });
  }

  static network(message = "네트워크 오류가 발생했습니다"): ApiError {
    return new ApiError({ kind: "network", message });
  }

  static unknown(message: string, httpStatus?: number): ApiError {
    return new ApiError({ kind: "unknown", message, httpStatus });
  }
}
