import type { Category } from "@/app/(enroll)/_shared/constants";
import type {
  PersonalEnrollment,
  GroupEnrollment,
} from "@/app/(enroll)/_shared/schema";

export interface Course {
  id: string;
  title: string;
  description: string;
  category: Category;
  price: number;
  maxCapacity: number;
  currentEnrollment: number;
  startDate: string;
  endDate: string;
  instructor: string;
}

export interface CourseListResponse {
  courses: Course[];
  categories: string[];
}

export type EnrollmentRequest = PersonalEnrollment | GroupEnrollment;

export interface EnrollmentResponse {
  enrollmentId: string;
  status: "confirmed" | "pending";
  enrolledAt: string;
}

export const ERROR_CODES = [
  "COURSE_FULL",
  "DUPLICATE_ENROLLMENT",
  "INVALID_INPUT",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: Record<string, string>;
}
