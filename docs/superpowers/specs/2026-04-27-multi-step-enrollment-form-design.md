# 다단계 수강 신청 폼 — 설계 스펙

**작성일:** 2026-04-27
**대상 과제:** 라이브클래스 FE-A — 다단계 수강 신청 폼
**참조:** [`docs/decisions.md`](../../decisions.md) (결정 기록 D001~D015)

---

## 1. 개요

온라인 교육 플랫폼의 수강 신청 흐름을 3단계 멀티스텝 폼으로 구현한다. 평가 초점은 **폼 상태 관리, 조건부 필드 데이터 정합성, 스텝별 유효성 검증, 에러 UX**.

### 사용자 흐름
1. **강의 선택** — 카테고리별 강의 목록에서 선택, 신청 유형(개인/단체) 선택
2. **수강생 정보 입력** — 공통 필드 + 단체 시 추가 필드(단체명, 인원, 참가자 명단, 담당자)
3. **확인 및 제출** — 입력 요약 검토, 약관 동의, 제출
4. **성공 화면** — 신청 번호와 요약 표시 (`/success`)
   - 실패 시에는 success 라우트로 이동하지 않고, review 페이지에서 모달/토스트로 처리 (자세한 내용은 6장 에러 처리 참조)

### 기술 스택
- Next.js 15 (App Router) + TypeScript strict
- react-hook-form + zod
- TanStack Query
- MSW (Mock API)
- Tailwind CSS
- Vitest + React Testing Library
- npm

---

## 2. 아키텍처

### 폴더 구조 (라우트 그룹 콜로케이션 — D009)

```
src/
  app/
    layout.tsx                  # 루트: QueryClientProvider, MSW 부트, ToastProvider
    providers.tsx               # 클라이언트 프로바이더 모음
    (enroll)/
      layout.tsx                # FormProvider, StepGuard, DraftRestoreGate
      _shared/                  # 페이지 간 공유
        schema/
          common.ts              # applicantSchema
          personal.ts
          group.ts                # superRefine으로 중복/길이 검증
          step.ts                 # STEP_FIELDS 매핑
          index.ts                # discriminatedUnion
        api/
          client.ts               # fetcher 사용 래퍼
          types.ts                # Request/Response/Error
        hooks/
          useStepNavigation.ts
          useDraftPersistence.ts
          useSubmitEnrollment.ts
          useTypeSwitchGuard.ts
          useBeforeUnloadGuard.ts
          useCourses.ts
        types.ts
        constants.ts              # NAME_MIN, HEADCOUNT_MIN/MAX, SEATS_LOW_THRESHOLD 등
      page.tsx                   # 1단계
      _components/
        StepIndicator.tsx
        CourseList.tsx
        CategoryFilter.tsx
        CourseCard.tsx
        EnrollmentTypeSelect.tsx
        DraftRestoreModal.tsx
      applicant/
        page.tsx                 # 2단계
        _components/
          PersonalFields.tsx
          GroupFields.tsx
          ParticipantsTable.tsx
          BulkPasteModal.tsx
          TypeSwitchModal.tsx
      review/
        page.tsx                 # 3단계
        _components/
          SummarySection.tsx
          TermsCheckbox.tsx
          ErrorModal.tsx
      success/
        page.tsx
        _components/
          EnrollmentSummary.tsx
  components/ui/                  # 도메인 무관 원자
    Button.tsx
    Input.tsx
    Modal.tsx
    Toast.tsx
    Stepper.tsx
    Field.tsx                    # label + input + error 묶음
  lib/
    api/
      fetcher.ts                  # 공통 fetch 래퍼, 에러 정규화
    mocks/
      handlers.ts
      browser.ts
      server.ts
      data/
        courses.ts
        enrollments.ts
    storage/
      enrollmentDraft.ts
    validators/
      phone.ts
```

### 라우팅
- `/` — 1단계
- `/applicant` — 2단계
- `/review` — 3단계
- `/success` — 완료

라우팅 분리 이유: 새로고침/뒤로가기 자연스러움, localStorage 복구 + URL 매칭, 분석 퍼널 측정 용이.

### Provider 트리

