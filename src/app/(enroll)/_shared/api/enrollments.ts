import { fetcher } from "@/lib/api/fetcher";
import type {
  EnrollmentRequest,
  EnrollmentResponse,
} from "./types";

export function submitEnrollment(
  request: EnrollmentRequest,
  signal?: AbortSignal,
): Promise<EnrollmentResponse> {
  return fetcher<EnrollmentResponse>("/api/enrollments", {
    method: "POST",
    body: request,
    signal,
  });
}
