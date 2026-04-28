import type { Course } from "@/app/(enroll)/_shared/api/types";

const SEED_COURSES: readonly Course[] = [
  {
    id: "course-001",
    title: "프론트엔드 기초: HTML/CSS/JS",
    description: "웹 개발 입문자를 위한 4주 코스",
    category: "development",
    price: 240000,
    maxCapacity: 30,
    currentEnrollment: 12,
    startDate: "2026-05-12",
    endDate: "2026-06-09",
    instructor: "이예린",
  },
  {
    id: "course-002",
    title: "React 실전 패턴",
    description: "실무에서 쓰는 컴포넌트 설계와 상태 관리",
    category: "development",
    price: 320000,
    maxCapacity: 20,
    currentEnrollment: 17,
    startDate: "2026-05-19",
    endDate: "2026-06-23",
    instructor: "박지훈",
  },
  {
    id: "course-003",
    title: "UX 리서치 입문",
    description: "사용자 인터뷰부터 페르소나 도출까지",
    category: "design",
    price: 280000,
    maxCapacity: 15,
    currentEnrollment: 15,
    startDate: "2026-05-15",
    endDate: "2026-06-12",
    instructor: "김연수",
  },
  {
    id: "course-004",
    title: "피그마 디자인 시스템",
    description: "디자인 토큰과 컴포넌트 라이브러리 구축",
    category: "design",
    price: 260000,
    maxCapacity: 25,
    currentEnrollment: 8,
    startDate: "2026-06-02",
    endDate: "2026-06-30",
    instructor: "최미라",
  },
  {
    id: "course-005",
    title: "그로스 마케팅 시작하기",
    description: "퍼널, AB 테스트, 리텐션 핵심 개념",
    category: "marketing",
    price: 220000,
    maxCapacity: 40,
    currentEnrollment: 36,
    startDate: "2026-05-21",
    endDate: "2026-06-18",
    instructor: "한서윤",
  },
  {
    id: "course-006",
    title: "콘텐츠 마케팅 워크숍",
    description: "기획부터 발행까지 8주 실습",
    category: "marketing",
    price: 200000,
    maxCapacity: 30,
    currentEnrollment: 5,
    startDate: "2026-06-09",
    endDate: "2026-08-04",
    instructor: "정도현",
  },
  {
    id: "course-007",
    title: "스타트업 OKR 도입",
    description: "조직 목표 정렬과 운영 노하우",
    category: "business",
    price: 350000,
    maxCapacity: 18,
    currentEnrollment: 18,
    startDate: "2026-05-26",
    endDate: "2026-06-23",
    instructor: "강민혁",
  },
  {
    id: "course-008",
    title: "재무제표 읽는 법",
    description: "비재무 직군을 위한 8시간 집중 코스",
    category: "business",
    price: 180000,
    maxCapacity: 50,
    currentEnrollment: 22,
    startDate: "2026-06-15",
    endDate: "2026-06-16",
    instructor: "윤소영",
  },
];

let courses: Course[] = SEED_COURSES.map((c) => ({ ...c }));

export function getMockCourses(): Course[] {
  return courses;
}

export function findMockCourse(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}

export function incrementEnrollment(id: string, delta: number): boolean {
  const target = courses.find((c) => c.id === id);
  if (!target) return false;
  if (target.currentEnrollment + delta > target.maxCapacity) return false;
  target.currentEnrollment += delta;
  return true;
}

export function resetMockCourses(): void {
  courses = SEED_COURSES.map((c) => ({ ...c }));
}