```
<RootLayout>
  <QueryClientProvider>
    <MswBootstrap>          # NODE_ENV=development일 때만 worker.start()
      <ToastProvider>
        {children}

<EnrollLayout>              # (enroll)/layout.tsx
  <FormProvider methods={form}>
    <DraftRestoreGate>      # 첫 진입 시 복원 모달
      <StepGuard>           # 미완 스텝 접근 시 리다이렉트
        <StepIndicator />
        {children}
```

**FormProvider 위치는 `(enroll)/layout.tsx` (D012)** — 신청 흐름에만 컨텍스트 활성화, success는 의도적으로 외부.

---

## 3. 데이터 모델

### Discriminated Union (D011, 코드 규칙)

```ts
// _shared/schema/common.ts
export const applicantSchema = z.object({
  name: z.string().min(2).max(20),
  email: z.string().email(),
  phone: z.string().regex(KR_PHONE_REGEX),
  motivation: z.string().max(300).optional(),
});

// _shared/schema/personal.ts
export const personalEnrollmentSchema = z.object({
  type: z.literal("personal"),
  courseId: z.string().min(1),
  applicant: applicantSchema,
  agreedToTerms: z.literal(true),
});

// _shared/schema/group.ts
export const participantSchema = z.object({
  name: z.string().min(2).max(20),
  email: z.string().email(),
});

export const groupEnrollmentSchema = z.object({
  type: z.literal("group"),
  courseId: z.string().min(1),
  applicant: applicantSchema,
  group: z.object({
    organizationName: z.string().min(1),
    headCount: z.number().int().min(2).max(10),
    participants: z.array(participantSchema),
    contactPerson: z.string().min(1),
  }),
  agreedToTerms: z.literal(true),
}).superRefine((data, ctx) => {
  // participants.length === headCount
  // 참가자 간 이메일 중복 (D003)
  // 신청자 이메일 vs 참가자 이메일 중복 (D003)
});

// _shared/schema/index.ts
export const enrollmentSchema = z.discriminatedUnion("type", [
  personalEnrollmentSchema,
  groupEnrollmentSchema,
]);
export type EnrollmentForm = z.infer<typeof enrollmentSchema>;
```

### 스텝별 부분 스키마 (D011)

```ts
// _shared/schema/step.ts
export const STEP_FIELDS = {
  step1: ["type", "courseId"],
  step2: ["applicant", "group"],
  step3: ["agreedToTerms"],
} as const;
```

스텝 전환 시 `trigger(STEP_FIELDS[step])`로 부분 검증.

### API 타입 — 명세 그대로

```ts
// _shared/api/types.ts
export type EnrollmentRequest = PersonalEnrollment | GroupEnrollment;

export interface EnrollmentResponse {
  enrollmentId: string;
  status: "confirmed" | "pending";
  enrolledAt: string;
}

export interface ErrorResponse {
  code: "COURSE_FULL" | "DUPLICATE_ENROLLMENT" | "INVALID_INPUT";
  message: string;
  details?: Record<string, string>;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: "development" | "design" | "marketing" | "business";
  price: number;
  maxCapacity: number;
  currentEnrollment: number;
  startDate: string;
  endDate: string;
  instructor: string;
}
```

폼 타입 = API Request 타입 → 변환 함수 불필요.

### 도메인 상수

```ts
// _shared/constants.ts
export const NAME_MIN = 2;
export const NAME_MAX = 20;
export const MOTIVATION_MAX = 300;
export const HEADCOUNT_MIN = 2;
export const HEADCOUNT_MAX = 10;
export const SEATS_LOW_THRESHOLD = 5;  // D004-a
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;  // D006-d
export const DRAFT_KEY = "livclass:enrollment-draft:v1";  // D006-a
export const CATEGORIES = ["development", "design", "marketing", "business"] as const;
```

---

## 4. 유효성 검증

### 검증 시점

| 시점 | 트리거 | 대상 | 메서드 |
|---|---|---|---|
| 필드 blur | input onBlur | 해당 필드 | RHF `mode: "onBlur"` 자동 |
| 스텝 전환 | "다음" 버튼 / 인디케이터 점프 | 현재 스텝 필드 | `trigger(STEP_FIELDS[step])` |
| 제출 | 3단계 "제출" | 전체 스키마 | `handleSubmit` |
| 서버 응답 | mutation 에러 | INVALID_INPUT.details | `setError(path, ...)` |

