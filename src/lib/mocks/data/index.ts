import { resetMockCourses } from "./courses";
import { resetMockEnrollments } from "./enrollments";

export {
  getMockCourses,
  findMockCourse,
  incrementEnrollment,
  resetMockCourses,
} from "./courses";

export {
  isDuplicateEnrollment,
  addEnrollment,
  resetMockEnrollments,
} from "./enrollments";

export function resetMockState(): void {
  resetMockCourses();
  resetMockEnrollments();
}
