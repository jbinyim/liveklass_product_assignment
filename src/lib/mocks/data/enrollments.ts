interface EnrollmentRecord {
  enrollmentId: string;
  courseId: string;
  applicantEmail: string;
  enrolledAt: string;
}

const DUPLICATE_BLACKLIST: ReadonlySet<string> = new Set([
  "duplicate@example.com",
]);

let records: EnrollmentRecord[] = [];
let nextSeq = 1;

function compositeKey(courseId: string, email: string): string {
  return `${courseId}::${email.trim().toLowerCase()}`;
}

export function isDuplicateEnrollment(
  courseId: string,
  email: string,
): boolean {
  const normalized = email.trim().toLowerCase();
  if (DUPLICATE_BLACKLIST.has(normalized)) return true;
  return records.some(
    (r) => compositeKey(r.courseId, r.applicantEmail) === compositeKey(courseId, normalized),
  );
}

export function addEnrollment(
  courseId: string,
  applicantEmail: string,
): EnrollmentRecord {
  const record: EnrollmentRecord = {
    enrollmentId: `enr-${String(nextSeq).padStart(4, "0")}`,
    courseId,
    applicantEmail: applicantEmail.trim().toLowerCase(),
    enrolledAt: new Date().toISOString(),
  };
  nextSeq += 1;
  records.push(record);
  return record;
}

export function resetMockEnrollments(): void {
  records = [];
  nextSeq = 1;
}