### RHF 설정

```ts
useForm<EnrollmentForm>({
  resolver: zodResolver(enrollmentSchema),
  mode: "onBlur",
  reValidateMode: "onChange",
  defaultValues: DEFAULT_VALUES,
})
```

`reValidateMode: "onChange"`: 한 번 에러 표시된 필드는 사용자가 수정하면 즉시 사라짐 → "에러가 잠긴" 느낌 회피.

### 에러 표시 (평가 기준 1번 「에러 표시」)

- 에러 메시지: `<span role="alert" aria-live="polite">{errors.path?.message}</span>`
- 첫 에러 필드로 포커스 + `scrollIntoView({ behavior: "smooth", block: "center" })`
- RHF `setFocus(firstErrorPath)` 또는 자체 path 추출 + DOM focus

### 클라이언트 vs 서버 검증 분리 (D004-c, 면접 질문 4번)

| 책임 | 클라이언트 | 서버 (mock) |
|---|---|---|
| 형식 (이메일, 전화) | ✅ 즉시 피드백 | ✅ 재검증 |
| 길이/범위 | ✅ | ✅ |
| 참가자 이메일 중복 | ✅ blur | ✅ 최종 |
| 정원 (잔여석) | ✅ 1단계 카드 + 2단계 headCount | ✅ 동시성 권위 |
| 중복 신청 (courseId+email) | ❌ | ✅ 유일 |

---

## 5. 상태 관리 (D011)

### 4종 상태 분리

| 종류 | 도구 | 위치 |
|---|---|---|
| 폼 입력값 | RHF | `(enroll)/layout.tsx`의 FormProvider |
| 서버 데이터 | TanStack Query | 루트 QueryClientProvider |
| UI 상태 | local useState | 컴포넌트 내부 |
| 영속 상태 | localStorage 래퍼 | `lib/storage/enrollmentDraft` |

### TanStack Query 설정

```ts
{
  queries: { retry: 1, staleTime: 60_000, refetchOnWindowFocus: false },
  mutations: { retry: 0 },
}
```

`retry: 0` for mutations (D005-d) — POST 멱등성 위험.

### 개인↔단체 전환 처리 (D001)

```ts
function switchToPersonal() {
  const groupHasInput = !isGroupEmpty(getValues("group"));
  if (groupHasInput) {
    openConfirmModal(() => {
      setValue("type", "personal");
      unregister("group");
    });
  } else {
    setValue("type", "personal");
    unregister("group");
  }
}
```

`unregister`로 폼 상태에서 group 필드 제거 → discriminated union 정합성 유지 → 제출 페이로드에 포함되지 않음.

### headCount ↔ participants 동기화 (D008-b)

`useFieldArray({ name: "group.participants" })` 사용. headCount stepper 변경 시 `append`/`remove`. 감소 시 마지막 N개에 입력값 있으면 모달.

### localStorage 동기화 (D006)

```
[입력] → RHF watch() → debounce 500ms → enrollmentDraft.save(...)

[첫 진입] → enrollmentDraft.load() → TTL/courseId 검사 → 모달 → 사용자 선택
```

폐기 시점:
- 제출 성공 시 즉시 클리어
- 복원 모달 "폐기" 선택
- courseId 변경 시 자동 폐기
- TTL 24시간 초과 시 자동 폐기

저장 범위: 모든 입력 필드 저장. **단 `agreedToTerms`는 저장 제외** — 약관 동의는 제출 직전 의도적으로 받는 행위이므로 복원 시 자동 체크되면 안 됨. README에 운영 환경 한계 명시 (D006-e).

### 이탈 방지 (D013)

`isDirty && !mutation.isSuccess`일 때만 `beforeunload` 활성화.

### 스텝 가드

```
미완료 미래 스텝 접근 → router.replace(첫 미완료 스텝)
이전 스텝 접근 → 통과 (입력값 유지, 명세 요구사항)
```

---

## 6. 에러 처리 (D005)

