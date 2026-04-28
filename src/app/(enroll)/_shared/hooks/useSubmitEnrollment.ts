"use client";

import { useMutation } from "@tanstack/react-query";
import { submitEnrollment } from "@/app/(enroll)/_shared/api/enrollments";
import { ApiError } from "@/lib/api/ApiError";
import type {
  EnrollmentRequest,
  EnrollmentResponse,
} from "@/app/(enroll)/_shared/api/types";

export function useSubmitEnrollment() {
  return useMutation<EnrollmentResponse, ApiError, EnrollmentRequest>({
    mutationFn: (req) => submitEnrollment(req),
  });
}