### 비즈니스 에러 처리

| 코드 | UX |
|---|---|
| `COURSE_FULL` | 모달 + "강의 선택으로" 버튼 / "닫기" |
| `DUPLICATE_ENROLLMENT` | 모달 안내 + "확인" 닫기 (재시도 차단) |
| `INVALID_INPUT` | `details`를 `setError`로 매핑 → 첫 에러 스텝으로 자동 이동 + 포커스 |

### 네트워크 에러 처리

- GET (강의 목록): TanStack Query `retry: 1`
- POST (제출): `retry: 0`, 실패 시 토스트 + 수동 재시도
- 입력값 항상 유지

### 빈/로딩 상태 (평가 기준 3번)

- 강의 목록 로딩: 스켈레톤 카드
- 강의 목록 빈 상태: "선택한 카테고리에 강의가 없습니다" + 다른 카테고리 안내
- 강의 목록 에러: "불러오기 실패" + 재시도 버튼
- 제출 중: 버튼 disabled + 스피너

---

## 7. UX 디테일

### 정원 UX (D004)

- 잔여 5석 이하: "마감임박" 빨간 배지
- 잔여 0: 회색 + "마감" 배지 + 클릭 차단
- 단체 인원수 > 잔여석: 1단계에서 차단 또는 경고 (단체 모드일 때 잔여석 부족 강의는 disabled 또는 안내)

### 스텝 인디케이터 (D007)

- 모양: 숫자 + 라벨 + 라인 (`① 강의 선택 ─ ② 정보 입력 ─ ③ 확인`)
- 클릭 점프: 이전 완료 스텝만 가능, 미래 스텝 잠금
- 잠금 스텝 hover/click 시 "이전 단계 완료 후 이용 가능" 툴팁
- 시각: 완료(체크+초록), 현재(파랑+굵게), 미래(회색)
- 접근성: `<nav>` + `<ol>` + `aria-current="step"` + `<button disabled>`

### 참가자 명단 UX (D008)

- headCount: stepper UI (`-` / 숫자 / `+`)
- 시각: 테이블 형태 (이름 | 이메일 | 삭제)
- 키보드 네비: Tab으로 다음 input, Enter로 다음 행 진입
- 일괄 입력 모달: CSV/탭 구분 파싱, 미리보기 후 적용, 10개 초과 시 처음 10개만 적용
- 중복 이메일 행 강조 (D003 연동)

### 접근성

- 모든 input에 label 연결 (`htmlFor` + `id`)
- 에러 메시지 `aria-describedby` + `role="alert"`
- 스텝 인디케이터 `aria-current="step"`
- 키보드만으로 전체 플로우 완주 가능

---

## 8. Mock API (D010)

### 구성

```
src/lib/mocks/
  handlers.ts        # GET /api/courses, POST /api/enrollments
  browser.ts         # dev에서 worker.start()
  server.ts          # Vitest setup에서 server.listen()
  data/
    courses.ts       # 다양한 잔여석 케이스 포함 mock 강의
    enrollments.ts   # Map/Set 메모리 저장소
```

### 에러 시나리오 트리거 전략

- 일부 mock 강의는 `currentEnrollment === maxCapacity` → `COURSE_FULL` 강제
- 사전 등록 이메일 화이트리스트 → `DUPLICATE_ENROLLMENT` 강제
- 서버 측 추가 검증 (예: 특정 motivation 키워드 차단) → `INVALID_INPUT` 강제

### 환경별 활성화

- 개발: `NODE_ENV === "development"`일 때 dynamic import + worker.start()
- 테스트: `vitest.setup.ts`에서 server.listen / resetHandlers / close
- 프로덕션 빌드: 트리쉐이킹

---

## 9. 컴포넌트 책임 (D015)

| 레이어 | 역할 | 의존 | 예시 |
|---|---|---|---|
| page.tsx | 라우팅 진입, 컴포지션 | hooks, _components | `applicant/page.tsx` |
| 컨테이너 | hook 호출, 데이터 가공, mutation 트리거 | hooks, 표현 컴포넌트 | `Step2Applicant` |
| 표현 | props만 받아 렌더, 로컬 UI 상태만 | UI 원자 | `CourseCard`, `PersonalFields` |
| UI 원자 | 도메인 무관 빌딩블록 | 없음 | `Button`, `Modal`, `Stepper` |

규칙:
- 표현 컴포넌트는 fetch/mutation 직접 호출 금지
- schema import는 hooks/컨테이너만
- TanStack Query hook은 컨테이너 한 곳에서만

---

## 10. 테스트 전략 (D014)

### 의무 커버 (필수 작성)

- **모든 zod 스키마** — 경계값 + 조건부 + 중복 검증 (`schema/*.test.ts`)
- **D001** 단체↔개인 전환 → 컴포넌트 테스트
- **D003** 이메일 중복 → 스키마 + 컴포넌트
- **D005** 4가지 에러 시나리오 → MSW 통합 테스트
- **D006** localStorage → storage 래퍼 단위 테스트
- **D007** 스텝 점프 정책 → useStepNavigation 훅 테스트
- **D008** 참가자 입력 UX, BulkPaste 파싱 → 컴포넌트 테스트

### 통합 테스트 시나리오 (`submission.integration.test.tsx`)

1. 성공: 1→2→3→제출→success
2. `COURSE_FULL`: 모달 표시 + 1단계 이동 옵션
3. `DUPLICATE_ENROLLMENT`: 모달 안내 + 닫기만
4. `INVALID_INPUT`: 해당 스텝 자동 이동 + 첫 에러 필드 포커스
5. 네트워크 에러: 토스트 + 입력값 유지
6. 제출 버튼 연타 방지 검증

### 셋업

```ts
// vitest.setup.ts
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => { server.resetHandlers(); cleanup(); localStorage.clear(); });
afterAll(() => server.close());
```

---

## 11. 미구현 / 제약사항

- **모바일 전용 레이아웃 분기 없음** — Tailwind 기본 반응형으로 대응
- **localStorage에 모든 필드 저장** — 운영 환경에선 민감 정보(전화/이메일) 마스킹 또는 서버 임시 저장 API 필요
- **E2E 테스트 미도입** — 과제 범위 외, MSW 통합 테스트로 대체
- **시각적 회귀 테스트 미도입** — 스토리북/Chromatic 도입 비용 대비 평가 가산 약함
- **인증/인가/결제 미구현** — 명세 명시
- **백엔드 미구현** — MSW로 대체. 진짜 백엔드 교체 시 `worker.start()` 호출 부분만 끄면 됨

---

## 12. 결정 추적성

각 설계 항목은 `docs/decisions.md`의 결정과 1:1 매핑된다. 면접/README 작성 시 다음 매핑을 참조:

| 영역 | 결정 ID |
|---|---|
| 개인↔단체 전환 정책 | D001 |
| 신청자/참가자 역할 해석 | D002 |
| 이메일 중복 검증 | D003 |
| 정원 UX | D004 |
| 에러 시나리오 복구 | D005 |
| 임시 저장 정책 | D006 |
| 스텝 인디케이터 동작 | D007 |
| 참가자 입력 UX | D008 |
| 폴더 구조 | D009 |
| Mock API 방식 | D010 |
| 상태 레이어 분리 | D011 |
| FormProvider 위치 | D012 |
| 이탈 방지 활성화 조건 | D013 |
| 테스트 전략 | D014 |
| 컴포넌트 4 레이어 | D015 |

---

## 13. 면접 연계 답변 매핑

| 면접 질문 | 답변 거리 | 출처 |
|---|---|---|
| 1. 폼 상태 관리 방식 + trade-off | 단일 RHF + FormProvider, B/C 대안 비교 | D011 |
| 2. 참가자 10명 입력 UX 개선 | 키보드 네비 + 일괄 붙여넣기 | D008-c |
| 3. 제출 실패 시 UX, 네트워크 vs 비즈니스 에러 | 에러 코드별 분기 + 메서드별 재시도 정책 | D005 |
| 4. 클라이언트/서버 검증 양쪽 이유 | UX 즉시성 + 동시성 권위, 책임 분리 | D004-c |
| 5. 5단계로 확장된다면 | 라우트 추가 + 가드 룰 + UI 원자 재사용 | D015 |
